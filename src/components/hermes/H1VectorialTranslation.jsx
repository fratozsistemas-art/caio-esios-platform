import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Compass, Loader2, Sparkles, ArrowRight, Target, 
  Zap, CheckCircle, AlertTriangle, Clock
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * H1 — TRADUÇÃO VECTORIAL
 * 
 * Transforma visão → vetores → diretrizes → tarefas
 * Core function: Decodificação de visão sistêmica em objetivos operacionais
 */

export default function H1VectorialTranslation({ onTranslationComplete, moduleOutputs }) {
  const [visionInput, setVisionInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [translation, setTranslation] = useState(null);

  const runTranslation = async () => {
    if (!visionInput) return;
    
    setIsProcessing(true);
    try {
      const contextFromModules = moduleOutputs ? 
        `\n\nContexto dos módulos ativos:\n${JSON.stringify(moduleOutputs, null, 2).slice(0, 2000)}` : '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are H1 — Vectorial Translation, a sub-module of HERMES within CAIO.AI.

Your role is to transform high-level systemic vision into actionable vectors, directives, and tasks.

INPUT VISION:
${visionInput}
${contextFromModules}

Generate a complete vectorial translation in JSON:
{
  "translation_quality_score": 0-100,
  "vectors": [
    {
      "id": 1,
      "name": "vector name",
      "direction": "expansion|defense|survival|repositioning|attack|consolidation|retreat",
      "force": 0-100,
      "rhythm": "immediate|short_term|medium_term|long_term",
      "description": "what this vector means",
      "constraints": ["constraint1", "constraint2"],
      "threats": ["threat1"],
      "hypotheses": ["hypothesis1"],
      "decision_limits": ["limit1"]
    }
  ],
  "directives": [
    {
      "vector_id": 1,
      "directive": "clear directive statement",
      "priority": "critical|high|medium|low",
      "owner_profile": "type of person/role who should own this",
      "success_criteria": "how to know it's done"
    }
  ],
  "tasks": [
    {
      "directive_id": 1,
      "task": "specific actionable task",
      "estimated_effort": "hours|days|weeks",
      "dependencies": ["dependency1"],
      "checkpoint": "when to check progress"
    }
  ],
  "translation_notes": {
    "complexity_reduced_from": "original complexity level",
    "key_simplifications": ["what was simplified"],
    "preserved_intent": "what strategic intent was preserved",
    "potential_misinterpretations": ["what could be misunderstood"]
  }
}

Be precise. Preserve strategic intent while making execution clear.`,
        response_json_schema: {
          type: "object",
          properties: {
            translation_quality_score: { type: "number" },
            vectors: { type: "array", items: { type: "object" } },
            directives: { type: "array", items: { type: "object" } },
            tasks: { type: "array", items: { type: "object" } },
            translation_notes: { type: "object" }
          }
        }
      });

      setTranslation(result);
      onTranslationComplete?.(result);
    } catch (error) {
      console.error("H1 Translation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDirectionColor = (direction) => {
    const colors = {
      expansion: "bg-green-500/20 text-green-400",
      defense: "bg-blue-500/20 text-blue-400",
      survival: "bg-red-500/20 text-red-400",
      repositioning: "bg-purple-500/20 text-purple-400",
      attack: "bg-orange-500/20 text-orange-400",
      consolidation: "bg-cyan-500/20 text-cyan-400",
      retreat: "bg-slate-500/20 text-slate-400"
    };
    return colors[direction] || "bg-white/10 text-white";
  };

  return (
    <Card className="bg-cyan-500/5 border-cyan-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Compass className="w-5 h-5 text-cyan-400" />
          H1 — Tradução Vectorial
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 ml-2">
            Visão → Execução
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Visão / Decisão Estratégica a Traduzir *
          </label>
          <Textarea
            placeholder="Descreva a visão sistêmica, decisão vectorial ou direção estratégica que precisa ser traduzida para a operação..."
            value={visionInput}
            onChange={(e) => setVisionInput(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-32"
          />
          <p className="text-xs text-slate-500 mt-1">
            Inclua: direção, força, ritmo, condicionantes, ameaças, hipóteses, limites da decisão
          </p>
        </div>

        <Button
          onClick={runTranslation}
          disabled={!visionInput || isProcessing}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
        >
          {isProcessing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traduzindo Vetores...</>
          ) : (
            <><Compass className="w-4 h-4 mr-2" />Executar Tradução Vectorial</>
          )}
        </Button>

        {translation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mt-4"
          >
            {/* Quality Score */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-slate-400">Qualidade da Tradução</span>
              <div className="flex items-center gap-2">
                <Progress value={translation.translation_quality_score} className="w-24 h-2" />
                <span className="text-lg font-bold text-cyan-400">{translation.translation_quality_score}%</span>
              </div>
            </div>

            {/* Vectors */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Vetores Identificados ({translation.vectors?.length || 0})
              </h4>
              {translation.vectors?.map((vector, idx) => (
                <Card key={idx} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="text-white font-medium">{vector.name}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getDirectionColor(vector.direction)}>
                            {vector.direction}
                          </Badge>
                          <Badge className="bg-white/10 text-slate-300 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {vector.rhythm?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Força</p>
                        <p className="text-xl font-bold text-cyan-400">{vector.force}%</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{vector.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {vector.constraints?.length > 0 && (
                        <div className="p-2 bg-yellow-500/10 rounded">
                          <p className="text-yellow-400 font-medium mb-1">Condicionantes</p>
                          {vector.constraints.map((c, i) => (
                            <p key={i} className="text-slate-300">• {c}</p>
                          ))}
                        </div>
                      )}
                      {vector.threats?.length > 0 && (
                        <div className="p-2 bg-red-500/10 rounded">
                          <p className="text-red-400 font-medium mb-1">Ameaças</p>
                          {vector.threats.map((t, i) => (
                            <p key={i} className="text-slate-300">• {t}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Directives */}
            {translation.directives?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  Diretrizes ({translation.directives.length})
                </h4>
                {translation.directives.map((directive, idx) => (
                  <div key={idx} className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-white">{directive.directive}</p>
                      <Badge className={`text-xs ${
                        directive.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                        directive.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {directive.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Owner: {directive.owner_profile} | Sucesso: {directive.success_criteria}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks */}
            {translation.tasks?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Tarefas ({translation.tasks.length})
                </h4>
                {translation.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 bg-white/5 rounded">
                    <ArrowRight className="w-4 h-4 text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-white">{task.task}</p>
                      <p className="text-xs text-slate-400">
                        Esforço: {task.estimated_effort} | Checkpoint: {task.checkpoint}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Translation Notes */}
            {translation.translation_notes && (
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-3">
                  <p className="text-xs text-amber-400 font-semibold mb-2">Notas de Tradução</p>
                  <p className="text-xs text-white mb-1">
                    <strong>Intenção Preservada:</strong> {translation.translation_notes.preserved_intent}
                  </p>
                  {translation.translation_notes.potential_misinterpretations?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-red-400">⚠️ Possíveis Mal-entendidos:</p>
                      {translation.translation_notes.potential_misinterpretations.map((m, i) => (
                        <p key={i} className="text-xs text-slate-300">• {m}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}