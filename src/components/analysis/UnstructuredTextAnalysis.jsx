import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, Brain, TrendingUp, AlertTriangle, ThumbsUp, 
  ThumbsDown, Minus, Hash, Users, Loader2, Sparkles, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const sentimentIcons = {
  positive: { icon: ThumbsUp, color: 'text-green-400', bg: 'bg-green-500/20' },
  negative: { icon: ThumbsDown, color: 'text-red-400', bg: 'bg-red-500/20' },
  neutral: { icon: Minus, color: 'text-slate-400', bg: 'bg-slate-500/20' }
};

export default function UnstructuredTextAnalysis({ texts = [], onAnalysisComplete }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeTexts = async () => {
    if (texts.length === 0) {
      toast.error('Nenhum texto para analisar');
      return;
    }

    setIsAnalyzing(true);
    try {
      const textSample = texts.slice(0, 50).map(t => 
        typeof t === 'string' ? t : t.content || t.text || JSON.stringify(t)
      ).join('\n---\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise os seguintes textos não estruturados (comentários, descrições, feedbacks) e extraia padrões e insights:

TEXTOS:
${textSample}

ANÁLISE OBRIGATÓRIA:
1. SENTIMENTO GERAL: Classifique o tom geral (positivo/negativo/neutro) com porcentagem
2. TÓPICOS PRINCIPAIS: Identifique os 5 temas mais mencionados
3. PADRÕES DE COMPORTAMENTO: Detecte padrões recorrentes de ação ou preocupação
4. TENDÊNCIAS: Identifique mudanças ou evoluções nos comentários
5. ALERTAS: Sinalize problemas críticos mencionados
6. OPORTUNIDADES: Destaque sugestões e melhorias mencionadas
7. PERSONAS: Identifique perfis de usuários baseado nos textos

Retorne JSON estruturado com análise completa.`,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: {
              type: "object",
              properties: {
                overall: { type: "string", enum: ["positive", "negative", "neutral", "mixed"] },
                positive_percentage: { type: "number" },
                negative_percentage: { type: "number" },
                neutral_percentage: { type: "number" }
              }
            },
            topics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  mentions: { type: "number" },
                  sentiment: { type: "string" },
                  keywords: { type: "array", items: { type: "string" } }
                }
              }
            },
            patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  frequency: { type: "string" },
                  impact: { type: "string", enum: ["high", "medium", "low"] }
                }
              }
            },
            trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trend: { type: "string" },
                  direction: { type: "string", enum: ["increasing", "decreasing", "stable"] },
                  significance: { type: "string" }
                }
              }
            },
            alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  severity: { type: "string", enum: ["critical", "warning", "info"] },
                  mentions: { type: "number" },
                  recommendation: { type: "string" }
                }
              }
            },
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  opportunity: { type: "string" },
                  potential_impact: { type: "string" },
                  suggested_action: { type: "string" }
                }
              }
            },
            personas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  characteristics: { type: "array", items: { type: "string" } },
                  percentage: { type: "number" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      setAnalysis(result);
      onAnalysisComplete?.(result);
      toast.success('Análise de texto concluída!');
    } catch (error) {
      console.error('Error analyzing texts:', error);
      toast.error('Erro na análise de texto');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Análise de Texto Não Estruturado
            {texts.length > 0 && (
              <Badge className="ml-2 bg-blue-500/20 text-blue-400">
                {texts.length} textos
              </Badge>
            )}
          </CardTitle>
          <Button
            onClick={analyzeTexts}
            disabled={isAnalyzing || texts.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analisar Textos
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-8 text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Clique em "Analisar Textos" para identificar padrões</p>
            <p className="text-sm mt-1">Comentários, descrições, feedbacks e mais</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sentiment Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              {['positive', 'negative', 'neutral'].map(sentiment => {
                const config = sentimentIcons[sentiment];
                const Icon = config.icon;
                const percentage = analysis.sentiment?.[`${sentiment}_percentage`] || 0;

                return (
                  <div key={sentiment} className={`p-4 rounded-xl ${config.bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${config.color}`} />
                        <span className="text-white capitalize">{sentiment === 'positive' ? 'Positivo' : sentiment === 'negative' ? 'Negativo' : 'Neutro'}</span>
                      </div>
                      <span className={`text-lg font-bold ${config.color}`}>{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>

            {/* Topics */}
            {analysis.topics?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Tópicos Principais
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.topics.map((topic, idx) => (
                    <Badge 
                      key={idx}
                      className={`${
                        topic.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                        topic.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {topic.topic} ({topic.mentions})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Patterns */}
            {analysis.patterns?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Padrões Identificados
                </h4>
                <div className="space-y-2">
                  {analysis.patterns.slice(0, 3).map((pattern, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-white">{pattern.pattern}</span>
                        <Badge className={
                          pattern.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                          pattern.impact === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-slate-500/20 text-slate-400'
                        }>
                          {pattern.impact === 'high' ? 'Alto impacto' : pattern.impact === 'medium' ? 'Médio impacto' : 'Baixo impacto'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{pattern.frequency}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alerts */}
            {analysis.alerts?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Alertas
                </h4>
                <div className="space-y-2">
                  {analysis.alerts.map((alert, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${
                      alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                      alert.severity === 'warning' ? 'bg-orange-500/10 border-orange-500/30' :
                      'bg-blue-500/10 border-blue-500/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{alert.issue}</span>
                        <Badge className={
                          alert.severity === 'critical' ? 'bg-red-500 text-white' :
                          alert.severity === 'warning' ? 'bg-orange-500 text-white' :
                          'bg-blue-500 text-white'
                        }>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{alert.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personas */}
            {analysis.personas?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Personas Identificadas
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {analysis.personas.map((persona, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{persona.name}</span>
                        <span className="text-sm text-[#00D4FF]">{persona.percentage}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {persona.characteristics?.slice(0, 3).map((char, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-400">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {analysis.summary && (
              <div className="p-4 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#00D4FF]" />
                  <span className="text-sm font-medium text-[#00D4FF]">Resumo da Análise</span>
                </div>
                <p className="text-slate-300">{analysis.summary}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}