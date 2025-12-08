import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function usePermissions(entity, action) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await base44.functions.invoke('checkPermission', {
          entity_name: entity,
          action: action
        });

        setAllowed(response.data.allowed || false);
        setPermissions(response.data.permissions || null);
        setRole(response.data.role || null);
      } catch (error) {
        console.error('Permission check failed:', error);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    if (entity && action) {
      checkPermission();
    }
  }, [entity, action]);

  return { allowed, loading, permissions, role };
}