import React from 'react';
import { usePermission } from '@/components/utils/usePermission';
import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Component to guard content based on permissions
 * Usage: <PermissionGuard resource="strategies" action="create">...</PermissionGuard>
 */
export function PermissionGuard({ 
  resource, 
  action, 
  entityId = null,
  children, 
  fallback = null,
  showMessage = true 
}) {
  const { hasPermission, loading, role, error } = usePermission(resource, action, entityId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-slate-400 text-sm">Checking permissions...</div>
      </div>
    );
  }

  if (!hasPermission) {
    if (fallback) {
      return fallback;
    }

    if (!showMessage) {
      return null;
    }

    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <Lock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Access Restricted
          </h3>
          <p className="text-slate-400 text-sm">
            {error || `You don't have permission to ${action} ${resource}`}
          </p>
          {role && (
            <p className="text-xs text-slate-500 mt-2">
              Current role: {role.display_name}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

/**
 * Button wrapper that disables based on permissions
 */
export function PermissionButton({ 
  resource, 
  action, 
  entityId = null,
  children,
  disabled = false,
  ...props 
}) {
  const { hasPermission, loading } = usePermission(resource, action, entityId);

  return React.cloneElement(children, {
    ...props,
    disabled: disabled || loading || !hasPermission,
    title: !hasPermission ? `Requires permission: ${action} ${resource}` : undefined
  });
}

export default PermissionGuard;