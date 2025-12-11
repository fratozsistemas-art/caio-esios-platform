import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch recent data for anomaly detection
    const [strategies, conversations, analyses] = await Promise.all([
      base44.entities.Strategy.list('-created_date', 50),
      base44.agents.listConversations({ agent_name: 'caio_agent' }),
      base44.entities.Analysis.list('-created_date', 50)
    ]);

    const anomalies = [];

    // Detect sudden drops in activity
    const recentConversations = conversations.slice(0, 7).length;
    const previousConversations = conversations.slice(7, 14).length;
    if (recentConversations < previousConversations * 0.5) {
      anomalies.push({
        type: 'Activity Drop',
        severity: 'high',
        description: `Conversation activity dropped by ${Math.round((1 - recentConversations / previousConversations) * 100)}% compared to previous week`,
        recommendation: 'Check user engagement and system health',
        metric: 'conversations',
        value: recentConversations
      });
    }

    // Detect stalled strategies
    const inProgressStrategies = strategies.filter(s => s.status === 'analyzing' || s.status === 'draft');
    const oldStalled = inProgressStrategies.filter(s => {
      const daysSinceUpdate = (new Date() - new Date(s.updated_date)) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 7;
    });

    if (oldStalled.length > 0) {
      anomalies.push({
        type: 'Stalled Strategies',
        severity: 'medium',
        description: `${oldStalled.length} strategies have been in progress for over 7 days without completion`,
        recommendation: 'Review and prioritize these strategies or mark as completed',
        metric: 'strategies',
        value: oldStalled.length
      });
    }

    // Detect low completion rates
    const completedStrategies = strategies.filter(s => s.status === 'validated' || s.status === 'implemented').length;
    const completionRate = strategies.length > 0 ? (completedStrategies / strategies.length) * 100 : 0;
    if (completionRate < 40 && strategies.length > 10) {
      anomalies.push({
        type: 'Low Completion Rate',
        severity: 'medium',
        description: `Only ${completionRate.toFixed(1)}% of strategies are completed`,
        recommendation: 'Focus on execution and completing ongoing initiatives',
        metric: 'completion_rate',
        value: completionRate
      });
    }

    // Detect unusual analysis patterns
    const failedAnalyses = analyses.filter(a => a.status === 'failed' || a.confidence_score < 50);
    if (failedAnalyses.length > analyses.length * 0.3) {
      anomalies.push({
        type: 'Analysis Quality Issues',
        severity: 'high',
        description: `${failedAnalyses.length} analyses have low confidence scores or failed`,
        recommendation: 'Review data quality and analysis parameters',
        metric: 'analysis_quality',
        value: failedAnalyses.length
      });
    }

    return Response.json(anomalies);

  } catch (error) {
    console.error('Error detecting anomalies:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});