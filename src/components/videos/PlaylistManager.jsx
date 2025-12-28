import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ListVideo, Play, Trash2, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function PlaylistManager({ currentVideoId, onPlaylistSelect }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', is_public: false });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me()
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ['video_playlists', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.VideoPlaylist.filter({ user_email: user.email });
    },
    enabled: !!user
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (playlistData) => {
      return await base44.entities.VideoPlaylist.create({
        ...playlistData,
        user_email: user.email,
        video_ids: currentVideoId ? [currentVideoId] : []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['video_playlists']);
      toast.success('Playlist created');
      setShowCreateDialog(false);
      setNewPlaylist({ name: '', description: '', is_public: false });
    }
  });

  const addToPlaylistMutation = useMutation({
    mutationFn: async (playlistId) => {
      const playlist = playlists.find(p => p.id === playlistId);
      if (!playlist) throw new Error('Playlist not found');
      
      const updatedVideoIds = [...(playlist.video_ids || [])];
      if (!updatedVideoIds.includes(currentVideoId)) {
        updatedVideoIds.push(currentVideoId);
      }

      return await base44.entities.VideoPlaylist.update(playlistId, {
        video_ids: updatedVideoIds
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['video_playlists']);
      toast.success('Added to playlist');
    }
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async (playlistId) => {
      return await base44.entities.VideoPlaylist.delete(playlistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['video_playlists']);
      toast.success('Playlist deleted');
    }
  });

  const handleCreatePlaylist = () => {
    if (!newPlaylist.name.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }
    createPlaylistMutation.mutate(newPlaylist);
  };

  return (
    <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <ListVideo className="w-4 h-4 text-[#00D4FF]" />
            My Playlists
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6]">
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1A1D29] border-[#00D4FF]/30">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Playlist name"
                    value={newPlaylist.name}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                    className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Description (optional)"
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                    className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={newPlaylist.is_public}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, is_public: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_public" className="text-sm text-[#94A3B8]">
                    Make playlist public
                  </label>
                </div>
                <Button
                  onClick={handleCreatePlaylist}
                  disabled={createPlaylistMutation.isPending}
                  className="w-full bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6]"
                >
                  Create Playlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {playlists.length === 0 ? (
          <p className="text-[#94A3B8] text-sm text-center py-4">
            No playlists yet. Create one to organize your videos!
          </p>
        ) : (
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0A2540] rounded-lg p-3 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-medium text-sm truncate">
                        {playlist.name}
                      </h4>
                      {playlist.is_public ? (
                        <Globe className="w-3 h-3 text-green-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-[#94A3B8]" />
                      )}
                    </div>
                    {playlist.description && (
                      <p className="text-xs text-[#94A3B8] line-clamp-2">
                        {playlist.description}
                      </p>
                    )}
                    <Badge className="mt-1 bg-[#00D4FF]/20 text-[#00D4FF] border-0 text-xs">
                      {playlist.video_ids?.length || 0} videos
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    {currentVideoId && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => addToPlaylistMutation.mutate(playlist.id)}
                        disabled={addToPlaylistMutation.isPending || playlist.video_ids?.includes(currentVideoId)}
                        className="h-8 w-8 text-[#00D4FF] hover:bg-[#00D4FF]/10"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onPlaylistSelect?.(playlist)}
                      className="h-8 w-8 text-white hover:bg-white/10"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deletePlaylistMutation.mutate(playlist.id)}
                      disabled={deletePlaylistMutation.isPending}
                      className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}