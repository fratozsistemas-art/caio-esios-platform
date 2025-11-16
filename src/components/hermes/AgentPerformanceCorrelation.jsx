import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AgentPerformanceCorrelation({ analyses, performanceMetrics }) {
  const agentCorrelation = performanceMetrics.reduce((acc, metric) => {
    if (!acc[metric.agent_name]) {
      acc[metric.agent_name] = {
        name: metric.agent_name,
        executions: 0,
        successes: 0,
        avgTime: 0,
        totalTime: 0,
        integrityScores: []
      };
    }
    
    acc[metric.agent_name].executions++;
    if (metric.success) acc[metric.agent_name].successes++;
    acc[metric.agent_name].totalTime += metric.execution_time_ms || 0;
    
    const relatedAnalysis = analyses.find(a => 
      a.target_entity_type === 'workflow_execution' && 
      a.target_entity_id === metric.execution_id
    );
    
    if (relatedAnalysis) {
      acc[metric.agent_name].integrityScores.push(relatedAnalysis.integrity_score || 0);
    }
    
    return acc;
  }, {});

  const agentData = Object.values(agentCorrelation)
    .map(agent => ({
      name: agent.name,
      successRate: (agent.successes / agent.executions) * 100,
      avgIntegrity: agent.integrityScores.length > 0
        ? agent.integrityScores.reduce((s, v) => s + v, 0) / agent.integrityScores.length
        : 0,
      avgTime: agent.totalTime / agent.executions / 1000,
      executions: agent.executions,
      pattern: agent.integrityScores.length > 0 && agent.integrityScores.reduce((s, v) => s + v, 0) / agent.integrityScores.length > 80 && agent.successes / agent.executions > 0.9
        ? 'high_performer'
        : agent.integrityScores.length > 0 && agent.integrityScores.reduce((s, v) => s + v, 0) / agent.integrityScores.length < 60
        ? 'needs_attention'
        : 'normal'
    }))
    .filter(a => a.executions > 2)
    .sort((a, b) => b.avgIntegrity - a.avgIntegrity);

  const patterns = {
    high_performer: agentData.filter(a => a.pattern === 'high_performer'),
    needs_attention: agentData.filter(a => a.pattern === 'needs_attention'),
    normal: agentData.filter(a => a.pattern === 'normal')
  };

  const getBarColor = (pattern) => {
    switch (pattern) {
      case 'high_performer': return '#10b981';
      case 'needs_attention': return '#ef4444';
      default: return '#06b6d4';
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-sm">Agent Performance vs. Integrity Patterns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">High Performers</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{patterns.high_performer.length}</p>
            <p className="text-xs text-slate-500 mt-1">Integrity &gt;80% + Success &gt;90%</p>
          </div>
          
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-slate-400">Needs Attention</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{patterns.needs_attention.length}</p>
            <p className="text-xs text-slate-500 mt-1">Integrity &lt;60%</p>
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Normal Range</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{patterns.normal.length}</p>
            <p className="text-xs text-slate-500 mt-1">Standard performance</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={agentData.slice(0, 8)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#94a3b8" label={{ value: 'Avg Integrity %', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              formatter={(value) => [Math.round(value) + '%', 'Avg Integrity']}
            />
            <Bar dataKey="avgIntegrity">
              {agentData.slice(0, 8).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.pattern)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="pt-4 border-t border-white/10">
          <p className="text-xs font-medium text-slate-400 mb-3">Detected Patterns:</p>
          <div className="space-y-2">
            {patterns.high_performer.length > 0 && (
              <div className="text-xs">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-1">
                  High Performer Pattern
                </Badge>
                <p className="text-slate-300 ml-1">
                  {patterns.high_performer.map(a => a.name).join(', ')} consistently deliver high integrity outputs
                </p>
              </div>
            )}
            
            {patterns.needs_attention.length > 0 && (
              <div className="text-xs">
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mb-1">
                  Attention Required
                </Badge>
                <p className="text-slate-300 ml-1">
                  {patterns.needs_attention.map(a => a.name).join(', ')} show integrity concerns requiring review
                </p>
              </div>
            )}

            <div className="text-xs mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/30">
              <p className="text-blue-400 font-medium mb-1">Correlation Insight:</p>
              <p className="text-slate-300">
                Agents with avg integrity &gt;80% have {
                  Math.round(agentData.filter(a => a.avgIntegrity > 80).reduce((s, a) => s + a.successRate, 0) / 
                  agentData.filter(a => a.avgIntegrity > 80).length || 0)
                }% success rate vs {
                  Math.round(agentData.filter(a => a.avgIntegrity <= 80).reduce((s, a) => s + a.successRate, 0) / 
                  agentData.filter(a => a.avgIntegrity <= 80).length || 0)
                }% for lower integrity agents
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}