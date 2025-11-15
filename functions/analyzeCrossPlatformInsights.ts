import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active data sources
    const dataSources = await base44.asServiceRole.entities.DataSource.filter({ status: 'active' });

    if (dataSources.length < 2) {
      return Response.json({
        success: false,
        message: 'Need at least 2 data sources for cross-platform analysis'
      }, { status: 400 });
    }

    // Ingest recent data from all sources
    const ingestResponse = await base44.functions.invoke('autoIngestDataSources', {
      limit: 100
    });

    const items = ingestResponse.data?.items || [];

    if (items.length === 0) {
      return Response.json({
        success: false,
        message: 'No data available for analysis'
      }, { status: 400 });
    }

    // Group items by source
    const dataBySource = {};
    for (const item of items) {
      if (!dataBySource[item.source_type]) {
        dataBySource[item.source_type] = [];
      }
      dataBySource[item.source_type].push(item);
    }

    // Get knowledge graph context
    const graphNodes = await base44.entities.KnowledgeGraphNode.list();
    const graphRelationships = await base44.entities.KnowledgeGraphRelationship.list();

    // AI Analysis for cross-platform insights
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Perform deep cross-platform analysis to identify strategic insights, correlations, and patterns.

DATA SOURCES AVAILABLE:
${Object.keys(dataBySource).join(', ')}

DATA BREAKDOWN:
${Object.entries(dataBySource).map(([source, data]) => `
${source.toUpperCase()} (${data.length} items):
${JSON.stringify(data.slice(0, 15), null, 2)}
`).join('\n')}

KNOWLEDGE GRAPH CONTEXT:
- Nodes: ${graphNodes.length} entities
- Relationships: ${graphRelationships.length} connections

ANALYSIS OBJECTIVES:
1. CROSS-PLATFORM CORRELATIONS: Identify connections between activities across different platforms
2. EMERGENT TRENDS: Spot patterns that only become visible when viewing all sources together
3. RISK SIGNALS: Detect potential issues mentioned across multiple channels
4. OPPORTUNITIES: Find strategic opportunities revealed by cross-referencing data
5. ACTIVITY PATTERNS: Identify which topics/projects are hot across all platforms
6. GAPS & MISALIGNMENTS: Find disconnects between what's discussed vs what's documented vs what's tracked

Provide actionable insights with high confidence and specific evidence.`,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          cross_platform_correlations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                sources_involved: { type: "array", items: { type: "string" } },
                correlation_strength: { type: "string", enum: ["weak", "moderate", "strong"] },
                evidence: { type: "array", items: { type: "string" } },
                impact: { type: "string", enum: ["low", "medium", "high", "critical"] }
              }
            }
          },
          emergent_trends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                trend_name: { type: "string" },
                description: { type: "string" },
                momentum: { type: "string", enum: ["declining", "stable", "growing", "explosive"] },
                sources: { type: "array", items: { type: "string" } },
                strategic_implications: { type: "string" }
              }
            }
          },
          risk_signals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk_title: { type: "string" },
                description: { type: "string" },
                severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                indicators: { type: "array", items: { type: "string" } },
                recommended_action: { type: "string" },
                urgency: { type: "string", enum: ["monitor", "investigate", "act_now"] }
              }
            }
          },
          opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                opportunity_title: { type: "string" },
                description: { type: "string" },
                potential_value: { type: "string", enum: ["low", "medium", "high", "transformative"] },
                evidence_sources: { type: "array", items: { type: "string" } },
                next_steps: { type: "array", items: { type: "string" } }
              }
            }
          },
          hot_topics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                mention_count: { type: "number" },
                platforms: { type: "array", items: { type: "string" } },
                sentiment: { type: "string", enum: ["negative", "neutral", "positive"] }
              }
            }
          },
          gaps_and_misalignments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                gap_title: { type: "string" },
                description: { type: "string" },
                impact: { type: "string" },
                recommendation: { type: "string" }
              }
            }
          },
          confidence_score: { type: "number" }
        }
      }
    });

    // Create insight record
    const insightRecord = await base44.asServiceRole.entities.Analysis.create({
      title: 'Cross-Platform Intelligence Report',
      type: 'opportunity',
      status: 'completed',
      framework_used: 'Multi-Source Synthesis',
      results: analysis,
      confidence_score: analysis.confidence_score,
      completed_at: new Date().toISOString(),
      created_by: user.email
    });

    // Create notification
    await base44.asServiceRole.entities.Notification.create({
      user_email: user.email,
      title: '🔍 Cross-Platform Insights Ready',
      message: `AI identified ${analysis.opportunities?.length || 0} opportunities, ${analysis.risk_signals?.length || 0} risks, and ${analysis.emergent_trends?.length || 0} trends across ${Object.keys(dataBySource).length} platforms.`,
      type: 'info',
      severity: 'medium',
      data_snapshot: {
        analysis_id: insightRecord.id,
        sources: Object.keys(dataBySource)
      }
    });

    return Response.json({
      success: true,
      insights: analysis,
      metadata: {
        sources_analyzed: Object.keys(dataBySource).length,
        items_processed: items.length,
        analysis_id: insightRecord.id,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Cross-platform analysis error:', error);
    return Response.json({ 
      error: 'Failed to analyze cross-platform insights',
      details: error.message
    }, { status: 500 });
  }
});