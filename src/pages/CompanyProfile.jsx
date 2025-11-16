import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, TrendingUp, Users, BarChart3, Loader2,
  Target, Shield, AlertCircle, DollarSign, Network
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import EnrichmentPanel from "../components/company/EnrichmentPanel";

export default function CompanyProfile() {
  const [companyId, setCompanyId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    setCompanyId(id);
  }, []);

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const companies = await base44.entities.Company.filter({ id: companyId });
      return companies[0];
    },
    enabled: !!companyId
  });

  const { data: kpis = [] } = useQuery({
    queryKey: ['kpis', companyId],
    queryFn: () => base44.entities.CompanyKPI.filter({ company_id: companyId }),
    enabled: !!companyId
  });

  const { data: valuation } = useQuery({
    queryKey: ['valuation', companyId],
    queryFn: async () => {
      const valuations = await base44.entities.CompanyValuation.filter({ company_id: companyId });
      return valuations[0];
    },
    enabled: !!companyId
  });

  const analyzeCompanyMutation = useMutation({
    mutationFn: () => base44.functions.invoke('analyzeCompany', { company_id: companyId }),
    onSuccess: (response) => {
      setAnalysisResult(response.data.analysis);
      toast.success('Análise concluída!');
    },
    onError: () => toast.error('Erro ao analisar empresa')
  });

  const valuateCompanyMutation = useMutation({
    mutationFn: () => base44.functions.invoke('valuateCompany', { company_id: companyId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['valuation', companyId]);
      toast.success('Valuation concluído!');
    },
    onError: () => toast.error('Erro ao calcular valuation')
  });

  const [analysisResult, setAnalysisResult] = useState(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-400">Empresa não encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{company.legal_name}</h1>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {company.industry}
            </Badge>
            <Badge className={company.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
              {company.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => analyzeCompanyMutation.mutate()}
            disabled={analyzeCompanyMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {analyzeCompanyMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analisar
              </>
            )}
          </Button>
          <Button
            onClick={() => valuateCompanyMutation.mutate()}
            disabled={valuateCompanyMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {valuateCompanyMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Valuation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Enrichment Panel */}
      <EnrichmentPanel companyId={companyId} companyName={company.legal_name} />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Funcionários', value: company.employees_count || 'N/A', color: 'from-blue-500 to-cyan-500' },
          { icon: TrendingUp, label: 'Receita', value: company.revenue_millions ? `R$ ${company.revenue_millions}M` : 'N/A', color: 'from-green-500 to-emerald-500' },
          { icon: BarChart3, label: 'KPIs', value: kpis.length, color: 'from-purple-500 to-pink-500' },
          { icon: Target, label: 'Fundação', value: company.founded_year || 'N/A', color: 'from-orange-500 to-red-500' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-400">CNPJ:</span>
                  <p className="text-white">{company.cnpj}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-400">Nome Fantasia:</span>
                  <p className="text-white">{company.trade_name}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-400">CNAE:</span>
                  <p className="text-white">{company.cnae_code}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-400">Fontes:</span>
                  <div className="flex gap-1 mt-1">
                    {company.data_sources?.map((source, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs border-white/10 text-slate-300">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              {company.address && (
                <div>
                  <span className="text-sm text-slate-400">Endereço:</span>
                  <p className="text-white">{company.address.street}, {company.address.city} - {company.address.state}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {company.partners && company.partners.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Sócios (QSA)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {company.partners.slice(0, 5).map((partner, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{partner.name}</p>
                        <p className="text-sm text-slate-400">{partner.qualification}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="kpis" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">KPIs ({kpis.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {kpis.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kpis.map((kpi, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold">{kpi.kpi_name}</h4>
                        <Badge className="bg-blue-500/20 text-blue-400 capitalize">{kpi.category}</Badge>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-white">{kpi.value}</span>
                        <span className="text-slate-400">{kpi.unit}</span>
                      </div>
                      {kpi.target && (
                        <p className="text-sm text-slate-400 mt-1">Meta: {kpi.target}{kpi.unit}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">Nenhum KPI cadastrado</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          {analysisResult ? (
            <div className="space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">SWOT Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        {analysisResult.swot?.strengths?.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Weaknesses
                      </h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        {analysisResult.swot?.weaknesses?.map((w, i) => (
                          <li key={i}>• {w}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Opportunities
                      </h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        {analysisResult.swot?.opportunities?.map((o, i) => (
                          <li key={i}>• {o}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <h4 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Threats
                      </h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        {analysisResult.swot?.threats?.map((t, i) => (
                          <li key={i}>• {t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Recomendações Estratégicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.strategic_recommendations?.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <TrendingUp className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">Nenhuma análise disponível</p>
                <Button onClick={() => analyzeCompanyMutation.mutate()}>
                  Gerar Análise
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="valuation" className="mt-6">
          {valuation ? (
            <div className="space-y-4">
              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Valuation Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-400 mb-1">Mínimo</p>
                      <p className="text-2xl font-bold text-white">
                        R$ {valuation.valuation_range?.min}M
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-400 mb-1">Base</p>
                      <p className="text-3xl font-bold text-green-400">
                        R$ {valuation.valuation_range?.base}M
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-400 mb-1">Máximo</p>
                      <p className="text-2xl font-bold text-white">
                        R$ {valuation.valuation_range?.max}M
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-400">Método: {valuation.method}</span>
                    <Badge className="bg-green-500/20 text-green-400">
                      Confiança: {valuation.confidence_score}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Direcionadores de Valor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {valuation.value_drivers?.map((driver, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">{driver.driver}</span>
                        <Badge className={
                          driver.impact === 'positive' ? 'bg-green-500/20 text-green-400' :
                          driver.impact === 'negative' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-500/20 text-slate-400'
                        }>
                          {driver.impact}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {valuation.ai_analysis && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Análise Qualitativa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{valuation.ai_analysis}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-12 text-center">
                <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">Nenhum valuation disponível</p>
                <Button onClick={() => valuateCompanyMutation.mutate()}>
                  Calcular Valuation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}