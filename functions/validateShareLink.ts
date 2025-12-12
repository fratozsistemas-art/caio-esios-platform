import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Validates a share link and logs access
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { share_token, password, email } = await req.json();

    if (!share_token) {
      return Response.json({ error: 'share_token is required' }, { status: 400 });
    }

    // Find share link
    const shareLinks = await base44.asServiceRole.entities.ExternalShareLink.filter({
      share_token,
      is_active: true
    });

    if (shareLinks.length === 0) {
      return Response.json({ 
        valid: false, 
        error: 'Invalid or inactive share link' 
      }, { status: 404 });
    }

    const shareLink = shareLinks[0];

    // Check expiration
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return Response.json({ 
        valid: false, 
        error: 'Share link has expired' 
      }, { status: 410 });
    }

    // Check access count
    if (shareLink.max_access_count && shareLink.access_count >= shareLink.max_access_count) {
      return Response.json({ 
        valid: false, 
        error: 'Maximum access count reached' 
      }, { status: 403 });
    }

    // Check password
    if (shareLink.password_protected) {
      if (!password) {
        return Response.json({ 
          valid: false, 
          requires_password: true,
          error: 'Password required' 
        }, { status: 401 });
      }

      // Hash provided password
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const passwordHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (passwordHash !== shareLink.password_hash) {
        return Response.json({ 
          valid: false, 
          error: 'Incorrect password' 
        }, { status: 401 });
      }
    }

    // Check email verification
    if (shareLink.require_email_verification) {
      if (!email) {
        return Response.json({ 
          valid: false, 
          requires_email: true,
          error: 'Email verification required' 
        }, { status: 401 });
      }

      if (shareLink.recipient_email && email !== shareLink.recipient_email) {
        return Response.json({ 
          valid: false, 
          error: 'Email does not match intended recipient' 
        }, { status: 403 });
      }
    }

    // Log access
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const ip = req.headers.get('cf-connecting-ip') || 
               req.headers.get('x-forwarded-for') || 
               'Unknown';

    await base44.asServiceRole.entities.ExternalAccessLog.create({
      share_link_id: shareLink.id,
      workspace_id: shareLink.workspace_id,
      resource_type: shareLink.resource_type,
      resource_id: shareLink.resource_id,
      accessed_at: new Date().toISOString(),
      accessor_email: email || null,
      accessor_ip: ip,
      user_agent: userAgent,
      action_performed: 'view',
      success: true
    });

    // Increment access count
    await base44.asServiceRole.entities.ExternalShareLink.update(shareLink.id, {
      access_count: shareLink.access_count + 1
    });

    // Fetch the actual resource
    let resource = null;
    try {
      if (shareLink.resource_type === 'workspace') {
        resource = await base44.asServiceRole.entities.Workspace.get(shareLink.workspace_id);
      } else if (shareLink.resource_type === 'strategy') {
        resource = await base44.asServiceRole.entities.Strategy.get(shareLink.resource_id);
      } else if (shareLink.resource_type === 'analysis') {
        resource = await base44.asServiceRole.entities.Analysis.get(shareLink.resource_id);
      } else if (shareLink.resource_type === 'knowledge_item') {
        resource = await base44.asServiceRole.entities.KnowledgeItem.get(shareLink.resource_id);
      }
    } catch (e) {
      console.error('Error fetching resource:', e);
    }

    return Response.json({
      valid: true,
      share_link: {
        workspace_id: shareLink.workspace_id,
        resource_type: shareLink.resource_type,
        resource_id: shareLink.resource_id,
        permissions: shareLink.permissions,
        custom_message: shareLink.custom_message,
        created_by: shareLink.created_by_email,
        expires_at: shareLink.expires_at
      },
      resource,
      access_info: {
        remaining_access: shareLink.max_access_count 
          ? shareLink.max_access_count - shareLink.access_count 
          : null,
        expires_in_hours: shareLink.expires_at 
          ? Math.max(0, Math.floor((new Date(shareLink.expires_at) - new Date()) / (60 * 60 * 1000)))
          : null
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});