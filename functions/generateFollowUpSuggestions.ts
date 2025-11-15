import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversation_id } = await req.json();

    // Get conversation and user's history
    const conversation = await base44.agents.getConversation(conversation_id);
    const messages = conversation.messages || [];
    
    const allConversations = await base44.agents.listConversations({
      agent_name: "caio_agent"
    });
    const userConversations = allConversations.filter(c => 
      c.created_by === user.email && !c.metadata?.deleted
    );

    // Get user's strategies and analyses
    const strategies = await base44.entities.Strategy.list();
    const graphNodes = await base44.entities.KnowledgeGraphNode.list();

    // Build context for suggestion generation
    const recentMessages = messages.slice(-10);
    const conversationContext = recentMessages
      .map(m => `${m.role}: ${m.content || ''}`)
      .join('\n');

    const historicalTopics = userConversations
      .flatMap(c => c.metadata?.topics || [])
      .filter((v, i, a) => a.indexOf(v) === i);

    const frameworksUsed = [
      ...new Set(strategies.map(s => s.category))
    ];

    // Generate intelligent follow-up suggestions
    const suggestions = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a strategic advisor analyzing conversation patterns to suggest next steps.

Current conversation context:
${conversationContext}

User's historical focus areas: ${historicalTopics.slice(0, 10).join(', ')}
Frameworks used: ${frameworksUsed.join(', ')}
Total strategies developed: ${strategies.length}
Knowledge graph entities: ${graphNodes.length}

Generate personalized follow-up suggestions that:
1. Build on the current conversation naturally
2. Address gaps or unexplored angles
3. Connect to user's historical interests
4. Suggest concrete next actions
5. Leverage CAIO's frameworks (ABRA, NIA, EVA, CSI, etc.)

Be specific, actionable, and strategically valuable.`,
      response_json_schema: {
        type: "object",
        properties: {
          immediate_prompts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                prompt: { type: "string" },
                rationale: { type: "string" },
                category: { 
                  type: "string",
                  enum: ["clarification", "expansion", "analysis", "action"]
                }
              }
            }
          },
          strategic_questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                purpose: { type: "string" },
                framework: { type: "string" }
              }
            }
          },
          recommended_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                description: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] },
                estimated_time: { type: "string" }
              }
            }
          },
          related_quick_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                relevance: { type: "string" }
              }
            }
          },
          unexplored_angles: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      success: true,
      suggestions: {
        ...suggestions,
        generated_at: new Date().toISOString(),
        based_on: {
          messages_analyzed: recentMessages.length,
          historical_conversations: userConversations.length,
          strategies_referenced: strategies.length
        }
      }
    });

  } catch (error) {
    console.error('Follow-up generation error:', error);
    return Response.json({ 
      error: 'Failed to generate suggestions',
      details: error.message
    }, { status: 500 });
  }
});