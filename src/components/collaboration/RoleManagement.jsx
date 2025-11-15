import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Users, Plus, Loader2, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function RoleManagement() {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("viewer");
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  // Fetch user roles
  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ['userRoles'],
    queryFn: () => base44.entities.UserRole.filter({ is_active: true })
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      const response = await base44.functions.invoke('assignUserRole', {
        target_user_email: email,
        role_name: role
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      toast.success('Role assigned successfully');
      setNewUserEmail("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to assign role');
    }
  });

  const handleAssignRole = () => {
    if (!newUserEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    assignRoleMutation.mutate({
      email: newUserEmail.trim(),
      role: selectedRole
    });
  };

  const getRoleBadgeColor = (roleName) => {
    const colors = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      editor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      analyst: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      viewer: 'bg-green-500/20 text-green-400 border-green-500/30',
      contributor: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return colors[roleName] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Add New User */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" />
            Assign Role to User
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="user@company.com"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.display_name || role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAssignRole}
              disabled={assignRoleMutation.isPending || !newUserEmail.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {assignRoleMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Assign'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Role Assignments */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Current Role Assignments
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {userRoles.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : userRoles.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No role assignments yet
            </div>
          ) : (
            <div className="space-y-3">
              {userRoles.map((userRole, idx) => (
                <motion.div
                  key={userRole.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {userRole.user_email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium">{userRole.user_email}</div>
                      <div className="text-xs text-slate-400">
                        Assigned by {userRole.assigned_by || 'System'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getRoleBadgeColor(userRole.role_name)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {userRole.role_name}
                    </Badge>
                    {userRole.expires_at && (
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                        Expires {new Date(userRole.expires_at).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Roles Info */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Available Roles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map(role => (
              <div key={role.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{role.display_name || role.name}</h4>
                  <Badge className={getRoleBadgeColor(role.name)}>
                    {role.name}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{role.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}