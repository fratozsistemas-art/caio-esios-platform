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
      return Response.json({ error: 'conversation_id required' }, { status: 400 });
    }

    const conversation = await base44.agents.getConversation(conversation_id);
    
    if (!conversation || !conversation.messages || conversation.messages.length === 0) {
      return Response.json({ error: 'Conversation not found or empty' }, { status: 404 });
    }

    // Get last few messages for context
    const recentMessages = conversation.messages
      .slice(-5)
      .filter(m => m.content && m.content.trim().length > 0)
      .map(m => `${m.role === 'user' ? 'User' : 'CAIO'}: ${m.content}`)
      .join('\n\n');

    const lastMessage = conversation.messages[conversation.messages.length - 1];

    // Generate reply suggestions
    const suggestions = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this conversation, suggest 3 natural follow-up messages the user might want to send.

RECENT CONVERSATION:
${recentMessages}

LAST MESSAGE WAS FROM: ${lastMessage.role === 'user' ? 'User' : 'CAIO'}

Generate 3 different reply suggestions that:
1. Are contextually relevant to the conversation
2. Move the conversation forward productively
3. Are written from the user's perspective
4. Are concise (max 15 words each)

Examples:
- "Can you elaborate on the market analysis?"
- "What are the next steps?"
- "How does this compare to competitors?"

Return as JSON array of strings.`,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
            maxItems: 3
          }
        },
        required: ["suggestions"]
      }
    });

    return Response.json({
      success: true,
      suggestions: suggestions.suggestions || []
    });

  } catch (error) {
    console.error('Suggest replies error:', error);
    return Response.json({ 
      error: 'Failed to generate reply suggestions',
      details: error.message
    }, { status: 500 });
  }
});