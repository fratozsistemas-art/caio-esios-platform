import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversation_id } = await req.json();

    if (!conversation_id) {
      return Response.json({ error: 'conversation_id is required' }, { status: 400 });
    }

    // Get conversation
    const conversation = await base44.agents.getConversation(conversation_id);
    
    if (!conversation || !conversation.messages) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Extract entities and topics from conversation
    const allText = conversation.messages.map(m => m.content).join('\n');

    // Get knowledge graph data
    const graphNodes = await base44.entities.KnowledgeGraphNode.list();
    const graphRels = await base44.entities.KnowledgeGraphRelationship.list();

    if (graphNodes.length === 0) {
      return Response.json({
        success: true,
        correlation: {
          has_graph_data: false,
          message: 'No knowledge graph data available for correlation'
        }
      });
    }

    // Extract entity names and topics from graph
    const graphContext = {
      companies: graphNodes.filter(n => n.node_type === 'company').map(n => n.label),
      industries: graphNodes.filter(n => n.node_type === 'industry').map(n => n.label),
      total_nodes: graphNodes.length,
      total_relationships: graphRels.length,
      relationship_types: [...new Set(graphRels.map(r => r.relationship_type))]
    };

    // Call AI to correlate
    const correlation = await base44.integrations.Core.InvokeLLM({
      prompt: `You are analyzing a conversation in the context of a knowledge graph containing business intelligence.

Conversation Summary (${conversation.messages.length} messages):
${allText.slice(0, 3000)}

Knowledge Graph Context:
- ${graphContext.companies.length} companies tracked
- ${graphContext.industries.length} industries
- ${graphContext.total_relationships} relationships mapped

Companies in graph: ${graphContext.companies.slice(0, 20).join(', ')}
Industries: ${graphContext.industries.slice(0, 10).join(', ')}

Analyze and provide:
1. ENTITIES MENTIONED: Which graph entities (companies, industries) are referenced in the conversation?
2. MISSING CONNECTIONS: What entities discussed are NOT in the knowledge graph but should be?
3. STRATEGIC INSIGHTS: How does conversation context relate to graph patterns?
4. GRAPH ENHANCEMENT: What new nodes/relationships should be added based on this conversation?
5. KNOWLEDGE GAPS: What critical information is missing that would enhance analysis?`,
      response_json_schema: {
        type: "object",
        properties: {
          entities_mentioned: {
            type: "array",
            items: {
              type: "object",
              properties: {
                entity_name: { type: "string" },
                entity_type: { type: "string" },
                context: { type: "string" },
                in_graph: { type: "boolean" }
              }
            }
          },
          missing_connections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                entity: { type: "string" },
                entity_type: { type: "string" },
                reason: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] }
              }
            }
          },
          strategic_correlations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                insight: { type: "string" },
                graph_evidence: { type: "string" },
                conversation_evidence: { type: "string" },
                actionability: { type: "string" }
              }
            }
          },
          suggested_graph_additions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                node_label: { type: "string" },
                node_type: { type: "string" },
                relationships: {
                  type: "array",
                  items: { type: "string" }
                },
                rationale: { type: "string" }
              }
            }
          },
          knowledge_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                gap_description: { type: "string" },
                impact: { type: "string" },
                recommendation: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      correlation: {
        ...correlation,
        conversation_id,
        graph_stats: graphContext,
        analyzed_at: new Date().toISOString(),
        has_graph_data: true
      }
    });

  } catch (error) {
    console.error('Knowledge graph correlation error:', error);
    return Response.json({ 
      error: 'Failed to correlate with knowledge graph',
      details: error.message
    }, { status: 500 });
  }
});