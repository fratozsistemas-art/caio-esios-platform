import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversation_id, shared_with_email, access_level, message } = await req.json();

    if (!conversation_id || !shared_with_email || !access_level) {
      return Response.json({ 
        error: 'conversation_id, shared_with_email, and access_level are required' 
      }, { status: 400 });
    }

    // Validate access level
    if (!['view', 'comment', 'edit'].includes(access_level)) {
      return Response.json({ 
        error: 'Invalid access_level. Must be: view, comment, or edit' 
      }, { status: 400 });
    }

    // Get conversation to verify ownership
    const conversation = await base44.agents.getConversation(conversation_id);
    
    if (!conversation) {
      return Response.json({ 
        error: 'Conversation not found' 
      }, { status: 404 });
    }

    // Verify user is owner
    const isOwner = conversation.created_by === user.email || 
                    conversation.created_by === user.id;

    if (!isOwner) {
      return Response.json({ 
        error: 'Only conversation owner can share' 
      }, { status: 403 });
    }

    // Check if target user exists
    const targetUsers = await base44.asServiceRole.entities.User.filter({ email: shared_with_email });
    if (!targetUsers || targetUsers.length === 0) {
      return Response.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Update conversation metadata with sharing info
    const currentMetadata = conversation.metadata || {};
    const sharedWith = currentMetadata.shared_with || [];
    
    // Check if already shared
    const existingShare = sharedWith.find(s => s.email === shared_with_email);
    if (existingShare) {
      // Update existing share
      existingShare.access_level = access_level;
      existingShare.updated_at = new Date().toISOString();
    } else {
      // Add new share
      sharedWith.push({
        email: shared_with_email,
        access_level,
        shared_by: user.email,
        shared_at: new Date().toISOString(),
        message: message || null
      });
    }

    await base44.asServiceRole.agents.updateConversation(conversation_id, {
      metadata: {
        ...currentMetadata,
        shared_with: sharedWith,
        last_shared_at: new Date().toISOString()
      }
    });

    // Send notification email
    try {
      await base44.integrations.Core.SendEmail({
        to: shared_with_email,
        subject: `${user.full_name || user.email} shared a conversation with you`,
        body: `
          ${user.full_name || user.email} has shared a CAIO conversation with you.
          
          ${message ? `Message: ${message}` : ''}
          
          Access level: ${access_level}
          
          Log in to view: ${Deno.env.get('BASE44_APP_URL') || 'your-app-url'}
        `
      });
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
    }

    return Response.json({
      success: true,
      message: 'Conversation shared successfully',
      share: {
        conversation_id,
        shared_with_email,
        access_level
      }
    });

  } catch (error) {
    console.error('Share conversation error:', error);
    return Response.json({ 
      error: 'Failed to share conversation',
      details: error.message
    }, { status: 500 });
  }
});