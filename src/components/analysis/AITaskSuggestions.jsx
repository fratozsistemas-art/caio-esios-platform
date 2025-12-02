import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Target, Calendar, User, Flag, Loader2, Check, 
  Clock, Sparkles, ChevronDown, ChevronUp, 
  AlertCircle, ArrowUp, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

const priorityConfig = {
  critical: { color: 'bg-red-500', label: 'Crítica', days: 2, icon: AlertCircle },
  high: { color: 'bg-orange-500', label: 'Alta', days: 5, icon: ArrowUp },
  medium: { color: 'bg-blue-500', label: 'Média', days: 10, icon: Flag },
  low: { color: 'bg-slate-500', label: 'Baixa', days: 20, icon: Minus }
};

export default function AITaskSuggestions({ suggestions, sourceType, sourceId, users = [] }) {
  const [expandedTask, setExpandedTask] = useState(null);
  const [assignees, setAssignees] = useState({});
  const [createdTasks, setCreatedTasks] = useState([]);
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async ({ task, assigneeEmail }) => {
      const currentUser = await base44.auth.me();
      const assignee = users.find(u => u.email === assigneeEmail);
      const priority = task.priority || 'medium';
      const suggestedDeadline = addDays(new Date(), priorityConfig[priority]?.days || 10);

      const newTask = await base44.entities.CollaborationTask.create({
        title: task.title || task.action,
        description: task.description || task.rationale || '',
        assignee_email: assigneeEmail,
        assignee_name: assignee?.full_name || assigneeEmail,
        assigned_by_email: currentUser.email,
        priority: priority,
        due_date: format(suggestedDeadline, 'yyyy-MM-dd'),
        entity_type: sourceType,
        entity_id: sourceId,
        status: 'pending'
      });

      // Create activity event
      await base44.entities.ActivityEvent.create({
        event_type: 'task_created',
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        entity_type: sourceType,
        entity_id: sourceId,
        entity_title: task.title || task.action,
        target_users: [assigneeEmail],
        metadata: {
          task_id: newTask.id,
          task_title: task.title || task.action,
          from_ai_suggestion: true,
          priority: priority
        }
      });

      return newTask;
    },
    onSuccess: (_, variables) => {
      setCreatedTasks(prev => [...prev, variables.task.id || variables.task.title]);
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['activities']);
      toast.success('Tarefa criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar tarefa');
      console.error(error);
    }
  });

  const createAllTasks = async () => {
    for (const task of suggestions) {
      const taskId = task.id || task.title;
      if (!createdTasks.includes(taskId) && assignees[taskId]) {
        await createTaskMutation.mutateAsync({ task, assigneeEmail: assignees[taskId] });
      }
    }
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Tarefas Sugeridas pela IA
            <Badge className="ml-2 bg-purple-500/20 text-purple-400">
              {suggestions.length} sugestões
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            onClick={createAllTasks}
            disabled={createTaskMutation.isPending || Object.keys(assignees).length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {createTaskMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Criar Todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {suggestions.map((task, idx) => {
              const taskId = task.id || task.title || idx;
              const priority = task.priority || 'medium';
              const isExpanded = expandedTask === taskId;
              const isCreated = createdTasks.includes(taskId);
              const suggestedDeadline = addDays(new Date(), priorityConfig[priority]?.days || 10);

              return (
                <motion.div
                  key={taskId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-xl border transition-all ${
                    isCreated 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div 
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedTask(isExpanded ? null : taskId)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-lg ${priorityConfig[priority]?.color || 'bg-blue-500'} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                        {isCreated ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          (() => {
                            const PriorityIcon = priorityConfig[priority]?.icon || Flag;
                            return <PriorityIcon className="w-4 h-4 text-white opacity-70" />;
                          })()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-medium ${isCreated ? 'text-green-400 line-through' : 'text-white'}`}>
                            {task.title || task.action}
                          </h4>
                          <Badge className={`${priorityConfig[priority]?.color} text-white text-xs`}>
                            {priorityConfig[priority]?.label}
                          </Badge>
                          {task.framework && (
                            <Badge className="bg-slate-700 text-slate-300 text-xs">
                              {task.framework}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                          {task.description || task.rationale}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Prazo sugerido: {format(suggestedDeadline, 'dd/MM/yyyy')}
                          </span>
                          {task.expectedImpact && (
                            <span className="flex items-center gap-1 text-green-400">
                              <Target className="w-3 h-3" />
                              {task.expectedImpact}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCreated && (
                        <Badge className="bg-green-500/20 text-green-400">
                          <Check className="w-3 h-3 mr-1" />
                          Criada
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && !isCreated && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-white/10"
                    >
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-slate-400 mb-1 block">Atribuir a</label>
                          <Select
                            value={assignees[taskId] || ''}
                            onValueChange={(value) => setAssignees(prev => ({ ...prev, [taskId]: value }))}
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                              <SelectValue placeholder="Selecionar responsável..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              {users.map(user => (
                                <SelectItem key={user.email} value={user.email}>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-5 h-5">
                                      <AvatarFallback className="bg-[#00D4FF] text-[#0A1628] text-xs">
                                        {user.full_name?.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    {user.full_name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => createTaskMutation.mutate({ task, assigneeEmail: assignees[taskId] })}
                          disabled={!assignees[taskId] || createTaskMutation.isPending}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {createTaskMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Target className="w-4 h-4 mr-2" />
                              Criar Tarefa
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}