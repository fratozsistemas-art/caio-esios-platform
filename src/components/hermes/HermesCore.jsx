import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, Loader2, Sparkles, ArrowRight, Target, Zap,
  Brain, MessageSquare, AlertTriangle, CheckCircle, 
  Compass, Layers, Heart, Eye
} from "lucide-react";
import { motion } from "framer-motion";
import H1VectorialTranslation from "./H1VectorialTranslation";
import H2CognitiveClarity from "./H2CognitiveClarity";
import H3EmotionalBuffer from "./H3EmotionalBuffer";
import H4CoherenceAudit from "./H4CoherenceAudit";

/**
 * HERMES CORE MODULE
 * 
 * Framework de Intermediação Cognitiva e Tradução Estratégica
 * Ponte estruturada entre visão sistêmica e operação
 * 
 * 4 Módulos Internos:
 * - H1: Tradução Vectorial (visão → vetores → diretrizes → tarefas)
 * - H2: Clarificação Cognitiva (reescreve contextos para execução)
 * - H3: Buffer Emocional (absorve ruído, protege relações)
 * - H4: Auditoria Coerencial (garante alinhamento visão-execução)
 */

const HERMES_MODULES = [
  { 
    id: "h1", 
    name: "H1 Tradução Vectorial", 
    icon: Compass, 
    color: "cyan",
    description: "Visão → Vetores → Diretrizes → Tarefas"
  },
  { 
    id: "h2", 
    name: "H2 Clarificação Cognitiva", 
    icon: Brain, 
    color: "purple",
    description: "Reescreve contextos para execução"
  },
  { 
    id: "h3", 
    name: "H3 Buffer Emocional", 
    icon: Heart, 
    color: "pink",
    description: "Absorve ruído, protege relações"
  },
  { 
    id: "h4", 
    name: "H4 Auditoria Coerencial", 
    icon: Eye, 
    color: "amber",
    description: "Garante alinhamento visão-execução"
  }
];

export default function HermesCore({ onTranslationComplete, moduleOutputs }) {
  const [activeModule, setActiveModule] = useState("h1");
  const [hermesOutputs, setHermesOutputs] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [integrationScore, setIntegrationScore] = useState(null);

  const handleModuleOutput = (moduleId, data) => {
    setHermesOutputs(prev => ({ ...prev, [moduleId]: data }));
    onTranslationComplete?.({ moduleId, data, allOutputs: { ...hermesOutputs, [moduleId]: data } });
  };

  const runFullHermesAnalysis = async () => {
    if (!moduleOutputs || Object.keys(moduleOutputs).length === 0) return;
    
    setIsProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are HERMES, the Cognitive Intermediation and Strategic Translation framework within CAIO.AI.

Your role is to act as a structured bridge between:
- High-level systemic vision (complex, vectorial, architectural)
- Operational teams (tactical execution, linear tasks)

Analyze the following module outputs and provide a HERMES integration analysis:

${JSON.stringify(moduleOutputs, null, 2).slice(0, 4000)}

Generate a comprehensive HERMES analysis in JSON:
{
  "integration_score": 0-100,
  "cognitive_load_assessment": {
    "complexity_level": "low|medium|high|extreme",
    "translation_difficulty": 0-100,
    "recommended_simplifications": ["simplification1", "simplification2"]
  },
  "vectorial_translation": {
    "primary_vectors": [
      {
        "direction": "vector direction",
        "force": 0-100,
        "rhythm": "immediate|short_term|medium_term|long_term",
        "constraints": ["constraint1"],
        "threats": ["threat1"],
        "operational_tasks": ["task1", "task2"]
      }
    ],
    "vector_coherence_score": 0-100
  },
  "cognitive_clarification": {
    "key_concepts_simplified": [
      {"original": "complex concept", "simplified": "clear explanation", "target_audience": "operations|management|board"}
    ],
    "execution_readiness_score": 0-100
  },
  "emotional_buffer": {
    "potential_friction_points": [
      {"area": "friction area", "risk_level": "low|medium|high", "mitigation": "how to address"}
    ],
    "political_risks": ["risk1"],
    "recommended_communication_tone": "description of tone"
  },
  "coherence_audit": {
    "vision_alignment_score": 0-100,
    "execution_deviation_risks": ["risk1"],
    "checkpoints_recommended": [
      {"checkpoint": "what to check", "when": "timing", "owner": "who"}
    ]
  },
  "hermes_synthesis": {
    "key_message": "The most important insight for the team",
    "immediate_actions": ["action1", "action2"],
    "watch_points": ["what to monitor"],
    "success_criteria": ["criterion1", "criterion2"]
  }
}

Be precise, actionable, and focus on enabling seamless execution without distorting the strategic vision.`,
        response_json_schema: {
          type: "object",
          properties: {
            integration_score: { type: "number" },
            cognitive_load_assessment: { type: "object" },
            vectorial_translation: { type: "object" },
            cognitive_clarification: { type: "object" },
            emotional_buffer: { type: "object" },
            coherence_audit: { type: "object" },
            hermes_synthesis: { type: "object" }
          }
        }
      });

      setIntegrationScore(result);
      handleModuleOutput("full_analysis", result);
    } catch (error) {
      console.error("HERMES analysis error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeModulesCount = Object.keys(hermesOutputs).filter(k => hermesOutputs[k]).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xl">HERMES</span>
                <p className="text-sm text-slate-400 font-normal">
                  Intermediação Cognitiva & Tradução Estratégica
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              {activeModulesCount > 0 && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {activeModulesCount} análises ativas
                </Badge>
              )}
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Codex CAIO.AI
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300 mb-4">
            Framework de ponte estruturada entre visão sistêmica de alto alcance e operações táticas.
            Garante que a visão não seja distorcida, o contexto seja compreendido e a estratégia seja implementada sem ruído.
          </p>
          
          {/* Full HERMES Analysis Button */}
          <Button
            onClick={runFullHermesAnalysis}
            disabled={!moduleOutputs || Object.keys(moduleOutputs).length === 0 || isProcessing}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processando Análise HERMES Completa...</>
            ) : (
              <><Shield className="w-4 h-4 mr-2" />Executar Análise HERMES Integrada</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Integration Score Display */}
      {integrationScore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              {/* Main Score */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Score de Integração HERMES</h3>
                  <p className="text-sm text-slate-400">Qualidade da tradução visão → execução</p>
                </div>
                <div className="text-center">
                  <p className={`text-4xl font-bold ${
                    integrationScore.integration_score >= 80 ? 'text-green-400' :
                    integrationScore.integration_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {integrationScore.integration_score}%
                  </p>
                </div>
              </div>

              {/* Sub-scores Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                  <Compass className="w-5 h-5 text-cyan-400 mb-2" />
                  <p className="text-xs text-slate-400">Coerência Vectorial</p>
                  <p className="text-xl font-bold text-white">
                    {integrationScore.vectorial_translation?.vector_coherence_score || 0}%
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <Brain className="w-5 h-5 text-purple-400 mb-2" />
                  <p className="text-xs text-slate-400">Prontidão Execução</p>
                  <p className="text-xl font-bold text-white">
                    {integrationScore.cognitive_clarification?.execution_readiness_score || 0}%
                  </p>
                </div>
                <div className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/30">
                  <Heart className="w-5 h-5 text-pink-400 mb-2" />
                  <p className="text-xs text-slate-400">Pontos de Fricção</p>
                  <p className="text-xl font-bold text-white">
                    {integrationScore.emotional_buffer?.potential_friction_points?.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <Eye className="w-5 h-5 text-amber-400 mb-2" />
                  <p className="text-xs text-slate-400">Alinhamento Visão</p>
                  <p className="text-xl font-bold text-white">
                    {integrationScore.coherence_audit?.vision_alignment_score || 0}%
                  </p>
                </div>
              </div>

              {/* HERMES Synthesis */}
              {integrationScore.hermes_synthesis && (
                <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-400 mb-1">Síntese HERMES</p>
                        <p className="text-sm text-white">{integrationScore.hermes_synthesis.key_message}</p>
                        
                        {integrationScore.hermes_synthesis.immediate_actions?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-amber-500/20">
                            <p className="text-xs text-amber-400 mb-2">Ações Imediatas:</p>
                            {integrationScore.hermes_synthesis.immediate_actions.map((action, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-slate-300 mb-1">
                                <ArrowRight className="w-3 h-3 text-amber-400 mt-0.5" />
                                {action}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* HERMES Sub-Modules */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <Tabs value={activeModule} onValueChange={setActiveModule}>
            <TabsList className="flex flex-wrap gap-2 bg-transparent mb-6 h-auto">
              {HERMES_MODULES.map((module) => {
                const Icon = module.icon;
                const hasOutput = hermesOutputs[module.id];
                return (
                  <TabsTrigger
                    key={module.id}
                    value={module.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all 
                      data-[state=active]:border-amber-500/50 data-[state=active]:bg-amber-500/10 
                      border-white/10 bg-white/5 ${hasOutput ? 'ring-1 ring-green-500/50' : ''}`}
                  >
                    <Icon className={`w-4 h-4 text-${module.color}-400`} />
                    <span className="text-xs font-medium text-white">{module.name}</span>
                    {hasOutput && <CheckCircle className="w-3 h-3 text-green-400" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="h1">
              <H1VectorialTranslation 
                onTranslationComplete={(data) => handleModuleOutput("h1", data)}
                moduleOutputs={moduleOutputs}
              />
            </TabsContent>

            <TabsContent value="h2">
              <H2CognitiveClarity 
                onClarificationComplete={(data) => handleModuleOutput("h2", data)}
                moduleOutputs={moduleOutputs}
              />
            </TabsContent>

            <TabsContent value="h3">
              <H3EmotionalBuffer 
                onBufferComplete={(data) => handleModuleOutput("h3", data)}
                moduleOutputs={moduleOutputs}
              />
            </TabsContent>

            <TabsContent value="h4">
              <H4CoherenceAudit 
                onAuditComplete={(data) => handleModuleOutput("h4", data)}
                moduleOutputs={moduleOutputs}
                hermesOutputs={hermesOutputs}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}