import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Youtube, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function YouTubeSyncPanel() {
  const [channelUrl, setChannelUrl] = useState('https://www.youtube.com/@ArtificiallySmarter');
  const [maxResults, setMaxResults] = useState(10);
  const queryClient = useQueryClient();

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['blog_posts_youtube'],
    queryFn: async () => {
      const posts = await base44.entities.BlogPost.filter({
        youtube_video_id: { $exists: true }
      });
      return posts;
    }
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('syncYouTubeChannel', {
        channel_url: channelUrl,
        max_results: maxResults
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['blog_posts_youtube']);
      toast.success(data.message || 'YouTube sync completed');
    },
    onError: (error) => {
      toast.error(`Sync failed: ${error.message}`);
    }
  });

  const handleSync = () => {
    if (!channelUrl) {
      toast.error('Please enter a YouTube channel URL');
      return;
    }
    syncMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Sync Control */}
      <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            YouTube Channel Sync
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Channel URL</Label>
            <Input
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="https://www.youtube.com/@ChannelName"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Max Videos to Import</Label>
            <Input
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              min="1"
              max="50"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <Button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync YouTube Videos
              </>
            )}
          </Button>

          {syncMutation.isSuccess && syncMutation.data && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 border border-green-500/30 rounded-lg p-3"
            >
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white font-medium">Sync Completed</p>
                  <div className="text-sm text-slate-300 mt-1 space-y-1">
                    <p>✓ Created: {syncMutation.data.results?.created} posts</p>
                    <p>• Skipped: {syncMutation.data.results?.skipped} (already exist)</p>
                    {syncMutation.data.results?.errors > 0 && (
                      <p className="text-red-400">✗ Errors: {syncMutation.data.results.errors}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Synced Posts */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm">
              Synced Posts from YouTube
            </CardTitle>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              {blogPosts.length} posts
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {blogPosts.length === 0 ? (
            <p className="text-slate-400 text-center py-4 text-sm">
              No YouTube videos synced yet
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {blogPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="flex gap-3">
                    {post.featured_image && (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm line-clamp-1">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(post.published_at).toLocaleDateString('pt-BR')}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge className="bg-red-500/20 text-red-400 text-xs">
                          YouTube
                        </Badge>
                        {post.view_count > 0 && (
                          <Badge className="bg-white/10 text-slate-300 text-xs">
                            {post.view_count.toLocaleString('pt-BR')} views
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            How it works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300 space-y-2">
          <p>1. Enter the YouTube channel URL (e.g., @ArtificiallySmarter)</p>
          <p>2. Choose how many recent videos to import</p>
          <p>3. Click "Sync YouTube Videos" to import</p>
          <p>4. Videos are converted to blog posts with embedded video</p>
          <p className="text-xs text-slate-400 mt-3">
            Note: Already imported videos will be skipped to avoid duplicates
          </p>
        </CardContent>
      </Card>
    </div>
  );
}