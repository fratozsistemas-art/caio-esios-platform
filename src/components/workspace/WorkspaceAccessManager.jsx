import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Users, Plus, Mail, Shield, Trash2, Clock, CheckCircle, 
  XCircle, AlertCircle, Eye, Edit, UserPlus, Link as LinkIcon 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ACCESS_LEVELS = {
  owner: {
    label: 'Owner',
    color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    permissions: {
      can_edit_workspace: true,
      can_manage_members: true,
      can_create_strategies: true,
      can_edit_strategies: true,
      can_delete_strategies: true,
      can_create_analyses: true,
      can_view_knowledge_graph: true,
      can_edit_knowledge_graph: true,
      can_export_data: true,
      can_share_externally: true
    }
  },
  admin: {
    label: 'Admin',
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    permissions: {
      can_edit_workspace: true,
      can_manage_members: true,
      can_create_strategies: true,
      can_edit_strategies: true,
      can_delete_strategies: true,
      can_create_analyses: true,
      can_view_knowledge_graph: true,
      can_edit_knowledge_graph: true,
      can_export_data: true,
      can_share_externally: false
    }
  },
  editor: {
    label: 'Editor',
    color: 'text-green-400 bg-green-500/20 border-green-500/30',
    permissions: {
      can_edit_workspace: false,
      can_manage_members: false,
      can_create_strategies: true,
      can_edit_strategies: true,
      can_delete_strategies: false,
      can_create_analyses: true,
      can_view_knowledge_graph: true,
      can_edit_knowledge_graph: true,
      can_export_data: true,
      can_share_externally: false
    }
  },
  contributor: {
    label: 'Contributor',
    color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    permissions: {
      can_edit_workspace: false,
      can_manage_members: false,
      can_create_strategies: true,
      can_edit_strategies: false,
      can_delete_strategies: false,
      can_create_analyses: true,
      can_view_knowledge_graph: true,
      can_edit_knowledge_graph: false,
      can_export_data: false,
      can_share_externally: false
    }
  },
  viewer: {
    label: 'Viewer',
    color: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
    permissions: {
      can_edit_workspace: false,
      can_manage_members: false,
      can_create_strategies: false,
      can_edit_strategies: false,
      can_delete_strategies: false,
      can_create_analyses: false,
      can_view_knowledge_graph: true,
      can_edit_knowledge_graph: false,
      can_export_data: false,
      can_share_externally: false
    }
  },
  external_viewer: {
    label: 'External Viewer',
    color: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    permissions: {
      can_edit_workspace: false,
      can_manage_members: false,
      can_create_strategies: false,
      can_edit_strategies: false,
      can_delete_strategies: false,
      can_create_analyses: false,
      can_view_knowledge_graph: true,
      can_edit_knowledge_graph: false,
      can_export_data: false,
      can_share_externally: false
    }
  }
};

export default function WorkspaceAccessManager({ workspaceId, currentUserAccess }) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    user_email: '',
    access_level: 'viewer',
    invitation_message: '',
    expires_in_days: null
  });
  const [customPermissions, setCustomPermissions] = useState(false);
  const queryClient = useQueryClient();

  const { data: accessList = [], isLoading } = useQuery({
    queryKey: ['workspace_access', workspaceId],
    queryFn: () => base44.entities.WorkspaceAccess.filter({ 
      workspace_id: workspaceId,
      is_active: true 
    }),
    enabled: !!workspaceId
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const canManageMembers = currentUserAccess?.permissions?.can_manage_members || 
                          currentUser?.role === 'admin';

  const inviteMutation = useMutation({
    mutationFn: async (data) => {
      const permissions = customPermissions 
        ? data.custom_permissions 
        : ACCESS_LEVELS[data.access_level].permissions;

      const expiresAt = data.expires_in_days 
        ? new Date(Date.now() + data.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      return base44.entities.WorkspaceAccess.create({
        workspace_id: workspaceId,
        user_email: data.user_email,
        access_level: data.access_level,
        permissions,
        granted_by: currentUser.email,
        granted_at: new Date().toISOString(),
        expires_at: expiresAt,
        invitation_status: 'pending',
        invitation_message: data.invitation_message,
        is_active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workspace_access', workspaceId]);
      setInviteDialogOpen(false);
      setInviteForm({
        user_email: '',
        access_level: 'viewer',
        invitation_message: '',
        expires_in_days: null
      });
      toast.success('Invitation sent successfully');
    },
    onError: (error) => {
      toast.error('Failed to send invitation: ' + error.message);
    }
  });

  const revokeAccessMutation = useMutation({
    mutationFn: (accessId) => 
      base44.entities.WorkspaceAccess.update(accessId, {
        is_active: false,
        invitation_status: 'revoked'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspace_access', workspaceId]);
      toast.success('Access revoked');
    }
  });

  const updateAccessLevelMutation = useMutation({
    mutationFn: ({ accessId, newLevel }) => 
      base44.entities.WorkspaceAccess.update(accessId, {
        access_level: newLevel,
        permissions: ACCESS_LEVELS[newLevel].permissions
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspace_access', workspaceId]);
      toast.success('Access level updated');
    }
  });

  const handleInvite = () => {
    if (!inviteForm.user_email) {
      toast.error('Email is required');
      return;
    }
    inviteMutation.mutate(inviteForm);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'declined': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'revoked': return <AlertCircle className="w-4 h-4 text-slate-400" />;
      default: return null;
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Workspace Access Control
          </CardTitle>
          {canManageMembers && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0A2540] border-[#00D4FF]/20 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Invite to Workspace</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Email Address</Label>
                    <Input
                      type="email"
                      value={inviteForm.user_email}
                      onChange={(e) => setInviteForm({ ...inviteForm, user_email: e.target.value })}
                      placeholder="user@example.com"
                      className="bg-white/5 border-white/10 text-white mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Access Level</Label>
                    <Select
                      value={inviteForm.access_level}
                      onValueChange={(value) => setInviteForm({ ...inviteForm, access_level: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        {Object.entries(ACCESS_LEVELS).map(([key, config]) => (
                          <SelectItem key={key} value={key} className="text-white">
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400 mt-1">
                      {ACCESS_LEVELS[inviteForm.access_level]?.permissions.can_edit_strategies 
                        ? 'Can create and edit content' 
                        : 'View-only access'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-slate-300">Invitation Message (Optional)</Label>
                    <Textarea
                      value={inviteForm.invitation_message}
                      onChange={(e) => setInviteForm({ ...inviteForm, invitation_message: e.target.value })}
                      placeholder="Add a personal message..."
                      className="bg-white/5 border-white/10 text-white mt-2"
                      rows={3}
                    />
                  </div>

                  {inviteForm.access_level === 'external_viewer' && (
                    <div>
                      <Label className="text-slate-300">Access Duration (Days)</Label>
                      <Input
                        type="number"
                        value={inviteForm.expires_in_days || ''}
                        onChange={(e) => setInviteForm({ ...inviteForm, expires_in_days: parseInt(e.target.value) })}
                        placeholder="30"
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Leave empty for permanent access
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleInvite}
                    disabled={inviteMutation.isPending}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-slate-400 text-center py-4">Loading access list...</p>
        ) : accessList.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No members yet. Invite your team to collaborate!</p>
        ) : (
          <div className="space-y-2">
            {accessList.map((access, idx) => {
              const config = ACCESS_LEVELS[access.access_level];
              const isExpired = access.expires_at && new Date(access.expires_at) < new Date();
              
              return (
                <motion.div
                  key={access.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {access.user_email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{access.user_email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={config.color + ' text-xs'}>
                          {config.label}
                        </Badge>
                        {getStatusIcon(access.invitation_status)}
                        {isExpired && (
                          <Badge className="bg-red-500/20 text-red-400 text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canManageMembers && access.access_level !== 'owner' && (
                      <>
                        <Select
                          value={access.access_level}
                          onValueChange={(newLevel) => 
                            updateAccessLevelMutation.mutate({ 
                              accessId: access.id, 
                              newLevel 
                            })
                          }
                        >
                          <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10">
                            {Object.entries(ACCESS_LEVELS)
                              .filter(([key]) => key !== 'owner')
                              .map(([key, config]) => (
                                <SelectItem key={key} value={key} className="text-white">
                                  {config.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => revokeAccessMutation.mutate(access.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Access Statistics */}
        <div className="grid grid-cols-4 gap-3 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {accessList.filter(a => a.invitation_status === 'accepted').length}
            </p>
            <p className="text-xs text-slate-400">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {accessList.filter(a => a.invitation_status === 'pending').length}
            </p>
            <p className="text-xs text-slate-400">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {accessList.filter(a => a.access_level !== 'external_viewer').length}
            </p>
            <p className="text-xs text-slate-400">Internal</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">
              {accessList.filter(a => a.access_level === 'external_viewer').length}
            </p>
            <p className="text-xs text-slate-400">External</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}