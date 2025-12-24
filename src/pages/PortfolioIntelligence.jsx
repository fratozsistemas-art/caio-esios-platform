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
  Activity,
  Globe,
  Users,
  Layers
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import FeedbackButton from '../components/feedback/FeedbackButton';

const COLORS = ['#00D4FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

export default function PortfolioIntelligence() {
  const [activeView, setActiveView] = useState("dashboard");

  const { data: portfolioData, isLoading, refetch } = useQuery({
    queryKey: ['portfolio-intelligence-full'],
    queryFn: async () => {
      const response = await base44.functions.invoke('aggregatePortfolioKPIs', {});
      return response.data;
    },
    refetchInterval: 60000
  });

  const { data: crossInsights = [] } = useQuery({
    queryKey: ['cross-insights-portfolio'],
    queryFn: () => base44.entities.CrossInsight.list('-created_date', 50)
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!portfolioData?.success) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm max-w-md">
          <CardContent className="p-8 text-center">
            <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Nenhum Portfólio Configurado</h2>
            <p className="text-slate-400 mb-6">Configure seu portfólio empresarial para visualizar inteligência consolidada</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Criar Portfólio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { overview, kpis, distribution, risk, performance, synergies, trends, ai_insights } = portfolioData;

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Briefcase className="w-10 h-10 text-blue-400" />
            Inteligência de Portfólio
          </h1>
          <p className="text-slate-400">
            {portfolioData.portfolio?.name || 'Portfólio Principal'} • {overview.total_companies} empresas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FeedbackButton 
            type="general_feedback"
            targetComponent="Portfolio Intelligence Page"
            label="Feedback"
          />
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
          >
            <Activity className="w-4 h-4 mr-2" />
            Atualizar Dados
          </Button>
        </div>
      </motion.div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: DollarSign,
            label: "Market Cap Total",
            value: `$${(kpis.total_market_cap / 1000000000).toFixed(2)}B`,
            change: "+12.5%",
            positive: true,
            color: "green"
          },
          {
            icon: TrendingUp,
            label: "Margem Média",
            value: `${(kpis.avg_profit_margin * 100).toFixed(1)}%`,
            change: "+2.3%",
            positive: true,
            color: "blue"
          },
          {
            icon: Building2,
            label: "Empresas",
            value: overview.total_companies,
            subtitle: `${overview.total_strategies} estratégias`,
            color: "purple"
          },
          {
            icon: Network,
            label: "Sinergias",
            value: overview.active_synergies,
            subtitle: `${overview.total_cross_insights} insights`,
            color: "cyan"
          }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                  {stat.change && (
                    <Badge className={`${stat.positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-xs`}>
                      {stat.change}
                    </Badge>
                  )}
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.subtitle || stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-6">
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-white/10 mb-6">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="distribution" className="data-[state=active]:bg-purple-600 text-white">
                <PieChart className="w-4 h-4 mr-2" />
                Distribuição
              </TabsTrigger>
              <TabsTrigger value="synergies" className="data-[state=active]:bg-green-600 text-white">
                <Network className="w-4 h-4 mr-2" />
                Sinergias
              </TabsTrigger>
              <TabsTrigger value="risk" className="data-[state=active]:bg-red-600 text-white">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Risco
              </TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:bg-orange-600 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Insights
              </TabsTrigger>
            </TabsList>

            {/* Dashboard View */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Trends Chart */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Tendências do Portfólio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="month" stroke="#94A3B8" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F1419',
                            border: '1px solid #00D4FF40',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="strategies_count" stroke="#00D4FF" strokeWidth={2} name="Estratégias" />
                        <Line type="monotone" dataKey="analyses_count" stroke="#8B5CF6" strokeWidth={2} name="Análises" />
                        <Line type="monotone" dataKey="avg_confidence" stroke="#10B981" strokeWidth={2} name="Confiança %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Performance Ranking */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Top Performers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performance.ranking?.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#94A3B8" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={100} />
                        <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F1419',
                            border: '1px solid #00D4FF40',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="score" fill="#00D4FF" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Distribution View */}
            <TabsContent value="distribution" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Sector Distribution */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Distribuição por Setor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RechartsPieChart>
                        <Pie
                          data={Object.entries(distribution.by_sector).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={120}
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

                {/* Industry Distribution */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Distribuição por Indústria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(distribution.by_industry)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 8)
                        .map(([industry, count], idx) => {
                          const percentage = (count / overview.total_companies) * 100;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">{industry}</span>
                                <span className="text-white font-semibold">{count} ({percentage.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Synergies View */}
            <TabsContent value="synergies" className="space-y-4">
              <div className="grid lg:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Network className="w-8 h-8 text-purple-400" />
                      <div>
                        <div className="text-2xl font-bold text-white">{synergies.length}</div>
                        <div className="text-xs text-slate-300">Sinergias Ativas</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="w-8 h-8 text-green-400" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {synergies.filter(s => s.strength > 80).length}
                        </div>
                        <div className="text-xs text-slate-300">Alta Correlação</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-8 h-8 text-orange-400" />
                      <div>
                        <div className="text-2xl font-bold text-white">{overview.total_cross_insights}</div>
                        <div className="text-xs text-slate-300">Cross Insights</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Synergy Cards */}
              <div className="space-y-3">
                {synergies.map((synergy, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 hover:border-purple-500/40 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-purple-500/20 rounded-lg">
                            <Network className="w-6 h-6 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-white font-semibold">{synergy.source}</span>
                              <ArrowRight className="w-4 h-4 text-slate-500" />
                              <span className="text-white font-semibold">{synergy.target}</span>
                            </div>
                            <p className="text-slate-300 text-sm mb-3">{synergy.value}</p>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                                {synergy.type}
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                                {synergy.strength}% correlação
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Risk View */}
            <TabsContent value="risk" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Risk Overview */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      Análise de Risco Consolidada
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-slate-300">Risco Geral do Portfólio</span>
                      <Badge className={
                        risk.overall_risk_level === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        risk.overall_risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-green-500/20 text-green-400 border-green-500/30'
                      }>
                        {risk.overall_risk_level}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-400">Risco de Concentração</span>
                          <span className="text-white font-semibold">{risk.concentration_risk?.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
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

                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-slate-300">Empresas Alto Risco</span>
                        <Badge className="bg-red-500/20 text-red-400">{risk.high_risk_companies}</Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-slate-300">Score de Diversificação</span>
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {kpis.diversification_score?.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Radar */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Análise Multidimensional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={[
                        { metric: 'Diversificação', value: kpis.diversification_score || 50 },
                        { metric: 'Performance', value: ai_insights?.health_score || 70 },
                        { metric: 'Sinergias', value: (overview.active_synergies / overview.total_companies) * 100 },
                        { metric: 'Inovação', value: 65 },
                        { metric: 'Governança', value: 80 }
                      ]}>
                        <PolarGrid stroke="#ffffff20" />
                        <PolarAngleAxis dataKey="metric" stroke="#94A3B8" style={{ fontSize: '11px' }} />
                        <PolarRadiusAxis stroke="#94A3B8" />
                        <Radar name="Portfolio" dataKey="value" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Insights View */}
            <TabsContent value="ai" className="space-y-4">
              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-400" />
                      <CardTitle className="text-white text-sm">Insights Estratégicos com IA</CardTitle>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-300">
                      {ai_insights?.health_score}% saúde
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Portfolio Health */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-sm font-semibold text-orange-400 mb-2">Análise de Saúde</h4>
                    <p className="text-white leading-relaxed">{ai_insights?.portfolio_health}</p>
                  </div>

                  {/* Key Risks */}
                  {ai_insights?.key_risks?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-400 mb-3">Riscos Principais</h4>
                      <div className="space-y-2">
                        {ai_insights.key_risks.map((risk, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-3 bg-red-500/10 rounded border border-red-500/30">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-red-200 text-sm">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optimization Opportunities */}
                  {ai_insights?.optimization_opportunities?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 mb-3">Oportunidades de Otimização</h4>
                      <div className="space-y-2">
                        {ai_insights.optimization_opportunities.map((opp, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-3 bg-green-500/10 rounded border border-green-500/30">
                            <Target className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-green-200 text-sm">{opp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strategic Recommendations */}
                  {ai_insights?.strategic_recommendations?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-blue-400 mb-3">Recomendações Estratégicas</h4>
                      <div className="space-y-3">
                        {ai_insights.strategic_recommendations.map((rec, idx) => (
                          <div key={idx} className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                            <div className="flex items-center gap-2 mb-2">
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
                            <p className="text-white text-sm leading-relaxed">{rec.recommendation}</p>
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