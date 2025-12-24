import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  Target, 
  Zap, 
  Clock,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Filter,
  Database
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

export default function StrategicPerformanceDashboard() {
  const [filters, setFilters] = useState({
    period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    analysis_type: 'all'
  });

  const { data: kpiData, isLoading, refetch } = useQuery({
    queryKey: ['strategic-kpis', filters],
    queryFn: async () => {
      const response = await base44.functions.invoke('getStrategicKPIs', filters);
      return response.data;
    },
    refetchInterval: 60000
  });

  const analysisTypes = [
    { value: 'all', label: 'Todas as Análises', icon: Database },
    { value: 'conflict_detection', label: 'Detecção de Conflitos', icon: AlertTriangle },
    { value: 'trend_prediction', label: 'Predição de Tendências', icon: TrendingUp },
    { value: 'comparative_analysis', label: 'Análise Comparativa', icon: BarChart3 },
    { value: 'narrative_validation', label: 'Validação de Narrativas', icon: CheckCircle }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <RefreshCw className="w-12 h-12 animate-spin text-cyan-400" />
          </div>
        </div>
      </div>
    );
  }

  const { kpis, trends } = kpiData || { kpis: {}, trends: [] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Performance de Análises Estratégicas</h1>
            <p className="text-slate-400">KPIs e métricas de gestão de fatos estratégicos</p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-cyan-400" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300 mb-2">Data Inicial</Label>
                <Input
                  type="date"
                  value={filters.period_start}
                  onChange={(e) => handleFilterChange('period_start', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2">Data Final</Label>
                <Input
                  type="date"
                  value={filters.period_end}
                  onChange={(e) => handleFilterChange('period_end', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2">Tipo de Análise</Label>
                <Select value={filters.analysis_type} onValueChange={(value) => handleFilterChange('analysis_type', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {analysisTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-8 h-8 text-blue-400" />
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Total</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{kpis.overall?.total_analyses || 0}</div>
                <div className="text-sm text-slate-400">Análises Realizadas</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-green-400" />
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Velocidade</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{kpis.overall?.avg_speed || 0}ms</div>
                <div className="text-sm text-slate-400">Tempo Médio</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Database className="w-8 h-8 text-purple-400" />
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Fatos</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{kpis.overall?.facts_processed || 0}</div>
                <div className="text-sm text-slate-400">Fatos Processados</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-orange-400" />
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Precisão</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {kpis.trend_prediction?.accuracy ? `${kpis.trend_prediction.accuracy}%` : 'N/A'}
                </div>
                <div className="text-sm text-slate-400">Previsões</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Trend Chart */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Tendência de Análises (Últimos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="analyses" stroke="#00D4FF" fillOpacity={1} fill="url(#colorAnalyses)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Conflict Detection */}
          <Card className="bg-white/5 border-red-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Detecção de Conflitos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Taxa de Detecção</span>
                <span className="text-2xl font-bold text-white">{kpis.conflict_detection?.detection_rate || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Confiança Média</span>
                <span className="text-2xl font-bold text-white">{kpis.conflict_detection?.avg_confidence || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Velocidade Média</span>
                <span className="text-2xl font-bold text-white">{kpis.conflict_detection?.avg_speed || 0}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total de Análises</span>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{kpis.conflict_detection?.count || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Trend Prediction */}
          <Card className="bg-white/5 border-green-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Predição de Tendências
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Precisão</span>
                <span className="text-2xl font-bold text-white">{kpis.trend_prediction?.accuracy || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Confiança Média</span>
                <span className="text-2xl font-bold text-white">{kpis.trend_prediction?.avg_confidence || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Velocidade Média</span>
                <span className="text-2xl font-bold text-white">{kpis.trend_prediction?.avg_speed || 0}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total de Análises</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{kpis.trend_prediction?.count || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Comparative Analysis */}
          <Card className="bg-white/5 border-blue-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Análise Comparativa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Taxa de Sucesso</span>
                <span className="text-2xl font-bold text-white">{kpis.comparative_analysis?.success_rate || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Velocidade Média</span>
                <span className="text-2xl font-bold text-white">{kpis.comparative_analysis?.avg_speed || 0}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total de Análises</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{kpis.comparative_analysis?.count || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Narrative Validation */}
          <Card className="bg-white/5 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400" />
                Validação de Narrativas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Taxa de Sucesso</span>
                <span className="text-2xl font-bold text-white">{kpis.narrative_validation?.success_rate || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Confiança Média</span>
                <span className="text-2xl font-bold text-white">{kpis.narrative_validation?.avg_confidence || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total de Análises</span>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">{kpis.narrative_validation?.count || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance by Type Chart */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Performance por Tipo de Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Conflitos', deteccao: kpis.conflict_detection?.detection_rate || 0, velocidade: (kpis.conflict_detection?.avg_speed || 0) / 10 },
                { name: 'Tendências', precisao: kpis.trend_prediction?.accuracy || 0, velocidade: (kpis.trend_prediction?.avg_speed || 0) / 10 },
                { name: 'Comparativa', sucesso: kpis.comparative_analysis?.success_rate || 0, velocidade: (kpis.comparative_analysis?.avg_speed || 0) / 10 },
                { name: 'Validação', sucesso: kpis.narrative_validation?.success_rate || 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="deteccao" fill="#EF4444" name="Taxa Detecção %" />
                <Bar dataKey="precisao" fill="#10B981" name="Precisão %" />
                <Bar dataKey="sucesso" fill="#3B82F6" name="Taxa Sucesso %" />
                <Bar dataKey="velocidade" fill="#F59E0B" name="Velocidade (ms/10)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}