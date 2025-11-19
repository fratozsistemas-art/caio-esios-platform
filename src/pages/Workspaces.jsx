
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, FolderKanban, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
// The createPageUrl import is no longer needed if not used elsewhere,
// but for this specific change, it's just about modifying the `to` prop.
// If it's not used at all in the file after this change, it should be removed.
// For now, I will keep it as the outline didn't explicitly ask for its removal from imports.
import { createPageUrl } from "@/utils"; 

export default function Workspaces() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    template_type: "strategic_planning"
  });

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => base44.entities.Workspace.list('-created_date'),
    initialData: [],
  });

  const { data: quickActions = [] } = useQuery({
    queryKey: ['quickActions'],
    queryFn: () => base44.entities.QuickAction.list(),
    initialData: [],
  });

  const templates = [
    { 
      value: "strategic_planning", 
      label: "Planejamento Estratégico", 
      icon: "🎯", 
      description: "SWOT, OKRs, roadmap 18 meses",
      themes: ["executive_decisions", "strategic_insights", "execution"]
    },
    { 
      value: "investment_analysis", 
      label: "Análise de Investimento", 
      icon: "💰", 
      description: "ROI, modelagem financeira, risk assessment",
      themes: ["financial_planning", "executive_decisions", "enterprise_risk"]
    },
    { 
      value: "digital_transformation", 
      label: "Transformação Digital", 
      icon: "🚀", 
      description: "Maturidade digital, tech stack, change management",
      themes: ["transformation", "ai_strategy", "operations_intelligence"]
    },
    { 
      value: "market_analysis", 
      label: "Análise de Mercado", 
      icon: "📊", 
      description: "Competitive intelligence, sizing, trends",
      themes: ["market", "strategic_insights", "business_intelligence"]
    },
    { 
      value: "risk_assessment", 
      label: "Avaliação de Risco", 
      icon: "🛡️", 
      description: "Risk mapping, compliance, mitigação",
      themes: ["enterprise_risk", "financial_planning", "operations_intelligence"]
    },
    { 
      value: "ma_evaluation", 
      label: "M&A Evaluation", 
      icon: "🤝", 
      description: "Due diligence, valuation, synergies",
      themes: ["ma_opportunities", "financial_planning", "strategic_insights"]
    },
    { 
      value: "product_launch", 
      label: "Lançamento de Produto", 
      icon: "🎨", 
      description: "Go-to-market, pricing, positioning",
      themes: ["growth", "innovation", "customer_success"]
    },
    { 
      value: "cost_optimization", 
      label: "Otimização de Custos", 
      icon: "⚡", 
      description: "Efficiency analysis, quick wins, roadmap",
      themes: ["efficiency", "financial_planning", "operations_intelligence"]
    }
  ];

  const createWorkspaceMutation = useMutation({
    mutationFn: async (data) => {
      const template = templates.find(t => t.value === data.template_type);
      const phases = getTemplatePhases(data.template_type);
      const suggestedActions = getSuggestedQuickActions(template?.themes || []);
      
      return base44.entities.Workspace.create({
        ...data,
        current_phase: phases[0]?.name || "Início",
        progress_percentage: 0,
        phases: phases,
        suggested_quick_actions: suggestedActions,
        status: "active"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setDialogOpen(false);
      setNewWorkspace({ name: "", template_type: "strategic_planning" });
    },
  });

  const getSuggestedQuickActions = (themes) => {
    return quickActions
      .filter(action => themes.includes(action.theme))
      .slice(0, 6)
      .map(action => ({
        id: action.id,
        title: action.title,
        theme: action.theme
      }));
  };

  const getTemplatePhases = (templateType) => {
    const phaseTemplates = {
      strategic_planning: [
        { 
          name: "Análise de Contexto", 
          description: "SWOT analysis e identificação de trends",
          status: "not_started",
          suggested_prompts: [
            "Faça uma análise SWOT completa da empresa",
            "Identifique 5 principais trends do nosso setor",
            "Analise nossa posição competitiva atual"
          ],
          quick_actions: ["Market Trend Analysis", "Competitive Intelligence Report", "SWOT Analysis"]
        },
        { 
          name: "Definição de Objetivos", 
          description: "OKRs e North Star Metrics",
          status: "not_started",
          suggested_prompts: [
            "Crie OKRs estratégicos para os próximos 12 meses",
            "Defina nossa North Star Metric",
            "Liste KPIs críticos por área"
          ],
          quick_actions: ["OKR Framework Design", "Dashboard & KPI Framework"]
        },
        { 
          name: "Desenho de Estratégia", 
          description: "Frameworks e cenários",
          status: "not_started",
          suggested_prompts: [
            "Crie 3 cenários: conservador, realista, otimista",
            "Identifique quick wins e projetos estruturantes"
          ],
          quick_actions: ["Scenario Planning & Sensitivity Analysis", "Opportunity Matrix"]
        },
        { 
          name: "Roadmap & KPIs", 
          description: "Timeline e indicadores",
          status: "not_started",
          suggested_prompts: [
            "Crie roadmap executivo para 18 meses",
            "Defina dashboards por stakeholder",
            "Estabeleça marcos de revisão trimestral"
          ],
          quick_actions: ["Strategic Initiative Tracking", "Resource Allocation Optimizer"]
        }
      ],
      investment_analysis: [
        {
          name: "Due Diligence Inicial",
          description: "Coleta de dados e análise preliminar",
          status: "not_started",
          suggested_prompts: [
            "Analise os fundamentals da empresa alvo",
            "Faça market sizing do setor"
          ],
          quick_actions: ["Investment Decision Framework", "Market Sizing & Segmentation"]
        },
        {
          name: "Modelagem Financeira",
          description: "Valuation e projeções",
          status: "not_started",
          suggested_prompts: [
            "Crie modelo financeiro 3-statement",
            "Calcule valuation (DCF + múltiplos)"
          ],
          quick_actions: ["Unit Economics Deep Dive", "Scenario Planning & Sensitivity Analysis"]
        }
      ],
      digital_transformation: [
        {
          name: "Assessment de Maturidade",
          description: "Diagnóstico do estado atual",
          status: "not_started",
          suggested_prompts: [
            "Avalie maturidade digital da organização"
          ],
          quick_actions: ["Digital Maturity Assessment", "Tech Stack Modernization"]
        }
      ]
    };

    return phaseTemplates[templateType] || phaseTemplates.strategic_planning;
  };

  const handleCreateWorkspace = () => {
    if (newWorkspace.name.trim()) {
      createWorkspaceMutation.mutate(newWorkspace);
    }
  };

  const statusColors = {
    active: "text-green-400 bg-green-500/20",
    paused: "text-yellow-400 bg-yellow-500/20",
    completed: "text-blue-400 bg-blue-500/20",
    archived: "text-slate-400 bg-slate-500/20"
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Workspaces
          </h1>
          <p className="text-slate-400">
            Projetos estratégicos organizados com templates CAIO/TSI
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Workspace
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-950 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Criar Novo Workspace</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">Nome do Projeto</Label>
                <Input
                  id="name"
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Transformação Digital 2025"
                  className="bg-white/5 border-white/10 text-white mt-2"
                />
              </div>
              <div>
                <Label htmlFor="template" className="text-slate-300">Template</Label>
                <Select
                  value={newWorkspace.template_type}
                  onValueChange={(value) => setNewWorkspace(prev => ({ ...prev, template_type: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.value} value={template.value}>
                        <div className="flex items-center gap-2">
                          <span>{template.icon}</span>
                          <div>
                            <div className="font-medium">{template.label}</div>
                            <div className="text-xs text-slate-400">{template.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateWorkspace}
                disabled={!newWorkspace.name.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Criar Workspace
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {workspaces.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <FolderKanban className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum workspace ainda
            </h3>
            <p className="text-slate-400 mb-6">
              Crie seu primeiro projeto estratégico com templates pré-configurados
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              Começar Agora
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace, index) => {
            const template = templates.find(t => t.value === workspace.template_type);
            return (
              <motion.div
                key={workspace.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group h-full flex flex-col">
                  <CardHeader className="border-b border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{template?.icon}</span>
                        <CardTitle className="text-white text-lg">
                          {workspace.name}
                        </CardTitle>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[workspace.status]}`}>
                        {workspace.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{template?.description}</p>
                  </CardHeader>
                  
                  <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Progresso</span>
                        <span className="text-white font-medium">{workspace.progress_percentage || 0}%</span>
                      </div>
                      <Progress value={workspace.progress_percentage || 0} className="h-2" />
                    </div>

                    <div className="text-sm">
                      <span className="text-slate-400">Fase Atual: </span>
                      <span className="text-white font-medium">{workspace.current_phase}</span>
                    </div>

                    {workspace.suggested_quick_actions && workspace.suggested_quick_actions.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-2">Quick Actions Sugeridas:</p>
                        <div className="space-y-1">
                          {workspace.suggested_quick_actions.slice(0, 3).map((action, idx) => (
                            <div key={idx} className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {action.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {workspace.team_members && workspace.team_members.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>{workspace.team_members.length} membros</span>
                      </div>
                    )}

                    <div className="mt-auto pt-4">
                      <Link to={createPageUrl("WorkspaceDetail") + `?id=${workspace.id}`}>
                        <Button className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 group-hover:translate-x-1 transition-all">
                          Abrir Workspace
                          <TrendingUp className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
