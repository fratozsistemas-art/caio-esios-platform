import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, Loader2, Sparkles, Target, CheckCircle, Clock, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function M7ImplementationPlanner({ onPlanComplete }) {
  const [strategy, setStrategy] = useState("");
  const [timeline, setTimeline] = useState("12");
  const [teamSize, setTeamSize] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [plan, setPlan] = useState(null);

  const generatePlan = async () => {
    if (!strategy) return;
    
    setIsPlanning(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an OKR and implementation planning expert. Generate a comprehensive implementation roadmap for:

Strategy to implement:
${strategy}

Timeline: ${timeline} months
Team Size: ${teamSize || "To be determined"}

Generate plan in the following JSON format:
{
  "executive_summary": "brief summary of implementation approach",
  "okrs": [
    {
      "objective": "O1: Clear objective statement",
      "quarter": "Q1",
      "key_results": [
        {"kr": "KR1.1: Measurable result", "target": "100%", "baseline": "0%", "owner": "role"},
        {"kr": "KR1.2: Another result", "target": "50", "baseline": "10", "owner": "role"}
      ],
      "initiatives": ["initiative1", "initiative2"]
    }
  ],
  "roadmap_phases": [
    {
      "phase": 1,
      "name": "Foundation",
      "duration_weeks": 4,
      "objectives": ["obj1", "obj2"],
      "milestones": [
        {"milestone": "description", "week": 2, "deliverable": "what", "owner": "who"}
      ],
      "resources_required": {"headcount": 5, "budget": "$100K"},
      "success_criteria": ["criteria1"],
      "risks": ["risk1"],
      "dependencies": ["dep1"]
    }
  ],
  "governance": {
    "steering_committee": ["role1", "role2"],
    "review_cadence": "bi-weekly",
    "escalation_path": ["level1", "level2"],
    "decision_rights": {"strategic": "who", "tactical": "who", "operational": "who"}
  },
  "resource_plan": {
    "team_structure": [
      {"role": "Project Lead", "fte": 1, "skills": ["skill1", "skill2"]}
    ],
    "budget_breakdown": {
      "personnel": "$XXX",
      "technology": "$XXX",
      "external": "$XXX",
      "contingency": "$XXX"
    }
  },
  "risk_register": [
    {"risk": "description", "probability": "high|medium|low", "impact": "high|medium|low", "mitigation": "strategy", "owner": "who"}
  ],
  "success_metrics": {
    "leading_indicators": ["indicator1", "indicator2"],
    "lagging_indicators": ["indicator1", "indicator2"],
    "health_scorecard": {"on_track": 3, "at_risk": 1, "blocked": 0}
  }
}

Be specific and actionable with all recommendations.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            okrs: { type: "array", items: { type: "object" } },
            roadmap_phases: { type: "array", items: { type: "object" } },
            governance: { type: "object" },
            resource_plan: { type: "object" },
            risk_register: { type: "array", items: { type: "object" } },
            success_metrics: { type: "object" }
          }
        },
        add_context_from_internet: false
      });

      setPlan(result);
      onPlanComplete?.(result);
    } catch (error) {
      console.error("Error generating plan:", error);
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Rocket className="w-5 h-5 text-red-400" />
          M7 AI Implementation Planner
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            OKRs & Roadmap
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Strategy to Implement *</label>
          <Textarea
            placeholder="Describe the strategy or initiative you want to implement..."
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-32"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Timeline (months)</label>
            <Select value={timeline} onValueChange={setTimeline}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="18">18 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Available Team Size</label>
            <Input
              placeholder="e.g., 10 FTEs"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <Button
          onClick={generatePlan}
          disabled={!strategy || isPlanning}
          className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
        >
          {isPlanning ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Implementation Plan...</>
          ) : (
            <><Rocket className="w-4 h-4 mr-2" />Generate OKRs & Roadmap</>
          )}
        </Button>

        {plan && (
          <div className="space-y-4 mt-6">
            {/* Executive Summary */}
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4">
                <p className="text-sm text-slate-200">{plan.executive_summary}</p>
              </CardContent>
            </Card>

            {/* OKRs */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                Objectives & Key Results
              </h4>
              {plan.okrs?.map((okr, idx) => (
                <Card key={idx} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-white">{okr.objective}</h5>
                      <Badge className="bg-blue-500/20 text-blue-400">{okr.quarter}</Badge>
                    </div>
                    <div className="space-y-2">
                      {okr.key_results?.map((kr, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-200">{kr.kr}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={parseInt(kr.baseline) / parseInt(kr.target) * 100 || 0} className="h-1 flex-1" />
                              <span className="text-xs text-slate-400">{kr.baseline} → {kr.target}</span>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">{kr.owner}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Roadmap Phases */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Implementation Roadmap
                </h4>
                <div className="space-y-3">
                  {plan.roadmap_phases?.map((phase, idx) => (
                    <div key={idx} className="relative pl-6 pb-4 border-l-2 border-purple-500/30 last:border-0">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-purple-500/30 border-2 border-purple-500" />
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-white">Phase {phase.phase}: {phase.name}</h5>
                        <span className="text-xs text-slate-400">{phase.duration_weeks} weeks</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {phase.milestones?.map((m, i) => (
                          <Badge key={i} className="bg-white/10 text-slate-300 text-xs">
                            Week {m.week}: {m.milestone}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">
                        Resources: {phase.resources_required?.headcount} FTEs, {phase.resources_required?.budget}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Governance */}
            {plan.governance && (
              <Card className="bg-yellow-500/10 border-yellow-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Governance Structure
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Steering Committee</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.governance.steering_committee?.map((role, i) => (
                          <Badge key={i} className="bg-white/10 text-white text-xs">{role}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Review Cadence</p>
                      <p className="text-white capitalize">{plan.governance.review_cadence}</p>
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