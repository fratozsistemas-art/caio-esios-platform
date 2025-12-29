import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { User, ListVideo, History, Bell, Play, Trash2, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function UserProfile() {
  const [notificationPrefs, setNotificationPrefs] = useState({
    newVideos: true,
    playlistUpdates: true,
    recommendations: true,
    weeklyDigest: false
  });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me()
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ['user_playlists', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.VideoPlaylist.filter({ user_email: user.email });
    },
    enabled: !!user
  });

  const { data: watchHistory = [] } = useQuery({
    queryKey: ['watch_history', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const history = await base44.entities.VideoWatchHistory.filter({ user_email: user.email });
      return history.sort((a, b) => new Date(b.last_watched_at) - new Date(a.last_watched_at));
    },
    enabled: !!user
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async (playlistId) => {
      return await base44.entities.VideoPlaylist.delete(playlistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user_playlists']);
      toast.success('Playlist deleted');
    }
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const deletePromises = watchHistory.map(item => 
        base44.entities.VideoWatchHistory.delete(item.id)
      );
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['watch_history']);
      toast.success('Watch history cleared');
    }
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (prefs) => {
      return await base44.auth.updateMe({
        notification_preferences: prefs
      });
    },
    onSuccess: () => {
      toast.success('Notification preferences updated');
    }
  });

  const handleNotificationChange = (key, value) => {
    const newPrefs = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(newPrefs);
    updateNotificationsMutation.mutate(newPrefs);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
        <div className="max-w-6xl mx-auto text-center py-20">
          <p className="text-[#94A3B8]">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  const totalWatchTime = watchHistory.reduce((sum, item) => sum + (item.watch_duration_seconds || 0), 0);
  const completedVideos = watchHistory.filter(item => item.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center">
            <span className="text-white font-bold text-3xl">
              {user.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{user.full_name}</h1>
            <p className="text-[#94A3B8] mb-4">{user.email}</p>
            <div className="flex gap-4">
              <div className="bg-[#1A1D29] rounded-lg px-4 py-2 border border-[#00D4FF]/20">
                <p className="text-xs text-[#94A3B8]">Playlists</p>
                <p className="text-2xl font-bold text-white">{playlists.length}</p>
              </div>
              <div className="bg-[#1A1D29] rounded-lg px-4 py-2 border border-[#00D4FF]/20">
                <p className="text-xs text-[#94A3B8]">Videos Watched</p>
                <p className="text-2xl font-bold text-white">{watchHistory.length}</p>
              </div>
              <div className="bg-[#1A1D29] rounded-lg px-4 py-2 border border-[#00D4FF]/20">
                <p className="text-xs text-[#94A3B8]">Total Watch Time</p>
                <p className="text-2xl font-bold text-white">{Math.floor(totalWatchTime / 60)}m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="playlists" className="w-full">
          <TabsList className="bg-[#1A1D29] border border-[#00D4FF]/20 p-1">
            <TabsTrigger value="playlists" className="data-[state=active]:bg-[#00D4FF] data-[state=active]:text-[#0A2540]">
              <ListVideo className="w-4 h-4 mr-2" />
              My Playlists
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#00D4FF] data-[state=active]:text-[#0A2540]">
              <History className="w-4 h-4 mr-2" />
              Watch History
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-[#00D4FF] data-[state=active]:text-[#0A2540]">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Playlists Tab */}
          <TabsContent value="playlists" className="mt-6">
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
              <CardHeader>
                <CardTitle className="text-white">My Video Playlists</CardTitle>
              </CardHeader>
              <CardContent>
                {playlists.length === 0 ? (
                  <div className="text-center py-12">
                    <ListVideo className="w-16 h-16 text-[#94A3B8] mx-auto mb-4 opacity-50" />
                    <p className="text-[#94A3B8]">No playlists created yet</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {playlists.map((playlist) => (
                      <motion.div
                        key={playlist.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0A2540] rounded-lg p-4 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold truncate">{playlist.name}</h3>
                            {playlist.description && (
                              <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{playlist.description}</p>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deletePlaylistMutation.mutate(playlist.id)}
                            disabled={deletePlaylistMutation.isPending}
                            className="h-8 w-8 text-red-400 hover:bg-red-500/10 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-0">
                            {playlist.video_ids?.length || 0} videos
                          </Badge>
                          {playlist.is_public && (
                            <Badge className="bg-green-500/20 text-green-400 border-0">
                              Public
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Watch History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Watch History</CardTitle>
                  {watchHistory.length > 0 && (
                    <Button
                      onClick={() => clearHistoryMutation.mutate()}
                      disabled={clearHistoryMutation.isPending}
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear History
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {watchHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-[#94A3B8] mx-auto mb-4 opacity-50" />
                    <p className="text-[#94A3B8]">No videos watched yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {watchHistory.slice(0, 20).map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 p-3 bg-[#0A2540] rounded-lg border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D4FF]/20 to-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                          <Play className="w-5 h-5 text-[#00D4FF]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm truncate">{item.video_title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {item.video_category && (
                              <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
                                {item.video_category}
                              </Badge>
                            )}
                            {item.completed && (
                              <Badge className="bg-green-500/20 text-green-400 text-xs">
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-xs text-[#94A3B8] flex-shrink-0">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(item.last_watched_at || item.created_date), 'MMM d')}
                          </div>
                          {item.watch_duration_seconds > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.floor(item.watch_duration_seconds / 60)}m
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#0A2540] rounded-lg border border-[#00D4FF]/10">
                  <div>
                    <h4 className="text-white font-medium">New Video Alerts</h4>
                    <p className="text-sm text-[#94A3B8]">Get notified when new videos are published</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.newVideos}
                    onCheckedChange={(checked) => handleNotificationChange('newVideos', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0A2540] rounded-lg border border-[#00D4FF]/10">
                  <div>
                    <h4 className="text-white font-medium">Playlist Updates</h4>
                    <p className="text-sm text-[#94A3B8]">Notifications for changes to your playlists</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.playlistUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('playlistUpdates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0A2540] rounded-lg border border-[#00D4FF]/10">
                  <div>
                    <h4 className="text-white font-medium">Personalized Recommendations</h4>
                    <p className="text-sm text-[#94A3B8]">AI-powered video suggestions based on your interests</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.recommendations}
                    onCheckedChange={(checked) => handleNotificationChange('recommendations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0A2540] rounded-lg border border-[#00D4FF]/10">
                  <div>
                    <h4 className="text-white font-medium">Weekly Digest</h4>
                    <p className="text-sm text-[#94A3B8]">Weekly summary of your video activity and new content</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.weeklyDigest}
                    onCheckedChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}