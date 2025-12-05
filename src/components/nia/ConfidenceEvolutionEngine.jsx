import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Brain, TrendingUp, Zap, RefreshCw, CheckCircle, AlertTriangle,
  Clock, Target, ArrowUpRight, ArrowDownRight, Sparkles, Plus,
  BarChart3, Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

/**
 * Confidence Evolution Engine
 * 
 * Implements the Pattern Synthesis System's confidence evolution protocol:
 * - HYPOTHESIS (50-59%): 1-2 engagements
 * - EMERGING (60-79%): 3-5 engagements  
 * - VALIDATED (80-94%): 10+ engagements
 * - MATURE (95-100%): 20+ engagements
 * 
 * Also manages behavioral profiles and pattern library growth.
 */

const CONFIDENCE_LEVELS = [
  { level: 'HYPOTHESIS', min: 50, max: 59, color: 'red', engagements: '1-2' },
  { level: 'EMERGING', min: 60, max: 79, color: 'yellow', engagements: '3-5' },
  { level: 'VALIDATED', min: 80, max: 94, color: 'green', engagements: '10+' },
  { level: 'MATURE', min: 95, max: 100, color: 'emerald', engagements: '20+' }
];

const ADJUSTMENT_RULES = [
  { rule: 'Engagement Count 3+', effect: '+10%', type: 'positive' },
  { rule: 'Engagement Count 10+', effect: '+20%', type: 'positive' },
  { rule: 'Confirmation Rate 80%+', effect: '+15%', type: 'positive' },
  { rule: 'Temporal Decay 180+ days', effect: '-10%', type: 'negative' },
  { rule: 'Temporal Decay 365+ days', effect: '-20%', type: 'negative' }
];

export default function ConfidenceEvolutionEngine() {
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [newPattern, setNewPattern] = useState({
    name: '',
    description: '',
    category: 'success',
    initial_confidence: 50
  });
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch patterns from InstitutionalMemory
  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ['pattern-library'],
    queryFn: async () => {
      const memories = await base44.entities.InstitutionalMemory.filter({
        memory_type: 'pattern_detected'
      }, '-created_date', 100);
      return memories;
    }
  });

  // Calculate confidence level
  const getConfidenceLevel = (score) => {
    return CONFIDENCE_LEVELS.find(l => score >= l.min && score <= l.max) || CONFIDENCE_LEVELS[0];
  };

  // Calculate adjusted confidence
  const calculateAdjustedConfidence = (pattern) => {
    let confidence = pattern.relevance_score || 50;
    const engagements = pattern.retrieval_count || 0;
    const daysSinceCreation = Math.floor((Date.now() - new Date(pattern.created_date).getTime()) / (1000 * 60 * 60 * 24));

    // Apply adjustment rules
    if (engagements >= 10) confidence += 20;
    else if (engagements >= 3) confidence += 10;

    // Temporal decay
    if (daysSinceCreation >= 365) confidence -= 20;
    else if (daysSinceCreation >= 180) confidence -= 10;

    // Cap at 100
    return Math.min(100, Math.max(0, confidence));
  };

  // Create new pattern
  const createPattern = async () => {
    if (!newPattern.name || !newPattern.description) {
      toast.error("Nome e descrição são obrigatórios");
      return;
    }

    setIsCreating(true);
    try {
      await base44.entities.InstitutionalMemory.create({
        memory_type: 'pattern_detected',
        title: newPattern.name,
        context: {
          situation: newPattern.description,
          category: newPattern.category
        },
        relevance_score: newPattern.initial_confidence,
        retrieval_count: 1,
        tags: ['pattern', newPattern.category],
        lessons: [{
          lesson: newPattern.description,
          category: 'strategic',
          applicability: 'general'
        }]
      });

      queryClient.invalidateQueries(['pattern-library']);
      setNewPattern({ name: '', description: '', category: 'success', initial_confidence: 50 });
      toast.success("Padrão adicionado à biblioteca!");
    } catch (error) {
      toast.error("Erro ao criar padrão");
    } finally {
      setIsCreating(false);
    }
  };

  // Record engagement (confirm/reject pattern)
  const recordEngagement = async (patternId, confirmed) => {
    const pattern = patterns.find(p => p.id === patternId);
    if (!pattern) return;

    const currentScore = pattern.relevance_score || 50;
    const newScore = confirmed ? Math.min(100, currentScore + 5) : Math.max(0, currentScore - 5);

    await base44.entities.InstitutionalMemory.update(patternId, {
      relevance_score: newScore,
      retrieval_count: (pattern.retrieval_count || 0) + 1,
      feedback: [
        ...(pattern.feedback || []),
        {
          source: 'human',
          feedback_type: confirmed ? 'validation' : 'correction',
          content: confirmed ? 'Pattern confirmed' : 'Pattern rejected',
          timestamp: new Date().toISOString(),
          applied: true
        }
      ]
    });

    queryClient.invalidateQueries(['pattern-library']);
    toast.success(confirmed ? "Padrão confirmado!" : "Feedback registrado");
  };

  // Aggregate stats
  const stats = {
    total: patterns.length,
    byLevel: CONFIDENCE_LEVELS.reduce((acc, level) => {
      acc[level.level] = patterns.filter(p => {
        const score = calculateAdjustedConfidence(p);
        return score >= level.min && score <= level.max;
      }).length;
      return acc;
    }, {}),
    avgConfidence: patterns.length > 0
      ? Math.round(patterns.reduce((sum, p) => sum + calculateAdjustedConfidence(p), 0) / patterns.length)
      : 0
  };

  // Evolution chart data
  const evolutionData = CONFIDENCE_LEVELS.map(level => ({
    name: level.level,
    count: stats.byLevel[level.level] || 0,
    target: level.level === 'VALIDATED' ? 30 : level.level === 'MATURE' ? 60 : 10
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl">Confidence Evolution Engine</span>
              <p className="text-sm text-slate-400 font-normal">
                Pattern Synthesis · HYPOTHESIS → MATURE
              </p>
            </div>
            <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              v13.0
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-400">Total Patterns</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-500">in library</p>
          </CardContent>
        </Card>
        {CONFIDENCE_LEVELS.map((level) => (
          <Card key={level.level} className={`bg-${level.color}-500/10 border-${level.color}-500/30`}>
            <CardContent className="p-4 text-center">
              <p className={`text-xs text-${level.color}-400`}>{level.level}</p>
              <p className="text-3xl font-bold text-white">{stats.byLevel[level.level] || 0}</p>
              <p className="text-xs text-slate-500">{level.engagements} eng.</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confidence Protocol Chart */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Pattern Distribution by Confidence Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="count" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Current" />
                <Area type="monotone" dataKey="target" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Target" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Rules Reference */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Confidence Adjustment Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {ADJUSTMENT_RULES.map((rule, i) => (
              <div key={i} className={`p-3 rounded-lg ${
                rule.type === 'positive' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {rule.type === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-bold ${rule.type === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                    {rule.effect}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{rule.rule}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add New Pattern */}
      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Novo Padrão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Nome do Padrão</label>
              <Input
                value={newPattern.name}
                onChange={(e) => setNewPattern({...newPattern, name: e.target.value})}
                placeholder="Ex: Decisões com alto ROI em Q4"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Categoria</label>
              <Select value={newPattern.category} onValueChange={(v) => setNewPattern({...newPattern, category: v})}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Padrão de Sucesso</SelectItem>
                  <SelectItem value="failure">Padrão de Falha</SelectItem>
                  <SelectItem value="timing">Padrão Temporal</SelectItem>
                  <SelectItem value="stakeholder">Padrão de Stakeholder</SelectItem>
                  <SelectItem value="resource">Padrão de Recursos</SelectItem>
                  <SelectItem value="risk">Padrão de Risco</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Descrição</label>
            <Textarea
              value={newPattern.description}
              onChange={(e) => setNewPattern({...newPattern, description: e.target.value})}
              placeholder="Descreva o padrão observado..."
              className="bg-white/5 border-white/10 text-white h-20"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Confiança Inicial: {newPattern.initial_confidence}%</label>
            <input
              type="range"
              min="50"
              max="70"
              value={newPattern.initial_confidence}
              onChange={(e) => setNewPattern({...newPattern, initial_confidence: parseInt(e.target.value)})}
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-1">
              Novos padrões iniciam como HYPOTHESIS (50-59%) ou EMERGING (60-70%)
            </p>
          </div>
          <Button
            onClick={createPattern}
            disabled={isCreating || !newPattern.name}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isCreating ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Adicionando...</>
            ) : (
              <><Plus className="w-4 h-4 mr-2" />Adicionar à Biblioteca</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pattern Library */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Pattern Library ({patterns.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : patterns.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum padrão na biblioteca</p>
              <p className="text-sm">Adicione padrões ou execute análise de patterns</p>
            </div>
          ) : (
            patterns.slice(0, 10).map((pattern) => {
              const adjustedConfidence = calculateAdjustedConfidence(pattern);
              const level = getConfidenceLevel(adjustedConfidence);
              
              return (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border bg-${level.color}-500/5 border-${level.color}-500/20`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{pattern.title}</h4>
                        <Badge className={`bg-${level.color}-500/20 text-${level.color}-400`}>
                          {level.level}
                        </Badge>
                        <Badge className="bg-white/10 text-slate-400">
                          {pattern.retrieval_count || 0} engagements
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{pattern.context?.situation?.slice(0, 150)}...</p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>Confidence</span>
                            <span>{adjustedConfidence}%</span>
                          </div>
                          <Progress value={adjustedConfidence} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => recordEngagement(pattern.id, true)}
                        className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => recordEngagement(pattern.id, false)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}