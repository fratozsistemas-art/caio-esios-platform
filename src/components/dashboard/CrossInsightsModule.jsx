import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Network, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Zap,
  Brain,
  Target,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const insightTypeIcons = {
  market_trend: TrendingUp,
  competitive_pattern: Target,
  risk_correlation: AlertCircle,
  opportunity_transfer: Sparkles,
  strategy_replication: Brain,
  resource_optimization: Zap,
  behavioral_pattern: Network
};

const insightTypeColors = {
  market_trend: "from-blue-500 to-cyan-500",
  competitive_pattern: "from-purple-500 to-pink-500",
  risk_correlation: "from-red-500 to-orange-500",
  opportunity_transfer: "from-green-500 to-emerald-500",
  strategy_replication: "from-indigo-500 to-blue-500",
  resource_optimization: "from-yellow-500 to-orange-500",
  behavioral_pattern: "from-cyan-500 to-teal-500"
};

export default function CrossInsightsModule() {
  const [generating, setGenerating] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);

  const { data: insights = [], refetch, isLoading } = useQuery({
    queryKey: ['cross-insights'],
    queryFn: async () => {
      const result = await base44.entities.CrossInsight.list('-created_date', 20);
      return result;
    }
  });

  const generateInsights = async () => {
    setGenerating(true);
    try {
      await base44.functions.invoke('generateCrossInsights', { mode: 'auto' });
      refetch();
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getInsightTypeLabel = (type) => {
    const labels = {
      market_trend: 'Tendência de Mercado',
      competitive_pattern: 'Padrão Competitivo',
      risk_correlation: 'Correlação de Risco',
      opportunity_transfer: 'Transferência de Oportunidade',
      strategy_replication: 'Replicação de Estratégia',
      resource_optimization: 'Otimização de Recursos',
      behavioral_pattern: 'Padrão Comportamental'
    };
    return labels[type] || type;
  };

  const priorityColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Network className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white">Insights Cruzados</CardTitle>
                <p className="text-sm text-slate-400">
                  Correlações inteligentes entre projetos e análises
                </p>
              </div>
            </div>
            <Button
              onClick={generateInsights}
              disabled={generating}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Gerar Novos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Network className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">
                Nenhum insight cruzado disponível ainda
              </p>
              <Button
                onClick={generateInsights}
                disabled={generating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Insights
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {insights.slice(0, 5).map((insight, idx) => {
                  const Icon = insightTypeIcons[insight.insight_type] || Network;
                  const gradient = insightTypeColors[insight.insight_type] || "from-slate-500 to-slate-600";
                  
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card 
                        className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-all cursor-pointer group"
                        onClick={() => setSelectedInsight(selectedInsight?.id === insight.id ? null : insight)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 bg-gradient-to-br ${gradient} rounded-lg`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-white font-semibold text-sm line-clamp-1">
                                  {insight.title}
                                </h4>
                                <Badge className="bg-blue-500/20 text-blue-300 text-xs shrink-0">
                                  {Math.round(insight.correlation_strength)}%
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                                <span className="truncate">{insight.source_project.name}</span>
                                <ArrowRight className="w-3 h-3 shrink-0" />
                                <span className="truncate">{insight.target_project.name}</span>
                              </div>

                              <p className="text-slate-300 text-sm line-clamp-2 mb-3">
                                {insight.insight_summary}
                              </p>

                              {selectedInsight?.id === insight.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="space-y-3 pt-3 border-t border-white/10"
                                >
                                  {insight.shared_patterns?.length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-blue-400 mb-1">
                                        Padrões Compartilhados:
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {insight.shared_patterns.map((pattern, i) => (
                                          <Badge key={i} className="bg-blue-500/20 text-blue-300 text-xs">
                                            {pattern}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {insight.transferable_learnings?.length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-purple-400 mb-1">
                                        Aprendizados Transferíveis:
                                      </p>
                                      <ul className="space-y-1">
                                        {insight.transferable_learnings.slice(0, 3).map((learning, i) => (
                                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                            <ChevronRight className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                                            {learning}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {insight.actionable_recommendations?.length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-green-400 mb-1">
                                        Recomendações:
                                      </p>
                                      <div className="space-y-2">
                                        {insight.actionable_recommendations.slice(0, 2).map((rec, i) => (
                                          <div key={i} className="bg-white/5 p-2 rounded border border-white/10">
                                            <div className="flex items-center gap-2 mb-1">
                                              <Badge className={priorityColors[rec.priority] || priorityColors.low}>
                                                {rec.priority}
                                              </Badge>
                                              <span className="text-xs text-slate-400">{rec.estimated_impact}</span>
                                            </div>
                                            <p className="text-xs text-slate-300">{rec.action}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}

                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-slate-700 text-slate-300 text-xs">
                                  {getInsightTypeLabel(insight.insight_type)}
                                </Badge>
                                <Badge className={`text-xs ${
                                  insight.confidence_score >= 80 ? 'bg-green-500/20 text-green-400' :
                                  insight.confidence_score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {Math.round(insight.confidence_score)}% confiança
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {insights.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/5"
                  onClick={() => window.location.href = '/cross-insights'}
                >
                  Ver todos os {insights.length} insights
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}