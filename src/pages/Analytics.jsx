import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, TrendingUp, Users, Brain, Network, Zap, 
  MessageSquare, Target, Award, Clock, AlertTriangle,
  Download, RefreshCw, Sparkles, Activity, CheckCircle,
  TrendingDown, Calendar
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Anomaly Detection
  const { data: anomalies, isLoading: anomaliesLoading } = useQuery({
    queryKey: ['anomalies'],
    queryFn: async () => {
      const response = await base44.functions.invoke('detectAnomalies', {});
      return response.data || [];
    }
  });

  // Predictive Analytics
  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const response = await base44.functions.invoke('generatePredictions', {});
      return response.data || {};
    }
  });

  // Strategic Alignment Score
  const { data: alignmentScore, isLoading: alignmentLoading } = useQuery({
    queryKey: ['strategic-alignment'],
    queryFn: async () => {
      const response = await base44.functions.invoke('calculateStrategicAlignment', {});
      return response.data || {};
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async (format) => {
      const response = await base44.functions.invoke('generateAnalyticsReport', {
        format,
        timeRange,
        metrics: selectedMetric
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.download_url) {
        window.open(data.download_url, '_blank');
      }
      toast.success('Report generated successfully!');
    }
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      const [
        conversations,
        strategies,
        memories,
        nodes,
        relationships,
        analyses
      ] = await Promise.all([
        base44.agents.listConversations({ agent_name: 'caio_agent' }),
        base44.entities.Strategy.list(),
        base44.entities.AgentMemory.list(),
        base44.entities.KnowledgeGraphNode.list(),
        base44.entities.KnowledgeGraphRelationship.list(),
        base44.entities.Analysis.list()
      ]);

      // Calculate growth over time
      const getDaysAgo = (date) => {
        const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
        return days;
      };

      const conversationsByDay = conversations.reduce((acc, c) => {
        const day = getDaysAgo(c.created_date);
        if (day <= 7) {
          acc[7 - day] = (acc[7 - day] || 0) + 1;
        }
        return acc;
      }, {});

      const growthData = Array.from({ length: 8 }, (_, i) => ({
        day: i === 0 ? 'Today' : `${i}d ago`,
        conversations: conversationsByDay[7 - i] || 0,
        strategies: 0,
        memories: 0
      }));

      // Framework usage
      const frameworkUsage = strategies.reduce((acc, s) => {
        const fw = s.category || 'Unknown';
        acc[fw] = (acc[fw] || 0) + 1;
        return acc;
      }, {});

      const frameworkData = Object.entries(frameworkUsage).map(([name, value]) => ({
        name,
        value
      }));

      // Agent memory types
      const memoryTypes = memories.reduce((acc, m) => {
        const type = m.memory_type || 'other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const memoryData = Object.entries(memoryTypes).map(([name, value]) => ({
        name,
        value
      }));

      // Node types in KG
      const nodeTypes = nodes.reduce((acc, n) => {
        const type = n.node_type || 'other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const nodeData = Object.entries(nodeTypes).map(([name, value]) => ({
        name,
        value
      }));

      // Calculate execution effectiveness
      const completedStrategies = strategies.filter(s => s.status === 'validated' || s.status === 'implemented');
      const executionRate = strategies.length > 0 ? (completedStrategies.length / strategies.length) * 100 : 0;

      // Calculate trend data (last 30 days)
      const trendData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dayConversations = conversations.filter(c => {
          const cDate = new Date(c.created_date);
          return cDate.toDateString() === date.toDateString();
        }).length;
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          conversations: dayConversations,
          strategies: 0,
          analyses: 0
        };
      });

      return {
        totals: {
          conversations: conversations.length,
          strategies: strategies.length,
          memories: memories.length,
          kgNodes: nodes.length,
          kgRelationships: relationships.length,
          analyses: analyses.length,
          executionRate: executionRate.toFixed(1)
        },
        growthData,
        trendData,
        frameworkData,
        memoryData,
        nodeData,
        avgMemoriesPerAgent: memories.length / (new Set(memories.map(m => m.agent_name)).size || 1),
        topAgents: Object.entries(
          memories.reduce((acc, m) => {
            acc[m.agent_name] = (acc[m.agent_name] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1]).slice(0, 5)
      };
    }
  });

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

  if (isLoading) {
    return <div className="text-white">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            Advanced Analytics Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Comprehensive KPIs, predictions, and actionable insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => generateReportMutation.mutate('pdf')}
            disabled={generateReportMutation.isPending}
            className="bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-4">
            <MessageSquare className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{analytics?.totals.conversations}</p>
            <p className="text-xs text-blue-300">Conversations</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardContent className="p-4">
            <Target className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{analytics?.totals.strategies}</p>
            <p className="text-xs text-purple-300">Strategies</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-500/30">
          <CardContent className="p-4">
            <Brain className="w-6 h-6 text-pink-400 mb-2" />
            <p className="text-2xl font-bold text-white">{analytics?.totals.memories}</p>
            <p className="text-xs text-pink-300">Agent Memories</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardContent className="p-4">
            <Network className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{analytics?.totals.kgNodes}</p>
            <p className="text-xs text-green-300">KG Nodes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
          <CardContent className="p-4">
            <Zap className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-white">{analytics?.totals.kgRelationships}</p>
            <p className="text-xs text-orange-300">Relationships</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-500/30">
          <CardContent className="p-4">
            <Award className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-2xl font-bold text-white">{analytics?.totals.analyses}</p>
            <p className="text-xs text-cyan-300">Analyses</p>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies Alert */}
      {anomalies && anomalies.length > 0 && (
        <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-white font-semibold">
                    {anomalies.length} Anomalies Detected
                  </h3>
                  <p className="text-sm text-slate-400">
                    Unusual patterns requiring attention
                  </p>
                </div>
              </div>
              <Badge className="bg-red-500/20 text-red-400">
                Action Required
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategic Alignment Score */}
      {alignmentScore && (
        <Card className="bg-gradient-to-br from-[#00D4FF]/10 to-[#FFB800]/10 border-[#00D4FF]/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-[#00D4FF]" />
              Strategic Alignment Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-4xl font-bold text-white">
                    {alignmentScore.overall_score || 0}%
                  </div>
                  <div className={`flex items-center gap-1 ${
                    (alignmentScore.trend || 0) > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(alignmentScore.trend || 0) > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {Math.abs(alignmentScore.trend || 0)}%
                    </span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  {alignmentScore.interpretation || 'Strategies aligned with execution'}
                </p>
              </div>
            </div>
            {alignmentScore.dimensions && (
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(alignmentScore.dimensions).map(([key, value]) => (
                  <div key={key} className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-slate-400 capitalize">{key}</p>
                    <p className="text-lg font-bold text-white">{value}%</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Execution Effectiveness */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00D4FF]" />
            Execution Effectiveness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Completion Rate</span>
            <span className="text-2xl font-bold text-white">
              {analytics?.totals.executionRate}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00D4FF] to-[#FFB800]"
              style={{ width: `${analytics?.totals.executionRate || 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="trends">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <Sparkles className="w-4 h-4 mr-2" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="anomalies">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Anomalies
            {anomalies && anomalies.length > 0 && (
              <Badge className="ml-2 bg-red-500/20 text-red-400">{anomalies.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Graph</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <div className="grid gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Activity Trends (Last 30 Days)</CardTitle>
                <CardDescription>Historical performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={analytics?.trendData}>
                    <defs>
                      <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Area type="monotone" dataKey="conversations" stroke="#00D4FF" fillOpacity={1} fill="url(#colorConv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Predictive Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {predictionsLoading ? (
                  <div className="text-center py-8 text-slate-400">Generating predictions...</div>
                ) : predictions?.insights ? (
                  predictions.insights.map((insight, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-white font-medium">{insight.title}</p>
                          <p className="text-sm text-slate-400 mt-1">{insight.description}</p>
                          {insight.confidence && (
                            <Badge className="mt-2 bg-purple-500/20 text-purple-400">
                              {insight.confidence}% confidence
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">No predictions available</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#00D4FF]" />
                  Project Completion Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                {predictions?.completion_forecast ? (
                  <div className="space-y-4">
                    {predictions.completion_forecast.map((project, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{project.name}</span>
                          <Badge className={
                            project.risk === 'low' ? 'bg-green-500/20 text-green-400' :
                            project.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {project.estimated_completion}
                          </Badge>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#00D4FF] to-[#FFB800]"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">No forecast data available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anomalies">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Detected Anomalies
              </CardTitle>
              <CardDescription>Unusual patterns that may require attention</CardDescription>
            </CardHeader>
            <CardContent>
              {anomaliesLoading ? (
                <div className="text-center py-8 text-slate-400">Analyzing patterns...</div>
              ) : anomalies && anomalies.length > 0 ? (
                <div className="space-y-3">
                  {anomalies.map((anomaly, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        anomaly.severity === 'high'
                          ? 'bg-red-500/10 border-red-500/30'
                          : anomaly.severity === 'medium'
                          ? 'bg-yellow-500/10 border-yellow-500/30'
                          : 'bg-blue-500/10 border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-white font-semibold">{anomaly.type}</h4>
                            <Badge className={
                              anomaly.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                              anomaly.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }>
                              {anomaly.severity}
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-sm">{anomaly.description}</p>
                          {anomaly.recommendation && (
                            <p className="text-xs text-slate-400 mt-2">
                              💡 {anomaly.recommendation}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="border-white/20 text-white">
                          Investigate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-white font-medium">All Clear!</p>
                  <p className="text-slate-400 text-sm">No anomalies detected in your data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Framework Usage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.frameworkData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics?.frameworkData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Memory Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics?.memoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Top Agents by Memory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topAgents.map(([agent, count], idx) => (
                    <div key={agent} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-400 font-bold text-sm">{idx + 1}</span>
                        </div>
                        <span className="text-white font-medium">{agent}</span>
                      </div>
                      <span className="text-slate-400">{count} memories</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Knowledge Graph Node Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.nodeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}