import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Sparkles, AlertTriangle, CheckCircle, Brain, 
  TrendingUp, Target, Zap, MessageSquare, ArrowRight,
  ShieldAlert, Lightbulb, RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const MODULE_NAMES = {
  m1: "Market Intelligence",
  m2: "Competitive Intel",
  m3: "Tech & Innovation",
  m4: "Financial Model",
  m5: "Strategic Synthesis",
  m6: "Opportunity Matrix",
  m7: "Implementation",
  m8: "Maieutic Reframing",
  m9: "Funding Intel",
  m10: "Behavioral Intel",
  m11: "Hermes Governance"
};

export default function StrategyCoach({ moduleOutputs, onRecommendation }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [coachInsights, setCoachInsights] = useState(null);
  const [expandedSection, setExpandedSection] = useState("conflicts");
  const [lastAnalyzedCount, setLastAnalyzedCount] = useState(0);

  const availableModules = Object.keys(moduleOutputs || {}).filter(k => moduleOutputs[k]);
  const hasNewData = availableModules.length > lastAnalyzedCount;

  const runCoachAnalysis = async () => {
    if (availableModules.length < 2) return;

    setIsAnalyzing(true);
    try {
      const moduleData = availableModules.map(m => ({
        module: m.toUpperCase(),
        name: MODULE_NAMES[m],
        output: JSON.stringify(moduleOutputs[m]).slice(0, 3000)
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an elite Strategy Coach AI that provides meta-level strategic guidance across all analytical modules. Your role is to:
1. Identify conflicts and contradictions between module outputs
2. Suggest synergistic actions that leverage combined insights
3. Provide cumulative strategic recommendations

Analyze the following module outputs:
${moduleData.map(m => `\n### ${m.module} (${m.name}):\n${m.output}`).join('\n')}

Generate comprehensive coaching insights in the following JSON format:
{
  "strategic_health_score": 0-100,
  "conflicts_detected": [
    {
      "id": 1,
      "severity": "critical|high|medium|low",
      "modules_involved": ["M5", "M6"],
      "conflict_type": "risk_appetite|timeline|resource|narrative|financial",
      "description": "Clear description of the conflict",
      "specific_data_points": {
        "module1": {"point": "what M5 says", "implication": "what it means"},
        "module2": {"point": "what M6 says", "implication": "what it means"}
      },
      "resolution_options": [
        {"option": "resolution 1", "trade_off": "what you give up", "recommended": true},
        {"option": "resolution 2", "trade_off": "what you give up", "recommended": false}
      ],
      "if_unresolved": "consequence of not addressing"
    }
  ],
  "synergy_opportunities": [
    {
      "id": 1,
      "impact_score": 0-100,
      "modules_to_combine": ["M10", "M9"],
      "synergy_type": "data_enrichment|narrative_alignment|execution_optimization|risk_hedging",
      "title": "Brief synergy title",
      "description": "How these modules can work together",
      "action_plan": [
        {"step": 1, "action": "specific action", "owner": "suggested role"},
        {"step": 2, "action": "next action", "owner": "suggested role"}
      ],
      "expected_outcome": "what this achieves",
      "quick_win": true
    }
  ],
  "cumulative_recommendations": [
    {
      "priority": 1,
      "category": "strategic|tactical|operational",
      "recommendation": "Clear strategic recommendation",
      "rationale": "Why this matters based on combined analysis",
      "supporting_modules": ["M1", "M2", "M5"],
      "confidence": 0-100,
      "timeframe": "immediate|short_term|medium_term|long_term",
      "kpis": ["KPI to track 1", "KPI to track 2"]
    }
  ],
  "strategic_narrative": {
    "current_state": "synthesis of where the organization stands",
    "key_opportunities": ["opportunity 1", "opportunity 2"],
    "critical_risks": ["risk 1", "risk 2"],
    "recommended_focus": "what to prioritize now",
    "watchpoints": ["what to monitor"]
  },
  "module_gaps": [
    {
      "missing_module": "M4",
      "why_needed": "reason this would help",
      "questions_it_would_answer": ["question 1", "question 2"]
    }
  ],
  "next_actions": [
    {
      "action": "immediate action to take",
      "urgency": "now|this_week|this_month",
      "rationale": "why now"
    }
  ],
  "coach_message": "A brief, personalized strategic coaching message summarizing the most important insight"
}

Be specific, actionable, and focus on creating strategic value through integration.`,
        response_json_schema: {
          type: "object",
          properties: {
            strategic_health_score: { type: "number" },
            conflicts_detected: { type: "array", items: { type: "object" } },
            synergy_opportunities: { type: "array", items: { type: "object" } },
            cumulative_recommendations: { type: "array", items: { type: "object" } },
            strategic_narrative: { type: "object" },
            module_gaps: { type: "array", items: { type: "object" } },
            next_actions: { type: "array", items: { type: "object" } },
            coach_message: { type: "string" }
          }
        }
      });

      setCoachInsights(result);
      setLastAnalyzedCount(availableModules.length);
      
      // Persist insights for the Insights Dashboard
      localStorage.setItem('caio_insights_data', JSON.stringify(result));
      
      onRecommendation?.(result);
    } catch (error) {
      console.error("Error running coach analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg">AI Strategy Coach</span>
              <p className="text-xs text-slate-400 font-normal">Meta-layer strategic intelligence</p>
            </div>
          </div>
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            {availableModules.length} modules
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Modules Overview */}
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(MODULE_NAMES).map(m => (
            <Badge 
              key={m} 
              className={`text-xs ${moduleOutputs?.[m] ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-slate-500 border-white/10'}`}
            >
              {m.toUpperCase()}
            </Badge>
          ))}
        </div>

        <Button
          onClick={runCoachAnalysis}
          disabled={availableModules.length < 2 || isAnalyzing}
          className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700"
        >
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing Strategic Coherence...</>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              {hasNewData ? "Update Coach Analysis" : "Run Strategy Coach"}
              {hasNewData && <RefreshCw className="w-3 h-3 ml-2" />}
            </>
          )}
        </Button>

        {coachInsights && (
          <div className="space-y-4 mt-4">
            {/* Coach Message */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30"
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-indigo-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium mb-1">Coach's Insight</p>
                  <p className="text-sm text-slate-300">{coachInsights.coach_message}</p>
                </div>
              </div>
            </motion.div>

            {/* Strategic Health Score */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Strategic Health Score</span>
                  <span className={`text-2xl font-bold ${getHealthColor(coachInsights.strategic_health_score)}`}>
                    {coachInsights.strategic_health_score}%
                  </span>
                </div>
                <Progress value={coachInsights.strategic_health_score} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Critical Issues</span>
                  <span>Optimal Alignment</span>
                </div>
              </CardContent>
            </Card>

            {/* Conflicts Section */}
            {coachInsights.conflicts_detected?.length > 0 && (
              <Card className="bg-red-500/5 border-red-500/20">
                <CardContent className="p-4">
                  <button
                    onClick={() => setExpandedSection(expandedSection === "conflicts" ? null : "conflicts")}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Conflicts Detected ({coachInsights.conflicts_detected.length})
                    </h4>
                    {expandedSection === "conflicts" ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSection === "conflicts" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        {coachInsights.conflicts_detected.map((conflict, idx) => (
                          <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {conflict.modules_involved?.map((m, i) => (
                                  <React.Fragment key={i}>
                                    <Badge className="bg-white/10 text-white text-xs">{m}</Badge>
                                    {i < conflict.modules_involved.length - 1 && <span className="text-red-400">⚡</span>}
                                  </React.Fragment>
                                ))}
                              </div>
                              <Badge className={getSeverityColor(conflict.severity)}>{conflict.severity}</Badge>
                            </div>
                            <p className="text-sm text-white mb-2">{conflict.description}</p>
                            
                            {conflict.resolution_options?.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-white/10">
                                <p className="text-xs text-slate-400 mb-1">Resolutions:</p>
                                {conflict.resolution_options.map((res, i) => (
                                  <div key={i} className={`flex items-start gap-2 text-xs p-1.5 rounded ${res.recommended ? 'bg-green-500/10' : ''}`}>
                                    {res.recommended && <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />}
                                    <span className="text-slate-300">{res.option}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {/* Synergy Opportunities */}
            {coachInsights.synergy_opportunities?.length > 0 && (
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="p-4">
                  <button
                    onClick={() => setExpandedSection(expandedSection === "synergies" ? null : "synergies")}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Synergy Opportunities ({coachInsights.synergy_opportunities.length})
                    </h4>
                    {expandedSection === "synergies" ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSection === "synergies" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        {coachInsights.synergy_opportunities.map((synergy, idx) => (
                          <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {synergy.modules_to_combine?.map((m, i) => (
                                  <React.Fragment key={i}>
                                    <Badge className="bg-green-500/20 text-green-400 text-xs">{m}</Badge>
                                    {i < synergy.modules_to_combine.length - 1 && <span className="text-green-400">+</span>}
                                  </React.Fragment>
                                ))}
                                {synergy.quick_win && (
                                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Quick Win</Badge>
                                )}
                              </div>
                              <span className="text-sm font-bold text-green-400">{synergy.impact_score}%</span>
                            </div>
                            <p className="text-sm text-white font-medium">{synergy.title}</p>
                            <p className="text-xs text-slate-400 mt-1">{synergy.description}</p>
                            
                            {synergy.action_plan?.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-white/10">
                                <p className="text-xs text-green-400 mb-1">Action Plan:</p>
                                {synergy.action_plan.slice(0, 2).map((step, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                                    <span className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">{step.step}</span>
                                    {step.action}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {/* Strategic Recommendations */}
            {coachInsights.cumulative_recommendations?.length > 0 && (
              <Card className="bg-indigo-500/5 border-indigo-500/20">
                <CardContent className="p-4">
                  <button
                    onClick={() => setExpandedSection(expandedSection === "recommendations" ? null : "recommendations")}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <h4 className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Strategic Recommendations ({coachInsights.cumulative_recommendations.length})
                    </h4>
                    {expandedSection === "recommendations" ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSection === "recommendations" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        {coachInsights.cumulative_recommendations.map((rec, idx) => (
                          <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                                #{rec.priority} Priority
                              </Badge>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-white/10 text-slate-300 text-xs">{rec.timeframe?.replace(/_/g, ' ')}</Badge>
                                <span className="text-xs text-slate-400">{rec.confidence}% confidence</span>
                              </div>
                            </div>
                            <p className="text-sm text-white font-medium">{rec.recommendation}</p>
                            <p className="text-xs text-slate-400 mt-1">{rec.rationale}</p>
                            {rec.kpis?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {rec.kpis.map((kpi, i) => (
                                  <Badge key={i} className="bg-white/5 text-slate-400 text-xs">{kpi}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {/* Strategic Narrative */}
            {coachInsights.strategic_narrative && (
              <Card className="bg-purple-500/5 border-purple-500/20">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Strategic Narrative
                  </h4>
                  <p className="text-sm text-slate-300 mb-3">{coachInsights.strategic_narrative.current_state}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-green-500/10 rounded">
                      <p className="text-xs text-green-400 font-medium mb-1">Key Opportunities</p>
                      {coachInsights.strategic_narrative.key_opportunities?.slice(0, 2).map((opp, i) => (
                        <p key={i} className="text-xs text-slate-300">• {opp}</p>
                      ))}
                    </div>
                    <div className="p-2 bg-red-500/10 rounded">
                      <p className="text-xs text-red-400 font-medium mb-1">Critical Risks</p>
                      {coachInsights.strategic_narrative.critical_risks?.slice(0, 2).map((risk, i) => (
                        <p key={i} className="text-xs text-slate-300">• {risk}</p>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-purple-500/10 rounded">
                    <p className="text-xs text-purple-400 font-medium">Recommended Focus</p>
                    <p className="text-sm text-white">{coachInsights.strategic_narrative.recommended_focus}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Actions */}
            {coachInsights.next_actions?.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/30">
                <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Immediate Actions
                </h4>
                <div className="space-y-2">
                  {coachInsights.next_actions.slice(0, 3).map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-white">{action.action}</p>
                        <p className="text-xs text-slate-400">{action.urgency} - {action.rationale}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Module Gaps */}
            {coachInsights.module_gaps?.length > 0 && (
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-xs text-slate-400 mb-2">Run these modules for deeper insights:</p>
                <div className="flex flex-wrap gap-2">
                  {coachInsights.module_gaps.map((gap, idx) => (
                    <Badge key={idx} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {gap.missing_module} - {gap.why_needed}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}