import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shield, Loader2, Sparkles, AlertTriangle, CheckCircle, Scale, Eye, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function M11HermesGovernance({ onAnalysisComplete }) {
  const [strategicContext, setStrategicContext] = useState("");
  const [stakeholders, setStakeholders] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeGovernance = async () => {
    if (!strategicContext) return;
    
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Hermes, the Trust-Broker AI governing strategic integrity. Analyze:

Strategic Context:
${strategicContext}

Key Stakeholders:
${stakeholders || "Board, CEO, Management Team"}

Generate comprehensive governance analysis:

{
  "integrity_assessment": {
    "overall_score": 0-100,
    "narrative_consistency": 0-100,
    "strategic_alignment": 0-100,
    "stakeholder_trust": 0-100,
    "decision_traceability": 0-100
  },
  "inconsistencies_detected": [
    {
      "type": "narrative|data|strategic|communication",
      "description": "what inconsistency was found",
      "severity": "critical|high|medium|low",
      "source": "where it was detected",
      "impact": "potential impact on trust",
      "resolution": "recommended fix"
    }
  ],
  "stakeholder_alignment": [
    {
      "stakeholder": "Board|CEO|CFO|Management|Employees",
      "alignment_score": 0-100,
      "concerns": ["concern1", "concern2"],
      "communication_gaps": ["gap1"],
      "recommended_messaging": "how to communicate"
    }
  ],
  "board_management_bridge": {
    "current_state": "aligned|tension|misaligned",
    "key_tensions": ["tension1", "tension2"],
    "mediation_recommendations": ["recommendation1", "recommendation2"],
    "trust_building_actions": ["action1", "action2"]
  },
  "cognitive_bias_audit": [
    {
      "bias": "bias name",
      "detected_in": "where",
      "risk_level": "high|medium|low",
      "mitigation": "how to address"
    }
  ],
  "crv_scoring": {
    "credibility": 0-100,
    "reliability": 0-100,
    "validity": 0-100,
    "overall_crv": 0-100,
    "improvement_areas": ["area1", "area2"]
  },
  "governance_recommendations": [
    {
      "area": "governance area",
      "current_state": "description",
      "recommended_state": "description",
      "implementation_steps": ["step1", "step2"],
      "priority": "immediate|short-term|long-term"
    }
  ],
  "decision_audit_trail": {
    "traceability_score": 0-100,
    "gaps_identified": ["gap1", "gap2"],
    "documentation_recommendations": ["rec1", "rec2"]
  },
  "trust_forecast": {
    "30_day_outlook": "improving|stable|declining",
    "risk_events": ["event1", "event2"],
    "opportunities": ["opportunity1", "opportunity2"]
  }
}

Be thorough but constructive. Identify issues but always provide solutions.`,
        response_json_schema: {
          type: "object",
          properties: {
            integrity_assessment: { type: "object" },
            inconsistencies_detected: { type: "array", items: { type: "object" } },
            stakeholder_alignment: { type: "array", items: { type: "object" } },
            board_management_bridge: { type: "object" },
            cognitive_bias_audit: { type: "array", items: { type: "object" } },
            crv_scoring: { type: "object" },
            governance_recommendations: { type: "array", items: { type: "object" } },
            decision_audit_trail: { type: "object" },
            trust_forecast: { type: "object" }
          }
        },
        add_context_from_internet: false
      });

      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error("Error analyzing governance:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Shield className="w-5 h-5 text-amber-400" />
          M11 Hermes Trust-Broker
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Cognitive Governance
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Strategic Context *</label>
          <Textarea
            placeholder="Describe your current strategic situation, recent decisions, communications to stakeholders, and any concerns about alignment..."
            value={strategicContext}
            onChange={(e) => setStrategicContext(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-32"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Key Stakeholders</label>
          <Textarea
            placeholder="List key stakeholders and their roles: Board, CEO, CFO, Management, Investors..."
            value={stakeholders}
            onChange={(e) => setStakeholders(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-20"
          />
        </div>

        <Button
          onClick={analyzeGovernance}
          disabled={!strategicContext || isAnalyzing}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing Governance Integrity...</>
          ) : (
            <><Shield className="w-4 h-4 mr-2" />Run Hermes Analysis</>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4 mt-6">
            {/* Integrity Assessment */}
            {analysis.integrity_assessment && (
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-amber-400">Integrity Assessment</h4>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{analysis.integrity_assessment.overall_score}</p>
                      <p className="text-xs text-slate-400">Overall Score</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(analysis.integrity_assessment).filter(([k]) => k !== 'overall_score').map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-40 capitalize">{key.replace(/_/g, ' ')}</span>
                        <Progress value={value} className="flex-1 h-2" />
                        <span className={`text-sm font-bold ${getScoreColor(value)}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CRV Scoring */}
            {analysis.crv_scoring && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-400" />
                    CRV Trust Score
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-xs text-slate-400">Credibility</p>
                      <p className={`text-xl font-bold ${getScoreColor(analysis.crv_scoring.credibility)}`}>{analysis.crv_scoring.credibility}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-xs text-slate-400">Reliability</p>
                      <p className={`text-xl font-bold ${getScoreColor(analysis.crv_scoring.reliability)}`}>{analysis.crv_scoring.reliability}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-xs text-slate-400">Validity</p>
                      <p className={`text-xl font-bold ${getScoreColor(analysis.crv_scoring.validity)}`}>{analysis.crv_scoring.validity}</p>
                    </div>
                    <div className="p-2 bg-amber-500/20 rounded border border-amber-500/30">
                      <p className="text-xs text-amber-400">Overall CRV</p>
                      <p className="text-xl font-bold text-white">{analysis.crv_scoring.overall_crv}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inconsistencies */}
            {analysis.inconsistencies_detected?.length > 0 && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Inconsistencies Detected
                  </h4>
                  <div className="space-y-2">
                    {analysis.inconsistencies_detected.map((inc, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm text-white">{inc.description}</p>
                          <Badge className={getSeverityColor(inc.severity)}>{inc.severity}</Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">Source: {inc.source}</p>
                        <p className="text-xs text-green-400">→ Resolution: {inc.resolution}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Board-Management Bridge */}
            {analysis.board_management_bridge && (
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Board-Management Bridge
                  </h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-400">Current State:</span>
                    <Badge className={`${analysis.board_management_bridge.current_state === 'aligned' ? 'bg-green-500/20 text-green-400' : analysis.board_management_bridge.current_state === 'tension' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                      {analysis.board_management_bridge.current_state}
                    </Badge>
                  </div>
                  {analysis.board_management_bridge.key_tensions?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-red-400 mb-1">Key Tensions</p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {analysis.board_management_bridge.key_tensions.map((t, i) => (
                          <li key={i}>• {t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-green-400 mb-1">Trust-Building Actions</p>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {analysis.board_management_bridge.trust_building_actions?.map((a, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trust Forecast */}
            {analysis.trust_forecast && (
              <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    30-Day Trust Forecast
                  </h4>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-white capitalize">{analysis.trust_forecast["30_day_outlook"]}</span>
                    {analysis.trust_forecast["30_day_outlook"] === 'improving' && <TrendingUp className="w-6 h-6 text-green-400" />}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-red-400 mb-1">Risk Events</p>
                      {analysis.trust_forecast.risk_events?.map((r, i) => (
                        <p key={i} className="text-slate-300">• {r}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-green-400 mb-1">Opportunities</p>
                      {analysis.trust_forecast.opportunities?.map((o, i) => (
                        <p key={i} className="text-slate-300">• {o}</p>
                      ))}
                    </div>
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