import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, Minus, AlertTriangle, 
  Lightbulb, Target, ArrowUpRight, ArrowDownRight,
  Activity, Sparkles, CheckCircle, Clock, Share2
} from "lucide-react";
import { motion } from "framer-motion";
import CreateTaskFromInsightDialog from "@/components/collaboration/CreateTaskFromInsightDialog";

const TrendIcon = ({ direction }) => {
  switch (direction) {
    case "up": return <TrendingUp className="w-5 h-5 text-green-400" />;
    case "down": return <TrendingDown className="w-5 h-5 text-red-400" />;
    case "volatile": return <Activity className="w-5 h-5 text-amber-400" />;
    default: return <Minus className="w-5 h-5 text-slate-400" />;
  }
};

const ImpactBadge = ({ impact }) => {
  const colors = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-green-500/20 text-green-400 border-green-500/30"
  };
  return (
    <Badge className={colors[impact] || colors.low}>
      {impact}
    </Badge>
  );
};

const SeverityBadge = ({ severity }) => {
  const colors = {
    critical: "bg-red-500/20 text-red-400",
    warning: "bg-amber-500/20 text-amber-400",
    info: "bg-blue-500/20 text-blue-400"
  };
  const icons = {
    critical: AlertTriangle,
    warning: AlertTriangle,
    info: Lightbulb
  };
  const Icon = icons[severity] || icons.info;
  
  return (
    <Badge className={colors[severity] || colors.info}>
      <Icon className="w-3 h-3 mr-1" />
      {severity}
    </Badge>
  );
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    critical: "bg-red-600",
    high: "bg-orange-500",
    medium: "bg-blue-500",
    low: "bg-slate-500"
  };
  return (
    <Badge className={`${colors[priority] || colors.medium} text-white`}>
      {priority}
    </Badge>
  );
};

export default function AIInsightsPanel({ insights }) {
  if (!insights) return null;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Análise Completa</h3>
                <p className="text-slate-400 text-sm">Powered by AI</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">
                {insights.overallScore || 85}
                <span className="text-lg text-slate-400">/100</span>
              </div>
              <p className="text-sm text-slate-400">Score de Qualidade</p>
            </div>
          </div>
          {insights.summary && (
            <p className="text-slate-300 leading-relaxed">{insights.summary}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trends */}
        {insights.trends?.length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Tendências Identificadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.trends.map((trend, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendIcon direction={trend.direction} />
                      <h4 className="font-semibold text-white">{trend.title}</h4>
                    </div>
                    <ImpactBadge impact={trend.impact} />
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{trend.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Confiança:</span>
                    <Progress value={trend.confidence || 75} className="flex-1 h-2" />
                    <span className="text-xs text-slate-400">{trend.confidence || 75}%</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Anomalies */}
        {insights.anomalies?.length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Anomalias Detectadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.anomalies.map((anomaly, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white">{anomaly.title}</h4>
                    <SeverityBadge severity={anomaly.severity} />
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{anomaly.description}</p>
                  {anomaly.recommendation && (
                    <div className="p-2 bg-amber-500/10 rounded border border-amber-500/20">
                      <p className="text-xs text-amber-300">
                        <strong>Recomendação:</strong> {anomaly.recommendation}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Correlations */}
      {insights.correlations?.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Correlações Descobertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.correlations.map((corr, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {corr.type === "positive" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-400" />
                      ) : corr.type === "negative" ? (
                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                      ) : (
                        <Activity className="w-4 h-4 text-purple-400" />
                      )}
                      <span className="text-xs text-slate-400">{corr.type}</span>
                    </div>
                    <Badge className={`${
                      Math.abs(corr.strength) > 0.7 ? "bg-green-500/20 text-green-400" :
                      Math.abs(corr.strength) > 0.4 ? "bg-amber-500/20 text-amber-400" :
                      "bg-slate-500/20 text-slate-400"
                    }`}>
                      {(corr.strength * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {corr.variables?.map((v, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-slate-300 border-slate-600">
                        {v}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">{corr.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategic Insights */}
      {insights.strategicInsights?.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Insights Estratégicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.strategicInsights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {insight.actionRequired ? (
                      <Target className="w-5 h-5 text-red-400" />
                    ) : (
                      <Lightbulb className="w-5 h-5 text-amber-400" />
                    )}
                    <h4 className="font-semibold text-white">{insight.title}</h4>
                  </div>
                  <PriorityBadge priority={insight.priority} />
                </div>
                <p className="text-sm text-slate-300">{insight.insight}</p>
                <div className="flex items-center gap-2 mt-3">
                  {insight.actionRequired && (
                    <Badge className="bg-red-500/20 text-red-400">
                      Ação Necessária
                    </Badge>
                  )}
                  <CreateTaskFromInsightDialog
                    insight={{
                      title: insight.title,
                      description: insight.insight,
                      priority: insight.priority,
                      source_type: 'data_analysis',
                      source_id: 'ai_insight'
                    }}
                    trigger={
                      <Button size="sm" variant="ghost" className="text-purple-400 hover:bg-purple-500/10 h-7">
                        <Target className="w-3 h-3 mr-1" />
                        Criar Tarefa
                      </Button>
                    }
                  />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights.recommendations?.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{rec.action}</h4>
                      <p className="text-sm text-slate-300 mb-2">{rec.rationale}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <span className="text-green-400">
                          <strong>Impacto:</strong> {rec.expectedImpact}
                        </span>
                        {rec.timeframe && (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {rec.timeframe}
                          </span>
                        )}
                        <CreateTaskFromInsightDialog
                          insight={{
                            title: rec.action,
                            description: rec.rationale,
                            priority: 'high',
                            source_type: 'data_analysis',
                            source_id: 'recommendation'
                          }}
                          trigger={
                            <Button size="sm" variant="ghost" className="text-purple-400 hover:bg-purple-500/10 h-6 text-xs">
                              <Target className="w-3 h-3 mr-1" />
                              Criar Tarefa
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}