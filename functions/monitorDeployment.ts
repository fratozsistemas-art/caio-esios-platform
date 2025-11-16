import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fine_tuned_agent_id } = await req.json();

        const agents = await base44.asServiceRole.entities.FineTunedAgent.filter({ id: fine_tuned_agent_id });
        if (!agents || agents.length === 0) {
            return Response.json({ error: 'Agent not found' }, { status: 404 });
        }

        const agent = agents[0];

        // Get deployment metrics (simulated for demo)
        const deploymentMetrics = {
            requests_served: Math.floor(Math.random() * 10000) + 1000,
            success_rate: Math.random() * 15 + 85, // 85-100%
            avg_latency_ms: Math.random() * 200 + 100,
            error_rate: Math.random() * 5, // 0-5%
            user_satisfaction: Math.random() * 20 + 80 // 80-100%
        };

        // Performance degradation detection
        const degradationThresholds = {
            success_rate: 90,
            error_rate: 3,
            user_satisfaction: 85
        };

        const issues = [];
        let shouldRollback = false;

        if (deploymentMetrics.success_rate < degradationThresholds.success_rate) {
            issues.push({
                severity: 'critical',
                metric: 'success_rate',
                current: deploymentMetrics.success_rate,
                threshold: degradationThresholds.success_rate
            });
            shouldRollback = true;
        }

        if (deploymentMetrics.error_rate > degradationThresholds.error_rate) {
            issues.push({
                severity: 'high',
                metric: 'error_rate',
                current: deploymentMetrics.error_rate,
                threshold: degradationThresholds.error_rate
            });
            shouldRollback = true;
        }

        if (deploymentMetrics.user_satisfaction < degradationThresholds.user_satisfaction) {
            issues.push({
                severity: 'medium',
                metric: 'user_satisfaction',
                current: deploymentMetrics.user_satisfaction,
                threshold: degradationThresholds.user_satisfaction
            });
        }

        // Auto-rollback if critical issues
        if (shouldRollback && agent.is_active) {
            await base44.asServiceRole.entities.FineTunedAgent.update(fine_tuned_agent_id, {
                is_active: false,
                status: 'completed',
                deployment_config: {
                    ...agent.deployment_config,
                    rolled_back_at: new Date().toISOString(),
                    rollback_reason: issues.map(i => `${i.metric}: ${i.current.toFixed(2)} < ${i.threshold}`).join(', ')
                }
            });

            // Reactivate previous version if exists
            if (agent.deployment_config?.replaced_model_id) {
                await base44.asServiceRole.entities.FineTunedAgent.update(agent.deployment_config.replaced_model_id, {
                    is_active: true,
                    status: 'deployed'
                });
            }
        }

        return Response.json({
            success: true,
            metrics: deploymentMetrics,
            issues,
            rolled_back: shouldRollback,
            recommendation: shouldRollback ? 'Agent rolled back due to performance degradation' : 'Performance within acceptable range'
        });

    } catch (error) {
        console.error('Deployment monitoring error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});