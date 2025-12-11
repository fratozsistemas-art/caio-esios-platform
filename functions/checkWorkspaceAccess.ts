import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Checks if a user has access to a workspace and returns their permissions
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id, required_permission } = await req.json();

    if (!workspace_id) {
      return Response.json({ error: 'workspace_id is required' }, { status: 400 });
    }

    // Get workspace
    const workspace = await base44.entities.Workspace.get(workspace_id);
    
    if (!workspace) {
      return Response.json({ 
        has_access: false, 
        error: 'Workspace not found' 
      }, { status: 404 });
    }

    // Admin users always have access
    if (user.role === 'admin') {
      return Response.json({
        has_access: true,
        access_level: 'owner',
        permissions: {
          can_edit_workspace: true,
          can_manage_members: true,
          can_create_strategies: true,
          can_edit_strategies: true,
          can_delete_strategies: true,
          can_create_analyses: true,
          can_view_knowledge_graph: true,
          can_edit_knowledge_graph: true,
          can_export_data: true,
          can_share_externally: true
        },
        is_owner: true
      });
    }

    // Check if user is the creator
    if (workspace.created_by === user.email) {
      return Response.json({
        has_access: true,
        access_level: 'owner',
        permissions: {
          can_edit_workspace: true,
          can_manage_members: true,
          can_create_strategies: true,
          can_edit_strategies: true,
          can_delete_strategies: true,
          can_create_analyses: true,
          can_view_knowledge_graph: true,
          can_edit_knowledge_graph: true,
          can_export_data: true,
          can_share_externally: true
        },
        is_owner: true
      });
    }

    // Check WorkspaceAccess
    const accessRecords = await base44.entities.WorkspaceAccess.filter({
      workspace_id,
      user_email: user.email,
      is_active: true,
      invitation_status: 'accepted'
    });

    if (accessRecords.length === 0) {
      return Response.json({
        has_access: false,
        error: 'No access to this workspace'
      }, { status: 403 });
    }

    const access = accessRecords[0];

    // Check if access expired
    if (access.expires_at && new Date(access.expires_at) < new Date()) {
      return Response.json({
        has_access: false,
        error: 'Access expired'
      }, { status: 403 });
    }

    // Check specific permission if requested
    if (required_permission) {
      const hasPermission = access.permissions?.[required_permission] === true;
      return Response.json({
        has_access: hasPermission,
        access_level: access.access_level,
        permissions: access.permissions,
        is_owner: false,
        required_permission_granted: hasPermission
      });
    }

    return Response.json({
      has_access: true,
      access_level: access.access_level,
      permissions: access.permissions,
      is_owner: false,
      access_record: access
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});