import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Star, StarOff, Eye, Brain, FileDown, X, Calendar, Tag, Target
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ScenarioDrillDown from "./ScenarioDrillDown";
import { toast } from "sonner";

const scenarioTypeConfig = {
  optimistic: { icon: TrendingUp, color: "#22c55e", label: "Otimista" },
  baseline: { icon: Minus, color: "#3b82f6", label: "Base" },
  pessimistic: { icon: TrendingDown, color: "#ef4444", label: "Pessimista" },
  disruptive: { icon: AlertTriangle, color: "#eab308", label: "Disruptivo" }
};

export default function AnalysisDetailModal({ analysis, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [drillDownScenario, setDrillDownScenario] = useState(null);
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => base44.entities.Analysis.update(analysis.id, {
      is_favorite: !analysis.is_favorite
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['analyses-dashboard']);
      toast.success(analysis.is_favorite ? "Removido dos favoritos" : "Adicionado aos favoritos");
    }
  });

  const chartData = analysis.results?.scenarios?.map((s, idx) => ({
    name: s.type,
    probability: Math.round((s.probability || 0.25) * 100),
    cagr: parseFloat(s.cagr?.replace('%', '')) || 0,
    tam: parseFloat(s.tam_projection?.replace(/[^0-9.]/g, '')) || 0
  })) || [];

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                {analysis.title}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleFavoriteMutation.mutate()}
                  className="text-amber-400 hover:text-amber-300"
                >
                  {analysis.is_favorite ? (
                    <Star className="w-5 h-5 fill-amber-400" />
                  ) : (
                    <StarOff className="w-5 h-5" />
                  )}
                </Button>
                <Button size="icon" variant="ghost" onClick={onClose}>
                  <X className="w-5 h-5 text-slate-400" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {/* Metadata */}
            <div className="flex items-center gap-4 mb-4">
              <Badge className="bg-blue-500/20 text-blue-400">{analysis.type}</Badge>
              <span className="text-slate-400 text-sm flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(analysis.created_date).toLocaleDateString()}
              </span>
              {analysis.confidence_score && (
                <span className="text-slate-400 text-sm">
                  Confidence: <span className="text-green-400 font-bold">{analysis.confidence_score}%</span>
                </span>
              )}
              {analysis.framework_used && (
                <Badge className="bg-purple-500/20 text-purple-400">{analysis.framework_used}</Badge>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/20">
                  <Eye className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="data-[state=active]:bg-purple-500/20">
                  <Target className="w-4 h-4 mr-2" />
                  Scenarios
                </TabsTrigger>
                <TabsTrigger value="insights" className="data-[state=active]:bg-green-500/20">
                  <Brain className="w-4 h-4 mr-2" />
                  Insights
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-4 space-y-4">
                {/* Market Overview */}
                {analysis.results?.market_overview && (
                  <Card className="bg-blue-500/10 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="text-blue-400 text-lg">Market Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Current TAM</p>
                          <p className="text-xl font-bold text-white">{analysis.results.market_overview.current_tam}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Industry</p>
                          <p className="text-xl font-bold text-white">{analysis.results.industry}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-slate-400 mb-2">Growth Drivers</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.results.market_overview.growth_drivers?.map((driver, i) => (
                            <Badge key={i} className="bg-green-500/20 text-green-400">{driver}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Scenario Distribution Chart */}
                {chartData.length > 0 && (
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Scenario Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                            <YAxis tick={{ fill: '#94a3b8' }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="probability" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Scenarios Tab */}
              <TabsContent value="scenarios" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {analysis.results?.scenarios?.map((scenario, idx) => {
                    const config = scenarioTypeConfig[scenario.type] || scenarioTypeConfig.baseline;
                    const Icon = config.icon;
                    return (
                      <Card
                        key={idx}
                        className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
                        onClick={() => setDrillDownScenario(scenario)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className="w-5 h-5" style={{ color: config.color }} />
                            <h4 className="font-semibold text-white">{scenario.name}</h4>
                            <Badge className="ml-auto bg-white/10 text-white text-xs">
                              {Math.round((scenario.probability || 0.25) * 100)}%
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">TAM:</span>
                              <span className="text-white font-medium">{scenario.tam_projection}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">CAGR:</span>
                              <span style={{ color: config.color }} className="font-medium">{scenario.cagr}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Click to drill down
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights" className="mt-4">
                <div className="space-y-4">
                  {analysis.results?.critical_uncertainties?.length > 0 && (
                    <Card className="bg-yellow-500/10 border-yellow-500/30">
                      <CardHeader>
                        <CardTitle className="text-yellow-400 text-lg">Critical Uncertainties</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analysis.results.critical_uncertainties.map((uncertainty, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-white/5 rounded">
                              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                              <p className="text-sm text-slate-300">{uncertainty}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {analysis.results?.early_warning_indicators?.length > 0 && (
                    <Card className="bg-red-500/10 border-red-500/30">
                      <CardHeader>
                        <CardTitle className="text-red-400 text-lg">Early Warning Indicators</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysis.results.early_warning_indicators.map((indicator, i) => (
                            <Badge key={i} className="bg-red-500/20 text-red-400">{indicator}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drill Down Modal */}
      {drillDownScenario && (
        <ScenarioDrillDown
          scenario={drillDownScenario}
          analysisContext={analysis}
          onClose={() => setDrillDownScenario(null)}
        />
      )}
    </>
  );
}