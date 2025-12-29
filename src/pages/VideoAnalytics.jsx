import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Eye, Users, Clock, Award, ListVideo, Play, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function VideoAnalytics() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['video_analytics'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getVideoAnalytics', {});
      return data;
    }
  });

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const COLORS = ['#00D4FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Activity className="w-12 h-12 text-[#00D4FF] animate-spin mx-auto mb-4" />
              <p className="text-[#94A3B8]">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-8 text-center">
              <p className="text-red-400">{error.message || 'Failed to load analytics'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { overview, popularVideos, categoryBreakdown, viewsTrend, playlistEngagement } = analytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Video Analytics</h1>
            <p className="text-[#94A3B8]">Insights into viewing behavior and engagement</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Total Views</p>
                    <p className="text-3xl font-bold text-white">{overview.totalViews.toLocaleString()}</p>
                  </div>
                  <Eye className="w-8 h-8 text-[#00D4FF] opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Unique Viewers</p>
                    <p className="text-3xl font-bold text-white">{overview.uniqueViewers}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Avg Watch Time</p>
                    <p className="text-3xl font-bold text-white">{formatDuration(overview.avgWatchDuration)}</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Completion Rate</p>
                    <p className="text-3xl font-bold text-white">{overview.completionRate}%</p>
                  </div>
                  <Award className="w-8 h-8 text-yellow-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Views Over Time */}
          <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00D4FF]" />
                Views Trend (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={viewsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="date" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1D29', border: '1px solid #00D4FF' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="views" stroke="#00D4FF" strokeWidth={2} dot={{ fill: '#00D4FF' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-[#00D4FF]" />
                Views by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="views"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.category}: ${entry.views}`}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1D29', border: '1px solid #00D4FF' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Most Popular Videos */}
          <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00D4FF]" />
                Most Popular Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularVideos.slice(0, 8).map((video, idx) => (
                  <div key={video.id} className="flex items-center gap-3 p-3 bg-[#0A2540] rounded-lg border border-[#00D4FF]/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center font-bold text-white text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{video.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
                          {video.category}
                        </Badge>
                        <span className="text-xs text-[#94A3B8]">{video.uniqueViewers} viewers</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{video.views}</p>
                      <p className="text-xs text-[#94A3B8]">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Playlist Engagement */}
          <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ListVideo className="w-5 h-5 text-[#00D4FF]" />
                Playlist Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {playlistEngagement.slice(0, 8).map((playlist) => (
                  <div key={playlist.id} className="flex items-center justify-between p-3 bg-[#0A2540] rounded-lg border border-[#00D4FF]/10">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{playlist.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#94A3B8]">{playlist.owner}</span>
                        {playlist.isPublic && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">Public</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-white">{playlist.videoCount}</p>
                      <p className="text-xs text-[#94A3B8]">videos</p>
                    </div>
                  </div>
                ))}
                {playlistEngagement.length === 0 && (
                  <p className="text-[#94A3B8] text-center py-8">No playlists created yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-[#94A3B8] mb-2">Active Users (7 Days)</p>
                <p className="text-4xl font-bold text-white">{overview.activeUsers}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-[#94A3B8] mb-2">Total Videos</p>
                <p className="text-4xl font-bold text-white">{overview.totalVideos}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-[#94A3B8] mb-2">Total Playlists</p>
                <p className="text-4xl font-bold text-white">{overview.totalPlaylists}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}