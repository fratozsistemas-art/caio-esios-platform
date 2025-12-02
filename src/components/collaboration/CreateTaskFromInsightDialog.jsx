import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  CheckSquare, Plus, Calendar, User, Flag, Loader2, 
  Lightbulb, Target, AlertCircle, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const priorityConfig = {
  low: { color: 'bg-slate-500', label: 'Baixa' },
  medium: { color: 'bg-blue-500', label: 'Média' },
  high: { color: 'bg-orange-500', label: 'Alta' },
  urgent: { color: 'bg-red-500', label: 'Urgente' }
};

export default function CreateTaskFromInsightDialog({ 
  trigger,
  insight, // { title, description, priority, source_type, source_id }
  onCreated
}) {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assignee_email: '',
    priority: 'medium',
    due_date: ''
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  useEffect(() => {
    if (insight && open) {
      setTaskData({
        title: insight.title || '',
        description: insight.description || '',
        assignee_email: '',
        priority: insight.priority || 'medium',
        due_date: ''
      });
    }
  }, [insight, open]);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const handleCreate = async () => {
    if (!taskData.title || !taskData.assignee_email) {
      toast.error('Preencha título e responsável');
      return;
    }

    setIsCreating(true);
    try {
      const assignee = users.find(u => u.email === taskData.assignee_email);
      
      const task = await base44.entities.CollaborationTask.create({
        title: taskData.title,
        description: taskData.description,
        assignee_email: taskData.assignee_email,
        assignee_name: assignee?.full_name,
        assigned_by_email: currentUser.email,
        priority: taskData.priority,
        due_date: taskData.due_date || undefined,
        entity_type: insight?.source_type || 'insight',
        entity_id: insight?.source_id || 'ai_generated',
        status: 'pending'
      });

      // Create activity event
      await base44.entities.ActivityEvent.create({
        event_type: 'task_created',
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        entity_type: insight?.source_type || 'insight',
        entity_id: insight?.source_id,
        entity_title: taskData.title,
        target_users: [taskData.assignee_email],
        metadata: { 
          task_id: task.id, 
          task_title: taskData.title,
          from_ai_insight: true
        }
      });

      toast.success(`Tarefa criada e atribuída a ${assignee?.full_name || taskData.assignee_email}`);
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['activities']);
      
      setOpen(false);
      onCreated?.(task);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Erro ao criar tarefa');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
            <Target className="w-4 h-4 mr-2" />
            Criar Tarefa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-400" />
            Criar Tarefa a partir do Insight
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* AI Insight Source */}
          {insight && (
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-400 font-medium">INSIGHT DE IA</span>
              </div>
              <p className="text-sm text-slate-300 line-clamp-2">{insight.title}</p>
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Título da Tarefa</label>
            <Input
              placeholder="O que precisa ser feito?"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Descrição</label>
            <Textarea
              placeholder="Detalhes adicionais..."
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Atribuir a</label>
            <Select
              value={taskData.assignee_email}
              onValueChange={(value) => setTaskData({ ...taskData, assignee_email: value })}
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

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Prioridade</label>
              <Select
                value={taskData.priority}
                onValueChange={(value) => setTaskData({ ...taskData, priority: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${config.color}`} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Prazo</label>
              <Input
                type="date"
                value={taskData.due_date}
                onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !taskData.title || !taskData.assignee_email}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Tarefa
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}