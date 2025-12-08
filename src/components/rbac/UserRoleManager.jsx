import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Trash2, Search, Shield } from "lucide-react";
import { toast } from "sonner";

export default function UserRoleManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("analyst");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ['userRoles'],
    queryFn: () => base44.entities.UserRole.list()
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      const currentUser = await base44.auth.me();
      const existing = await base44.entities.UserRole.filter({
        user_email: email,
        is_active: true
      });

      if (existing.length > 0) {
        return base44.entities.UserRole.update(existing[0].id, {
          role_name: role,
          assigned_by: currentUser.email
        });
      } else {
        return base44.entities.UserRole.create({
          user_email: email,
          role_name: role,
          assigned_by: currentUser.email,
          is_active: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userRoles']);
      toast.success('Role assigned successfully');
      setIsDialogOpen(false);
      setNewUserEmail("");
    }
  });

  const revokeRoleMutation = useMutation({
    mutationFn: (roleId) => base44.entities.UserRole.delete(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['userRoles']);
      toast.success('Role revoked');
    }
  });

  const getRoleForUser = (email) => {
    const userRole = userRoles.find(ur => ur.user_email === email && ur.is_active);
    return userRole?.role_name || 'guest';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const role = getRoleForUser(user.email);
    const matchesRole = selectedRole === "all" || role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const roleColors = {
    admin: "bg-red-500/20 text-red-400 border-red-500/30",
    executive: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    analyst: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    guest: "bg-slate-500/20 text-slate-400 border-slate-500/30"
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">User Roles</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#C7A763] hover:bg-[#A8864D]">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Role
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0A1E3A] border-[#C7A763]/30">
                <DialogHeader>
                  <DialogTitle className="text-white">Assign Role to User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">User Email</label>
                    <Input
                      placeholder="user@company.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Role</label>
                    <Select value={newUserRole} onValueChange={setNewUserRole}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
                  <Button
                    onClick={() => assignRoleMutation.mutate({ email: newUserEmail, role: newUserRole })}
                    disabled={!newUserEmail}
                    className="w-full bg-[#C7A763] hover:bg-[#A8864D]"
                  >
                    Assign Role
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filteredUsers.map((user) => {
              const role = getRoleForUser(user.email);
              const userRoleRecord = userRoles.find(ur => ur.user_email === user.email && ur.is_active);

              return (
                <Card key={user.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C7A763] to-[#E3C37B] flex items-center justify-center text-white font-bold">
                          {user.full_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.full_name || user.email}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                          {userRoleRecord?.assigned_by && (
                            <p className="text-xs text-slate-500">
                              Assigned by {userRoleRecord.assigned_by}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={roleColors[role]}>
                          <Shield className="w-3 h-3 mr-1" />
                          {role}
                        </Badge>
                        {userRoleRecord && role !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeRoleMutation.mutate(userRoleRecord.id)}
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}