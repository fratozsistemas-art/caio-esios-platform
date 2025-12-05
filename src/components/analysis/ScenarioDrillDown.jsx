import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Target,
  ArrowRight, Lightbulb, Shield, Clock, X
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const scenarioConfig = {
  optimistic: { icon: TrendingUp, color: "#22c55e", label: "Otimista", bgClass: "bg-green-500/20 border-green-500/30" },
  baseline: { icon: Minus, color: "#3b82f6", label: "Base", bgClass: "bg-blue-500/20 border-blue-500/30" },
  pessimistic: { icon: TrendingDown, color: "#ef4444", label: "Pessimista", bgClass: "bg-red-500/20 border-red-500/30" },
  disruptive: { icon: AlertTriangle, color: "#eab308", label: "Disruptivo", bgClass: "bg-yellow-500/20 border-yellow-500/30" }
};

export default function ScenarioDrillDown({ scenario, analysisContext, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const config = scenarioConfig[scenario.type] || scenarioConfig.baseline;
  const Icon = config.icon;

  // Prepare radar chart data for assumptions analysis
  const radarData = scenario.key_assumptions?.map((assumption, idx) => ({
    subject: `A${idx + 1}`,
    fullText: assumption,
    confidence: 60 + Math.random() * 30,
    impact: 50 + Math.random() * 40
  })) || [];

  // Prepare bar chart for implications
  const implicationsData = scenario.strategic_implications?.map((impl, idx) => ({
    name: `I${idx + 1}`,
    fullText: impl,
    urgency: Math.floor(50 + Math.random() * 50),
    effort: Math.floor(30 + Math.random() * 60)
  })) || [];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgClass}`}>
              <Icon className="w-5 h-5" style={{ color: config.color }} />
            </div>
            <div>
              <span className="text-lg">{scenario.name}</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={config.bgClass} style={{ color: config.color }}>
                  {config.label}
                </Badge>
                <Badge className="bg-white/10 text-white">
                  Probabilidade: {Math.round((scenario.probability || 0.25) * 100)}%
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="assumptions" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              Premissas
            </TabsTrigger>
            <TabsTrigger value="implications" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              Implicações
            </TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              Ações
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            {/* Overview */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-400 mb-1">TAM Projetado</p>
                    <p className="text-2xl font-bold text-white">{scenario.tam_projection}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-400 mb-1">CAGR Esperado</p>
                    <p className="text-2xl font-bold" style={{ color: config.color }}>{scenario.cagr}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Triggers */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Gatilhos para este Cenário
                  </h4>
                  <div className="space-y-2">
                    {scenario.triggers?.map((trigger, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                        <ArrowRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-300 text-sm">{trigger}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assumptions Drill-Down */}
            <TabsContent value="assumptions" className="space-y-4">
              {radarData.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <h4 className="text-white font-semibold mb-3">Análise de Premissas</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                          <Radar name="Confiança" dataKey="confidence" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                          <Radar name="Impacto" dataKey="impact" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <h4 className="text-white font-semibold">Detalhamento das Premissas</h4>
                {scenario.key_assumptions?.map((assumption, idx) => (
                  <Card key={idx} className="bg-purple-500/10 border-purple-500/30">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-purple-500/20 text-purple-400">A{idx + 1}</Badge>
                        <div className="flex-1">
                          <p className="text-white text-sm">{assumption}</p>
                          <div className="flex gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full" 
                                  style={{ width: `${radarData[idx]?.confidence || 70}%` }} 
                                />
                              </div>
                              <span className="text-xs text-slate-400">Conf.</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500 rounded-full" 
                                  style={{ width: `${radarData[idx]?.impact || 60}%` }} 
                                />
                              </div>
                              <span className="text-xs text-slate-400">Impacto</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Implications */}
            <TabsContent value="implications" className="space-y-4">
              {implicationsData.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <h4 className="text-white font-semibold mb-3">Matriz Urgência vs Esforço</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={implicationsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                          <YAxis tick={{ fill: '#94a3b8' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Bar dataKey="urgency" name="Urgência" fill="#ef4444" />
                          <Bar dataKey="effort" name="Esforço" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <h4 className="text-white font-semibold">Implicações Estratégicas Detalhadas</h4>
                {scenario.strategic_implications?.map((impl, idx) => (
                  <Card key={idx} className="bg-green-500/10 border-green-500/30">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-green-500/20 text-green-400">I{idx + 1}</Badge>
                        <div className="flex-1">
                          <p className="text-white text-sm">{impl}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge className={implicationsData[idx]?.urgency > 70 ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}>
                              Urgência: {implicationsData[idx]?.urgency || 50}%
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-400">
                              Esforço: {implicationsData[idx]?.effort || 40}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Actions */}
            <TabsContent value="actions" className="space-y-4">
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-4">
                  <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Ações Recomendadas
                  </h4>
                  <div className="space-y-3">
                    {scenario.recommended_actions?.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white">{action}</p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" className="border-white/10 text-slate-300 h-7 text-xs">
                              <Clock className="w-3 h-3 mr-1" /> Agendar
                            </Button>
                            <Button size="sm" variant="outline" className="border-white/10 text-slate-300 h-7 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" /> Criar Task
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/10">
          <Button variant="outline" onClick={onClose} className="border-white/10 text-white">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}