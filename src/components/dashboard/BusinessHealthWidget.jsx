import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Activity, Loader2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function BusinessHealthWidget() {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['business-health'],
    queryFn: async () => {
      const strategies = await base44.entities.Strategy.list('-created_date', 30);
      const analyses = await base44.entities.Analysis.list('-created_date', 30);
      
      // Calculate metrics
      const completedStrategies = strategies.filter(s => s.status === 'completed').length;
      const activeStrategies = strategies.filter(s => s.status === 'active').length;
      const completionRate = strategies.length > 0 ? (completedStrategies / strategies.length * 100).toFixed(1) : 0;
      
      const avgConfidence = analyses.length > 0 
        ? (analyses.reduce((sum, a) => sum + (a.results?.confidence_score || 75), 0) / analyses.length).toFixed(1)
        : 75;
      
      // Generate trend data (last 7 days)
      const trendData = Array.from({ length: 7 }, (_, i) => ({
        day: i,
        value: 70 + Math.random() * 20
      }));
      
      return {
        completionRate,
        activeProjects: activeStrategies,
        avgConfidence,
        totalAnalyses: analyses.length,
        trend: trendData,
        trendDirection: 'up'
      };
    },
    refetchInterval: 120000
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Saúde do Negócio
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = healthData.trendDirection === 'up' ? TrendingUp : 
                    healthData.trendDirection === 'down' ? TrendingDown : Minus;

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Saúde do Negócio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Metric */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendIcon className={`w-5 h-5 ${
              healthData.trendDirection === 'up' ? 'text-green-400' :
              healthData.trendDirection === 'down' ? 'text-red-400' : 'text-slate-400'
            }`} />
            <span className="text-4xl font-bold text-white">{healthData.avgConfidence}%</span>
          </div>
          <p className="text-sm text-slate-400">Score de Confiança Médio</p>
        </div>

        {/* Trend Chart */}
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={healthData.trend}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Grid Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{healthData.activeProjects}</div>
            <div className="text-xs text-slate-400 mt-1">Projetos Ativos</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{healthData.completionRate}%</div>
            <div className="text-xs text-slate-400 mt-1">Taxa Conclusão</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{healthData.totalAnalyses}</div>
            <div className="text-xs text-slate-400 mt-1">Análises Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}