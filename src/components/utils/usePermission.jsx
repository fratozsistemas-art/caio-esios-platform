import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook to check user permissions
 * Usage: const { hasPermission, loading, role } = usePermission('strategies', 'create');
 */
export function usePermission(resource, action, entityId = null) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkPermission() {
      try {
        setLoading(true);
        setError(null);

        const { data } = await base44.functions.invoke('checkPermission', {
          resource,
          action,
          entity_id: entityId
        });

        setHasPermission(data.hasPermission || false);
        setRole(data.role || null);

        if (!data.hasPermission && data.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error('Permission check failed:', err);
        setHasPermission(false);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (resource && action) {
      checkPermission();
    }
  }, [resource, action, entityId]);

  return { hasPermission, loading, role, error };
}

/**
 * Hook to get current user's role and all permissions
 */
export function useUserRole() {
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      try {
        setLoading(true);
        const user = await base44.auth.me();

        if (!user) {
          setRole(null);
          setPermissions(null);
          return;
        }

        // Check for built-in admin
        if (user.role === 'admin') {
          setRole({
            role_name: 'admin',
            display_name: 'Administrator',
            is_built_in_admin: true
          });
          // Admin has all permissions
          setPermissions('all');
          return;
        }

        // Fetch user's assigned role
        const userRoles = await base44.entities.UserRole.filter({
          user_email: user.email,
          is_active: true
        });

        if (userRoles && userRoles.length > 0) {
          const userRole = userRoles[0];
          
          // Fetch role definition
          const roles = await base44.entities.Role.filter({
            name: userRole.role_name,
            is_active: true
          });

          if (roles && roles.length > 0) {
            const roleDefinition = roles[0];
            setRole({
              role_name: userRole.role_name,
              display_name: roleDefinition.display_name
            });
            setPermissions(roleDefinition.permissions);
          }
        } else {
          // Default viewer role
          setRole({
            role_name: 'viewer',
            display_name: 'Viewer'
          });
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, []);

  return { role, permissions, loading };
}

/**
 * Helper function to check permission without hook
 */
export async function checkPermission(resource, action, entityId = null) {
  try {
    const { data } = await base44.functions.invoke('checkPermission', {
      resource,
      action,
      entity_id: entityId
    });

    return {
      hasPermission: data.hasPermission || false,
      role: data.role || null,
      error: data.error || null
    };
  } catch (error) {
    console.error('Permission check failed:', error);
    return {
      hasPermission: false,
      role: null,
      error: error.message
    };
  }
}