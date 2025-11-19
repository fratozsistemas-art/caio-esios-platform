import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, ChevronDown, FolderOpen, Folder, Plus, Edit, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectNode = ({ project, subProjects, depth = 0, onEdit, onDelete, onAddSubProject }) => {
  const [expanded, setExpanded] = useState(true);
  
  const statusColors = {
    not_started: 'bg-slate-500/20 text-slate-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    on_hold: 'bg-yellow-500/20 text-yellow-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400'
  };

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className={`${depth > 0 ? 'ml-8' : ''}`}>
      <Card className="bg-white/5 border-white/10 mb-2">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {subProjects.length > 0 && (
              <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-white">
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            {subProjects.length > 0 ? (
              <FolderOpen className="w-5 h-5 text-blue-400" />
            ) : (
              <Folder className="w-5 h-5 text-slate-400" />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white">{project.name}</h4>
                <Badge className={statusColors[project.status]}>
                  {project.status.replace('_', ' ')}
                </Badge>
                <Badge className={priorityColors[project.priority]}>
                  {project.priority}
                </Badge>
              </div>
              {project.description && (
                <p className="text-sm text-slate-400 mb-2">{project.description}</p>
              )}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={project.progress_percentage || 0} className="h-2" />
                  <span className="text-xs text-slate-400 mt-1">{project.progress_percentage || 0}%</span>
                </div>
                {project.due_date && (
                  <span className="text-xs text-slate-400">
                    Prazo: {new Date(project.due_date).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onAddSubProject(project.id)}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(project)}
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(project.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {expanded && subProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {subProjects.map(subProject => {
              const subSubProjects = subProjects.filter(p => p.parent_project_id === subProject.id);
              return (
                <ProjectNode
                  key={subProject.id}
                  project={subProject}
                  subProjects={subSubProjects}
                  depth={depth + 1}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddSubProject={onAddSubProject}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProjectTree({ workspaceId, projects, onEdit, onDelete, onAddProject }) {
  const rootProjects = projects.filter(p => !p.parent_project_id);

  return (
    <div className="space-y-2">
      {rootProjects.map(project => {
        const subProjects = projects.filter(p => p.parent_project_id === project.id);
        return (
          <ProjectNode
            key={project.id}
            project={project}
            subProjects={subProjects}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddSubProject={(parentId) => onAddProject(parentId)}
          />
        );
      })}
    </div>
  );
}