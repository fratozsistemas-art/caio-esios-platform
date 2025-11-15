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

    let conversation;
    try {
      conversation = await base44.asServiceRole.agents.getConversation(conversation_id);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return Response.json({ 
        error: 'Failed to fetch conversation',
        details: error.message
      }, { status: 500 });
    }
    
    if (!conversation) {
      return Response.json({ 
        error: 'Conversation not found',
        conversation_id
      }, { status: 404 });
    }

    // Flexible ownership check
    const createdBy = conversation.created_by || conversation.user_id || '';
    const isOwner = createdBy === user.email || 
                    createdBy === user.id ||
                    createdBy.includes(user.email);

    if (!isOwner) {
      console.log('Ownership check failed:', {
        conversation_created_by: conversation.created_by,
        conversation_user_id: conversation.user_id,
        user_email: user.email,
        user_id: user.id
      });
      return Response.json({ 
        error: 'You can only delete your own conversations'
      }, { status: 403 });
    }

    // Mark as deleted via metadata using service role (soft delete)
    try {
      const currentMetadata = conversation.metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user.email
      };

      await base44.asServiceRole.agents.updateConversation(conversation_id, {
        metadata: updatedMetadata
      });

      return Response.json({
        success: true,
        message: 'Conversation deleted successfully',
        conversation_id
      });
    } catch (updateError) {
      console.error('Error updating conversation metadata:', updateError);
      return Response.json({ 
        error: 'Failed to update conversation',
        details: updateError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Delete conversation error:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: 'Failed to delete conversation',
      details: error.message
    }, { status: 500 });
  }
});