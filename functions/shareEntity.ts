import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Share an entity with another user
 * Grants granular access permissions
 */
Deno.serve(async (req) => {
  console.log('🤝 [Share Entity] Function started');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      entity_type,      // e.g., 'Strategy', 'Analysis', 'KnowledgeSource'
      entity_id,
      share_with_email, // email of user to share with
      access_level,     // 'view', 'comment', 'edit', 'admin'
      expires_at,       // optional expiration
      notes            // optional notes
    } = await req.json();

    if (!entity_type || !entity_id || !share_with_email || !access_level) {
      return Response.json({ 
        error: 'entity_type, entity_id, share_with_email, and access_level are required' 
      }, { status: 400 });
    }

    console.log(`📤 Sharing ${entity_type} ${entity_id} with ${share_with_email}`);

    // Check if user has permission to share this entity
    const permissionCheck = await base44.functions.invoke('checkPermission', {
      resource: entity_type.toLowerCase() + 's',
      action: 'share',
      entity_id
    });

    if (!permissionCheck.data?.hasPermission) {
      return Response.json({
        error: 'You do not have permission to share this entity',
        details: permissionCheck.data?.error
      }, { status: 403 });
    }

    // Get entity to verify ownership
    const entityMap = {
      'Strategy': 'Strategy',
      'Analysis': 'Analysis',
      'KnowledgeSource': 'KnowledgeSource',
      'Workspace': 'Workspace',
      'TSIProject': 'TSIProject',
      'FileAnalysis': 'FileAnalysis'
    };

    const entityName = entityMap[entity_type];
    const entities = await base44.entities[entityName].filter({ id: entity_id });

    if (!entities || entities.length === 0) {
      return Response.json({
        error: 'Entity not found'
      }, { status: 404 });
    }

    const entity = entities[0];

    // Verify user is owner or has admin access
    const isOwner = entity.created_by === user.email;
    
    if (!isOwner) {
      // Check if user has admin access to this entity
      const existingAccess = await base44.asServiceRole.entities.EntityAccess.filter({
        entity_id,
        shared_with_email: user.email,
        access_level: 'admin',
        is_active: true
      });

      if (!existingAccess || existingAccess.length === 0) {
        return Response.json({
          error: 'Only owner or admin can share this entity'
        }, { status: 403 });
      }
    }

    // Check if user to share with exists
    const targetUsers = await base44.asServiceRole.entities.User.filter({
      email: share_with_email
    });

    if (!targetUsers || targetUsers.length === 0) {
      return Response.json({
        error: 'User not found',
        email: share_with_email
      }, { status: 404 });
    }

    // Map access level to permissions
    const accessLevelPermissions = {
      'view': {
        can_view: true,
        can_edit: false,
        can_delete: false,
        can_share: false,
        can_comment: false,
        can_export: true
      },
      'comment': {
        can_view: true,
        can_edit: false,
        can_delete: false,
        can_share: false,
        can_comment: true,
        can_export: true
      },
      'edit': {
        can_view: true,
        can_edit: true,
        can_delete: false,
        can_share: false,
        can_comment: true,
        can_export: true
      },
      'admin': {
        can_view: true,
        can_edit: true,
        can_delete: true,
        can_share: true,
        can_comment: true,
        can_export: true
      }
    };

    const permissions = accessLevelPermissions[access_level];

    if (!permissions) {
      return Response.json({
        error: 'Invalid access level',
        valid_levels: Object.keys(accessLevelPermissions)
      }, { status: 400 });
    }

    // Check if access already exists
    const existingAccess = await base44.asServiceRole.entities.EntityAccess.filter({
      entity_id,
      shared_with_email: share_with_email,
      is_active: true
    });

    let accessRecord;
    
    if (existingAccess && existingAccess.length > 0) {
      // Update existing access
      accessRecord = await base44.asServiceRole.entities.EntityAccess.update(
        existingAccess[0].id,
        {
          access_level,
          permissions,
          granted_by: user.email,
          expires_at: expires_at || null,
          notes: notes || null
        }
      );
      console.log('✅ Updated existing access');
    } else {
      // Create new access
      accessRecord = await base44.asServiceRole.entities.EntityAccess.create({
        entity_type,
        entity_id,
        owner_email: entity.created_by,
        shared_with_email: share_with_email,
        access_level,
        permissions,
        granted_by: user.email,
        is_active: true,
        expires_at: expires_at || null,
        notes: notes || null
      });
      console.log('✅ Created new access record');
    }

    // Send notification email
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: share_with_email,
        subject: `${user.full_name || user.email} shared ${entity_type} with you`,
        body: `
          ${user.full_name || user.email} has shared a ${entity_type} with you.
          
          ${entity_type}: ${entity.title || entity.name || 'Untitled'}
          Access Level: ${access_level}
          
          ${notes ? `Note: ${notes}` : ''}
          
          Log in to CAIO·AI to view.
        `
      });
      console.log('✅ Notification email sent');
    } catch (emailError) {
      console.error('⚠️ Failed to send notification email:', emailError);
    }

    return Response.json({
      success: true,
      message: 'Entity shared successfully',
      access: {
        id: accessRecord.id,
        entity_type,
        entity_id,
        shared_with: share_with_email,
        access_level,
        permissions,
        expires_at: accessRecord.expires_at
      }
    });

  } catch (error) {
    console.error('❌ Error sharing entity:', error);
    return Response.json({ 
      error: 'Failed to share entity',
      details: error.message
    }, { status: 500 });
  }
});