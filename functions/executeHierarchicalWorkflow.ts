import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { workflow_id, inputs = {} } = await req.json();

        // Load workflow
        const workflow = await base44.asServiceRole.entities.AgentWorkflow.filter({ id: workflow_id });
        if (!workflow || workflow.length === 0) {
            return Response.json({ error: 'Workflow not found' }, { status: 404 });
        }

        const workflowConfig = workflow[0];

        // Create execution record
        const execution = await base44.asServiceRole.entities.WorkflowExecution.create({
            workflow_id: workflow_id,
            workflow_name: workflowConfig.name,
            status: 'running',
            inputs: inputs,
            started_at: new Date().toISOString(),
            agent_states: {},
            logs: [{
                timestamp: new Date().toISOString(),
                level: 'info',
                message: `Starting hierarchical workflow: ${workflowConfig.name}`
            }]
        });

        // Execute with hierarchical agent system
        const result = await executeHierarchicalAgents(
            base44,
            workflowConfig.hierarchical_config,
            inputs,
            execution.id
        );

        // Update execution record
        await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
            status: result.success ? 'completed' : 'failed',
            outputs: result.outputs,
            completed_at: new Date().toISOString(),
            duration_seconds: (Date.now() - new Date(execution.started_at).getTime()) / 1000,
            agent_states: result.agent_states,
            error_message: result.error,
            logs: [...execution.logs, ...result.logs]
        });

        // Update workflow stats
        await base44.asServiceRole.entities.AgentWorkflow.update(workflow_id, {
            execution_count: (workflowConfig.execution_count || 0) + 1,
            success_rate: result.success 
                ? ((workflowConfig.success_rate || 0) * (workflowConfig.execution_count || 0) + 100) / ((workflowConfig.execution_count || 0) + 1)
                : ((workflowConfig.success_rate || 0) * (workflowConfig.execution_count || 0)) / ((workflowConfig.execution_count || 0) + 1)
        });

        return Response.json({
            success: true,
            execution_id: execution.id,
            outputs: result.outputs,
            agent_states: result.agent_states
        });

    } catch (error) {
        console.error('Hierarchical workflow execution error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

async function executeHierarchicalAgents(base44, config, inputs, executionId) {
    const logs = [];
    const agentStates = {};
    
    try {
        if (!config?.agents || config.agents.length === 0) {
            throw new Error('No agents configured in hierarchy');
        }

        // Execute root agents
        const rootAgents = config.agents;
        let currentInputs = inputs;

        for (const agent of rootAgents) {
            const result = await executeAgent(
                base44,
                agent,
                currentInputs,
                agentStates,
                logs,
                executionId
            );

            if (!result.success) {
                return { success: false, error: result.error, logs, agent_states: agentStates };
            }

            // Pass outputs to next agent
            currentInputs = { ...currentInputs, ...result.outputs };
        }

        return {
            success: true,
            outputs: currentInputs,
            logs,
            agent_states: agentStates
        };

    } catch (error) {
        logs.push({
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `Workflow error: ${error.message}`
        });

        return {
            success: false,
            error: error.message,
            logs,
            agent_states: agentStates
        };
    }
}

async function executeAgent(base44, agent, inputs, agentStates, logs, executionId) {
    const startTime = Date.now();
    
    // Initialize agent state
    agentStates[agent.id] = {
        status: 'running',
        invocation_count: (agentStates[agent.id]?.invocation_count || 0) + 1,
        inputs: inputs
    };

    logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Executing agent: ${agent.name} (${agent.role})`
    });

    try {
        let outputs;

        // Execute based on agent role
        switch (agent.role) {
            case 'root':
                outputs = await executeRootAgent(base44, agent, inputs, agentStates, logs, executionId);
                break;
            case 'conversational':
                outputs = await executeConversationalAgent(base44, agent, inputs);
                break;
            case 'workflow':
                outputs = await executeWorkflowAgent(base44, agent, inputs, agentStates, logs, executionId);
                break;
            case 'tool':
                outputs = await executeToolAgent(base44, agent, inputs);
                break;
            case 'validator':
                outputs = await executeValidatorAgent(base44, agent, inputs);
                break;
            default:
                outputs = await executeGenericAgent(base44, agent, inputs);
        }

        const duration = Date.now() - startTime;

        // Update agent state
        agentStates[agent.id] = {
            ...agentStates[agent.id],
            status: 'completed',
            outputs: outputs,
            duration_ms: duration,
            state_size: JSON.stringify(outputs).length / 1024
        };

        logs.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Agent ${agent.name} completed in ${duration}ms`
        });

        return { success: true, outputs };

    } catch (error) {
        agentStates[agent.id].status = 'failed';
        agentStates[agent.id].error = error.message;

        logs.push({
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `Agent ${agent.name} failed: ${error.message}`
        });

        return { success: false, error: error.message };
    }
}

async function executeRootAgent(base44, agent, inputs, agentStates, logs, executionId) {
    // Root agent delegates to sub-agents
    let currentInputs = inputs;

    if (agent.sub_agents && agent.sub_agents.length > 0) {
        for (const subAgent of agent.sub_agents) {
            const result = await executeAgent(
                base44,
                subAgent,
                currentInputs,
                agentStates,
                logs,
                executionId
            );

            if (!result.success) {
                throw new Error(`Sub-agent ${subAgent.name} failed: ${result.error}`);
            }

            currentInputs = { ...currentInputs, ...result.outputs };
        }
    }

    return currentInputs;
}

async function executeConversationalAgent(base44, agent, inputs) {
    const prompt = `${agent.system_prompt || 'You are a helpful assistant.'}

User input: ${JSON.stringify(inputs)}

Provide a conversational response.`;

    const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
    });

    return { conversation_response: response };
}

async function executeWorkflowAgent(base44, agent, inputs, agentStates, logs, executionId) {
    // Execute sub-agents in sequence or parallel
    if (!agent.sub_agents || agent.sub_agents.length === 0) {
        return inputs;
    }

    let results = inputs;

    // Execute sub-agents
    for (const subAgent of agent.sub_agents) {
        const result = await executeAgent(
            base44,
            subAgent,
            results,
            agentStates,
            logs,
            executionId
        );

        if (!result.success) {
            throw new Error(`Workflow step ${subAgent.name} failed`);
        }

        results = { ...results, ...result.outputs };
    }

    return results;
}

async function executeToolAgent(base44, agent, inputs) {
    // Agent-as-a-Tool pattern: completely isolated execution
    const isolatedInputs = agent.isolation_mode === 'isolated' 
        ? JSON.parse(JSON.stringify(inputs)) 
        : inputs;

    const prompt = `${agent.system_prompt || 'Execute the following task.'}

Input: ${JSON.stringify(isolatedInputs)}

Provide structured output.`;

    const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
            type: "object",
            properties: {
                result: { type: "string" },
                confidence: { type: "number" },
                data: { type: "object" }
            }
        }
    });

    return response;
}

async function executeValidatorAgent(base44, agent, inputs) {
    const prompt = `${agent.system_prompt || 'Validate the following data.'}

Data to validate: ${JSON.stringify(inputs)}

Check for:
1. Completeness
2. Correctness
3. Quality

Provide validation results.`;

    const validation = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
            type: "object",
            properties: {
                is_valid: { type: "boolean" },
                issues: { type: "array", items: { type: "string" } },
                confidence: { type: "number" }
            }
        }
    });

    return { validation, validated_data: inputs };
}

async function executeGenericAgent(base44, agent, inputs) {
    const prompt = `${agent.system_prompt || 'Process the following input.'}

Input: ${JSON.stringify(inputs)}`;

    const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
    });

    return { result: response };
}