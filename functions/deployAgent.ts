import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fine_tuned_agent_id, deployment_mode = 'full', traffic_percentage = 100 } = await req.json();

        const agents = await base44.asServiceRole.entities.FineTunedAgent.filter({ id: fine_tuned_agent_id });
        if (!agents || agents.length === 0) {
            return Response.json({ error: 'Agent not found' }, { status: 404 });
        }

        const agent = agents[0];

        // If deploying as primary, deactivate other agents of same type
        if (deployment_mode === 'full') {
            const activeAgents = await base44.asServiceRole.entities.FineTunedAgent.filter({
                base_agent_type: agent.base_agent_type,
                is_active: true
            });

            for (const activeAgent of activeAgents) {
                await base44.asServiceRole.entities.FineTunedAgent.update(activeAgent.id, {
                    is_active: false,
                    deployment_config: {
                        ...activeAgent.deployment_config,
                        deactivated_at: new Date().toISOString(),
                        replaced_by: fine_tuned_agent_id
                    }
                });
            }
        }

        // Deploy the new agent
        await base44.asServiceRole.entities.FineTunedAgent.update(fine_tuned_agent_id, {
            is_active: true,
            status: 'deployed',
            deployment_config: {
                mode: deployment_mode,
                traffic_percentage: traffic_percentage,
                deployed_at: new Date().toISOString(),
                deployed_by: user.email
            }
        });

        return Response.json({
            success: true,
            message: `Agent deployed in ${deployment_mode} mode with ${traffic_percentage}% traffic`,
            agent_id: fine_tuned_agent_id
        });

    } catch (error) {
        console.error('Agent deployment error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});