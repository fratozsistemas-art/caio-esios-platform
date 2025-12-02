import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, MessageSquare, CheckSquare, Share2, Edit, 
  ThumbsUp, FileText, Lightbulb, Bell, Check, Filter,
  BarChart3, Brain, RefreshCw, ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const eventConfig = {
  comment_added: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'comentou em' },
  comment_resolved: { icon: Check, color: 'text-green-400', bg: 'bg-green-500/10', label: 'resolveu comentário em' },
  task_created: { icon: CheckSquare, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'criou tarefa em' },
  task_assigned: { icon: CheckSquare, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'atribuiu tarefa a' },
  task_completed: { icon: Check, color: 'text-green-400', bg: 'bg-green-500/10', label: 'completou tarefa em' },
  entity_shared: { icon: Share2, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'compartilhou' },
  entity_updated: { icon: Edit, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'atualizou' },
  mention: { icon: Bell, color: 'text-pink-400', bg: 'bg-pink-500/10', label: 'mencionou você em' },
  reaction_added: { icon: ThumbsUp, color: 'text-red-400', bg: 'bg-red-500/10', label: 'reagiu a' },
  report_exported: { icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'exportou' },
  insight_shared: { icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'compartilhou insight de' },
  analysis_completed: { icon: BarChart3, color: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/10', label: 'completou análise' },
  ai_insight_generated: { icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'gerou insight de IA em' }
};

const entityTypeLabels = {
  file_analysis: 'File Analyzer',
  data_analysis: 'Advanced Data Analysis',
  strategy: 'Estratégia',
  workspace: 'Workspace',
  analysis: 'Análise',
  insight: 'Insight'
};

export default function CentralActivityFeed({ compact = false, limit = 50 }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'mentions' | 'tasks' | 'shares'
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: activities = [], isLoading, refetch } = useQuery({
    queryKey: ['centralActivities', filter],
    queryFn: async () => {
      let allActivities = await base44.entities.ActivityEvent.list('-created_date', limit);
      
      if (filter === 'mentions') {
        allActivities = allActivities.filter(a => 
          a.event_type === 'mention' || a.target_users?.includes(currentUser?.email)
        );
      } else if (filter === 'tasks') {
        allActivities = allActivities.filter(a => 
          ['task_created', 'task_assigned', 'task_completed'].includes(a.event_type)
        );
      } else if (filter === 'shares') {
        allActivities = allActivities.filter(a => 
          ['entity_shared', 'insight_shared'].includes(a.event_type)
        );
      }
      
      return allActivities;
    },
    enabled: !!currentUser,
    refetchInterval: 10000 // Real-time: refresh every 10s
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (activityId) => {
      const activity = activities.find(a => a.id === activityId);
      const isReadBy = activity?.is_read_by || [];
      if (currentUser && !isReadBy.includes(currentUser.email)) {
        return base44.entities.ActivityEvent.update(activityId, {
          is_read_by: [...isReadBy, currentUser.email]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['centralActivities']);
    }
  });

  const markAllAsRead = async () => {
    const unreadActivities = activities.filter(a => 
      !a.is_read_by?.includes(currentUser?.email) && 
      a.actor_email !== currentUser?.email
    );
    
    for (const activity of unreadActivities) {
      await markAsReadMutation.mutateAsync(activity.id);
    }
  };

  const unreadCount = activities.filter(a => 
    !a.is_read_by?.includes(currentUser?.email) && 
    a.actor_email !== currentUser?.email
  ).length;

  const getEntityLink = (activity) => {
    if (activity.entity_type === 'file_analysis') {
      return createPageUrl('FileAnalyzer');
    } else if (activity.entity_type === 'data_analysis') {
      return createPageUrl('AdvancedDataAnalysis');
    } else if (activity.entity_type === 'strategy') {
      return createPageUrl('Strategies');
    } else if (activity.entity_type === 'workspace') {
      return createPageUrl('Workspaces');
    }
    return null;
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00D4FF]" />
            <span className="text-sm font-medium text-white">Atividade Recente</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs">{unreadCount}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-slate-400 hover:text-white">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {activities.slice(0, 5).map((activity) => {
            const config = eventConfig[activity.event_type] || eventConfig.entity_updated;
            const Icon = config.icon;
            const isUnread = !activity.is_read_by?.includes(currentUser?.email) && 
                            activity.actor_email !== currentUser?.email;
            
            return (
              <div 
                key={activity.id}
                onClick={() => isUnread && markAsReadMutation.mutate(activity.id)}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer ${
                  isUnread ? 'bg-[#00D4FF]/5 border-l-2 border-[#00D4FF]' : 'hover:bg-white/5'
                }`}
              >
                <div className={`w-6 h-6 rounded-full ${config.bg} flex items-center justify-center`}>
                  <Icon className={`w-3 h-3 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">
                    <span className="font-medium">{activity.actor_name}</span>
                    {' '}{config.label}{' '}
                    <span className="text-[#00D4FF]">{activity.entity_title}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <Link to={createPageUrl('Collaboration')}>
          <Button variant="ghost" size="sm" className="w-full text-[#00D4FF] hover:bg-[#00D4FF]/10">
            Ver Todas as Atividades
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00D4FF]" />
            Feed de Atividades
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount} novas</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-slate-400 hover:text-white"
              >
                <Check className="w-4 h-4 mr-1" />
                Marcar como lidas
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-slate-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <Tabs value={filter} onValueChange={setFilter} className="mb-4">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
              Todas
            </TabsTrigger>
            <TabsTrigger value="mentions" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
              <Bell className="w-3 h-3 mr-1" />
              Menções
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
              <CheckSquare className="w-3 h-3 mr-1" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="shares" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
              <Share2 className="w-3 h-3 mr-1" />
              Compartilhamentos
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Activity List */}
        <ScrollArea className="h-[500px]">
          <AnimatePresence>
            <div className="space-y-3">
              {activities.map((activity, idx) => {
                const config = eventConfig[activity.event_type] || eventConfig.entity_updated;
                const Icon = config.icon;
                const isUnread = !activity.is_read_by?.includes(currentUser?.email) && 
                                activity.actor_email !== currentUser?.email;
                const entityLink = getEntityLink(activity);

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => isUnread && markAsReadMutation.mutate(activity.id)}
                    className="cursor-pointer"
                  >
                    <Card className={`bg-slate-800/50 border-slate-700 transition-all hover:bg-slate-800/70 ${
                      isUnread ? 'border-l-2 border-l-[#00D4FF] bg-[#00D4FF]/5' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FFB800] text-[#0A1628] text-sm font-bold">
                              {activity.actor_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-white">
                                  <span className="font-semibold">{activity.actor_name}</span>
                                  {' '}<span className="text-slate-400">{config.label}</span>{' '}
                                  {activity.entity_title && (
                                    <span className="text-[#00D4FF] font-medium">{activity.entity_title}</span>
                                  )}
                                </p>
                                {activity.metadata?.task_title && (
                                  <p className="text-sm text-slate-400 mt-1">
                                    Tarefa: {activity.metadata.task_title}
                                  </p>
                                )}
                                {activity.entity_type && (
                                  <Badge className={`mt-2 ${config.bg} ${config.color} border-0`}>
                                    {entityTypeLabels[activity.entity_type] || activity.entity_type}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {isUnread && (
                                  <span className="w-2 h-2 rounded-full bg-[#00D4FF]" />
                                )}
                                {entityLink && (
                                  <Link to={entityLink} onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className={`w-5 h-5 rounded-full ${config.bg} flex items-center justify-center`}>
                                <Icon className={`w-3 h-3 ${config.color}`} />
                              </div>
                              <span className="text-xs text-slate-500">
                                {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>

          {activities.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">Nenhuma atividade encontrada</p>
              <p className="text-sm text-slate-600 mt-1">
                {filter !== 'all' ? 'Tente outro filtro' : 'As atividades aparecerão aqui'}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}