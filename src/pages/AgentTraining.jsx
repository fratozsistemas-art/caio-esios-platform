import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Brain, Upload, Target, TrendingUp, Star, BookOpen, Settings,
  FileText, Eye, Sparkles, CheckCircle, AlertCircle, BarChart3,
  MessageSquare, ThumbsUp, ThumbsDown, Zap
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const AGENT_ROLES = {
  market_monitor: {
    name: 'Market Monitor',
    icon: Eye,
    color: '#3b82f6',
    defaultGoals: ['Improve market trend detection', 'Enhance data accuracy', 'Reduce false positives']
  },
  strategy_doc_generator: {
    name: 'Strategy Doc Generator',
    icon: FileText,
    color: '#a855f7',
    defaultGoals: ['Enhance creative strategy generation', 'Improve document structure', 'Better actionable insights']
  },
  knowledge_curator: {
    name: 'Knowledge Curator',
    icon: Brain,
    color: '#10b981',
    defaultGoals: ['Better knowledge linking', 'Improve relevance scoring', 'Faster information retrieval']
  }
};

export default function AgentTraining() {
  const [activeTab, setActiveTab] = useState("feedback");
  const [selectedAgent, setSelectedAgent] = useState("market_monitor");
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const [trainingGoal, setTrainingGoal] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch feedback data
  const { data: feedbackData = [] } = useQuery({
    queryKey: ['agent-feedback'],
    queryFn: () => base44.entities.AgentFeedback.list('-created_date', 50)
  });

  // Fetch training sessions
  const { data: trainingSessions = [] } = useQuery({
    queryKey: ['agent-training-sessions'],
    queryFn: () => base44.entities.AgentTrainingSession.list('-created_date', 20)
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback) => {
      return await base44.entities.AgentFeedback.create({
        agent_id: selectedAgent,
        feedback_type: 'manual',
        rating,
        comments: feedbackText,
        context: { timestamp: new Date().toISOString() }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-feedback']);
      setFeedbackText("");
      setRating(0);
      toast.success('Feedback submitted successfully');
    }
  });

  // Upload training document
  const uploadDocumentMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return await base44.entities.AgentTrainingDataset.create({
        agent_id: selectedAgent,
        name: file.name,
        document_url: file_url,
        document_type: file.type,
        status: 'processing'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['training-documents']);
      toast.success('Document uploaded for training');
    }
  });

  // Create training goal
  const createGoalMutation = useMutation({
    mutationFn: async (goal) => {
      return await base44.entities.AgentTrainingSession.create({
        agent_id: selectedAgent,
        training_goal: trainingGoal,
        status: 'in_progress',
        metrics: { accuracy: 0, completion: 0 },
        started_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-training-sessions']);
      setTrainingGoal("");
      toast.success('Training goal created');
    }
  });

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => uploadDocumentMutation.mutate(file));
  };

  const agentFeedback = feedbackData.filter(f => f.agent_id === selectedAgent);
  const avgRating = agentFeedback.length > 0 
    ? agentFeedback.reduce((acc, f) => acc + (f.rating || 0), 0) / agentFeedback.length 
    : 0;

  const agentTrainingSessions = trainingSessions.filter(s => s.agent_id === selectedAgent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            Agent Training & Fine-Tuning
          </h1>
          <p className="text-slate-400 mt-1">Improve agent performance through feedback and training</p>
        </div>
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-64 bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(AGENT_ROLES).map(([id, agent]) => {
              const Icon = agent.icon;
              return (
                <SelectItem key={id} value={id}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: agent.color }} />
                    {agent.name}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Agent Overview */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Average Rating', value: avgRating.toFixed(1), icon: Star, color: 'yellow' },
          { label: 'Total Feedback', value: agentFeedback.length, icon: MessageSquare, color: 'blue' },
          { label: 'Training Sessions', value: agentTrainingSessions.length, icon: Target, color: 'green' },
          { label: 'Performance', value: '87%', icon: TrendingUp, color: 'purple' }
        ].map((stat, i) => (
          <Card key={i} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="feedback" className="data-[state=active]:bg-blue-500/20">
            <MessageSquare className="w-4 h-4 mr-2" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-green-500/20">
            <Upload className="w-4 h-4 mr-2" />
            Training Docs
          </TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-purple-500/20">
            <Target className="w-4 h-4 mr-2" />
            Training Goals
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-yellow-500/20">
            <BarChart3 className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
        </TabsList>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Submit Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Rate Performance</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Comments</label>
                  <Textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Provide detailed feedback on agent performance..."
                    className="bg-white/5 border-white/10 text-white min-h-32"
                  />
                </div>
                <Button
                  onClick={() => submitFeedbackMutation.mutate()}
                  disabled={!rating || !feedbackText.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {agentFeedback.length === 0 ? (
                    <p className="text-slate-500 text-center py-8 text-sm">No feedback yet</p>
                  ) : (
                    agentFeedback.slice(0, 10).map((feedback) => (
                      <div key={feedback.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(feedback.created_date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{feedback.comments}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Training Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-400" />
                  Training Documents
                </span>
                <Button
                  onClick={() => document.getElementById('file-upload').click()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="space-y-3">
                <p className="text-sm text-slate-400 mb-4">
                  Upload relevant documents to enrich the agent's knowledge base. Supported formats: PDF, DOC, TXT, CSV
                </p>
                {uploadedFiles.length === 0 ? (
                  <div className="border-2 border-dashed border-white/10 rounded-lg p-12 text-center">
                    <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3">
                        <FileText className="w-5 h-5 text-green-400" />
                        <div className="flex-1">
                          <p className="text-sm text-white">{file.name}</p>
                          <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400">Processing</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Goals Tab */}
        <TabsContent value="goals" className="mt-6 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Define Training Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Training Objective</label>
                <Textarea
                  value={trainingGoal}
                  onChange={(e) => setTrainingGoal(e.target.value)}
                  placeholder={`e.g., ${AGENT_ROLES[selectedAgent].defaultGoals[0]}`}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Priority</label>
                  <Select defaultValue="high">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Duration</label>
                  <Select defaultValue="1week">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1week">1 Week</SelectItem>
                      <SelectItem value="2weeks">2 Weeks</SelectItem>
                      <SelectItem value="1month">1 Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => createGoalMutation.mutate()}
                disabled={!trainingGoal.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Target className="w-4 h-4 mr-2" />
                Create Training Goal
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Suggested Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {AGENT_ROLES[selectedAgent].defaultGoals.map((goal, idx) => (
                  <div
                    key={idx}
                    onClick={() => setTrainingGoal(goal)}
                    className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 cursor-pointer transition-all"
                  >
                    <p className="text-sm text-white">{goal}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="mt-6">
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Active Training Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agentTrainingSessions.filter(s => s.status === 'in_progress').length === 0 ? (
                    <p className="text-slate-500 text-center py-8 text-sm">No active training sessions</p>
                  ) : (
                    agentTrainingSessions
                      .filter(s => s.status === 'in_progress')
                      .map((session) => (
                        <div key={session.id} className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-white">{session.training_goal}</p>
                            <Badge className="bg-yellow-500/20 text-yellow-400">In Progress</Badge>
                          </div>
                          <Progress value={session.metrics?.completion || 0} className="h-2 mb-2" />
                          <p className="text-xs text-slate-400">
                            {session.metrics?.completion || 0}% complete
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Accuracy', value: 87, color: 'green' },
                    { label: 'Response Time', value: 92, color: 'blue' },
                    { label: 'User Satisfaction', value: avgRating * 20, color: 'yellow' }
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">{metric.label}</span>
                        <span className="text-sm font-medium text-white">{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}