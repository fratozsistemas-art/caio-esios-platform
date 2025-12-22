import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Loader2, TrendingUp, AlertCircle, 
  CheckCircle, ArrowRight, ThumbsUp, ThumbsDown 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function WorkflowOptimizer({ workflowId, workflow, onOptimized }) {
  const [optimization, setOptimization] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const result = await base44.functions.invoke('optimizeWorkflow', {
        workflowId
      });
      setOptimization(result);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyOptimization = async () => {
    try {
      await base44.entities.AgentWorkflow.update(workflowId, {
        workflow_steps: optimization.optimized_steps,
        metadata: {
          ...workflow.metadata,
          optimized: true,
          optimization_date: new Date().toISOString(),
          efficiency_gain: optimization.estimated_performance_gain
        }
      });

      // Record positive feedback
      await base44.functions.invoke('learnFromFeedback', {
        suggestion_id: `optimize_${workflowId}`,
        suggestion_type: 'workflow_optimization',
        feedback_type: 'optimization',
        rating: 5,
        comment: 'User applied optimization',
        metadata: { 
          efficiency_gain: optimization.estimated_performance_gain,
          improvements_count: optimization.improvements?.length
        }
      });

      onOptimized?.();
      setOptimization(null);
      toast.success('Optimization applied! AI is learning from this.');
    } catch (error) {
      console.error('Failed to apply optimization:', error);
      toast.error('Failed to apply optimization');
    }
  };

  const handleRejectOptimization = async () => {
    try {
      await base44.functions.invoke('learnFromFeedback', {
        suggestion_id: `optimize_${workflowId}`,
        suggestion_type: 'workflow_optimization',
        feedback_type: 'optimization',
        rating: 2,
        comment: 'User rejected optimization',
        metadata: { 
          efficiency_gain: optimization.estimated_performance_gain 
        }
      });
      setOptimization(null);
      toast.success('Thanks for the feedback!');
    } catch (error) {
      console.error('Failed to record feedback:', error);
    }
  };

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleOptimize}
        disabled={isOptimizing}
        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
      >
        {isOptimizing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Optimize Workflow
          </>
        )}
      </Button>

      <AnimatePresence>
        {optimization && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Efficiency Score */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Current Efficiency</p>
                    <div className="text-2xl font-bold text-white">
                      {optimization.current_efficiency_score}%
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Optimized Efficiency</p>
                    <div className="text-2xl font-bold text-green-400">
                      {optimization.optimized_efficiency_score}%
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-semibold">
                      {optimization.estimated_performance_gain} improvement
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">Optimization Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{optimization.summary}</p>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">Recommended Improvements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {optimization.improvements?.map((improvement, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-white capitalize">
                        {improvement.type.replace('_', ' ')}
                      </h4>
                      <Badge className={getImpactColor(improvement.impact)}>
                        {improvement.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      <strong>Issue:</strong> {improvement.current_issue}
                    </p>
                    <p className="text-xs text-slate-300 mb-2">
                      <strong>Fix:</strong> {improvement.recommendation}
                    </p>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Saves: {improvement.estimated_time_saved}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={handleApplyOptimization}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Apply Optimization
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRejectOptimization}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-center text-slate-500">
                Your feedback helps AI learn better optimization strategies
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}