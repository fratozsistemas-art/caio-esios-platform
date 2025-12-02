import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, MessageSquare, CheckSquare, Share2, Edit, 
  FileText, Lightbulb, BarChart3, Brain
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const eventConfig = {
  comment_added: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Comentou' },
  task_created: { icon: CheckSquare, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Criou tarefa' },
  task_completed: { icon: CheckSquare, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Completou tarefa' },
  entity_shared: { icon: Share2, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Compartilhou' },
  entity_updated: { icon: Edit, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Atualizou' },
  report_exported: { icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Exportou' },
  insight_shared: { icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Compartilhou insight' },
  analysis_completed: { icon: BarChart3, color: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/10', label: 'Completou análise' }
};

export default function RecentActivitiesSection({ userEmail }) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['user-activities', userEmail],
    queryFn: async () => {
      const all = await base44.entities.ActivityEvent.list('-created_date', 100);
      return all.filter(a => a.actor_email === userEmail).slice(0, 30);
    },
    enabled: !!userEmail
  });

  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = new Date(activity.created_date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  if (isLoading) {
    return <div className="text-center py-8 text-slate-400">Carregando atividades...</div>;
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#00D4FF]" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date} className="mb-6">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                {new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div className="space-y-3">
                {dateActivities.map((activity, idx) => {
                  const config = eventConfig[activity.event_type] || { 
                    icon: Activity, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Ação' 
                  };
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          <span className="font-medium">{config.label}</span>
                          {activity.entity_title && (
                            <span className="text-[#00D4FF]"> {activity.entity_title}</span>
                          )}
                        </p>
                        {activity.metadata?.task_title && (
                          <p className="text-xs text-slate-400 mt-0.5">{activity.metadata.task_title}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">Nenhuma atividade recente</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}