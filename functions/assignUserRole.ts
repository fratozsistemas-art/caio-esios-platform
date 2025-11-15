import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      const userRoles = await base44.entities.UserRole.filter({
        user_email: user.email,
        is_active: true
      });
      
      if (!userRoles || userRoles.length === 0 || userRoles[0].role_name !== 'admin') {
        return Response.json({ 
          error: 'Only admins can assign roles' 
        }, { status: 403 });
      }
    }

    const { target_user_email, role_name, expires_at } = await req.json();

    if (!target_user_email || !role_name) {
      return Response.json({ 
        error: 'target_user_email and role_name are required' 
      }, { status: 400 });
    }

    // Validate role exists
    const roles = await base44.entities.Role.filter({ name: role_name });
    if (!roles || roles.length === 0) {
      return Response.json({ 
        error: 'Role not found' 
      }, { status: 404 });
    }

    // Check if target user exists
    const targetUsers = await base44.asServiceRole.entities.User.filter({ 
      email: target_user_email 
    });
    
    if (!targetUsers || targetUsers.length === 0) {
      return Response.json({ 
        error: 'Target user not found' 
      }, { status: 404 });
    }

    // Check if user already has this role
    const existingRoles = await base44.entities.UserRole.filter({
      user_email: target_user_email,
      is_active: true
    });

    if (existingRoles && existingRoles.length > 0) {
      // Deactivate old role
      for (const oldRole of existingRoles) {
        await base44.entities.UserRole.update(oldRole.id, {
          is_active: false
        });
      }
    }

    // Create new role assignment
    const newRoleAssignment = await base44.entities.UserRole.create({
      user_email: target_user_email,
      role_name,
      assigned_by: user.email,
      is_active: true,
      expires_at: expires_at || null
    });

    // Send notification
    try {
      await base44.integrations.Core.SendEmail({
        to: target_user_email,
        subject: `Your role has been updated`,
        body: `Your role has been updated to "${role_name}" by ${user.full_name || user.email}.`
      });
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
    }

    return Response.json({
      success: true,
      role_assignment: newRoleAssignment
    });

  } catch (error) {
    console.error('Assign role error:', error);
    return Response.json({ 
      error: 'Failed to assign role',
      details: error.message
    }, { status: 500 });
  }
});