import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Target, Loader2, CheckCircle, Clock, AlertTriangle, Brain, FileText, Plus, AlertCircle, Trash2, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import AnalysisReportModal from "@/components/siu/AnalysisReportModal";

export default function StrategicIntelligence() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [error, setError] = useState(null);

  const [newAnalysis, setNewAnalysis] = useState({
    target: {
      company_name: "",
      primary_url: "",
      industry: "",
      geography: "",
      additional_urls: []
    },
    mission: {
      type: "investment_evaluation",
      primary_objective: ""
    },
    constraints: {
      time_available: "standard_3-5d",
      data_access: "public_only"
    },
    preferences: {
      output_format: "executive_brief",
      depth_level: "strategic_tactical"
    }
  });

  // ✅ FIX: Query com retry logic robusto e timeout handling
  const { data: analyses = [], isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['siu_analyses'],
    queryFn: async () => {
      try {
        console.log('📊 Fetching SIU analyses...');
        
        // ✅ Add timeout to query
        const fetchPromise = base44.entities.SIUAnalysis.list('-created_date');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout after 15s')), 15000)
        );
        
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        
        console.log('✅ Analyses loaded:', result);
        return result;
      } catch (error) {
        console.error("❌ Error loading SIU analyses:", error);
        
        // ✅ For network errors, return empty array instead of throwing
        if (error.message?.includes('Network') || error.message?.includes('timeout')) {
          console.warn('⚠️ Network error detected, returning empty array');
          return [];
        }
        
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const createAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.SIUAnalysis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siu_analyses'] });
    },
    onError: (error) => {
      console.error("Error creating analysis:", error);
      setError(`Error creating analysis: ${error.message}`);
    }
  });

  const startAnalysisMutation = useMutation({
    mutationFn: async (analysisId) => {
      console.log('🚀 Starting SIU v6.0 SIMPLIFIED for:', analysisId);
      
      const response = await base44.functions.invoke('orchestrateSIU', {
        analysis_id: analysisId
      });
      
      return response;
    },
    onSuccess: (data) => {
      console.log('✅ SIU completed:', data);
      queryClient.invalidateQueries({ queryKey: ['siu_analyses'] });
    },
    onError: (error) => {
      console.error("❌ SIU error:", error);
      setError(`Analysis failed: ${error.message}. Please try again.`);
    }
  });

  const deleteAnalysisMutation = useMutation({
    mutationFn: (analysisId) => base44.entities.SIUAnalysis.delete(analysisId),
    onSuccess: (_, deletedAnalysisId) => {
      queryClient.invalidateQueries({ queryKey: ['siu_analyses'] });
      if (selectedAnalysis?.id === deletedAnalysisId) {
        setSelectedAnalysis(null);
        setShowReportModal(false);
      }
    },
  });

  const handleDeleteAnalysis = async (analysisId, companyName) => {
    if (!confirm(`❌ Tem certeza que deseja excluir a análise SIU de "${companyName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      await deleteAnalysisMutation.mutateAsync(analysisId);
      alert('✅ Análise SIU excluída com sucesso!');
    } catch (error) {
      alert(`❌ Erro ao excluir análise: ${error.message}`);
    }
  };

  const handleViewReport = (analysis) => {
    console.log('Opening report for:', analysis);
    setSelectedAnalysis(analysis);
    setShowReportModal(true);
  };

  const resetForm = () => {
    setNewAnalysis({
      target: {
        company_name: "",
        primary_url: "",
        industry: "",
        geography: "",
        additional_urls: []
      },
      mission: {
        type: "investment_evaluation",
        primary_objective: ""
      },
      constraints: {
        time_available: "standard_3-5d",
        data_access: "public_only"
      },
      preferences: {
        output_format: "executive_brief",
        depth_level: "strategic_tactical"
      }
    });
  };

  const handleCreateAnalysis = async () => {
    try {
      setError(null);

      if (!newAnalysis.target.company_name || !newAnalysis.target.primary_url || !newAnalysis.mission.primary_objective) {
        setError('Por favor, preencha os campos obrigatórios: Nome da Empresa, Website e Objetivo');
        return;
      }

      const newAnalysisData = {
        ...newAnalysis,
        status: "configuring"
      };

      console.log('Creating analysis:', newAnalysisData);
      const createdAnalysis = await createAnalysisMutation.mutateAsync(newAnalysisData);

      if (createdAnalysis?.id) {
        console.log('Analysis created, starting orchestration:', createdAnalysis.id);
        
        startAnalysisMutation.mutate(createdAnalysis.id);
        
        setError(null);
        setDialogOpen(false);
        resetForm();
      } else {
        console.error('Analysis created but no ID returned:', createdAnalysis);
        setError('Análise criada mas sem ID retornado');
      }
    } catch (error) {
      console.error("Failed to create analysis:", error);
      setError(`Erro ao criar análise: ${error.message}`);
    }
  };

  const missionTypes = [
    { value: "investment_evaluation", label: "Investment Evaluation" },
    { value: "partnership_assessment", label: "Partnership Assessment" },
    { value: "market_entry_strategy", label: "Market Entry Strategy" },
    { value: "competitive_intelligence", label: "Competitive Intelligence" },
    { value: "ma_due_diligence", label: "M&A Due Diligence" },
    { value: "digital_transformation", label: "Digital Transformation" },
    { value: "innovation_scouting", label: "Innovation Scouting" },
    { value: "crisis_assessment", label: "Crisis Assessment" },
    { value: "strategic_repositioning", label: "Strategic Repositioning" },
    { value: "portfolio_optimization", label: "Portfolio Optimization" }
  ];

  const statusConfig = {
    configuring: { icon: Clock, color: "text-slate-400", bg: "bg-slate-500/20", text: "Configurando" },
    queued: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/20", text: "Na Fila" },
    analyzing: { icon: Loader2, color: "text-purple-400", bg: "bg-purple-500/20", text: "Analisando", spin: true },
    completed: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20", text: "Concluído" },
    failed: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20", text: "Falhou" }
  };

  const isFormSubmitting = createAnalysisMutation.isPending || startAnalysisMutation.isPending;

  // ✅ FIX: Loading state melhorado
  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Strategic Intelligence Unit...</p>
          <p className="text-slate-500 text-sm mt-2">This may take a few seconds...</p>
        </div>
      </div>
    );
  }

  // ✅ FIX: Error state melhorado com retry button
  if (queryError && analyses.length === 0) {
    return (
      <div className="p-6 md:p-8">
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  Problema ao Carregar Análises SIU
                </h3>
                <p className="text-slate-300 mb-4">
                  {queryError.message?.includes('Network') || queryError.message?.includes('timeout')
                    ? 'Erro de conexão. Verifique sua internet e tente novamente.'
                    : queryError.message}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                  <Button
                    onClick={() => setDialogOpen(true)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Nova Análise
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Target className="w-10 h-10 text-purple-400" />
            Strategic Intelligence Unit
          </h1>
          <p className="text-slate-400">
            SIU v6.0 - Versão Simplificada (Sem Agent Orchestration)
          </p>
        </div>

        <div className="flex gap-3">
          {/* ✅ ADD: Manual refresh button */}
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/5"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Plus className="w-4 h-4 mr-2" />
                Nova Análise SIU
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-white/10 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white text-2xl">Configurar Análise SIU v6.0</DialogTitle>
              </DialogHeader>

              {error && (
                <Card className="bg-red-500/10 border-red-500/30 mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-6 py-4">
                {/* Target Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-400">🎯 Target</h3>

                  <div>
                    <Label htmlFor="company_name" className="text-slate-300">Nome da Empresa *</Label>
                    <Input
                      id="company_name"
                      value={newAnalysis.target.company_name}
                      onChange={(e) => setNewAnalysis(prev => ({
                        ...prev,
                        target: { ...prev.target, company_name: e.target.value }
                      }))}
                      placeholder="Ex: Nubank, Stripe, OpenAI"
                      className="bg-white/5 border-white/10 text-white mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="primary_url" className="text-slate-300">Website Principal *</Label>
                    <Input
                      id="primary_url"
                      value={newAnalysis.target.primary_url}
                      onChange={(e) => setNewAnalysis(prev => ({
                        ...prev,
                        target: { ...prev.target, primary_url: e.target.value }
                      }))}
                      placeholder="https://www.empresa.com"
                      className="bg-white/5 border-white/10 text-white mt-2"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry" className="text-slate-300">Indústria</Label>
                      <Input
                        id="industry"
                        value={newAnalysis.target.industry}
                        onChange={(e) => setNewAnalysis(prev => ({
                          ...prev,
                          target: { ...prev.target, industry: e.target.value }
                        }))}
                        placeholder="Ex: FinTech, SaaS, E-commerce"
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="geography" className="text-slate-300">Geografia</Label>
                      <Input
                        id="geography"
                        value={newAnalysis.target.geography}
                        onChange={(e) => setNewAnalysis(prev => ({
                          ...prev,
                          target: { ...prev.target, geography: e.target.value }
                        }))}
                        placeholder="Ex: Brasil, LATAM, Global"
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Mission Section */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-purple-400">🎯 Mission</h3>

                  <div>
                    <Label htmlFor="mission_type" className="text-slate-300">Tipo de Análise *</Label>
                    <Select
                      value={newAnalysis.mission.type}
                      onValueChange={(value) => setNewAnalysis(prev => ({
                        ...prev,
                        mission: { ...prev.mission, type: value }
                      }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {missionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="primary_objective" className="text-slate-300">Objetivo Principal *</Label>
                    <Textarea
                      id="primary_objective"
                      value={newAnalysis.mission.primary_objective}
                      onChange={(e) => setNewAnalysis(prev => ({
                        ...prev,
                        mission: { ...prev.mission, primary_objective: e.target.value }
                      }))}
                      placeholder="Descreva a decisão específica ou pergunta estratégica..."
                      className="bg-white/5 border-white/10 text-white mt-2 h-24"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreateAnalysis}
                  disabled={isFormSubmitting || !newAnalysis.target.company_name || !newAnalysis.target.primary_url || !newAnalysis.mission.primary_objective}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isFormSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Iniciando Análise...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Iniciar Análise SIU
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">O que é o SIU v6.0 Simplificado?</h3>
              <p className="text-slate-200 text-sm mb-3">
                O Strategic Intelligence Unit v6.0 agora utiliza uma versão simplificada do fluxo de orquestração de agentes.
                Essa versão visa agilizar o processo inicial de coleta e análise de informações, focando na entrega rápida de insights estratégicos.
              </p>
              <ul className="space-y-2 text-sm text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0 mt-0.5" />
                  <span><strong>Análise Otimizada:</strong> Foco em resultados mais rápidos para avaliação de cenários.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0 mt-0.5" />
                  <span><strong>Prioridade na Eficiência:</strong> Menos etapas complexas, mais velocidade.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0 mt-0.5" />
                  <span><strong>Insights Acionáveis:</strong> Relatórios concisos e focados em decisões.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0 mt-0.5" />
                  <span><strong>Flexibilidade:</strong> Adapta-se a diferentes tipos de análises estratégicas.</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analyses List */}
      {analyses.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhuma análise SIU ainda
            </h3>
            <p className="text-slate-400 mb-6">
              Configure sua primeira análise estratégica profunda
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              Iniciar Primeira Análise
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence>
            {analyses.map((analysis, index) => {
              const missionType = analysis?.mission?.type || 'unknown';
              const companyName = analysis?.target?.company_name || 'Unknown Company';
              const primaryObjective = analysis?.mission?.primary_objective || 'No objective specified';
              const industry = analysis?.target?.industry;
              const timeAvailable = analysis?.constraints?.time_available || 'Not specified';
              const confidenceScore = analysis?.confidence_score;
              const status = analysis?.status || 'configuring';

              const config = statusConfig[status] || statusConfig.configuring;
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 h-full flex flex-col relative group">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAnalysis(analysis.id, companyName);
                      }}
                      disabled={deleteAnalysisMutation.isPending}
                      className="absolute top-4 right-4 z-10 h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <CardHeader className="border-b border-white/10">
                      <div className="flex justify-between items-start mb-2 pr-10">
                        <CardTitle className="text-white text-lg">
                          {companyName}
                        </CardTitle>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.color} flex items-center gap-1`}>
                          <StatusIcon className={`w-3 h-3 ${config.spin ? 'animate-spin' : ''}`} />
                          {config.text}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{primaryObjective}</p>
                    </CardHeader>

                    <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Tipo:</span>
                          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">
                            {missionType.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {industry && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Indústria:</span>
                            <span className="text-white font-medium">{industry}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Tempo:</span>
                          <span className="text-white font-medium">
                            {timeAvailable.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {confidenceScore && (
                          <div className="pt-2 border-t border-white/10">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-400">Confidence Score</span>
                              <span className="text-green-400 font-semibold">{confidenceScore}%</span>
                            </div>
                            <Progress value={confidenceScore} className="h-2" />
                          </div>
                        )}
                      </div>

                      {status === 'completed' && (
                        <div className="mt-auto pt-4">
                          <Button
                            onClick={() => handleViewReport(analysis)}
                            variant="outline"
                            className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Relatório Completo
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnalysisReportModal
        analysis={selectedAnalysis}
        open={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedAnalysis(null);
        }}
      />
    </div>
  );
}