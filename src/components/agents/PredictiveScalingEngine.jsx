import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp, Zap, RefreshCw, Server, Cpu, Activity, Clock,
  ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle, Sparkles,
  Eye, FileText, Brain, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const AGENTS = {
  market_monitor: { name: 'Market Monitor', icon: Eye, color: '#3b82f6', baseCapacity: 100 },
  strategy_doc_generator: { name: 'Strategy Doc', icon: FileText, color: '#a855f7', baseCapacity: 50 },
  knowledge_curator: { name: 'Knowledge Curator', icon: Brain, color: '#10b981', baseCapacity: 75 }
};

export default function PredictiveScalingEngine() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [scalingSettings, setScalingSettings] = useState({
    market_monitor: { minInstances: 1, maxInstances: 5, targetUtilization: 70 },
    strategy_doc_generator: { minInstances: 1, maxInstances: 3, targetUtilization: 60 },
    knowledge_curator: { minInstances: 1, maxInstances: 4, targetUtilization: 65 }
  });

  // Fetch historical data
  const { data: collaborations = [] } = useQuery({
    queryKey: ['collaborations-scaling'],
    queryFn: () => base44.entities.AgentCollaboration.list('-created_date', 200)
  });

  const { data: trainingSessions = [] } = useQuery({
    queryKey: ['training-sessions-scaling'],
    queryFn: () => base44.entities.AgentTrainingSession.list('-created_date', 50)
  });

  // Calculate current metrics
  const getAgentMetrics = (agentId) => {
    const agentCollabs = collaborations.filter(c => c.source_agent === agentId || c.target_agent === agentId);
    const last24h = agentCollabs.filter(c => new Date(c.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000));
    const last7d = agentCollabs.filter(c => new Date(c.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return {
      total: agentCollabs.length,
      last24h: last24h.length,
      last7d: last7d.length,
      avgDaily: Math.round(last7d.length / 7),
      completionRate: agentCollabs.length > 0 
        ? Math.round((agentCollabs.filter(c => c.status === 'completed').length / agentCollabs.length) * 100)
        : 0
    };
  };

  // Historical chart data
  const getHistoricalData = () => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayCollabs = collaborations.filter(c => {
        const d = new Date(c.created_date);
        return d >= dayStart && d <= dayEnd;
      });

      data.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        market_monitor: dayCollabs.filter(c => c.source_agent === 'market_monitor' || c.target_agent === 'market_monitor').length,
        strategy_doc_generator: dayCollabs.filter(c => c.source_agent === 'strategy_doc_generator' || c.target_agent === 'strategy_doc_generator').length,
        knowledge_curator: dayCollabs.filter(c => c.source_agent === 'knowledge_curator' || c.target_agent === 'knowledge_curator').length
      });
    }
    return data;
  };

  // Generate predictions
  const generatePredictions = async () => {
    setIsPredicting(true);
    try {
      const historicalData = getHistoricalData();
      const agentMetrics = {};
      Object.keys(AGENTS).forEach(id => {
        agentMetrics[id] = getAgentMetrics(id);
      });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Predictive Scaling Engine for autonomous AI agents.

Analyze this historical workload data and predict future demand:

HISTORICAL ACTIVITY (last 7 days):
${JSON.stringify(historicalData, null, 2)}

AGENT METRICS:
${JSON.stringify(agentMetrics, null, 2)}

TRAINING SESSIONS: ${trainingSessions.length} total

CURRENT SCALING SETTINGS:
${JSON.stringify(scalingSettings, null, 2)}

Predict for the next 24 hours and 7 days:
1. Expected workload per agent
2. Recommended instance count
3. Peak hours/periods
4. Potential bottlenecks
5. Cost optimization opportunities

Return JSON:
{
  "predictions": {
    "market_monitor": {
      "current_load_percent": number,
      "predicted_24h_load": number,
      "predicted_7d_avg_load": number,
      "recommended_instances": number,
      "peak_hours": [hour1, hour2],
      "scaling_action": "scale_up|scale_down|maintain",
      "confidence": number
    },
    "strategy_doc_generator": { same structure },
    "knowledge_curator": { same structure }
  },
  "overall_insights": {
    "total_predicted_tasks_24h": number,
    "peak_period": "string describing peak",
    "bottleneck_risk": "low|medium|high",
    "cost_savings_opportunity": "description",
    "recommendations": ["rec1", "rec2"]
  },
  "forecast_chart": [
    { "hour": 0, "market_monitor": 10, "strategy_doc": 5, "knowledge": 8 },
    ...for next 24 hours
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            predictions: { type: "object" },
            overall_insights: { type: "object" },
            forecast_chart: { type: "array", items: { type: "object" } }
          }
        }
      });

      setPredictions(result);
      toast.success('Predictions generated');
    } catch (error) {
      toast.error('Failed to generate predictions');
    } finally {
      setIsPredicting(false);
    }
  };

  const historicalData = getHistoricalData();

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg">Predictive Scaling Engine</span>
              <p className="text-xs text-slate-400 font-normal">
                AI-powered workload forecasting & auto-scaling
              </p>
            </div>
            <Button size="sm" onClick={generatePredictions} disabled={isPredicting} className="ml-auto bg-cyan-600 hover:bg-cyan-700">
              {isPredicting ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
              Predict
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Current Agent Status */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(AGENTS).map(([id, agent]) => {
          const metrics = getAgentMetrics(id);
          const prediction = predictions?.predictions?.[id];
          const Icon = agent.icon;
          const utilization = prediction?.current_load_percent || Math.min(100, (metrics.last24h / agent.baseCapacity) * 100);
          
          return (
            <Card key={id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${agent.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: agent.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{agent.name}</p>
                    <p className="text-xs text-slate-400">{metrics.last24h} tasks (24h)</p>
                  </div>
                  {prediction?.scaling_action && (
                    <Badge className={
                      prediction.scaling_action === 'scale_up' ? 'bg-orange-500/20 text-orange-400' :
                      prediction.scaling_action === 'scale_down' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }>
                      {prediction.scaling_action === 'scale_up' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                      {prediction.scaling_action === 'scale_down' && <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {prediction.scaling_action.replace('_', ' ')}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Utilization</span>
                    <span className={utilization > 80 ? 'text-red-400' : utilization > 60 ? 'text-yellow-400' : 'text-green-400'}>
                      {Math.round(utilization)}%
                    </span>
                  </div>
                  <Progress value={utilization} className="h-2" />

                  {prediction && (
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">24h Forecast</p>
                        <p className="text-sm font-bold text-white">{prediction.predicted_24h_load}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Instances</p>
                        <p className="text-sm font-bold text-cyan-400">{prediction.recommended_instances}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Historical Chart */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Historical Workload (7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8' }} />
                <YAxis tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend />
                <Bar dataKey="market_monitor" fill="#3b82f6" name="Market Monitor" />
                <Bar dataKey="strategy_doc_generator" fill="#a855f7" name="Strategy Doc" />
                <Bar dataKey="knowledge_curator" fill="#10b981" name="Knowledge" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Predictions */}
      {predictions && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Forecast Chart */}
          {predictions.forecast_chart?.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  24-Hour Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={predictions.forecast_chart.slice(0, 24)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="hour" tick={{ fill: '#94a3b8' }} />
                      <YAxis tick={{ fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                      <Area type="monotone" dataKey="market_monitor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="strategy_doc" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="knowledge" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-400" />
                Scaling Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <p className="text-2xl font-bold text-white">{predictions.overall_insights?.total_predicted_tasks_24h}</p>
                  <p className="text-xs text-slate-400">Tasks (Next 24h)</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <p className="text-sm font-medium text-white">{predictions.overall_insights?.peak_period}</p>
                  <p className="text-xs text-slate-400">Peak Period</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <Badge className={
                    predictions.overall_insights?.bottleneck_risk === 'high' ? 'bg-red-500/20 text-red-400' :
                    predictions.overall_insights?.bottleneck_risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }>
                    {predictions.overall_insights?.bottleneck_risk} risk
                  </Badge>
                  <p className="text-xs text-slate-400 mt-1">Bottleneck</p>
                </div>
              </div>

              {predictions.overall_insights?.recommendations?.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-white/5 rounded mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <p className="text-sm text-slate-300">{rec}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Scaling Settings */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-400" />
            Auto-Scaling Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(AGENTS).map(([id, agent]) => {
            const settings = scalingSettings[id];
            return (
              <div key={id} className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <agent.icon className="w-4 h-4" style={{ color: agent.color }} />
                  <span className="text-sm font-medium text-white">{agent.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Min Instances: {settings.minInstances}</p>
                    <Slider
                      value={[settings.minInstances]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={([val]) => setScalingSettings(s => ({ ...s, [id]: { ...s[id], minInstances: val } }))}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Max Instances: {settings.maxInstances}</p>
                    <Slider
                      value={[settings.maxInstances]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={([val]) => setScalingSettings(s => ({ ...s, [id]: { ...s[id], maxInstances: val } }))}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Target Util: {settings.targetUtilization}%</p>
                    <Slider
                      value={[settings.targetUtilization]}
                      min={30}
                      max={90}
                      step={5}
                      onValueChange={([val]) => setScalingSettings(s => ({ ...s, [id]: { ...s[id], targetUtilization: val } }))}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}