import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, MessageSquare, CheckCircle, Circle, ChevronDown, 
  ChevronRight, Users, Zap, TrendingUp, FileText,
  Download, Share2, ArrowUpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function WorkspaceDetail() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const workspaceId = id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedPhase, setExpandedPhase] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: workspace, isLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      return base44.entities.Workspace.get(workspaceId);
    },
    enabled: !!workspaceId,
  });

  const { data: quickActions = [] } = useQuery({
    queryKey: ['quickActions'],
    queryFn: () => base44.entities.QuickAction.list(),
    initialData: [],
  });

  const updatePhaseMutation = useMutation({
    mutationFn: async ({ phaseIndex, updates }) => {
      const updatedPhases = [...workspace.phases];
      updatedPhases[phaseIndex] = { ...updatedPhases[phaseIndex], ...updates };
      
      const completedPhases = updatedPhases.filter(p => p.status === 'completed').length;
      const progress = Math.round((completedPhases / updatedPhases.length) * 100);

      let newCurrentPhaseName = updatedPhases.find(p => p.status === 'in_progress')?.name || 
                                updatedPhases.find(p => p.status === 'not_started')?.name;
      if (!newCurrentPhaseName && updatedPhases.length > 0) {
        if (completedPhases === updatedPhases.length) {
          newCurrentPhaseName = updatedPhases[updatedPhases.length - 1].name;
        } else if (completedPhases === 0) {
          newCurrentPhaseName = updatedPhases[0].name;
        }
      } else if (updatedPhases.length === 0) {
        newCurrentPhaseName = 'N/A';
      }

      return base44.entities.Workspace.update(workspaceId, {
        phases: updatedPhases,
        progress_percentage: progress,
        current_phase: newCurrentPhaseName
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      toast.success('Phase updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update phase: ' + error.message);
    }
  });

  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, deliverableIndex }) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const updatedDeliverables = [...workspace.deliverables];
      updatedDeliverables[deliverableIndex] = {
        ...updatedDeliverables[deliverableIndex],
        file_url,
        status: 'completed'
      };

      await base44.entities.Workspace.update(workspaceId, { deliverables: updatedDeliverables });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      toast.success('File uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload file: ' + error.message);
    }
  });

  const handlePhaseComplete = (phaseIndex) => {
    updatePhaseMutation.mutate({ phaseIndex, updates: { status: 'completed' } });
    if (phaseIndex + 1 < workspace.phases.length && workspace.phases[phaseIndex + 1].status === 'not_started') {
      setTimeout(() => {
        updatePhaseMutation.mutate({ phaseIndex: phaseIndex + 1, updates: { status: 'in_progress' } });
        setExpandedPhase(phaseIndex + 1);
      }, 500);
    }
  };

  const handleStartPhase = (phaseIndex) => {
    updatePhaseMutation.mutate({ phaseIndex, updates: { status: 'in_progress' } });
    setExpandedPhase(phaseIndex);
  };

  const handleChatWithContext = (phase) => {
    const context = {
      workspace_name: workspace.name,
      workspace_type: workspace.template_type,
      current_phase: phase.name,
      suggested_prompts: phase.suggested_prompts,
      quick_actions: phase.quick_actions
    };

    navigate(createPageUrl("Chat"), {
      state: { 
        workspaceContext: context,
        initialMessage: `[Workspace: ${workspace.name} - Fase: ${phase.name}]\n\nAjude-me com esta fase do projeto.`
      }
    });
  };

  const getRelevantQuickActions = (phase) => {
    if (!phase.quick_actions) return [];
    return quickActions.filter(qa => 
      phase.quick_actions.some(title => 
        qa.title.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(qa.title.toLowerCase())
      )
    ).slice(0, 3);
  };

  const phaseStatusConfig = {
    not_started: { icon: Circle, color: "text-slate-400", bg: "bg-slate-500/20" },
    in_progress: { icon: Zap, color: "text-blue-400", bg: "bg-blue-500/20" },
    completed: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20" }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-white">Carregando workspace...</div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-6">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <p className="text-white mb-4">Workspace não encontrado</p>
            <Button onClick={() => navigate(createPageUrl("Workspaces"))}>
              Voltar para Workspaces
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Workspaces"))}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Workspaces
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {workspace.name}
            </h1>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {workspace.template_type}
              </Badge>
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                {workspace.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/5 grid w-fit grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Tab Content - Overview */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Progress Overview */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Progresso Geral</h3>
                    <p className="text-sm text-slate-400">
                      Fase Atual: {workspace.current_phase}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                      {workspace.progress_percentage || 0}%
                    </div>
                    <p className="text-sm text-slate-400">
                      {workspace.phases?.filter(p => p.status === 'completed').length || 0} de{' '}
                      {workspace.phases?.length || 0} fases
                    </p>
                  </div>
                </div>
                <Progress value={workspace.progress_percentage || 0} className="h-3" />
              </div>
            </CardContent>
          </Card>
          
          {/* Suggested Quick Actions */}
          {workspace.suggested_quick_actions && workspace.suggested_quick_actions.length > 0 && (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Quick Actions para este Workspace
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {workspace.suggested_quick_actions.slice(0, 6).map((suggestedAction, idx) => {
                    const fullAction = quickActions.find(qa => qa.id === suggestedAction.id);
                    if (!fullAction) return null;

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                        onClick={() => navigate(createPageUrl("Chat"), {
                          state: { 
                            quickAction: fullAction,
                            workspaceContext: {
                              workspace_id: workspace.id,
                              workspace_name: workspace.name
                            }
                          }
                        })}
                      >
                        <h4 className="font-medium text-white mb-2">{fullAction.title}</h4>
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          {suggestedAction.theme}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab Content - Phases */}
        <TabsContent value="phases" className="space-y-4 mt-6">
          {workspace.phases?.map((phase, index) => {
            const statusConfig = phaseStatusConfig[phase.status] || phaseStatusConfig.not_started;
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedPhase === index;
            const relevantActions = getRelevantQuickActions(phase);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedPhase(isExpanded ? -1 : index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${statusConfig.bg} flex items-center justify-center`}>
                          <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg mb-1">
                            {index + 1}. {phase.name}
                          </CardTitle>
                          <p className="text-sm text-slate-400">
                            {phase.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${statusConfig.bg} ${statusConfig.color} border border-current`}>
                          {phase.status === 'completed' ? 'Concluído' :
                          phase.status === 'in_progress' ? 'Em Andamento' : 'Não Iniciado'}
                        </Badge>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="border-t border-white/10 p-6 space-y-6">
                          {/* Suggested Prompts */}
                          {phase.suggested_prompts && phase.suggested_prompts.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Prompts Sugeridos
                              </h4>
                              <div className="space-y-2">
                                {phase.suggested_prompts.map((prompt, idx) => (
                                  <div
                                    key={idx}
                                    className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                                    onClick={() => handleChatWithContext(phase)}
                                  >
                                    {prompt}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quick Actions */}
                          {relevantActions.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                Quick Actions Recomendadas
                              </h4>
                              <div className="grid md:grid-cols-2 gap-3">
                                {relevantActions.map((action) => (
                                  <div
                                    key={action.id}
                                    className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:from-blue-500/20 hover:to-purple-500/20 transition-all cursor-pointer"
                                    onClick={() => navigate(createPageUrl("Chat"), {
                                      state: { 
                                        quickAction: action,
                                        workspaceContext: {
                                          workspace_id: workspace.id,
                                          workspace_name: workspace.name,
                                          phase_name: phase.name
                                        }
                                      }
                                    })}
                                  >
                                    <div className="text-white font-medium mb-1">{action.title}</div>
                                    <div className="text-xs text-slate-400">{action.estimated_time}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-3 pt-4 border-t border-white/10">
                            <Button
                              onClick={() => handleChatWithContext(phase)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Conversar com CAIO
                            </Button>

                            {phase.status === 'not_started' && (
                              <Button
                                onClick={() => handleStartPhase(index)}
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/5"
                              >
                                Iniciar Fase
                              </Button>
                            )}

                            {phase.status === 'in_progress' && (
                              <Button
                                onClick={() => handlePhaseComplete(index)}
                                variant="outline"
                                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Marcar como Concluída
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* Tab Content - Deliverables */}
        <TabsContent value="deliverables" className="space-y-4 mt-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {workspace.deliverables && workspace.deliverables.length > 0 ? (
                <div className="space-y-4">
                  {workspace.deliverables.map((deliverable, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-white mb-1">{deliverable.name}</h4>
                        <p className="text-sm text-slate-400">{deliverable.description}</p>
                        {deliverable.file_url && (
                          <a href={deliverable.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm flex items-center mt-2 hover:underline">
                            <Download className="w-4 h-4 mr-1" /> View File
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          deliverable.status === 'completed'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }>
                          {deliverable.status === 'completed' ? 'Completed' : 'Pending'}
                        </Badge>
                        {!deliverable.file_url && (
                          <label htmlFor={`file-upload-${index}`} className="cursor-pointer">
                            <Button asChild variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/5">
                              <>
                                <ArrowUpCircle className="w-4 h-4 mr-2" /> Upload
                              </>
                            </Button>
                            <input
                              id={`file-upload-${index}`}
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  uploadFileMutation.mutate({
                                    file: e.target.files[0],
                                    deliverableIndex: index
                                  });
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-4">No deliverables defined for this workspace yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Content - Team */}
        <TabsContent value="team" className="space-y-4 mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {workspace.team_members && workspace.team_members.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workspace.team_members.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {member.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.name || 'N/A'}</p>
                        <p className="text-sm text-slate-400">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-4">No team members assigned to this workspace yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}