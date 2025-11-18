import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Loader2, TrendingUp, AlertTriangle, Target, 
  Activity, GitMerge, AlertCircle, ChevronRight
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";

const IMPACT_COLORS = {
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  transformative: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
};

const URGENCY_COLORS = {
  monitor: 'bg-blue-500/20 text-blue-400',
  investigate: 'bg-yellow-500/20 text-yellow-400',
  act_now: 'bg-red-500/20 text-red-400'
};

export default function CrossPlatformInsights() {
  const [insights, setInsights] = useState(null);

  const analyzeMutation = useMutation({
    mutationFn: () => base44.functions.invoke('analyzeCrossPlatformInsights'),
    onSuccess: (response) => {
      setInsights(response.data.insights);
      toast.success('Cross-platform analysis complete!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Analysis failed');
    }
  });

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-blue-400" />
            Cross-Platform Intelligence
          </CardTitle>
          <Button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !analyzeMutation.isPending && (
          <div className="text-center py-8">
            <GitMerge className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="text-slate-300 mb-4">
              Analyze data across all connected platforms to discover insights
            </p>
            <p className="text-xs text-slate-500">
              The AI will identify correlations, trends, risks, and opportunities by synthesizing information from Slack, Google Drive, Jira, and more
            </p>
          </div>
        )}

        {insights && (
          <Tabs defaultValue="correlations" className="mt-4">
            <TabsList className="grid w-full grid-cols-4 bg-white/5">
              <TabsTrigger value="correlations">Correlations</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>

            <TabsContent value="correlations" className="space-y-3 mt-4">
              {insights.executive_summary && (
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30 mb-4">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Executive Summary
                  </h4>
                  <p className="text-sm text-slate-300">{insights.executive_summary}</p>
                </div>
              )}

              {insights.cross_platform_correlations?.map((corr, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium">{corr.title}</h4>
                    <Badge className={IMPACT_COLORS[corr.impact]}>{corr.impact}</Badge>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{corr.description}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {corr.sources_involved?.map((source, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                        {source}
                      </Badge>
                    ))}
                  </div>
                  {corr.evidence && corr.evidence.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {corr.evidence.map((ev, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="trends" className="space-y-3 mt-4">
              {insights.emergent_trends?.map((trend, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <h4 className="text-white font-medium">{trend.trend_name}</h4>
                    </div>
                    <Badge className={
                      trend.momentum === 'explosive' ? 'bg-red-500/20 text-red-400' :
                      trend.momentum === 'growing' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }>
                      {trend.momentum}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{trend.description}</p>
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                    <p className="text-xs text-blue-300">{trend.strategic_implications}</p>
                  </div>
                </motion.div>
              ))}

              {insights.hot_topics && insights.hot_topics.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Hot Topics Across Platforms
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {insights.hot_topics.map((topic, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="text-white font-medium text-sm mb-1">{topic.topic}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">{topic.mention_count} mentions</span>
                          <Badge className={`text-xs ${
                          topic.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                          topic.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                          }`}>
                            {topic.sentiment}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="risks" className="space-y-3 mt-4">
              {insights.risk_signals?.map((risk, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-red-500/10 rounded-lg p-4 border border-red-500/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <h4 className="text-white font-medium">{risk.risk_title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={IMPACT_COLORS[risk.severity]}>{risk.severity}</Badge>
                      <Badge className={URGENCY_COLORS[risk.urgency]}>{risk.urgency}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{risk.description}</p>
                  {risk.indicators && (
                    <div className="mb-3">
                      <div className="text-xs text-slate-400 mb-1">Indicators:</div>
                      <div className="space-y-1">
                        {risk.indicators.map((indicator, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-red-400" />
                            <span>{indicator}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Recommended Action:</div>
                    <p className="text-sm text-white">{risk.recommended_action}</p>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-3 mt-4">
              {insights.opportunities?.map((opp, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-green-500/10 rounded-lg p-4 border border-green-500/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      <h4 className="text-white font-medium">{opp.opportunity_title}</h4>
                    </div>
                    <Badge className={IMPACT_COLORS[opp.potential_value]}>{opp.potential_value}</Badge>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{opp.description}</p>
                  {opp.next_steps && opp.next_steps.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-2">Next Steps:</div>
                      <ol className="space-y-1">
                        {opp.next_steps.map((step, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-green-400 font-bold">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}