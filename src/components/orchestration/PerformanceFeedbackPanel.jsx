import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, TrendingDown, Activity, Clock, Zap, 
  ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle, 
  CheckCircle, BarChart3, RefreshCw, Sparkles, Target
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function PerformanceFeedbackPanel({ workflowId, executions = [] }) {
  const [activeTab, setActiveTab] = useState('metrics');
  const [autoOptimize, setAutoOptimize] = useState(false);
  const queryClient = useQueryClient();

  const { data: workflow } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: async () => {
      const workflows = await base44.entities.AgentWorkflow.filter({ id: workflowId });
      return workflows[0];
    },
    enabled: !!workflowId
  });

  const { data: performanceData } = useQuery({
    queryKey: ['workflow_performance', workflowId],
    queryFn: async () => {
      const recentExecutions = executions.slice(0, 50);
      
      // Calculate metrics
      const successCount = recentExecutions.filter(e => e.status === 'completed').length;
      const failureCount = recentExecutions.filter(e => e.status === 'failed').length;
      const avgDuration = recentExecutions.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) / recentExecutions.length || 0;
      const avgQuality = recentExecutions.reduce((sum, e) => sum + (e.quality_score || 0), 0) / recentExecutions.length || 0;
      
      // Correction metrics
      const totalCorrections = recentExecutions.reduce((sum, e) => sum + (e.correction_count || 0), 0);
      const correctionRate = totalCorrections / recentExecutions.length || 0;

      // Time series data
      const timeSeriesData = recentExecutions.slice(-20).map((e, idx) => ({
        execution: idx + 1,
        duration: e.duration_seconds || 0,
        quality: (e.quality_score || 0) * 100,
        corrections: e.correction_count || 0
      }));

      // Step-level performance
      const stepPerformance = {};
      recentExecutions.forEach(exec => {
        exec.step_results?.forEach(step => {
          if (!stepPerformance[step.step_id]) {
            stepPerformance[step.step_id] = { success: 0, failure: 0, totalDuration: 0, count: 0 };
          }
          stepPerformance[step.step_id].count++;
          stepPerformance[step.step_id].totalDuration += step.duration_seconds || 0;
          if (step.status === 'completed') stepPerformance[step.step_id].success++;
          else stepPerformance[step.step_id].failure++;
        });
      });

      return {
        successRate: successCount / (successCount + failureCount) * 100 || 0,
        avgDuration,
        avgQuality,
        correctionRate,
        totalExecutions: recentExecutions.length,
        timeSeriesData,
        stepPerformance,
        recentExecutions
      };
    },
    enabled: executions.length > 0
  });

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      // AI-based optimization suggestions
      const suggestions = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this workflow performance data and suggest optimizations:
          
Workflow: ${workflow?.name}
Success Rate: ${performanceData?.successRate?.toFixed(1)}%
Avg Duration: ${performanceData?.avgDuration?.toFixed(1)}s
Correction Rate: ${performanceData?.correctionRate?.toFixed(2)}

Provide 3-5 specific optimization suggestions in JSON format:
{
  "suggestions": [
    {"type": "string", "description": "string", "impact": "high|medium|low", "implementation": "string"}
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  implementation: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Update workflow with suggestions
      await base44.entities.AgentWorkflow.update(workflowId, {
        performance_metrics: {
          ...workflow?.performance_metrics,
          optimization_suggestions: suggestions.suggestions.map(s => s.description),
          last_optimization: new Date().toISOString()
        }
      });

      return suggestions;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['workflow', workflowId]);
      toast.success('Optimization analysis complete');
    }
  });

  const submitFeedback = async (executionId, rating, comment) => {
    try {
      await base44.entities.WorkflowExecution.update(executionId, {
        user_feedback: {
          rating,
          comment,
          submitted_at: new Date().toISOString()
        }
      });
      toast.success('Feedback submitted');
      queryClient.invalidateQueries(['workflow_performance', workflowId]);
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Performance & Feedback
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-slate-400">Auto-Optimize</Label>
              <Switch
                checked={autoOptimize}
                onCheckedChange={setAutoOptimize}
              />
            </div>
            <Button
              size="sm"
              onClick={() => optimizeMutation.mutate()}
              disabled={optimizeMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {optimizeMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              Analyze
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 mb-4">
            <TabsTrigger value="metrics" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <BarChart3 className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <MessageSquare className="w-4 h-4 mr-2" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
              <Sparkles className="w-4 h-4 mr-2" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <MetricCard
                icon={CheckCircle}
                label="Success Rate"
                value={`${performanceData?.successRate?.toFixed(1) || 0}%`}
                trend={performanceData?.successRate > 80 ? 'up' : 'down'}
                color="green"
              />
              <MetricCard
                icon={Clock}
                label="Avg Duration"
                value={`${performanceData?.avgDuration?.toFixed(1) || 0}s`}
                trend="neutral"
                color="blue"
              />
              <MetricCard
                icon={Target}
                label="Avg Quality"
                value={`${(performanceData?.avgQuality * 100)?.toFixed(0) || 0}%`}
                trend={performanceData?.avgQuality > 0.7 ? 'up' : 'down'}
                color="purple"
              />
              <MetricCard
                icon={RefreshCw}
                label="Correction Rate"
                value={performanceData?.correctionRate?.toFixed(2) || 0}
                trend={performanceData?.correctionRate < 0.5 ? 'up' : 'down'}
                color="orange"
              />
            </div>

            {/* Step Performance */}
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Step-Level Performance</p>
              {Object.entries(performanceData?.stepPerformance || {}).map(([stepId, data]) => (
                <div key={stepId} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">{stepId}</span>
                    <Badge className={data.success / data.count > 0.9 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {((data.success / data.count) * 100).toFixed(0)}% success
                    </Badge>
                  </div>
                  <Progress 
                    value={(data.success / data.count) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData?.timeSeriesData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="execution" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Area type="monotone" dataKey="quality" stroke="#22C55E" fill="#22C55E" fillOpacity={0.2} name="Quality %" />
                  <Area type="monotone" dataKey="duration" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} name="Duration (s)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {performanceData?.recentExecutions?.slice(0, 10).map((exec) => (
                <div key={exec.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">
                      Execution #{exec.id?.slice(-6)}
                    </span>
                    <Badge className={exec.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {exec.status}
                    </Badge>
                  </div>
                  {exec.user_feedback ? (
                    <div className="text-xs text-slate-400">
                      Rating: {exec.user_feedback.rating === 'positive' ? '👍' : '👎'}
                      {exec.user_feedback.comment && ` - "${exec.user_feedback.comment}"`}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => submitFeedback(exec.id, 'positive', '')}
                        className="h-7 text-green-400 hover:bg-green-500/10"
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Good
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => submitFeedback(exec.id, 'negative', '')}
                        className="h-7 text-red-400 hover:bg-red-500/10"
                      >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        Poor
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggestions">
            <div className="space-y-3">
              {workflow?.performance_metrics?.optimization_suggestions?.map((suggestion, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-white">{suggestion}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {(!workflow?.performance_metrics?.optimization_suggestions || workflow?.performance_metrics?.optimization_suggestions.length === 0) && (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Click "Analyze" to get AI-powered optimization suggestions</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MetricCard({ icon: Icon, label, value, trend, color }) {
  const colors = {
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' }
  };

  const c = colors[color] || colors.blue;

  return (
    <div className={`p-4 rounded-lg ${c.bg} border ${c.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${c.text}`} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-white">{value}</span>
        {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
        {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
      </div>
    </div>
  );
}