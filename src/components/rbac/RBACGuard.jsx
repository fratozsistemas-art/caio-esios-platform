import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export default function RBACGuard({ 
  entity, 
  action, 
  children, 
  fallback = null,
  showAlert = true 
}) {
  const [allowed, setAllowed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await base44.functions.invoke('checkPermission', {
          entity_name: entity,
          action: action
        });

        if (response.data.allowed) {
          setAllowed(true);
        } else {
          setAllowed(false);
        }
      } catch (error) {
        console.error('Permission check failed:', error);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [entity, action]);

  if (loading) {
    return null;
  }

  if (!allowed) {
    if (showAlert) {
      return (
        <Alert className="bg-red-500/10 border-red-500/30">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-400">
            You don't have permission to {action} {entity}
          </AlertDescription>
        </Alert>
      );
    }
    return fallback;
  }

  return <>{children}</>;
}