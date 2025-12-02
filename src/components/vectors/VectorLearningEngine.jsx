import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Sparkles, TrendingUp, TrendingDown, Target, 
  Loader2, BookOpen, Lightbulb, GitBranch, BarChart3,
  CheckCircle, XCircle, ArrowUpRight, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function VectorLearningEngine({ decisions = [], checkpoints = [] }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [learningInsights, setLearningInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('patterns');

  const completedDecisions = decisions.filter(d => 
    ['completed', 'aborted', 'redirected'].includes(d.status)
  );

  const successfulDecisions = completedDecisions.filter(d => d.status === 'completed');
  const failedDecisions = completedDecisions.filter(d => d.status === 'aborted');

  const analyzePatterns = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise o histórico de decisões vetoriais e extraia padrões de aprendizado:

DECISÕES CONCLUÍDAS (${completedDecisions.length}):
${completedDecisions.map(d => `
- ${d.title}
  Vetor: ${d.primary_vector?.name} (${d.primary_vector?.direction})
  Status Final: ${d.status}
  Horizonte: ${d.horizon_days} dias
  Validação IA: ${d.ai_validation?.consistency_score ? Math.round(d.ai_validation.consistency_score * 100) + '%' : 'N/A'}
`).join('\n')}

CHECKPOINTS REGISTRADOS (${checkpoints.length}):
${checkpoints.slice(-10).map(c => `
- Checkpoint #${c.checkpoint_number}: ${c.checkpoint_decision}
  Health: ${Math.round((c.vector_health_score || 0.7) * 100)}%
  Desvios: ${c.deviations?.length || 0}
`).join('\n')}

Identifique:
1. Padrões de sucesso (o que funcionou)
2. Padrões de falha (o que não funcionou)
3. Correlações entre variáveis
4. Recomendações para futuras decisões
5. Áreas de melhoria no processo`,
        response_json_schema: {
          type: "object",
          properties: {
            success_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  frequency: { type: "number" },
                  confidence: { type: "number" }
                }
              }
            },
            failure_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  frequency: { type: "number" },
                  root_cause: { type: "string" }
                }
              }
            },
            direction_effectiveness: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  direction: { type: "string" },
                  success_rate: { type: "number" },
                  avg_duration: { type: "number" }
                }
              }
            },
            checkpoint_insights: {
              type: "object",
              properties: {
                optimal_frequency: { type: "string" },
                early_warning_accuracy: { type: "number" },
                most_common_deviations: { type: "array", items: { type: "string" } }
              }
            },
            recommendations: { type: "array", items: { type: "string" } },
            process_improvements: { type: "array", items: { type: "string" } },
            skill_development: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  current_level: { type: "number" },
                  suggested_focus: { type: "string" }
                }
              }
            }
          }
        }
      });

      setLearningInsights(response);
      toast.success('Análise de aprendizado concluída');
    } catch (error) {
      toast.error('Erro na análise');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate basic stats
  const successRate = completedDecisions.length > 0 
    ? (successfulDecisions.length / completedDecisions.length) * 100 
    : 0;

  const avgCheckpointsPerDecision = completedDecisions.length > 0
    ? checkpoints.length / completedDecisions.length
    : 0;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-400" />
          Motor de Aprendizado Direcional
          <Badge className="bg-amber-500/20 text-amber-400">CAIO.VEC-05</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <p className="text-2xl font-bold text-white">{completedDecisions.length}</p>
            <p className="text-xs text-slate-400">Decisões Concluídas</p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-400">{Math.round(successRate)}%</p>
            <p className="text-xs text-slate-400">Taxa de Sucesso</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-400">{checkpoints.length}</p>
            <p className="text-xs text-slate-400">Total Checkpoints</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-400">{avgCheckpointsPerDecision.toFixed(1)}</p>
            <p className="text-xs text-slate-400">Checkpoints/Decisão</p>
          </div>
        </div>

        {/* Analyze Button */}
        <Button
          onClick={analyzePatterns}
          disabled={isAnalyzing || completedDecisions.length === 0}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
        >
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando Padrões...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Analisar Padrões de Aprendizado</>
          )}
        </Button>

        {completedDecisions.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">Complete decisões vetoriais para gerar insights de aprendizado</p>
          </div>
        )}

        {/* Learning Insights */}
        {learningInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-white/5">
                <TabsTrigger value="patterns" className="flex-1 data-[state=active]:bg-amber-500/20">
                  <Target className="w-4 h-4 mr-2" />
                  Padrões
                </TabsTrigger>
                <TabsTrigger value="effectiveness" className="flex-1 data-[state=active]:bg-amber-500/20">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Efetividade
                </TabsTrigger>
                <TabsTrigger value="skills" className="flex-1 data-[state=active]:bg-amber-500/20">
                  <Zap className="w-4 h-4 mr-2" />
                  Habilidades
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patterns" className="mt-4 space-y-4">
                {/* Success Patterns */}
                {learningInsights.success_patterns?.length > 0 && (
                  <div>
                    <h4 className="text-sm text-green-400 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Padrões de Sucesso
                    </h4>
                    <div className="space-y-2">
                      {learningInsights.success_patterns.map((pattern, idx) => (
                        <div key={idx} className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-white flex-1">{pattern.pattern}</p>
                            <Badge className="bg-green-500/20 text-green-400 ml-2">
                              {Math.round(pattern.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Failure Patterns */}
                {learningInsights.failure_patterns?.length > 0 && (
                  <div>
                    <h4 className="text-sm text-red-400 mb-2 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Padrões de Falha
                    </h4>
                    <div className="space-y-2">
                      {learningInsights.failure_patterns.map((pattern, idx) => (
                        <div key={idx} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <p className="text-sm text-white">{pattern.pattern}</p>
                          <p className="text-xs text-red-400 mt-1">Causa: {pattern.root_cause}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {learningInsights.recommendations?.length > 0 && (
                  <div>
                    <h4 className="text-sm text-amber-400 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Recomendações
                    </h4>
                    <ul className="space-y-2">
                      {learningInsights.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ArrowUpRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="effectiveness" className="mt-4">
                {learningInsights.direction_effectiveness?.length > 0 && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={learningInsights.direction_effectiveness}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="direction" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#9CA3AF' }} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ background: '#1F2937', border: '1px solid #374151' }}
                          formatter={(value) => [`${Math.round(value)}%`, 'Taxa de Sucesso']}
                        />
                        <Bar dataKey="success_rate" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Checkpoint Insights */}
                {learningInsights.checkpoint_insights && (
                  <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <h4 className="text-sm text-blue-400 mb-2">Insights de Checkpoints</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Frequência Ótima</p>
                        <p className="text-sm text-white">{learningInsights.checkpoint_insights.optimal_frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Precisão de Alertas</p>
                        <p className="text-sm text-white">
                          {Math.round(learningInsights.checkpoint_insights.early_warning_accuracy * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="skills" className="mt-4">
                {learningInsights.skill_development?.length > 0 && (
                  <div className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={learningInsights.skill_development}>
                          <PolarGrid stroke="#374151" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                          <Radar
                            name="Nível Atual"
                            dataKey="current_level"
                            stroke="#F59E0B"
                            fill="#F59E0B"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                      {learningInsights.skill_development.map((skill, idx) => (
                        <div key={idx} className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white">{skill.skill}</span>
                            <span className="text-xs text-amber-400">{Math.round(skill.current_level)}%</span>
                          </div>
                          <Progress value={skill.current_level} className="h-2 mb-2" />
                          <p className="text-xs text-slate-400">Foco: {skill.suggested_focus}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Process Improvements */}
                {learningInsights.process_improvements?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm text-purple-400 mb-2 flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      Melhorias de Processo
                    </h4>
                    <ul className="space-y-2">
                      {learningInsights.process_improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Zap className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white">{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}