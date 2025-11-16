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

        // Evaluation criteria
        const benchmarks = agent.performance_benchmarks || {};
        const avgScore = Object.values(benchmarks).reduce((sum, val) => sum + val, 0) / Object.keys(benchmarks).length;

        const evaluation = {
            ready_for_deployment: false,
            recommendation: 'hold',
            overall_score: avgScore,
            checks: []
        };

        // Check 1: Minimum accuracy threshold
        if (benchmarks.accuracy >= 90) {
            evaluation.checks.push({ name: 'Accuracy', passed: true, score: benchmarks.accuracy });
        } else {
            evaluation.checks.push({ name: 'Accuracy', passed: false, score: benchmarks.accuracy, threshold: 90 });
        }

        // Check 2: F1 Score
        if (benchmarks.f1_score >= 85) {
            evaluation.checks.push({ name: 'F1 Score', passed: true, score: benchmarks.f1_score });
        } else {
            evaluation.checks.push({ name: 'F1 Score', passed: false, score: benchmarks.f1_score, threshold: 85 });
        }

        // Check 3: Precision/Recall balance
        if (benchmarks.precision >= 85 && benchmarks.recall >= 85) {
            evaluation.checks.push({ name: 'Precision/Recall', passed: true });
        } else {
            evaluation.checks.push({ name: 'Precision/Recall', passed: false });
        }

        // Overall decision
        const allPassed = evaluation.checks.every(c => c.passed);
        if (allPassed && avgScore >= 90) {
            evaluation.ready_for_deployment = true;
            evaluation.recommendation = 'deploy';
            evaluation.message = 'Model meets all quality thresholds. Ready for deployment.';
        } else if (avgScore >= 85) {
            evaluation.recommendation = 'ab_test';
            evaluation.message = 'Model shows promise. Consider A/B testing before full deployment.';
        } else {
            evaluation.recommendation = 'hold';
            evaluation.message = 'Model needs improvement before deployment.';
        }

        return Response.json({
            success: true,
            evaluation
        });

    } catch (error) {
        console.error('Agent evaluation error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});