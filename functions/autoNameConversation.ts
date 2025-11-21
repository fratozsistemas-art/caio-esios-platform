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

    // Extract first few user messages and assistant responses for better context
    const relevantMessages = conversation.messages
      .filter(m => m.content && m.content.trim().length > 10)
      .slice(0, 4)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.trim()}`);

    if (relevantMessages.length === 0) {
      return Response.json({ 
        success: false,
        error: 'No meaningful messages found'
      }, { status: 400 });
    }

    const conversationContext = relevantMessages.join('\n\n').substring(0, 800);

    // Generate name using LLM
    const suggestedName = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this conversation and create a concise, descriptive title that captures the main topic.

CONVERSATION CONTEXT:
${conversationContext}

GUIDELINES:
1. Extract the core topic/question being discussed
2. If a company/organization is mentioned prominently, include it
3. Format examples:
   - "Nubank - Market Entry Strategy"
   - "E-commerce Growth Analysis"
   - "Golden Deer Brasil - VC Assessment"
   - "Digital Transformation Planning"
4. Keep title between 30-50 characters
5. Be specific and professional
6. Use title case

Return ONLY the title without quotes or additional text.`,
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