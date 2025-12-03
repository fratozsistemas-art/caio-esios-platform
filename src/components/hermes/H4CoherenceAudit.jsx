import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, Loader2, Sparkles, AlertTriangle, CheckCircle,
  Target, TrendingUp, Clock, ArrowRight, Shield
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * H4 — AUDITORIA COERENCIAL
 * 
 * Garante que execução não se desvie da visão estratégica
 * Core function: Monitorar alinhamento visão-execução continuamente
 */

export default function H4CoherenceAudit({ onAuditComplete, moduleOutputs, hermesOutputs }) {
  const [visionStatement, setVisionStatement] = useState("");
  const [currentExecution, setCurrentExecution] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  const runCoherenceAudit = async () => {
    if (!visionStatement || !currentExecution) return;
    
    setIsProcessing(true);
    try {
      const moduleContext = moduleOutputs ? 
        `\n\nContexto dos módulos TSI:\n${JSON.stringify(moduleOutputs, null, 2).slice(0, 1500)}` : '';
      
      const hermesContext = hermesOutputs ? 
        `\n\nAnálises HERMES anteriores:\n${JSON.stringify(hermesOutputs, null, 2).slice(0, 1000)}` : '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are H4 — Coherence Audit, a sub-module of HERMES within CAIO.AI.

Your role is to ensure execution does not deviate from strategic vision. You continuously monitor alignment between the original intent and actual implementation.

ORIGINAL VISION/INTENT:
${visionStatement}

CURRENT EXECUTION/REALITY:
${currentExecution}
${moduleContext}
${hermesContext}

Generate a comprehensive coherence audit in JSON:
{
  "coherence_score": 0-100,
  "alignment_status": "aligned|drifting|misaligned|critical_deviation",
  "vision_preservation": {
    "core_intent_preserved": true,
    "preserved_elements": ["element1", "element2"],
    "lost_elements": ["lost1"],
    "distorted_elements": [
      {
        "original": "what was intended",
        "current": "what it became",
        "distortion_type": "dilution|misinterpretation|over_simplification|scope_creep",
        "severity": "critical|high|medium|low"
      }
    ]
  },
  "execution_deviations": [
    {
      "area": "deviation area",
      "expected": "what should be happening",
      "actual": "what is happening",
      "gap_severity": "critical|high|medium|low",
      "root_cause": "why this deviated",
      "correction_action": "how to fix",
      "urgency": "immediate|this_week|this_month"
    }
  ],
  "drift_indicators": [
    {
      "indicator": "sign of drift",
      "direction": "toward what",
      "velocity": "slow|moderate|fast",
      "if_uncorrected": "where this leads"
    }
  ],
  "checkpoints": [
    {
      "checkpoint": "what to verify",
      "frequency": "daily|weekly|bi-weekly|monthly",
      "owner": "who should check",
      "success_criteria": "what good looks like",
      "warning_signs": ["sign1", "sign2"]
    }
  ],
  "course_corrections": [
    {
      "correction": "what needs to change",
      "priority": "critical|high|medium",
      "effort": "low|medium|high",
      "impact": "description of impact",
      "implementation_steps": ["step1", "step2"]
    }
  ],
  "governance_recommendations": [
    {
      "recommendation": "governance improvement",
      "rationale": "why it helps",
      "implementation": "how to implement"
    }
  ],
  "audit_synthesis": {
    "overall_health": "healthy|caution|warning|critical",
    "key_finding": "most important discovery",
    "immediate_action": "single most urgent action",
    "next_audit_focus": "what to audit next time"
  }
}

Be precise and constructive. Identify issues but always provide solutions.`,
        response_json_schema: {
          type: "object",
          properties: {
            coherence_score: { type: "number" },
            alignment_status: { type: "string" },
            vision_preservation: { type: "object" },
            execution_deviations: { type: "array", items: { type: "object" } },
            drift_indicators: { type: "array", items: { type: "object" } },
            checkpoints: { type: "array", items: { type: "object" } },
            course_corrections: { type: "array", items: { type: "object" } },
            governance_recommendations: { type: "array", items: { type: "object" } },
            audit_synthesis: { type: "object" }
          }
        }
      });

      setAuditResult(result);
      onAuditComplete?.(result);
    } catch (error) {
      console.error("H4 Audit error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getAlignmentColor = (status) => {
    const colors = {
      aligned: "bg-green-500/20 text-green-400 border-green-500/30",
      drifting: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      misaligned: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      critical_deviation: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return colors[status] || "bg-white/10 text-white";
  };

  const getHealthColor = (health) => {
    const colors = {
      healthy: "text-green-400",
      caution: "text-yellow-400",
      warning: "text-orange-400",
      critical: "text-red-400"
    };
    return colors[health] || "text-white";
  };

  return (
    <Card className="bg-amber-500/5 border-amber-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Eye className="w-5 h-5 text-amber-400" />
          H4 — Auditoria Coerencial
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 ml-2">
            Visão ↔ Execução
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Visão / Intenção Original *
          </label>
          <Textarea
            placeholder="Descreva a visão estratégica original, a decisão tomada, ou o objetivo inicial que precisa ser auditado..."
            value={visionStatement}
            onChange={(e) => setVisionStatement(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-24"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Execução Atual / Realidade *
          </label>
          <Textarea
            placeholder="Descreva o que está realmente acontecendo na execução, o status atual, resultados observados..."
            value={currentExecution}
            onChange={(e) => setCurrentExecution(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-24"
          />
        </div>

        <Button
          onClick={runCoherenceAudit}
          disabled={!visionStatement || !currentExecution || isProcessing}
          className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
        >
          {isProcessing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Auditando Coerência...</>
          ) : (
            <><Eye className="w-4 h-4 mr-2" />Executar Auditoria Coerencial</>
          )}
        </Button>

        {auditResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mt-4"
          >
            {/* Main Scores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Score de Coerência</p>
                <div className="flex items-center gap-3">
                  <Progress value={auditResult.coherence_score} className="flex-1 h-3" />
                  <span className={`text-2xl font-bold ${
                    auditResult.coherence_score >= 80 ? 'text-green-400' :
                    auditResult.coherence_score >= 60 ? 'text-yellow-400' :
                    auditResult.coherence_score >= 40 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {auditResult.coherence_score}%
                  </span>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Status de Alinhamento</p>
                <Badge className={getAlignmentColor(auditResult.alignment_status)}>
                  {auditResult.alignment_status?.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            {/* Audit Synthesis */}
            {auditResult.audit_synthesis && (
              <Card className={`border ${
                auditResult.audit_synthesis.overall_health === 'healthy' ? 'bg-green-500/10 border-green-500/30' :
                auditResult.audit_synthesis.overall_health === 'caution' ? 'bg-yellow-500/10 border-yellow-500/30' :
                auditResult.audit_synthesis.overall_health === 'warning' ? 'bg-orange-500/10 border-orange-500/30' :
                'bg-red-500/10 border-red-500/30'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className={`w-5 h-5 ${getHealthColor(auditResult.audit_synthesis.overall_health)} mt-0.5`} />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-semibold text-white">Síntese da Auditoria</p>
                        <Badge className={getAlignmentColor(auditResult.audit_synthesis.overall_health)}>
                          {auditResult.audit_synthesis.overall_health}
                        </Badge>
                      </div>
                      <p className="text-sm text-white mb-2">{auditResult.audit_synthesis.key_finding}</p>
                      <div className="p-2 bg-white/10 rounded">
                        <p className="text-xs text-amber-400">Ação Imediata:</p>
                        <p className="text-sm text-white">{auditResult.audit_synthesis.immediate_action}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vision Preservation */}
            {auditResult.vision_preservation && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    Preservação da Visão
                  </h4>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {auditResult.vision_preservation.core_intent_preserved ? (
                      <Badge className="bg-green-500/20 text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Intenção Core Preservada
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Intenção Core Comprometida
                      </Badge>
                    )}
                  </div>

                  {auditResult.vision_preservation.distorted_elements?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-red-400 mb-2">Elementos Distorcidos:</p>
                      {auditResult.vision_preservation.distorted_elements.map((dist, idx) => (
                        <div key={idx} className="p-2 bg-red-500/10 rounded mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <Badge className="bg-white/10 text-white text-xs">{dist.distortion_type}</Badge>
                            <Badge className={`text-xs ${
                              dist.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {dist.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400">Original: {dist.original}</p>
                          <p className="text-xs text-white">Atual: {dist.current}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Execution Deviations */}
            {auditResult.execution_deviations?.length > 0 && (
              <Card className="bg-orange-500/10 border-orange-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Desvios de Execução ({auditResult.execution_deviations.length})
                  </h4>
                  <div className="space-y-3">
                    {auditResult.execution_deviations.map((dev, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm text-white font-medium">{dev.area}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${
                              dev.gap_severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                              dev.gap_severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {dev.gap_severity}
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {dev.urgency}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div className="p-2 bg-green-500/10 rounded">
                            <p className="text-green-400">Esperado:</p>
                            <p className="text-slate-300">{dev.expected}</p>
                          </div>
                          <div className="p-2 bg-red-500/10 rounded">
                            <p className="text-red-400">Atual:</p>
                            <p className="text-slate-300">{dev.actual}</p>
                          </div>
                        </div>
                        <div className="p-2 bg-cyan-500/10 rounded">
                          <p className="text-xs text-cyan-400">Correção:</p>
                          <p className="text-xs text-white">{dev.correction_action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Checkpoints */}
            {auditResult.checkpoints?.length > 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Checkpoints Recomendados
                  </h4>
                  <div className="space-y-2">
                    {auditResult.checkpoints.map((cp, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 bg-white/5 rounded">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">{cp.checkpoint}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-white/10 text-slate-300 text-xs">{cp.frequency}</Badge>
                            <span className="text-xs text-slate-400">Owner: {cp.owner}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Corrections */}
            {auditResult.course_corrections?.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30">
                <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Correções de Curso
                </h4>
                {auditResult.course_corrections.map((cc, idx) => (
                  <div key={idx} className="flex items-start gap-2 mb-2">
                    <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-white">{cc.correction}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${
                          cc.priority === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {cc.priority}
                        </Badge>
                        <span className="text-xs text-slate-400">Esforço: {cc.effort}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}