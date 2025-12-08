import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const defaultPermissions = [
  // Admin - Full access to everything
  {
    role_name: 'admin',
    entity_name: 'CompanyProfile',
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: true,
    can_export: true
  },
  {
    role_name: 'admin',
    entity_name: 'CVMCompany',
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: true,
    can_export: true
  },
  {
    role_name: 'admin',
    entity_name: 'Analysis',
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: true,
    can_export: true
  },
  {
    role_name: 'admin',
    entity_name: 'Strategy',
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: true,
    can_export: true
  },

  // Executive - Read all, create/update limited, no delete
  {
    role_name: 'executive',
    entity_name: 'CompanyProfile',
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: false,
    can_export: true
  },
  {
    role_name: 'executive',
    entity_name: 'CVMCompany',
    can_read: true,
    can_create: false,
    can_update: false,
    can_delete: false,
    can_export: true
  },
  {
    role_name: 'executive',
    entity_name: 'Analysis',
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: false,
    can_export: true
  },
  {
    role_name: 'executive',
    entity_name: 'Strategy',
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: false,
    can_export: true
  },

  // Analyst - Read/create/update own, no delete
  {
    role_name: 'analyst',
    entity_name: 'CompanyProfile',
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: false,
    can_export: true,
    query_filters: { created_by: '{{user.email}}' }
  },
  {
    role_name: 'analyst',
    entity_name: 'CVMCompany',
    can_read: true,
    can_create: false,
    can_update: false,
    can_delete: false,
    can_export: false
  },
  {
    role_name: 'analyst',
    entity_name: 'Analysis',
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: false,
    can_export: true,
    query_filters: { created_by: '{{user.email}}' }
  },
  {
    role_name: 'analyst',
    entity_name: 'Strategy',
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: false,
    can_export: false,
    query_filters: { created_by: '{{user.email}}' }
  },

  // Guest - Read only, limited entities
  {
    role_name: 'guest',
    entity_name: 'CompanyProfile',
    can_read: true,
    can_create: false,
    can_update: false,
    can_delete: false,
    can_export: false,
    field_restrictions: {
      hidden_fields: ['cvm_data', 'linkedin_data']
    }
  },
  {
    role_name: 'guest',
    entity_name: 'CVMCompany',
    can_read: true,
    can_create: false,
    can_update: false,
    can_delete: false,
    can_export: false
  },
  {
    role_name: 'guest',
    entity_name: 'Analysis',
    can_read: false,
    can_create: false,
    can_update: false,
    can_delete: false,
    can_export: false
  },
  {
    role_name: 'guest',
    entity_name: 'Strategy',
    can_read: false,
    can_create: false,
    can_update: false,
    can_delete: false,
    can_export: false
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    let created = 0;
    let updated = 0;

    for (const permData of defaultPermissions) {
      const existing = await base44.asServiceRole.entities.Permission.filter({
        role_name: permData.role_name,
        entity_name: permData.entity_name
      });

      if (existing && existing.length > 0) {
        await base44.asServiceRole.entities.Permission.update(existing[0].id, permData);
        updated++;
      } else {
        await base44.asServiceRole.entities.Permission.create(permData);
        created++;
      }
    }

    return Response.json({
      success: true,
      message: `RBAC permissions seeded: ${created} created, ${updated} updated`,
      created,
      updated
    });

  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});