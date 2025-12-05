import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Search, FileCheck, AlertTriangle, CheckCircle, Loader2,
  Eye, Scale, BookOpen, Sparkles, Target, ArrowRight, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

/**
 * CRV Methodological Validation - Complete CRV Gate Implementation
 * 
 * Implements the 3 components of CRV Validation Gate:
 * 1. Ceticismo Metodológico (Methodological Skepticism)
 * 2. Revisão Estrutural (Structural Review)  
 * 3. Validação Empírica (Empirical Validation)
 */

export default function CRVMethodologicalValidation({ 
  content, 
  contentType = "analysis",
  onValidationComplete 
}) {
  const [inputContent, setInputContent] = useState(content || "");
  const [sources, setSources] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [activeTab, setActiveTab] = useState("skepticism");

  const runFullValidation = async () => {
    if (!inputContent.trim()) {
      toast.error("Insira o conteúdo para validação");
      return;
    }

    setIsValidating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the CRV Validation Gate - a rigorous methodological validation system.

Perform COMPLETE validation on the following content using ALL THREE validation components:

CONTENT TO VALIDATE:
"${inputContent}"

CLAIMED SOURCES (if any):
"${sources || 'None provided'}"

CONTENT TYPE: ${contentType}

═══════════════════════════════════════════════════════════════
COMPONENT 1: CETICISMO METODOLÓGICO (Methodological Skepticism)
═══════════════════════════════════════════════════════════════
Evaluate:
- Source Credibility: Are sources reliable, authoritative, and verifiable?
- Assumption Archaeology: What hidden assumptions underlie the analysis?
- Bias Detection: What cognitive biases might be present?
- Data Provenance: Can data origins be traced and verified?
- Logical Consistency: Are arguments internally consistent?

═══════════════════════════════════════════════════════════════
COMPONENT 2: REVISÃO ESTRUTURAL (Structural Review)
═══════════════════════════════════════════════════════════════
Evaluate:
- Cross-Module Consistency: Does this align with other analyses?
- Quantitative Reconciliation: Do numbers add up correctly?
- Completeness Assessment: What's missing from the analysis?
- Logical Structure Validation: Is the reasoning sound?
- Framework Alignment: Does it follow proper analytical frameworks?

═══════════════════════════════════════════════════════════════
COMPONENT 3: VALIDAÇÃO EMPÍRICA (Empirical Validation)
═══════════════════════════════════════════════════════════════
Evaluate:
- Reality Testing: Does this match real-world observations?
- Market Validation: Is this aligned with market data?
- Financial Reality Checks: Are financial projections realistic?
- Operational Feasibility: Can this actually be implemented?
- Historical Precedent: What similar cases exist?

Return comprehensive JSON:
{
  "overall_validation": {
    "passed": true/false,
    "confidence_score": 0-100,
    "risk_score": 0-100,
    "recommendation": "APPROVE|APPROVE_WITH_CONDITIONS|REVISE|REJECT",
    "summary": "overall assessment"
  },
  "methodological_skepticism": {
    "score": 0-100,
    "status": "passed|warning|failed",
    "source_credibility": {
      "score": 0-100,
      "issues": ["issue1"],
      "verified_sources": ["source1"],
      "unverified_claims": ["claim1"]
    },
    "assumption_archaeology": {
      "hidden_assumptions": [
        {"assumption": "text", "risk_level": "low|medium|high", "validation_needed": "how to validate"}
      ],
      "critical_assumptions_count": number
    },
    "bias_detection": {
      "biases_identified": [
        {"bias": "name", "evidence": "where seen", "severity": "low|medium|high", "mitigation": "how to address"}
      ],
      "overall_bias_risk": "low|medium|high"
    },
    "data_provenance": {
      "traceable": true/false,
      "gaps": ["gap1"],
      "recommendations": ["rec1"]
    },
    "logical_consistency": {
      "score": 0-100,
      "contradictions": ["contradiction1"],
      "weak_links": ["weak_link1"]
    }
  },
  "structural_review": {
    "score": 0-100,
    "status": "passed|warning|failed",
    "cross_module_consistency": {
      "score": 0-100,
      "conflicts": ["conflict1"],
      "alignments": ["alignment1"]
    },
    "quantitative_reconciliation": {
      "numbers_verified": true/false,
      "discrepancies": ["discrepancy1"],
      "calculations_checked": ["calc1"]
    },
    "completeness_assessment": {
      "coverage_score": 0-100,
      "missing_elements": ["element1"],
      "critical_gaps": ["gap1"],
      "nice_to_have": ["item1"]
    },
    "logical_structure": {
      "score": 0-100,
      "structure_issues": ["issue1"],
      "reasoning_quality": "strong|adequate|weak"
    },
    "framework_alignment": {
      "frameworks_used": ["framework1"],
      "proper_application": true/false,
      "deviations": ["deviation1"]
    }
  },
  "empirical_validation": {
    "score": 0-100,
    "status": "passed|warning|failed",
    "reality_testing": {
      "score": 0-100,
      "real_world_alignment": "strong|moderate|weak",
      "disconnects": ["disconnect1"]
    },
    "market_validation": {
      "market_data_aligned": true/false,
      "market_evidence": ["evidence1"],
      "market_contradictions": ["contradiction1"]
    },
    "financial_reality": {
      "projections_realistic": true/false,
      "optimistic_items": ["item1"],
      "pessimistic_items": ["item1"],
      "industry_benchmarks": ["benchmark1"]
    },
    "operational_feasibility": {
      "score": 0-100,
      "feasibility_issues": ["issue1"],
      "resource_requirements": ["req1"],
      "implementation_risks": ["risk1"]
    },
    "historical_precedent": {
      "similar_cases": ["case1"],
      "success_rate": "XX%",
      "lessons_learned": ["lesson1"]
    }
  },
  "action_items": [
    {
      "priority": "critical|high|medium|low",
      "action": "what to do",
      "rationale": "why",
      "deadline": "when"
    }
  ],
  "confidence_thresholds": {
    "current_level": "excellence|target|minimum|pause",
    "score": 0-100,
    "requirements_for_next_level": ["req1"]
  }
}`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_validation: { type: "object" },
            methodological_skepticism: { type: "object" },
            structural_review: { type: "object" },
            empirical_validation: { type: "object" },
            action_items: { type: "array", items: { type: "object" } },
            confidence_thresholds: { type: "object" }
          }
        },
        add_context_from_internet: true
      });

      setValidation(result);
      onValidationComplete?.(result);
      toast.success("Validação CRV completa!");
    } catch (error) {
      console.error("CRV Validation error:", error);
      toast.error("Erro na validação CRV");
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getRecommendationStyle = (rec) => {
    switch (rec) {
      case 'APPROVE': return { bg: 'bg-green-500/20', color: 'text-green-400', icon: CheckCircle };
      case 'APPROVE_WITH_CONDITIONS': return { bg: 'bg-yellow-500/20', color: 'text-yellow-400', icon: AlertTriangle };
      case 'REVISE': return { bg: 'bg-orange-500/20', color: 'text-orange-400', icon: Eye };
      case 'REJECT': return { bg: 'bg-red-500/20', color: 'text-red-400', icon: XCircle };
      default: return { bg: 'bg-slate-500/20', color: 'text-slate-400', icon: Eye };
    }
  };

  const getConfidenceLevel = (score) => {
    if (score >= 85) return { level: 'Excellence', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (score >= 70) return { level: 'Target', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (score >= 50) return { level: 'Minimum', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { level: 'PAUSE', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl">CRV Validation Gate</span>
              <p className="text-sm text-slate-400 font-normal">
                Ceticismo · Revisão · Validação — Full Methodology
              </p>
            </div>
            <Badge className="ml-auto bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              v13.0
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Input Section */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Conteúdo para Validação (Análise, Recomendação, Decisão)
            </label>
            <Textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Cole aqui o conteúdo completo que precisa de validação metodológica..."
              className="bg-white/5 border-white/10 text-white min-h-32"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Fontes Citadas (para verificação)
            </label>
            <Textarea
              value={sources}
              onChange={(e) => setSources(e.target.value)}
              placeholder="Liste as fontes citadas: relatórios, pesquisas, dados de mercado..."
              className="bg-white/5 border-white/10 text-white h-20"
            />
          </div>

          <Button
            onClick={runFullValidation}
            disabled={isValidating || !inputContent.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-6"
          >
            {isValidating ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Executando Validação Completa...</>
            ) : (
              <><Shield className="w-5 h-5 mr-2" />Executar Validação CRV Completa</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Assessment */}
          <Card className={`${getRecommendationStyle(validation.overall_validation?.recommendation).bg} border-white/20`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {React.createElement(getRecommendationStyle(validation.overall_validation?.recommendation).icon, {
                    className: `w-8 h-8 ${getRecommendationStyle(validation.overall_validation?.recommendation).color}`
                  })}
                  <div>
                    <p className={`text-2xl font-bold ${getRecommendationStyle(validation.overall_validation?.recommendation).color}`}>
                      {validation.overall_validation?.recommendation?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-slate-400">Recommendation</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getConfidenceLevel(validation.overall_validation?.confidence_score).color}`}>
                    {validation.overall_validation?.confidence_score}%
                  </div>
                  <Badge className={getConfidenceLevel(validation.overall_validation?.confidence_score).bg}>
                    {getConfidenceLevel(validation.overall_validation?.confidence_score).level}
                  </Badge>
                </div>
              </div>
              <p className="text-slate-300">{validation.overall_validation?.summary}</p>
            </CardContent>
          </Card>

          {/* Three Components Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10 grid grid-cols-3">
              <TabsTrigger 
                value="skepticism" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                <Search className="w-4 h-4 mr-2" />
                Ceticismo
              </TabsTrigger>
              <TabsTrigger 
                value="structural" 
                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Revisão
              </TabsTrigger>
              <TabsTrigger 
                value="empirical" 
                className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
              >
                <Scale className="w-4 h-4 mr-2" />
                Empírica
              </TabsTrigger>
            </TabsList>

            {/* Methodological Skepticism */}
            <TabsContent value="skepticism" className="mt-4 space-y-4">
              <Card className={`border ${getStatusColor(validation.methodological_skepticism?.status)}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Search className="w-5 h-5 text-purple-400" />
                      Ceticismo Metodológico
                    </CardTitle>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white">{validation.methodological_skepticism?.score}/100</span>
                      <Badge className={`ml-2 ${getStatusColor(validation.methodological_skepticism?.status)}`}>
                        {validation.methodological_skepticism?.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Source Credibility */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-300">Credibilidade das Fontes</span>
                      <span className="text-sm text-purple-400">{validation.methodological_skepticism?.source_credibility?.score}/100</span>
                    </div>
                    <Progress value={validation.methodological_skepticism?.source_credibility?.score} className="h-2 mb-2" />
                    {validation.methodological_skepticism?.source_credibility?.unverified_claims?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-red-400 mb-1">Afirmações não verificadas:</p>
                        {validation.methodological_skepticism?.source_credibility?.unverified_claims?.map((claim, i) => (
                          <p key={i} className="text-xs text-slate-400">• {claim}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bias Detection */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-sm font-medium text-slate-300 mb-2">Vieses Detectados</p>
                    {validation.methodological_skepticism?.bias_detection?.biases_identified?.map((bias, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-white/5 rounded mb-1">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          bias.severity === 'high' ? 'text-red-400' : 
                          bias.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                        }`} />
                        <div>
                          <p className="text-sm text-white">{bias.bias}</p>
                          <p className="text-xs text-slate-400">Mitigação: {bias.mitigation}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hidden Assumptions */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-sm font-medium text-slate-300 mb-2">Premissas Ocultas</p>
                    {validation.methodological_skepticism?.assumption_archaeology?.hidden_assumptions?.map((assumption, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-white/5 rounded mb-1">
                        <Eye className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-white">{assumption.assumption}</p>
                          <p className="text-xs text-slate-400">Validação: {assumption.validation_needed}</p>
                        </div>
                        <Badge className={`ml-auto ${
                          assumption.risk_level === 'high' ? 'bg-red-500/20 text-red-400' :
                          assumption.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {assumption.risk_level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Structural Review */}
            <TabsContent value="structural" className="mt-4 space-y-4">
              <Card className={`border ${getStatusColor(validation.structural_review?.status)}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-blue-400" />
                      Revisão Estrutural
                    </CardTitle>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white">{validation.structural_review?.score}/100</span>
                      <Badge className={`ml-2 ${getStatusColor(validation.structural_review?.status)}`}>
                        {validation.structural_review?.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Completeness */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-300">Completude da Análise</span>
                      <span className="text-sm text-blue-400">{validation.structural_review?.completeness_assessment?.coverage_score}%</span>
                    </div>
                    <Progress value={validation.structural_review?.completeness_assessment?.coverage_score} className="h-2 mb-2" />
                    {validation.structural_review?.completeness_assessment?.critical_gaps?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-red-400 mb-1">Lacunas críticas:</p>
                        {validation.structural_review?.completeness_assessment?.critical_gaps?.map((gap, i) => (
                          <p key={i} className="text-xs text-slate-400">• {gap}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Logical Structure */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-300">Estrutura Lógica</span>
                      <Badge className={
                        validation.structural_review?.logical_structure?.reasoning_quality === 'strong' ? 'bg-green-500/20 text-green-400' :
                        validation.structural_review?.logical_structure?.reasoning_quality === 'adequate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }>
                        {validation.structural_review?.logical_structure?.reasoning_quality}
                      </Badge>
                    </div>
                    {validation.structural_review?.logical_structure?.structure_issues?.map((issue, i) => (
                      <p key={i} className="text-xs text-slate-400">• {issue}</p>
                    ))}
                  </div>

                  {/* Quantitative Check */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-300">Reconciliação Quantitativa</span>
                      {validation.structural_review?.quantitative_reconciliation?.numbers_verified ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    {validation.structural_review?.quantitative_reconciliation?.discrepancies?.map((disc, i) => (
                      <p key={i} className="text-xs text-red-400">• {disc}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Empirical Validation */}
            <TabsContent value="empirical" className="mt-4 space-y-4">
              <Card className={`border ${getStatusColor(validation.empirical_validation?.status)}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Scale className="w-5 h-5 text-green-400" />
                      Validação Empírica
                    </CardTitle>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white">{validation.empirical_validation?.score}/100</span>
                      <Badge className={`ml-2 ${getStatusColor(validation.empirical_validation?.status)}`}>
                        {validation.empirical_validation?.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Reality Testing */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-300">Teste de Realidade</span>
                      <Badge className={
                        validation.empirical_validation?.reality_testing?.real_world_alignment === 'strong' ? 'bg-green-500/20 text-green-400' :
                        validation.empirical_validation?.reality_testing?.real_world_alignment === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }>
                        {validation.empirical_validation?.reality_testing?.real_world_alignment}
                      </Badge>
                    </div>
                    <Progress value={validation.empirical_validation?.reality_testing?.score} className="h-2" />
                  </div>

                  {/* Operational Feasibility */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-300">Viabilidade Operacional</span>
                      <span className="text-sm text-green-400">{validation.empirical_validation?.operational_feasibility?.score}/100</span>
                    </div>
                    {validation.empirical_validation?.operational_feasibility?.implementation_risks?.map((risk, i) => (
                      <div key={i} className="flex items-start gap-2 mt-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5" />
                        <p className="text-xs text-slate-400">{risk}</p>
                      </div>
                    ))}
                  </div>

                  {/* Historical Precedent */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-sm font-medium text-slate-300 mb-2">Precedentes Históricos</p>
                    <p className="text-xs text-slate-400 mb-2">
                      Taxa de sucesso em casos similares: <span className="text-green-400 font-bold">{validation.empirical_validation?.historical_precedent?.success_rate}</span>
                    </p>
                    {validation.empirical_validation?.historical_precedent?.lessons_learned?.map((lesson, i) => (
                      <div key={i} className="flex items-start gap-2 mt-1">
                        <BookOpen className="w-3 h-3 text-blue-400 mt-0.5" />
                        <p className="text-xs text-slate-400">{lesson}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Items */}
          {validation.action_items?.length > 0 && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-amber-400 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Ações Necessárias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {validation.action_items.map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                    item.priority === 'critical' ? 'bg-red-500/10' :
                    item.priority === 'high' ? 'bg-orange-500/10' :
                    item.priority === 'medium' ? 'bg-yellow-500/10' :
                    'bg-blue-500/10'
                  }`}>
                    <Badge className={
                      item.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      item.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }>
                      {item.priority}
                    </Badge>
                    <div>
                      <p className="text-sm text-white">{item.action}</p>
                      <p className="text-xs text-slate-400 mt-1">{item.rationale}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}