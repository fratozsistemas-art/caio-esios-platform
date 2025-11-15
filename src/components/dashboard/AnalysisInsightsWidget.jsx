import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Target } from "lucide-react";
import { motion } from "framer-motion";

const INSIGHT_ICONS = {
  trend: TrendingUp,
  risk: AlertTriangle,
  opportunity: Target,
  pattern: Brain
};

const IMPACT_COLORS = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};

export default function AnalysisInsightsWidget({ insights = [] }) {
  const recentInsights = insights.slice(0, 4);
  
  const insightsByImpact = insights.reduce((acc, insight) => {
    acc[insight.impact || 'medium'] = (acc[insight.impact || 'medium'] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Insights
          </CardTitle>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {insights.length} insights
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {['high', 'medium', 'low'].map(impact => (
            <div key={impact} className="bg-white/5 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{insightsByImpact[impact] || 0}</div>
              <div className="text-xs text-slate-400 capitalize">{impact}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {recentInsights.map((insight, idx) => {
            const Icon = INSIGHT_ICONS[insight.type] || Brain;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm text-white font-medium line-clamp-2">
                        {insight.title || insight.insight}
                      </div>
                      <Badge className={IMPACT_COLORS[insight.impact]}>
                        {insight.impact}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-2">
                      {insight.description}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}