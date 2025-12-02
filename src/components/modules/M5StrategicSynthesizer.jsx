import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, Loader2, Sparkles, Target, TrendingUp, DollarSign, AlertTriangle, CheckCircle, ArrowRight, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function M5StrategicSynthesizer({ onSynthesisComplete }) {
  const [context, setContext] = useState("");
  const [objective, setObjective] = useState("");
  const [constraints, setConstraints] = useState("");
  const [stakeholder, setStakeholder] = useState("ceo");
  const [isProcessing, setIsProcessing] = useState(false);
  const [synthesis, setSynthesis] = useState(null);

  const generateStrategicSynthesis = async () => {
    if (!context) return;
    
    setIsProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior strategic advisor at McKinsey level. Generate a comprehensive strategic synthesis based on:

Strategic Context:
${context}

Primary Objective: ${objective || "Maximize enterprise value"}
Key Constraints: ${constraints || "None specified"}
Primary Stakeholder: ${stakeholder.toUpperCase()}

Generate synthesis in the following JSON format:
{
  "executive_summary": "2-3 sentence synthesis of the strategic situation",
  "strategic_options": [
    {
      "id": 1,
      "name": "option name",
      "type": "offensive|defensive|transformational|opportunistic",
      "description": "detailed description",
      "strategic_fit_score": 0-100,
      "implementation_complexity": "low|medium|high",
      "time_to_value_months": 12,
      "investment_required": "$X.XM",
      "expected_roi": "XX%",
      "risk_level": "low|medium|high",
      "key_success_factors": ["factor1", "factor2"],
      "potential_blockers": ["blocker1", "blocker2"],
      "quick_wins": ["win1", "win2"],
      "frameworks_applied": ["EVA", "CSI", "VTE"]
    }
  ],
  "recommended_option": {
    "id": 1,
    "rationale": "why this is the recommended path",
    "confidence_score": 0-100
  },
  "impact_assessment": {
    "revenue_impact": "+XX%",
    "cost_impact": "-XX%",
    "market_position_change": "description",
    "competitive_advantage_gained": "description"
  },
  "critical_decisions": [
    {
      "decision": "what needs to be decided",
      "deadline": "when",
      "decision_maker": "who",
      "options": ["option1", "option2"],
      "recommendation": "which option to choose"
    }
  ],
  "implementation_priorities": [
    {
      "priority": 1,
      "action": "what to do",
      "owner": "who should own this",
      "timeline": "when",
      "dependencies": ["dependency1"]
    }
  ],
  "risk_mitigation": {
    "strategic_risks": ["risk1", "risk2"],
    "mitigation_actions": ["action1", "action2"],
    "contingency_triggers": ["trigger1", "trigger2"]
  },
  "stakeholder_messaging": {
    "board": "key message for board",
    "ceo": "key message for CEO",
    "management": "key message for management team",
    "employees": "key message for organization"
  }
}

Apply EVA (Enterprise Value Architecture), CSI (Competitive Strategic Intelligence), and VTE (Value-to-Execution) frameworks. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            strategic_options: { type: "array", items: { type: "object" } },
            recommended_option: { type: "object" },
            impact_assessment: { type: "object" },
            critical_decisions: { type: "array", items: { type: "object" } },
            implementation_priorities: { type: "array", items: { type: "object" } },
            risk_mitigation: { type: "object" },
            stakeholder_messaging: { type: "object" }
          }
        },
        add_context_from_internet: true
      });

      setSynthesis(result);
      onSynthesisComplete?.(result);
    } catch (error) {
      console.error("Error generating synthesis:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "offensive": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "defensive": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "transformational": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "opportunistic": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-slate-400";
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          M5 Strategic Synthesis Engine
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            CORE MODULE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Strategic Context *</label>
          <Textarea
            placeholder="Describe the strategic situation, market context, company position, key challenges, and opportunities..."
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

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Primary Stakeholder</label>
          <Select value={stakeholder} onValueChange={setStakeholder}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="board">Board of Directors</SelectItem>
              <SelectItem value="ceo">CEO</SelectItem>
              <SelectItem value="cfo">CFO</SelectItem>
              <SelectItem value="coo">COO</SelectItem>
              <SelectItem value="management">Management Team</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={generateStrategicSynthesis}
          disabled={!context || isProcessing}
          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Synthesizing Strategic Options...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Strategic Synthesis
            </>
          )}
        </Button>

        {synthesis && (
          <div className="space-y-4 mt-6">
            {/* Executive Summary */}
            <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Executive Summary
                </h3>
                <p className="text-slate-200">{synthesis.executive_summary}</p>
              </CardContent>
            </Card>

            {/* Strategic Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                Strategic Options Identified
              </h4>
              {synthesis.strategic_options?.map((option, idx) => {
                const isRecommended = synthesis.recommended_option?.id === option.id;
                return (
                  <Card 
                    key={idx} 
                    className={`bg-white/5 border-white/10 ${isRecommended ? 'ring-2 ring-yellow-500/50' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isRecommended && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              <Star className="w-3 h-3 mr-1" />
                              RECOMMENDED
                            </Badge>
                          )}
                          <h5 className="font-semibold text-white">{option.name}</h5>
                          <Badge className={getTypeColor(option.type)}>{option.type}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Strategic Fit</p>
                          <p className="text-lg font-bold text-cyan-400">{option.strategic_fit_score}/100</p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-300 mb-4">{option.description}</p>

                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="text-center p-2 bg-white/5 rounded">
                          <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-400">Investment</p>
                          <p className="text-sm font-medium text-white">{option.investment_required}</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded">
                          <TrendingUp className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-400">Expected ROI</p>
                          <p className="text-sm font-medium text-white">{option.expected_roi}</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded">
                          <AlertTriangle className={`w-4 h-4 mx-auto mb-1 ${getRiskColor(option.risk_level)}`} />
                          <p className="text-xs text-slate-400">Risk Level</p>
                          <p className={`text-sm font-medium capitalize ${getRiskColor(option.risk_level)}`}>{option.risk_level}</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded">
                          <Target className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-400">Time to Value</p>
                          <p className="text-sm font-medium text-white">{option.time_to_value_months} mo</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-green-400 mb-1">Key Success Factors</p>
                          <ul className="text-xs text-slate-300 space-y-1">
                            {option.key_success_factors?.slice(0, 2).map((f, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs text-yellow-400 mb-1">Quick Wins</p>
                          <ul className="text-xs text-slate-300 space-y-1">
                            {option.quick_wins?.slice(0, 2).map((w, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <ArrowRight className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {option.frameworks_applied?.map((f, i) => (
                          <Badge key={i} className="bg-purple-500/20 text-purple-400 text-xs">{f}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recommended Option Rationale */}
            {synthesis.recommended_option && (
              <Card className="bg-yellow-500/10 border-yellow-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-yellow-400">Recommendation Rationale</h4>
                    <Badge className="bg-yellow-500/20 text-yellow-300">
                      {synthesis.recommended_option.confidence_score}% Confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-200">{synthesis.recommended_option.rationale}</p>
                </CardContent>
              </Card>
            )}

            {/* Impact Assessment */}
            {synthesis.impact_assessment && (
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-green-400 mb-3">Expected Impact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Revenue Impact</p>
                      <p className="text-xl font-bold text-green-400">{synthesis.impact_assessment.revenue_impact}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Cost Impact</p>
                      <p className="text-xl font-bold text-blue-400">{synthesis.impact_assessment.cost_impact}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-1">Competitive Advantage Gained</p>
                    <p className="text-sm text-slate-200">{synthesis.impact_assessment.competitive_advantage_gained}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Implementation Priorities */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Implementation Priorities</h4>
                <div className="space-y-2">
                  {synthesis.implementation_priorities?.map((priority, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                        {priority.priority}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{priority.action}</p>
                        <p className="text-xs text-slate-400">Owner: {priority.owner} | {priority.timeline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stakeholder Messaging */}
            {synthesis.stakeholder_messaging && (
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-purple-400 mb-3">Stakeholder Messaging</h4>
                  <div className="space-y-2">
                    {Object.entries(synthesis.stakeholder_messaging).map(([stakeholder, message]) => (
                      <div key={stakeholder} className="p-2 bg-white/5 rounded">
                        <p className="text-xs text-purple-400 uppercase mb-1">{stakeholder}</p>
                        <p className="text-sm text-slate-200">{message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}