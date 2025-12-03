import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Layers, Loader2, Sparkles, ArrowRight, Target, 
  CheckCircle, AlertTriangle, Clock, Zap, GitBranch,
  Box, Workflow, FileCode, Users
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * NIA — NÚCLEO DE INTELIGÊNCIA ARQUITETURAL
 * 
 * Transforma insights estratégicos em blueprints executáveis
 * Core function: Visão → Estruturas → Arquiteturas de Solução
 * 
 * Integração primária com M5 (Strategic Synthesis) e HERMES
 */

const BLUEPRINT_TYPES = [
  { value: "organizational", label: "Arquitetura Organizacional", icon: Users },
  { value: "technological", label: "Arquitetura Tecnológica", icon: FileCode },
  { value: "process", label: "Arquitetura de Processos", icon: Workflow },
  { value: "strategic", label: "Arquitetura Estratégica", icon: Target },
  { value: "hybrid", label: "Arquitetura Híbrida", icon: Box }
];

export default function NIACore({ onBlueprintComplete, moduleOutputs, hermesOutputs }) {
  const [strategicInput, setStrategicInput] = useState("");
  const [blueprintType, setBlueprintType] = useState("hybrid");
  const [complexityLevel, setComplexityLevel] = useState("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [blueprint, setBlueprint] = useState(null);

  const generateBlueprint = async () => {
    if (!strategicInput) return;
    
    setIsProcessing(true);
    try {
      const moduleContext = moduleOutputs ? 
        `\n\nContexto dos módulos TSI (M1-M11):\n${JSON.stringify(moduleOutputs, null, 2).slice(0, 2000)}` : '';
      
      const hermesContext = hermesOutputs ? 
        `\n\nAnálises HERMES:\n${JSON.stringify(hermesOutputs, null, 2).slice(0, 1500)}` : '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are NIA — Núcleo de Inteligência Arquitetural, a core cognitive module within CAIO.AI.

Your role is to transform strategic insights into executable blueprints and solution architectures. You bridge the gap between strategic vision and structural implementation.

STRATEGIC INPUT:
${strategicInput}

BLUEPRINT TYPE REQUESTED: ${blueprintType}
COMPLEXITY LEVEL: ${complexityLevel}
${moduleContext}
${hermesContext}

Generate a comprehensive architectural blueprint in JSON:
{
  "blueprint_id": "NIA-YYYY-MM-DD-XXX",
  "blueprint_score": 0-100,
  "blueprint_type": "${blueprintType}",
  "executive_summary": "2-3 sentence summary of the architectural solution",
  
  "strategic_foundations": {
    "core_objective": "what this architecture serves",
    "strategic_alignment": 0-100,
    "key_assumptions": ["assumption1", "assumption2"],
    "constraints_honored": ["constraint1", "constraint2"]
  },
  
  "architecture_layers": [
    {
      "layer_name": "layer name",
      "layer_type": "governance|capability|process|technology|data|integration",
      "purpose": "why this layer exists",
      "components": [
        {
          "component_id": "C1",
          "name": "component name",
          "description": "what it does",
          "dependencies": ["dependency1"],
          "owner_profile": "who should own this",
          "maturity_required": "basic|intermediate|advanced"
        }
      ],
      "interfaces": [
        {
          "from": "component_id",
          "to": "component_id",
          "interface_type": "data|control|event|service",
          "description": "what flows through"
        }
      ]
    }
  ],
  
  "capability_map": [
    {
      "capability": "capability name",
      "current_state": "none|basic|developing|mature|optimized",
      "target_state": "basic|developing|mature|optimized",
      "gap_severity": "critical|high|medium|low",
      "building_blocks": ["block1", "block2"],
      "timeline_to_target": "weeks|months|quarters"
    }
  ],
  
  "implementation_phases": [
    {
      "phase": 1,
      "name": "phase name",
      "duration": "X weeks/months",
      "objectives": ["objective1", "objective2"],
      "deliverables": [
        {
          "deliverable": "what to deliver",
          "type": "document|system|process|capability",
          "acceptance_criteria": "how to know it's done"
        }
      ],
      "dependencies": ["what must be done first"],
      "risks": ["risk1"],
      "resources_required": {
        "roles": ["role1", "role2"],
        "budget_estimate": "range",
        "tools": ["tool1"]
      }
    }
  ],
  
  "governance_structure": {
    "decision_rights": [
      {
        "decision_type": "type of decision",
        "decision_maker": "role",
        "consulted": ["role1"],
        "informed": ["role2"]
      }
    ],
    "escalation_path": ["level1", "level2", "level3"],
    "review_cadence": "weekly|bi-weekly|monthly",
    "kpis": [
      {
        "kpi": "metric name",
        "target": "target value",
        "measurement": "how to measure"
      }
    ]
  },
  
  "integration_points": [
    {
      "system": "system name",
      "integration_type": "api|event|batch|manual",
      "data_exchanged": ["data1", "data2"],
      "complexity": "low|medium|high",
      "prerequisites": ["prereq1"]
    }
  ],
  
  "risk_architecture": {
    "structural_risks": [
      {
        "risk": "risk description",
        "probability": "high|medium|low",
        "impact": "critical|high|medium|low",
        "mitigation": "how to address",
        "contingency": "if it happens"
      }
    ],
    "technical_debt_considerations": ["consideration1"],
    "scalability_concerns": ["concern1"]
  },
  
  "success_metrics": {
    "leading_indicators": ["indicator1", "indicator2"],
    "lagging_indicators": ["indicator1"],
    "milestone_checkpoints": [
      {
        "milestone": "milestone name",
        "target_date": "relative date",
        "success_criteria": "how to verify"
      }
    ]
  },
  
  "nia_synthesis": {
    "architectural_confidence": 0-100,
    "key_insight": "most important architectural insight",
    "critical_path": "the most important sequence to follow",
    "watch_points": ["what could derail this"],
    "next_step": "immediate next action"
  }
}

Be precise and actionable. Create architectures that can be executed.`,
        response_json_schema: {
          type: "object",
          properties: {
            blueprint_id: { type: "string" },
            blueprint_score: { type: "number" },
            blueprint_type: { type: "string" },
            executive_summary: { type: "string" },
            strategic_foundations: { type: "object" },
            architecture_layers: { type: "array", items: { type: "object" } },
            capability_map: { type: "array", items: { type: "object" } },
            implementation_phases: { type: "array", items: { type: "object" } },
            governance_structure: { type: "object" },
            integration_points: { type: "array", items: { type: "object" } },
            risk_architecture: { type: "object" },
            success_metrics: { type: "object" },
            nia_synthesis: { type: "object" }
          }
        }
      });

      setBlueprint(result);
      onBlueprintComplete?.(result);
    } catch (error) {
      console.error("NIA Blueprint error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStateColor = (state) => {
    const colors = {
      none: "bg-slate-500/20 text-slate-400",
      basic: "bg-red-500/20 text-red-400",
      developing: "bg-yellow-500/20 text-yellow-400",
      mature: "bg-green-500/20 text-green-400",
      optimized: "bg-cyan-500/20 text-cyan-400"
    };
    return colors[state] || "bg-white/10 text-white";
  };

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Layers className="w-5 h-5 text-blue-400" />
          NIA — Núcleo de Inteligência Arquitetural
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Codex CAIO.AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-300">
          Transforma insights estratégicos em blueprints executáveis e arquiteturas de solução.
        </p>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Input Estratégico (de M5, HERMES ou manual) *
          </label>
          <Textarea
            placeholder="Cole aqui a síntese estratégica, decisão vectorial ou insight que precisa ser transformado em arquitetura executável..."
            value={strategicInput}
            onChange={(e) => setStrategicInput(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-32"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Tipo de Blueprint</label>
            <Select value={blueprintType} onValueChange={setBlueprintType}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLUEPRINT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Nível de Complexidade</label>
            <Select value={complexityLevel} onValueChange={setComplexityLevel}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa (MVP/Piloto)</SelectItem>
                <SelectItem value="medium">Média (Implementação)</SelectItem>
                <SelectItem value="high">Alta (Enterprise)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={generateBlueprint}
          disabled={!strategicInput || isProcessing}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isProcessing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando Blueprint Arquitetural...</>
          ) : (
            <><Layers className="w-4 h-4 mr-2" />Gerar Blueprint NIA</>
          )}
        </Button>

        {blueprint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mt-4"
          >
            {/* Header & Score */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-xs text-slate-400">{blueprint.blueprint_id}</p>
                <p className="text-white font-semibold">{blueprint.executive_summary}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">{blueprint.blueprint_score}%</p>
                <p className="text-xs text-slate-400">Score</p>
              </div>
            </div>

            {/* NIA Synthesis */}
            {blueprint.nia_synthesis && (
              <Card className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Layers className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-400 mb-1">Síntese NIA</p>
                      <p className="text-sm text-white mb-2">{blueprint.nia_synthesis.key_insight}</p>
                      <div className="p-2 bg-white/10 rounded mt-2">
                        <p className="text-xs text-cyan-400">Caminho Crítico:</p>
                        <p className="text-sm text-white">{blueprint.nia_synthesis.critical_path}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {blueprint.nia_synthesis.architectural_confidence}% confiança
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Architecture Layers */}
            {blueprint.architecture_layers?.length > 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-indigo-400" />
                    Camadas Arquiteturais ({blueprint.architecture_layers.length})
                  </h4>
                  <div className="space-y-3">
                    {blueprint.architecture_layers.map((layer, idx) => (
                      <div key={idx} className="p-3 bg-indigo-500/10 rounded border border-indigo-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-white font-medium">{layer.layer_name}</h5>
                          <Badge className="bg-white/10 text-slate-300 text-xs">{layer.layer_type}</Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{layer.purpose}</p>
                        <div className="flex flex-wrap gap-1">
                          {layer.components?.slice(0, 4).map((comp, i) => (
                            <Badge key={i} className="bg-blue-500/20 text-blue-400 text-xs">
                              {comp.name}
                            </Badge>
                          ))}
                          {layer.components?.length > 4 && (
                            <Badge className="bg-white/10 text-slate-400 text-xs">
                              +{layer.components.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Capability Map */}
            {blueprint.capability_map?.length > 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-400" />
                    Mapa de Capacidades
                  </h4>
                  <div className="space-y-2">
                    {blueprint.capability_map.map((cap, idx) => (
                      <div key={idx} className="p-2 bg-white/5 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white">{cap.capability}</span>
                          <Badge className={`text-xs ${
                            cap.gap_severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            cap.gap_severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            Gap: {cap.gap_severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge className={getStateColor(cap.current_state)}>{cap.current_state}</Badge>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <Badge className={getStateColor(cap.target_state)}>{cap.target_state}</Badge>
                          <span className="text-slate-400 ml-auto">{cap.timeline_to_target}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Implementation Phases */}
            {blueprint.implementation_phases?.length > 0 && (
              <Card className="bg-cyan-500/10 border-cyan-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Fases de Implementação
                  </h4>
                  <div className="space-y-3">
                    {blueprint.implementation_phases.map((phase, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                              {phase.phase}
                            </div>
                            <span className="text-white font-medium">{phase.name}</span>
                          </div>
                          <Badge className="bg-white/10 text-slate-300 text-xs">{phase.duration}</Badge>
                        </div>
                        <div className="ml-8">
                          {phase.deliverables?.slice(0, 2).map((del, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300 mb-1">
                              <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                              {del.deliverable}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success Metrics */}
            {blueprint.success_metrics && (
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <h4 className="text-xs font-semibold text-green-400 mb-2">Métricas de Sucesso</h4>
                <div className="flex flex-wrap gap-2">
                  {blueprint.success_metrics.leading_indicators?.map((ind, i) => (
                    <Badge key={i} className="bg-green-500/20 text-green-400 text-xs">{ind}</Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}