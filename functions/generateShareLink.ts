import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Generates a secure, time-limited shareable link for workspace resources
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      workspace_id,
      resource_type,
      resource_id,
      recipient_email,
      expires_in_hours = 168, // Default 7 days
      max_access_count,
      permissions = { can_view: true, can_comment: false, can_download: false },
      password,
      custom_message,
      require_email_verification = false
    } = await req.json();

    // Check if user has permission to share
    const { data: accessCheck } = await base44.functions.invoke('checkWorkspaceAccess', {
      workspace_id,
      required_permission: 'can_share_externally'
    });

    if (!accessCheck.has_access) {
      return Response.json({ 
        error: 'Insufficient permissions to create share links' 
      }, { status: 403 });
    }

    // Generate unique share token
    const shareToken = crypto.randomUUID() + '-' + Date.now().toString(36);
    
    // Calculate expiration
    const expiresAt = new Date(Date.now() + expires_in_hours * 60 * 60 * 1000).toISOString();

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      passwordHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    // Create share link
    const shareLink = await base44.entities.ExternalShareLink.create({
      workspace_id,
      resource_type,
      resource_id: resource_id || null,
      share_token: shareToken,
      created_by_email: user.email,
      recipient_email: recipient_email || null,
      permissions,
      expires_at: expiresAt,
      max_access_count: max_access_count || null,
      access_count: 0,
      is_active: true,
      password_protected: !!password,
      password_hash: passwordHash,
      custom_message: custom_message || null,
      require_email_verification
    });

    // Generate shareable URL
    const baseUrl = req.headers.get('origin') || 'https://app.caio.ai';
    const shareUrl = `${baseUrl}/share/${shareToken}`;

    return Response.json({
      success: true,
      share_link: shareLink,
      share_url: shareUrl,
      expires_at: expiresAt,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});