import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather user activity data
    const conversations = await base44.agents.listConversations({
      agent_name: "caio_agent"
    });
    const userConversations = conversations.filter(c => 
      c.created_by === user.email && !c.metadata?.deleted
    );

    const graphNodes = await base44.entities.KnowledgeGraphNode.list();
    const graphRels = await base44.entities.KnowledgeGraphRelationship.list();
    const strategies = await base44.entities.Strategy.list();

    // Calculate activity patterns
    const recentConvos = userConversations.filter(c => {
      const created = new Date(c.created_at);
      const daysSince = (Date.now() - created) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });

    const recentNodes = graphNodes.filter(n => {
      const created = new Date(n.created_date);
      const daysSince = (Date.now() - created) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });

    // Build context for AI analysis
    const monitoringContext = {
      user_activity: {
        total_conversations: userConversations.length,
        recent_conversations: recentConvos.length,
        conversation_frequency: recentConvos.length / 7,
        active_strategies: strategies.filter(s => s.status === 'validated' || s.status === 'analyzing').length
      },
      graph_dynamics: {
        total_nodes: graphNodes.length,
        total_relationships: graphRels.length,
        recent_additions: recentNodes.length,
        growth_rate: (recentNodes.length / graphNodes.length) * 100
      },
      strategic_focus: {
        frameworks_used: [...new Set(strategies.map(s => s.category))],
        industries_mentioned: [...new Set(graphNodes.filter(n => n.node_type === 'industry').map(n => n.label))]
      }
    };

    // AI-powered proactive analysis
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a proactive strategic intelligence agent monitoring user activity and knowledge patterns.

Context:
${JSON.stringify(monitoringContext, null, 2)}

Recent conversations topics: ${recentConvos.map(c => c.metadata?.name || 'Untitled').join(', ')}
Recent graph additions: ${recentNodes.map(n => n.label).slice(0, 10).join(', ')}

Your task:
1. Identify RISKS: patterns that suggest potential problems, blind spots, or vulnerabilities
2. Spot OPPORTUNITIES: emerging patterns, untapped connections, or strategic openings
3. Detect TRENDS: shifts in focus, changing priorities, or evolving strategic direction
4. Predict OUTCOMES: forecast likely scenarios based on current trajectory

Be specific, actionable, and reference actual data. Prioritize insights by urgency and impact.`,
      response_json_schema: {
        type: "object",
        properties: {
          alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["risk", "opportunity", "trend", "anomaly"] },
                severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                title: { type: "string" },
                description: { type: "string" },
                evidence: { type: "string" },
                recommendation: { type: "string" },
                timeframe: { type: "string" }
              }
            }
          },
          predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scenario: { type: "string" },
                likelihood: { type: "number" },
                impact: { type: "string", enum: ["high", "medium", "low"] },
                timeframe: { type: "string" },
                indicators: { type: "array", items: { type: "string" } },
                recommended_actions: { type: "array", items: { type: "string" } }
              }
            }
          },
          strategic_summary: { type: "string" },
          priority_actions: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Create notifications for critical/high severity alerts
    const criticalAlerts = analysis.alerts?.filter(a => 
      a.severity === 'critical' || a.severity === 'high'
    ) || [];

    for (const alert of criticalAlerts) {
      await base44.asServiceRole.entities.Notification.create({
        user_email: user.email,
        title: `🚨 ${alert.title}`,
        message: alert.description,
        type: alert.type === 'risk' ? 'warning' : alert.type === 'opportunity' ? 'opportunity' : 'alert',
        severity: alert.severity,
        action_required: alert.severity === 'critical',
        data_snapshot: {
          recommendation: alert.recommendation,
          evidence: alert.evidence,
          timeframe: alert.timeframe
        }
      });
    }

    return Response.json({
      success: true,
      monitoring_results: {
        ...analysis,
        context: monitoringContext,
        alerts_generated: criticalAlerts.length,
        analyzed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Proactive monitoring error:', error);
    return Response.json({ 
      error: 'Failed to run proactive monitoring',
      details: error.message
    }, { status: 500 });
  }
});