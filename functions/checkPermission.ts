import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Check if user has permission for a specific action
 * Returns permission status and user role information
 */
Deno.serve(async (req) => {
  console.log('🔐 [Check Permission] Function started');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ 
        hasPermission: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { 
      resource,  // e.g., 'strategies', 'analyses', 'users'
      action,    // e.g., 'create', 'read', 'update', 'delete', 'share'
      entity_id  // optional: check access to specific entity
    } = await req.json();

    if (!resource || !action) {
      return Response.json({ 
        hasPermission: false,
        error: 'resource and action are required' 
      }, { status: 400 });
    }

    console.log(`🔍 Checking permission: ${user.email} -> ${action} on ${resource}`);

    // Get user's role assignment
    const userRoles = await base44.asServiceRole.entities.UserRole.filter({
      user_email: user.email,
      is_active: true
    });

    let userRole = null;
    if (userRoles && userRoles.length > 0) {
      userRole = userRoles[0];
      
      // Check if role has expired
      if (userRole.expires_at && new Date(userRole.expires_at) < new Date()) {
        return Response.json({
          hasPermission: false,
          error: 'Role has expired',
          role: null
        });
      }
    }

    // If no role assigned, check if user is built-in admin (from User entity)
    if (!userRole) {
      if (user.role === 'admin') {
        return Response.json({
          hasPermission: true,
          role: {
            role_name: 'admin',
            display_name: 'Administrator',
            is_built_in_admin: true
          },
          message: 'Built-in admin has all permissions'
        });
      } else {
        // Default viewer role for users without explicit role
        userRole = {
          role_name: 'viewer',
          custom_permissions: {}
        };
      }
    }

    // Get role definition
    const roles = await base44.asServiceRole.entities.Role.filter({
      name: userRole.role_name,
      is_active: true
    });

    if (!roles || roles.length === 0) {
      return Response.json({
        hasPermission: false,
        error: 'Role definition not found'
      }, { status: 404 });
    }

    const roleDefinition = roles[0];

    // Check if resource exists in permissions
    if (!roleDefinition.permissions[resource]) {
      return Response.json({
        hasPermission: false,
        error: `Resource '${resource}' not found in permissions`,
        role: {
          role_name: userRole.role_name,
          display_name: roleDefinition.display_name
        }
      });
    }

    // Check if action exists for resource
    if (roleDefinition.permissions[resource][action] === undefined) {
      return Response.json({
        hasPermission: false,
        error: `Action '${action}' not found for resource '${resource}'`,
        role: {
          role_name: userRole.role_name,
          display_name: roleDefinition.display_name
        }
      });
    }

    // Check custom permissions override
    let hasPermission = roleDefinition.permissions[resource][action];
    
    if (userRole.custom_permissions && 
        userRole.custom_permissions[resource] && 
        userRole.custom_permissions[resource][action] !== undefined) {
      hasPermission = userRole.custom_permissions[resource][action];
      console.log(`✨ Custom permission override applied: ${hasPermission}`);
    }

    // If checking specific entity access, verify entity-level permissions
    if (entity_id && hasPermission) {
      const entityAccess = await base44.asServiceRole.entities.EntityAccess.filter({
        entity_id: entity_id,
        is_active: true
      });

      // Check if user is owner
      const entity = await getEntityById(base44, resource, entity_id);
      const isOwner = entity && entity.created_by === user.email;

      if (isOwner) {
        console.log('✅ User is owner of entity');
      } else {
        // Check if user has specific access grant
        const userAccess = entityAccess.find(access => 
          access.shared_with_email === user.email &&
          (!access.expires_at || new Date(access.expires_at) > new Date())
        );

        if (!userAccess) {
          return Response.json({
            hasPermission: false,
            error: 'No access to this specific entity',
            role: {
              role_name: userRole.role_name,
              display_name: roleDefinition.display_name
            }
          });
        }

        // Check entity-level permissions
        const permissionMap = {
          'read': 'can_view',
          'update': 'can_edit',
          'delete': 'can_delete',
          'share': 'can_share'
        };

        const requiredPermission = permissionMap[action];
        if (requiredPermission && !userAccess.permissions[requiredPermission]) {
          return Response.json({
            hasPermission: false,
            error: `Entity access level does not allow '${action}'`,
            access_level: userAccess.access_level,
            role: {
              role_name: userRole.role_name,
              display_name: roleDefinition.display_name
            }
          });
        }

        console.log(`✅ Entity-level access granted: ${userAccess.access_level}`);
      }
    }

    return Response.json({
      hasPermission,
      role: {
        role_name: userRole.role_name,
        display_name: roleDefinition.display_name,
        permissions: roleDefinition.permissions
      },
      message: hasPermission ? 'Permission granted' : 'Permission denied'
    });

  } catch (error) {
    console.error('❌ Error checking permission:', error);
    return Response.json({ 
      hasPermission: false,
      error: 'Permission check failed',
      details: error.message
    }, { status: 500 });
  }
});

// Helper function to get entity by ID
async function getEntityById(base44, resource, entityId) {
  try {
    const entityMap = {
      'strategies': 'Strategy',
      'analyses': 'Analysis',
      'knowledge_sources': 'KnowledgeSource',
      'workspaces': 'Workspace',
      'tsi_projects': 'TSIProject'
    };

    const entityName = entityMap[resource];
    if (!entityName) return null;

    const results = await base44.asServiceRole.entities[entityName].filter({ id: entityId });
    return results && results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error fetching entity:', error);
    return null;
  }
}