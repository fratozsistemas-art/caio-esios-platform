import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, Activity, GitBranch, Eye, Check, 
  ChevronRight, Sparkles, BarChart3, LineChart, 
  ScatterChart, PieChart as PieChartIcon, AreaChart as AreaChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#00D4FF', '#FFB800', '#22C55E', '#EF4444', '#A855F7', '#EC4899'];

const chartTypeIcons = {
  line: LineChart,
  bar: BarChart3,
  scatter: ScatterChart,
  area: AreaChartIcon,
  pie: PieChartIcon
};

export default function SuggestedVisualizationsPanel({ suggestions, data, onApply }) {
  const [selectedViz, setSelectedViz] = useState(null);
  const [appliedVizIds, setAppliedVizIds] = useState([]);

  const generateSampleData = (viz) => {
    // Generate sample data based on visualization type
    if (viz.type === 'line' || viz.type === 'area') {
      return Array.from({ length: 12 }, (_, i) => ({
        month: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
        value: Math.floor(Math.random() * 1000) + 500,
        trend: Math.floor(Math.random() * 800) + 300
      }));
    } else if (viz.type === 'scatter') {
      return Array.from({ length: 50 }, () => ({
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
        z: Math.floor(Math.random() * 500) + 100
      }));
    } else if (viz.type === 'bar') {
      return Array.from({ length: 6 }, (_, i) => ({
        category: `Cat ${i + 1}`,
        value: Math.floor(Math.random() * 1000) + 200
      }));
    } else if (viz.type === 'pie') {
      return [
        { name: 'Segmento A', value: 400 },
        { name: 'Segmento B', value: 300 },
        { name: 'Segmento C', value: 200 },
        { name: 'Segmento D', value: 100 }
      ];
    }
    return [];
  };

  const renderChart = (viz) => {
    const chartData = generateSampleData(viz);

    switch (viz.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151' }} />
              <Line type="monotone" dataKey="value" stroke="#00D4FF" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="trend" stroke="#FFB800" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="x" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <YAxis dataKey="y" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151' }} />
              <Scatter data={chartData} fill="#00D4FF" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151' }} />
              <Area type="monotone" dataKey="value" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="category" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151' }} />
              <Bar dataKey="value" fill="#00D4FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const handleApply = (viz) => {
    setAppliedVizIds(prev => [...prev, viz.id]);
    onApply?.(viz);
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Visualizações Sugeridas pela IA
          <Badge className="ml-2 bg-purple-500/20 text-purple-400">
            {suggestions.length} sugestões
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {suggestions.map((viz, idx) => {
              const Icon = chartTypeIcons[viz.type] || BarChart3;
              const isApplied = appliedVizIds.includes(viz.id);

              return (
                <motion.div
                  key={viz.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedViz === idx 
                      ? 'bg-white/10 border-[#00D4FF]/50' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  } ${isApplied ? 'ring-2 ring-green-500/50' : ''}`}
                  onClick={() => setSelectedViz(selectedViz === idx ? null : idx)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white">{viz.title}</h4>
                        <p className="text-xs text-slate-500 capitalize">{viz.type} chart</p>
                      </div>
                    </div>
                    {isApplied && (
                      <Badge className="bg-green-500/20 text-green-400">
                        <Check className="w-3 h-3 mr-1" />
                        Aplicado
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{viz.insight}</p>

                  {selectedViz === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-white/10"
                    >
                      <div className="mb-3">
                        {renderChart(viz)}
                      </div>
                      {!isApplied && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(viz);
                          }}
                          className="w-full bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628]"
                        >
                          <Eye className="w-3 h-3 mr-2" />
                          Aplicar Visualização
                        </Button>
                      )}
                    </motion.div>
                  )}

                  {selectedViz !== idx && (
                    <div className="flex items-center text-xs text-[#00D4FF]">
                      <span>Ver preview</span>
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}