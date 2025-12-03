import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, TrendingUp, AlertTriangle, CheckCircle2, RefreshCw,
  Lightbulb, Target, Zap, Network, BarChart3, ArrowRight,
  Clock, Users, DollarSign, Shield, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

/**
 * NIA Pattern Recognition Engine
 * Analisa decisões históricas para identificar padrões de sucesso/falha
 * e gerar insights preditivos para novas decisões
 */

const PATTERN_CATEGORIES = [
  { id: 'success', label: 'Padrões de Sucesso', icon: CheckCircle2, color: 'green' },
  { id: 'failure', label: 'Padrões de Falha', icon: AlertTriangle, color: 'red' },
  { id: 'timing', label: 'Padrões Temporais', icon: Clock, color: 'blue' },
  { id: 'stakeholder', label: 'Padrões de Stakeholder', icon: Users, color: 'purple' },
  { id: 'resource', label: 'Padrões de Recursos', icon: DollarSign, color: 'yellow' },
  { id: 'risk', label: 'Padrões de Risco', icon: Shield, color: 'orange' }
];

export default function PatternRecognitionEngine({ onPatternsIdentified }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patterns, setPatterns] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('success');
  const queryClient = useQueryClient();

  // Fetch historical data
  const { data: memories = [] } = useQuery({
    queryKey: ['institutional_memories'],
    queryFn: () => base44.entities.InstitutionalMemory.list('-created_date', 100)
  });

  const { data: vectorDecisions = [] } = useQuery({
    queryKey: ['vector_decisions'],
    queryFn: () => base44.entities.VectorDecision.list('-created_date', 100)
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list('-created_date', 50)
  });

  const { data: checkpoints = [] } = useQuery({
    queryKey: ['vector_checkpoints'],
    queryFn: () => base44.entities.VectorCheckpoint.list('-created_date', 100)
  });

  const analyzePatterns = async () => {
    setIsAnalyzing(true);
    try {
      // Prepare historical data summary
      const memorySummary = memories.slice(0, 30).map(m => ({
        type: m.memory_type,
        outcome: m.outcome?.result,
        lessons: m.lessons?.slice(0, 2),
        context: m.context?.situation?.slice(0, 100)
      }));

      const decisionSummary = vectorDecisions.slice(0, 30).map(d => ({
        title: d.title,
        status: d.status,
        context_type: d.context_type,
        direction: d.primary_vector?.direction,
        intensity: d.primary_vector?.intensity
      }));

      const strategySummary = strategies.slice(0, 20).map(s => ({
        title: s.title,
        category: s.category,
        status: s.status,
        priority: s.priority,
        roi_estimate: s.roi_estimate
      }));

      const checkpointSummary = checkpoints.slice(0, 30).map(c => ({
        decision: c.checkpoint_decision,
        health_score: c.vector_health_score,
        deviations: c.deviations?.length || 0
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the NIA (Neural Intelligence Archive) Pattern Recognition Engine.
Analyze the following historical organizational data to identify patterns across decisions, strategies, and outcomes.

INSTITUTIONAL MEMORIES (${memories.length} total):
${JSON.stringify(memorySummary, null, 2)}

VECTOR DECISIONS (${vectorDecisions.length} total):
${JSON.stringify(decisionSummary, null, 2)}

STRATEGIES (${strategies.length} total):
${JSON.stringify(strategySummary, null, 2)}

CHECKPOINTS (${checkpoints.length} total):
${JSON.stringify(checkpointSummary, null, 2)}

Analyze and identify patterns in these categories:
1. SUCCESS PATTERNS: What correlates with positive outcomes?
2. FAILURE PATTERNS: What correlates with negative outcomes?
3. TIMING PATTERNS: When do decisions succeed/fail based on timing?
4. STAKEHOLDER PATTERNS: How do different stakeholder involvements affect outcomes?
5. RESOURCE PATTERNS: How do resource allocations correlate with success?
6. RISK PATTERNS: What risk indicators predict problems?

Return JSON:
{
  "analysis_summary": {
    "total_records_analyzed": number,
    "time_span": "period covered",
    "confidence_level": 0-100,
    "data_quality_score": 0-100
  },
  "patterns": {
    "success": [
      {
        "pattern_name": "name",
        "description": "what the pattern is",
        "frequency": "how often observed",
        "confidence": 0-100,
        "evidence": ["evidence1", "evidence2"],
        "recommendation": "how to leverage this pattern",
        "impact_score": 0-100
      }
    ],
    "failure": [
      {
        "pattern_name": "name",
        "description": "what leads to failure",
        "frequency": "how often observed",
        "confidence": 0-100,
        "warning_signs": ["sign1", "sign2"],
        "mitigation": "how to avoid",
        "risk_score": 0-100
      }
    ],
    "timing": [
      {
        "pattern_name": "name",
        "description": "timing-related insight",
        "optimal_conditions": "when to act",
        "avoid_conditions": "when not to act",
        "confidence": 0-100
      }
    ],
    "stakeholder": [
      {
        "pattern_name": "name",
        "description": "stakeholder-related insight",
        "key_stakeholders": ["stakeholder1"],
        "alignment_factors": ["factor1"],
        "confidence": 0-100
      }
    ],
    "resource": [
      {
        "pattern_name": "name",
        "description": "resource-related insight",
        "optimal_allocation": "guidance",
        "common_mistakes": ["mistake1"],
        "confidence": 0-100
      }
    ],
    "risk": [
      {
        "pattern_name": "name",
        "description": "risk-related insight",
        "early_indicators": ["indicator1"],
        "mitigation_strategies": ["strategy1"],
        "confidence": 0-100
      }
    ]
  },
  "cross_pattern_insights": [
    {
      "insight": "insight connecting multiple patterns",
      "patterns_involved": ["pattern1", "pattern2"],
      "strategic_implication": "what this means for strategy"
    }
  ],
  "predictive_indicators": [
    {
      "indicator": "what to watch for",
      "prediction": "what it predicts",
      "accuracy_estimate": 0-100,
      "action_trigger": "when to act"
    }
  ],
  "recommendations": {
    "immediate_actions": ["action1", "action2"],
    "strategic_adjustments": ["adjustment1"],
    "monitoring_priorities": ["priority1"]
  }
}`,
        response_json_schema: {
          type: "object",
          properties: {
            analysis_summary: { type: "object" },
            patterns: { type: "object" },
            cross_pattern_insights: { type: "array", items: { type: "object" } },
            predictive_indicators: { type: "array", items: { type: "object" } },
            recommendations: { type: "object" }
          }
        }
      });

      setPatterns(result);
      onPatternsIdentified?.(result);
      toast.success("Análise de padrões concluída");
    } catch (error) {
      console.error("Pattern analysis error:", error);
      toast.error("Erro na análise de padrões");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return colors[color] || colors.blue;
  };

  const totalRecords = memories.length + vectorDecisions.length + strategies.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl">NIA Pattern Recognition Engine</span>
              <p className="text-sm text-slate-400 font-normal">
                Análise de padrões em decisões históricas
              </p>
            </div>
            <Badge className="ml-auto bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Neural Archive
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Data Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Memórias</p>
                <p className="text-2xl font-bold text-white">{memories.length}</p>
              </div>
              <Brain className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Decisões Vetoriais</p>
                <p className="text-2xl font-bold text-white">{vectorDecisions.length}</p>
              </div>
              <Target className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Estratégias</p>
                <p className="text-2xl font-bold text-white">{strategies.length}</p>
              </div>
              <Lightbulb className="w-8 h-8 text-yellow-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Checkpoints</p>
                <p className="text-2xl font-bold text-white">{checkpoints.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyze Button */}
      <Button
        onClick={analyzePatterns}
        disabled={isAnalyzing || totalRecords === 0}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 py-6"
      >
        {isAnalyzing ? (
          <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Analisando {totalRecords} registros...</>
        ) : (
          <><Brain className="w-5 h-5 mr-2" />Executar Análise de Padrões ({totalRecords} registros)</>
        )}
      </Button>

      {/* Results */}
      {patterns && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Analysis Summary */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">Resumo da Análise</span>
                <Badge className="bg-green-500/20 text-green-400">
                  Confiança: {patterns.analysis_summary?.confidence_level}%
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Registros Analisados</p>
                  <p className="text-lg font-bold text-white">{patterns.analysis_summary?.total_records_analyzed}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Período</p>
                  <p className="text-lg font-bold text-white">{patterns.analysis_summary?.time_span}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Qualidade dos Dados</p>
                  <Progress value={patterns.analysis_summary?.data_quality_score} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pattern Categories */}
          <div className="grid grid-cols-6 gap-2">
            {PATTERN_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const patternCount = patterns.patterns?.[cat.id]?.length || 0;
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col h-auto py-3 ${
                    selectedCategory === cat.id 
                      ? getColorClasses(cat.color) 
                      : 'border-white/10 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{cat.label}</span>
                  <Badge className="mt-1 text-xs">{patternCount}</Badge>
                </Button>
              );
            })}
          </div>

          {/* Selected Category Patterns */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                {PATTERN_CATEGORIES.find(c => c.id === selectedCategory)?.icon && 
                  React.createElement(PATTERN_CATEGORIES.find(c => c.id === selectedCategory).icon, { className: "w-5 h-5" })}
                {PATTERN_CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patterns.patterns?.[selectedCategory]?.map((pattern, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-lg border ${getColorClasses(PATTERN_CATEGORIES.find(c => c.id === selectedCategory)?.color)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-white">{pattern.pattern_name}</h4>
                    <Badge className="bg-white/10 text-white">
                      {pattern.confidence}% confiança
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{pattern.description}</p>
                  
                  {pattern.evidence && (
                    <div className="mb-2">
                      <p className="text-xs text-slate-500 mb-1">Evidências:</p>
                      <div className="flex flex-wrap gap-1">
                        {pattern.evidence.map((e, j) => (
                          <Badge key={j} className="bg-white/10 text-slate-300 text-xs">{e}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {pattern.recommendation && (
                    <div className="flex items-start gap-2 mt-3 p-2 bg-white/5 rounded">
                      <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <p className="text-xs text-slate-300">{pattern.recommendation}</p>
                    </div>
                  )}

                  {pattern.mitigation && (
                    <div className="flex items-start gap-2 mt-3 p-2 bg-white/5 rounded">
                      <Shield className="w-4 h-4 text-green-400 mt-0.5" />
                      <p className="text-xs text-slate-300">{pattern.mitigation}</p>
                    </div>
                  )}
                </motion.div>
              ))}

              {(!patterns.patterns?.[selectedCategory] || patterns.patterns[selectedCategory].length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  Nenhum padrão identificado nesta categoria
                </div>
              )}
            </CardContent>
          </Card>

          {/* Predictive Indicators */}
          {patterns.predictive_indicators?.length > 0 && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400 text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Indicadores Preditivos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patterns.predictive_indicators.map((ind, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{ind.indicator}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        <ArrowRight className="w-3 h-3 inline mr-1" />
                        {ind.prediction}
                      </p>
                      <p className="text-xs text-purple-400 mt-1">
                        Acurácia estimada: {ind.accuracy_estimate}%
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {patterns.recommendations && (
            <Card className="bg-green-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400 text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patterns.recommendations.immediate_actions?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Ações Imediatas</p>
                    {patterns.recommendations.immediate_actions.map((action, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded mb-1">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-white">{action}</span>
                      </div>
                    ))}
                  </div>
                )}

                {patterns.recommendations.strategic_adjustments?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Ajustes Estratégicos</p>
                    {patterns.recommendations.strategic_adjustments.map((adj, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded mb-1">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-white">{adj}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}