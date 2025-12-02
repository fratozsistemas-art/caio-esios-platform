import React, { useState, useEffect } from 'react';
import CentralActivityFeed from '@/components/collaboration/CentralActivityFeed';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, Activity, MessageSquare, CheckSquare, Lightbulb, 
  Search, Bell, TrendingUp, Clock, Filter
} from 'lucide-react';
import ActivityFeedPanel from '@/components/collaboration/ActivityFeedPanel';
import TaskAssignmentPanel from '@/components/collaboration/TaskAssignmentPanel';
import ShareInsightDialog from '@/components/collaboration/ShareInsightDialog';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

export default function Collaboration() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('activity');

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['online-users'],
    queryFn: async () => {
      const users = await base44.entities.UserPresence.list();
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      return users.filter(u => u.last_active_at > fiveMinutesAgo && u.status !== 'offline');
    },
    refetchInterval: 15000
  });

  const { data: myTasks = [] } = useQuery({
    queryKey: ['my-tasks', currentUser?.email],
    queryFn: () => base44.entities.CollaborationTask.filter({
      assignee_email: currentUser?.email,
      status: 'pending'
    }),
    enabled: !!currentUser
  });

  const { data: sharedInsights = [] } = useQuery({
    queryKey: ['shared-insights'],
    queryFn: () => base44.entities.SharedInsight.list('-created_date', 20)
  });

  const { data: recentComments = [] } = useQuery({
    queryKey: ['recent-comments'],
    queryFn: () => base44.entities.CollaborationComment.list('-created_date', 10)
  });

  const filteredInsights = sharedInsights.filter(i => 
    i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-[#00D4FF]" />
            Collaboration Hub
          </h1>
          <p className="text-slate-400 mt-1">
            Work together with your team in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ShareInsightDialog 
            trigger={
              <Button className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                <Lightbulb className="w-4 h-4 mr-2" />
                Share Insight
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{onlineUsers.length}</p>
              <p className="text-xs text-slate-400">Online Now</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{myTasks.length}</p>
              <p className="text-xs text-slate-400">My Pending Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{sharedInsights.length}</p>
              <p className="text-xs text-slate-400">Shared Insights</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{recentComments.length}</p>
              <p className="text-xs text-slate-400">Recent Comments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800">
              <TabsTrigger value="activity" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
                <Activity className="w-4 h-4 mr-2" />
                Activity Feed
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
                <Lightbulb className="w-4 h-4 mr-2" />
                Shared Insights
              </TabsTrigger>
              <TabsTrigger value="tasks" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
                <CheckSquare className="w-4 h-4 mr-2" />
                My Tasks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <ActivityFeedPanel showAll />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="mt-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search insights..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {filteredInsights.map((insight, idx) => (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="bg-slate-800/30 border-slate-700 hover:border-[#00D4FF]/30 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-bold">
                                    {insight.shared_by_name?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-white">{insight.title}</span>
                                    {insight.pinned && (
                                      <Badge className="bg-[#FFB800]/20 text-[#FFB800] text-xs">Pinned</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-300 line-clamp-2 mb-2">
                                    {insight.content}
                                  </p>
                                  {insight.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {insight.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-slate-400">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>{insight.shared_by_name}</span>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(new Date(insight.created_date), { addSuffix: true })}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                      {filteredInsights.length === 0 && (
                        <div className="text-center py-12">
                          <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-500">No insights found</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <TaskAssignmentPanel />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Online Users */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Online Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {onlineUsers.map(user => (
                  <div key={user.user_email} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FFB800] text-[#0A1628] text-xs font-bold">
                          {user.user_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-slate-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.user_name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.current_page || 'Browsing'}</p>
                    </div>
                  </div>
                ))}
                {onlineUsers.length === 0 && (
                  <p className="text-center text-slate-500 py-4 text-sm">No one else online</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Pending Tasks */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-orange-400" />
                Due Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {myTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="p-2 rounded-lg bg-slate-700/30 border border-slate-700">
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-slate-400 mt-1">
                        Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                ))}
                {myTasks.length === 0 && (
                  <p className="text-center text-slate-500 py-4 text-sm">No pending tasks</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}