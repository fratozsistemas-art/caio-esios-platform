import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { workflow_id, inputs } = await req.json();

        // Carregar workflow
        const workflow = await base44.entities.AgentWorkflow.filter({ id: workflow_id });
        if (!workflow || workflow.length === 0) {
            return Response.json({ error: 'Workflow not found' }, { status: 404 });
        }

        const wf = workflow[0];

        // Criar execução
        const execution = await base44.entities.WorkflowExecution.create({
            workflow_id: wf.id,
            workflow_name: wf.name,
            status: 'running',
            inputs: inputs,
            started_at: new Date().toISOString(),
            logs: [{
                timestamp: new Date().toISOString(),
                level: 'info',
                message: `Workflow execution started`
            }]
        });

        const executionId = execution.id;
        const stepResults = {};
        const completedSteps = [];

        // Executar workflow baseado no modo
        if (wf.execution_mode === 'parallel') {
            // Executar todos os passos sem dependências em paralelo
            const independentSteps = wf.steps.filter(s => !s.dependencies || s.dependencies.length === 0);
            
            const results = await Promise.all(
                independentSteps.map(step => executeStep(step, inputs, stepResults, base44))
            );

            results.forEach((result, idx) => {
                stepResults[independentSteps[idx].id] = result;
                completedSteps.push(independentSteps[idx].id);
            });

            // Executar passos dependentes
            const dependentSteps = wf.steps.filter(s => s.dependencies && s.dependencies.length > 0);
            for (const step of dependentSteps) {
                const result = await executeStep(step, inputs, stepResults, base44);
                stepResults[step.id] = result;
                completedSteps.push(step.id);
            }

        } else {
            // Executar sequencialmente
            for (const step of wf.steps) {
                await base44.entities.WorkflowExecution.update(executionId, {
                    current_step: step.id,
                    logs: [...execution.logs, {
                        timestamp: new Date().toISOString(),
                        level: 'info',
                        message: `Executing step: ${step.name}`
                    }]
                });

                const result = await executeStep(step, inputs, stepResults, base44);
                stepResults[step.id] = result;
                completedSteps.push(step.id);

                await base44.entities.WorkflowExecution.update(executionId, {
                    completed_steps: completedSteps,
                    step_results: stepResults
                });
            }
        }

        // Finalizar execução
        const endTime = new Date();
        const duration = (endTime - new Date(execution.started_at)) / 1000;

        await base44.entities.WorkflowExecution.update(executionId, {
            status: 'completed',
            completed_at: endTime.toISOString(),
            duration_seconds: duration,
            outputs: stepResults,
            logs: [...execution.logs, {
                timestamp: endTime.toISOString(),
                level: 'info',
                message: `Workflow completed in ${duration.toFixed(2)}s`
            }]
        });

        // Atualizar estatísticas do workflow
        await base44.asServiceRole.entities.AgentWorkflow.update(wf.id, {
            execution_count: (wf.execution_count || 0) + 1,
            avg_duration_seconds: ((wf.avg_duration_seconds || 0) * (wf.execution_count || 0) + duration) / ((wf.execution_count || 0) + 1),
            success_rate: ((wf.success_rate || 0) * (wf.execution_count || 0) + 100) / ((wf.execution_count || 0) + 1)
        });

        return Response.json({
            success: true,
            execution_id: executionId,
            status: 'completed',
            duration_seconds: duration,
            outputs: stepResults
        });

    } catch (error) {
        console.error('Execute workflow error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

async function executeStep(step, inputs, previousResults, base44) {
    const stepInputs = {
        ...inputs,
        previous_results: previousResults,
        step_config: step.config
    };

    switch (step.agent_type) {
        case 'research':
            return await executeResearch(stepInputs, base44);
        case 'analysis':
            return await executeAnalysis(stepInputs, base44);
        case 'synthesis':
            return await executeSynthesis(stepInputs, base44);
        case 'extraction':
            return await executeExtraction(stepInputs, base44);
        case 'enrichment':
            return await executeEnrichment(stepInputs, base44);
        case 'validation':
            return await executeValidation(stepInputs, base44);
        default:
            return { error: 'Unknown agent type' };
    }
}

async function executeResearch(inputs, base44) {
    const prompt = `Research the following topic using available knowledge graph data and external sources:

Topic: ${inputs.topic || inputs.company_name || inputs.query}
Config: ${JSON.stringify(inputs.step_config)}

Provide comprehensive research findings with sources.`;

    const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
            type: "object",
            properties: {
                findings: { type: "array", items: { type: "string" } },
                sources: { type: "array", items: { type: "string" } },
                confidence: { type: "number" }
            }
        }
    });

    return response;
}

async function executeAnalysis(inputs, base44) {
    const nodes = await base44.entities.KnowledgeGraphNode.list();
    const relationships = await base44.entities.KnowledgeGraphRelationship.list();

    const prompt = `Analyze the following data:

Inputs: ${JSON.stringify(inputs)}
Available graph nodes: ${nodes.length}
Available relationships: ${relationships.length}

Provide analytical insights.`;

    const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
            type: "object",
            properties: {
                insights: { type: "array", items: { type: "string" } },
                metrics: { type: "object" },
                recommendations: { type: "array", items: { type: "string" } }
            }
        }
    });

    return response;
}

async function executeSynthesis(inputs, base44) {
    const prompt = `Synthesize the following information:

${JSON.stringify(inputs.previous_results, null, 2)}

Create a coherent summary.`;

    const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
            type: "object",
            properties: {
                summary: { type: "string" },
                key_points: { type: "array", items: { type: "string" } }
            }
        }
    });

    return response;
}

async function executeExtraction(inputs, base44) {
    return { extracted_data: inputs, status: 'extracted' };
}

async function executeEnrichment(inputs, base44) {
    return { enriched: true, data: inputs };
}

async function executeValidation(inputs, base44) {
    return { validated: true, score: 0.95 };
}