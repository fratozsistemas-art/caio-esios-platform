import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Initialize default roles (Admin, Editor, Analyst, Viewer, Contributor)
 * Should be called once during app setup
 */
Deno.serve(async (req) => {
  console.log('🎭 [Initialize Roles] Function started');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can initialize roles
    if (user.role !== 'admin') {
      return Response.json({ 
        error: 'Only administrators can initialize roles' 
      }, { status: 403 });
    }

    console.log('✅ Admin authenticated:', user.email);

    const defaultRoles = [
      {
        name: 'admin',
        display_name: 'Administrator',
        description: 'Full system access with user management capabilities',
        permissions: {
          strategies: { create: true, read: true, update: true, delete: true, share: true },
          analyses: { create: true, read: true, update: true, delete: true, share: true },
          knowledge_sources: { create: true, read: true, update: true, delete: true, share: true },
          workspaces: { create: true, read: true, update: true, delete: true, share: true },
          tsi_projects: { create: true, read: true, update: true, delete: true, share: true },
          users: { create: true, read: true, update: true, delete: true, assign_roles: true },
          chat: { access: true, export: true },
          quick_actions: { access: true, create_custom: true },
          file_analyzer: { access: true, upload: true },
          knowledge_graph: { access: true, build: true }
        },
        is_custom: false,
        is_active: true
      },
      {
        name: 'editor',
        display_name: 'Editor',
        description: 'Can create and edit content, manage knowledge base',
        permissions: {
          strategies: { create: true, read: true, update: true, delete: false, share: true },
          analyses: { create: true, read: true, update: true, delete: false, share: true },
          knowledge_sources: { create: true, read: true, update: true, delete: false, share: true },
          workspaces: { create: true, read: true, update: true, delete: false, share: true },
          tsi_projects: { create: true, read: true, update: true, delete: false, share: true },
          users: { create: false, read: true, update: false, delete: false, assign_roles: false },
          chat: { access: true, export: true },
          quick_actions: { access: true, create_custom: true },
          file_analyzer: { access: true, upload: true },
          knowledge_graph: { access: true, build: false }
        },
        is_custom: false,
        is_active: true
      },
      {
        name: 'analyst',
        display_name: 'Analyst',
        description: 'Can run analyses, access AI features, view all content',
        permissions: {
          strategies: { create: true, read: true, update: false, delete: false, share: false },
          analyses: { create: true, read: true, update: true, delete: false, share: false },
          knowledge_sources: { create: false, read: true, update: false, delete: false, share: false },
          workspaces: { create: true, read: true, update: false, delete: false, share: false },
          tsi_projects: { create: true, read: true, update: true, delete: false, share: false },
          users: { create: false, read: true, update: false, delete: false, assign_roles: false },
          chat: { access: true, export: true },
          quick_actions: { access: true, create_custom: false },
          file_analyzer: { access: true, upload: true },
          knowledge_graph: { access: true, build: false }
        },
        is_custom: false,
        is_active: true
      },
      {
        name: 'contributor',
        display_name: 'Contributor',
        description: 'Can contribute content and upload files',
        permissions: {
          strategies: { create: true, read: true, update: false, delete: false, share: false },
          analyses: { create: false, read: true, update: false, delete: false, share: false },
          knowledge_sources: { create: true, read: true, update: false, delete: false, share: false },
          workspaces: { create: false, read: true, update: false, delete: false, share: false },
          tsi_projects: { create: false, read: true, update: false, delete: false, share: false },
          users: { create: false, read: false, update: false, delete: false, assign_roles: false },
          chat: { access: true, export: false },
          quick_actions: { access: true, create_custom: false },
          file_analyzer: { access: true, upload: true },
          knowledge_graph: { access: true, build: false }
        },
        is_custom: false,
        is_active: true
      },
      {
        name: 'viewer',
        display_name: 'Viewer',
        description: 'Read-only access to shared content',
        permissions: {
          strategies: { create: false, read: true, update: false, delete: false, share: false },
          analyses: { create: false, read: true, update: false, delete: false, share: false },
          knowledge_sources: { create: false, read: true, update: false, delete: false, share: false },
          workspaces: { create: false, read: true, update: false, delete: false, share: false },
          tsi_projects: { create: false, read: true, update: false, delete: false, share: false },
          users: { create: false, read: false, update: false, delete: false, assign_roles: false },
          chat: { access: true, export: false },
          quick_actions: { access: true, create_custom: false },
          file_analyzer: { access: false, upload: false },
          knowledge_graph: { access: true, build: false }
        },
        is_custom: false,
        is_active: true
      }
    ];

    const createdRoles = [];
    const existingRoles = [];

    for (const roleData of defaultRoles) {
      // Check if role already exists
      const existing = await base44.asServiceRole.entities.Role.filter({
        name: roleData.name
      });

      if (existing && existing.length > 0) {
        console.log(`⏭️ Role already exists: ${roleData.name}`);
        existingRoles.push(roleData.name);
        
        // Update existing role with latest permissions
        await base44.asServiceRole.entities.Role.update(existing[0].id, roleData);
        console.log(`✅ Updated role: ${roleData.name}`);
      } else {
        const role = await base44.asServiceRole.entities.Role.create(roleData);
        createdRoles.push(role);
        console.log(`✅ Created role: ${roleData.name}`);
      }
    }

    return Response.json({
      success: true,
      message: 'Default roles initialized successfully',
      created: createdRoles.map(r => r.name),
      existing: existingRoles,
      total: defaultRoles.length
    });

  } catch (error) {
    console.error('❌ Error initializing roles:', error);
    return Response.json({ 
      error: 'Failed to initialize roles',
      details: error.message
    }, { status: 500 });
  }
});