import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Edit, Save, Plus } from "lucide-react";
import { toast } from "sonner";

export default function PermissionManager() {
  const [selectedRole, setSelectedRole] = useState("executive");
  const [editingPermission, setEditingPermission] = useState(null);
  const queryClient = useQueryClient();

  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => base44.entities.Permission.list()
  });

  const updatePermissionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Permission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['permissions']);
      toast.success('Permission updated');
      setEditingPermission(null);
    }
  });

  const createPermissionMutation = useMutation({
    mutationFn: (data) => base44.entities.Permission.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['permissions']);
      toast.success('Permission created');
    }
  });

  const rolePermissions = permissions.filter(p => p.role_name === selectedRole);

  const entities = [
    'CompanyProfile', 'CVMCompany', 'Analysis', 'Strategy', 
    'KnowledgeItem', 'VectorDecision', 'AgentWorkflow', 'QuickAction'
  ];

  const actions = ['read', 'create', 'update', 'delete', 'export'];

  const togglePermission = (permission, action) => {
    const fieldName = `can_${action}`;
    updatePermissionMutation.mutate({
      id: permission.id,
      data: {
        ...permission,
        [fieldName]: !permission[fieldName]
      }
    });
  };

  const addEntityPermission = (entityName) => {
    createPermissionMutation.mutate({
      role_name: selectedRole,
      entity_name: entityName,
      can_read: false,
      can_create: false,
      can_update: false,
      can_delete: false,
      can_export: false
    });
  };

  const missingEntities = entities.filter(
    entity => !rolePermissions.some(p => p.entity_name === entity)
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Permission Matrix</CardTitle>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rolePermissions.map((permission) => (
              <Card key={permission.id} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">{permission.entity_name}</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {actions.map((action) => {
                      const fieldName = `can_${action}`;
                      const value = permission[fieldName];
                      return (
                        <div key={action} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-sm text-slate-300 capitalize">{action}</span>
                          <Switch
                            checked={value}
                            onCheckedChange={() => togglePermission(permission, action)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            {missingEntities.length > 0 && (
              <Card className="bg-[#C7A763]/10 border-[#C7A763]/30">
                <CardContent className="p-4">
                  <p className="text-sm text-slate-300 mb-3">Add permissions for:</p>
                  <div className="flex flex-wrap gap-2">
                    {missingEntities.map((entity) => (
                      <Button
                        key={entity}
                        variant="outline"
                        size="sm"
                        onClick={() => addEntityPermission(entity)}
                        className="border-[#C7A763]/30 text-[#C7A763] hover:bg-[#C7A763]/10"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {entity}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}