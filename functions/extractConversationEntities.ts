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

    const conversation = await base44.agents.getConversation(conversation_id);
    const messages = conversation.messages || [];

    // Extract text from user and assistant messages
    const conversationText = messages
      .filter(m => m.content)
      .map(m => `${m.role}: ${m.content}`)
      .join('\n\n');

    // AI-powered entity extraction and topic analysis
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this conversation and extract key information:

${conversationText}

Extract:
1. ENTITIES: Companies, people, technologies, products, locations, industries
2. TOPICS: Main themes, strategic areas, business domains discussed
3. SENTIMENT: Overall tone, emotional indicators, urgency level
4. KEY INSIGHTS: Important facts, decisions, action items mentioned
5. STRATEGIC PATTERNS: Frameworks referenced, methodologies discussed`,
      response_json_schema: {
        type: "object",
        properties: {
          entities: {
            type: "object",
            properties: {
              companies: { type: "array", items: { type: "string" } },
              people: { type: "array", items: { type: "string" } },
              technologies: { type: "array", items: { type: "string" } },
              products: { type: "array", items: { type: "string" } },
              locations: { type: "array", items: { type: "string" } },
              industries: { type: "array", items: { type: "string" } }
            }
          },
          topics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                relevance: { type: "number" },
                context: { type: "string" }
              }
            }
          },
          sentiment: {
            type: "object",
            properties: {
              overall: { type: "string", enum: ["positive", "neutral", "negative", "mixed"] },
              confidence: { type: "number" },
              tone: { type: "array", items: { type: "string" } },
              urgency: { type: "string", enum: ["low", "medium", "high", "critical"] }
            }
          },
          key_insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                insight: { type: "string" },
                category: { type: "string" },
                importance: { type: "string", enum: ["high", "medium", "low"] }
              }
            }
          },
          frameworks_mentioned: { type: "array", items: { type: "string" } },
          action_items: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Correlate with knowledge graph
    const graphNodes = await base44.entities.KnowledgeGraphNode.list();
    
    const matchedEntities = {
      in_graph: [],
      new_entities: []
    };

    // Check which entities already exist in graph
    const allExtractedEntities = [
      ...(analysis.entities?.companies || []),
      ...(analysis.entities?.technologies || []),
      ...(analysis.entities?.industries || [])
    ];

    for (const entity of allExtractedEntities) {
      const exists = graphNodes.find(n => 
        n.label?.toLowerCase().includes(entity.toLowerCase())
      );
      
      if (exists) {
        matchedEntities.in_graph.push({
          entity,
          node_id: exists.id,
          node_type: exists.node_type
        });
      } else {
        matchedEntities.new_entities.push(entity);
      }
    }

    // Update conversation metadata with extracted info
    await base44.asServiceRole.agents.updateConversation(conversation_id, {
      metadata: {
        ...conversation.metadata,
        analyzed: true,
        analyzed_at: new Date().toISOString(),
        entities: analysis.entities,
        topics: analysis.topics?.map(t => t.topic),
        sentiment: analysis.sentiment?.overall,
        frameworks_used: analysis.frameworks_mentioned
      }
    });

    return Response.json({
      success: true,
      analysis: {
        ...analysis,
        graph_correlation: matchedEntities,
        extracted_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Entity extraction error:', error);
    return Response.json({ 
      error: 'Failed to extract entities',
      details: error.message
    }, { status: 500 });
  }
});