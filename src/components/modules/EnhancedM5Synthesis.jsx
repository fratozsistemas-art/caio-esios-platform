import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Lightbulb, Loader2, Sparkles, Target, TrendingUp, DollarSign, 
  AlertTriangle, CheckCircle, ArrowRight, Star, Brain, Scale,
  Zap, GitMerge, Layers, Eye, Shield, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

/**
 * Enhanced M5 Strategic Synthesis Engine
 * 
 * Implements full M5 capabilities with Mental Model activation:
 * - EVA (Enterprise Value Architecture) → EAA Meta-Capability
 * - CSI (Competitive Strategic Intelligence) → IDC Meta-Capability  
 * - VTE (Value-to-Execution) → TV Meta-Capability
 * - CAIO (Core AI Operator) → Synthesis layer
 * 
 * Generates Options A, B, C + Hybrid with trade-off analysis
 */

const MENTAL_MODELS = [
  { id: 'EVA', name: 'Enterprise Value Architecture', description: 'Antifragile positioning & resilience', color: 'green' },
  { id: 'CSI', name: 'Competitive Strategic Intelligence', description: 'Paradox resolution & integration', color: 'blue' },
  { id: 'VTE', name: 'Value-to-Execution', description: 'Vision synthesis & transformation', color: 'purple' },
  { id: 'CAIO', name: 'Core AI Operator', description: 'Strategic modeling & architecture', color: 'cyan' }
];

const STAKEHOLDER_LEVELS = [
  { id: 'board', name: 'Board of Directors', depth: 7 },
  { id: 'ceo', name: 'CEO', depth: 6 },
  { id: 'cfo', name: 'CFO', depth: 5 },
  { id: 'coo', name: 'COO', depth: 5 },
  { id: 'management', name: 'Management Team', depth: 4 },
  { id: 'operational', name: 'Operational Leaders', depth: 3 }
];

export default function EnhancedM5Synthesis({ onSynthesisComplete }) {
  const [context, setContext] = useState("");
  const [objective, setObjective] = useState("");
  const [constraints, setConstraints] = useState("");
  const [stakeholder, setStakeholder] = useState("ceo");
  const [activatedModels, setActivatedModels] = useState(['EVA', 'CSI', 'VTE', 'CAIO']);
  const [timeHorizon, setTimeHorizon] = useState("12");
  const [isProcessing, setIsProcessing] = useState(false);
  const [synthesis, setSynthesis] = useState(null);
  const [activeTab, setActiveTab] = useState("options");

  const toggleModel = (modelId) => {
    setActivatedModels(prev =>
      prev.includes(modelId) ? prev.filter(m => m !== modelId) : [...prev, modelId]
    );
  };

  const generateEnhancedSynthesis = async () => {
    if (!context) return;

    setIsProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the ENHANCED M5 Strategic Synthesis Engine with activated Mental Models.

═══════════════════════════════════════════════════════════════
STRATEGIC CONTEXT
═══════════════════════════════════════════════════════════════
${context}

Primary Objective: ${objective || "Maximize enterprise value"}
Key Constraints: ${constraints || "None specified"}
Primary Stakeholder: ${STAKEHOLDER_LEVELS.find(s => s.id === stakeholder)?.name || 'CEO'}
Time Horizon: ${timeHorizon} months
Activated Mental Models: ${activatedModels.join(', ')}

═══════════════════════════════════════════════════════════════
MENTAL MODEL ACTIVATION PROTOCOL
═══════════════════════════════════════════════════════════════
${activatedModels.includes('EVA') ? `
EVA (Enterprise Value Architecture) - ACTIVATED
- Apply antifragile positioning analysis
- Assess resilience architecture
- Evaluate value creation sustainability
` : ''}
${activatedModels.includes('CSI') ? `
CSI (Competitive Strategic Intelligence) - ACTIVATED
- Resolve strategic paradoxes
- Integrate multi-stakeholder perspectives
- Apply systems thinking to conflicts
` : ''}
${activatedModels.includes('VTE') ? `
VTE (Value-to-Execution) - ACTIVATED
- Synthesize transformational vision
- Detect paradigm shift opportunities
- Bridge vision to actionable execution
` : ''}
${activatedModels.includes('CAIO') ? `
CAIO (Core AI Operator) - ACTIVATED
- Apply strategic modeling
- Use 40+ native frameworks
- Generate depth-appropriate output for ${stakeholder}
` : ''}

═══════════════════════════════════════════════════════════════
REQUIRED OUTPUT: Generate 4 Strategic Options + Synthesis
═══════════════════════════════════════════════════════════════

Return comprehensive JSON:
{
  "synthesis_metadata": {
    "models_activated": ["EVA", "CSI", "VTE", "CAIO"],
    "stakeholder_level": "${stakeholder}",
    "depth_level": ${STAKEHOLDER_LEVELS.find(s => s.id === stakeholder)?.depth || 5},
    "time_horizon_months": ${timeHorizon},
    "confidence_score": 0-100
  },
  "executive_summary": "2-3 sentence synthesis for ${stakeholder}",
  "strategic_options": {
    "option_a": {
      "name": "Conservative Path",
      "type": "defensive",
      "description": "detailed description",
      "mental_models_applied": ["EVA"],
      "strategic_fit_score": 0-100,
      "risk_profile": {
        "overall_risk": 0-100,
        "execution_risk": 0-100,
        "market_risk": 0-100,
        "financial_risk": 0-100
      },
      "value_creation": {
        "revenue_impact": "+XX%",
        "cost_impact": "-XX%",
        "npv_estimate": "$XXM",
        "payback_months": XX
      },
      "implementation": {
        "complexity": "low|medium|high",
        "time_to_value_months": XX,
        "investment_required": "$XXM",
        "key_milestones": ["milestone1", "milestone2"],
        "critical_dependencies": ["dep1"]
      },
      "stakeholder_impact": {
        "board_alignment": 0-100,
        "management_buy_in": 0-100,
        "operational_readiness": 0-100
      },
      "key_success_factors": ["factor1", "factor2"],
      "potential_blockers": ["blocker1"],
      "quick_wins": ["win1", "win2"]
    },
    "option_b": {
      "name": "Balanced Growth",
      "type": "offensive",
      "description": "detailed description",
      "mental_models_applied": ["CSI", "EVA"],
      "strategic_fit_score": 0-100,
      "risk_profile": {},
      "value_creation": {},
      "implementation": {},
      "stakeholder_impact": {},
      "key_success_factors": [],
      "potential_blockers": [],
      "quick_wins": []
    },
    "option_c": {
      "name": "Transformational Leap",
      "type": "transformational",
      "description": "detailed description",
      "mental_models_applied": ["VTE", "CAIO"],
      "strategic_fit_score": 0-100,
      "risk_profile": {},
      "value_creation": {},
      "implementation": {},
      "stakeholder_impact": {},
      "key_success_factors": [],
      "potential_blockers": [],
      "quick_wins": []
    },
    "option_hybrid": {
      "name": "Optimized Hybrid",
      "type": "hybrid",
      "description": "Combination of best elements from A, B, C",
      "elements_from_a": ["element1"],
      "elements_from_b": ["element1"],
      "elements_from_c": ["element1"],
      "mental_models_applied": ["EVA", "CSI", "VTE", "CAIO"],
      "strategic_fit_score": 0-100,
      "synergy_score": 0-100,
      "risk_profile": {},
      "value_creation": {},
      "implementation": {},
      "stakeholder_impact": {},
      "integration_challenges": ["challenge1"],
      "mitigation_strategies": ["strategy1"]
    }
  },
  "trade_off_analysis": {
    "risk_vs_reward_matrix": [
      {"option": "A", "risk": 0-100, "reward": 0-100},
      {"option": "B", "risk": 0-100, "reward": 0-100},
      {"option": "C", "risk": 0-100, "reward": 0-100},
      {"option": "Hybrid", "risk": 0-100, "reward": 0-100}
    ],
    "time_vs_value_matrix": [
      {"option": "A", "time_months": XX, "value_score": 0-100},
      {"option": "B", "time_months": XX, "value_score": 0-100},
      {"option": "C", "time_months": XX, "value_score": 0-100},
      {"option": "Hybrid", "time_months": XX, "value_score": 0-100}
    ],
    "critical_trade_offs": [
      {"trade_off": "description", "favors_option": "A|B|C|Hybrid", "weight": 0-100}
    ]
  },
  "recommendation": {
    "primary_recommendation": "A|B|C|Hybrid",
    "confidence_score": 0-100,
    "rationale": "why this is recommended",
    "conditions_for_success": ["condition1", "condition2"],
    "fallback_option": "A|B|C",
    "trigger_for_fallback": "when to switch"
  },
  "mental_model_insights": {
    "EVA_insights": ["insight1", "insight2"],
    "CSI_insights": ["insight1", "insight2"],
    "VTE_insights": ["insight1", "insight2"],
    "CAIO_insights": ["insight1", "insight2"]
  },
  "implementation_roadmap": {
    "phase_1": {
      "name": "Foundation",
      "duration_weeks": XX,
      "key_actions": ["action1"],
      "success_criteria": ["criteria1"],
      "resources_required": ["resource1"]
    },
    "phase_2": {
      "name": "Acceleration",
      "duration_weeks": XX,
      "key_actions": ["action1"],
      "success_criteria": ["criteria1"]
    },
    "phase_3": {
      "name": "Scale",
      "duration_weeks": XX,
      "key_actions": ["action1"],
      "success_criteria": ["criteria1"]
    }
  },
  "stakeholder_messaging": {
    "board": "key message",
    "ceo": "key message",
    "cfo": "key message",
    "management": "key message",
    "employees": "key message"
  }
}`,
        response_json_schema: {
          type: "object",
          properties: {
            synthesis_metadata: { type: "object" },
            executive_summary: { type: "string" },
            strategic_options: { type: "object" },
            trade_off_analysis: { type: "object" },
            recommendation: { type: "object" },
            mental_model_insights: { type: "object" },
            implementation_roadmap: { type: "object" },
            stakeholder_messaging: { type: "object" }
          }
        },
        add_context_from_internet: true
      });

      setSynthesis(result);
      onSynthesisComplete?.(result);
      toast.success("Strategic synthesis completed!");
    } catch (error) {
      console.error("Synthesis error:", error);
      toast.error("Error generating synthesis");
    } finally {
      setIsProcessing(false);
    }
  };

  const getOptionColor = (type) => {
    switch (type) {
      case 'defensive': return { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' };
      case 'offensive': return { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400' };
      case 'transformational': return { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' };
      case 'hybrid': return { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' };
      default: return { bg: 'bg-slate-500/20', border: 'border-slate-500/30', text: 'text-slate-400' };
    }
  };

  // Prepare radar chart data for trade-off analysis
  const getRadarData = () => {
    if (!synthesis?.strategic_options) return [];
    const options = ['option_a', 'option_b', 'option_c', 'option_hybrid'];
    return [
      { subject: 'Strategic Fit', ...options.reduce((acc, opt) => ({ ...acc, [opt]: synthesis.strategic_options[opt]?.strategic_fit_score || 0 }), {}) },
      { subject: 'Risk Profile', ...options.reduce((acc, opt) => ({ ...acc, [opt]: 100 - (synthesis.strategic_options[opt]?.risk_profile?.overall_risk || 50) }), {}) },
      { subject: 'Value Creation', ...options.reduce((acc, opt) => ({ ...acc, [opt]: parseInt(synthesis.strategic_options[opt]?.value_creation?.revenue_impact?.replace(/[^0-9]/g, '') || 0) }), {}) },
      { subject: 'Stakeholder', ...options.reduce((acc, opt) => ({ ...acc, [opt]: synthesis.strategic_options[opt]?.stakeholder_impact?.board_alignment || 0 }), {}) },
      { subject: 'Speed', ...options.reduce((acc, opt) => ({ ...acc, [opt]: Math.max(0, 100 - (synthesis.strategic_options[opt]?.implementation?.time_to_value_months || 12) * 5) }), {}) }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl">M5 Enhanced Strategic Synthesis</span>
              <p className="text-sm text-slate-400 font-normal">
                Mental Models · Options A/B/C + Hybrid · Trade-off Analysis
              </p>
            </div>
            <Badge className="ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              v13.0
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Mental Model Activation */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Mental Model Activation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {MENTAL_MODELS.map((model) => (
              <div
                key={model.id}
                onClick={() => toggleModel(model.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  activatedModels.includes(model.id)
                    ? `bg-${model.color}-500/20 border border-${model.color}-500/50 ring-2 ring-${model.color}-500/30`
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Checkbox checked={activatedModels.includes(model.id)} />
                  <span className={`font-bold ${activatedModels.includes(model.id) ? `text-${model.color}-400` : 'text-white'}`}>
                    {model.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{model.name}</p>
                <p className="text-xs text-slate-500 mt-1">{model.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Strategic Context *</label>
            <Textarea
              placeholder="Describe the strategic situation, market context, company position, challenges, and opportunities..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="bg-white/5 border-white/10 text-white h-32"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Primary Objective</label>
              <Textarea
                placeholder="e.g., Double market share in 3 years..."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-20"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Key Constraints</label>
              <Textarea
                placeholder="e.g., Limited capital, regulatory restrictions..."
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Primary Stakeholder</label>
              <Select value={stakeholder} onValueChange={setStakeholder}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAKEHOLDER_LEVELS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} (Depth {s.depth})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Time Horizon (months)</label>
              <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                  <SelectItem value="36">36 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generateEnhancedSynthesis}
            disabled={!context || isProcessing || activatedModels.length === 0}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 py-6"
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Synthesizing with {activatedModels.length} Mental Models...</>
            ) : (
              <><GitMerge className="w-5 h-5 mr-2" />Generate Strategic Options (A, B, C + Hybrid)</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {synthesis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Executive Summary */}
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">Executive Summary</h3>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  {synthesis.synthesis_metadata?.confidence_score}% Confidence
                </Badge>
              </div>
              <p className="text-lg text-slate-200">{synthesis.executive_summary}</p>
              <div className="flex gap-2 mt-4">
                {synthesis.synthesis_metadata?.models_activated?.map((model) => (
                  <Badge key={model} className="bg-purple-500/20 text-purple-400">{model}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strategic Options Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10 grid grid-cols-5">
              <TabsTrigger value="options" className="data-[state=active]:bg-yellow-500/20">
                <Layers className="w-4 h-4 mr-2" />
                Options
              </TabsTrigger>
              <TabsTrigger value="tradeoffs" className="data-[state=active]:bg-purple-500/20">
                <Scale className="w-4 h-4 mr-2" />
                Trade-offs
              </TabsTrigger>
              <TabsTrigger value="recommendation" className="data-[state=active]:bg-green-500/20">
                <Target className="w-4 h-4 mr-2" />
                Recommendation
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-blue-500/20">
                <Brain className="w-4 h-4 mr-2" />
                Model Insights
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="data-[state=active]:bg-cyan-500/20">
                <ArrowRight className="w-4 h-4 mr-2" />
                Roadmap
              </TabsTrigger>
            </TabsList>

            {/* Options Tab */}
            <TabsContent value="options" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                {['option_a', 'option_b', 'option_c', 'option_hybrid'].map((optKey) => {
                  const option = synthesis.strategic_options?.[optKey];
                  if (!option) return null;
                  const colors = getOptionColor(option.type);
                  const isRecommended = synthesis.recommendation?.primary_recommendation?.toLowerCase() === optKey.split('_')[1];

                  return (
                    <Card key={optKey} className={`${colors.bg} ${colors.border} border ${isRecommended ? 'ring-2 ring-yellow-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {isRecommended && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                            <h4 className="font-bold text-white">{option.name}</h4>
                          </div>
                          <Badge className={colors.bg}>{option.type}</Badge>
                        </div>
                        <p className="text-sm text-slate-300 mb-4">{option.description?.slice(0, 150)}...</p>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="text-center p-2 bg-white/5 rounded">
                            <p className="text-xs text-slate-400">Strategic Fit</p>
                            <p className="text-lg font-bold text-cyan-400">{option.strategic_fit_score}/100</p>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <p className="text-xs text-slate-400">Risk</p>
                            <p className="text-lg font-bold text-orange-400">{option.risk_profile?.overall_risk}/100</p>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <p className="text-xs text-slate-400">Revenue Impact</p>
                            <p className="text-sm font-bold text-green-400">{option.value_creation?.revenue_impact}</p>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <p className="text-xs text-slate-400">Time to Value</p>
                            <p className="text-sm font-bold text-blue-400">{option.implementation?.time_to_value_months} mo</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {option.mental_models_applied?.map((m) => (
                            <Badge key={m} className="bg-purple-500/20 text-purple-400 text-xs">{m}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Trade-offs Tab */}
            <TabsContent value="tradeoffs" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Options Comparison Radar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getRadarData()}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                          <Radar name="Option A" dataKey="option_a" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                          <Radar name="Option B" dataKey="option_b" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                          <Radar name="Option C" dataKey="option_c" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                          <Radar name="Hybrid" dataKey="option_hybrid" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Critical Trade-offs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {synthesis.trade_off_analysis?.critical_trade_offs?.map((tradeoff, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white">{tradeoff.trade_off}</span>
                          <Badge className="bg-cyan-500/20 text-cyan-400">
                            Favors {tradeoff.favors_option}
                          </Badge>
                        </div>
                        <Progress value={tradeoff.weight} className="h-1" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Recommendation Tab */}
            <TabsContent value="recommendation" className="mt-4">
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-8 h-8 text-green-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        Recommended: Option {synthesis.recommendation?.primary_recommendation?.toUpperCase()}
                      </p>
                      <p className="text-sm text-slate-400">
                        Confidence: {synthesis.recommendation?.confidence_score}%
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-200 mb-4">{synthesis.recommendation?.rationale}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-green-400 mb-2">Conditions for Success</p>
                      {synthesis.recommendation?.conditions_for_success?.map((c, i) => (
                        <p key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          {c}
                        </p>
                      ))}
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-yellow-400 mb-2">Fallback Plan</p>
                      <p className="text-sm text-white mb-1">Option {synthesis.recommendation?.fallback_option?.toUpperCase()}</p>
                      <p className="text-xs text-slate-400">Trigger: {synthesis.recommendation?.trigger_for_fallback}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                {MENTAL_MODELS.filter(m => activatedModels.includes(m.id)).map((model) => (
                  <Card key={model.id} className={`bg-${model.color}-500/10 border-${model.color}-500/30`}>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-${model.color}-400 flex items-center gap-2`}>
                        <Brain className="w-5 h-5" />
                        {model.id} Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {synthesis.mental_model_insights?.[`${model.id}_insights`]?.map((insight, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-white/5 rounded">
                          <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-300">{insight}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Roadmap Tab */}
            <TabsContent value="roadmap" className="mt-4">
              <div className="grid grid-cols-3 gap-4">
                {['phase_1', 'phase_2', 'phase_3'].map((phaseKey) => {
                  const phase = synthesis.implementation_roadmap?.[phaseKey];
                  if (!phase) return null;
                  return (
                    <Card key={phaseKey} className="bg-white/5 border-white/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          <Badge className="bg-cyan-500/20 text-cyan-400">{phase.duration_weeks}w</Badge>
                          {phase.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Key Actions</p>
                          {phase.key_actions?.map((action, i) => (
                            <p key={i} className="text-sm text-slate-300 flex items-start gap-2">
                              <ArrowRight className="w-3 h-3 text-cyan-400 mt-1 flex-shrink-0" />
                              {action}
                            </p>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Success Criteria</p>
                          {phase.success_criteria?.map((criteria, i) => (
                            <p key={i} className="text-sm text-slate-300 flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                              {criteria}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}