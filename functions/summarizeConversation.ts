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

    // Extract meaningful messages
    const messagesToSummarize = conversation.messages
      .filter(m => m.content && m.content.trim().length > 0)
      .map(m => `${m.role === 'user' ? 'User' : 'CAIO'}: ${m.content}`)
      .join('\n\n');

    // Generate summary
    const summary = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this conversation between a user and CAIO (AI strategic advisor) and create a comprehensive summary.

CONVERSATION:
${messagesToSummarize.substring(0, 4000)}

Provide a structured summary with:
1. **Main Topic**: What was discussed
2. **Key Points**: 3-5 bullet points of important insights
3. **Decisions Made**: Any conclusions or action items
4. **Next Steps**: Recommended follow-ups (if any)

Keep it concise but informative, suitable for quick reference.`,
      add_context_from_internet: false
    });

    return Response.json({
      success: true,
      summary,
      message_count: conversation.messages.length
    });

  } catch (error) {
    console.error('Summarize conversation error:', error);
    return Response.json({ 
      error: 'Failed to summarize conversation',
      details: error.message
    }, { status: 500 });
  }
});