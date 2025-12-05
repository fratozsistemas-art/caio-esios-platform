import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3, TrendingUp, TrendingDown, Minus, AlertTriangle, Search,
  Calendar, Star, StarOff, Eye, Filter, Grid, List, Loader2, Brain,
  LineChart, PieChart
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { motion } from "framer-motion";
import AnalysisDetailModal from "@/components/analysis/AnalysisDetailModal";
import AnalysisKnowledgePanel from "@/components/analysis/AnalysisKnowledgePanel";

const typeConfig = {
  market: { icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/20" },
  competitive: { icon: BarChart3, color: "text-purple-400", bg: "bg-purple-500/20" },
  financial: { icon: LineChart, color: "text-green-400", bg: "bg-green-500/20" },
  operational: { icon: PieChart, color: "text-amber-400", bg: "bg-amber-500/20" },
  risk: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20" },
  opportunity: { icon: Star, color: "text-cyan-400", bg: "bg-cyan-500/20" }
};

const scenarioTypeConfig = {
  optimistic: { icon: TrendingUp, color: "#22c55e", label: "Otimista" },
  baseline: { icon: Minus, color: "#3b82f6", label: "Base" },
  pessimistic: { icon: TrendingDown, color: "#ef4444", label: "Pessimista" },
  disruptive: { icon: AlertTriangle, color: "#eab308", label: "Disruptivo" }
};

export default function AnalysesDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['analyses-dashboard'],
    queryFn: () => base44.entities.Analysis.list("-created_date", 50)
  });

  const filteredAnalyses = analyses.filter(a => {
    const matchesSearch = a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.results?.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Prepare scenario timeline data
  const getScenarioTimelineData = (analysis) => {
    if (!analysis?.results?.scenarios) return [];
    return analysis.results.scenarios.map(s => ({
      name: s.type,
      probability: Math.round((s.probability || 0.25) * 100),
      cagr: parseFloat(s.cagr?.replace('%', '')) || 0,
      color: scenarioTypeConfig[s.type]?.color || "#666"
    }));
  };

  // Aggregate stats
  const stats = {
    total: analyses.length,
    byType: Object.keys(typeConfig).reduce((acc, type) => {
      acc[type] = analyses.filter(a => a.type === type).length;
      return acc;
    }, {}),
    avgConfidence: analyses.length > 0 
      ? Math.round(analyses.reduce((sum, a) => sum + (a.confidence_score || 0), 0) / analyses.length)
      : 0,
    favorites: analyses.filter(a => a.is_favorite).length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410] p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-400" />
            Analyses Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Visualize e gerencie suas análises estratégicas</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Análises</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Confiança Média</p>
                <p className="text-2xl font-bold text-green-400">{stats.avgConfidence}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Market Analyses</p>
                <p className="text-2xl font-bold text-purple-400">{stats.byType.market || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Favoritos</p>
                <p className="text-2xl font-bold text-amber-400">{stats.favorites}</p>
              </div>
              <Star className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar análises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.keys(typeConfig).map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant={viewMode === "grid" ? "default" : "ghost"}
                onClick={() => setViewMode("grid")}
                className="bg-white/5 border-white/10"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setViewMode("list")}
                className="bg-white/5 border-white/10"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analyses Grid/List */}
      <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
        {filteredAnalyses.map((analysis, idx) => {
          const config = typeConfig[analysis.type] || typeConfig.market;
          const Icon = config.icon;
          const scenarioData = getScenarioTimelineData(analysis);

          return (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card 
                className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-all cursor-pointer group"
                onClick={() => setSelectedAnalysis(analysis)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium truncate">{analysis.title}</h3>
                        {analysis.is_favorite && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                      </div>
                      <p className="text-slate-500 text-xs mt-1">
                        {analysis.results?.industry || analysis.type} • {new Date(analysis.created_date).toLocaleDateString()}
                      </p>
                      
                      {/* Tags */}
                      {analysis.tags?.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {analysis.tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} className="bg-white/10 text-slate-400 text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}

                      {/* Mini Scenario Chart for Market Analyses */}
                      {analysis.type === "market" && scenarioData.length > 0 && (
                        <div className="mt-3 h-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={scenarioData}>
                              <Area 
                                type="monotone" 
                                dataKey="probability" 
                                stroke="#3b82f6" 
                                fill="#3b82f6" 
                                fillOpacity={0.2}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Confidence Score */}
                      {analysis.confidence_score && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                              style={{ width: `${analysis.confidence_score}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{analysis.confidence_score}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAnalysis(analysis);
                        setShowKnowledgePanel(true);
                      }}
                    >
                      <Brain className="w-3 h-3 mr-1" />
                      Link Knowledge
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAnalysis(analysis);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredAnalyses.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Nenhuma análise encontrada</p>
            <p className="text-slate-500 text-sm">Crie análises usando os módulos M1-M11</p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Detail Modal */}
      {selectedAnalysis && !showKnowledgePanel && (
        <AnalysisDetailModal 
          analysis={selectedAnalysis} 
          onClose={() => setSelectedAnalysis(null)} 
        />
      )}

      {/* Knowledge Integration Panel */}
      {selectedAnalysis && showKnowledgePanel && (
        <AnalysisKnowledgePanel
          analysis={selectedAnalysis}
          onClose={() => {
            setShowKnowledgePanel(false);
            setSelectedAnalysis(null);
          }}
        />
      )}
    </div>
  );
}