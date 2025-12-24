import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Network,
  AlertTriangle,
  Target,
  BarChart3,
  PieChart,
  Loader2,
  Sparkles,
  ArrowRight,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['#00D4FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

export default function PortfolioIntelligenceModule() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: portfolioData, isLoading, refetch } = useQuery({
    queryKey: ['portfolio-intelligence'],
    queryFn: async () => {
      const response = await base44.functions.invoke('aggregatePortfolioKPIs', {});
      return response.data;
    },
    refetchInterval: 60000 // Refetch every minute
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </CardContent>
      </Card>
    );
  }

  if (!portfolioData?.success) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">Nenhum portfólio configurado</p>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Criar Portfólio
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overview, kpis, distribution, risk, performance, synergies, trends, ai_insights } = portfolioData;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  Inteligência de Portfólio
                  <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                    {overview.total_companies} empresas
                  </Badge>
                </CardTitle>
                <p className="text-sm text-slate-400">
                  {portfolioData.portfolio?.name || 'Portfólio Principal'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => refetch()}
              size="sm"
              variant="outline"
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              <Activity className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 text-white text-xs">
                Overview
              </TabsTrigger>
              <TabsTrigger value="synergies" className="data-[state=active]:bg-purple-600 text-white text-xs">
                Sinergias
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-green-600 text-white text-xs">
                Performance
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-orange-600 text-white text-xs">
                AI Insights
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          {kpis.diversification_score?.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        ${(kpis.total_market_cap / 1000000000).toFixed(2)}B
                      </div>
                      <div className="text-xs text-slate-400">Market Cap Total</div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                          Margem
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {(kpis.avg_profit_margin * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">Lucro Médio</div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Network className="w-5 h-5 text-purple-400" />
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          Sinergias
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {overview.active_synergies}
                      </div>
                      <div className="text-xs text-slate-400">Identificadas</div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className={`bg-white/5 border-white/10 ${
                    risk.overall_risk_level === 'high' ? 'border-red-500/30' :
                    risk.overall_risk_level === 'medium' ? 'border-yellow-500/30' :
                    'border-green-500/30'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <AlertTriangle className={`w-5 h-5 ${
                          risk.overall_risk_level === 'high' ? 'text-red-400' :
                          risk.overall_risk_level === 'medium' ? 'text-yellow-400' :
                          'text-green-400'
                        }`} />
                        <Badge className={
                          risk.overall_risk_level === 'high' ? 'bg-red-500/20 text-red-400' :
                          risk.overall_risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }>
                          {risk.overall_risk_level}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {risk.concentration_risk?.toFixed(0)}%
                      </div>
                      <div className="text-xs text-slate-400">Concentração</div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Sector Distribution */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-blue-400" />
                      Distribuição por Setor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie
                          data={Object.entries(distribution.by_sector).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.keys(distribution.by_sector).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Trends */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-400" />
                      Tendências Mensais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="month" stroke="#94A3B8" style={{ fontSize: '10px' }} />
                        <YAxis stroke="#94A3B8" style={{ fontSize: '10px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0F1419', 
                            border: '1px solid #00D4FF40',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Line type="monotone" dataKey="strategies_count" stroke="#00D4FF" name="Estratégias" />
                        <Line type="monotone" dataKey="analyses_count" stroke="#8B5CF6" name="Análises" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Synergies Tab */}
            <TabsContent value="synergies" className="space-y-3 mt-4">
              {synergies.length === 0 ? (
                <div className="text-center py-8">
                  <Network className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Nenhuma sinergia identificada ainda</p>
                </div>
              ) : (
                synergies.map((synergy, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Network className="w-5 h-5 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-white font-semibold text-sm">{synergy.source}</span>
                              <ArrowRight className="w-4 h-4 text-slate-500" />
                              <span className="text-white font-semibold text-sm">{synergy.target}</span>
                            </div>
                            <p className="text-slate-300 text-sm mb-2">{synergy.value}</p>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                                {synergy.type}
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                                {synergy.strength}% força
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4 mt-4">
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Top Performers */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {performance.ranking?.slice(0, 5).map((company, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            #{idx + 1}
                          </Badge>
                          <span className="text-white text-sm">{company.name}</span>
                        </div>
                        <span className="text-green-400 font-semibold text-sm">
                          {company.score?.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Risk Distribution */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      Análise de Risco
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Risco Geral</span>
                      <Badge className={
                        risk.overall_risk_level === 'high' ? 'bg-red-500/20 text-red-400' :
                        risk.overall_risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }>
                        {risk.overall_risk_level}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Concentração</span>
                      <span className="text-white font-semibold">{risk.concentration_risk?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Empresas Alto Risco</span>
                      <Badge className="bg-red-500/20 text-red-400">
                        {risk.high_risk_companies}
                      </Badge>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full ${
                              risk.concentration_risk > 50 ? 'bg-red-500' :
                              risk.concentration_risk > 30 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${risk.concentration_risk}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Chart */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Performance Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={performance.ranking?.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="name" stroke="#94A3B8" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#94A3B8" style={{ fontSize: '10px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F1419',
                          border: '1px solid #00D4FF40',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="score" fill="#00D4FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-4 mt-4">
              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                    <CardTitle className="text-white text-sm">AI Insights Estratégicos</CardTitle>
                    <Badge className="bg-orange-500/20 text-orange-300 text-xs">
                      {ai_insights?.health_score}% saúde
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-orange-400 mb-2">Saúde do Portfólio</h4>
                    <p className="text-white text-sm leading-relaxed">{ai_insights?.portfolio_health}</p>
                  </div>

                  {ai_insights?.key_risks?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-red-400 mb-2">Riscos Principais</h4>
                      <div className="space-y-2">
                        {ai_insights.key_risks.map((risk, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 bg-red-500/10 rounded border border-red-500/30">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-red-200 text-xs">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {ai_insights?.optimization_opportunities?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-green-400 mb-2">Oportunidades de Otimização</h4>
                      <div className="space-y-2">
                        {ai_insights.optimization_opportunities.map((opp, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 bg-green-500/10 rounded border border-green-500/30">
                            <Target className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-green-200 text-xs">{opp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {ai_insights?.strategic_recommendations?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-blue-400 mb-2">Recomendações Estratégicas</h4>
                      <div className="space-y-2">
                        {ai_insights.strategic_recommendations.map((rec, idx) => (
                          <div key={idx} className="p-3 bg-blue-500/10 rounded border border-blue-500/30">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={
                                rec.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                rec.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }>
                                {rec.priority}
                              </Badge>
                              <span className="text-xs text-slate-400">{rec.expected_impact}</span>
                            </div>
                            <p className="text-white text-sm">{rec.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}