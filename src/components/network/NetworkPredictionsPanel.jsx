import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Network, Sparkles, Target, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import InsightFeedbackDialog from './InsightFeedbackDialog';

export default function NetworkPredictionsPanel({ predictions, metadata, onTogglePredictionView }) {
  const [feedbackPrediction, setFeedbackPrediction] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!predictions) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Network Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-slate-400">No predictions available</p>
            <p className="text-xs text-slate-500 mt-1">Run analysis to generate predictions</p>
          </div>
          </CardContent>

          {/* Feedback Dialog */}
          <InsightFeedbackDialog
          open={showFeedback}
          onClose={() => setShowFeedback(false)}
          insight={feedbackPrediction}
          insightType="prediction"
          />
          </Card>
          );
          }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Network Predictions
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePredictionView}
            className="h-7 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
          >
            Toggle View
          </Button>
        </div>
        {metadata && (
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
              Confidence: {metadata.confidence_score?.toFixed(0)}%
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
              {metadata.timeframe_days} days
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Predicted Relationships */}
        {predictions.predicted_relationships && predictions.predicted_relationships.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <h4 className="text-white text-xs font-semibold">Likely New Relationships</h4>
            </div>
            <div className="space-y-2">
              {predictions.predicted_relationships.slice(0, 5).map((rel, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 rounded-lg p-2 border border-white/10"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate">
                      {rel.relationship_type}
                    </span>
                    <Badge className="bg-cyan-500/20 text-cyan-400 text-xs ml-2 flex-shrink-0">
                      {Math.round(rel.confidence * 100)}%
                    </Badge>
                  </div>
                  {rel.reasoning && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{rel.reasoning}</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeedbackPrediction({ ...rel, id: `pred_rel_${idx}`, label: rel.relationship_type });
                      setShowFeedback(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1 h-auto mt-1 text-xs w-full"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Rate Prediction
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Growth Predictions */}
        {predictions.growth_predictions && Object.keys(predictions.growth_predictions).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <h4 className="text-white text-xs font-semibold">Predicted Growth</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(predictions.growth_predictions).slice(0, 4).map(([type, count], idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-xs text-slate-400 capitalize">{type}</p>
                  <p className="text-white font-bold">+{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emerging Patterns */}
        {predictions.emerging_patterns && predictions.emerging_patterns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-orange-400" />
              <h4 className="text-white text-xs font-semibold">Emerging Patterns</h4>
            </div>
            <div className="space-y-1">
              {predictions.emerging_patterns.slice(0, 3).map((pattern, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-xs text-slate-300">{pattern}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rising Influencers */}
        {predictions.rising_influencers && predictions.rising_influencers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-yellow-400" />
              <h4 className="text-white text-xs font-semibold">Rising Influencers</h4>
            </div>
            <div className="space-y-1">
              {predictions.rising_influencers.slice(0, 3).map((influencer, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-xs text-white font-medium">{influencer.node_id}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{influencer.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Feedback Dialog */}
      <InsightFeedbackDialog
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        insight={feedbackPrediction}
        insightType="prediction"
      />
    </Card>
  );
}