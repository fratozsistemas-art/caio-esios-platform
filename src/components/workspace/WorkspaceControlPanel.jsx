import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, Users, CheckCircle, AlertCircle, Clock, Target 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WorkspaceControlPanel({ workspace, projects, tasks, members }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
  ).length;
  
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  
  const overallProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / projects.length)
    : 0;

  const stats = [
    {
      icon: Target,
      label: 'Projetos Ativos',
      value: activeProjects,
      total: projects.length,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      icon: CheckCircle,
      label: 'Tarefas Concluídas',
      value: completedTasks,
      total: totalTasks,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      icon: AlertCircle,
      label: 'Tarefas Atrasadas',
      value: overdueTasks,
      total: totalTasks,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    },
    {
      icon: Users,
      label: 'Membros Ativos',
      value: members.length,
      total: null,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    }
  ];

  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed' && t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Progresso Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Conclusão do Workspace</span>
              <span className="text-white font-semibold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      {stat.total !== null && (
                        <p className="text-xs text-slate-400">de {stat.total}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Next Steps */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map(task => {
                const isOverdue = new Date(task.due_date) < new Date();
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{task.title}</p>
                      <p className="text-xs text-slate-400">
                        Responsável: {task.assigned_to || 'Não atribuído'}
                      </p>
                    </div>
                    <Badge className={isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}>
                      {new Date(task.due_date).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">
              Nenhuma tarefa pendente com prazo definido
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active Members */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Membros Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {members.map((email, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                  {email.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-white">{email}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}