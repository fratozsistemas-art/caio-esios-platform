import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckSquare, Plus, Trash2, User, Calendar, Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskManager({ tasks, projects, members, onCreateTask, onUpdateTask, onDeleteTask }) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assigned_to: '',
    due_date: '',
    checklist_items: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      onUpdateTask(editingTask.id, formData);
    } else {
      onCreateTask(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assigned_to: '',
      due_date: '',
      checklist_items: []
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const addChecklistItem = () => {
    setFormData({
      ...formData,
      checklist_items: [...formData.checklist_items, { text: '', completed: false }]
    });
  };

  const updateChecklistItem = (index, text) => {
    const updated = [...formData.checklist_items];
    updated[index].text = text;
    setFormData({ ...formData, checklist_items: updated });
  };

  const removeChecklistItem = (index) => {
    const updated = formData.checklist_items.filter((_, i) => i !== index);
    setFormData({ ...formData, checklist_items: updated });
  };

  const toggleChecklistItem = (taskId, itemIndex) => {
    const task = tasks.find(t => t.id === taskId);
    const updated = [...task.checklist_items];
    updated[itemIndex].completed = !updated[itemIndex].completed;
    onUpdateTask(taskId, { checklist_items: updated });
  };

  const statusColors = {
    pending: 'bg-slate-500/20 text-slate-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    blocked: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Tarefas e Checklists</h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Select
                    value={formData.project_id}
                    onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Título da tarefa"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />

                  <Textarea
                    placeholder="Descrição"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <Select
                    value={formData.assigned_to}
                    onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Atribuir a" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map(email => (
                        <SelectItem key={email} value={email}>
                          {email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-slate-300">Checklist</label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={addChecklistItem}
                        className="text-blue-400"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.checklist_items.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            placeholder="Item do checklist"
                            value={item.text}
                            onChange={(e) => updateChecklistItem(idx, e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeChecklistItem(idx)}
                            className="text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                      {editingTask ? 'Atualizar' : 'Criar'} Tarefa
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {tasks.map(task => (
          <Card key={task.id} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">{task.title}</h4>
                    <Badge className={statusColors[task.status]}>
                      {task.status}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-slate-400 mb-2">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    {task.assigned_to && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assigned_to}
                      </div>
                    )}
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDeleteTask(task.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {task.checklist_items && task.checklist_items.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-white/10">
                  {task.checklist_items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleChecklistItem(task.id, idx)}
                      />
                      <span className={`text-sm ${item.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}