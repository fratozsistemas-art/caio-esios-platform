import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Video, 
  ListVideo, 
  Activity, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  Edit, 
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkTags, setBulkTags] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiProcessAction, setAiProcessAction] = useState('missing');
  const [aiProcessLimit, setAiProcessLimit] = useState(50);
  
  const queryClient = useQueryClient();

  // Check admin access
  React.useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        setIsAdmin(u.role === 'admin');
      })
      .catch(() => setUser(null));
  }, []);

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const [users, videos, playlists] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.BlogPost.filter({ youtube_video_id: { $exists: true } }),
        base44.entities.VideoPlaylist.list()
      ]);
      return {
        totalUsers: users.length,
        totalVideos: videos.length,
        totalPlaylists: playlists.length
      };
    },
    enabled: isAdmin
  });

  // Fetch videos
  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['admin_videos'],
    queryFn: async () => {
      return await base44.entities.BlogPost.filter({ 
        youtube_video_id: { $exists: true } 
      }, '-updated_date', 100);
    },
    enabled: isAdmin
  });

  // Batch AI processing mutation
  const aiProcessMutation = useMutation({
    mutationFn: async ({ action, limit }) => {
      const { data } = await base44.functions.invoke('batchGenerateVideoAISummaries', { 
        action, 
        limit 
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['admin_videos']);
      toast.success(`AI Processing Complete! Processed: ${data.results.processed}, Failed: ${data.results.failed}`);
      setShowAIDialog(false);
      if (data.results.errors.length > 0) {
        console.error('AI Processing Errors:', data.results.errors);
      }
    },
    onError: (error) => {
      toast.error(`AI Processing Failed: ${error.message}`);
    }
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ videoIds, updates }) => {
      await Promise.all(
        videoIds.map(id => base44.entities.BlogPost.update(id, updates))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin_videos']);
      toast.success(`Successfully updated ${selectedVideos.length} videos`);
      setShowBulkDialog(false);
      setSelectedVideos([]);
      setBulkCategory('');
      setBulkTags('');
      setBulkStatus('');
    },
    onError: (error) => {
      toast.error(`Bulk update failed: ${error.message}`);
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (videoIds) => {
      await Promise.all(
        videoIds.map(id => base44.entities.BlogPost.delete(id))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin_videos']);
      toast.success(`Successfully deleted ${selectedVideos.length} videos`);
      setShowBulkDialog(false);
      setSelectedVideos([]);
    },
    onError: (error) => {
      toast.error(`Bulk delete failed: ${error.message}`);
    }
  });

  const handleBulkAction = (action) => {
    if (selectedVideos.length === 0) {
      toast.error('Please select at least one video');
      return;
    }
    setBulkAction(action);
    setShowBulkDialog(true);
  };

  const executeBulkAction = () => {
    const updates = {};
    
    if (bulkAction === 'category' && bulkCategory) {
      updates.category = bulkCategory;
    } else if (bulkAction === 'addTags' && bulkTags) {
      const newTags = bulkTags.split(',').map(t => t.trim()).filter(Boolean);
      // Merge with existing tags
      const videosToUpdate = videos.filter(v => selectedVideos.includes(v.id));
      videosToUpdate.forEach(video => {
        const existingTags = video.ai_tags || [];
        const mergedTags = [...new Set([...existingTags, ...newTags])];
        base44.entities.BlogPost.update(video.id, { ai_tags: mergedTags });
      });
      toast.success('Tags added successfully');
      setShowBulkDialog(false);
      setSelectedVideos([]);
      return;
    } else if (bulkAction === 'removeTags' && bulkTags) {
      const tagsToRemove = bulkTags.split(',').map(t => t.trim()).filter(Boolean);
      const videosToUpdate = videos.filter(v => selectedVideos.includes(v.id));
      videosToUpdate.forEach(video => {
        const existingTags = video.ai_tags || [];
        const filteredTags = existingTags.filter(tag => !tagsToRemove.includes(tag));
        base44.entities.BlogPost.update(video.id, { ai_tags: filteredTags });
      });
      toast.success('Tags removed successfully');
      setShowBulkDialog(false);
      setSelectedVideos([]);
      return;
    } else if (bulkAction === 'status' && bulkStatus) {
      updates.status = bulkStatus;
    } else if (bulkAction === 'delete') {
      bulkDeleteMutation.mutate(selectedVideos);
      return;
    }

    if (Object.keys(updates).length > 0) {
      bulkUpdateMutation.mutate({ videoIds: selectedVideos, updates });
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedVideos(videos.map(v => v.id));
    } else {
      setSelectedVideos([]);
    }
  };

  const handleVideoSelect = (videoId, checked) => {
    if (checked) {
      setSelectedVideos([...selectedVideos, videoId]);
    } else {
      setSelectedVideos(selectedVideos.filter(id => id !== videoId));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00D4FF] animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] flex items-center justify-center p-6">
        <Card className="bg-[#1A1D29] border-red-500/30 max-w-md">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-[#94A3B8]">You need admin privileges to access this dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-[#94A3B8]">Manage site content and users</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-[#94A3B8] flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-[#94A3B8] flex items-center gap-2">
                <Video className="w-4 h-4" />
                Total Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats?.totalVideos || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-[#94A3B8] flex items-center gap-2">
                <ListVideo className="w-4 h-4" />
                Total Playlists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats?.totalPlaylists || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Batch Processing Section */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Content Management
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Generate or regenerate AI summaries and tags for your video library
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowAIDialog(true)}
                disabled={aiProcessMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              >
                {aiProcessMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Batch AI Process
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Video Management Section */}
        <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Video Management</CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  {selectedVideos.length > 0 
                    ? `${selectedVideos.length} video(s) selected` 
                    : 'Select videos to perform bulk actions'}
                </CardDescription>
              </div>
              {selectedVideos.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('category')}
                    className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Change Category
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('addTags')}
                    className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Add Tags
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('status')}
                    className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Change Status
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {videosLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-[#00D4FF] animate-spin mx-auto" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <Checkbox
                    checked={selectedVideos.length === videos.length && videos.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-[#94A3B8] font-medium">Select All</span>
                </div>
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[#0A2540] border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-colors"
                  >
                    <Checkbox
                      checked={selectedVideos.includes(video.id)}
                      onCheckedChange={(checked) => handleVideoSelect(video.id, checked)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm mb-1 truncate">{video.title}</h4>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
                          {video.category || 'Uncategorized'}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          {video.status || 'published'}
                        </Badge>
                        {video.ai_summary ? (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            AI Summary
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            No AI Summary
                          </Badge>
                        )}
                      </div>
                      {video.ai_tags && video.ai_tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {video.ai_tags.map((tag, idx) => (
                            <span key={idx} className="text-xs text-[#94A3B8] bg-[#1A1D29] px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Processing Dialog */}
        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent className="bg-[#1A1D29] border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Batch AI Processing
              </DialogTitle>
              <DialogDescription className="text-[#94A3B8]">
                Generate AI summaries and tags for your video library
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#94A3B8] mb-2 block">Processing Mode</label>
                <Select value={aiProcessAction} onValueChange={setAiProcessAction}>
                  <SelectTrigger className="bg-[#0A2540] border-[#00D4FF]/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1D29] border-[#00D4FF]/30">
                    <SelectItem value="missing" className="text-white">
                      Only videos without AI data
                    </SelectItem>
                    <SelectItem value="all" className="text-white">
                      All videos (regenerate)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#94A3B8] mb-2 block">Processing Limit</label>
                <Input
                  type="number"
                  value={aiProcessLimit}
                  onChange={(e) => setAiProcessLimit(parseInt(e.target.value))}
                  className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                  min="1"
                  max="100"
                />
                <p className="text-xs text-[#94A3B8] mt-1">Maximum number of videos to process (1-100)</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAIDialog(false)}
                className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => aiProcessMutation.mutate({ action: aiProcessAction, limit: aiProcessLimit })}
                disabled={aiProcessMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                {aiProcessMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Processing'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Action Dialog */}
        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <DialogContent className="bg-[#1A1D29] border-[#00D4FF]/30">
            <DialogHeader>
              <DialogTitle className="text-white">
                {bulkAction === 'delete' ? 'Confirm Deletion' : 'Bulk Update'}
              </DialogTitle>
              <DialogDescription className="text-[#94A3B8]">
                {bulkAction === 'delete' 
                  ? `Are you sure you want to delete ${selectedVideos.length} video(s)? This action cannot be undone.`
                  : `Update ${selectedVideos.length} selected video(s)`}
              </DialogDescription>
            </DialogHeader>
            {bulkAction !== 'delete' && (
              <div className="space-y-4">
                {bulkAction === 'category' && (
                  <div>
                    <label className="text-sm text-[#94A3B8] mb-2 block">New Category</label>
                    <Select value={bulkCategory} onValueChange={setBulkCategory}>
                      <SelectTrigger className="bg-[#0A2540] border-[#00D4FF]/30 text-white">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1D29] border-[#00D4FF]/30">
                        <SelectItem value="ai" className="text-white">AI & Technology</SelectItem>
                        <SelectItem value="strategy" className="text-white">Strategy</SelectItem>
                        <SelectItem value="tutorial" className="text-white">Tutorial</SelectItem>
                        <SelectItem value="workshop" className="text-white">Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {(bulkAction === 'addTags' || bulkAction === 'removeTags') && (
                  <div>
                    <label className="text-sm text-[#94A3B8] mb-2 block">
                      {bulkAction === 'addTags' ? 'Tags to Add' : 'Tags to Remove'} (comma-separated)
                    </label>
                    <Input
                      value={bulkTags}
                      onChange={(e) => setBulkTags(e.target.value)}
                      placeholder="e.g., AI, Strategy, Innovation"
                      className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                    />
                  </div>
                )}
                {bulkAction === 'status' && (
                  <div>
                    <label className="text-sm text-[#94A3B8] mb-2 block">New Status</label>
                    <Select value={bulkStatus} onValueChange={setBulkStatus}>
                      <SelectTrigger className="bg-[#0A2540] border-[#00D4FF]/30 text-white">
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1D29] border-[#00D4FF]/30">
                        <SelectItem value="published" className="text-white">Published</SelectItem>
                        <SelectItem value="draft" className="text-white">Draft</SelectItem>
                        <SelectItem value="archived" className="text-white">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBulkDialog(false)}
                className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={executeBulkAction}
                disabled={bulkUpdateMutation.isPending || bulkDeleteMutation.isPending}
                className={bulkAction === 'delete' 
                  ? "bg-red-500 text-white hover:bg-red-600" 
                  : "bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6]"}
              >
                {(bulkUpdateMutation.isPending || bulkDeleteMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : bulkAction === 'delete' ? (
                  'Delete Videos'
                ) : (
                  'Apply Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}