import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { focus_area, timeframe } = await req.json();

    // Gather historical data
    const conversations = await base44.agents.listConversations({
      agent_name: "caio_agent"
    });
    const userConversations = conversations.filter(c => c.created_by === user.email);

    const strategies = await base44.entities.Strategy.list();
    const graphNodes = await base44.entities.KnowledgeGraphNode.list();
    const graphRels = await base44.entities.KnowledgeGraphRelationship.list();

    // Build temporal patterns
    const timeline = userConversations.map(c => ({
      date: new Date(c.created_at),
      topics: c.metadata?.topics || [],
      frameworks: c.metadata?.frameworks_used || []
    })).sort((a, b) => a.date - b.date);

    const strategyTimeline = strategies.map(s => ({
      date: new Date(s.created_date),
      category: s.category,
      roi: s.roi_estimate,
      status: s.status
    })).sort((a, b) => a.date - b.date);

    // Graph growth patterns
    const graphGrowth = {
      total_nodes: graphNodes.length,
      nodes_by_month: {},
      relationship_density: graphNodes.length > 0 ? 
        graphRels.length / (graphNodes.length * (graphNodes.length - 1)) : 0
    };

    // AI-powered predictive analysis
    const predictions = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a predictive analytics engine analyzing strategic patterns and forecasting outcomes.

Historical Data:
- ${userConversations.length} conversations over time
- ${strategies.length} strategies developed
- ${graphNodes.length} entities in knowledge graph
- ${graphRels.length} relationships mapped

Recent trajectory:
${JSON.stringify(timeline.slice(-5), null, 2)}

Focus Area: ${focus_area || 'general strategic direction'}
Timeframe: ${timeframe || '3-6 months'}

Provide:
1. TREND FORECASTS: What patterns will likely continue/emerge
2. OUTCOME PREDICTIONS: Likely scenarios and their probabilities
3. RISK PROJECTIONS: Potential challenges ahead
4. OPPORTUNITY WINDOWS: Emerging opportunities with timing
5. RECOMMENDED PREPARATIONS: What to do now to optimize outcomes`,
      response_json_schema: {
        type: "object",
        properties: {
          forecasts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                trend_name: { type: "string" },
                direction: { type: "string", enum: ["increasing", "decreasing", "stable", "volatile"] },
                confidence: { type: "number" },
                timeframe: { type: "string" },
                implications: { type: "string" }
              }
            }
          },
          scenarios: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scenario_name: { type: "string" },
                description: { type: "string" },
                probability: { type: "number" },
                impact: { type: "string", enum: ["positive", "negative", "neutral"] },
                leading_indicators: { type: "array", items: { type: "string" } },
                timeline: { type: "string" }
              }
            }
          },
          risk_forecast: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk_description: { type: "string" },
                likelihood: { type: "number" },
                severity: { type: "string", enum: ["high", "medium", "low"] },
                early_warning_signs: { type: "array", items: { type: "string" } },
                mitigation_strategy: { type: "string" }
              }
            }
          },
          opportunity_windows: {
            type: "array",
            items: {
              type: "object",
              properties: {
                opportunity: { type: "string" },
                optimal_timing: { type: "string" },
                required_preparation: { type: "string" },
                expected_value: { type: "string" }
              }
            }
          },
          strategic_recommendations: {
            type: "array",
            items: { type: "string" }
          },
          confidence_score: { type: "number" }
        }
      }
    });

    return Response.json({
      success: true,
      predictions: {
        ...predictions,
        focus_area: focus_area || 'general',
        timeframe: timeframe || '3-6 months',
        based_on: {
          conversations_analyzed: userConversations.length,
          strategies_analyzed: strategies.length,
          graph_entities: graphNodes.length
        },
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Predictive analysis error:', error);
    return Response.json({ 
      error: 'Failed to run predictive analysis',
      details: error.message
    }, { status: 500 });
  }
});