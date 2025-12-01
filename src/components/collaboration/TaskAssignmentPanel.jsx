import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckSquare, Plus, Calendar, User, Flag, Check, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';

const priorityConfig = {
  low: { color: 'bg-slate-500', icon: Flag, label: 'Low' },
  medium: { color: 'bg-blue-500', icon: Flag, label: 'Medium' },
  high: { color: 'bg-orange-500', icon: Flag, label: 'High' },
  urgent: { color: 'bg-red-500', icon: AlertCircle, label: 'Urgent' }
};

const statusConfig = {
  pending: { color: 'bg-slate-500', label: 'Pending' },
  in_progress: { color: 'bg-blue-500', label: 'In Progress' },
  completed: { color: 'bg-green-500', label: 'Completed' },
  cancelled: { color: 'bg-red-500', label: 'Cancelled' }
};

export default function TaskAssignmentPanel({ entityType, entityId }) {
  const [showNewTask, setShowNewTask] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newTask, setNewTask] = useState({
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

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', entityType, entityId],
    queryFn: () => entityType && entityId 
      ? base44.entities.CollaborationTask.filter({ entity_type: entityType, entity_id: entityId })
      : base44.entities.CollaborationTask.filter({ assignee_email: currentUser?.email }),
    enabled: !!currentUser
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const task = await base44.entities.CollaborationTask.create({
        ...taskData,
        entity_type: entityType,
        entity_id: entityId,
        assigned_by_email: currentUser.email,
        assignee_name: users.find(u => u.email === taskData.assignee_email)?.full_name
      });

      // Create activity event
      await base44.entities.ActivityEvent.create({
        event_type: 'task_assigned',
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        entity_type: entityType,
        entity_id: entityId,
        target_users: [taskData.assignee_email],
        metadata: { task_id: task.id, task_title: taskData.title }
      });

      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setShowNewTask(false);
      setNewTask({ title: '', description: '', assignee_email: '', priority: 'medium', due_date: '' });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }) => {
      const task = await base44.entities.CollaborationTask.update(taskId, updates);
      
      if (updates.status === 'completed') {
        await base44.entities.ActivityEvent.create({
          event_type: 'task_completed',
          actor_email: currentUser.email,
          actor_name: currentUser.full_name,
          entity_type: entityType,
          entity_id: entityId,
          metadata: { task_id: taskId }
        });
      }
      
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[#00D4FF]" />
          <h3 className="text-lg font-semibold text-white">Tasks</h3>
          <Badge className="bg-slate-700 text-slate-300">{pendingTasks.length} active</Badge>
        </div>
        <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628]">
              <Plus className="w-4 h-4 mr-1" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Textarea
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Select
                value={newTask.assignee_email}
                onValueChange={(value) => setNewTask({ ...newTask, assignee_email: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Assign to..." />
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
              <div className="flex gap-3">
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Priority" />
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
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <Button
                onClick={() => createTaskMutation.mutate(newTask)}
                disabled={!newTask.title || !newTask.assignee_email}
                className="w-full bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628]"
              >
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Tasks */}
      <div className="space-y-2">
        {pendingTasks.map(task => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => updateTaskMutation.mutate({ 
                      taskId: task.id, 
                      updates: { status: 'completed', completed_at: new Date().toISOString() }
                    })}
                    className="mt-0.5 w-5 h-5 rounded border-2 border-slate-500 hover:border-green-500 flex items-center justify-center"
                  >
                    {task.status === 'completed' && <Check className="w-3 h-3 text-green-500" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">{task.title}</span>
                      <span className={`w-2 h-2 rounded-full ${priorityConfig[task.priority]?.color}`} />
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-400 mb-2 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assignee_name}
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(task.due_date), 'MMM d')}
                        </div>
                      )}
                    </div>
                  </div>
                  <Select
                    value={task.status}
                    onValueChange={(value) => updateTaskMutation.mutate({ taskId: task.id, updates: { status: value }})}
                  >
                    <SelectTrigger className="w-28 h-7 bg-slate-700 border-slate-600 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${config.color}`} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-500 mb-2">{completedTasks.length} completed</p>
          <div className="space-y-1">
            {completedTasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center gap-2 text-sm text-slate-500">
                <Check className="w-4 h-4 text-green-500" />
                <span className="line-through">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <p className="text-center text-slate-500 py-6 text-sm">No tasks yet</p>
      )}
    </div>
  );
}