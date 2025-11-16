import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Message Bus for inter-agent communication
class AgentMessageBus {
    constructor() {
        this.messages = [];
        this.subscribers = new Map();
    }

    sendMessage(fromAgentId, message) {
        const messageWithMeta = {
            id: `msg_${Date.now()}_${Math.random()}`,
            from: fromAgentId,
            to: message.to || 'broadcast',
            type: message.type,
            payload: message.payload,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        this.messages.push(messageWithMeta);

        // Notify subscribers
        if (message.to && this.subscribers.has(message.to)) {
            this.subscribers.get(message.to).push(messageWithMeta);
        } else if (message.to === 'broadcast') {
            // Broadcast to all subscribers
            for (const [agentId, queue] of this.subscribers) {
                if (agentId !== fromAgentId) {
                    queue.push(messageWithMeta);
                }
            }
        }

        return messageWithMeta.id;
    }

    subscribe(agentId) {
        if (!this.subscribers.has(agentId)) {
            this.subscribers.set(agentId, []);
        }
        return this.subscribers.get(agentId);
    }

    getMessages(agentId, messageType = null) {
        const queue = this.subscribers.get(agentId) || [];
        if (messageType) {
            return queue.filter(m => m.type === messageType);
        }
        return queue;
    }

    markAsProcessed(messageId) {
        const msg = this.messages.find(m => m.id === messageId);
        if (msg) msg.status = 'processed';
    }

    getHistory() {
        return this.messages;
    }
}

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
            logs: [...execution.logs, ...result.logs],
            communication_log: result.communication_log
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
            agent_states: result.agent_states,
            communication_log: result.communication_log
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
    const messageBus = new AgentMessageBus();
    
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
                executionId,
                messageBus
            );

            if (!result.success) {
                return { 
                    success: false, 
                    error: result.error, 
                    logs, 
                    agent_states: agentStates,
                    communication_log: messageBus.getHistory()
                };
            }

            // Pass outputs to next agent
            currentInputs = { ...currentInputs, ...result.outputs };
        }

        return {
            success: true,
            outputs: currentInputs,
            logs,
            agent_states: agentStates,
            communication_log: messageBus.getHistory()
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
            agent_states: agentStates,
            communication_log: messageBus.getHistory()
        };
    }
}

async function executeAgent(base44, agent, inputs, agentStates, logs, executionId, messageBus) {
    const startTime = Date.now();
    
    // Subscribe to message bus
    messageBus.subscribe(agent.id);
    
    // Initialize agent state
    agentStates[agent.id] = {
        status: 'running',
        invocation_count: (agentStates[agent.id]?.invocation_count || 0) + 1,
        inputs: inputs,
        llm_parameters: agent.llm_parameters || {},
        messages_sent: 0,
        messages_received: 0
    };

    // Broadcast status if enabled
    if (agent.communication_config?.broadcast_status) {
        messageBus.sendMessage(agent.id, {
            type: 'status_update',
            to: 'broadcast',
            payload: { status: 'running', agent_name: agent.name }
        });
        agentStates[agent.id].messages_sent++;
    }

    logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Executing agent: ${agent.name} (${agent.role}) with temp=${agent.llm_parameters?.temperature ?? 0.7}`
    });

    try {
        let outputs;

        // Execute based on agent role with fallback support
        outputs = await executeWithFallback(
            base44,
            agent,
            inputs,
            agentStates,
            logs,
            executionId,
            messageBus
        );

        const duration = Date.now() - startTime;

        // Update agent state
        agentStates[agent.id] = {
            ...agentStates[agent.id],
            status: 'completed',
            outputs: outputs,
            duration_ms: duration,
            state_size: JSON.stringify(outputs).length / 1024
        };

        // Broadcast completion status
        if (agent.communication_config?.broadcast_status) {
            messageBus.sendMessage(agent.id, {
                type: 'status_update',
                to: 'broadcast',
                payload: { status: 'completed', agent_name: agent.name, duration_ms: duration }
            });
            agentStates[agent.id].messages_sent++;
        }

        logs.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Agent ${agent.name} completed in ${duration}ms`
        });

        return { success: true, outputs };

    } catch (error) {
        agentStates[agent.id].status = 'failed';
        agentStates[agent.id].error = error.message;

        // Broadcast failure status
        if (agent.communication_config?.broadcast_status) {
            messageBus.sendMessage(agent.id, {
                type: 'status_update',
                to: 'broadcast',
                payload: { status: 'failed', agent_name: agent.name, error: error.message }
            });
        }

        logs.push({
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `Agent ${agent.name} failed: ${error.message}`
        });

        return { success: false, error: error.message };
    }
}

async function executeWithFallback(base44, agent, inputs, agentStates, logs, executionId, messageBus) {
    const fallbackConfig = agent.fallback_strategy || { enabled: true, max_retries: 2, strategies: ['retry'] };
    
    if (!fallbackConfig.enabled) {
        return await executeAgentCore(base44, agent, inputs, agentStates, logs, executionId, messageBus);
    }

    const maxRetries = fallbackConfig.max_retries || 2;
    const strategies = fallbackConfig.strategies || ['retry', 'simplified_prompt'];
    
    let lastError;
    let attemptCount = 0;

    // Try primary execution
    try {
        return await executeAgentCore(base44, agent, inputs, agentStates, logs, executionId, messageBus);
    } catch (error) {
        lastError = error;
        attemptCount++;
        
        logs.push({
            timestamp: new Date().toISOString(),
            level: 'warning',
            message: `Agent ${agent.name} initial execution failed, trying fallback strategies`
        });
    }

    // Execute fallback strategies
    for (const strategy of strategies) {
        if (attemptCount >= maxRetries) break;

        try {
            logs.push({
                timestamp: new Date().toISOString(),
                level: 'info',
                message: `Attempting fallback strategy: ${strategy}`
            });

            let result;

            switch (strategy) {
                case 'retry':
                    await new Promise(resolve => setTimeout(resolve, 1000 * attemptCount));
                    result = await executeAgentCore(base44, agent, inputs, agentStates, logs, executionId, messageBus);
                    break;

                case 'alternate_model':
                    const altAgent = {
                        ...agent,
                        llm_parameters: {
                            ...agent.llm_parameters,
                            temperature: 0.3
                        }
                    };
                    result = await executeAgentCore(base44, altAgent, inputs, agentStates, logs, executionId, messageBus);
                    break;

                case 'simplified_prompt':
                    const simplifiedAgent = {
                        ...agent,
                        system_prompt: `${agent.system_prompt || ''}\n\nIMPORTANT: Keep response simple and focused.`
                    };
                    result = await executeAgentCore(base44, simplifiedAgent, inputs, agentStates, logs, executionId, messageBus);
                    break;

                case 'skip_with_default':
                    logs.push({
                        timestamp: new Date().toISOString(),
                        level: 'warning',
                        message: `Using default values for agent ${agent.name}`
                    });
                    return { 
                        result: 'Skipped with default',
                        fallback_used: true,
                        original_error: lastError.message 
                    };

                case 'escalate':
                    throw new Error(`Agent ${agent.name} escalated error: ${lastError.message}`);

                case 'abort':
                    throw new Error(`Workflow aborted at agent ${agent.name}: ${lastError.message}`);

                default:
                    result = await executeAgentCore(base44, agent, inputs, agentStates, logs, executionId, messageBus);
            }

            logs.push({
                timestamp: new Date().toISOString(),
                level: 'info',
                message: `Fallback strategy '${strategy}' succeeded`
            });

            return result;

        } catch (error) {
            lastError = error;
            attemptCount++;
            
            logs.push({
                timestamp: new Date().toISOString(),
                level: 'warning',
                message: `Fallback strategy '${strategy}' failed: ${error.message}`
            });
        }
    }

    throw lastError;
}

async function executeAgentCore(base44, agent, inputs, agentStates, logs, executionId, messageBus) {
    // Check for incoming messages
    const incomingMessages = messageBus.getMessages(agent.id);
    const processedInputs = { ...inputs };

    // Process data requests
    const dataRequests = incomingMessages.filter(m => m.type === 'data_request');
    for (const request of dataRequests) {
        if (request.payload?.data_key && agentStates[agent.id]?.outputs?.[request.payload.data_key]) {
            messageBus.sendMessage(agent.id, {
                type: 'data_response',
                to: request.from,
                payload: {
                    request_id: request.id,
                    data: agentStates[agent.id].outputs[request.payload.data_key]
                }
            });
            agentStates[agent.id].messages_sent++;
        }
        messageBus.markAsProcessed(request.id);
        agentStates[agent.id].messages_received++;
    }

    // Process task delegations
    const delegations = incomingMessages.filter(m => m.type === 'task_delegation');
    for (const delegation of delegations) {
        if (delegation.payload?.task) {
            processedInputs.delegated_task = delegation.payload.task;
            processedInputs.delegated_from = delegation.from;
        }
        messageBus.markAsProcessed(delegation.id);
        agentStates[agent.id].messages_received++;
    }

    // Execute based on agent role
    let outputs;
    switch (agent.role) {
        case 'root':
            outputs = await executeRootAgent(base44, agent, processedInputs, agentStates, logs, executionId, messageBus);
            break;
        case 'conversational':
            outputs = await executeConversationalAgent(base44, agent, processedInputs, messageBus);
            break;
        case 'workflow':
            outputs = await executeWorkflowAgent(base44, agent, processedInputs, agentStates, logs, executionId, messageBus);
            break;
        case 'tool':
            outputs = await executeToolAgent(base44, agent, processedInputs, messageBus);
            break;
        case 'validator':
            outputs = await executeValidatorAgent(base44, agent, processedInputs, messageBus);
            break;
        default:
            outputs = await executeGenericAgent(base44, agent, processedInputs, messageBus);
    }

    return outputs;
}

async function executeRootAgent(base44, agent, inputs, agentStates, logs, executionId, messageBus) {
    let currentInputs = inputs;

    if (agent.sub_agents && agent.sub_agents.length > 0) {
        for (const subAgent of agent.sub_agents) {
            // Root can delegate tasks to sub-agents
            if (agent.communication_config?.can_send?.includes('task_delegation')) {
                messageBus.sendMessage(agent.id, {
                    type: 'task_delegation',
                    to: subAgent.id,
                    payload: {
                        task: `Execute ${subAgent.name}`,
                        context: currentInputs
                    }
                });
                agentStates[agent.id].messages_sent++;
            }

            const result = await executeAgent(
                base44,
                subAgent,
                currentInputs,
                agentStates,
                logs,
                executionId,
                messageBus
            );

            if (!result.success) {
                throw new Error(`Sub-agent ${subAgent.name} failed: ${result.error}`);
            }

            currentInputs = { ...currentInputs, ...result.outputs };
        }
    }

    return currentInputs;
}

async function executeConversationalAgent(base44, agent, inputs, messageBus) {
    const llmParams = agent.llm_parameters || {};
    
    // Check for peer agent context
    const peerMessages = messageBus.getMessages(agent.id, 'status_update');
    const peerContext = peerMessages.map(m => 
        `${m.payload.agent_name}: ${m.payload.status}`
    ).join('\n');
    
    const prompt = `${agent.system_prompt || 'You are a helpful assistant.'}

${peerContext ? `\nPeer Agent Status:\n${peerContext}\n` : ''}

User input: ${JSON.stringify(inputs)}

Provide a conversational response.`;

    const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
    });

    return { conversation_response: response };
}

async function executeWorkflowAgent(base44, agent, inputs, agentStates, logs, executionId, messageBus) {
    if (!agent.sub_agents || agent.sub_agents.length === 0) {
        return inputs;
    }

    let results = inputs;

    for (const subAgent of agent.sub_agents) {
        // Workflow agent can request data from other agents
        if (agent.communication_config?.can_send?.includes('data_request')) {
            // Request any available context from peer agents
            for (const [peerId, state] of Object.entries(agentStates)) {
                if (peerId !== agent.id && state.outputs) {
                    messageBus.sendMessage(agent.id, {
                        type: 'data_request',
                        to: peerId,
                        payload: { data_key: 'result' }
                    });
                    agentStates[agent.id].messages_sent++;
                }
            }
        }

        const result = await executeAgent(
            base44,
            subAgent,
            results,
            agentStates,
            logs,
            executionId,
            messageBus
        );

        if (!result.success) {
            throw new Error(`Workflow step ${subAgent.name} failed`);
        }

        results = { ...results, ...result.outputs };
    }

    return results;
}

async function executeToolAgent(base44, agent, inputs, messageBus) {
    const llmParams = agent.llm_parameters || {};
    
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

async function executeValidatorAgent(base44, agent, inputs, messageBus) {
    const llmParams = agent.llm_parameters || {};
    
    // Check for validation requests from other agents
    const validationRequests = messageBus.getMessages(agent.id, 'validation_request');
    const dataToValidate = validationRequests.length > 0 
        ? validationRequests[0].payload.data 
        : inputs;

    const prompt = `${agent.system_prompt || 'Validate the following data.'}

Data to validate: ${JSON.stringify(dataToValidate)}

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

    // Send validation results back to requester
    if (validationRequests.length > 0) {
        messageBus.sendMessage(agent.id, {
            type: 'validation_response',
            to: validationRequests[0].from,
            payload: validation
        });
        validationRequests.forEach(req => messageBus.markAsProcessed(req.id));
    }

    return { validation, validated_data: dataToValidate };
}

async function executeGenericAgent(base44, agent, inputs, messageBus) {
    const llmParams = agent.llm_parameters || {};
    
    const prompt = `${agent.system_prompt || 'Process the following input.'}

Input: ${JSON.stringify(inputs)}`;

    const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
    });

    return { result: response };
}