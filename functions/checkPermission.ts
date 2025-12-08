import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entity_name, action } = await req.json();

    // Get user's role
    const userRoles = await base44.asServiceRole.entities.UserRole.filter({
      user_email: user.email,
      is_active: true
    });

    if (!userRoles || userRoles.length === 0) {
      // Default to guest role if no role assigned
      const permissions = await base44.asServiceRole.entities.Permission.filter({
        role_name: 'guest',
        entity_name
      });

      if (permissions.length === 0) {
        return Response.json({ 
          allowed: false, 
          reason: 'No permissions found for guest role' 
        });
      }

      const permission = permissions[0];
      const actionField = `can_${action}`;
      
      return Response.json({
        allowed: permission[actionField] || false,
        role: 'guest',
        permissions: permission
      });
    }

    const roleName = userRoles[0].role_name;

    // Admin always has full access
    if (roleName === 'admin') {
      return Response.json({
        allowed: true,
        role: 'admin',
        permissions: {
          can_read: true,
          can_create: true,
          can_update: true,
          can_delete: true,
          can_export: true
        }
      });
    }

    // Check permissions for the role
    const permissions = await base44.asServiceRole.entities.Permission.filter({
      role_name: roleName,
      entity_name
    });

    if (permissions.length === 0) {
      return Response.json({ 
        allowed: false, 
        reason: `No permissions configured for ${roleName} on ${entity_name}` 
      });
    }

    const permission = permissions[0];
    const actionField = `can_${action}`;

    return Response.json({
      allowed: permission[actionField] || false,
      role: roleName,
      permissions: permission
    });

  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});