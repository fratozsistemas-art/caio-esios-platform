import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, TrendingUp, TrendingDown, Clock, 
  Sparkles, Target, Calendar, ArrowRight, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function PredictiveInsights({ predictions, onActionClick }) {
  if (!predictions) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No predictions available</p>
        </CardContent>
      </Card>
    );
  }

  const { churn_risk, predicted_needs, engagement_recommendations, satisfaction_trend, confidence_trajectory } = predictions;

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Churn Risk Alert */}
      {churn_risk && churn_risk.risk_level !== 'LOW' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`border-2 ${
            churn_risk.risk_level === 'HIGH' 
              ? 'bg-red-500/10 border-red-500/50' 
              : 'bg-yellow-500/10 border-yellow-500/50'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className={`w-8 h-8 flex-shrink-0 ${
                  churn_risk.risk_level === 'HIGH' ? 'text-red-400' : 'text-yellow-400'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-bold text-lg">Churn Risk Alert</h3>
                    <Badge className={getRiskColor(churn_risk.risk_level)}>
                      {churn_risk.risk_level} RISK ({churn_risk.risk_score}%)
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-300 text-sm mb-3">Primary Concerns:</p>
                    <div className="flex flex-wrap gap-2">
                      {churn_risk.primary_concerns?.map((concern, idx) => (
                        <Badge key={idx} variant="outline" className="border-white/20 text-slate-300 capitalize">
                          {concern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Predicted Needs */}
      {predicted_needs && predicted_needs.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Predicted Strategic Needs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {predicted_needs.map((need, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-semibold flex-1">{need.need}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {need.confidence}% confidence
                    </Badge>
                    <Badge variant="outline" className="border-white/20 text-slate-300">
                      {need.timing}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-3">{need.rationale}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {need.recommended_frameworks?.map((fw, fidx) => (
                    <Badge key={fidx} className="bg-purple-500/20 text-purple-400 text-xs">
                      {fw}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-slate-400 italic">💡 {need.suggested_approach}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actionable Recommendations */}
      {engagement_recommendations && engagement_recommendations.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {engagement_recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                    <Badge variant="outline" className="border-white/20 text-slate-300 text-xs">
                      {rec.category}
                    </Badge>
                  </div>
                  <h4 className="text-white font-medium text-sm">{rec.action}</h4>
                  <p className="text-xs text-slate-400 mt-1">{rec.rationale}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onActionClick?.(rec)}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Trend Indicators */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Satisfaction Trend */}
        {satisfaction_trend && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                {satisfaction_trend.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : satisfaction_trend.direction === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
                Satisfaction Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-white">
                  {satisfaction_trend.recent_avg}
                </span>
                <span className="text-slate-400 text-sm mb-1">/5.0</span>
                {satisfaction_trend.delta !== 0 && (
                  <Badge className={
                    satisfaction_trend.delta > 0 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }>
                    {satisfaction_trend.delta > 0 ? '+' : ''}{satisfaction_trend.delta}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400">
                vs {satisfaction_trend.historical_avg} historical avg
              </p>
              <Badge className={
                satisfaction_trend.trend === 'IMPROVING' ? 'bg-green-500/20 text-green-400' :
                satisfaction_trend.trend === 'DECLINING' ? 'bg-red-500/20 text-red-400' :
                'bg-slate-500/20 text-slate-400'
              } className="mt-2">
                {satisfaction_trend.trend}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Confidence Trajectory */}
        {confidence_trajectory && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                {confidence_trajectory.trajectory === 'IMPROVING' ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : confidence_trajectory.trajectory === 'DECLINING' ? (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                )}
                Archetype Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Current</p>
                  <p className="text-3xl font-bold text-white">{confidence_trajectory.current}%</p>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-400 mb-1">30-day projection</p>
                  <p className={`text-3xl font-bold ${
                    confidence_trajectory.projected_30d >= 80 ? 'text-green-400' :
                    confidence_trajectory.projected_30d >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {confidence_trajectory.projected_30d}%
                  </p>
                </div>
              </div>
              <Badge className={
                confidence_trajectory.trajectory === 'IMPROVING' ? 'bg-green-500/20 text-green-400' :
                confidence_trajectory.trajectory === 'DECLINING' ? 'bg-red-500/20 text-red-400' :
                'bg-blue-500/20 text-blue-400'
              }>
                {confidence_trajectory.trajectory}
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Optimal Timing */}
      {predictions.optimal_next_timing && (
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-400" />
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">Optimal Next Engagement</h4>
                <p className="text-blue-400 text-lg font-bold">
                  {predictions.optimal_next_timing.suggested_date}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {predictions.optimal_next_timing.rationale}
                </p>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400">
                {predictions.optimal_next_timing.confidence}% confidence
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}