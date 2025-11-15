import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversation_id, message_id, feedback_type, comment } = await req.json();

    if (!conversation_id || !message_id || !feedback_type) {
      return Response.json({ 
        error: 'conversation_id, message_id, and feedback_type are required' 
      }, { status: 400 });
    }

    // Validate feedback_type
    if (!['positive', 'negative', 'helpful', 'not_helpful'].includes(feedback_type)) {
      return Response.json({ 
        error: 'Invalid feedback_type. Must be: positive, negative, helpful, or not_helpful' 
      }, { status: 400 });
    }

    // Get conversation to verify ownership
    const conversation = await base44.agents.getConversation(conversation_id);
    
    if (!conversation) {
      return Response.json({ 
        error: 'Conversation not found' 
      }, { status: 404 });
    }

    // Store feedback in conversation metadata
    const currentMetadata = conversation.metadata || {};
    const feedbackLog = currentMetadata.feedback_log || [];
    
    feedbackLog.push({
      message_id,
      feedback_type,
      comment: comment || null,
      user_email: user.email,
      timestamp: new Date().toISOString()
    });

    // Update conversation metadata using service role
    await base44.asServiceRole.agents.updateConversation(conversation_id, {
      metadata: {
        ...currentMetadata,
        feedback_log: feedbackLog,
        last_feedback_at: new Date().toISOString()
      }
    });

    return Response.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: {
        conversation_id,
        message_id,
        feedback_type
      }
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    return Response.json({ 
      error: 'Failed to submit feedback',
      details: error.message
    }, { status: 500 });
  }
});