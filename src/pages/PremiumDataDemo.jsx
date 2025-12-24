import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Sparkles, 
  Database, 
  Brain, 
  Zap, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

export default function PremiumDataDemo() {
  const [symbol, setSymbol] = useState("AAPL");
  const [loading, setLoading] = useState(false);
  const [publicInsight, setPublicInsight] = useState(null);
  const [enhancedInsight, setEnhancedInsight] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const generateInsights = async (withPremium = false) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateEnhancedInsight', {
        symbol: symbol.toUpperCase(),
        includeFinancialData: withPremium
      });

      const result = response.data;
      setPublicInsight(result.public_insight);
      if (withPremium) {
        setEnhancedInsight(result.enhanced_insight);
      }
      setComparison(result.comparison);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncToGraph = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      // First fetch the data
      const fetchResponse = await base44.functions.invoke('fetchPremiumFinancialData', {
        symbol: symbol.toUpperCase(),
        dataType: 'overview'
      });

      if (fetchResponse.data?.success) {
        // Get the most recent source
        const sources = await base44.entities.ExternalDataSource.list('-created_date', 1);
        const latestSource = sources[0];

        // Sync to graph
        const syncResponse = await base44.functions.invoke('syncExternalDataToGraph', {
          sourceId: latestSource.id
        });

        setSyncResult(syncResponse.data);
      }
    } catch (error) {
      setSyncResult({ error: error.message });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">
              Premium Data Integration Demo
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            Compare análises com dados públicos vs. análises enriquecidas com dados financeiros premium da Alpha Vantage
          </p>
        </motion.div>

        {/* Input */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input
                placeholder="Digite o ticker (ex: AAPL, MSFT, GOOGL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="bg-white/5 border-white/20 text-white placeholder:text-slate-500"
              />
              <Button
                onClick={() => generateInsights(false)}
                disabled={loading || !symbol}
                className="bg-slate-700 hover:bg-slate-600 text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
                Análise Pública
              </Button>
              <Button
                onClick={() => generateInsights(true)}
                disabled={loading || !symbol}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Análise Premium
              </Button>
              <Button
                onClick={syncToGraph}
                disabled={syncing || !symbol}
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Sync to Graph
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sync Result */}
        {syncResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`${syncResult.error ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} backdrop-blur-sm`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {syncResult.error ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  )}
                  <div>
                    <p className="text-white font-semibold">
                      {syncResult.error ? 'Erro ao sincronizar' : syncResult.message}
                    </p>
                    {!syncResult.error && (
                      <p className="text-sm text-slate-400">
                        {syncResult.nodes_created} nodes criados, {syncResult.relationships_created} relacionamentos criados
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Comparison */}
        {comparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  Comparação: Dados Públicos vs Premium
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Public Data */}
                  <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-slate-400" />
                      <h3 className="text-lg font-semibold text-white">Dados Públicos</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Profundidade:</span>
                        <Badge className="bg-slate-600 text-slate-200">{comparison.public_data_only.depth}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Confiança:</span>
                        <span className="text-white font-semibold">{comparison.public_data_only.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fontes:</span>
                        <span className="text-slate-300 text-sm">{comparison.public_data_only.sources}</span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Data */}
                  {comparison.with_premium_data ? (
                    <div className="p-6 bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-500/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Dados Premium</h3>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">+{comparison.with_premium_data.confidence - comparison.public_data_only.confidence}%</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-300">Profundidade:</span>
                          <Badge className="bg-blue-600 text-white">{comparison.with_premium_data.depth}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Confiança:</span>
                          <span className="text-white font-semibold">{comparison.with_premium_data.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Fontes:</span>
                          <span className="text-blue-200 text-sm">{comparison.with_premium_data.sources}</span>
                        </div>
                        <div className="pt-3 border-t border-white/10">
                          <p className="text-xs text-slate-400 mb-2">Features Premium:</p>
                          <div className="flex flex-wrap gap-1">
                            {comparison.with_premium_data.premium_features.map((feature, idx) => (
                              <Badge key={idx} className="bg-blue-500/20 text-blue-300 text-[10px] border-blue-500/30">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-800/30 rounded-lg border border-dashed border-slate-600 flex items-center justify-center">
                      <p className="text-slate-500 text-center">
                        Execute a análise premium para ver a comparação
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results */}
        {(publicInsight || enhancedInsight) && (
          <Tabs defaultValue="public" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
              <TabsTrigger value="public" className="data-[state=active]:bg-slate-700 text-white">
                Análise Pública
              </TabsTrigger>
              <TabsTrigger 
                value="premium" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 text-white"
                disabled={!enhancedInsight}
              >
                Análise Premium
                {enhancedInsight && <Sparkles className="w-4 h-4 ml-2" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="public">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-6 h-6 text-slate-400" />
                      Insight com Dados Públicos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">Posicionamento de Mercado</h4>
                      <p className="text-white">{publicInsight?.market_position}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">Produtos Principais</h4>
                      <div className="flex flex-wrap gap-2">
                        {publicInsight?.key_products?.map((product, idx) => (
                          <Badge key={idx} className="bg-slate-700 text-slate-200">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">Tendências da Indústria</h4>
                      <ul className="space-y-1">
                        {publicInsight?.industry_trends?.map((trend, idx) => (
                          <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 mt-0.5 text-slate-500" />
                            {trend}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">Riscos Visíveis</h4>
                      <div className="space-y-2">
                        {publicInsight?.visible_risks?.map((risk, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span className="text-yellow-200 text-sm">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Confiança:</span>
                        <Badge className="bg-slate-600 text-white">
                          {publicInsight?.confidence_score || 60}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="premium">
              {enhancedInsight && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-blue-400" />
                        Insight Premium com Dados Financeiros
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-blue-300 mb-2">Análise de Valuação</h4>
                        <p className="text-white leading-relaxed">{enhancedInsight.valuation_analysis}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-300 mb-2">Saúde Financeira</h4>
                        <p className="text-white leading-relaxed">{enhancedInsight.financial_health}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-300 mb-2">Benchmarks da Indústria</h4>
                        <p className="text-white leading-relaxed">{enhancedInsight.industry_benchmarks}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-300 mb-2">Riscos Financeiros Identificados</h4>
                        <div className="space-y-2">
                          {enhancedInsight.financial_risks?.map((risk, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-red-500/10 rounded border border-red-500/30">
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <span className="text-red-200 text-sm">{risk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-300 mb-2">Oportunidades de Investimento</h4>
                        <div className="space-y-2">
                          {enhancedInsight.investment_opportunities?.map((opp, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-green-500/10 rounded border border-green-500/30">
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-green-200 text-sm">{opp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <div className="flex items-start gap-3">
                          <DollarSign className="w-6 h-6 text-blue-400 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-semibold text-blue-300 mb-2">Recomendação Estratégica</h4>
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className="bg-blue-600 text-white text-base px-4 py-1">
                                {enhancedInsight.strategic_recommendation?.action}
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-300">
                                {enhancedInsight.strategic_recommendation?.confidence}% confiança
                              </Badge>
                            </div>
                            <p className="text-white text-sm leading-relaxed">
                              {enhancedInsight.strategic_recommendation?.rationale}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-blue-300">Insights Premium Utilizados:</span>
                          <Badge className="bg-blue-500/20 text-blue-300">
                            {enhancedInsight.premium_insights_used?.length || 0} fontes
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {enhancedInsight.premium_insights_used?.map((insight, idx) => (
                            <Badge key={idx} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                              {insight}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-blue-300">Confiança:</span>
                          <Badge className="bg-blue-600 text-white">
                            {enhancedInsight.confidence_score || 90}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Provider</p>
                  <p className="text-white font-semibold">Alpha Vantage</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-xs text-slate-400">Data Quality</p>
                  <p className="text-white font-semibold">Institutional Grade</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-xs text-slate-400">Integration</p>
                  <p className="text-white font-semibold">Real-time API</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}