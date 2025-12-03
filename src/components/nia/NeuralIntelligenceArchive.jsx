import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Database, Search, Clock, CheckCircle, AlertTriangle,
  TrendingUp, MessageSquare, Lightbulb, ArrowRight, RefreshCw,
  Sparkles, BookOpen, History, Target, Zap, ThumbsUp, ThumbsDown,
  Plus, Filter, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

/**
 * NIA — NEURAL INTELLIGENCE ARCHIVE
 * 
 * Camada de Memória Institucional e Aprendizado Contínuo
 * - Persistência de histórico de decisões
 * - Aprendizado a partir de feedback
 * - Recuperação de precedentes históricos
 */

export default function NeuralIntelligenceArchive({ onPrecedentSelect }) {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const queryClient = useQueryClient();

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['institutional_memories'],
    queryFn: () => base44.entities.InstitutionalMemory.list('-created_date', 50)
  });

  const { data: recentDecisions = [] } = useQuery({
    queryKey: ['recent_vector_decisions'],
    queryFn: () => base44.entities.VectorDecision.list('-created_date', 10)
  });

  const { data: recentExecutions = [] } = useQuery({
    queryKey: ['recent_workflow_executions'],
    queryFn: () => base44.entities.WorkflowExecution.list('-created_date', 10)
  });

  const createMemoryMutation = useMutation({
    mutationFn: (data) => base44.entities.InstitutionalMemory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['institutional_memories']);
      toast.success('Memória institucional registrada');
      setShowAddMemory(false);
    }
  });

  const addFeedbackMutation = useMutation({
    mutationFn: async ({ memoryId, feedback }) => {
      const memory = memories.find(m => m.id === memoryId);
      const updatedFeedback = [...(memory.feedback || []), feedback];
      return base44.entities.InstitutionalMemory.update(memoryId, { 
        feedback: updatedFeedback 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['institutional_memories']);
      toast.success('Feedback registrado');
    }
  });

  // Semantic search for precedents
  const searchPrecedents = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a precedent search engine for institutional memory. 
Given the following query and available memories, find the most relevant precedents.

QUERY: "${searchQuery}"

AVAILABLE MEMORIES:
${JSON.stringify(memories.slice(0, 20).map(m => ({
  id: m.id,
  title: m.title,
  type: m.memory_type,
  context: m.context?.situation,
  outcome: m.outcome?.result,
  lessons: m.lessons?.map(l => l.lesson).slice(0, 3),
  tags: m.tags
})), null, 2)}

Return JSON with relevant precedents:
{
  "results": [
    {
      "memory_id": "id",
      "relevance_score": 0-100,
      "match_reason": "why this is relevant",
      "applicable_lessons": ["lesson1", "lesson2"],
      "key_differences": ["difference from current situation"],
      "recommendation": "how to apply this precedent"
    }
  ],
  "synthesis": "Overall insight from searching these precedents",
  "caution": "What to be careful about when applying these precedents"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            results: { type: "array", items: { type: "object" } },
            synthesis: { type: "string" },
            caution: { type: "string" }
          }
        }
      });

      // Enrich results with full memory data
      const enrichedResults = result.results?.map(r => ({
        ...r,
        memory: memories.find(m => m.id === r.memory_id)
      })).filter(r => r.memory) || [];

      setSearchResults({ ...result, results: enrichedResults });
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Erro na busca de precedentes");
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-capture from recent decisions
  const captureFromDecision = async (decision) => {
    const memoryData = {
      memory_type: "decision",
      title: decision.title,
      context: {
        situation: decision.primary_vector?.name,
        constraints: decision.opposing_forces?.map(f => f.description) || [],
        timeframe: `${decision.horizon_days} days`
      },
      decision_taken: {
        choice: decision.recommended_decision,
        rationale: decision.decision_rationale,
        confidence_level: decision.ai_validation?.consistency_score || 0
      },
      outcome: {
        result: decision.status === 'completed' ? 'success' : 'pending'
      },
      related_entities: {
        vector_decision_ids: [decision.id]
      },
      tags: [decision.context_type, decision.primary_vector?.direction].filter(Boolean)
    };

    createMemoryMutation.mutate(memoryData);
  };

  const getTypeColor = (type) => {
    const colors = {
      decision: "bg-blue-500/20 text-blue-400",
      workflow_execution: "bg-purple-500/20 text-purple-400",
      strategy_outcome: "bg-green-500/20 text-green-400",
      lesson_learned: "bg-yellow-500/20 text-yellow-400",
      pattern_detected: "bg-cyan-500/20 text-cyan-400",
      precedent: "bg-amber-500/20 text-amber-400"
    };
    return colors[type] || "bg-slate-500/20 text-slate-400";
  };

  const getOutcomeIcon = (result) => {
    switch (result) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'partial_success': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'failure': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const stats = {
    total: memories.length,
    decisions: memories.filter(m => m.memory_type === 'decision').length,
    lessons: memories.filter(m => m.memory_type === 'lesson_learned').length,
    successRate: memories.filter(m => m.outcome?.result === 'success').length / 
                 Math.max(memories.filter(m => m.outcome?.result).length, 1) * 100
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xl">NIA — Neural Intelligence Archive</span>
                <p className="text-sm text-slate-400 font-normal">
                  Memória Institucional & Aprendizado Contínuo
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                <Database className="w-3 h-3 mr-1" />
                {stats.total} memórias
              </Badge>
              <Button
                size="sm"
                onClick={() => setShowAddMemory(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Registrar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-slate-400">Decisões Arquivadas</p>
              <p className="text-2xl font-bold text-white">{stats.decisions}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-slate-400">Lições Aprendidas</p>
              <p className="text-2xl font-bold text-white">{stats.lessons}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-slate-400">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-green-400">{Math.round(stats.successRate)}%</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-slate-400">Precedentes Usados</p>
              <p className="text-2xl font-bold text-white">
                {memories.reduce((sum, m) => sum + (m.retrieval_count || 0), 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="search" className="data-[state=active]:bg-indigo-500/20">
            <Search className="w-4 h-4 mr-2" />
            Buscar Precedentes
          </TabsTrigger>
          <TabsTrigger value="archive" className="data-[state=active]:bg-purple-500/20">
            <Database className="w-4 h-4 mr-2" />
            Arquivo
          </TabsTrigger>
          <TabsTrigger value="learning" className="data-[state=active]:bg-green-500/20">
            <Lightbulb className="w-4 h-4 mr-2" />
            Aprendizado
          </TabsTrigger>
          <TabsTrigger value="capture" className="data-[state=active]:bg-amber-500/20">
            <Zap className="w-4 h-4 mr-2" />
            Captura Automática
          </TabsTrigger>
        </TabsList>

        {/* SEARCH TAB */}
        <TabsContent value="search" className="mt-6 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Descreva a situação atual para buscar precedentes históricos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchPrecedents()}
                    className="pl-10 bg-white/5 border-white/10 text-white"
                  />
                </div>
                <Button
                  onClick={searchPrecedents}
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSearching ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Buscando...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />Buscar com IA</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Synthesis */}
              {searchResults.synthesis && (
                <Card className="bg-indigo-500/10 border-indigo-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-indigo-400 mb-1">Síntese da Busca</p>
                        <p className="text-sm text-slate-300">{searchResults.synthesis}</p>
                        {searchResults.caution && (
                          <p className="text-xs text-amber-400 mt-2">
                            ⚠️ {searchResults.caution}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results */}
              {searchResults.results.map((result, idx) => (
                <Card 
                  key={idx} 
                  className="bg-white/5 border-white/10 hover:border-indigo-500/30 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedMemory(result.memory);
                    onPrecedentSelect?.(result);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(result.memory?.memory_type)}>
                          {result.memory?.memory_type}
                        </Badge>
                        <h3 className="text-white font-medium">{result.memory?.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {getOutcomeIcon(result.memory?.outcome?.result)}
                        <Badge className="bg-green-500/20 text-green-400">
                          {result.relevance_score}% match
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-3">{result.match_reason}</p>
                    
                    {result.applicable_lessons?.length > 0 && (
                      <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20 mb-2">
                        <p className="text-xs text-yellow-400 mb-1">Lições Aplicáveis:</p>
                        {result.applicable_lessons.map((lesson, i) => (
                          <p key={i} className="text-xs text-slate-300 flex items-start gap-1">
                            <Lightbulb className="w-3 h-3 text-yellow-400 mt-0.5" />
                            {lesson}
                          </p>
                        ))}
                      </div>
                    )}

                    {result.recommendation && (
                      <div className="p-2 bg-indigo-500/10 rounded border border-indigo-500/20">
                        <p className="text-xs text-indigo-400 mb-1">Recomendação:</p>
                        <p className="text-xs text-slate-300">{result.recommendation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* ARCHIVE TAB */}
        <TabsContent value="archive" className="mt-6 space-y-4">
          {memories.map((memory, idx) => (
            <Card 
              key={memory.id} 
              className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-all"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(memory.memory_type)}>
                      {memory.memory_type}
                    </Badge>
                    <h3 className="text-white font-medium">{memory.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getOutcomeIcon(memory.outcome?.result)}
                    <span className="text-xs text-slate-500">
                      {format(new Date(memory.created_date), 'dd/MM/yy')}
                    </span>
                  </div>
                </div>

                {memory.context?.situation && (
                  <p className="text-sm text-slate-400 mb-2">{memory.context.situation}</p>
                )}

                {memory.lessons?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {memory.lessons.slice(0, 2).map((l, i) => (
                      <Badge key={i} className="bg-yellow-500/10 text-yellow-400 text-xs">
                        {l.lesson.slice(0, 40)}...
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Feedback Section */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Recuperado {memory.retrieval_count || 0}x
                    </span>
                    {memory.feedback?.length > 0 && (
                      <Badge className="bg-white/10 text-slate-400 text-xs">
                        {memory.feedback.length} feedback
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addFeedbackMutation.mutate({
                        memoryId: memory.id,
                        feedback: {
                          source: 'human',
                          feedback_type: 'validation',
                          content: 'Útil',
                          timestamp: new Date().toISOString(),
                          applied: true
                        }
                      })}
                      className="text-green-400 hover:bg-green-500/10 h-7 px-2"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addFeedbackMutation.mutate({
                        memoryId: memory.id,
                        feedback: {
                          source: 'human',
                          feedback_type: 'correction',
                          content: 'Precisa revisão',
                          timestamp: new Date().toISOString(),
                          applied: false
                        }
                      })}
                      className="text-red-400 hover:bg-red-500/10 h-7 px-2"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* LEARNING TAB */}
        <TabsContent value="learning" className="mt-6">
          <LearningInsightsPanel memories={memories} />
        </TabsContent>

        {/* CAPTURE TAB */}
        <TabsContent value="capture" className="mt-6 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Decisões Vetoriais Recentes (Captura Automática)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentDecisions.map(decision => {
                const alreadyCaptured = memories.some(
                  m => m.related_entities?.vector_decision_ids?.includes(decision.id)
                );
                return (
                  <div 
                    key={decision.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div>
                      <p className="text-sm text-white">{decision.title}</p>
                      <p className="text-xs text-slate-400">{decision.context_type}</p>
                    </div>
                    {alreadyCaptured ? (
                      <Badge className="bg-green-500/20 text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Capturado
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => captureFromDecision(decision)}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Capturar
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Memory Modal */}
      <AnimatePresence>
        {showAddMemory && (
          <AddMemoryModal 
            onClose={() => setShowAddMemory(false)}
            onSave={(data) => createMemoryMutation.mutate(data)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Learning Insights Panel
function LearningInsightsPanel({ memories }) {
  const [insights, setInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateLearningInsights = async () => {
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the following institutional memories and extract learning patterns:

MEMORIES:
${JSON.stringify(memories.slice(0, 30).map(m => ({
  type: m.memory_type,
  title: m.title,
  context: m.context,
  outcome: m.outcome,
  lessons: m.lessons,
  feedback: m.feedback
})), null, 2)}

Generate learning insights in JSON:
{
  "success_patterns": [
    {"pattern": "what leads to success", "frequency": "how often", "confidence": 0-100}
  ],
  "failure_patterns": [
    {"pattern": "what leads to failure", "avoidance_strategy": "how to avoid"}
  ],
  "emerging_themes": ["theme1", "theme2"],
  "capability_gaps": [
    {"gap": "identified gap", "recommendation": "how to address"}
  ],
  "top_lessons": [
    {"lesson": "key learning", "applicability": "when to apply", "source_count": number}
  ],
  "feedback_synthesis": {
    "positive_rate": 0-100,
    "common_corrections": ["correction1"],
    "improvement_areas": ["area1"]
  },
  "strategic_recommendations": ["recommendation1", "recommendation2"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            success_patterns: { type: "array", items: { type: "object" } },
            failure_patterns: { type: "array", items: { type: "object" } },
            emerging_themes: { type: "array", items: { type: "string" } },
            capability_gaps: { type: "array", items: { type: "object" } },
            top_lessons: { type: "array", items: { type: "object" } },
            feedback_synthesis: { type: "object" },
            strategic_recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
      setInsights(result);
    } catch (error) {
      console.error("Learning analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={generateLearningInsights}
        disabled={isAnalyzing || memories.length === 0}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
      >
        {isAnalyzing ? (
          <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Analisando Padrões de Aprendizado...</>
        ) : (
          <><Brain className="w-4 h-4 mr-2" />Gerar Insights de Aprendizado</>
        )}
      </Button>

      {insights && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Success Patterns */}
          <Card className="bg-green-500/10 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Padrões de Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.success_patterns?.map((p, i) => (
                <div key={i} className="p-2 bg-white/5 rounded">
                  <p className="text-sm text-white">{p.pattern}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-green-500/20 text-green-400 text-xs">
                      {p.confidence}% confiança
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Lessons */}
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-yellow-400 text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Principais Lições
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.top_lessons?.map((l, i) => (
                <div key={i} className="p-2 bg-white/5 rounded">
                  <p className="text-sm text-white">{l.lesson}</p>
                  <p className="text-xs text-slate-400 mt-1">Aplicar: {l.applicability}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strategic Recommendations */}
          <Card className="bg-indigo-500/10 border-indigo-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-indigo-400 text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Recomendações Estratégicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.strategic_recommendations?.map((r, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <ArrowRight className="w-4 h-4 text-indigo-400 mt-0.5" />
                  <p className="text-sm text-slate-300">{r}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// Add Memory Modal
function AddMemoryModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    memory_type: 'lesson_learned',
    title: '',
    context: { situation: '' },
    lessons: [{ lesson: '', category: 'strategic', applicability: '' }],
    tags: []
  });

  const handleSubmit = () => {
    if (!formData.title) return;
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-lg max-h-[80vh] overflow-y-auto"
      >
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Registrar Memória Institucional
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400">Tipo</label>
              <select
                value={formData.memory_type}
                onChange={(e) => setFormData({ ...formData, memory_type: e.target.value })}
                className="w-full mt-1 p-2 bg-white/5 border border-white/10 rounded text-white"
              >
                <option value="decision">Decisão</option>
                <option value="lesson_learned">Lição Aprendida</option>
                <option value="pattern_detected">Padrão Detectado</option>
                <option value="precedent">Precedente</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">Título</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título descritivo da memória"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Contexto / Situação</label>
              <Textarea
                value={formData.context.situation}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  context: { ...formData.context, situation: e.target.value } 
                })}
                placeholder="Descreva a situação e contexto"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Lição Principal</label>
              <Textarea
                value={formData.lessons[0].lesson}
                onChange={(e) => setFormData({
                  ...formData,
                  lessons: [{ ...formData.lessons[0], lesson: e.target.value }]
                })}
                placeholder="Qual é a lição aprendida?"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Tags (separadas por vírgula)</label>
              <Input
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                })}
                placeholder="mercado, estratégia, risco"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 text-white">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.title}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              Salvar
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}