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

    // Use service role to bypass permission checks for deletion
    // The agent SDK manages conversation ownership internally
    const conversation = await base44.asServiceRole.agents.getConversation(conversation_id);
    
    if (!conversation) {
      return Response.json({ 
        error: 'Conversation not found',
        conversation_id
      }, { status: 404 });
    }

    // Verify ownership before deletion
    const isOwner = conversation.created_by === user.email || 
                    conversation.created_by === user.id ||
                    conversation.user_id === user.email ||
                    conversation.user_id === user.id;

    if (!isOwner) {
      return Response.json({ 
        error: 'You can only delete your own conversations'
      }, { status: 403 });
    }

    // Mark as deleted via metadata using service role (soft delete)
    await base44.asServiceRole.agents.updateConversation(conversation_id, {
      metadata: {
        ...conversation.metadata,
        deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user.email
      }
    });

    return Response.json({
      success: true,
      message: 'Conversation deleted successfully',
      conversation_id
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    return Response.json({ 
      error: 'Failed to delete conversation',
      details: error.message
    }, { status: 500 });
  }
});