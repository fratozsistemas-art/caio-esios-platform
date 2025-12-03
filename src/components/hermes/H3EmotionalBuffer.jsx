import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, Loader2, Sparkles, Shield, AlertTriangle,
  Users, MessageSquare, ThumbsUp, ThumbsDown, Zap
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * H3 — BUFFER EMOCIONAL
 * 
 * Operação psicológica para absorver ruído, evitar conflitos, proteger relações
 * Core function: Reduzir atrito emocional e cognitivo entre níveis
 */

export default function H3EmotionalBuffer({ onBufferComplete, moduleOutputs }) {
  const [situationInput, setSituationInput] = useState("");
  const [stakeholdersInput, setStakeholdersInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bufferAnalysis, setBufferAnalysis] = useState(null);

  const runBufferAnalysis = async () => {
    if (!situationInput) return;
    
    setIsProcessing(true);
    try {
      const contextFromModules = moduleOutputs ? 
        `\n\nContexto estratégico:\n${JSON.stringify(moduleOutputs, null, 2).slice(0, 1500)}` : '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are H3 — Emotional Buffer, a sub-module of HERMES within CAIO.AI.

Your role is psychological operations: absorb noise, prevent conflicts, protect relationships, and reduce emotional/cognitive friction between organizational levels.

SITUATION:
${situationInput}

KEY STAKEHOLDERS:
${stakeholdersInput || "Not specified - analyze based on context"}
${contextFromModules}

Generate emotional buffer analysis in JSON:
{
  "friction_risk_score": 0-100,
  "emotional_landscape": {
    "overall_climate": "tense|neutral|positive|volatile",
    "dominant_emotions": ["emotion1", "emotion2"],
    "hidden_concerns": ["concern1", "concern2"],
    "power_dynamics": "description of power dynamics at play"
  },
  "stakeholder_emotional_map": [
    {
      "stakeholder": "stakeholder name/role",
      "current_state": "emotional state",
      "likely_reaction": "how they'll react",
      "underlying_needs": ["need1", "need2"],
      "triggers_to_avoid": ["trigger1"],
      "engagement_approach": "how to approach them"
    }
  ],
  "friction_points": [
    {
      "point": "description of friction",
      "between": ["party1", "party2"],
      "severity": "critical|high|medium|low",
      "root_cause": "underlying cause",
      "if_unaddressed": "consequence",
      "mitigation_script": "what to say/do"
    }
  ],
  "political_risks": [
    {
      "risk": "political risk",
      "probability": "high|medium|low",
      "impact": "high|medium|low",
      "actors_involved": ["actor1"],
      "neutralization_strategy": "how to address"
    }
  ],
  "communication_shields": [
    {
      "message_type": "what needs to be communicated",
      "raw_version": "direct/unfiltered version",
      "buffered_version": "diplomatically adjusted version",
      "rationale": "why the buffer helps"
    }
  ],
  "de_escalation_protocols": [
    {
      "scenario": "if this happens",
      "immediate_response": "do this immediately",
      "follow_up": "then do this",
      "phrases_to_use": ["phrase1", "phrase2"],
      "phrases_to_avoid": ["avoid1", "avoid2"]
    }
  ],
  "relationship_preservation": {
    "at_risk_relationships": ["relationship1"],
    "protective_actions": ["action1", "action2"],
    "trust_building_opportunities": ["opportunity1"]
  },
  "recommended_tone": {
    "overall": "assertive|collaborative|cautious|supportive|neutral",
    "written_comms": "tone for emails/docs",
    "verbal_comms": "tone for meetings/calls",
    "timing_advice": "when to communicate"
  },
  "buffer_synthesis": {
    "key_message": "most important emotional intelligence insight",
    "critical_action": "single most important thing to do",
    "watch_for": "signs that friction is escalating"
  }
}

Be empathetic but strategic. Protect relationships without compromising vision.`,
        response_json_schema: {
          type: "object",
          properties: {
            friction_risk_score: { type: "number" },
            emotional_landscape: { type: "object" },
            stakeholder_emotional_map: { type: "array", items: { type: "object" } },
            friction_points: { type: "array", items: { type: "object" } },
            political_risks: { type: "array", items: { type: "object" } },
            communication_shields: { type: "array", items: { type: "object" } },
            de_escalation_protocols: { type: "array", items: { type: "object" } },
            relationship_preservation: { type: "object" },
            recommended_tone: { type: "object" },
            buffer_synthesis: { type: "object" }
          }
        }
      });

      setBufferAnalysis(result);
      onBufferComplete?.(result);
    } catch (error) {
      console.error("H3 Buffer error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getClimateColor = (climate) => {
    const colors = {
      tense: "bg-red-500/20 text-red-400",
      volatile: "bg-orange-500/20 text-orange-400",
      neutral: "bg-blue-500/20 text-blue-400",
      positive: "bg-green-500/20 text-green-400"
    };
    return colors[climate] || "bg-white/10 text-white";
  };

  return (
    <Card className="bg-pink-500/5 border-pink-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Heart className="w-5 h-5 text-pink-400" />
          H3 — Buffer Emocional
          <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30 ml-2">
            Proteção Relacional
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Situação / Contexto de Potencial Fricção *
          </label>
          <Textarea
            placeholder="Descreva a situação que pode gerar ruído emocional, conflito ou mal-entendido entre partes..."
            value={situationInput}
            onChange={(e) => setSituationInput(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-28"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Stakeholders Envolvidos
          </label>
          <Textarea
            placeholder="Liste as partes envolvidas e seus papéis: sócios, gestores, equipe, clientes, investidores..."
            value={stakeholdersInput}
            onChange={(e) => setStakeholdersInput(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-20"
          />
        </div>

        <Button
          onClick={runBufferAnalysis}
          disabled={!situationInput || isProcessing}
          className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
        >
          {isProcessing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analisando Dinâmica Emocional...</>
          ) : (
            <><Heart className="w-4 h-4 mr-2" />Executar Análise de Buffer Emocional</>
          )}
        </Button>

        {bufferAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mt-4"
          >
            {/* Risk Score & Climate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Risco de Fricção</p>
                <div className="flex items-center gap-2">
                  <Progress value={bufferAnalysis.friction_risk_score} className="flex-1 h-3" />
                  <span className={`text-xl font-bold ${
                    bufferAnalysis.friction_risk_score >= 70 ? 'text-red-400' :
                    bufferAnalysis.friction_risk_score >= 40 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {bufferAnalysis.friction_risk_score}%
                  </span>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Clima Emocional</p>
                <Badge className={getClimateColor(bufferAnalysis.emotional_landscape?.overall_climate)}>
                  {bufferAnalysis.emotional_landscape?.overall_climate}
                </Badge>
              </div>
            </div>

            {/* Buffer Synthesis */}
            {bufferAnalysis.buffer_synthesis && (
              <Card className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-pink-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-pink-400 mb-1">Síntese do Buffer</p>
                      <p className="text-sm text-white mb-2">{bufferAnalysis.buffer_synthesis.key_message}</p>
                      <div className="p-2 bg-white/10 rounded mt-2">
                        <p className="text-xs text-green-400">Ação Crítica:</p>
                        <p className="text-sm text-white">{bufferAnalysis.buffer_synthesis.critical_action}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Friction Points */}
            {bufferAnalysis.friction_points?.length > 0 && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Pontos de Fricção ({bufferAnalysis.friction_points.length})
                  </h4>
                  <div className="space-y-3">
                    {bufferAnalysis.friction_points.map((fp, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm text-white">{fp.point}</p>
                          <Badge className={`text-xs ${
                            fp.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            fp.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {fp.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">
                          Entre: {fp.between?.join(' ↔ ')}
                        </p>
                        <div className="p-2 bg-green-500/10 rounded">
                          <p className="text-xs text-green-400">Script de Mitigação:</p>
                          <p className="text-xs text-white">{fp.mitigation_script}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Communication Shields */}
            {bufferAnalysis.communication_shields?.length > 0 && (
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Escudos de Comunicação
                  </h4>
                  <div className="space-y-3">
                    {bufferAnalysis.communication_shields.map((shield, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded">
                        <p className="text-xs text-slate-400 mb-2">{shield.message_type}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-2 bg-red-500/10 rounded">
                            <p className="text-xs text-red-400 flex items-center gap-1">
                              <ThumbsDown className="w-3 h-3" /> Versão Crua
                            </p>
                            <p className="text-xs text-slate-300">{shield.raw_version}</p>
                          </div>
                          <div className="p-2 bg-green-500/10 rounded">
                            <p className="text-xs text-green-400 flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" /> Versão Buffered
                            </p>
                            <p className="text-xs text-white">{shield.buffered_version}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Tone */}
            {bufferAnalysis.recommended_tone && (
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h4 className="text-xs font-semibold text-purple-400 mb-2">Tom Recomendado</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-white/10 text-white">
                    Geral: {bufferAnalysis.recommended_tone.overall}
                  </Badge>
                  <Badge className="bg-white/10 text-white">
                    Escrito: {bufferAnalysis.recommended_tone.written_comms}
                  </Badge>
                  <Badge className="bg-white/10 text-white">
                    Verbal: {bufferAnalysis.recommended_tone.verbal_comms}
                  </Badge>
                </div>
                {bufferAnalysis.recommended_tone.timing_advice && (
                  <p className="text-xs text-slate-400 mt-2">
                    ⏰ {bufferAnalysis.recommended_tone.timing_advice}
                  </p>
                )}
              </div>
            )}

            {/* De-escalation Protocols */}
            {bufferAnalysis.de_escalation_protocols?.length > 0 && (
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Protocolos de De-escalação
                  </h4>
                  {bufferAnalysis.de_escalation_protocols.slice(0, 2).map((protocol, idx) => (
                    <div key={idx} className="p-2 bg-white/5 rounded mb-2">
                      <p className="text-xs text-white font-medium mb-1">Se: {protocol.scenario}</p>
                      <p className="text-xs text-green-400">→ {protocol.immediate_response}</p>
                      {protocol.phrases_to_use?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-400">Usar:</p>
                          {protocol.phrases_to_use.map((p, i) => (
                            <p key={i} className="text-xs text-cyan-400">"{p}"</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}