import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Loader2, Sparkles, Brain, Target, TrendingUp, UserCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function M10BehavioralIntelligence({ onAnalysisComplete }) {
  const [customerData, setCustomerData] = useState("");
  const [businessContext, setBusinessContext] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeSegments = async () => {
    if (!customerData) return;
    
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a behavioral psychologist and customer segmentation expert. Analyze:

Customer/Client Data:
${customerData}

Business Context:
${businessContext || "B2B/B2C strategic advisory"}

Generate comprehensive behavioral intelligence:

{
  "archetypes": [
    {
      "name": "Archetype Name",
      "description": "brief description",
      "percentage_of_base": 25,
      "behavioral_traits": ["trait1", "trait2", "trait3"],
      "decision_patterns": {
        "speed": "fast|deliberate|slow",
        "drivers": ["driver1", "driver2"],
        "blockers": ["blocker1", "blocker2"],
        "influencers": ["who influences them"]
      },
      "communication_preferences": {
        "channel": "email|call|in-person|digital",
        "frequency": "high|medium|low",
        "style": "data-driven|narrative|visual",
        "tone": "formal|casual|direct"
      },
      "engagement_strategy": {
        "approach": "how to engage",
        "messaging": "key message",
        "proof_points": ["proof1", "proof2"],
        "objection_handling": ["objection → response"]
      },
      "lifetime_value_index": 0-100,
      "acquisition_difficulty": "easy|moderate|hard",
      "retention_risk": "low|medium|high"
    }
  ],
  "segmentation_matrix": {
    "primary_axis": "value vs engagement",
    "segments": [
      {"name": "Champions", "size": 20, "strategy": "nurture"},
      {"name": "At Risk", "size": 15, "strategy": "intervention"}
    ]
  },
  "predictive_insights": {
    "churn_indicators": ["indicator1", "indicator2"],
    "upsell_opportunities": ["opportunity1", "opportunity2"],
    "expansion_triggers": ["trigger1", "trigger2"]
  },
  "recommended_actions": [
    {
      "segment": "which archetype",
      "action": "what to do",
      "expected_impact": "expected result",
      "priority": "high|medium|low"
    }
  ],
  "personalization_framework": {
    "content_mapping": {"archetype1": ["content_type1"]},
    "journey_stages": ["awareness", "consideration", "decision"],
    "touchpoint_optimization": ["touchpoint1 → improvement"]
  }
}

Be specific with behavioral insights and actionable recommendations.`,
        response_json_schema: {
          type: "object",
          properties: {
            archetypes: { type: "array", items: { type: "object" } },
            segmentation_matrix: { type: "object" },
            predictive_insights: { type: "object" },
            recommended_actions: { type: "array", items: { type: "object" } },
            personalization_framework: { type: "object" }
          }
        },
        add_context_from_internet: false
      });

      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error("Error analyzing segments:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const pieData = analysis?.archetypes?.map((a, i) => ({
    name: a.name,
    value: a.percentage_of_base,
    color: COLORS[i % COLORS.length]
  })) || [];

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="w-5 h-5 text-pink-400" />
          M10 AI Behavioral Intelligence
          <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Customer Archetypes
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Customer/Client Data *</label>
          <Textarea
            placeholder="Describe your customer base: demographics, behaviors, purchase patterns, feedback themes, engagement data..."
            value={customerData}
            onChange={(e) => setCustomerData(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-32"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Business Context</label>
          <Textarea
            placeholder="Your business model, sales cycle, key value propositions..."
            value={businessContext}
            onChange={(e) => setBusinessContext(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-20"
          />
        </div>

        <Button
          onClick={analyzeSegments}
          disabled={!customerData || isAnalyzing}
          className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
        >
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing Behavioral Patterns...</>
          ) : (
            <><Brain className="w-4 h-4 mr-2" />Generate Customer Archetypes</>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4 mt-6">
            {/* Archetype Distribution */}
            {pieData.length > 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Archetype Distribution</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                          labelLine={false}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Archetypes */}
            <div className="space-y-3">
              {analysis.archetypes?.map((archetype, idx) => (
                <Card key={idx} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: COLORS[idx % COLORS.length] + '30' }}>
                          <UserCircle className="w-6 h-6" style={{ color: COLORS[idx % COLORS.length] }} />
                        </div>
                        <div>
                          <h5 className="font-medium text-white">{archetype.name}</h5>
                          <p className="text-xs text-slate-400">{archetype.percentage_of_base}% of customer base</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Badge className={`text-xs ${archetype.lifetime_value_index >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          LTV: {archetype.lifetime_value_index}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 mb-3">{archetype.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2 bg-white/5 rounded">
                        <p className="text-xs text-slate-400 mb-1">Decision Speed</p>
                        <p className="text-sm text-white capitalize">{archetype.decision_patterns?.speed}</p>
                      </div>
                      <div className="p-2 bg-white/5 rounded">
                        <p className="text-xs text-slate-400 mb-1">Preferred Channel</p>
                        <p className="text-sm text-white capitalize">{archetype.communication_preferences?.channel}</p>
                      </div>
                    </div>

                    <div className="p-2 bg-pink-500/10 rounded border border-pink-500/20">
                      <p className="text-xs text-pink-400 font-medium mb-1">Engagement Strategy</p>
                      <p className="text-sm text-slate-200">{archetype.engagement_strategy?.approach}</p>
                      <p className="text-xs text-slate-400 mt-1">Key message: "{archetype.engagement_strategy?.messaging}"</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Predictive Insights */}
            {analysis.predictive_insights && (
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Predictive Insights
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-red-400 mb-1">Churn Indicators</p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {analysis.predictive_insights.churn_indicators?.map((ind, i) => (
                          <li key={i}>• {ind}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-green-400 mb-1">Upsell Opportunities</p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {analysis.predictive_insights.upsell_opportunities?.map((opp, i) => (
                          <li key={i}>• {opp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Actions */}
            {analysis.recommended_actions?.length > 0 && (
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-green-400 mb-3">Recommended Actions</h4>
                  <div className="space-y-2">
                    {analysis.recommended_actions.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                        <Badge className={`${action.priority === 'high' ? 'bg-red-500/20 text-red-400' : action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {action.priority}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm text-white">{action.action}</p>
                          <p className="text-xs text-slate-400">Target: {action.segment} → {action.expected_impact}</p>
                        </div>
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