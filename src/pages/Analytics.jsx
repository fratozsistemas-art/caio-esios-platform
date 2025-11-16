import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, TrendingUp, Users, Brain, Network, Zap, 
  MessageSquare, Target, Award, Clock
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');

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

      return {
        totals: {
          conversations: conversations.length,
          strategies: strategies.length,
          memories: memories.length,
          kgNodes: nodes.length,
          kgRelationships: relationships.length,
          analyses: analyses.length
        },
        growthData,
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
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          Analytics & Insights
        </h1>
        <p className="text-slate-400 mt-1">Platform metrics and performance tracking</p>
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

      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Graph</TabsTrigger>
        </TabsList>

        <TabsContent value="growth">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Activity Trends (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Line type="monotone" dataKey="conversations" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
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