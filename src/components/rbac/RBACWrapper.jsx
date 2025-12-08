import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const RBACContext = createContext({
  checkPermission: async () => false,
  permissions: {},
  role: null,
  loading: true
});

export function RBACProvider({ children }) {
  const [permissions, setPermissions] = useState({});
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPermissions();
  }, []);

  const loadUserPermissions = async () => {
    try {
      const user = await base44.auth.me();
      
      const userRoles = await base44.entities.UserRole.filter({
        user_email: user.email,
        is_active: true
      });

      const currentRole = userRoles.length > 0 ? userRoles[0].role_name : 'guest';
      setRole(currentRole);

      // Load all permissions for this role
      const rolePermissions = await base44.entities.Permission.filter({
        role_name: currentRole
      });

      const permMap = {};
      rolePermissions.forEach(p => {
        permMap[p.entity_name] = {
          can_read: p.can_read,
          can_create: p.can_create,
          can_update: p.can_update,
          can_delete: p.can_delete,
          can_export: p.can_export
        };
      });

      setPermissions(permMap);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      setRole('guest');
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async (entity, action) => {
    if (role === 'admin') return true;
    
    const entityPerms = permissions[entity];
    if (!entityPerms) return false;
    
    return entityPerms[`can_${action}`] || false;
  };

  return (
    <RBACContext.Provider value={{ checkPermission, permissions, role, loading }}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRBAC() {
  return useContext(RBACContext);
}

// CRUD wrapper with RBAC checks
export const rbacCRUD = {
  async read(entity, query = {}) {
    const response = await base44.functions.invoke('checkPermission', {
      entity_name: entity,
      action: 'read'
    });

    if (!response.data.allowed) {
      throw new Error(`No permission to read ${entity}`);
    }

    return base44.entities[entity].filter(query);
  },

  async create(entity, data) {
    const response = await base44.functions.invoke('checkPermission', {
      entity_name: entity,
      action: 'create'
    });

    if (!response.data.allowed) {
      throw new Error(`No permission to create ${entity}`);
    }

    return base44.entities[entity].create(data);
  },

  async update(entity, id, data) {
    const response = await base44.functions.invoke('checkPermission', {
      entity_name: entity,
      action: 'update'
    });

    if (!response.data.allowed) {
      throw new Error(`No permission to update ${entity}`);
    }

    return base44.entities[entity].update(id, data);
  },

  async delete(entity, id) {
    const response = await base44.functions.invoke('checkPermission', {
      entity_name: entity,
      action: 'delete'
    });

    if (!response.data.allowed) {
      throw new Error(`No permission to delete ${entity}`);
    }

    return base44.entities[entity].delete(id);
  }
};