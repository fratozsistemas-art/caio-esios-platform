import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, TrendingDown, AlertTriangle, Activity, CheckCircle, BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import IntegrityCorrelationChart from "../components/hermes/IntegrityCorrelationChart";
import CriticalIssuesTrendAnalysis from "../components/hermes/CriticalIssuesTrendAnalysis";
import AgentPerformanceCorrelation from "../components/hermes/AgentPerformanceCorrelation";

export default function HermesDashboard() {
  const [timeframe, setTimeframe] = useState('7d');
  const [viewMode, setViewMode] = useState('overview');

  const { data: analyses = [] } = useQuery({
    queryKey: ['hermes_analyses'],
    queryFn: () => base44.entities.HermesAnalysis.list('-created_date', 100)
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['cognitive_health_metrics'],
    queryFn: () => base44.entities.CognitiveHealthMetric.list('-measured_at', 30)
  });

  const { data: remediations = [] } = useQuery({
    queryKey: ['hermes_remediations'],
    queryFn: () => base44.entities.HermesRemediation.list('-action_taken_at', 50)
  });

  const { data: executions = [] } = useQuery({
    queryKey: ['workflow_executions_hermes'],
    queryFn: () => base44.entities.WorkflowExecution.list('-created_date', 100)
  });

  const { data: performanceMetrics = [] } = useQuery({
    queryKey: ['agent_performance_metrics_hermes'],
    queryFn: () => base44.entities.AgentPerformanceMetric.list('-created_date', 200)
  });

  const avgIntegrity = analyses.length > 0 
    ? analyses.reduce((sum, a) => sum + (a.integrity_score || 0), 0) / analyses.length 
    : 0;

  const criticalIssues = analyses.reduce((sum, a) => 
    sum + (a.inconsistencies_detected || []).filter(i => i.severity === 'critical').length, 0
  );

  const autoRemediations = remediations.filter(r => r.auto_applied).length;

  const healthTrend = metrics.slice(0, 7).reverse().map(m => ({
    date: new Date(m.measured_at).toLocaleDateString(),
    score: m.current_score
  }));

  const analysesByType = analyses.reduce((acc, a) => {
    acc[a.analysis_type] = (acc[a.analysis_type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(analysesByType).map(([type, count]) => ({
    name: type.replace(/_/g, ' '),
    count
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            Hermes Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Visão consolidada de integridade cognitiva</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode('overview')}
            variant={viewMode === 'overview' ? 'default' : 'outline'}
            size="sm"
            className={viewMode === 'overview' ? 'bg-cyan-600' : 'bg-white/5 border-white/10 text-white'}
          >
            Overview
          </Button>
          <Button
            onClick={() => setViewMode('analytics')}
            variant={viewMode === 'analytics' ? 'default' : 'outline'}
            size="sm"
            className={viewMode === 'analytics' ? 'bg-cyan-600' : 'bg-white/5 border-white/10 text-white'}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Integridade Média</p>
                <p className="text-2xl font-bold text-white">{Math.round(avgIntegrity)}%</p>
                <Badge className={avgIntegrity >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                  {avgIntegrity >= 80 ? 'Saudável' : 'Atenção'}
                </Badge>
              </div>
              <Shield className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Questões Críticas</p>
                <p className="text-2xl font-bold text-white">{criticalIssues}</p>
                <Badge className="bg-red-500/20 text-red-400">Requerem ação</Badge>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Análises Realizadas</p>
                <p className="text-2xl font-bold text-white">{analyses.length}</p>
                <Badge className="bg-blue-500/20 text-blue-400">Últimos 30 dias</Badge>
              </div>
              <Activity className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Auto-Remediações</p>
                <p className="text-2xl font-bold text-white">{autoRemediations}</p>
                <Badge className="bg-purple-500/20 text-purple-400">Automáticas</Badge>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'overview' ? (
        <>
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Trend de Saúde Cognitiva</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={healthTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                    <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Análises por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                    <Bar dataKey="count" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">Remediações Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {remediations.slice(0, 5).map(r => (
                <div key={r.id} className="flex items-start justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${
                        r.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        r.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {r.severity}
                      </Badge>
                      <span className="text-sm text-white">{r.issue_type}</span>
                    </div>
                    <p className="text-xs text-slate-400">{r.entity_type} • {new Date(r.action_taken_at).toLocaleString()}</p>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {r.remediation_action}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="space-y-6">
          <IntegrityCorrelationChart analyses={analyses} executions={executions} />
          
          <div className="grid grid-cols-2 gap-6">
            <CriticalIssuesTrendAnalysis analyses={analyses} />
            <AgentPerformanceCorrelation analyses={analyses} performanceMetrics={performanceMetrics} />
          </div>
        </div>
      )}
    </div>
  );
}