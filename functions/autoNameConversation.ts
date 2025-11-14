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
      return Response.json({ 
        success: false,
        error: 'Conversation not found or empty'
      }, { status: 404 });
    }

    // Extract first few user messages
    const userMessages = conversation.messages
      .filter(m => m.role === 'user' && m.content && m.content.trim().length > 10)
      .slice(0, 3)
      .map(m => m.content.trim());

    if (userMessages.length === 0) {
      return Response.json({ 
        success: false,
        error: 'No meaningful user messages found'
      }, { status: 400 });
    }

    const conversationContext = userMessages.join('\n\n').substring(0, 500);

    // Generate name using LLM
    const suggestedName = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this conversation and create a concise, professional title.

CONVERSATION SNIPPET:
${conversationContext}

INSTRUCTIONS:
1. Identify the company/organization name (if mentioned)
2. Identify the main topic/objective
3. Create a title in this format:
   - If company mentioned: "[Company] - [Topic]" (e.g., "Nubank - Market Entry Strategy")
   - If no company: "[Topic]" (e.g., "Digital Transformation Roadmap")
4. Keep it under 50 characters
5. Be specific and professional

Return ONLY the title, nothing else. No quotes, no explanation.`,
      add_context_from_internet: false
    });

    // Clean the suggested name
    const cleanName = suggestedName
      .toString()
      .trim()
      .replace(/^["']|["']$/g, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 60);

    // Update conversation
    await base44.agents.updateConversation(conversation_id, {
      metadata: {
        ...(conversation.metadata || {}),
        name: cleanName,
        auto_named: true,
        auto_named_at: new Date().toISOString()
      }
    });

    return Response.json({
      success: true,
      conversation_id,
      suggested_name: cleanName
    });

  } catch (error) {
    console.error('Auto-name error:', error);
    return Response.json({ 
      success: false,
      error: 'Failed to auto-name conversation',
      details: error.message
    }, { status: 500 });
  }
});