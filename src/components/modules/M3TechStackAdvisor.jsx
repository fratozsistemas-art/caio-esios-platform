import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Loader2, Sparkles, CheckCircle, AlertTriangle, DollarSign, Clock, Shield, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const businessGoals = [
  { value: "scale", label: "Scale & Performance" },
  { value: "speed", label: "Speed to Market" },
  { value: "cost", label: "Cost Optimization" },
  { value: "security", label: "Security & Compliance" },
  { value: "innovation", label: "Innovation & AI" },
  { value: "integration", label: "Enterprise Integration" },
];

export default function M3TechStackAdvisor({ onRecommendation }) {
  const [currentStack, setCurrentStack] = useState("");
  const [businessGoal, setBusinessGoal] = useState("");
  const [constraints, setConstraints] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [budget, setBudget] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  const analyzeTechStack = async () => {
    if (!businessGoal) return;
    
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior technology architect advisor. Recommend an optimal technology stack based on:

Current Stack: ${currentStack || "Greenfield project"}
Primary Business Goal: ${businessGoal}
Team Size: ${teamSize || "Not specified"}
Budget Constraints: ${budget || "Flexible"}
Additional Constraints: ${constraints || "None"}

Generate recommendation in the following JSON format:
{
  "stack_assessment": {
    "current_maturity_score": 0-100,
    "tech_debt_level": "high|medium|low",
    "scalability_rating": "A|B|C|D|F",
    "key_gaps": ["gap1", "gap2"]
  },
  "recommended_stack": {
    "frontend": {
      "primary": "technology name",
      "alternatives": ["alt1", "alt2"],
      "reasoning": "why this choice",
      "learning_curve": "low|medium|high"
    },
    "backend": {
      "primary": "technology name",
      "alternatives": ["alt1", "alt2"],
      "reasoning": "why this choice",
      "learning_curve": "low|medium|high"
    },
    "database": {
      "primary": "technology name",
      "alternatives": ["alt1", "alt2"],
      "reasoning": "why this choice"
    },
    "infrastructure": {
      "primary": "technology name",
      "alternatives": ["alt1", "alt2"],
      "reasoning": "why this choice"
    },
    "ai_ml": {
      "primary": "technology name or N/A",
      "alternatives": ["alt1", "alt2"],
      "reasoning": "why this choice"
    }
  },
  "implementation_roadmap": [
    {
      "phase": 1,
      "name": "phase name",
      "duration_weeks": 4,
      "key_deliverables": ["deliverable1", "deliverable2"],
      "risk_level": "high|medium|low"
    }
  ],
  "cost_analysis": {
    "estimated_monthly_infra": "$X,XXX",
    "estimated_implementation": "$XX,XXX",
    "roi_timeline_months": 12,
    "cost_savings_vs_current": "X%"
  },
  "risk_assessment": {
    "technical_risks": ["risk1", "risk2"],
    "mitigation_strategies": ["strategy1", "strategy2"],
    "vendor_lock_in_score": 0-100
  },
  "innovation_opportunities": [
    {
      "opportunity": "description",
      "impact": "high|medium|low",
      "effort": "high|medium|low"
    }
  ]
}

Be specific with technology names and versions. Consider industry best practices for ${new Date().getFullYear()}.`,
        response_json_schema: {
          type: "object",
          properties: {
            stack_assessment: { type: "object" },
            recommended_stack: { type: "object" },
            implementation_roadmap: { type: "array", items: { type: "object" } },
            cost_analysis: { type: "object" },
            risk_assessment: { type: "object" },
            innovation_opportunities: { type: "array", items: { type: "object" } }
          }
        },
        add_context_from_internet: true
      });

      setRecommendation(result);
      onRecommendation?.(result);
    } catch (error) {
      console.error("Error analyzing tech stack:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getLevelColor = (level) => {
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
          <Code className="w-5 h-5 text-cyan-400" />
          M3 AI Tech Stack Advisor
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Primary Business Goal *</label>
            <Select value={businessGoal} onValueChange={setBusinessGoal}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                {businessGoals.map(g => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Team Size</label>
            <Select value={teamSize} onValueChange={setTeamSize}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">1-5 developers</SelectItem>
                <SelectItem value="medium">6-20 developers</SelectItem>
                <SelectItem value="large">21-50 developers</SelectItem>
                <SelectItem value="enterprise">50+ developers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Current Tech Stack (optional)</label>
          <Textarea
            placeholder="e.g., React, Node.js, PostgreSQL, AWS..."
            value={currentStack}
            onChange={(e) => setCurrentStack(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Budget Range</label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">Startup ($1K-10K/mo)</SelectItem>
                <SelectItem value="growth">Growth ($10K-50K/mo)</SelectItem>
                <SelectItem value="enterprise">Enterprise ($50K+/mo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Constraints</label>
            <Input
              placeholder="e.g., HIPAA, on-prem only..."
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <Button
          onClick={analyzeTechStack}
          disabled={!businessGoal || isAnalyzing}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Tech Stack...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get AI Recommendations
            </>
          )}
        </Button>

        {recommendation && (
          <div className="space-y-4 mt-6">
            {/* Stack Assessment */}
            {recommendation.stack_assessment && (
              <Card className="bg-cyan-500/10 border-cyan-500/30">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Current Stack Assessment</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Maturity Score</p>
                      <p className="text-2xl font-bold text-cyan-400">{recommendation.stack_assessment.current_maturity_score}/100</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Tech Debt</p>
                      <p className={`text-xl font-bold capitalize ${getLevelColor(recommendation.stack_assessment.tech_debt_level)}`}>
                        {recommendation.stack_assessment.tech_debt_level}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Scalability</p>
                      <p className="text-2xl font-bold text-white">{recommendation.stack_assessment.scalability_rating}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Stack */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Recommended Technology Stack
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(recommendation.recommended_stack || {}).map(([layer, data]) => (
                    <div key={layer} className="p-3 bg-white/5 rounded border border-white/10">
                      <p className="text-xs text-slate-400 capitalize mb-1">{layer.replace(/_/g, ' ')}</p>
                      <p className="text-white font-medium">{data.primary}</p>
                      {data.learning_curve && (
                        <Badge className={`mt-1 text-xs ${data.learning_curve === 'low' ? 'bg-green-500/20 text-green-400' : data.learning_curve === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {data.learning_curve} learning curve
                        </Badge>
                      )}
                      <p className="text-xs text-slate-400 mt-2">{data.reasoning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Analysis */}
            {recommendation.cost_analysis && (
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Cost Analysis
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Monthly Infrastructure</p>
                      <p className="text-xl font-bold text-white">{recommendation.cost_analysis.estimated_monthly_infra}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Implementation Cost</p>
                      <p className="text-xl font-bold text-white">{recommendation.cost_analysis.estimated_implementation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">ROI Timeline</p>
                      <p className="text-lg font-bold text-green-400">{recommendation.cost_analysis.roi_timeline_months} months</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Cost Savings</p>
                      <p className="text-lg font-bold text-green-400">{recommendation.cost_analysis.cost_savings_vs_current}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Implementation Roadmap */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Implementation Roadmap
                </h4>
                <div className="space-y-3">
                  {recommendation.implementation_roadmap?.map((phase, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 bg-white/5 rounded">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                        {phase.phase}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">{phase.name}</p>
                          <span className="text-xs text-slate-400">{phase.duration_weeks} weeks</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {phase.key_deliverables?.map((d, i) => (
                            <Badge key={i} className="bg-white/10 text-slate-300 text-xs">{d}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            {recommendation.risk_assessment && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Risk Assessment
                  </h4>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Vendor Lock-in Score</span>
                      <span>{recommendation.risk_assessment.vendor_lock_in_score}/100</span>
                    </div>
                    <Progress value={recommendation.risk_assessment.vendor_lock_in_score} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-red-400 mb-1">Technical Risks</p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {recommendation.risk_assessment.technical_risks?.map((r, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-green-400 mb-1">Mitigations</p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {recommendation.risk_assessment.mitigation_strategies?.map((m, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                            {m}
                          </li>
                        ))}
                      </ul>
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