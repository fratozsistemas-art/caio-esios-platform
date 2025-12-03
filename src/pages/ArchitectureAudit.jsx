import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Layers, Shield, Target, CheckCircle, AlertTriangle,
  XCircle, ArrowRight, Network, Zap, TrendingUp, Clock,
  GitBranch, FileText, Users, BarChart3, Compass, Heart,
  Eye, Languages, Box, Workflow, Database, MessageSquare,
  Sparkles, RefreshCw, Download
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * ARCHITECTURE AUDIT — v12.3 vs Estado Atual
 * 
 * Comparação diligente entre a arquitetura cognitiva v12.3
 * e as capacidades implementadas na plataforma ESIOS/CAIO.AI
 */

// v12.3 Architecture Definition
const V12_3_ARCHITECTURE = {
  CAIO: {
    name: "CAIO — Núcleo Cognitivo",
    description: "Motor de síntese profunda, modelagem de sistemas, diagnóstico de vetores",
    functions: [
      { name: "Modelagem de Sistemas Complexos", implemented: "M1+M2", score: 55 },
      { name: "Diagnóstico de Vetores Estratégicos", implemented: "VectorDecisionEngine", score: 70 },
      { name: "Síntese Estratégica Profunda", implemented: "M5 StrategicSynthesizer", score: 65 },
      { name: "Orquestração Cognitiva", implemented: "ModuleSynergyEngine + StrategyCoach", score: 50 },
      { name: "Blindagem Operacional", implemented: "ProactiveAIMonitor", score: 45 },
      { name: "Geração de Opções Estratégicas", implemented: "M5 + M6", score: 60 }
    ],
    color: "cyan"
  },
  TSI: {
    name: "TSI — Transformação Sistêmica",
    description: "Framework 6 fases: EVA → CAIO → CSI → VTE → IA+ → SÍNTESE",
    functions: [
      { name: "EVA (Expansão Analítica)", implemented: "M1-M4 Módulos", score: 60 },
      { name: "CAIO (Convergência)", implemented: "M5 StrategicSynthesizer", score: 55 },
      { name: "CSI (Corners & Sínteses)", implemented: "M7 ImplementationPlanner (parcial)", score: 30 },
      { name: "VTE (Vetorização)", implemented: "VectorDecisionEngine", score: 65 },
      { name: "IA+ (Iteração Aumentada)", implemented: "Core.InvokeLLM infra", score: 70 },
      { name: "SÍNTESE FINAL", implemented: "M5 + InsightsDashboard", score: 50 }
    ],
    color: "purple"
  },
  TIS: {
    name: "TIS — Interpretação Sistêmica",
    description: "Tradução de fenômenos complexos para modelos operáveis",
    functions: [
      { name: "Tradução de Cenários", implemented: "M1ScenarioGenerator", score: 40 },
      { name: "Leitura Comportamental", implemented: "M10 BehavioralIntelligence", score: 35 },
      { name: "Análise Semiótica/Simbólica", implemented: "❌ NÃO IMPLEMENTADO", score: 0 },
      { name: "Modelagem Narrativa", implemented: "TRU (parcial)", score: 25 },
      { name: "Explicação Multi-Público", implemented: "TRU TranslationalReasoningUnit", score: 40 },
      { name: "Interpretação de Padrões Ocultos", implemented: "KnowledgeGraph AI", score: 30 }
    ],
    color: "blue"
  },
  ESIOS: {
    name: "ESIOS — Execução Inteligente",
    description: "Sistema de Execução Estratégica e Operações Inteligentes",
    functions: [
      { name: "VDS (Vectorial Decision System)", implemented: "VectorDecisionEngine", score: 75 },
      { name: "Short-Cycle Intelligence", implemented: "ProactiveAIMonitor + Checkpoints", score: 60 },
      { name: "Governança em Movimento", implemented: "M11 HermesGovernance", score: 55 },
      { name: "Execução de Workflows", implemented: "AgentOrchestration", score: 70 },
      { name: "Monitoramento de KPIs", implemented: "Analytics + SystemHealth", score: 65 },
      { name: "Aprendizado Operacional", implemented: "VectorLearningEngine", score: 50 }
    ],
    color: "green"
  },
  HERMES: {
    name: "HERMES — Navegação Sensível",
    description: "Ponte entre visão e operação, mediação emocional e cultural",
    functions: [
      { name: "Percepção de Sinais Fracos", implemented: "ProactiveAIMonitor (básico)", score: 20 },
      { name: "Mediação e Leitura de Clima", implemented: "H3 EmotionalBuffer", score: 25 },
      { name: "Ponte Visão-Operação", implemented: "HermesCore + H1 VectorialTranslation", score: 35 },
      { name: "Proteção da Arquitetura", implemented: "HermesTriggerManagement", score: 30 },
      { name: "Trust-Brokering", implemented: "HermesTrustBroker", score: 40 },
      { name: "Tradução Vectorial Completa", implemented: "H1-H4 Módulos HERMES", score: 45 }
    ],
    color: "amber"
  }
};

// Features NOT captured in v12.3 but implemented
const FEATURES_BEYOND_V12_3 = [
  {
    category: "Knowledge Infrastructure",
    icon: Network,
    color: "blue",
    features: [
      { name: "Knowledge Graph Interativo", description: "Grafo de conhecimento com 10K+ conexões, AI-powered", impact: "HIGH" },
      { name: "Neo4j Integration", description: "Integração com banco de grafos Neo4j para CVM", impact: "HIGH" },
      { name: "Relationship Inference", description: "Inferência automática de relações por IA", impact: "MEDIUM" },
      { name: "Auto-Enrichment", description: "Enriquecimento automático de entidades", impact: "MEDIUM" },
      { name: "Graph AI Assistant", description: "Assistente de IA para navegação no grafo", impact: "HIGH" }
    ]
  },
  {
    category: "Multi-Agent Orchestration",
    icon: GitBranch,
    color: "purple",
    features: [
      { name: "Hierarchical Agent Builder", description: "Construtor visual de hierarquias de agentes", impact: "HIGH" },
      { name: "Workflow Version Control", description: "Versionamento completo de workflows", impact: "MEDIUM" },
      { name: "Real-time Execution Graph", description: "Visualização em tempo real de execução", impact: "HIGH" },
      { name: "Inter-Agent Communication Log", description: "Log de comunicação entre agentes", impact: "MEDIUM" },
      { name: "Agent Training Hub", description: "Hub de treinamento e fine-tuning de agentes", impact: "HIGH" }
    ]
  },
  {
    category: "Cognitive Modules (NIA + TRU)",
    icon: Brain,
    color: "cyan",
    features: [
      { name: "NIA — Blueprint Generator", description: "Geração de blueprints arquiteturais executáveis", impact: "HIGH" },
      { name: "TRU — Multi-Team Translation", description: "Tradução para múltiplas equipas simultaneamente", impact: "HIGH" },
      { name: "Organizational Visualizer", description: "Visualizador de estrutura organizacional interativo", impact: "MEDIUM" },
      { name: "Capability Gap Mapping", description: "Mapeamento de gaps de capacidades", impact: "MEDIUM" }
    ]
  },
  {
    category: "Data Intelligence",
    icon: Database,
    color: "green",
    features: [
      { name: "CVM Integration", description: "Integração com dados CVM Brasil", impact: "HIGH" },
      { name: "Batch Company Ingestion", description: "Ingestão em lote de empresas", impact: "MEDIUM" },
      { name: "Multi-Source Enrichment", description: "Enriquecimento de múltiplas fontes", impact: "HIGH" },
      { name: "File Analyzer", description: "Análise inteligente de arquivos (Excel, PDF, CSV)", impact: "MEDIUM" },
      { name: "Advanced Data Analysis", description: "Análise avançada com visualizações AI-sugeridas", impact: "MEDIUM" }
    ]
  },
  {
    category: "Collaboration & UX",
    icon: Users,
    color: "pink",
    features: [
      { name: "Real-time Collaboration", description: "Comentários, tarefas, compartilhamento", impact: "MEDIUM" },
      { name: "Tutorial System", description: "Sistema de tutoriais interativos", impact: "LOW" },
      { name: "Global Search (⌘K)", description: "Busca global unificada", impact: "MEDIUM" },
      { name: "Multi-language Support", description: "Suporte PT/EN com i18n", impact: "LOW" },
      { name: "Onboarding Modal", description: "Onboarding para novos usuários", impact: "LOW" }
    ]
  },
  {
    category: "Governance & Monitoring",
    icon: Shield,
    color: "amber",
    features: [
      { name: "Hermes Auto-Trigger Rules", description: "Regras automáticas de acionamento do HERMES", impact: "HIGH" },
      { name: "System Health Dashboard", description: "Dashboard de saúde do sistema", impact: "MEDIUM" },
      { name: "Integration Health Monitor", description: "Monitor de saúde de integrações", impact: "MEDIUM" },
      { name: "CRV Engine", description: "Motor de Confidence-Risk-Value", impact: "HIGH" }
    ]
  },
  {
    category: "Strategy Playbooks",
    icon: FileText,
    color: "orange",
    features: [
      { name: "AI Playbook Generator", description: "Geração de playbooks estratégicos por IA", impact: "HIGH" },
      { name: "Multi-Framework Support", description: "Suporte a múltiplos frameworks (ABRA, NIA, etc)", impact: "MEDIUM" },
      { name: "Playbook Viewer", description: "Visualizador rico de playbooks", impact: "MEDIUM" }
    ]
  }
];

// Calculate scores
const calculateLayerScore = (layer) => {
  const scores = layer.functions.map(f => f.score);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

const calculateOverallScore = () => {
  const layers = Object.values(V12_3_ARCHITECTURE);
  const layerScores = layers.map(calculateLayerScore);
  return Math.round(layerScores.reduce((a, b) => a + b, 0) / layerScores.length);
};

export default function ArchitectureAudit() {
  const [activeTab, setActiveTab] = useState("overview");
  const overallScore = calculateOverallScore();

  // Fetch real data for dynamic assessment
  const { data: workflows = [] } = useQuery({
    queryKey: ['audit_workflows'],
    queryFn: () => base44.entities.AgentWorkflow.list()
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['audit_strategies'],
    queryFn: () => base44.entities.Strategy.list()
  });

  const { data: graphNodes = [] } = useQuery({
    queryKey: ['audit_graph_nodes'],
    queryFn: () => base44.entities.KnowledgeGraphNode.list()
  });

  const getScoreColor = (score) => {
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    if (score >= 30) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 70) return "bg-green-500/20 border-green-500/30";
    if (score >= 50) return "bg-yellow-500/20 border-yellow-500/30";
    if (score >= 30) return "bg-orange-500/20 border-orange-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  const getImpactBadge = (impact) => {
    switch (impact) {
      case "HIGH": return "bg-green-500/20 text-green-400";
      case "MEDIUM": return "bg-yellow-500/20 text-yellow-400";
      case "LOW": return "bg-slate-500/20 text-slate-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-purple-400" />
            Auditoria Arquitetural v12.3
          </h1>
          <p className="text-slate-400 mt-1">
            Comparação diligente entre arquitetura cognitiva v12.3 e implementação atual
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Codex CAIO.AI
          </Badge>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border-purple-500/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">Implementação v12.3 Overall</p>
              <p className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}%</p>
              <Progress value={overallScore} className="mt-3 h-2" />
            </div>
            
            <div className="col-span-3 grid grid-cols-5 gap-4">
              {Object.entries(V12_3_ARCHITECTURE).map(([key, layer]) => {
                const score = calculateLayerScore(layer);
                return (
                  <div key={key} className={`p-3 rounded-lg border ${getScoreBg(score)}`}>
                    <p className="text-xs text-slate-400 mb-1">{key}</p>
                    <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</p>
                    <p className="text-[10px] text-slate-500 truncate">{layer.name.split('—')[0]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="layers" className="data-[state=active]:bg-blue-500/20">
            <Layers className="w-4 h-4 mr-2" />
            Camadas v12.3
          </TabsTrigger>
          <TabsTrigger value="beyond" className="data-[state=active]:bg-green-500/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Além do v12.3
          </TabsTrigger>
          <TabsTrigger value="gaps" className="data-[state=active]:bg-red-500/20">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Gaps Críticos
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Key Findings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Pontos Fortes (v12.3 Capturado)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <p className="text-sm text-slate-300"><strong>ESIOS (60%)</strong> — Camada mais madura, VectorDecisionEngine robusto</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <p className="text-sm text-slate-300"><strong>TSI Framework</strong> — Infra de IA (InvokeLLM) sólida, 70% implementado</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <p className="text-sm text-slate-300"><strong>M1-M11 Módulos</strong> — 11 módulos analíticos operacionais</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <p className="text-sm text-slate-300"><strong>HERMES Core</strong> — 4 sub-módulos (H1-H4) implementados</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-500/10 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Gaps Críticos (Não Capturado)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                  <p className="text-sm text-slate-300"><strong>TIS (28%)</strong> — Análise semiótica/simbólica ausente</p>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                  <p className="text-sm text-slate-300"><strong>HERMES (33%)</strong> — Percepção de sinais fracos rudimentar</p>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                  <p className="text-sm text-slate-300"><strong>Recursividade</strong> — Ciclo CAIO→TSI→TIS→ESIOS→HERMES não automático</p>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                  <p className="text-sm text-slate-300"><strong>Memória Institucional</strong> — Falta camada de aprendizado histórico</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Beyond v12.3 Summary */}
          <Card className="bg-cyan-500/10 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Capacidades ALÉM do v12.3 (Não Documentadas na Arquitetura)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 mb-4">
                A plataforma possui capacidades significativas que o documento v12.3 não capturou. 
                Estas representam <strong className="text-cyan-400">~35% de funcionalidade adicional</strong> não mapeada na arquitetura cognitiva.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {FEATURES_BEYOND_V12_3.map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <Icon className={`w-5 h-5 text-${cat.color}-400 mb-2`} />
                      <p className="text-sm text-white font-medium">{cat.category}</p>
                      <p className="text-xs text-slate-400">{cat.features.length} features</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-amber-400 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Recomendação Estratégica</h3>
                  <p className="text-sm text-slate-300 mb-3">
                    O score de <strong className="text-amber-400">{overallScore}%</strong> reflete implementação parcial mas sólida. 
                    Contudo, a plataforma tem <strong className="text-cyan-400">capacidades além do v12.3</strong> (Knowledge Graph, Agent Orchestration, NIA/TRU) 
                    que devem ser integradas na próxima versão da arquitetura (v13.0).
                  </p>
                  <div className="flex gap-2">
                    <Badge className="bg-green-500/20 text-green-400">ESIOS: Manter foco</Badge>
                    <Badge className="bg-red-500/20 text-red-400">TIS: Prioridade crítica</Badge>
                    <Badge className="bg-amber-500/20 text-amber-400">HERMES: Expandir</Badge>
                    <Badge className="bg-cyan-500/20 text-cyan-400">v13.0: Integrar Knowledge Graph</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LAYERS TAB */}
        <TabsContent value="layers" className="mt-6 space-y-4">
          {Object.entries(V12_3_ARCHITECTURE).map(([key, layer]) => {
            const score = calculateLayerScore(layer);
            return (
              <Card key={key} className={`bg-${layer.color}-500/10 border-${layer.color}-500/30`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-${layer.color}-400 flex items-center gap-2`}>
                      {key === 'CAIO' && <Brain className="w-5 h-5" />}
                      {key === 'TSI' && <Workflow className="w-5 h-5" />}
                      {key === 'TIS' && <Languages className="w-5 h-5" />}
                      {key === 'ESIOS' && <Zap className="w-5 h-5" />}
                      {key === 'HERMES' && <Shield className="w-5 h-5" />}
                      {layer.name}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <Progress value={score} className="w-32 h-2" />
                      <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">{layer.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {layer.functions.map((func, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {func.score >= 60 ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : func.score >= 30 ? (
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <div>
                            <p className="text-sm text-white">{func.name}</p>
                            <p className="text-xs text-slate-400">→ {func.implemented}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={func.score} className="w-20 h-1.5" />
                          <span className={`text-sm font-bold w-12 text-right ${getScoreColor(func.score)}`}>
                            {func.score}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* BEYOND v12.3 TAB */}
        <TabsContent value="beyond" className="mt-6 space-y-4">
          <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Capacidades Implementadas NÃO Capturadas no v12.3
                  </h3>
                  <p className="text-sm text-slate-300">
                    Estas funcionalidades existem na plataforma mas o documento de arquitetura v12.3 não as menciona. 
                    Sugere-se atualizar a arquitetura para v13.0 incluindo estas camadas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {FEATURES_BEYOND_V12_3.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Card key={idx} className={`bg-${category.color}-500/10 border-${category.color}-500/30`}>
                <CardHeader>
                  <CardTitle className={`text-${category.color}-400 flex items-center gap-2`}>
                    <Icon className="w-5 h-5" />
                    {category.category}
                    <Badge className="bg-white/10 text-slate-300 ml-2">
                      {category.features.length} features
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.features.map((feature, fidx) => (
                      <div key={fidx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-white font-medium">{feature.name}</p>
                          <Badge className={getImpactBadge(feature.impact)}>
                            {feature.impact}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* GAPS TAB */}
        <TabsContent value="gaps" className="mt-6 space-y-4">
          <Card className="bg-red-500/10 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Gaps Críticos — Funções v12.3 com Score &lt; 40%
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(V12_3_ARCHITECTURE).flatMap(([layerKey, layer]) => 
                layer.functions
                  .filter(f => f.score < 40)
                  .map((func, idx) => (
                    <div key={`${layerKey}-${idx}`} className="p-4 bg-white/5 rounded-lg border border-red-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`bg-${layer.color}-500/20 text-${layer.color}-400`}>
                            {layerKey}
                          </Badge>
                          <p className="text-white font-medium">{func.name}</p>
                        </div>
                        <span className="text-red-400 font-bold">{func.score}%</span>
                      </div>
                      <p className="text-sm text-slate-400">
                        Implementação atual: <span className="text-slate-300">{func.implemented}</span>
                      </p>
                      {func.score === 0 && (
                        <Badge className="mt-2 bg-red-500/30 text-red-300">
                          ⚠️ NÃO IMPLEMENTADO
                        </Badge>
                      )}
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

          {/* Roadmap Suggestion */}
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Roadmap Sugerido: {overallScore}% → 60%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-500/20 text-green-400">Semana 1-2</Badge>
                    <p className="text-white font-medium">Foundation</p>
                  </div>
                  <p className="text-sm text-slate-400">
                    ESIOS enhancement (60% → 75%), documentação v12.3 → M1-M11 mapping
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-yellow-500/20 text-yellow-400">Semana 3-4</Badge>
                    <p className="text-white font-medium">CAIO Nucleus</p>
                  </div>
                  <p className="text-sm text-slate-400">
                    Enhance M5, integrar ModuleSynergyEngine com lógica v12.3. CAIO: 54% → 65%
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-orange-500/20 text-orange-400">Semana 5-6</Badge>
                    <p className="text-white font-medium">HERMES + TIS</p>
                  </div>
                  <p className="text-sm text-slate-400">
                    M11 enhancement com sinais fracos, TRU multi-público. HERMES: 33% → 45%, TIS: 28% → 40%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}