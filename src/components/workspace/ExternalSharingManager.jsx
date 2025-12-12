import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { 
  Share2, Plus, Link as LinkIcon, Copy, Eye, Download, MessageSquare,
  Clock, Users, Shield, Trash2, Lock, Mail, QrCode, ExternalLink,
  AlertCircle, CheckCircle, XCircle, Calendar, Hash
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ExternalSharingManager({ workspaceId, canShare }) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [shareForm, setShareForm] = useState({
    resource_type: 'workspace',
    resource_id: null,
    recipient_email: '',
    expires_in_hours: 168,
    max_access_count: null,
    password: '',
    custom_message: '',
    require_email_verification: false,
    permissions: {
      can_view: true,
      can_comment: false,
      can_download: false
    }
  });

  const queryClient = useQueryClient();

  const { data: shareLinks = [], isLoading } = useQuery({
    queryKey: ['external_share_links', workspaceId],
    queryFn: () => base44.entities.ExternalShareLink.filter({ 
      workspace_id: workspaceId 
    }),
    enabled: !!workspaceId
  });

  const { data: accessLogs = [] } = useQuery({
    queryKey: ['external_access_logs', selectedLink?.id],
    queryFn: () => base44.entities.ExternalAccessLog.filter({ 
      share_link_id: selectedLink.id 
    }),
    enabled: !!selectedLink
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result } = await base44.functions.invoke('generateShareLink', data);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(['external_share_links', workspaceId]);
      setCreateDialogOpen(false);
      setShareForm({
        resource_type: 'workspace',
        resource_id: null,
        recipient_email: '',
        expires_in_hours: 168,
        max_access_count: null,
        password: '',
        custom_message: '',
        require_email_verification: false,
        permissions: { can_view: true, can_comment: false, can_download: false }
      });
      
      // Show success with copy option
      navigator.clipboard.writeText(result.share_url);
      toast.success('Share link created and copied to clipboard!');
    },
    onError: (error) => {
      toast.error('Failed to create share link: ' + error.message);
    }
  });

  const revokeLinkMutation = useMutation({
    mutationFn: async (linkId) => {
      const { data } = await base44.functions.invoke('revokeShareLink', {
        share_link_id: linkId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['external_share_links', workspaceId]);
      setSelectedLink(null);
      toast.success('Share link revoked');
    }
  });

  const handleCreateLink = () => {
    createLinkMutation.mutate({
      workspace_id: workspaceId,
      ...shareForm
    });
  };

  const copyToClipboard = (link) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/share/${link.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
  };

  const getStatusBadge = (link) => {
    const now = new Date();
    const expires = new Date(link.expires_at);
    const isExpired = link.expires_at && expires < now;
    const maxReached = link.max_access_count && link.access_count >= link.max_access_count;

    if (!link.is_active) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Revoked</Badge>;
    }
    if (isExpired) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Expired</Badge>;
    }
    if (maxReached) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Max Reached</Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
  };

  if (!canShare) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <Shield className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-300">
            You don't have permission to manage external sharing
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-400" />
              External Sharing
            </CardTitle>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Share Link
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0A2540] border-[#00D4FF]/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">Create External Share Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Resource Type</Label>
                    <Select
                      value={shareForm.resource_type}
                      onValueChange={(value) => setShareForm({ ...shareForm, resource_type: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem value="workspace" className="text-white">Entire Workspace</SelectItem>
                        <SelectItem value="strategy" className="text-white">Specific Strategy</SelectItem>
                        <SelectItem value="analysis" className="text-white">Specific Analysis</SelectItem>
                        <SelectItem value="knowledge_item" className="text-white">Knowledge Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300">Recipient Email (Optional)</Label>
                    <Input
                      type="email"
                      value={shareForm.recipient_email}
                      onChange={(e) => setShareForm({ ...shareForm, recipient_email: e.target.value })}
                      placeholder="user@example.com"
                      className="bg-white/5 border-white/10 text-white mt-2"
                    />
                    <p className="text-xs text-slate-400 mt-1">Leave empty for public link</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Expires In (hours)</Label>
                      <Input
                        type="number"
                        value={shareForm.expires_in_hours}
                        onChange={(e) => setShareForm({ ...shareForm, expires_in_hours: parseInt(e.target.value) })}
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Max Access Count</Label>
                      <Input
                        type="number"
                        value={shareForm.max_access_count || ''}
                        onChange={(e) => setShareForm({ ...shareForm, max_access_count: parseInt(e.target.value) || null })}
                        placeholder="Unlimited"
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Password Protection (Optional)</Label>
                    <Input
                      type="password"
                      value={shareForm.password}
                      onChange={(e) => setShareForm({ ...shareForm, password: e.target.value })}
                      placeholder="Leave empty for no password"
                      className="bg-white/5 border-white/10 text-white mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Custom Message</Label>
                    <Textarea
                      value={shareForm.custom_message}
                      onChange={(e) => setShareForm({ ...shareForm, custom_message: e.target.value })}
                      placeholder="Add a message for recipients..."
                      className="bg-white/5 border-white/10 text-white mt-2"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-300">Permissions</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-slate-400">Can View</Label>
                        <Switch
                          checked={shareForm.permissions.can_view}
                          onCheckedChange={(checked) => 
                            setShareForm({ 
                              ...shareForm, 
                              permissions: { ...shareForm.permissions, can_view: checked }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-slate-400">Can Comment</Label>
                        <Switch
                          checked={shareForm.permissions.can_comment}
                          onCheckedChange={(checked) => 
                            setShareForm({ 
                              ...shareForm, 
                              permissions: { ...shareForm.permissions, can_comment: checked }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-slate-400">Can Download</Label>
                        <Switch
                          checked={shareForm.permissions.can_download}
                          onCheckedChange={(checked) => 
                            setShareForm({ 
                              ...shareForm, 
                              permissions: { ...shareForm.permissions, can_download: checked }
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Require Email Verification</Label>
                    <Switch
                      checked={shareForm.require_email_verification}
                      onCheckedChange={(checked) => 
                        setShareForm({ ...shareForm, require_email_verification: checked })
                      }
                    />
                  </div>

                  <Button
                    onClick={handleCreateLink}
                    disabled={createLinkMutation.isPending}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    {createLinkMutation.isPending ? 'Creating...' : 'Create Share Link'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-slate-400 text-center py-4">Loading share links...</p>
          ) : shareLinks.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No share links created yet</p>
          ) : (
            <div className="space-y-3">
              {shareLinks.map((link, idx) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <LinkIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">
                        {link.resource_type === 'workspace' ? 'Full Workspace' : `${link.resource_type}`}
                      </p>
                      {getStatusBadge(link)}
                      {link.password_protected && <Lock className="w-3 h-3 text-yellow-400" />}
                      {link.require_email_verification && <Mail className="w-3 h-3 text-blue-400" />}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {link.access_count} views
                      </span>
                      {link.max_access_count && (
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          Max: {link.max_access_count}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Expires: {new Date(link.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(link)}
                      className="text-blue-400 hover:text-blue-300 h-8 w-8"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedLink(link)}
                      className="text-slate-400 hover:text-white h-8 w-8"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    {link.is_active && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => revokeLinkMutation.mutate(link.id)}
                        className="text-red-400 hover:text-red-300 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Logs Dialog */}
      {selectedLink && (
        <Dialog open={!!selectedLink} onOpenChange={() => setSelectedLink(null)}>
          <DialogContent className="bg-[#0A2540] border-[#00D4FF]/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Access Logs</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-bold text-white">{selectedLink.access_count}</p>
                  <p className="text-xs text-slate-400">Total Accesses</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-bold text-green-400">
                    {accessLogs.filter(l => l.success).length}
                  </p>
                  <p className="text-xs text-slate-400">Successful</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-bold text-red-400">
                    {accessLogs.filter(l => !l.success).length}
                  </p>
                  <p className="text-xs text-slate-400">Failed</p>
                </div>
              </div>

              <div className="space-y-2">
                {accessLogs.map((log, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <p className="text-sm text-white">
                          {log.accessor_email || 'Anonymous'}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400">
                        {new Date(log.accessed_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-3">
                      <span>IP: {log.accessor_ip}</span>
                      <span>Action: {log.action_performed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}