import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2,
  Calendar,
  User,
  ArrowUpDown,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function VentureTasks() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [clickupStatusFilter, setClickupStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('due_date_desc');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigned_to: '',
    due_date: '',
    venture_id: ''
  });

  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me()
  });

  // Fetch all tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['venture_tasks'],
    queryFn: async () => {
      return await base44.entities.Task.list();
    }
  });

  // Fetch all users for assignee filter
  const { data: users = [] } = useQuery({
    queryKey: ['all_users'],
    queryFn: async () => {
      return await base44.entities.User.list();
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      return await base44.entities.Task.create(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['venture_tasks']);
      toast.success('Task created successfully');
      setShowCreateDialog(false);
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assigned_to: '',
        due_date: '',
        venture_id: ''
      });
    },
    onError: (error) => {
      toast.error(`Failed to create task: ${error.message}`);
    }
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      return await base44.entities.Task.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['venture_tasks']);
      toast.success('Task updated');
    }
  });

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Keyword search
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(t => 
        t.title?.toLowerCase().includes(keyword) ||
        t.description?.toLowerCase().includes(keyword) ||
        t.venture_id?.toLowerCase().includes(keyword)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }

    // Assignee filter
    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(t => t.assigned_to === assigneeFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(t => 
        t.due_date && new Date(t.due_date) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filtered = filtered.filter(t => 
        t.due_date && new Date(t.due_date) <= new Date(dateTo)
      );
    }

    // ClickUp status filter
    if (clickupStatusFilter) {
      filtered = filtered.filter(t => 
        t.clickup_status?.toLowerCase().includes(clickupStatusFilter.toLowerCase())
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'priority_asc':
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
          return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
        case 'priority_desc':
          const priorityOrderDesc = { low: 1, medium: 2, high: 3, urgent: 4 };
          return (priorityOrderDesc[b.priority] || 0) - (priorityOrderDesc[a.priority] || 0);
        case 'due_date_asc':
          return new Date(a.due_date || 0) - new Date(b.due_date || 0);
        case 'due_date_desc':
        default:
          return new Date(b.due_date || 0) - new Date(a.due_date || 0);
      }
    });

    return filtered;
  }, [tasks, searchKeyword, statusFilter, priorityFilter, assigneeFilter, dateFrom, dateTo, clickupStatusFilter, sortBy]);

  const clearFilters = () => {
    setSearchKeyword('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setDateFrom('');
    setDateTo('');
    setClickupStatusFilter('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'blocked': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-[#94A3B8]" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Venture Tasks</h1>
              <p className="text-[#94A3B8]">{filteredTasks.length} task(s) found</p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>
        </motion.div>

        {/* Advanced Filters */}
        <Card className="bg-[#1A1D29] border-[#00D4FF]/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* First row */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <Input
                  placeholder="Search by keyword..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10 bg-[#0A2540] border-[#00D4FF]/30 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-[#0A2540] border-[#00D4FF]/30 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D29] border-[#00D4FF]/30">
                  <SelectItem value="all" className="text-white">All Status</SelectItem>
                  <SelectItem value="todo" className="text-white">To Do</SelectItem>
                  <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                  <SelectItem value="done" className="text-white">Done</SelectItem>
                  <SelectItem value="blocked" className="text-white">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-[#0A2540] border-[#00D4FF]/30 text-white">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D29] border-[#00D4FF]/30">
                  <SelectItem value="all" className="text-white">All Priority</SelectItem>
                  <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                  <SelectItem value="high" className="text-white">High</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium</SelectItem>
                  <SelectItem value="low" className="text-white">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="bg-[#0A2540] border-[#00D4FF]/30 text-white">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D29] border-[#00D4FF]/30">
                  <SelectItem value="all" className="text-white">All Assignees</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.email} value={u.email} className="text-white">
                      {u.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Second row */}
            <div className="grid md:grid-cols-5 gap-4">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From date"
                className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To date"
                className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
              />
              <Input
                placeholder="ClickUp status..."
                value={clickupStatusFilter}
                onChange={(e) => setClickupStatusFilter(e.target.value)}
                className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
              />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-[#0A2540] border-[#00D4FF]/30 text-white">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D29] border-[#00D4FF]/30">
                  <SelectItem value="due_date_desc" className="text-white">Due Date (Latest)</SelectItem>
                  <SelectItem value="due_date_asc" className="text-white">Due Date (Earliest)</SelectItem>
                  <SelectItem value="priority_desc" className="text-white">Priority (High to Low)</SelectItem>
                  <SelectItem value="priority_asc" className="text-white">Priority (Low to High)</SelectItem>
                  <SelectItem value="title_asc" className="text-white">Title (A-Z)</SelectItem>
                  <SelectItem value="title_desc" className="text-white">Title (Z-A)</SelectItem>
                </SelectContent>
              </Select>
              {(searchKeyword || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' || dateFrom || dateTo || clickupStatusFilter) && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="bg-[#0A2540] border-[#00D4FF]/30 text-white hover:bg-[#1A1D29]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#00D4FF] animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredTasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-[#1A1D29] border-[#00D4FF]/20 hover:border-[#00D4FF]/40 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2">{task.title}</CardTitle>
                        <CardDescription className="text-[#94A3B8] text-sm">
                          {task.description}
                        </CardDescription>
                      </div>
                      {getStatusIcon(task.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30">
                        {task.status.replace('_', ' ')}
                      </Badge>
                      {task.clickup_status && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          ClickUp: {task.clickup_status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#94A3B8]">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {users.find(u => u.email === task.assigned_to)?.full_name || task.assigned_to}
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTaskMutation.mutate({
                          id: task.id,
                          updates: { status: task.status === 'done' ? 'todo' : 'done' }
                        })}
                        className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
                      >
                        {task.status === 'done' ? 'Reopen' : 'Complete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <p className="text-[#94A3B8]">No tasks found. Create your first task!</p>
              </div>
            )}
          </div>
        )}

        {/* Create Task Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-[#1A1D29] border-[#00D4FF]/30">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
              />
              <Textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
              />
              <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                <SelectTrigger className="bg-[#0A2540] border-[#00D4FF]/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D29] border-[#00D4FF]/30">
                  <SelectItem value="low" className="text-white">Low</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium</SelectItem>
                  <SelectItem value="high" className="text-white">High</SelectItem>
                  <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newTask.assigned_to} onValueChange={(v) => setNewTask({ ...newTask, assigned_to: v })}>
                <SelectTrigger className="bg-[#0A2540] border-[#00D4FF]/30 text-white">
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D29] border-[#00D4FF]/30">
                  {users.map(u => (
                    <SelectItem key={u.email} value={u.email} className="text-white">
                      {u.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
              />
              <Input
                placeholder="Venture ID"
                value={newTask.venture_id}
                onChange={(e) => setNewTask({ ...newTask, venture_id: e.target.value })}
                className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="bg-[#0A2540] border-[#00D4FF]/30 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createTaskMutation.mutate(newTask)}
                disabled={!newTask.title || !newTask.assigned_to || !newTask.venture_id || createTaskMutation.isPending}
                className="bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6]"
              >
                {createTaskMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}