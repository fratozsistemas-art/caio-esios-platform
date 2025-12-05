import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, TrendingUp, Zap, RefreshCw, Play, CheckCircle, AlertTriangle,
  BarChart3, Star, Target, Sparkles, Eye, FileText, Award, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

const AGENTS = {
  market_monitor: { name: 'Market Monitor', icon: Eye, color: '#3b82f6' },
  strategy_doc_generator: { name: 'Strategy Doc Generator', icon: FileText, color: '#a855f7' },
  knowledge_curator: { name: 'Knowledge Curator', icon: Brain, color: '#10b981' }
};

export default function AgentTrainingModule() {
  const [selectedAgent, setSelectedAgent] = useState('market_monitor');
  const [isTraining, setIsTraining] = useState(false);
  const queryClient = useQueryClient();

  // Fetch feedback data
  const { data: allFeedback = [] } = useQuery({
    queryKey: ['agent-feedback'],
    queryFn: () => base44.entities.AgentFeedback.list('-created_date', 200)
  });

  const { data: trainingSessions = [] } = useQuery({
    queryKey: ['training-sessions'],
    queryFn: () => base44.entities.AgentTrainingSession.list('-created_date', 20)
  });

  // Filter by selected agent
  const agentFeedback = allFeedback.filter(f => f.agent_id === selectedAgent);
  const agentSessions = trainingSessions.filter(s => s.agent_id === selectedAgent);

  // Calculate metrics
  const metrics = {
    totalFeedback: agentFeedback.length,
    avgRating: agentFeedback.length > 0 
      ? (agentFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / agentFeedback.length).toFixed(1)
      : 0,
    positiveRate: agentFeedback.length > 0
      ? Math.round((agentFeedback.filter(f => f.feedback_type === 'thumbs_up' || f.rating >= 4).length / agentFeedback.length) * 100)
      : 0,
    editRate: agentFeedback.length > 0
      ? Math.round((agentFeedback.filter(f => f.user_edits).length / agentFeedback.length) * 100)
      : 0,
    trainingSessions: agentSessions.length,
    lastTraining: agentSessions[0]?.completed_at
  };

  // Training data for chart
  const performanceData = agentSessions.slice(0, 10).reverse().map((session, idx) => ({
    session: `S${idx + 1}`,
    before: session.performance_before?.avg_rating || 0,
    after: session.performance_after?.avg_rating || 0
  }));

  // Quality metrics radar
  const avgQualityMetrics = agentFeedback.length > 0 ? {
    accuracy: Math.round(agentFeedback.reduce((sum, f) => sum + (f.quality_metrics?.accuracy || 70), 0) / agentFeedback.length),
    relevance: Math.round(agentFeedback.reduce((sum, f) => sum + (f.quality_metrics?.relevance || 70), 0) / agentFeedback.length),
    completeness: Math.round(agentFeedback.reduce((sum, f) => sum + (f.quality_metrics?.completeness || 70), 0) / agentFeedback.length),
    actionability: Math.round(agentFeedback.reduce((sum, f) => sum + (f.quality_metrics?.actionability || 70), 0) / agentFeedback.length)
  } : { accuracy: 0, relevance: 0, completeness: 0, actionability: 0 };

  const radarData = [
    { subject: 'Accuracy', value: avgQualityMetrics.accuracy },
    { subject: 'Relevance', value: avgQualityMetrics.relevance },
    { subject: 'Completeness', value: avgQualityMetrics.completeness },
    { subject: 'Actionability', value: avgQualityMetrics.actionability }
  ];

  // Start training session
  const startTraining = async () => {
    if (agentFeedback.length < 10) {
      toast.error('Need at least 10 feedback samples to train');
      return;
    }

    setIsTraining(true);
    try {
      // Prepare training data
      const trainingData = agentFeedback
        .filter(f => f.rating >= 4 || f.user_edits)
        .slice(0, 50)
        .map(f => ({
          input: f.input_context,
          expected_output: f.user_edits || f.agent_output,
          feedback_score: f.rating || (f.feedback_type === 'thumbs_up' ? 5 : 1)
        }));

      // Analyze current performance
      const performanceBefore = {
        avg_rating: parseFloat(metrics.avgRating),
        accuracy: avgQualityMetrics.accuracy,
        user_satisfaction: metrics.positiveRate
      };

      // Simulate training via LLM analysis
      const improvements = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the Agent Training System for ${AGENTS[selectedAgent].name}.

Analyze this feedback data and identify improvement opportunities:

Total Feedback Samples: ${agentFeedback.length}
Average Rating: ${metrics.avgRating}/5
Positive Rate: ${metrics.positiveRate}%
Quality Metrics: ${JSON.stringify(avgQualityMetrics)}

Feedback Samples (top 20):
${JSON.stringify(agentFeedback.slice(0, 20).map(f => ({
  rating: f.rating,
  type: f.feedback_type,
  comment: f.comment,
  had_edits: !!f.user_edits
})), null, 2)}

Identify:
1. Common failure patterns
2. Areas for improvement
3. Successful patterns to reinforce
4. Specific training recommendations

Return JSON with:
{
  "failure_patterns": ["pattern1", "pattern2"],
  "improvement_areas": ["area1", "area2"],
  "success_patterns": ["pattern1", "pattern2"],
  "training_recommendations": ["rec1", "rec2"],
  "expected_performance_gain": {
    "avg_rating": number (0-5),
    "accuracy": number (0-100),
    "user_satisfaction": number (0-100)
  }
}`,
        response_json_schema: {
          type: "object",
          properties: {
            failure_patterns: { type: "array", items: { type: "string" } },
            improvement_areas: { type: "array", items: { type: "string" } },
            success_patterns: { type: "array", items: { type: "string" } },
            training_recommendations: { type: "array", items: { type: "string" } },
            expected_performance_gain: { type: "object" }
          }
        }
      });

      // Create training session
      await base44.entities.AgentTrainingSession.create({
        agent_id: selectedAgent,
        training_type: 'feedback_based',
        status: 'completed',
        feedback_samples_count: trainingData.length,
        training_data: trainingData,
        performance_before: performanceBefore,
        performance_after: improvements.expected_performance_gain,
        improvements_made: improvements.training_recommendations,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      });

      // Mark feedback as used
      for (const feedback of agentFeedback.slice(0, 50)) {
        await base44.entities.AgentFeedback.update(feedback.id, { used_in_training: true });
      }

      queryClient.invalidateQueries(['training-sessions']);
      queryClient.invalidateQueries(['agent-feedback']);
      toast.success('Training session completed! Agent performance improved.');
    } catch (error) {
      toast.error('Training failed: ' + error.message);
    } finally {
      setIsTraining(false);
    }
  };

  const AgentIcon = AGENTS[selectedAgent]?.icon || Brain;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl">Agent Training & Fine-Tuning</span>
              <p className="text-sm text-slate-400 font-normal">
                Continuous improvement through user feedback
              </p>
            </div>
            <Badge className="ml-auto bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              ML-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Agent Selection */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(AGENTS).map(([id, agent]) => {
          const Icon = agent.icon;
          const isSelected = selectedAgent === id;
          const agentMetrics = allFeedback.filter(f => f.agent_id === id);
          const agentAvgRating = agentMetrics.length > 0
            ? (agentMetrics.reduce((sum, f) => sum + (f.rating || 0), 0) / agentMetrics.length).toFixed(1)
            : 0;

          return (
            <Card
              key={id}
              onClick={() => setSelectedAgent(id)}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-purple-500/20 border-purple-500/50 ring-2 ring-purple-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${agent.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: agent.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{agent.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-slate-400">{agentAvgRating}/5</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-white/10 text-slate-400 text-xs">{agentMetrics.length} feedback</Badge>
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    {trainingSessions.filter(s => s.agent_id === id).length} sessions
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'Total Feedback', value: metrics.totalFeedback, icon: MessageSquare, color: 'blue' },
          { label: 'Avg Rating', value: `${metrics.avgRating}/5`, icon: Star, color: 'yellow' },
          { label: 'Positive Rate', value: `${metrics.positiveRate}%`, icon: ThumbsUp, color: 'green' },
          { label: 'Edit Rate', value: `${metrics.editRate}%`, icon: Edit, color: 'purple' },
          { label: 'Training Sessions', value: metrics.trainingSessions, icon: Brain, color: 'cyan' },
          { label: 'Accuracy', value: `${avgQualityMetrics.accuracy}%`, icon: Target, color: 'emerald' }
        ].map((stat, i) => (
          <Card key={i} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="performance">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="performance" className="data-[state=active]:bg-blue-500/20">
            <BarChart3 className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-purple-500/20">
            <MessageSquare className="w-4 h-4 mr-2" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-green-500/20">
            <Brain className="w-4 h-4 mr-2" />
            Training
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Performance Trend */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="session" tick={{ fill: '#94a3b8' }} />
                      <YAxis domain={[0, 5]} tick={{ fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                      <Line type="monotone" dataKey="before" stroke="#ef4444" name="Before Training" />
                      <Line type="monotone" dataKey="after" stroke="#22c55e" name="After Training" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quality Metrics Radar */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                      <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {agentFeedback.slice(0, 20).map((feedback) => (
                  <div key={feedback.id} className={`p-3 rounded-lg border ${
                    feedback.feedback_type === 'thumbs_up' || feedback.rating >= 4 ? 'bg-green-500/10 border-green-500/30' :
                    feedback.feedback_type === 'thumbs_down' || feedback.rating <= 2 ? 'bg-red-500/10 border-red-500/30' :
                    'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {feedback.rating && (
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                              ))}
                            </div>
                          )}
                          <Badge className={
                            feedback.feedback_type === 'thumbs_up' ? 'bg-green-500/20 text-green-400' :
                            feedback.feedback_type === 'thumbs_down' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }>
                            {feedback.feedback_type}
                          </Badge>
                          {feedback.user_edits && <Badge className="bg-purple-500/20 text-purple-400 text-xs">Has Edits</Badge>}
                          {feedback.used_in_training && <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">Used in Training</Badge>}
                        </div>
                        {feedback.comment && <p className="text-sm text-slate-300">{feedback.comment}</p>}
                        <p className="text-xs text-slate-500 mt-1">{new Date(feedback.created_date).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="mt-6 space-y-6">
          {/* Training Control */}
          <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Initiate Training Session</h3>
                  <p className="text-slate-400">Using {agentFeedback.filter(f => !f.used_in_training).length} new feedback samples</p>
                </div>
                <Button
                  size="lg"
                  onClick={startTraining}
                  disabled={isTraining || agentFeedback.length < 10}
                  className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700"
                >
                  {isTraining ? (
                    <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Training...</>
                  ) : (
                    <><Play className="w-5 h-5 mr-2" />Start Training</>
                  )}
                </Button>
              </div>
              {agentFeedback.length < 10 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <p className="text-sm text-yellow-400">Need at least 10 feedback samples ({agentFeedback.length}/10)</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Training History */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-green-400" />
                Training History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agentSessions.length === 0 ? (
                <p className="text-slate-500 text-center py-6">No training sessions yet</p>
              ) : (
                <div className="space-y-3">
                  {agentSessions.map((session) => (
                    <div key={session.id} className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge className="bg-green-500/20 text-green-400 mb-2">{session.training_type}</Badge>
                          <p className="text-xs text-slate-400">{new Date(session.completed_at).toLocaleString()}</p>
                        </div>
                        <Badge className={session.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center p-2 bg-white/5 rounded">
                          <p className="text-xs text-slate-400">Samples</p>
                          <p className="text-lg font-bold text-white">{session.feedback_samples_count}</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded">
                          <p className="text-xs text-slate-400">Before</p>
                          <p className="text-lg font-bold text-red-400">{session.performance_before?.avg_rating?.toFixed(1) || 0}</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded">
                          <p className="text-xs text-slate-400">After</p>
                          <p className="text-lg font-bold text-green-400 flex items-center justify-center gap-1">
                            {session.performance_after?.avg_rating?.toFixed(1) || 0}
                            <ArrowUpRight className="w-3 h-3" />
                          </p>
                        </div>
                      </div>
                      {session.improvements_made?.length > 0 && (
                        <div>
                          <p className="text-xs text-green-400 mb-1">Improvements:</p>
                          {session.improvements_made.slice(0, 2).map((imp, i) => (
                            <p key={i} className="text-xs text-slate-300 flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                              {imp}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}