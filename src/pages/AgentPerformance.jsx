import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, DollarSign, TrendingUp, Zap } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AgentPerformance() {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: metrics = [] } = useQuery({
    queryKey: ['agent_performance_metrics'],
    queryFn: () => base44.entities.AgentPerformanceMetric.list('-created_date', 200)
  });

  const agentStats = metrics.reduce((acc, m) => {
    if (!acc[m.agent_name]) {
      acc[m.agent_name] = {
        name: m.agent_name,
        type: m.agent_type,
        executions: 0,
        totalTime: 0,
        totalCost: 0,
        totalTokens: 0,
        successes: 0,
        failures: 0
      };
    }
    acc[m.agent_name].executions++;
    acc[m.agent_name].totalTime += m.execution_time_ms || 0;
    acc[m.agent_name].totalCost += m.cost_usd || 0;
    acc[m.agent_name].totalTokens += m.tokens_used || 0;
    if (m.success) acc[m.agent_name].successes++;
    else acc[m.agent_name].failures++;
    return acc;
  }, {});

  const agentList = Object.values(agentStats).map(a => ({
    ...a,
    avgTime: a.totalTime / a.executions,
    successRate: (a.successes / a.executions) * 100,
    avgCost: a.totalCost / a.executions
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-400" />
          Agent Performance Analytics
        </h1>
        <p className="text-slate-400 mt-1">Performance individual de cada agente</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Total Execuções</p>
            <p className="text-2xl font-bold text-white">{metrics.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Custo Total</p>
            <p className="text-2xl font-bold text-white">
              ${metrics.reduce((sum, m) => sum + (m.cost_usd || 0), 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Tempo Médio</p>
            <p className="text-2xl font-bold text-white">
              {(metrics.reduce((sum, m) => sum + (m.execution_time_ms || 0), 0) / metrics.length / 1000).toFixed(1)}s
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Taxa de Sucesso</p>
            <p className="text-2xl font-bold text-white">
              {Math.round((metrics.filter(m => m.success).length / metrics.length) * 100)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Agentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {agentList.map(agent => (
            <div key={agent.name} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">{agent.name}</h3>
                  <Badge className="bg-blue-500/20 text-blue-400 mt-1">{agent.type}</Badge>
                </div>
                <Badge className={agent.successRate >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                  {Math.round(agent.successRate)}% success
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Execuções</p>
                  <p className="text-sm font-bold text-white">{agent.executions}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Tempo Médio</p>
                  <p className="text-sm font-bold text-white">{(agent.avgTime / 1000).toFixed(1)}s</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Custo Médio</p>
                  <p className="text-sm font-bold text-white">${agent.avgCost.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Tokens Totais</p>
                  <p className="text-sm font-bold text-white">{agent.totalTokens.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}