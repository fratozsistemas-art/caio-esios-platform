import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Lightbulb, RefreshCw, Sparkles, Target, BarChart3, Zap,
  BookOpen, ArrowRight, Clock, Play, Pause, Settings, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

/**
 * NIA LEARNING ENGINE
 * 
 * Continuous learning system that:
 * 1. Analyzes feedback on institutional memories
 * 2. Identifies patterns in successful/failed strategies
 * 3. Proactively suggests R&D decision-making updates
 * 4. Auto-generates "lessons learned" from negative outcomes
 */

const PATTERN_TYPES = [
  { id: 'success', label: 'Padrão de Sucesso', icon: TrendingUp, color: 'emerald' },
  { id: 'failure', label: 'Padrão de Falha', icon: TrendingDown, color: 'red' },
  { id: 'risk', label: 'Indicador de Risco', icon: AlertTriangle, color: 'amber' },
  { id: 'opportunity', label: 'Oportunidade Emergente', icon: Lightbulb, color: 'cyan' }
];

const LEARNING_CATEGORIES = [
  'strategic', 'operational', 'tactical', 'cultural', 'technical', 'financial', 'market'
];

export default function NIALearningEngine({ onInsightGenerated }) {
  const [activeTab, setActiveTab] = useState("patterns");
  const [isLearning, setIsLearning] = useState(false);
  const [autoLearnEnabled, setAutoLearnEnabled] = useState(true);
  const [learningResults, setLearningResults] = useState(null);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const queryClient = useQueryClient();

  // Fetch institutional memories
  const { data: memories = [], isLoading: memoriesLoading } = useQuery({
    queryKey: ['nia_memories_for_learning'],
    queryFn: () => base44.entities.InstitutionalMemory.list('-created_date', 100)
  });

  // Fetch vector decisions for outcome analysis
  const { data: decisions = [] } = useQuery({
    queryKey: ['vector_decisions_for_learning'],
    queryFn: () => base44.entities.VectorDecision.list('-created_date', 50)
  });

  // Fetch existing strategies for correlation
  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies_for_learning'],
    queryFn: () => base44.entities.Strategy.list('-created_date', 50)
  });

  // Create lesson learned mutation
  const createLessonMutation = useMutation({
    mutationFn: (data) => base44.entities.InstitutionalMemory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['nia_memories_for_learning']);
      toast.success('Lição aprendida registrada!');
    }
  });

  // Calculate learning metrics
  const learningMetrics = React.useMemo(() => {
    const memoriesWithFeedback = memories.filter(m => m.feedback?.length > 0);
    const successOutcomes = memories.filter(m => m.outcome?.result === 'success').length;
    const failureOutcomes = memories.filter(m => m.outcome?.result === 'failure').length;
    const totalWithOutcome = memories.filter(m => m.outcome?.result).length;
    
    const feedbackApplied = memoriesWithFeedback.filter(m => 
      m.feedback?.some(f => f.applied)
    ).length;

    return {
      totalMemories: memories.length,
      memoriesWithFeedback: memoriesWithFeedback.length,
      feedbackApplicationRate: memoriesWithFeedback.length > 0 
        ? (feedbackApplied / memoriesWithFeedback.length * 100) : 0,
      successRate: totalWithOutcome > 0 ? (successOutcomes / totalWithOutcome * 100) : 0,
      failureRate: totalWithOutcome > 0 ? (failureOutcomes / totalWithOutcome * 100) : 0,
      lessonsCount: memories.filter(m => m.memory_type === 'lesson_learned').length,
      patternsDetected: memories.filter(m => m.memory_type === 'pattern_detected').length
    };
  }, [memories]);

  // Run pattern analysis
  const runPatternAnalysis = async () => {
    setIsLearning(true);
    try {
      const memoriesContext = memories.slice(0, 30).map(m => ({
        type: m.memory_type,
        title: m.title,
        outcome: m.outcome?.result,
        lessons: m.lessons?.map(l => l.lesson),
        feedback: m.feedback?.map(f => ({ type: f.feedback_type, content: f.content })),
        context: m.context?.situation,
        decision: m.decision_taken?.choice
      }));

      const decisionsContext = decisions.slice(0, 20).map(d => ({
        title: d.title,
        status: d.status,
        direction: d.primary_vector?.direction,
        intensity: d.primary_vector?.intensity,
        aiValidation: d.ai_validation
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI Learning Engine for institutional memory. Analyze the following data to identify patterns, generate lessons learned, and suggest R&D improvements.

INSTITUTIONAL MEMORIES:
${JSON.stringify(memoriesContext, null, 2)}

VECTOR DECISIONS:
${JSON.stringify(decisionsContext, null, 2)}

CURRENT METRICS:
- Total Memories: ${learningMetrics.totalMemories}
- Success Rate: ${learningMetrics.successRate.toFixed(1)}%
- Failure Rate: ${learningMetrics.failureRate.toFixed(1)}%
- Feedback Application Rate: ${learningMetrics.feedbackApplicationRate.toFixed(1)}%

Perform deep analysis and return JSON:
{
  "patterns_identified": [
    {
      "pattern_id": "P001",
      "pattern_type": "success|failure|risk|opportunity",
      "pattern_name": "Name of the pattern",
      "description": "Detailed description",
      "frequency": 0-100,
      "confidence": 0-100,
      "evidence": ["evidence1", "evidence2"],
      "affected_areas": ["area1", "area2"],
      "correlation_strength": 0-100,
      "actionable_insight": "What to do about it"
    }
  ],
  "auto_generated_lessons": [
    {
      "lesson_id": "L001",
      "title": "Lesson title",
      "lesson": "The lesson learned",
      "category": "strategic|operational|tactical|cultural|technical|financial|market",
      "source_patterns": ["P001"],
      "applicability": "When this applies",
      "priority": "high|medium|low",
      "implementation_suggestion": "How to apply"
    }
  ],
  "rd_suggestions": [
    {
      "suggestion_id": "R001",
      "area": "decision_making|risk_assessment|opportunity_identification|resource_allocation",
      "current_gap": "What's missing or weak",
      "suggested_improvement": "Specific improvement",
      "expected_impact": "high|medium|low",
      "implementation_complexity": "high|medium|low",
      "supporting_evidence": ["evidence1"]
    }
  ],
  "negative_outcome_analysis": {
    "recurrent_failures": [
      {
        "failure_pattern": "Description of recurring failure",
        "occurrence_count": 0,
        "root_causes": ["cause1", "cause2"],
        "prevention_strategy": "How to prevent",
        "early_warning_signs": ["sign1", "sign2"]
      }
    ],
    "failure_correlation_matrix": {
      "strategic_misalignment": 0-100,
      "resource_constraints": 0-100,
      "market_timing": 0-100,
      "execution_gaps": 0-100,
      "external_factors": 0-100
    }
  },
  "learning_velocity": {
    "lessons_per_failure": 0,
    "pattern_detection_accuracy": 0-100,
    "feedback_integration_speed": "fast|medium|slow",
    "knowledge_reuse_rate": 0-100
  },
  "meta_insights": {
    "organizational_learning_maturity": "nascent|developing|established|advanced",
    "knowledge_gaps": ["gap1", "gap2"],
    "strength_areas": ["strength1", "strength2"],
    "recommended_focus": "Where to focus learning efforts"
  }
}`,
        response_json_schema: {
          type: "object",
          properties: {
            patterns_identified: { type: "array", items: { type: "object" } },
            auto_generated_lessons: { type: "array", items: { type: "object" } },
            rd_suggestions: { type: "array", items: { type: "object" } },
            negative_outcome_analysis: { type: "object" },
            learning_velocity: { type: "object" },
            meta_insights: { type: "object" }
          }
        }
      });

      setLearningResults(result);
      onInsightGenerated?.(result);
      toast.success('Análise de aprendizado concluída!');
    } catch (error) {
      console.error('Learning engine error:', error);
      toast.error('Erro na análise de aprendizado');
    } finally {
      setIsLearning(false);
    }
  };

  // Save auto-generated lesson
  const saveLesson = async (lesson) => {
    await createLessonMutation.mutateAsync({
      memory_type: 'lesson_learned',
      title: lesson.title,
      lessons: [{
        lesson: lesson.lesson,
        category: lesson.category,
        applicability: lesson.applicability
      }],
      tags: [lesson.category, lesson.priority, 'auto_generated'],
      context: {
        situation: `Auto-generated from pattern analysis: ${lesson.source_patterns?.join(', ')}`,
        constraints: [],
        timeframe: new Date().toISOString()
      },
      relevance_score: lesson.priority === 'high' ? 90 : lesson.priority === 'medium' ? 70 : 50
    });
  };

  // Save all lessons at once
  const saveAllLessons = async () => {
    if (!learningResults?.auto_generated_lessons?.length) return;
    
    for (const lesson of learningResults.auto_generated_lessons) {
      await saveLesson(lesson);
    }
    toast.success(`${learningResults.auto_generated_lessons.length} lições salvas!`);
  };

  const getPatternColor = (type) => {
    switch (type) {
      case 'success': return 'emerald';
      case 'failure': return 'red';
      case 'risk': return 'amber';
      case 'opportunity': return 'cyan';
      default: return 'slate';
    }
  };

  const getPatternIcon = (type) => {
    switch (type) {
      case 'success': return TrendingUp;
      case 'failure': return TrendingDown;
      case 'risk': return AlertTriangle;
      case 'opportunity': return Lightbulb;
      default: return Brain;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  NIA Learning Engine
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                </h2>
                <p className="text-sm text-slate-400">
                  Aprendizado contínuo • Identificação de padrões • Geração automática de lições
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Auto-Learn</span>
                <Switch
                  checked={autoLearnEnabled}
                  onCheckedChange={setAutoLearnEnabled}
                />
              </div>
              <Button
                onClick={runPatternAnalysis}
                disabled={isLearning || memoriesLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isLearning ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Analisando...</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" />Executar Análise</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Metrics Dashboard */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          icon={Brain}
          label="Memórias Analisadas"
          value={learningMetrics.totalMemories}
          color="purple"
        />
        <MetricCard
          icon={TrendingUp}
          label="Taxa de Sucesso"
          value={`${learningMetrics.successRate.toFixed(0)}%`}
          color="emerald"
          trend={learningMetrics.successRate > 50 ? 'up' : 'down'}
        />
        <MetricCard
          icon={CheckCircle}
          label="Feedback Aplicado"
          value={`${learningMetrics.feedbackApplicationRate.toFixed(0)}%`}
          color="blue"
        />
        <MetricCard
          icon={Lightbulb}
          label="Padrões Detectados"
          value={learningMetrics.patternsDetected}
          color="amber"
        />
      </div>

      {/* Main Content Tabs */}
      {learningResults && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="patterns" className="data-[state=active]:bg-purple-500/20">
              <Target className="w-4 h-4 mr-2" />
              Padrões ({learningResults.patterns_identified?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="lessons" className="data-[state=active]:bg-emerald-500/20">
              <BookOpen className="w-4 h-4 mr-2" />
              Lições ({learningResults.auto_generated_lessons?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="rd" className="data-[state=active]:bg-blue-500/20">
              <Zap className="w-4 h-4 mr-2" />
              Sugestões R&D ({learningResults.rd_suggestions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="failures" className="data-[state=active]:bg-red-500/20">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Análise de Falhas
            </TabsTrigger>
            <TabsTrigger value="meta" className="data-[state=active]:bg-cyan-500/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Meta-Insights
            </TabsTrigger>
          </TabsList>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {learningResults.patterns_identified?.map((pattern, idx) => {
                const color = getPatternColor(pattern.pattern_type);
                const Icon = getPatternIcon(pattern.pattern_type);
                
                return (
                  <motion.div
                    key={pattern.pattern_id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card 
                      className={`bg-${color}-500/10 border-${color}-500/30 cursor-pointer hover:bg-${color}-500/20 transition-all`}
                      onClick={() => setSelectedPattern(pattern)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg bg-${color}-500/20`}>
                              <Icon className={`w-5 h-5 text-${color}-400`} />
                            </div>
                            <div>
                              <p className="text-white font-medium">{pattern.pattern_name}</p>
                              <Badge className={`bg-${color}-500/20 text-${color}-400 text-xs`}>
                                {pattern.pattern_type}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold text-${color}-400`}>{pattern.confidence}%</p>
                            <p className="text-xs text-slate-500">confiança</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{pattern.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {pattern.affected_areas?.slice(0, 3).map((area, i) => (
                              <Badge key={i} className="bg-white/10 text-slate-400 text-xs">{area}</Badge>
                            ))}
                          </div>
                          <Badge className="bg-white/10 text-slate-400">
                            Freq: {pattern.frequency}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="mt-6 space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={saveAllLessons}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Salvar Todas as Lições
              </Button>
            </div>
            
            <div className="space-y-3">
              {learningResults.auto_generated_lessons?.map((lesson, idx) => (
                <motion.div
                  key={lesson.lesson_id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-white font-medium">{lesson.title}</h4>
                            <Badge className={`text-xs ${
                              lesson.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              lesson.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {lesson.priority}
                            </Badge>
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                              {lesson.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{lesson.lesson}</p>
                          <p className="text-xs text-slate-500 mb-2">
                            <strong>Aplicabilidade:</strong> {lesson.applicability}
                          </p>
                          <p className="text-xs text-emerald-400">
                            → {lesson.implementation_suggestion}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => saveLesson(lesson)}
                          className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          Salvar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* R&D Suggestions Tab */}
          <TabsContent value="rd" className="mt-6 space-y-4">
            <div className="space-y-3">
              {learningResults.rd_suggestions?.map((suggestion, idx) => (
                <Card key={suggestion.suggestion_id || idx} className="bg-blue-500/10 border-blue-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/20">
                        <Zap className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-500/20 text-blue-400">{suggestion.area}</Badge>
                          <Badge className={`text-xs ${
                            suggestion.expected_impact === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                            suggestion.expected_impact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            Impacto: {suggestion.expected_impact}
                          </Badge>
                          <Badge className={`text-xs ${
                            suggestion.implementation_complexity === 'high' ? 'bg-red-500/20 text-red-400' :
                            suggestion.implementation_complexity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            Complexidade: {suggestion.implementation_complexity}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-slate-500">Gap Atual</p>
                            <p className="text-sm text-red-400">{suggestion.current_gap}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Melhoria Sugerida</p>
                            <p className="text-sm text-white">{suggestion.suggested_improvement}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Failure Analysis Tab */}
          <TabsContent value="failures" className="mt-6 space-y-4">
            {/* Correlation Matrix */}
            <Card className="bg-red-500/10 border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Matriz de Correlação de Falhas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(learningResults.negative_outcome_analysis?.failure_correlation_matrix || {}).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">{key.replace(/_/g, ' ')}</p>
                      <p className={`text-xl font-bold ${
                        value > 70 ? 'text-red-400' : value > 40 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {value}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recurrent Failures */}
            <div className="space-y-3">
              {learningResults.negative_outcome_analysis?.recurrent_failures?.map((failure, idx) => (
                <Card key={idx} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-red-500/20">
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-white font-medium">{failure.failure_pattern}</p>
                          <Badge className="bg-red-500/20 text-red-400 text-xs">
                            {failure.occurrence_count}x ocorrências
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Causas Raiz</p>
                            <div className="flex flex-wrap gap-1">
                              {failure.root_causes?.map((cause, i) => (
                                <Badge key={i} className="bg-red-500/10 text-red-400 text-xs">{cause}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Sinais de Alerta</p>
                            <div className="flex flex-wrap gap-1">
                              {failure.early_warning_signs?.map((sign, i) => (
                                <Badge key={i} className="bg-amber-500/10 text-amber-400 text-xs">{sign}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                          <p className="text-xs text-emerald-400 font-medium">Estratégia de Prevenção</p>
                          <p className="text-sm text-slate-300">{failure.prevention_strategy}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Meta Insights Tab */}
          <TabsContent value="meta" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Learning Velocity */}
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Velocidade de Aprendizado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Lições por Falha</span>
                    <span className="text-white font-bold">{learningResults.learning_velocity?.lessons_per_failure || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Precisão de Detecção</span>
                    <span className="text-white font-bold">{learningResults.learning_velocity?.pattern_detection_accuracy || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Velocidade de Integração</span>
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {learningResults.learning_velocity?.feedback_integration_speed}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Reuso de Conhecimento</span>
                    <span className="text-white font-bold">{learningResults.learning_velocity?.knowledge_reuse_rate || 0}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Organizational Learning Maturity */}
              <Card className="bg-cyan-500/10 border-cyan-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Maturidade de Aprendizado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-cyan-400 capitalize">
                      {learningResults.meta_insights?.organizational_learning_maturity}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Nível de Maturidade</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Foco Recomendado</p>
                    <p className="text-sm text-white">{learningResults.meta_insights?.recommended_focus}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strengths & Gaps */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-emerald-500/10 border-emerald-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-emerald-400 text-sm">Áreas Fortes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {learningResults.meta_insights?.strength_areas?.map((strength, i) => (
                      <Badge key={i} className="bg-emerald-500/20 text-emerald-400">{strength}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-400 text-sm">Gaps de Conhecimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {learningResults.meta_insights?.knowledge_gaps?.map((gap, i) => (
                      <Badge key={i} className="bg-red-500/20 text-red-400">{gap}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!learningResults && !isLearning && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Motor de Aprendizado Pronto</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Execute a análise para identificar padrões, gerar lições aprendidas automaticamente 
              e receber sugestões de melhoria para tomada de decisão.
            </p>
            <Button
              onClick={runPatternAnalysis}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Análise de Aprendizado
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Metric Card Component
function MetricCard({ icon: Icon, label, value, color, trend }) {
  return (
    <Card className={`bg-${color}-500/10 border-${color}-500/30`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
          </div>
          <div className={`p-3 rounded-lg bg-${color}-500/20`}>
            <Icon className={`w-6 h-6 text-${color}-400`} />
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
            <span className={`text-xs ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend === 'up' ? 'Tendência positiva' : 'Atenção necessária'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}