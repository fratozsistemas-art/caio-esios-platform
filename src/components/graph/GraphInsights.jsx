import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Link2, AlertTriangle, Sparkles, 
  ArrowRight, Clock, Target, Zap
} from "lucide-react";
import { motion } from "framer-motion";

const IMPACT_COLORS = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};

const SEVERITY_COLORS = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  low: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
};

export default function GraphInsights({ analysis, onNodeHighlight }) {
  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 leading-relaxed">
            {analysis.executive_summary}
          </p>
        </CardContent>
      </Card>

      {/* Key Trends */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Key Trends
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {analysis.key_trends?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {analysis.key_trends?.map((trend, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium">{trend.title}</h4>
                <Badge className={IMPACT_COLORS[trend.impact]}>
                  {trend.impact} impact
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                {trend.description}
              </p>
              {trend.entities && trend.entities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {trend.entities.map((entity, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant="ghost"
                      onClick={() => onNodeHighlight?.(entity)}
                      className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-6"
                    >
                      <Target className="w-3 h-3 mr-1" />
                      {entity}
                    </Button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Strategic Connections */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-purple-400" />
            Strategic Connections
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {analysis.strategic_connections?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {analysis.strategic_connections?.map((connection, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
            >
              <h4 className="text-white font-medium mb-2">{connection.title}</h4>
              <p className="text-sm text-slate-400 mb-2">
                {connection.description}
              </p>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-3">
                <div className="text-xs text-purple-400 font-medium mb-1">Strategic Value:</div>
                <div className="text-sm text-slate-300">{connection.strategic_value}</div>
              </div>
              {connection.key_entities && connection.key_entities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {connection.key_entities.map((entity, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant="ghost"
                      onClick={() => onNodeHighlight?.(entity)}
                      className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-6"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {entity}
                    </Button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Anomalies */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Anomalies & Gaps
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {analysis.anomalies?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {analysis.anomalies?.map((anomaly, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium">{anomaly.title}</h4>
                <Badge className={SEVERITY_COLORS[anomaly.severity]}>
                  {anomaly.severity} severity
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                {anomaly.description}
              </p>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="text-xs text-orange-400 font-medium mb-1">Recommendation:</div>
                <div className="text-sm text-slate-300">{anomaly.recommendation}</div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Future Implications */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Future Implications
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              {analysis.future_implications?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {analysis.future_implications?.map((implication, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium">{implication.title}</h4>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                  {implication.timeframe}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                {implication.description}
              </p>
              {implication.action_items && implication.action_items.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 font-medium">Action Items:</div>
                  {implication.action_items.map((action, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <ArrowRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}