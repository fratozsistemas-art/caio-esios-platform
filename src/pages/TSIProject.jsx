import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Rocket, Loader2, Play, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ModeSelector from "../components/tsi/ModeSelector";
import TSIDashboard from "../components/tsi/TSIDashboard";

export default function TSIProject() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({
    title: "",
    mode: "express",
    project_brief: ""
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['tsi-projects'],
    queryFn: () => base44.entities.TSIProject.list('-created_date'),
    initialData: [],
  });

  const createProjectMutation = useMutation({
    mutationFn: (data) => base44.entities.TSIProject.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tsi-projects'] });
      setShowCreateForm(false);
      setNewProject({ title: "", mode: "express", project_brief: "" });
    },
  });

  const runOrchestrationMutation = useMutation({
    mutationFn: (projectId) => base44.functions.invoke('orchestrateTSI', { project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tsi-projects'] });
      queryClient.invalidateQueries({ queryKey: ['tsi-deliverables'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId) => base44.entities.TSIProject.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tsi-projects'] });
      if (selectedProject) {
        setSelectedProject(null);
      }
    },
  });

  const handleCreateProject = async () => {
    if (!newProject.title) return;
    await createProjectMutation.mutateAsync({
      ...newProject,
      status: 'active'
    });
  };

  const handleRunAnalysis = async (projectId) => {
    await runOrchestrationMutation.mutateAsync(projectId);
  };

  const handleDeleteProject = async (projectId, projectTitle) => {
    if (!confirm(`❌ Tem certeza que deseja excluir o projeto "${projectTitle}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      await deleteProjectMutation.mutateAsync(projectId);
      alert('✅ Projeto excluído com sucesso!');
    } catch (error) {
      alert(`❌ Erro ao excluir projeto: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-400 bg-blue-500/20';
      case 'gate_validation': return 'text-yellow-400 bg-yellow-500/20';
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getModeColor = (mode) => {
    return mode === 'express' 
      ? 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      : 'text-purple-400 bg-purple-500/20 border-purple-500/30';
  };

  if (selectedProject) {
    return (
      <TSIDashboard 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-blue-400" />
            TSI+ Projects
          </h1>
          <p className="text-slate-400">
            Technology × Systems × Innovation Framework v6.0
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Rocket className="w-4 h-4 mr-2" />
          New TSI+ Project
        </Button>
      </div>

      {/* Create Project Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white">Create New TSI+ Project</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Project Title */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Project Title</label>
                  <Input
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="e.g., Tesla Market Entry Analysis"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                {/* Mode Selector */}
                <ModeSelector
                  selectedMode={newProject.mode}
                  onModeChange={(mode) => setNewProject({ ...newProject, mode })}
                />

                {/* Project Brief */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Project Brief (Optional)</label>
                  <Textarea
                    value={newProject.project_brief}
                    onChange={(e) => setNewProject({ ...newProject, project_brief: e.target.value })}
                    placeholder="Provide context, objectives, specific questions..."
                    className="bg-white/5 border-white/10 text-white h-32"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newProject.title || createProjectMutation.isPending}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {createProjectMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
                        Create Project
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No TSI+ projects yet
            </h3>
            <p className="text-slate-400 mb-6">
              Create your first project to start strategic intelligence analysis
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              Create First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
            >
              <CardHeader className="border-b border-white/10">
                <div className="flex justify-between items-start">
                  <div className="flex-1 cursor-pointer" onClick={() => setSelectedProject(project)}>
                    <CardTitle className="text-white text-lg mb-2 group-hover:text-blue-300 transition-colors">
                      {project.title}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getModeColor(project.mode)}>
                        {project.mode.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id, project.title);
                    }}
                    disabled={deleteProjectMutation.isPending}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {project.deliverables && project.deliverables.length > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Deliverables</span>
                      <span className="text-white font-medium">
                        {project.deliverables.filter(d => d.status === 'completed').length}/{project.deliverables.length}
                      </span>
                    </div>
                    <Progress 
                      value={(project.deliverables.filter(d => d.status === 'completed').length / project.deliverables.length) * 100} 
                      className="h-2"
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-2xl font-bold text-blue-400">
                      {project.sci_ia_score || 0}
                    </div>
                    <div className="text-xs text-slate-400">SCI·IA</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-2xl font-bold text-green-400">
                      {project.icv_ia_score || 0}
                    </div>
                    <div className="text-xs text-slate-400">ICV·IA</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-2xl font-bold text-purple-400">
                      {project.clq_ia_score || 0}
                    </div>
                    <div className="text-xs text-slate-400">CLQ·IA</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {project.status === 'active' && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunAnalysis(project.id);
                      }}
                      disabled={runOrchestrationMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      size="sm"
                    >
                      {runOrchestrationMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run Analysis
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-white/20 text-white hover:bg-white/5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}