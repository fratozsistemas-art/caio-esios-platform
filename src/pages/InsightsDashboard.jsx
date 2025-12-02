import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Sparkles, AlertTriangle, CheckCircle, Zap, Target, 
  TrendingUp, Link2, Clock, ArrowRight, Filter, RefreshCw,
  BarChart3, Network, Shield, Lightbulb, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import InsightCard from "../components/insights/InsightCard";
import ConflictTracker from "../components/insights/ConflictTracker";
import SynergyMap from "../components/insights/SynergyMap";
import RecommendationTracker from "../components/insights/RecommendationTracker";
import StrategicHealthGauge from "../components/insights/StrategicHealthGauge";

export default function InsightsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Load stored insights from localStorage (in real app, would be from database)
  const [storedInsights, setStoredInsights] = useState(() => {
    const saved = localStorage.getItem('caio_insights_data');
    return saved ? JSON.parse(saved) : null;
  });

  const [recommendations, setRecommendations] = useState(() => {
    const saved = localStorage.getItem('caio_recommendations');
    return saved ? JSON.parse(saved) : [];
  });

  const saveRecommendations = (recs) => {
    setRecommendations(recs);
    localStorage.setItem('caio_recommendations', JSON.stringify(recs));
  };

  const handleToggleRecommendation = (id) => {
    const updated = recommendations.map(r => 
      r.id === id ? { ...r, completed: !r.completed, completedAt: !r.completed ? new Date().toISOString() : null } : r
    );
    saveRecommendations(updated);
  };

  // Summary stats
  const stats = {
    totalInsights: storedInsights?.synergies?.length || 0,
    conflicts: storedInsights?.conflicts?.length || 0,
    synergies: storedInsights?.synergy_opportunities?.length || 0,
    recommendations: recommendations.length,
    completedRecs: recommendations.filter(r => r.completed).length,
    healthScore: storedInsights?.strategic_health_score || 75
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            Strategic Insights Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Centralized view of all AI-powered strategic intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("AIModules")}>
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
              <Brain className="w-4 h-4 mr-2" />
              Run Modules
            </Button>
          </Link>
          <Badge className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/30 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Aggregated
          </Badge>
        </div>
      </div>

      {/* Strategic Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="md:col-span-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
          <CardContent className="p-6">
            <StrategicHealthGauge score={stats.healthScore} />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <Lightbulb className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalInsights}</p>
            <p className="text-xs text-slate-400">Total Insights</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.conflicts}</p>
            <p className="text-xs text-slate-400">Conflicts</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.synergies}</p>
            <p className="text-xs text-slate-400">Synergies</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Progress */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Recommendation Progress
            </h3>
            <span className="text-sm text-slate-400">
              {stats.completedRecs}/{stats.recommendations} completed
            </span>
          </div>
          <Progress 
            value={stats.recommendations > 0 ? (stats.completedRecs / stats.recommendations) * 100 : 0} 
            className="h-2" 
          />
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="data-[state=active]:bg-white/10">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Conflicts
          </TabsTrigger>
          <TabsTrigger value="synergies" className="data-[state=active]:bg-white/10">
            <Link2 className="w-4 h-4 mr-2" />
            Synergies
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-white/10">
            <CheckCircle className="w-4 h-4 mr-2" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="whatif" className="data-[state=active]:bg-white/10">
            <TrendingUp className="w-4 h-4 mr-2" />
            What-If
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Insights */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Recent Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {storedInsights?.synergies?.slice(0, 5).map((insight, idx) => (
                  <InsightCard key={idx} insight={insight} />
                )) || (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Run AI modules to generate insights
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Module Interconnections */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Network className="w-4 h-4 text-purple-400" />
                  Module Interconnections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SynergyMap synergies={storedInsights?.synergy_opportunities || []} />
              </CardContent>
            </Card>

            {/* Priority Actions */}
            <Card className="lg:col-span-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-yellow-400 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Priority Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {storedInsights?.next_actions?.slice(0, 3).map((action, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-white">{action.action}</p>
                          <Badge className="mt-2 bg-yellow-500/20 text-yellow-400 text-xs">
                            {action.urgency}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-slate-500 col-span-3 text-center py-4">
                      No priority actions yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conflicts" className="mt-6">
          <ConflictTracker conflicts={storedInsights?.conflicts_detected || []} />
        </TabsContent>

        <TabsContent value="synergies" className="mt-6">
          <div className="grid gap-4">
            {storedInsights?.synergy_opportunities?.map((synergy, idx) => (
              <Card key={idx} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {synergy.modules_to_combine?.map((m, i) => (
                        <React.Fragment key={i}>
                          <Badge className="bg-green-500/20 text-green-400">{m}</Badge>
                          {i < synergy.modules_to_combine.length - 1 && <span className="text-green-400">+</span>}
                        </React.Fragment>
                      ))}
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400">{synergy.impact_score}% impact</Badge>
                  </div>
                  <h4 className="text-white font-medium mt-3">{synergy.title}</h4>
                  <p className="text-sm text-slate-400 mt-1">{synergy.description}</p>
                  {synergy.action_plan && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-green-400 mb-2">Action Plan:</p>
                      {synergy.action_plan.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                          <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">{step.step}</span>
                          {step.action}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )) || (
              <p className="text-slate-500 text-center py-8">No synergies identified yet. Run the Strategy Coach.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <RecommendationTracker 
            recommendations={recommendations}
            onToggle={handleToggleRecommendation}
            cumulativeRecs={storedInsights?.cumulative_recommendations || []}
            onAddRecommendation={(rec) => {
              const newRec = { ...rec, id: Date.now(), completed: false };
              saveRecommendations([...recommendations, newRec]);
            }}
          />
        </TabsContent>

        <TabsContent value="whatif" className="mt-6">
          <WhatIfScenarioPlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// What-If Scenario Planner Component (inline for now, can be extracted)
function WhatIfScenarioPlanner() {
  const [parameters, setParameters] = useState({
    marketGrowth: 10,
    competitorIntensity: 50,
    fundingAvailability: 75,
    techDisruption: 30,
    regulatoryPressure: 40,
    customerDemand: 60
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [scenarios, setScenarios] = useState(null);

  const runScenarioAnalysis = async () => {
    setIsCalculating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a strategic scenario planning AI. Based on the following parameter adjustments, calculate how different strategic outcomes would change:

CURRENT PARAMETERS:
- Market Growth Rate: ${parameters.marketGrowth}% (0-30 scale)
- Competitive Intensity: ${parameters.competitorIntensity}% (0=low, 100=intense)
- Funding Availability: ${parameters.fundingAvailability}% (0=scarce, 100=abundant)
- Technology Disruption Risk: ${parameters.techDisruption}% (0=stable, 100=high disruption)
- Regulatory Pressure: ${parameters.regulatoryPressure}% (0=favorable, 100=restrictive)
- Customer Demand: ${parameters.customerDemand}% (0=declining, 100=surging)

Generate scenario analysis in JSON:
{
  "scenario_summary": "Brief summary of what these parameters suggest",
  "strategic_posture": "aggressive|balanced|defensive|opportunistic",
  "confidence_level": 0-100,
  "impact_on_modules": {
    "M1_market": {"direction": "positive|negative|neutral", "magnitude": 0-100, "insight": "what this means for market analysis"},
    "M4_financial": {"direction": "positive|negative|neutral", "magnitude": 0-100, "insight": "impact on financial projections"},
    "M5_strategy": {"direction": "positive|negative|neutral", "magnitude": 0-100, "insight": "strategic synthesis implications"},
    "M6_opportunity": {"direction": "positive|negative|neutral", "magnitude": 0-100, "insight": "opportunity matrix changes"},
    "M9_funding": {"direction": "positive|negative|neutral", "magnitude": 0-100, "insight": "funding strategy implications"}
  },
  "projected_outcomes": {
    "revenue_impact": "+X% to -Y%",
    "risk_level": "low|medium|high|critical",
    "time_to_value": "accelerated|on_track|delayed",
    "competitive_position": "strengthened|maintained|weakened"
  },
  "recommended_adjustments": [
    {"area": "area name", "current": "what you're doing", "recommended": "what to do instead", "rationale": "why"}
  ],
  "early_warning_signals": ["signal to watch 1", "signal to watch 2"],
  "contingency_triggers": [
    {"if": "condition", "then": "action to take"}
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            scenario_summary: { type: "string" },
            strategic_posture: { type: "string" },
            confidence_level: { type: "number" },
            impact_on_modules: { type: "object" },
            projected_outcomes: { type: "object" },
            recommended_adjustments: { type: "array", items: { type: "object" } },
            early_warning_signals: { type: "array", items: { type: "string" } },
            contingency_triggers: { type: "array", items: { type: "object" } }
          }
        }
      });
      setScenarios(result);
    } catch (error) {
      console.error("Scenario analysis error:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getDirectionColor = (dir) => {
    if (dir === 'positive') return 'text-green-400';
    if (dir === 'negative') return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="space-y-6">
      {/* Parameter Controls */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            What-If Scenario Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(parameters).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <span className="text-xs text-white font-bold">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => setParameters(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            ))}
          </div>

          <Button
            onClick={runScenarioAnalysis}
            disabled={isCalculating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isCalculating ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Calculating Scenarios...</>
            ) : (
              <><TrendingUp className="w-4 h-4 mr-2" />Run What-If Analysis</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Scenario Results */}
      {scenarios && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge className={`${
                  scenarios.strategic_posture === 'aggressive' ? 'bg-green-500/20 text-green-400' :
                  scenarios.strategic_posture === 'defensive' ? 'bg-red-500/20 text-red-400' :
                  scenarios.strategic_posture === 'opportunistic' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {scenarios.strategic_posture} posture
                </Badge>
                <span className="text-sm text-slate-400">{scenarios.confidence_level}% confidence</span>
              </div>
              <p className="text-white">{scenarios.scenario_summary}</p>
            </CardContent>
          </Card>

          {/* Module Impacts */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {Object.entries(scenarios.impact_on_modules || {}).map(([module, impact]) => (
              <Card key={module} className="bg-white/5 border-white/10">
                <CardContent className="p-3 text-center">
                  <Badge className="bg-white/10 text-white text-xs mb-2">{module.replace('_', ' ').toUpperCase()}</Badge>
                  <p className={`text-lg font-bold ${getDirectionColor(impact.direction)}`}>
                    {impact.direction === 'positive' ? '↑' : impact.direction === 'negative' ? '↓' : '→'} {impact.magnitude}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{impact.insight}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Projected Outcomes */}
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold text-purple-400 mb-3">Projected Outcomes</h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-400">Revenue Impact</p>
                  <p className="text-lg font-bold text-white">{scenarios.projected_outcomes?.revenue_impact}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Risk Level</p>
                  <p className="text-lg font-bold text-white capitalize">{scenarios.projected_outcomes?.risk_level}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Time to Value</p>
                  <p className="text-lg font-bold text-white capitalize">{scenarios.projected_outcomes?.time_to_value}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Competitive Position</p>
                  <p className="text-lg font-bold text-white capitalize">{scenarios.projected_outcomes?.competitive_position}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contingency Triggers */}
          {scenarios.contingency_triggers?.length > 0 && (
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-yellow-400 mb-3">Contingency Triggers</h4>
                <div className="space-y-2">
                  {scenarios.contingency_triggers.map((trigger, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <span className="text-slate-400">IF</span>
                      <span className="text-white">{trigger.if}</span>
                      <ArrowRight className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400">{trigger.then}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}