import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FlaskConical, Play, RefreshCw, TrendingUp, TrendingDown, AlertTriangle,
  Target, Zap, BarChart3, GitBranch, Shield, DollarSign, Clock,
  Users, Building2, Globe, ArrowRight, CheckCircle, XCircle, Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import SimulationResultsPanel from "./SimulationResultsPanel";
import ScenarioComparisonView from "./ScenarioComparisonView";
import RiskBottleneckAnalyzer from "./RiskBottleneckAnalyzer";

/**
 * CAIO SIMULATION ENGINE
 * 
 * Advanced strategic simulation capabilities:
 * 1. What-if scenario modeling with multiple variables
 * 2. Outcome simulation with probability distributions
 * 3. Risk/reward analysis with Monte Carlo-style projections
 * 4. Bottleneck and unintended consequence identification
 * 5. Multi-scenario comparison
 */

const SIMULATION_TYPES = [
  { id: 'strategic_initiative', label: 'Iniciativa Estratégica', icon: Target, color: 'blue' },
  { id: 'market_entry', label: 'Entrada em Mercado', icon: Globe, color: 'emerald' },
  { id: 'product_launch', label: 'Lançamento de Produto', icon: Zap, color: 'purple' },
  { id: 'ma_scenario', label: 'Cenário M&A', icon: Building2, color: 'amber' },
  { id: 'cost_optimization', label: 'Otimização de Custos', icon: DollarSign, color: 'green' },
  { id: 'digital_transformation', label: 'Transformação Digital', icon: RefreshCw, color: 'cyan' },
  { id: 'organizational_change', label: 'Mudança Organizacional', icon: Users, color: 'pink' }
];

const EXTERNAL_FACTORS = [
  { id: 'market_growth', label: 'Crescimento de Mercado', range: [-20, 40], unit: '%', default: 5 },
  { id: 'competition_intensity', label: 'Intensidade Competitiva', range: [0, 100], unit: '', default: 50 },
  { id: 'regulatory_risk', label: 'Risco Regulatório', range: [0, 100], unit: '', default: 30 },
  { id: 'economic_conditions', label: 'Condições Econômicas', range: [-50, 50], unit: '', default: 0 },
  { id: 'technology_disruption', label: 'Disrupção Tecnológica', range: [0, 100], unit: '', default: 40 },
  { id: 'talent_availability', label: 'Disponibilidade de Talentos', range: [0, 100], unit: '', default: 60 }
];

const INTERNAL_VARIABLES = [
  { id: 'investment_level', label: 'Nível de Investimento', range: [0, 100], unit: 'M', default: 50 },
  { id: 'timeline_months', label: 'Timeline', range: [3, 36], unit: 'meses', default: 12 },
  { id: 'team_size', label: 'Tamanho da Equipe', range: [5, 200], unit: 'pessoas', default: 25 },
  { id: 'risk_tolerance', label: 'Tolerância a Risco', range: [0, 100], unit: '', default: 50 },
  { id: 'execution_speed', label: 'Velocidade de Execução', range: [0, 100], unit: '', default: 70 },
  { id: 'resource_allocation', label: 'Alocação de Recursos', range: [0, 100], unit: '%', default: 80 }
];

export default function CAIOSimulationEngine({ onSimulationComplete }) {
  const [activeTab, setActiveTab] = useState("setup");
  const [simulationType, setSimulationType] = useState('strategic_initiative');
  const [strategyDescription, setStrategyDescription] = useState('');
  const [externalFactors, setExternalFactors] = useState(
    Object.fromEntries(EXTERNAL_FACTORS.map(f => [f.id, f.default]))
  );
  const [internalVariables, setInternalVariables] = useState(
    Object.fromEntries(INTERNAL_VARIABLES.map(v => [v.id, v.default]))
  );
  const [advancedMode, setAdvancedMode] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [savedScenarios, setSavedScenarios] = useState([]);

  // Fetch historical data for context
  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies_for_simulation'],
    queryFn: () => base44.entities.Strategy.list('-created_date', 20)
  });

  const { data: decisions = [] } = useQuery({
    queryKey: ['decisions_for_simulation'],
    queryFn: () => base44.entities.VectorDecision.list('-created_date', 20)
  });

  const { data: memories = [] } = useQuery({
    queryKey: ['memories_for_simulation'],
    queryFn: () => base44.entities.InstitutionalMemory.list('-created_date', 30)
  });

  // Run simulation
  const runSimulation = async () => {
    if (!strategyDescription.trim()) {
      toast.error('Descreva a estratégia a ser simulada');
      return;
    }

    setIsSimulating(true);
    try {
      // Prepare historical context
      const historicalContext = {
        past_strategies: strategies.slice(0, 10).map(s => ({
          title: s.title,
          category: s.category,
          status: s.status,
          roi_estimate: s.roi_estimate
        })),
        past_decisions: decisions.slice(0, 10).map(d => ({
          title: d.title,
          status: d.status,
          direction: d.primary_vector?.direction
        })),
        lessons_learned: memories.filter(m => m.memory_type === 'lesson_learned').slice(0, 10).map(m => m.lessons)
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are CAIO's Strategic Simulation Engine. Run a comprehensive simulation for the following strategy:

STRATEGY DESCRIPTION:
"${strategyDescription}"

SIMULATION TYPE: ${SIMULATION_TYPES.find(t => t.id === simulationType)?.label}

EXTERNAL FACTORS:
${Object.entries(externalFactors).map(([k, v]) => `- ${EXTERNAL_FACTORS.find(f => f.id === k)?.label}: ${v}`).join('\n')}

INTERNAL VARIABLES:
${Object.entries(internalVariables).map(([k, v]) => `- ${INTERNAL_VARIABLES.find(f => f.id === k)?.label}: ${v}`).join('\n')}

HISTORICAL CONTEXT:
${JSON.stringify(historicalContext, null, 2)}

Run a comprehensive simulation and return JSON:
{
  "simulation_summary": {
    "scenario_name": "Name for this scenario",
    "viability_score": 0-100,
    "confidence_level": 0-100,
    "recommended_action": "proceed|proceed_with_caution|defer|abort",
    "executive_summary": "2-3 sentence summary"
  },
  "outcome_projections": {
    "best_case": {
      "probability": 0-100,
      "roi": "percentage",
      "timeline": "months",
      "description": "what happens",
      "key_success_factors": ["factor1", "factor2"]
    },
    "base_case": {
      "probability": 0-100,
      "roi": "percentage",
      "timeline": "months",
      "description": "what happens",
      "assumptions": ["assumption1", "assumption2"]
    },
    "worst_case": {
      "probability": 0-100,
      "roi": "percentage",
      "timeline": "months",
      "description": "what happens",
      "trigger_conditions": ["condition1", "condition2"]
    }
  },
  "risk_reward_analysis": {
    "expected_value": "calculated expected value",
    "risk_adjusted_return": 0-100,
    "sharpe_ratio_equivalent": 0-3,
    "downside_risk": 0-100,
    "upside_potential": 0-100,
    "risk_factors": [
      {
        "factor": "risk name",
        "probability": 0-100,
        "impact": "high|medium|low",
        "mitigation": "how to mitigate"
      }
    ],
    "opportunity_factors": [
      {
        "factor": "opportunity name",
        "probability": 0-100,
        "impact": "high|medium|low",
        "how_to_capture": "strategy"
      }
    ]
  },
  "bottleneck_analysis": {
    "critical_bottlenecks": [
      {
        "bottleneck": "description",
        "severity": "critical|high|medium|low",
        "phase": "when it occurs",
        "impact": "what happens if not addressed",
        "resolution": "how to resolve"
      }
    ],
    "resource_constraints": [
      {
        "resource": "type of resource",
        "current_capacity": "current state",
        "required_capacity": "what's needed",
        "gap": "the shortfall",
        "solution": "how to bridge"
      }
    ],
    "dependency_chain": ["dependency1 -> dependency2 -> dependency3"]
  },
  "unintended_consequences": [
    {
      "consequence": "description",
      "likelihood": 0-100,
      "severity": "high|medium|low",
      "type": "positive|negative|neutral",
      "affected_areas": ["area1", "area2"],
      "prevention_or_enhancement": "how to handle"
    }
  ],
  "sensitivity_analysis": {
    "most_sensitive_variables": [
      {
        "variable": "variable name",
        "sensitivity_score": 0-100,
        "impact_direction": "positive|negative|bidirectional",
        "threshold": "critical value"
      }
    ],
    "scenario_variations": [
      {
        "variation": "what changes",
        "impact_on_outcome": "description",
        "probability_shift": "+/- percentage"
      }
    ]
  },
  "implementation_roadmap": {
    "phases": [
      {
        "phase": "phase name",
        "duration": "weeks/months",
        "key_activities": ["activity1", "activity2"],
        "milestones": ["milestone1"],
        "decision_gates": ["gate1"],
        "resources_required": "brief description"
      }
    ],
    "critical_path": ["activity1", "activity2", "activity3"],
    "early_warning_indicators": ["indicator1", "indicator2"]
  },
  "strategic_recommendations": [
    {
      "recommendation": "what to do",
      "priority": "high|medium|low",
      "timing": "when",
      "expected_impact": "what it achieves",
      "dependencies": ["dependency1"]
    }
  ],
  "monte_carlo_summary": {
    "simulations_run": 1000,
    "success_rate": 0-100,
    "median_outcome": "description",
    "95th_percentile": "best outcomes",
    "5th_percentile": "worst outcomes",
    "variance": 0-100
  }
}`,
        response_json_schema: {
          type: "object",
          properties: {
            simulation_summary: { type: "object" },
            outcome_projections: { type: "object" },
            risk_reward_analysis: { type: "object" },
            bottleneck_analysis: { type: "object" },
            unintended_consequences: { type: "array", items: { type: "object" } },
            sensitivity_analysis: { type: "object" },
            implementation_roadmap: { type: "object" },
            strategic_recommendations: { type: "array", items: { type: "object" } },
            monte_carlo_summary: { type: "object" }
          }
        }
      });

      setSimulationResults({
        ...result,
        inputs: {
          strategy: strategyDescription,
          type: simulationType,
          external: externalFactors,
          internal: internalVariables
        },
        timestamp: new Date().toISOString()
      });
      
      setActiveTab("results");
      onSimulationComplete?.(result);
      toast.success('Simulação concluída!');
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Erro na simulação');
    } finally {
      setIsSimulating(false);
    }
  };

  // Save current scenario for comparison
  const saveScenario = () => {
    if (!simulationResults) return;
    
    setSavedScenarios(prev => [...prev, {
      id: Date.now(),
      name: simulationResults.simulation_summary?.scenario_name || `Cenário ${prev.length + 1}`,
      results: simulationResults,
      timestamp: new Date().toISOString()
    }]);
    toast.success('Cenário salvo para comparação');
  };

  const getTypeInfo = (typeId) => SIMULATION_TYPES.find(t => t.id === typeId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FlaskConical className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  CAIO Simulation Engine
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    v2.0
                  </Badge>
                </h2>
                <p className="text-sm text-slate-400">
                  Simulação estratégica avançada • Análise de cenários • Monte Carlo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Modo Avançado</span>
                <Switch checked={advancedMode} onCheckedChange={setAdvancedMode} />
              </div>
              {simulationResults && (
                <Button
                  variant="outline"
                  onClick={saveScenario}
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Salvar Cenário
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="setup" className="data-[state=active]:bg-blue-500/20">
            <Target className="w-4 h-4 mr-2" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-emerald-500/20" disabled={!simulationResults}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Resultados
          </TabsTrigger>
          <TabsTrigger value="risks" className="data-[state=active]:bg-red-500/20" disabled={!simulationResults}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Riscos & Gargalos
          </TabsTrigger>
          <TabsTrigger value="compare" className="data-[state=active]:bg-purple-500/20" disabled={savedScenarios.length < 2}>
            <GitBranch className="w-4 h-4 mr-2" />
            Comparar ({savedScenarios.length})
          </TabsTrigger>
        </TabsList>

        {/* SETUP TAB */}
        <TabsContent value="setup" className="mt-6 space-y-6">
          {/* Simulation Type */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">Tipo de Simulação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {SIMULATION_TYPES.map(type => {
                  const Icon = type.icon;
                  const isSelected = simulationType === type.id;
                  return (
                    <motion.div
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? `bg-${type.color}-500/20 border-${type.color}-500/50`
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                        onClick={() => setSimulationType(type.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className={`w-8 h-8 mx-auto mb-2 text-${type.color}-400`} />
                          <p className="text-sm text-white font-medium">{type.label}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Strategy Description */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">Descrição da Estratégia</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={strategyDescription}
                onChange={(e) => setStrategyDescription(e.target.value)}
                placeholder="Descreva a estratégia ou iniciativa que deseja simular em detalhes..."
                className="bg-white/5 border-white/10 text-white min-h-32"
              />
            </CardContent>
          </Card>

          {/* Variables Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* External Factors */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Fatores Externos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {EXTERNAL_FACTORS.map(factor => (
                  <div key={factor.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">{factor.label}</span>
                      <span className="text-sm text-white font-medium">
                        {externalFactors[factor.id]}{factor.unit}
                      </span>
                    </div>
                    <Slider
                      value={[externalFactors[factor.id]]}
                      onValueChange={([v]) => setExternalFactors(prev => ({ ...prev, [factor.id]: v }))}
                      min={factor.range[0]}
                      max={factor.range[1]}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Internal Variables */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Variáveis Internas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {INTERNAL_VARIABLES.map(variable => (
                  <div key={variable.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">{variable.label}</span>
                      <span className="text-sm text-white font-medium">
                        {internalVariables[variable.id]}{variable.unit && ` ${variable.unit}`}
                      </span>
                    </div>
                    <Slider
                      value={[internalVariables[variable.id]]}
                      onValueChange={([v]) => setInternalVariables(prev => ({ ...prev, [variable.id]: v }))}
                      min={variable.range[0]}
                      max={variable.range[1]}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Run Simulation Button */}
          <Button
            onClick={runSimulation}
            disabled={isSimulating || !strategyDescription.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg"
          >
            {isSimulating ? (
              <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Executando Simulação...</>
            ) : (
              <><Play className="w-5 h-5 mr-2" />Executar Simulação Estratégica</>
            )}
          </Button>
        </TabsContent>

        {/* RESULTS TAB */}
        <TabsContent value="results" className="mt-6">
          {simulationResults && (
            <SimulationResultsPanel results={simulationResults} />
          )}
        </TabsContent>

        {/* RISKS & BOTTLENECKS TAB */}
        <TabsContent value="risks" className="mt-6">
          {simulationResults && (
            <RiskBottleneckAnalyzer results={simulationResults} />
          )}
        </TabsContent>

        {/* COMPARE TAB */}
        <TabsContent value="compare" className="mt-6">
          {savedScenarios.length >= 2 && (
            <ScenarioComparisonView scenarios={savedScenarios} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}