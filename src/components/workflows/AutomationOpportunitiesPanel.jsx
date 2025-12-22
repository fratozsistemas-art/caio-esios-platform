import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Loader2, TrendingUp, Clock, AlertCircle,
  CheckCircle, ThumbsUp, ThumbsDown, ChevronRight
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

export default function AutomationOpportunitiesPanel({ onCreateWorkflow }) {
  const [opportunities, setOpportunities] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [feedbackMode, setFeedbackMode] = useState({});

  const loadOpportunities = async () => {
    setIsLoading(true);
    try {
      const result = await base44.functions.invoke('identifyAutomationOpportunities');
      setOpportunities(result);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
      toast.error('Failed to load automation opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (opportunity, rating, comment = '') => {
    try {
      await base44.functions.invoke('learnFromFeedback', {
        suggestion_id: `automation_${opportunity.title.replace(/\s/g, '_')}`,
        suggestion_type: 'automation_opportunity',
        feedback_type: 'workflow_suggestion',
        rating,
        comment,
        metadata: {
          category: opportunity.category,
          priority: opportunity.priority,
          confidence_score: opportunity.confidence_score
        }
      });

      toast.success('Feedback recorded! AI will learn from this.');
      setFeedbackMode(prev => ({ ...prev, [opportunity.title]: false }));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'task_automation': return '🤖';
      case 'scheduling': return '⏰';
      case 'integration': return '🔗';
      case 'reporting': return '📊';
      case 'data_sync': return '🔄';
      case 'error_reduction': return '🛡️';
      default: return '✨';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI-Detected Automation Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300 mb-4">
            Our AI analyzes your workflow patterns, system logs, and feedback to proactively identify automation opportunities.
          </p>
          <Button
            onClick={loadOpportunities}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Detect Opportunities
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {opportunities && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary Card */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Opportunities Found</p>
                    <p className="text-2xl font-bold text-white">{opportunities.opportunities?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Potential Savings</p>
                    <p className="text-2xl font-bold text-green-400">{opportunities.total_estimated_time_savings}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-slate-300">{opportunities.summary}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Based on {opportunities.analyzed_data?.executions || 0} workflow executions
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Opportunities List */}
            <div className="space-y-3">
              {opportunities.opportunities?.map((opp, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl">{getCategoryIcon(opp.category)}</span>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-1">{opp.title}</h3>
                            <p className="text-sm text-slate-300 mb-2">{opp.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge className={getPriorityColor(opp.priority)}>
                                {opp.priority} priority
                              </Badge>
                              <Badge className="bg-[#00D4FF]/20 text-[#00D4FF]">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {opp.estimated_impact}
                              </Badge>
                              <Badge className="bg-white/10 text-slate-300">
                                {opp.implementation_complexity}
                              </Badge>
                              <Badge className="bg-purple-500/20 text-purple-400">
                                {opp.confidence_score}% confident
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                          className="text-slate-400 hover:text-white"
                        >
                          <ChevronRight className={`w-5 h-5 transition-transform ${expandedId === idx ? 'rotate-90' : ''}`} />
                        </Button>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedId === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-3"
                          >
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <p className="text-xs text-slate-400 mb-1">Current Pain Point:</p>
                              <p className="text-sm text-slate-200">{opp.current_pain_point}</p>
                            </div>

                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <p className="text-xs text-slate-400 mb-2">Suggested Workflow:</p>
                              <p className="text-sm font-medium text-white mb-2">{opp.suggested_workflow?.name}</p>
                              <div className="space-y-1">
                                {opp.suggested_workflow?.steps?.map((step, i) => (
                                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                    <span className="text-purple-400">{i + 1}.</span>
                                    {step}
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 flex gap-2">
                                <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Setup: {opp.suggested_workflow?.estimated_setup_time}
                                </Badge>
                                <Badge className="bg-white/10 text-slate-300 text-xs">
                                  Triggers: {opp.suggested_workflow?.triggers?.join(', ')}
                                </Badge>
                              </div>
                            </div>

                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <p className="text-xs text-slate-400 mb-1">Evidence:</p>
                              <p className="text-xs text-slate-300">{opp.evidence}</p>
                            </div>

                            {/* Feedback Section */}
                            {!feedbackMode[opp.title] ? (
                              <div className="flex gap-2 pt-3 border-t border-white/10">
                                <Button
                                  size="sm"
                                  onClick={() => onCreateWorkflow?.(opp.suggested_workflow)}
                                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Create Workflow
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleFeedback(opp, 5, 'Accepted suggestion')}
                                  className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setFeedbackMode(prev => ({ ...prev, [opp.title]: true }))}
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2 pt-3 border-t border-white/10">
                                <Textarea
                                  placeholder="Why isn't this helpful? (Optional)"
                                  className="bg-white/5 border-white/10 text-white"
                                  rows={2}
                                  onChange={(e) => setFeedbackMode(prev => ({ 
                                    ...prev, 
                                    [opp.title]: e.target.value || true 
                                  }))}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const comment = typeof feedbackMode[opp.title] === 'string' 
                                        ? feedbackMode[opp.title] 
                                        : 'Not helpful';
                                      handleFeedback(opp, 1, comment);
                                    }}
                                    className="flex-1 bg-red-500 hover:bg-red-600"
                                  >
                                    Submit Feedback
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setFeedbackMode(prev => ({ ...prev, [opp.title]: false }))}
                                    className="border-white/20 text-white hover:bg-white/10"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}