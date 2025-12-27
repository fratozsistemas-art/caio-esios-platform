import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, TrendingUp, GitMerge, Target, Zap, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import InsightFeedbackDialog from './InsightFeedbackDialog';

export default function KeyInfluencersPanel({ influencers, onInfluencerClick }) {
  const [feedbackInfluencer, setFeedbackInfluencer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!influencers || influencers.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            Key Influencers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-slate-400">No influencers identified</p>
            <p className="text-xs text-slate-500 mt-1">Run analysis to identify key nodes</p>
          </div>
          </CardContent>

          {/* Feedback Dialog */}
          <InsightFeedbackDialog
          open={showFeedback}
          onClose={() => setShowFeedback(false)}
          insight={feedbackInfluencer}
          insightType="influencer"
          />
          </Card>
          );
          }

  const topInfluencers = influencers.slice(0, 10);

  return (
    <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-400" />
          Key Influencers
          <Badge className="ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Top {topInfluencers.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {topInfluencers.map((influencer, idx) => {
          const rank = idx + 1;
          const isTopThree = rank <= 3;

          return (
            <motion.div
              key={influencer.node_id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-3 rounded-lg border cursor-pointer hover:bg-white/5 transition-all ${
                isTopThree 
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/40' 
                  : 'bg-white/5 border-white/10'
              }`}
              onClick={() => onInfluencerClick?.(influencer)}
            >
              <div className="flex items-start gap-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${
                  isTopThree ? 'bg-yellow-500/30 text-yellow-400' : 'bg-white/10 text-slate-400'
                }`}>
                  {isTopThree ? <Crown className="w-3 h-3" /> : <span className="text-xs font-bold">{rank}</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-white text-sm font-medium truncate">
                      {influencer.label}
                    </p>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs flex-shrink-0">
                      {influencer.influence_score.toFixed(0)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <Badge variant="outline" className="border-white/20 text-slate-500 text-xs">
                      {influencer.node_type}
                    </Badge>
                    <span>{influencer.degree} connections</span>
                  </div>

                  {/* Metrics breakdown */}
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="flex flex-col items-center p-1 bg-white/5 rounded">
                      <TrendingUp className="w-3 h-3 text-blue-400 mb-0.5" />
                      <span className="text-slate-400">Degree</span>
                      <span className="text-white font-medium">
                        {(influencer.degree_normalized * 100).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-1 bg-white/5 rounded">
                      <GitMerge className="w-3 h-3 text-purple-400 mb-0.5" />
                      <span className="text-slate-400">Between</span>
                      <span className="text-white font-medium">
                        {(influencer.betweenness_normalized * 100).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-1 bg-white/5 rounded">
                      <Target className="w-3 h-3 text-green-400 mb-0.5" />
                      <span className="text-slate-400">Close</span>
                      <span className="text-white font-medium">
                        {(influencer.closeness_normalized * 100).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-1 bg-white/5 rounded">
                      <Zap className="w-3 h-3 text-orange-400 mb-0.5" />
                      <span className="text-slate-400">Eigen</span>
                      <span className="text-white font-medium">
                        {(influencer.eigenvector_normalized * 100).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Feedback Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeedbackInfluencer(influencer);
                      setShowFeedback(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1 h-auto mt-2 text-xs w-full"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Rate Analysis
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>

      {/* Feedback Dialog */}
      <InsightFeedbackDialog
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        insight={feedbackInfluencer}
        insightType="influencer"
      />
    </Card>
  );
}