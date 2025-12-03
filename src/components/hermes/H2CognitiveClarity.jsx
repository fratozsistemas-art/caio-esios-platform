import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Loader2, Sparkles, ArrowRight, Users,
  BookOpen, Lightbulb, CheckCircle, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * H2 — CLARIFICAÇÃO COGNITIVA
 * 
 * Reescreve contextos, cenários e estruturas para permitir execução
 * Core function: Traduzir complexidade para diferentes bandas cognitivas
 */

const TARGET_AUDIENCES = [
  { value: "board", label: "Board/Conselho", band: "Alta abstração, visão fiduciária" },
  { value: "c_suite", label: "C-Suite/Diretoria", band: "Estratégico-tático" },
  { value: "management", label: "Gestores/Gerência", band: "Tático-operacional" },
  { value: "operations", label: "Operação/Times", band: "Execução direta" },
  { value: "external", label: "Stakeholders Externos", band: "Comunicação institucional" }
];

export default function H2CognitiveClarity({ onClarificationComplete, moduleOutputs }) {
  const [complexContent, setComplexContent] = useState("");
  const [targetAudience, setTargetAudience] = useState("operations");
  const [isProcessing, setIsProcessing] = useState(false);
  const [clarification, setClarification] = useState(null);

  const runClarification = async () => {
    if (!complexContent) return;
    
    setIsProcessing(true);
    try {
      const contextFromModules = moduleOutputs ? 
        `\n\nContexto adicional dos módulos:\n${JSON.stringify(moduleOutputs, null, 2).slice(0, 1500)}` : '';

      const targetInfo = TARGET_AUDIENCES.find(t => t.value === targetAudience);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are H2 — Cognitive Clarification, a sub-module of HERMES within CAIO.AI.

Your role is to rewrite complex strategic content for different cognitive bands, making execution possible without losing strategic intent.

ORIGINAL COMPLEX CONTENT:
${complexContent}

TARGET AUDIENCE: ${targetInfo?.label} (${targetInfo?.band})
${contextFromModules}

Generate cognitive clarification in JSON:
{
  "clarification_score": 0-100,
  "original_complexity": "extreme|high|medium|low",
  "target_complexity": "high|medium|low|minimal",
  "clarified_content": {
    "executive_summary": "2-3 sentence summary for target audience",
    "key_points": [
      {
        "original": "complex statement",
        "clarified": "simplified version",
        "why_it_matters": "relevance for this audience"
      }
    ],
    "action_implications": ["what this means they need to do"],
    "context_they_need": "background they should have"
  },
  "cognitive_adaptations": [
    {
      "adaptation": "what was changed",
      "reason": "why it helps this audience",
      "risk": "what might be lost"
    }
  ],
  "vocabulary_translation": [
    {
      "technical_term": "original term",
      "simplified_term": "accessible term",
      "definition": "brief explanation"
    }
  ],
  "visual_suggestions": [
    {
      "concept": "what to visualize",
      "format": "chart|diagram|table|timeline|infographic",
      "why": "why this helps understanding"
    }
  ],
  "communication_format": {
    "recommended_format": "email|presentation|document|meeting|video",
    "length": "brief|moderate|detailed",
    "tone": "formal|professional|casual",
    "follow_up_needed": true
  },
  "comprehension_checkpoints": [
    {
      "question": "question to verify understanding",
      "expected_answer": "what they should know"
    }
  ],
  "execution_readiness": {
    "score": 0-100,
    "gaps": ["what they still need to know"],
    "prerequisites": ["what they need before acting"]
  }
}

Prioritize clarity without patronizing. Preserve strategic intent.`,
        response_json_schema: {
          type: "object",
          properties: {
            clarification_score: { type: "number" },
            original_complexity: { type: "string" },
            target_complexity: { type: "string" },
            clarified_content: { type: "object" },
            cognitive_adaptations: { type: "array", items: { type: "object" } },
            vocabulary_translation: { type: "array", items: { type: "object" } },
            visual_suggestions: { type: "array", items: { type: "object" } },
            communication_format: { type: "object" },
            comprehension_checkpoints: { type: "array", items: { type: "object" } },
            execution_readiness: { type: "object" }
          }
        }
      });

      setClarification(result);
      onClarificationComplete?.(result);
    } catch (error) {
      console.error("H2 Clarification error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-purple-500/5 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="w-5 h-5 text-purple-400" />
          H2 — Clarificação Cognitiva
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 ml-2">
            Complexidade → Clareza
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Conteúdo Complexo a Clarificar *
          </label>
          <Textarea
            placeholder="Cole aqui o conteúdo estratégico complexo que precisa ser traduzido para uma audiência específica..."
            value={complexContent}
            onChange={(e) => setComplexContent(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-32"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Audiência Alvo</label>
          <Select value={targetAudience} onValueChange={setTargetAudience}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGET_AUDIENCES.map((audience) => (
                <SelectItem key={audience.value} value={audience.value}>
                  <div>
                    <span className="font-medium">{audience.label}</span>
                    <span className="text-xs text-slate-400 ml-2">({audience.band})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={runClarification}
          disabled={!complexContent || isProcessing}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isProcessing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Clarificando Conteúdo...</>
          ) : (
            <><Brain className="w-4 h-4 mr-2" />Executar Clarificação Cognitiva</>
          )}
        </Button>

        {clarification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mt-4"
          >
            {/* Scores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Complexidade Original → Alvo</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500/20 text-red-400">{clarification.original_complexity}</Badge>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                  <Badge className="bg-green-500/20 text-green-400">{clarification.target_complexity}</Badge>
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Score de Clarificação</p>
                <p className="text-2xl font-bold text-purple-400">{clarification.clarification_score}%</p>
              </div>
            </div>

            {/* Clarified Content */}
            {clarification.clarified_content && (
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Conteúdo Clarificado
                  </h4>
                  <p className="text-sm text-white mb-4">{clarification.clarified_content.executive_summary}</p>
                  
                  {clarification.clarified_content.key_points?.length > 0 && (
                    <div className="space-y-2">
                      {clarification.clarified_content.key_points.map((point, idx) => (
                        <div key={idx} className="p-2 bg-white/5 rounded">
                          <p className="text-xs text-slate-400 line-through mb-1">{point.original}</p>
                          <p className="text-sm text-white">→ {point.clarified}</p>
                          <p className="text-xs text-purple-400 mt-1">Por quê: {point.why_it_matters}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Vocabulary Translation */}
            {clarification.vocabulary_translation?.length > 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    Glossário Simplificado
                  </h4>
                  <div className="grid gap-2">
                    {clarification.vocabulary_translation.map((term, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 bg-white/5 rounded text-xs">
                        <Badge className="bg-red-500/20 text-red-400 shrink-0">{term.technical_term}</Badge>
                        <ArrowRight className="w-3 h-3 text-slate-400 mt-0.5" />
                        <div>
                          <span className="text-green-400 font-medium">{term.simplified_term}</span>
                          <p className="text-slate-400 mt-0.5">{term.definition}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Communication Format */}
            {clarification.communication_format && (
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h4 className="text-xs font-semibold text-blue-400 mb-2">Formato Recomendado de Comunicação</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-white/10 text-white">{clarification.communication_format.recommended_format}</Badge>
                  <Badge className="bg-white/10 text-white">{clarification.communication_format.length}</Badge>
                  <Badge className="bg-white/10 text-white">{clarification.communication_format.tone}</Badge>
                </div>
              </div>
            )}

            {/* Execution Readiness */}
            {clarification.execution_readiness && (
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Prontidão para Execução
                    </h4>
                    <span className="text-xl font-bold text-white">{clarification.execution_readiness.score}%</span>
                  </div>
                  <Progress value={clarification.execution_readiness.score} className="h-2 mb-3" />
                  
                  {clarification.execution_readiness.gaps?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-yellow-400 mb-1">Gaps a Preencher:</p>
                      {clarification.execution_readiness.gaps.map((gap, i) => (
                        <p key={i} className="text-xs text-slate-300">• {gap}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Comprehension Checkpoints */}
            {clarification.comprehension_checkpoints?.length > 0 && (
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <h4 className="text-xs font-semibold text-amber-400 mb-2">Perguntas de Verificação</h4>
                {clarification.comprehension_checkpoints.map((check, idx) => (
                  <div key={idx} className="text-xs mb-2">
                    <p className="text-white">❓ {check.question}</p>
                    <p className="text-slate-400 ml-4">✓ {check.expected_answer}</p>
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