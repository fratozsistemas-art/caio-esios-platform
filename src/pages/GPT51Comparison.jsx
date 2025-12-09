import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Shield, CheckCircle, X, AlertCircle, TrendingUp,
  Layers, Target, Network, FileText, Download, ExternalLink,
  Sparkles, Zap, Users, Eye, ArrowRight, ChevronDown, ChevronRight, Info
} from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function GPT51Comparison() {
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const tierBadge = (tier) => {
    const config = {
      1: { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "VALIDADO" },
      2: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "PARCIALMENTE VALIDADO" },
      3: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", label: "NÃO CONFIRMADO" }
    };
    return <Badge className={config[tier].color}>{config[tier].label}</Badge>;
  };

  const handleExportReport = async () => {
    try {
      const reportContent = `# ANÁLISE COMPARATIVA: GPT-5.1 vs CAIO/TSI v10.x
Data: ${new Date().toLocaleDateString('pt-BR')}
Metodologia: CAIO v12.2 - Unwavering Peer

## VALIDAÇÃO DE FONTES (Confidence Tiers)

🟢 TIER 1 - VALIDADO:
- GPT-5.1 lançado em 09/12/2025 (OpenAI oficial)
- Adaptive reasoning em Instant mode
- Customização de tom (8 estilos)
- Thinking time adaptável

🟡 TIER 2 - PARCIALMENTE VALIDADO:
- System Card Addendum mencionado
- Benchmarks específicos não quantificados

🟠 TIER 3 - INFERÊNCIAS:
- Integração GPT-5.1 + CAIO (proposta conceitual)

## ARQUITETURA COGNITIVA

### GPT-5.1 (OpenAI):
- Sistema monolítico com raciocínio escalável
- Roteador inteligente (Auto mode)
- Multimodal nativo

### CAIO/TSI v10.x:
- Arquitetura tricamadas (R-LAYER, C-LAYER, A-LAYER)
- PHI Mode único (reconciliação dialética)
- Governança institucional nativa

## ANÁLISE DE GAPS

GPT-5.1 NÃO oferece:
❌ CRV Scoring (Confidence/Risk/Value)
❌ IP Protection com classificação
❌ Audit Trails para compliance
❌ Detecção de assimetria informacional

## RECOMENDAÇÃO FINAL

Arquitetura Híbrida:
- GPT-5.1 como motor de raciocínio (R-LAYER substrate)
- CAIO/TSI para governança (C-LAYER + A-LAYER)
- Combinação obrigatória para enterprise crítico

Assinatura Metodológica CAIO v12.2`;

      const blob = new Blob([reportContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GPT-5.1-vs-CAIO-TSI-Comparison-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Relatório exportado com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#FFB800] flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white">
                GPT-5.1 vs CAIO/TSI v10.x
              </h1>
              <p className="text-xl text-[#00D4FF]">Análise Comparativa Técnica</p>
            </div>
          </div>
          <p className="text-slate-400 max-w-3xl mx-auto mb-4">
            Metodologia CAIO v12.2 - Unwavering Peer | Conselho dos Mestres Aplicado
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Data: 09/12/2025
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              Fonte: OpenAI Oficial
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Confidence Tiers Aplicados
            </Badge>
          </div>
          <div className="mt-6">
            <Button
              onClick={handleExportReport}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório Completo
            </Button>
          </div>
        </motion.div>

        {/* Confidence Tiers */}
        <Card className="bg-gradient-to-r from-green-500/10 to-orange-500/10 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-400" />
              Sistema de Confidence Tiers para Informações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  tier: 1,
                  label: "TIER 1 - VALIDADO",
                  icon: CheckCircle,
                  color: "green",
                  items: [
                    "GPT-5.1 lançado em 09/12/2025",
                    "Adaptive reasoning em Instant mode",
                    "8 estilos de customização de tom",
                    "Thinking time adaptável",
                    "Rollout gradual confirmado"
                  ]
                },
                {
                  tier: 2,
                  label: "TIER 2 - PARCIALMENTE VALIDADO",
                  icon: AlertCircle,
                  color: "yellow",
                  items: [
                    "System Card Addendum mencionado",
                    "Benchmarks 'significant' (não quantificados)",
                    "Melhorias específicas a detalhar"
                  ]
                },
                {
                  tier: 3,
                  label: "TIER 3 - INFERÊNCIAS",
                  icon: Info,
                  color: "orange",
                  items: [
                    "Integração GPT-5.1 + CAIO (proposta conceitual)",
                    "Performance em produção (a validar)",
                    "ROI híbrido (a medir)"
                  ]
                }
              ].map((tier, idx) => {
                const Icon = tier.icon;
                return (
                  <Card key={idx} className={`bg-${tier.color}-500/5 border-${tier.color}-500/30`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={`w-5 h-5 text-${tier.color}-400`} />
                        <span className={`text-${tier.color}-400 font-semibold text-sm`}>{tier.label}</span>
                      </div>
                      <ul className="space-y-2">
                        {tier.items.map((item, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className={`text-${tier.color}-400 mt-0.5`}>✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 grid grid-cols-5 w-full">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-600">Visão Geral</TabsTrigger>
            <TabsTrigger value="architecture" className="data-[state=active]:bg-purple-600">Arquitetura</TabsTrigger>
            <TabsTrigger value="governance" className="data-[state=active]:bg-amber-600">Governança</TabsTrigger>
            <TabsTrigger value="integration" className="data-[state=active]:bg-emerald-600">Integração Híbrida</TabsTrigger>
            <TabsTrigger value="decision" className="data-[state=active]:bg-blue-600">Matriz de Decisão</TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* GPT-5.1 Overview */}
            <Card className="bg-white/5 border-[#00D4FF]/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-6 h-6 text-[#00D4FF]" />
                  GPT-5.1: Características Oficiais
                  {tierBadge(1)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* GPT-5.1 Instant */}
                  <div className="border border-cyan-500/30 rounded-lg p-4 bg-cyan-500/5">
                    <h4 className="text-cyan-400 font-semibold mb-3">GPT-5.1 Instant</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Mais conversacional e caloroso por default</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300"><strong>Adaptive reasoning</strong>: decide quando "pensar" antes de responder</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Melhoria significativa em AIME 2025 e Codeforces</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Melhor instruction following</span>
                      </li>
                    </ul>
                  </div>

                  {/* GPT-5.1 Thinking */}
                  <div className="border border-purple-500/30 rounded-lg p-4 bg-purple-500/5">
                    <h4 className="text-purple-400 font-semibold mb-3">GPT-5.1 Thinking</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300"><strong>Thinking time adaptável</strong>: mais tempo em problemas complexos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Respostas mais claras, menos jargão</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Tom mais empático e caloroso</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Customização de Tom */}
                <div className="border border-amber-500/30 rounded-lg p-4 bg-amber-500/5">
                  <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Novidade Crítica: Customização de Tom
                  </h4>
                  <p className="text-slate-300 text-sm mb-4">
                    OpenAI reconhece: "Great AI should not only be smart, but also <strong className="text-amber-400">enjoyable to talk to</strong>"
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      "Default", "Professional", "Friendly", "Candid",
                      "Quirky", "Efficient", "Nerdy", "Cynical"
                    ].map((style, idx) => (
                      <Badge key={idx} className="bg-white/10 text-white text-xs justify-center">
                        {style}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-slate-400">
                      <strong className="text-amber-400">Controles Experimentais:</strong> Conciseness, Warmth, Scannability, Emoji frequency
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mudança de Paradigma */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  Mudança de Paradigma: Inteligência + Personalidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                  <h4 className="text-purple-400 font-semibold mb-2">🧠 Pensamento Lateral - Implicação Estratégica:</h4>
                  <p className="text-slate-300 text-sm">
                    OpenAI está respondendo a feedback: usuários queriam IA "menos robótica"<br />
                    → Foco em <strong className="text-cyan-400">EXPERIÊNCIA</strong>, não apenas performance técnica<br />
                    → Alinha com tese do CAIO: comunicação C-Suite requer tom adequado (<strong className="text-amber-400">BVI Engine</strong>)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Architecture */}
          <TabsContent value="architecture" className="space-y-6 mt-6">
            {/* GPT-5.1 Architecture */}
            <Card className="bg-white/5 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Layers className="w-6 h-6 text-cyan-400" />
                  Arquitetura GPT-5.1 (OpenAI)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900/50 rounded-lg p-6 font-mono text-sm">
                  <pre className="text-cyan-400">
{`[Input]
    ↓
[GPT-5.1 Auto Roteador]
    ↓
┌───────────┴────────────┐
↓                        ↓
GPT-5.1 INSTANT    GPT-5.1 THINKING
(adaptive          (thinking time
reasoning)         adaptável)
↓                        ↓
[Resposta com tom personalizável]`}
                  </pre>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-cyan-500/10 rounded-lg">
                    <p className="text-cyan-400 font-semibold text-sm mb-2">Pontos Fortes:</p>
                    <ul className="space-y-1 text-xs text-slate-300">
                      <li>• Sistema monolítico simplificado</li>
                      <li>• Roteamento inteligente automático</li>
                      <li>• Multimodal nativo</li>
                      <li>• 8 estilos de customização</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <p className="text-red-400 font-semibold text-sm mb-2">Limitações:</p>
                    <ul className="space-y-1 text-xs text-slate-300">
                      <li>• Sem memória institucional</li>
                      <li>• Ausência de scoring de confiança</li>
                      <li>• Não distingue contexto corporativo</li>
                      <li>• Sem governança nativa</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CAIO/TSI Architecture */}
            <Card className="bg-white/5 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Network className="w-6 h-6 text-purple-400" />
                  Arquitetura CAIO/TSI v10.x (Tricamadas)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900/50 rounded-lg p-6 font-mono text-sm">
                  <pre className="text-purple-400">
{`[Input Estratégico]
    ↓
R-LAYER (Raciocínio Institucional)
├─ FLOW Mode ≈ GPT-5.1 Instant
├─ CYCLE Mode ≈ GPT-5.1 Thinking
└─ PHI Mode: ÚNICO (reconciliação dialética)
    ↓
C-LAYER (Comunicação Executiva)
├─ BVI Engine (brand voice + contexto)
├─ Neural Map (visualização estratégica)
└─ Hermes (mediação de confiança)
    ↓
A-LAYER (Audit & Governança)
├─ CRV Scoring (Confidence/Risk/Value)
├─ IP Protection (Tiers 1-4)
└─ Audit Trails (compliance)`}
                  </pre>
                </div>
                <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-400 font-semibold text-sm mb-2">🎯 VANTAGEM CAIO:</p>
                  <p className="text-slate-300 text-sm">
                    Enquanto GPT-5.1 é um <strong className="text-cyan-400">MOTOR cognitivo</strong> poderoso,
                    CAIO é um <strong className="text-amber-400">SISTEMA OPERACIONAL INSTITUCIONAL</strong> que pode:
                  </p>
                  <ol className="mt-3 space-y-1 text-xs text-slate-300 ml-4 list-decimal">
                    <li>INTEGRAR GPT-5.1 como substrate de raciocínio</li>
                    <li>ADICIONAR camadas de governança ausentes em LLMs standalone</li>
                    <li>TRADUZIR outputs técnicos para decisões C-Suite</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Alinhamento de Componentes */}
            <Card className="bg-white/5 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ArrowRight className="w-6 h-6 text-emerald-400" />
                  Alinhamento de Componentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      caio: "CAIO FLOW Mode", 
                      gpt: "GPT-5.1 Instant (adaptive reasoning)",
                      alignment: "ALTO",
                      note: "Análise contínua, rápida iteração"
                    },
                    {
                      caio: "CAIO CYCLE Mode",
                      gpt: "GPT-5.1 Thinking (adaptive time)",
                      alignment: "ALTO",
                      note: "Raciocínio profundo com feedback"
                    },
                    {
                      caio: "CAIO PHI Mode",
                      gpt: "Não equivalente",
                      alignment: "ÚNICO",
                      note: "Reconciliação dialética - necessário para contradições estratégicas"
                    },
                    {
                      caio: "BVI Engine (C-LAYER)",
                      gpt: "Professional/Candid styles",
                      alignment: "PARCIAL",
                      note: "GPT tem tom genérico, BVI adiciona brand voice"
                    },
                    {
                      caio: "A-LAYER (CRV + Audit)",
                      gpt: "Não equivalente",
                      alignment: "ÚNICO",
                      note: "Governança institucional ausente no GPT-5.1"
                    }
                  ].map((row, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg border-l-4 border-emerald-500">
                      <div className="grid md:grid-cols-4 gap-3 items-center">
                        <div>
                          <Badge className="bg-purple-500/20 text-purple-400">CAIO</Badge>
                          <p className="text-white text-sm mt-1">{row.caio}</p>
                        </div>
                        <div className="flex justify-center">
                          <ArrowRight className={`w-5 h-5 ${
                            row.alignment === 'ALTO' ? 'text-green-400' :
                            row.alignment === 'PARCIAL' ? 'text-yellow-400' :
                            'text-orange-400'
                          }`} />
                        </div>
                        <div>
                          <Badge className="bg-cyan-500/20 text-cyan-400">GPT-5.1</Badge>
                          <p className="text-white text-sm mt-1">{row.gpt}</p>
                        </div>
                        <div>
                          <Badge className={
                            row.alignment === 'ALTO' ? 'bg-green-500/20 text-green-400' :
                            row.alignment === 'PARCIAL' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-orange-500/20 text-orange-400'
                          }>
                            {row.alignment}
                          </Badge>
                          <p className="text-xs text-slate-400 mt-1">{row.note}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Governance */}
          <TabsContent value="governance" className="space-y-6 mt-6">
            {/* Gaps de Governança */}
            <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  GPT-5.1: Gaps Críticos de Governança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      gap: "CRV Scoring (Confidence/Risk/Value por decisão)",
                      impact: "Crítico para enterprise",
                      caio: "A-LAYER nativo"
                    },
                    {
                      gap: "IP Protection com classificação de sensibilidade",
                      impact: "Crítico para regulados",
                      caio: "Tiers 1-4 implementados"
                    },
                    {
                      gap: "Audit Trails para compliance (SOX, GDPR, LGPD)",
                      impact: "Obrigatório para finance/healthcare",
                      caio: "Rastreabilidade completa"
                    },
                    {
                      gap: "Detecção de assimetria informacional (Hermes)",
                      impact: "Crítico para Board-Management dynamics",
                      caio: "Mediação de confiança nativa"
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-lg border border-red-500/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <X className="w-4 h-4 text-red-400" />
                            <p className="text-white font-semibold text-sm">{item.gap}</p>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">Impacto: {item.impact}</p>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <p className="text-xs text-green-400">CAIO: {item.caio}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h4 className="text-red-400 font-semibold mb-3">Caso de Uso - Empresa Regulada:</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white font-medium mb-2">❌ GPT-5.1 Standalone:</p>
                      <ul className="space-y-1 text-slate-300 text-xs">
                        <li>✓ Analisa contratos com alta precisão</li>
                        <li>✓ Usa "Professional" style</li>
                        <li>✗ Não registra acessos</li>
                        <li>✗ Não classifica sensibilidade</li>
                        <li>✗ Sem scoring de risco</li>
                        <li>✗ Auditoria impossível</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-2">✅ CAIO/TSI + GPT-5.1:</p>
                      <ul className="space-y-1 text-slate-300 text-xs">
                        <li>✓ GPT-5.1 Thinking analisa (engine)</li>
                        <li>✓ BVI formata para Board vs Legal</li>
                        <li>✓ A-Layer classifica Tier 3</li>
                        <li>✓ CRV flagged: Risco Médio</li>
                        <li>✓ Audit Trail completo</li>
                        <li>✓ Exportável para SOX 404</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customização de Tom - Análise Crítica */}
            <Card className="bg-white/5 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-amber-400" />
                  Customização de Tom: GPT-5.1 vs BVI Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left p-3 text-slate-400">Critério Institucional</th>
                        <th className="text-center p-3 text-slate-400">GPT-5.1</th>
                        <th className="text-center p-3 text-slate-400">CAIO BVI Engine</th>
                        <th className="text-left p-3 text-slate-400">Gap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { 
                          criteria: "Tom profissional genérico",
                          gpt: true,
                          caio: true,
                          gap: "Nenhum"
                        },
                        {
                          criteria: "Voz de marca específica",
                          gpt: false,
                          caio: true,
                          gap: "CRÍTICO"
                        },
                        {
                          criteria: "Contexto corporativo",
                          gpt: "partial",
                          caio: true,
                          gap: "Moderado"
                        },
                        {
                          criteria: "Adaptação a audiência (Board vs Management)",
                          gpt: "partial",
                          caio: true,
                          gap: "CRÍTICO"
                        },
                        {
                          criteria: "Auditabilidade de tom",
                          gpt: false,
                          caio: true,
                          gap: "Compliance"
                        }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                          <td className="p-3 text-white">{row.criteria}</td>
                          <td className="p-3 text-center">
                            {row.gpt === true && <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />}
                            {row.gpt === false && <X className="w-5 h-5 text-red-400 mx-auto" />}
                            {row.gpt === "partial" && <AlertCircle className="w-5 h-5 text-yellow-400 mx-auto" />}
                          </td>
                          <td className="p-3 text-center">
                            {row.caio && <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />}
                          </td>
                          <td className="p-3">
                            <Badge className={
                              row.gap === "Nenhum" ? "bg-green-500/20 text-green-400" :
                              row.gap === "Moderado" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-red-500/20 text-red-400"
                            }>
                              {row.gap}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <p className="text-cyan-400 font-semibold mb-2">GPT-5.1 (Professional):</p>
                    <div className="bg-slate-900/50 rounded p-3 text-xs text-slate-300">
                      "Dear Board Members,<br />
                      I am writing to inform you of a significant operational incident..."
                      <p className="mt-2 text-yellow-400">→ Tom profissional, mas GENÉRICO</p>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-purple-400 font-semibold mb-2">CAIO BVI + GPT-5.1:</p>
                    <div className="bg-slate-900/50 rounded p-3 text-xs text-slate-300">
                      "Conselho,<br />
                      Ativamos protocolo de crise Nível 3 conforme nossa Política..."
                      <p className="mt-2 text-green-400">→ Tom alinhado a CULTURA + processos internos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Integration */}
          <TabsContent value="integration" className="space-y-6 mt-6">
            <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Network className="w-6 h-6 text-purple-400" />
                  Arquitetura de Integração Híbrida Recomendada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900/50 rounded-lg p-6 font-mono text-xs">
                  <pre className="text-emerald-400">
{`┌─────────────────────────────────────────────────────────┐
│           CAIO/TSI v10.x (Orquestrador)                 │
├─────────────────────────────────────────────────────────┤
│  R-LAYER (Raciocínio Institucional)                     │
│  ├─ FLOW Mode                                           │
│  │   └─ Engine: GPT-5.1 Instant (adaptive reasoning)    │
│  ├─ CYCLE Mode                                          │
│  │   └─ Engine: GPT-5.1 Thinking (adaptive time)        │
│  └─ PHI Mode (Reconciliação Dialética)                  │
│      └─ Engine: CAIO nativo                             │
├─────────────────────────────────────────────────────────┤
│  C-LAYER (Comunicação Executiva)                        │
│  ├─ BVI Engine                                          │
│  │   ├─ Draft: GPT-5.1 (Professional/Candid)            │
│  │   └─ Refinamento: CAIO (brand voice)                 │
│  ├─ Neural Map → CAIO nativo                            │
│  └─ Hermes → CAIO nativo                                │
├─────────────────────────────────────────────────────────┤
│  A-LAYER (Audit & Governança)                           │
│  ├─ CRV Scoring → CAIO nativo                           │
│  ├─ IP Protection → CAIO nativo                         │
│  └─ Audit Trails → CAIO nativo                          │
├─────────────────────────────────────────────────────────┤
│  CSS (Contextual Sensing)                               │
│  └─ Adapta uso de GPT-5.1 à maturidade organizacional   │
└─────────────────────────────────────────────────────────┘`}
                  </pre>
                </div>

                {/* Integration Benefits */}
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Performance Técnica",
                      icon: Zap,
                      color: "cyan",
                      items: [
                        "GPT-5.1 adaptive reasoning",
                        "Thinking time otimizado",
                        "Multimodal nativo"
                      ]
                    },
                    {
                      title: "Governança Institucional",
                      icon: Shield,
                      color: "purple",
                      items: [
                        "CRV scoring automático",
                        "Audit trails completos",
                        "IP protection Tier 1-4"
                      ]
                    },
                    {
                      title: "Comunicação C-Suite",
                      icon: Users,
                      color: "amber",
                      items: [
                        "BVI Engine + brand voice",
                        "Neural Map visualização",
                        "Hermes mediação"
                      ]
                    }
                  ].map((benefit, idx) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={idx} className={`p-4 bg-${benefit.color}-500/10 border border-${benefit.color}-500/30 rounded-lg`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`w-5 h-5 text-${benefit.color}-400`} />
                          <h4 className={`text-${benefit.color}-400 font-semibold`}>{benefit.title}</h4>
                        </div>
                        <ul className="space-y-1">
                          {benefit.items.map((item, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Workflow Example */}
            <Card className="bg-white/5 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-emerald-400" />
                  Exemplo de Workflow: Due Diligence M&A
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      phase: "FASE 1: Análise inicial de 200 documentos",
                      engine: "GPT-5.1 Instant (adaptive reasoning)",
                      output: "Processa rapidamente, identifica 15 áreas de atenção",
                      color: "cyan"
                    },
                    {
                      phase: "FASE 2: Análise profunda das 15 áreas",
                      engine: "GPT-5.1 Thinking (thinking time estendido)",
                      output: "Detalha riscos, valida com cross-referencing",
                      color: "blue"
                    },
                    {
                      phase: "FASE 3: Contradição detectada",
                      engine: "CAIO PHI Mode (GPT-5.1 NÃO resolve)",
                      output: "Reconciliação dialética: qual premissa está errada?",
                      color: "purple"
                    },
                    {
                      phase: "FASE 4: Comunicação ao Board",
                      engine: "BVI Engine + GPT-5.1 Professional",
                      output: "Adiciona voz de marca, Neural Map, CRV scoring",
                      color: "amber"
                    },
                    {
                      phase: "FASE 5: Audit Trail",
                      engine: "A-LAYER (CAIO nativo)",
                      output: "Registra quem viu o quê, quando decidiu",
                      color: "green"
                    }
                  ].map((step, idx) => (
                    <div key={idx} className={`p-3 bg-${step.color}-500/10 border border-${step.color}-500/30 rounded-lg`}>
                      <div className="flex items-start gap-3">
                        <Badge className={`bg-${step.color}-500/20 text-${step.color}-400 flex-shrink-0`}>
                          {idx + 1}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm mb-1">{step.phase}</p>
                          <p className="text-xs text-slate-400 mb-1">Engine: {step.engine}</p>
                          <p className="text-xs text-slate-300">{step.output}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Decision Matrix */}
          <TabsContent value="decision" className="space-y-6 mt-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-6 h-6 text-cyan-400" />
                  Matriz de Decisão Atualizada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left p-3 text-slate-400 font-semibold">Caso de Uso</th>
                        <th className="text-center p-3 text-slate-400 font-semibold w-32">GPT-5.1 Standalone</th>
                        <th className="text-center p-3 text-slate-400 font-semibold w-32">CAIO/TSI Standalone</th>
                        <th className="text-center p-3 text-slate-400 font-semibold w-32">GPT-5.1 + CAIO/TSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { 
                          useCase: "Codificação diária",
                          gpt: "⭐ Excelente",
                          caio: "⚠️ Não é foco",
                          hybrid: "✅ GPT-5.1 suficiente",
                          color: "cyan"
                        },
                        {
                          useCase: "Escrita criativa",
                          gpt: "⭐ Excelente",
                          caio: "⚠️ Limitado",
                          hybrid: "✅ GPT + BVI",
                          color: "blue"
                        },
                        {
                          useCase: "Análise financeira",
                          gpt: "✅ Bom",
                          caio: "⭐ Excelente",
                          hybrid: "⭐⭐ Sinergia ideal",
                          color: "green"
                        },
                        {
                          useCase: "Due diligence M&A",
                          gpt: "⚠️ Sem governança",
                          caio: "⭐ CRV/Hermes",
                          hybrid: "⭐⭐⭐ Obrigatório",
                          color: "purple"
                        },
                        {
                          useCase: "Comunicação Board",
                          gpt: "⚠️ Tom genérico",
                          caio: "⭐ BVI Engine",
                          hybrid: "⭐⭐ GPT + BVI",
                          color: "amber"
                        },
                        {
                          useCase: "Gestão de crises",
                          gpt: "❌ Sem antifragilidade",
                          caio: "⭐ CSI + NEC",
                          hybrid: "⭐⭐⭐ CAIO orquestra",
                          color: "red"
                        },
                        {
                          useCase: "Compliance/Audit",
                          gpt: "❌ Sem trails",
                          caio: "⭐ A-Layer",
                          hybrid: "⭐⭐⭐ CAIO obrigatório",
                          color: "orange"
                        }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                          <td className="p-3 text-white font-medium">{row.useCase}</td>
                          <td className="p-3 text-center text-xs text-slate-300">{row.gpt}</td>
                          <td className="p-3 text-center text-xs text-slate-300">{row.caio}</td>
                          <td className="p-3 text-center">
                            <Badge className={`bg-${row.color}-500/20 text-${row.color}-400 text-xs`}>
                              {row.hybrid}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-emerald-400 font-semibold mb-2">Legenda:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400">⭐</span>
                      <span className="text-slate-300">Recomendado</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400">⭐⭐</span>
                      <span className="text-slate-300">Altamente recomendado</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400">⭐⭐⭐</span>
                      <span className="text-slate-300">Obrigatório</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-400">✅</span>
                      <span className="text-slate-300">Adequado</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Perguntas de Governança para Boards */}
            <Card className="bg-white/5 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 text-amber-400" />
                  Perguntas de Governança para Boards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      question: "GPT-5.1 registra POR QUÊ tomou decisão X?",
                      gpt: { answer: "NÃO", reason: "sem CRV scoring" },
                      caio: { answer: "SIM", reason: "A-Layer nativo" }
                    },
                    {
                      question: "Posso auditar quem acessou insights sensíveis?",
                      gpt: { answer: "NÃO", reason: "sem IP protection" },
                      caio: { answer: "SIM", reason: "Tier 1-4 + trails" }
                    },
                    {
                      question: "Como sei se Management omitiu informações?",
                      gpt: { answer: "NÃO detecta", reason: "sem Hermes" },
                      caio: { answer: "SIM", reason: "mediação de confiança" }
                    },
                    {
                      question: "Customização de tom = voz de marca?",
                      gpt: { answer: "NÃO", reason: "'Professional' é genérico" },
                      caio: { answer: "SIM", reason: "BVI aprende brand voice" }
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-lg border border-amber-500/30">
                      <p className="text-white font-semibold mb-3">{item.question}</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-3 bg-red-500/10 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <X className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 font-semibold text-sm">GPT-5.1: {item.gpt.answer}</span>
                          </div>
                          <p className="text-xs text-slate-400">{item.gpt.reason}</p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-semibold text-sm">CAIO/TSI: {item.caio.answer}</span>
                          </div>
                          <p className="text-xs text-slate-400">{item.caio.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <h4 className="text-amber-400 font-semibold mb-2">Decisão:</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span><strong className="text-white">GPT-5.1 =</strong> Ferramenta poderosa, mas CEGA institucionalmente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span><strong className="text-white">CAIO/TSI =</strong> Sistema operacional de governança</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span><strong className="text-white">Combinação =</strong> Capacidade técnica + compliance</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Conselho dos Mestres */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-amber-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              Insights Estratégicos - Conselho dos Mestres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  mestre: "🏛️ Toron (Parcimônia)",
                  insight: "GPT-5.1 é mais conversacional, mas isso importa para um CFO? O que importa: FATOS bem expostos, não emojis. CAIO adiciona o que falta: governança e audit.",
                  color: "purple"
                },
                {
                  mestre: "⚖️ Aury (Forma = Garantia)",
                  insight: "Customização de tom do GPT-5.1 é forma SEM garantia institucional. 'Professional style' não substitui auditabilidade de decisões. A-Layer do CAIO é garantia: toda decisão é rastreável.",
                  color: "blue"
                },
                {
                  mestre: "🎤 Técio (Advocacia da Liberdade)",
                  insight: "OpenAI está humanizando IA com 'Quirky' e 'Friendly'. Mas organizações precisam de CONFIANÇA, não carisma. Hermes do CAIO detecta manipulações - isso é advocacia institucional.",
                  color: "cyan"
                },
                {
                  mestre: "📚 Lenio (Hermenêutica)",
                  insight: "GPT-5.1 melhora 'instruction following', mas sem fundamentação auditável. CAIO/CRV scoring é hermenêutica aplicada: por QUÊ esta decisão?",
                  color: "amber"
                }
              ].map((mestre, idx) => (
                <div key={idx} className={`p-4 bg-${mestre.color}-500/5 border border-${mestre.color}-500/30 rounded-lg`}>
                  <p className={`text-${mestre.color}-400 font-semibold mb-2 text-sm`}>{mestre.mestre}</p>
                  <p className="text-slate-300 text-xs italic leading-relaxed">"{mestre.insight}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recomendações Finais */}
        <Card className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-400" />
              Recomendações Finais (Baseadas em Dados Oficiais)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Para CTOs/CIOs */}
            <div>
              <h4 className="text-cyan-400 font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Para CTOs/CIOs:
              </h4>
              <div className="space-y-3">
                {[
                  {
                    scenario: "Cenário 1 - Tarefas Individuais",
                    recommendation: "✅ GPT-5.1 Instant suficiente",
                    details: ["Coding: melhoria Codeforces", "Math: AIME 2025 scores", "Escrita: customização de tom"],
                    color: "cyan"
                  },
                  {
                    scenario: "Cenário 2 - Decisões C-Suite",
                    recommendation: "⭐⭐⭐ CAIO/TSI + GPT-5.1 obrigatório",
                    details: ["GPT-5.1: Engine de raciocínio", "CAIO BVI: Tradução executiva", "CAIO Hermes: Detecção assimetrias", "CAIO A-Layer: Audit trails"],
                    color: "purple"
                  },
                  {
                    scenario: "Cenário 3 - Indústrias Reguladas",
                    recommendation: "⭐⭐⭐ CAIO/TSI obrigatório",
                    details: ["CRV Scoring: Risco regulatório", "IP Protection: Tiers 1-4", "Audit Trails: SOX, GDPR, LGPD", "GPT-5.1: Opcional como substrate"],
                    color: "amber"
                  }
                ].map((scenario, idx) => (
                  <div key={idx} className={`p-4 bg-${scenario.color}-500/10 border border-${scenario.color}-500/30 rounded-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-semibold">{scenario.scenario}</h5>
                      <Badge className={`bg-${scenario.color}-500/20 text-${scenario.color}-400`}>
                        {scenario.recommendation}
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {scenario.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`text-${scenario.color}-400`}>├─</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximos Passos */}
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Próximos Passos:
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    title: "1. Validação Técnica (Esta Semana)",
                    items: [
                      "Testar adaptive reasoning em casos reais",
                      "Validar thinking time adaptável",
                      "Avaliar customização de tom",
                      "Aguardar release API"
                    ]
                  },
                  {
                    title: "2. POC de Integração (30 Dias)",
                    items: [
                      "R-Layer com GPT-5.1 substrate",
                      "Comparar PHI vs Thinking",
                      "Testar BVI + Professional style",
                      "Medir CRV scoring"
                    ]
                  },
                  {
                    title: "3. Business Case (60 Dias)",
                    items: [
                      "ROI: standalone vs híbrido",
                      "TCO: API + licenciamento",
                      "Compliance: gap analysis",
                      "Change management"
                    ]
                  }
                ].map((step, idx) => (
                  <div key={idx} className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <h5 className="text-emerald-400 font-semibold mb-3 text-sm">{step.title}</h5>
                    <ul className="space-y-1">
                      {step.items.map((item, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-1">
                          <span className="text-emerald-400">□</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              Disclaimers CAIO v12.2 - Unwavering Peer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <p className="text-green-400 font-semibold mb-1">🔍 VALIDAÇÃO DE FONTES:</p>
                <ul className="space-y-1 text-xs text-slate-300">
                  <li>• Informações GPT-5.1: Tier 1 (fonte primária OpenAI)</li>
                  <li>• Aguardando System Card completo para validação adicional</li>
                  <li>• Benchmarks podem variar em implementação real</li>
                </ul>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <p className="text-blue-400 font-semibold mb-1">📊 ANÁLISE COMPARATIVA:</p>
                <ul className="space-y-1 text-xs text-slate-300">
                  <li>• Baseada em conhecimento público até 09/12/2025</li>
                  <li>• Arquitetura CAIO/TSI conforme whitepapers consolidados</li>
                  <li>• Integração GPT-5.1 + CAIO é proposta conceitual (a validar)</li>
                </ul>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <p className="text-purple-400 font-semibold mb-1">🏛️ APLICAÇÃO DO CONSELHO DOS MESTRES:</p>
                <ul className="space-y-1 text-xs text-slate-300">
                  <li>• Metodologia Toron aplicada: Parcimônia em claims</li>
                  <li>• Aury: Cada afirmação técnica verificável</li>
                  <li>• Lenio: Interpretação crítica marketing vs realidade</li>
                </ul>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <p className="text-amber-400 font-semibold mb-1">🎯 RESPONSABILIDADE:</p>
                <ul className="space-y-1 text-xs text-slate-300">
                  <li>• Análise é orientação estratégica, não definitiva</li>
                  <li>• Organizações devem realizar POCs antes de adoção</li>
                  <li>• Métricas de ROI variam por indústria e maturidade</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assinatura Metodológica */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700">
          <CardContent className="p-6">
            <p className="text-slate-400 text-sm italic leading-relaxed">
              <strong className="text-white">"</strong>Integro a parcimônia de Toron (fatos oficiais &gt; especulação), 
              a teoria das nulidades de Aury (forma = garantia de validação), 
              a advocacia da liberdade de Técio (confiança &gt; carisma), 
              e a hermenêutica de Lenio (marketing ≠ capacidade real). 
              Esta análise se baseia em fonte primária OpenAI + arquitetura CAIO/TSI validada. 
              Confidence Tiers aplicados. Nunca a falsa certeza.<strong className="text-white">"</strong>
            </p>
            <p className="text-slate-500 text-xs mt-4 text-right">
              — CAIO v12.2 - Unwavering Peer | Análise Atualizada com Dados Oficiais OpenAI 09/12/2025
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}