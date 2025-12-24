import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allFacts = await base44.entities.StrategicFact.list();

    // Sort by date to identify temporal patterns
    const factsByDate = [...allFacts].sort((a, b) => {
      const dateA = new Date(a.start_date || a.created_date);
      const dateB = new Date(b.start_date || b.created_date);
      return dateA - dateB;
    });

    // Extract temporal evolution
    const topicEvolution = {};
    factsByDate.forEach(fact => {
      if (!topicEvolution[fact.topic_label]) {
        topicEvolution[fact.topic_label] = [];
      }
      topicEvolution[fact.topic_label].push({
        date: fact.start_date || fact.created_date,
        status: fact.status,
        confidence: fact.confidence,
        dimension: fact.dimension,
        summary: fact.summary
      });
    });

    const predictionPrompt = `
    Analyze historical patterns in this strategic facts database and predict future trends.
    
    Topic Evolution Data:
    ${Object.entries(topicEvolution).map(([topic, events]) => `
    ${topic}:
    ${events.map(e => `  - ${e.date}: ${e.summary} (confidence: ${e.confidence})`).join('\n')}
    `).join('\n')}
    
    Recent Facts (Last 6 months):
    ${factsByDate.slice(-20).map(f => `- ${f.topic_label}: ${f.summary} (${f.start_date})`).join('\n')}
    
    Provide:
    1. Emerging trend predictions for next 6-12 months
    2. Topic momentum analysis (accelerating, stable, declining)
    3. Geopolitical implications and scenario forecasts
    4. Dependencies and cascade effects to watch
    5. Black swan possibilities (low probability, high impact)
    `;

    const predictions = await base44.integrations.Core.InvokeLLM({
      prompt: predictionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          trend_predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                trend_name: { type: "string" },
                description: { type: "string" },
                probability: { type: "number" },
                timeframe: { type: "string" },
                related_topics: {
                  type: "array",
                  items: { type: "string" }
                },
                key_indicators: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          topic_momentum: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                momentum: {
                  type: "string",
                  enum: ["accelerating", "stable", "declining"]
                },
                reasoning: { type: "string" }
              }
            }
          },
          geopolitical_scenarios: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scenario_name: { type: "string" },
                description: { type: "string" },
                probability: { type: "number" },
                impact_level: {
                  type: "string",
                  enum: ["low", "medium", "high", "critical"]
                },
                trigger_events: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          cascade_effects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                trigger: { type: "string" },
                cascade_chain: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          black_swan_events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                event: { type: "string" },
                impact_description: { type: "string" },
                probability_assessment: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      predictions: predictions.trend_predictions || [],
      topic_momentum: predictions.topic_momentum || [],
      geopolitical_scenarios: predictions.geopolitical_scenarios || [],
      cascade_effects: predictions.cascade_effects || [],
      black_swan_events: predictions.black_swan_events || [],
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error predicting fact trends:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});