import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, TrendingUp, TrendingDown, Minus, Loader2, Sparkles, AlertTriangle, CheckCircle, Save } from "lucide-react";
import { toast } from "sonner";

const scenarioTypes = [
  { value: "optimistic", label: "Optimistic", icon: TrendingUp, color: "text-green-400" },
  { value: "baseline", label: "Baseline", icon: Minus, color: "text-blue-400" },
  { value: "pessimistic", label: "Pessimistic", icon: TrendingDown, color: "text-red-400" },
  { value: "disruptive", label: "Disruptive", icon: AlertTriangle, color: "text-yellow-400" },
];

export default function M1ScenarioGenerator({ onScenariosGenerated }) {
  const [industry, setIndustry] = useState("");
  const [geography, setGeography] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("3");
  const [context, setContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenarios, setScenarios] = useState(null);

  const generateScenarios = async () => {
    if (!industry) return;
    
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a strategic market intelligence analyst. Generate 4 comprehensive market scenarios for:

Industry: ${industry}
Geography: ${geography || "Global"}
Time Horizon: ${timeHorizon} years
Additional Context: ${context || "None provided"}

Generate scenarios in the following JSON format:
{
  "market_overview": {
    "current_tam": "estimated TAM in USD",
    "growth_drivers": ["driver1", "driver2", "driver3"],
    "key_risks": ["risk1", "risk2", "risk3"],
    "regulatory_trends": ["trend1", "trend2"]
  },
  "scenarios": [
    {
      "type": "optimistic",
      "name": "scenario name",
      "probability": 0.25,
      "tam_projection": "projected TAM",
      "cagr": "expected CAGR %",
      "key_assumptions": ["assumption1", "assumption2"],
      "triggers": ["what would make this happen"],
      "strategic_implications": ["implication1", "implication2"],
      "recommended_actions": ["action1", "action2"]
    },
    // ... repeat for baseline, pessimistic, and disruptive scenarios
  ],
  "critical_uncertainties": ["uncertainty1", "uncertainty2"],
  "early_warning_indicators": ["indicator1", "indicator2", "indicator3"]
}

Be specific with numbers, percentages, and actionable insights.`,
        response_json_schema: {
          type: "object",
          properties: {
            market_overview: {
              type: "object",
              properties: {
                current_tam: { type: "string" },
                growth_drivers: { type: "array", items: { type: "string" } },
                key_risks: { type: "array", items: { type: "string" } },
                regulatory_trends: { type: "array", items: { type: "string" } }
              }
            },
            scenarios: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  name: { type: "string" },
                  probability: { type: "number" },
                  tam_projection: { type: "string" },
                  cagr: { type: "string" },
                  key_assumptions: { type: "array", items: { type: "string" } },
                  triggers: { type: "array", items: { type: "string" } },
                  strategic_implications: { type: "array", items: { type: "string" } },
                  recommended_actions: { type: "array", items: { type: "string" } }
                }
              }
            },
            critical_uncertainties: { type: "array", items: { type: "string" } },
            early_warning_indicators: { type: "array", items: { type: "string" } }
          }
        },
        add_context_from_internet: true
      });

      setScenarios(result);
      onScenariosGenerated?.(result);
    } catch (error) {
      console.error("Error generating scenarios:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getScenarioConfig = (type) => scenarioTypes.find(s => s.value === type) || scenarioTypes[1];

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Globe className="w-5 h-5 text-blue-400" />
          M1 AI Scenario Generator
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Industry *</label>
            <Input
              placeholder="e.g., Enterprise SaaS, Fintech, Healthcare"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Geography</label>
            <Input
              placeholder="e.g., North America, LATAM, Global"
              value={geography}
              onChange={(e) => setGeography(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Time Horizon</label>
          <Select value={timeHorizon} onValueChange={setTimeHorizon}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Year</SelectItem>
              <SelectItem value="3">3 Years</SelectItem>
              <SelectItem value="5">5 Years</SelectItem>
              <SelectItem value="10">10 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Additional Context</label>
          <Textarea
            placeholder="Any specific trends, concerns, or focus areas..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-20"
          />
        </div>

        <Button
          onClick={generateScenarios}
          disabled={!industry || isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Market Scenarios...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Scenarios
            </>
          )}
        </Button>

        {scenarios && (
          <div className="space-y-4 mt-6">
            {/* Market Overview */}
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Market Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Current TAM</p>
                    <p className="text-xl font-bold text-blue-400">{scenarios.market_overview?.current_tam}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Growth Drivers</p>
                    <div className="flex flex-wrap gap-1">
                      {scenarios.market_overview?.growth_drivers?.map((d, i) => (
                        <Badge key={i} className="bg-green-500/20 text-green-400 text-xs">{d}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenarios Grid */}
            <div className="grid grid-cols-2 gap-4">
              {scenarios.scenarios?.map((scenario, idx) => {
                const config = getScenarioConfig(scenario.type);
                const Icon = config.icon;
                return (
                  <Card key={idx} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={`w-5 h-5 ${config.color}`} />
                        <h4 className="font-semibold text-white">{scenario.name}</h4>
                        <Badge className="ml-auto bg-white/10 text-white text-xs">
                          {Math.round(scenario.probability * 100)}%
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">TAM Projection:</span>
                          <span className="text-white font-medium">{scenario.tam_projection}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">CAGR:</span>
                          <span className={config.color}>{scenario.cagr}</span>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-slate-400 mb-1">Key Assumptions</p>
                          <ul className="text-xs text-slate-300 space-y-1">
                            {scenario.key_assumptions?.slice(0, 2).map((a, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Early Warning Indicators */}
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Early Warning Indicators
                </h4>
                <div className="flex flex-wrap gap-2">
                  {scenarios.early_warning_indicators?.map((indicator, i) => (
                    <Badge key={i} className="bg-yellow-500/20 text-yellow-300 text-xs">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}