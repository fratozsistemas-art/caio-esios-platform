import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Revokes a share link
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { share_link_id } = await req.json();

    if (!share_link_id) {
      return Response.json({ error: 'share_link_id is required' }, { status: 400 });
    }

    // Get share link
    const shareLink = await base44.entities.ExternalShareLink.get(share_link_id);

    if (!shareLink) {
      return Response.json({ error: 'Share link not found' }, { status: 404 });
    }

    // Check if user has permission to revoke
    const { data: accessCheck } = await base44.functions.invoke('checkWorkspaceAccess', {
      workspace_id: shareLink.workspace_id,
      required_permission: 'can_share_externally'
    });

    if (!accessCheck.has_access && shareLink.created_by_email !== user.email) {
      return Response.json({ 
        error: 'Insufficient permissions to revoke this link' 
      }, { status: 403 });
    }

    // Revoke the link
    await base44.entities.ExternalShareLink.update(share_link_id, {
      is_active: false,
      revoked_at: new Date().toISOString(),
      revoked_by: user.email
    });

    return Response.json({
      success: true,
      message: 'Share link revoked successfully'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});