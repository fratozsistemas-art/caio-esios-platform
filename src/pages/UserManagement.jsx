import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, Shield, Search, Settings, 
  CheckCircle, Crown, Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePermission, useUserRole } from "@/components/utils/usePermission";
import { toast } from "sonner";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAssignRoleDialog, setShowAssignRoleDialog] = useState(false);
  const [showInitRolesDialog, setShowInitRolesDialog] = useState(false);

  // Check if current user has admin permissions
  const { hasPermission: canManageUsers, loading: permissionLoading } = usePermission('users', 'assign_roles');
  const { role: currentUserRole } = useUserRole();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: canManageUsers,
    initialData: [],
  });

  const { data: userRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['userRoles'],
    queryFn: () => base44.entities.UserRole.list(),
    enabled: canManageUsers,
    initialData: [],
  });

  const { data: roles = [], isLoading: roleDefsLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list(),
    enabled: canManageUsers,
    initialData: [],
  });

  const initRolesMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('initializeDefaultRoles');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('✅ Default roles initialized successfully!');
      setShowInitRolesDialog(false);
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`);
    }
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userEmail, roleName }) => {
      // Check if user already has a role
      const existing = userRoles.find(ur => ur.user_email === userEmail && ur.is_active);
      
      if (existing) {
        return await base44.entities.UserRole.update(existing.id, {
          role_name: roleName,
          assigned_by: (await base44.auth.me()).email
        });
      } else {
        return await base44.entities.UserRole.create({
          user_email: userEmail,
          role_name: roleName,
          assigned_by: (await base44.auth.me()).email,
          is_active: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      toast.success('✅ Role assigned successfully!');
      setShowAssignRoleDialog(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`);
    }
  });

  const roleColors = {
    admin: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
    editor: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
    analyst: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
    contributor: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    viewer: { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" }
  };

  const getUserRole = (userEmail) => {
    const userRole = userRoles.find(ur => ur.user_email === userEmail && ur.is_active);
    return userRole?.role_name || 'viewer';
  };

  const getRoleDisplayName = (roleName) => {
    const role = roles.find(r => r.name === roleName);
    return role?.display_name || roleName;
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (permissionLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="p-6 md:p-8">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400">
              You don't have permission to access user management.
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Current role: {currentUserRole?.display_name || 'Unknown'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-blue-400" />
            User Management
          </h1>
          <p className="text-slate-400">
            Manage users and assign roles
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowInitRolesDialog(true)}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Initialize Roles
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Admins</p>
                <p className="text-3xl font-bold text-red-400">
                  {users.filter(u => u.role === 'admin' || getUserRole(u.email) === 'admin').length}
                </p>
              </div>
              <Crown className="w-10 h-10 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Roles Defined</p>
                <p className="text-3xl font-bold text-purple-400">{roles.length}</p>
              </div>
              <Shield className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Active Roles</p>
                <p className="text-3xl font-bold text-green-400">
                  {userRoles.filter(ur => ur.is_active).length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <AnimatePresence>
              {filteredUsers.map((user, idx) => {
                const userRoleName = getUserRole(user.email);
                const roleColor = roleColors[userRoleName] || roleColors.viewer;
                const isBuiltInAdmin = user.role === 'admin';

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium">{user.full_name || 'Unnamed User'}</h4>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isBuiltInAdmin && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Built-in Admin
                            </Badge>
                          )}
                          <Badge className={`${roleColor.bg} ${roleColor.text} border ${roleColor.border}`}>
                            {getRoleDisplayName(userRoleName)}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowAssignRoleDialog(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Assign Role
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Initialize Roles Dialog */}
      <Dialog open={showInitRolesDialog} onOpenChange={setShowInitRolesDialog}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Initialize Default Roles</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-300">
              This will create or update the following default roles:
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• <strong className="text-white">Administrator</strong> - Full system access</li>
              <li>• <strong className="text-white">Editor</strong> - Create and edit content</li>
              <li>• <strong className="text-white">Analyst</strong> - Run analyses, access AI</li>
              <li>• <strong className="text-white">Contributor</strong> - Contribute content</li>
              <li>• <strong className="text-white">Viewer</strong> - Read-only access</li>
            </ul>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowInitRolesDialog(false)}
                className="border-white/20 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => initRolesMutation.mutate()}
                disabled={initRolesMutation.isPending}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {initRolesMutation.isPending ? 'Initializing...' : 'Initialize Roles'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={showAssignRoleDialog} onOpenChange={setShowAssignRoleDialog}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Assign Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">User</p>
                <p className="text-white font-medium">{selectedUser.full_name}</p>
                <p className="text-sm text-slate-400">{selectedUser.email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-2">Select Role</p>
                <div className="space-y-2">
                  {roles.filter(r => r.is_active).map(role => (
                    <button
                      key={role.id}
                      onClick={() => assignRoleMutation.mutate({
                        userEmail: selectedUser.email,
                        roleName: role.name
                      })}
                      disabled={assignRoleMutation.isPending}
                      className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{role.display_name}</p>
                          <p className="text-sm text-slate-400">{role.description}</p>
                        </div>
                        {getUserRole(selectedUser.email) === role.name && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}