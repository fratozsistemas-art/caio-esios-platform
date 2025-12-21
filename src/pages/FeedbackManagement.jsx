import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Star, TrendingUp, AlertCircle, 
  CheckCircle, Clock, Sparkles, Loader2, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function FeedbackManagement() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [aiSummary, setAiSummary] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const { data: feedbackList = [], refetch } = useQuery({
    queryKey: ['feedback', statusFilter, typeFilter],
    queryFn: async () => {
      let feedback = await base44.entities.Feedback.list('-created_date', 100);
      
      if (statusFilter !== 'all') {
        feedback = feedback.filter(f => f.status === statusFilter);
      }
      
      if (typeFilter !== 'all') {
        feedback = feedback.filter(f => f.feedback_type === typeFilter);
      }
      
      return feedback;
    }
  });

  const stats = {
    total: feedbackList.length,
    avgRating: feedbackList.filter(f => f.rating).length > 0
      ? (feedbackList.filter(f => f.rating).reduce((sum, f) => sum + f.rating, 0) / 
         feedbackList.filter(f => f.rating).length).toFixed(1)
      : 'N/A',
    new: feedbackList.filter(f => f.status === 'new').length,
    positive: feedbackList.filter(f => f.rating >= 4).length,
    negative: feedbackList.filter(f => f.rating <= 2).length
  };

  const generateAISummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const feedbackData = feedbackList.map(f => ({
        type: f.feedback_type,
        rating: f.rating,
        comment: f.comment,
        component: f.target_component,
        date: f.created_date
      }));

      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this user feedback data and provide:
1. Overall sentiment and satisfaction trends
2. Most common pain points or issues
3. Most praised features or aspects
4. Actionable recommendations for improvement
5. Priority items that need immediate attention

Feedback Data:
${JSON.stringify(feedbackData, null, 2)}

Respond in JSON format with this structure:
{
  "overall_sentiment": "positive/neutral/negative with explanation",
  "satisfaction_score": number (1-10),
  "common_issues": ["issue 1", "issue 2", "issue 3"],
  "praised_features": ["feature 1", "feature 2", "feature 3"],
  "recommendations": [{"title": "rec", "description": "detail", "priority": "high/medium/low"}],
  "urgent_items": ["item 1", "item 2"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_sentiment: { type: "string" },
            satisfaction_score: { type: "number" },
            common_issues: { type: "array", items: { type: "string" } },
            praised_features: { type: "array", items: { type: "string" } },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            urgent_items: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAiSummary(summary);
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      const user = await base44.auth.me();
      await base44.entities.Feedback.update(feedbackId, {
        status: newStatus,
        reviewed_by: user.email,
        reviewed_at: new Date().toISOString()
      });
      refetch();
    } catch (error) {
      console.error('Failed to update feedback:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'reviewed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'dismissed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug_report': return AlertCircle;
      case 'feature_request': return Sparkles;
      default: return MessageSquare;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-[#00D4FF]" />
            Feedback Management
          </h1>
          <p className="text-slate-400">Review and analyze user feedback</p>
        </div>
        <Button
          onClick={generateAISummary}
          disabled={isGeneratingSummary || feedbackList.length === 0}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isGeneratingSummary ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Summary
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Feedback', value: stats.total, icon: MessageSquare, color: 'blue' },
          { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'yellow' },
          { label: 'New', value: stats.new, icon: Clock, color: 'cyan' },
          { label: 'Positive', value: stats.positive, icon: TrendingUp, color: 'green' },
          { label: 'Negative', value: stats.negative, icon: AlertCircle, color: 'red' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">Overall Sentiment</p>
                <p className="text-white">{aiSummary.overall_sentiment}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Satisfaction Score</p>
                <div className="text-3xl font-bold text-white">
                  {aiSummary.satisfaction_score}/10
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">Common Issues</p>
                <ul className="space-y-1">
                  {aiSummary.common_issues?.map((issue, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Praised Features</p>
                <ul className="space-y-1">
                  {aiSummary.praised_features?.map((feature, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {aiSummary.recommendations?.length > 0 && (
              <div>
                <p className="text-sm text-slate-400 mb-2">Recommendations</p>
                <div className="space-y-2">
                  {aiSummary.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-white">{rec.title}</p>
                        <Badge className={
                          rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="widget_rating">Widget Rating</SelectItem>
            <SelectItem value="insight_comment">Insight Comment</SelectItem>
            <SelectItem value="general_feedback">General</SelectItem>
            <SelectItem value="bug_report">Bug Report</SelectItem>
            <SelectItem value="feature_request">Feature Request</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {feedbackList.map((feedback) => {
          const TypeIcon = getTypeIcon(feedback.feedback_type);
          return (
            <Card key={feedback.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <TypeIcon className="w-5 h-5 text-[#00D4FF] flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
                          {feedback.feedback_type.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(feedback.status)}>
                          {feedback.status}
                        </Badge>
                        {feedback.rating && (
                          <div className="flex items-center gap-1">
                            {Array.from({ length: feedback.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        )}
                      </div>
                      {feedback.comment && (
                        <p className="text-sm text-slate-300 mb-2">{feedback.comment}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{feedback.user_email}</span>
                        {feedback.target_component && (
                          <span>• {feedback.target_component}</span>
                        )}
                        <span>• {new Date(feedback.created_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {feedback.status === 'new' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateFeedbackStatus(feedback.id, 'reviewed')}
                        className="border-[#00D4FF]/40 text-[#00D4FF] hover:bg-[#00D4FF]/20"
                      >
                        Review
                      </Button>
                    )}
                    {feedback.status !== 'resolved' && feedback.status !== 'dismissed' && (
                      <Button
                        size="sm"
                        onClick={() => updateFeedbackStatus(feedback.id, 'resolved')}
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {feedbackList.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No feedback found</p>
          </div>
        )}
      </div>
    </div>
  );
}