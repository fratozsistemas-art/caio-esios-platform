import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Target, AlertTriangle, CheckCircle, Zap, TrendingUp,
  RefreshCw, Play, Eye, FileText, BarChart3, Sparkles, Clock,
  ArrowRight, Shield, Cpu, GitBranch
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const AGENTS = {
  market_monitor: { name: 'Market Monitor', icon: Eye, color: '#3b82f6' },
  strategy_doc_generator: { name: 'Strategy Doc', icon: FileText, color: '#a855f7' },
  knowledge_curator: { name: 'Knowledge Curator', icon: Brain, color: '#10b981' }
};

const PROBLEM_CATEGORIES = [
  { id: 'accuracy', label: 'Precisão', icon: Target, color: 'red' },
  { id: 'relevance', label: 'Relevância', icon: Brain, color: 'orange' },
  { id: 'latency', label: 'Latência', icon: Clock, color: 'yellow' },
  { id: 'completeness', label: 'Completude', icon: CheckCircle, color: 'blue' },
  { id: 'actionability', label: 'Acionabilidade', icon: Zap, color: 'purple' }
];

export default function FeedbackAnalysisEngine() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isRetraining, setIsRetraining] = useState({});
  const queryClient = useQueryClient();

  // Fetch feedback data
  const { data: allFeedback = [] } = useQuery({
    queryKey: ['feedback-for-analysis'],
    queryFn: () => base44.entities.AgentFeedback.list('-created_date', 500)
  });

  // Fetch model versions
  const { data: modelVersions = [] } = useQuery({
    queryKey: ['agent-model-versions'],
    queryFn: () => base44.entities.AgentModelVersion.list('-created_date', 100)
  });

  // Fetch training sessions
  const { data: trainingSessions = [] } = useQuery({
    queryKey: ['training-sessions'],
    queryFn: () => base44.entities.AgentTrainingSession.list('-created_date', 50)
  });

  // Analyze feedback with AI
  const analyzeFeedback = async () => {
    setIsAnalyzing(true);
    try {
      const agentFeedbackGroups = {};
      
      // Group feedback by agent
      allFeedback.forEach(fb => {
        if (!agentFeedbackGroups[fb.agent_id]) {
          agentFeedbackGroups[fb.agent_id] = [];
        }
        agentFeedbackGroups[fb.agent_id].push(fb);
      });

      const analysisPromises = Object.entries(agentFeedbackGroups).map(async ([agentId, feedbacks]) => {
        const feedbackSummary = feedbacks.slice(0, 50).map(f => ({
          type: f.feedback_type,
          rating: f.rating,
          comment: f.comment?.slice(0, 200),
          quality_metrics: f.quality_metrics
        }));

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Você é um sistema de análise de feedback para agentes de IA.

Analise o seguinte feedback do agente "${agentId}":
${JSON.stringify(feedbackSummary, null, 2)}

Identifique:
1. Principais categorias de problemas (accuracy, relevance, latency, completeness, actionability)
2. Severidade de cada problema (low, medium, high, critical)
3. Áreas prioritárias para melhoria
4. Ações corretivas específicas recomendadas
5. Score geral de qualidade (0-100)
6. Recomendação de retreinamento (sim/não e urgência)

Retorne JSON estruturado.`,
          response_json_schema: {
            type: "object",
            properties: {
              agent_id: { type: "string" },
              overall_quality_score: { type: "number" },
              problem_categories: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    count: { type: "number" },
                    severity: { type: "string" },
                    examples: { type: "array", items: { type: "string" } }
                  }
                }
              },
              improvement_areas: { type: "array", items: { type: "string" } },
              corrective_actions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    action: { type: "string" },
                    priority: { type: "string" },
                    estimated_impact: { type: "string" }
                  }
                }
              },
              retraining_recommendation: {
                type: "object",
                properties: {
                  recommended: { type: "boolean" },
                  urgency: { type: "string" },
                  reason: { type: "string" }
                }
              },
              trend_analysis: { type: "string" }
            }
          }
        });

        return { agentId, analysis: result, feedbackCount: feedbacks.length };
      });

      const results = await Promise.all(analysisPromises);
      
      const formattedResults = {};
      results.forEach(r => {
        formattedResults[r.agentId] = {
          ...r.analysis,
          feedbackCount: r.feedbackCount
        };
      });

      setAnalysisResults(formattedResults);
      toast.success('Análise de feedback concluída');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Erro na análise de feedback');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger retraining for an agent
  const triggerRetraining = async (agentId) => {
    setIsRetraining(prev => ({ ...prev, [agentId]: true }));
    
    try {
      const analysis = analysisResults?.[agentId];
      const approvedFeedback = allFeedback.filter(
        fb => fb.agent_id === agentId && fb.used_in_training === true
      );

      // Get current version
      const currentVersions = modelVersions.filter(v => v.agent_id === agentId && v.status === 'active');
      const currentVersion = currentVersions[0];
      const versionParts = (currentVersion?.version || '0.9.0').split('.').map(Number);
      const newVersion = `${versionParts[0]}.${versionParts[1] + 1}.0`;

      // Create new model version
      const newModelVersion = await base44.entities.AgentModelVersion.create({
        agent_id: agentId,
        version: newVersion,
        status: 'training',
        training_trigger: 'feedback_analysis',
        feedback_analysis: {
          total_samples_analyzed: analysis?.feedbackCount || 0,
          problem_categories: analysis?.problem_categories || [],
          improvement_areas: analysis?.improvement_areas || [],
          corrective_actions: analysis?.corrective_actions?.map(a => a.action) || []
        },
        training_config: {
          samples_used: approvedFeedback.length,
          training_duration_seconds: 0,
          hyperparameters: {}
        },
        performance_metrics: {
          pre_training: {
            accuracy: analysis?.overall_quality_score || 0,
            relevance: 0,
            latency_ms: 0,
            user_satisfaction: 0
          }
        },
        previous_version_id: currentVersion?.id
      });

      // Create training session
      await base44.entities.AgentTrainingSession.create({
        agent_id: agentId,
        training_type: 'feedback_based',
        status: 'in_progress',
        feedback_samples_count: approvedFeedback.length,
        training_data: approvedFeedback.slice(0, 100).map(f => ({
          input: f.input_context,
          expected_output: f.user_edits || f.agent_output,
          feedback_score: f.rating
        })),
        performance_before: {
          avg_rating: analysis?.overall_quality_score || 0
        },
        improvements_made: analysis?.corrective_actions?.map(a => a.action) || [],
        started_at: new Date().toISOString()
      });

      // Simulate training completion (in production, this would be async)
      setTimeout(async () => {
        // Update model version status
        await base44.entities.AgentModelVersion.update(newModelVersion.id, {
          status: 'validating',
          training_config: {
            samples_used: approvedFeedback.length,
            training_duration_seconds: 45,
            hyperparameters: { learning_rate: 0.001, epochs: 10 }
          }
        });

        queryClient.invalidateQueries(['agent-model-versions']);
        queryClient.invalidateQueries(['training-sessions']);
        setIsRetraining(prev => ({ ...prev, [agentId]: false }));
        toast.success(`Retreinamento do ${AGENTS[agentId]?.name} iniciado - v${newVersion}`);
      }, 3000);

    } catch (error) {
      console.error('Retraining error:', error);
      toast.error('Erro ao iniciar retreinamento');
      setIsRetraining(prev => ({ ...prev, [agentId]: false }));
    }
  };

  // Get current version for agent
  const getActiveVersion = (agentId) => {
    return modelVersions.find(v => v.agent_id === agentId && v.status === 'active');
  };

  const getLatestVersion = (agentId) => {
    const versions = modelVersions.filter(v => v.agent_id === agentId);
    return versions[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-green-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl">Feedback Analysis & Retraining Engine</span>
              <p className="text-sm text-slate-400 font-normal">
                Análise inteligente de feedback com retreinamento automático
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <Button 
                onClick={analyzeFeedback} 
                disabled={isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Analisando...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Analisar Feedback</>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-white">{allFeedback.length}</p>
            <p className="text-xs text-slate-400">Total Feedback</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-400">
              {allFeedback.filter(f => f.used_in_training === true).length}
            </p>
            <p className="text-xs text-slate-400">Aprovados p/ Treino</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">
              {modelVersions.filter(v => v.status === 'active').length}
            </p>
            <p className="text-xs text-slate-400">Modelos Ativos</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400">
              {trainingSessions.filter(s => s.status === 'completed').length}
            </p>
            <p className="text-xs text-slate-400">Sessões Completas</p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Object.entries(AGENTS).map(([agentId, agent]) => {
            const analysis = analysisResults[agentId];
            const AgentIcon = agent.icon;
            const activeVersion = getActiveVersion(agentId);
            const latestVersion = getLatestVersion(agentId);
            
            if (!analysis) return null;

            return (
              <motion.div
                key={agentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/5 border-white/10 h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${agent.color}20` }}
                        >
                          <AgentIcon className="w-5 h-5" style={{ color: agent.color }} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{agent.name}</p>
                          <div className="flex items-center gap-2">
                            {activeVersion && (
                              <Badge className="bg-green-500/20 text-green-400 text-[10px]">
                                v{activeVersion.version}
                              </Badge>
                            )}
                            {latestVersion && latestVersion.status === 'training' && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px]">
                                Treinando v{latestVersion.version}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          analysis.overall_quality_score >= 70 ? 'text-green-400' :
                          analysis.overall_quality_score >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {analysis.overall_quality_score}%
                        </p>
                        <p className="text-[10px] text-slate-500">Score Qualidade</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Problem Categories */}
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Categorias de Problemas</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.problem_categories?.slice(0, 4).map((cat, idx) => (
                          <Badge 
                            key={idx}
                            className={`text-[10px] ${
                              cat.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                              cat.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              cat.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {cat.category} ({cat.count})
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Corrective Actions */}
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Ações Corretivas</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {analysis.corrective_actions?.slice(0, 3).map((action, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <ArrowRight className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-300">{action.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Retraining Recommendation */}
                    {analysis.retraining_recommendation?.recommended && (
                      <div className={`p-3 rounded-lg ${
                        analysis.retraining_recommendation.urgency === 'critical' ? 'bg-red-500/10 border border-red-500/30' :
                        analysis.retraining_recommendation.urgency === 'high' ? 'bg-orange-500/10 border border-orange-500/30' :
                        'bg-yellow-500/10 border border-yellow-500/30'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className={`w-4 h-4 ${
                            analysis.retraining_recommendation.urgency === 'critical' ? 'text-red-400' :
                            analysis.retraining_recommendation.urgency === 'high' ? 'text-orange-400' : 'text-yellow-400'
                          }`} />
                          <span className="text-sm font-medium text-white">Retreinamento Recomendado</span>
                        </div>
                        <p className="text-xs text-slate-300">{analysis.retraining_recommendation.reason}</p>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => triggerRetraining(agentId)}
                      disabled={isRetraining[agentId]}
                      className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                    >
                      {isRetraining[agentId] ? (
                        <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Iniciando...</>
                      ) : (
                        <><Cpu className="w-4 h-4 mr-2" />Iniciar Retreinamento</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Model Version History */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-400" />
            Histórico de Versões de Modelos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {modelVersions.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Nenhuma versão registrada</p>
            ) : (
              modelVersions.map((version, idx) => {
                const agent = AGENTS[version.agent_id];
                const AgentIcon = agent?.icon || Brain;
                
                return (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${agent?.color}20` }}
                        >
                          <AgentIcon className="w-5 h-5" style={{ color: agent?.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{agent?.name}</p>
                            <Badge className="bg-white/10 text-white">v{version.version}</Badge>
                          </div>
                          <p className="text-xs text-slate-400">
                            Trigger: {version.training_trigger} • {new Date(version.created_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={
                          version.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          version.status === 'training' ? 'bg-yellow-500/20 text-yellow-400' :
                          version.status === 'validating' ? 'bg-blue-500/20 text-blue-400' :
                          version.status === 'deprecated' ? 'bg-slate-500/20 text-slate-400' :
                          'bg-red-500/20 text-red-400'
                        }>
                          {version.status}
                        </Badge>
                        {version.performance_metrics?.improvement_percentage && (
                          <span className={`text-sm font-bold ${
                            version.performance_metrics.improvement_percentage > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {version.performance_metrics.improvement_percentage > 0 ? '+' : ''}
                            {version.performance_metrics.improvement_percentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {version.feedback_analysis?.corrective_actions?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-slate-400 mb-1">Ações Corretivas Aplicadas:</p>
                        <div className="flex flex-wrap gap-1">
                          {version.feedback_analysis.corrective_actions.slice(0, 3).map((action, i) => (
                            <Badge key={i} className="bg-cyan-500/20 text-cyan-400 text-[10px]">
                              {action.slice(0, 30)}...
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}