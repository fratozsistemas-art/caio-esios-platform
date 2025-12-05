import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Target,
  Lightbulb,
  ArrowRight,
  BarChart3,
  Loader2,
  FileDown,
  ExternalLink
} from "lucide-react";
import ScenarioDrillDown from "../analysis/ScenarioDrillDown";
import ComparisonPDFExport from "../analysis/ComparisonPDFExport";

const scenarioTypeConfig = {
  optimistic: { icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/20" },
  baseline: { icon: Minus, color: "text-blue-400", bg: "bg-blue-500/20" },
  pessimistic: { icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/20" },
  disruptive: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/20" }
};

export default function ScenarioComparisonViewer({ onClose }) {
  const [selectedAnalyses, setSelectedAnalyses] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [drillDownScenario, setDrillDownScenario] = useState(null);
  const [showPDFExport, setShowPDFExport] = useState(false);

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['market-analyses'],
    queryFn: async () => {
      const all = await base44.entities.Analysis.filter({ type: "market" }, "-created_date", 20);
      return all.filter(a => a.results?.scenarios);
    }
  });

  const toggleAnalysis = (id) => {
    setSelectedAnalyses(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const runComparison = async () => {
    if (selectedAnalyses.length < 2) return;
    
    setIsComparing(true);
    try {
      const selectedData = analyses.filter(a => selectedAnalyses.includes(a.id));
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a strategic analyst. Compare the following market scenario analyses and provide insights:

${selectedData.map((a, i) => `
ANALYSIS ${i + 1}: ${a.title}
Industry: ${a.results?.industry || 'N/A'}
Geography: ${a.results?.geography || 'Global'}
Time Horizon: ${a.results?.time_horizon || 'N/A'} years
Market Overview: ${JSON.stringify(a.results?.market_overview || {})}
Scenarios: ${JSON.stringify(a.results?.scenarios || [])}
`).join('\n---\n')}

Provide a comprehensive comparison in JSON format:
{
  "key_differences": [
    {
      "aspect": "string (e.g., Market Size, Growth Rate, Risk Profile)",
      "comparison": "string explaining the difference",
      "significance": "high|medium|low"
    }
  ],
  "common_themes": ["theme1", "theme2"],
  "strategic_insights": [
    {
      "insight": "string",
      "implications": ["implication1", "implication2"],
      "recommended_actions": ["action1", "action2"]
    }
  ],
  "risk_assessment": {
    "combined_risks": ["risk1", "risk2"],
    "mitigation_strategies": ["strategy1", "strategy2"]
  },
  "opportunity_synthesis": {
    "cross_cutting_opportunities": ["opp1", "opp2"],
    "prioritized_actions": ["action1", "action2"]
  },
  "decision_framework": {
    "if_optimistic": "recommended strategic posture",
    "if_baseline": "recommended strategic posture",
    "if_pessimistic": "recommended strategic posture",
    "hedging_strategy": "how to balance across scenarios"
  }
}`,
        response_json_schema: {
          type: "object",
          properties: {
            key_differences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  aspect: { type: "string" },
                  comparison: { type: "string" },
                  significance: { type: "string" }
                }
              }
            },
            common_themes: { type: "array", items: { type: "string" } },
            strategic_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  insight: { type: "string" },
                  implications: { type: "array", items: { type: "string" } },
                  recommended_actions: { type: "array", items: { type: "string" } }
                }
              }
            },
            risk_assessment: {
              type: "object",
              properties: {
                combined_risks: { type: "array", items: { type: "string" } },
                mitigation_strategies: { type: "array", items: { type: "string" } }
              }
            },
            opportunity_synthesis: {
              type: "object",
              properties: {
                cross_cutting_opportunities: { type: "array", items: { type: "string" } },
                prioritized_actions: { type: "array", items: { type: "string" } }
              }
            },
            decision_framework: {
              type: "object",
              properties: {
                if_optimistic: { type: "string" },
                if_baseline: { type: "string" },
                if_pessimistic: { type: "string" },
                hedging_strategy: { type: "string" }
              }
            }
          }
        }
      });

      setComparisonResult({ ...result, selectedData });
    } catch (error) {
      console.error("Comparison error:", error);
    } finally {
      setIsComparing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <GitCompare className="w-5 h-5 text-purple-400" />
          Comparação de Cenários
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 ml-2">
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Panel */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-2">Selecione análises para comparar (mín. 2)</p>
            <ScrollArea className="h-48 rounded-lg border border-white/10 p-2">
              {analyses.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">
                  Nenhuma análise M1 salva encontrada
                </p>
              ) : (
                <div className="space-y-2">
                  {analyses.map(analysis => (
                    <div 
                      key={analysis.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedAnalyses.includes(analysis.id) 
                          ? 'bg-purple-500/20 border border-purple-500/30' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => toggleAnalysis(analysis.id)}
                    >
                      <Checkbox 
                        checked={selectedAnalyses.includes(analysis.id)}
                        onCheckedChange={() => toggleAnalysis(analysis.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{analysis.title}</p>
                        <p className="text-slate-500 text-xs">
                          {analysis.results?.industry} • {new Date(analysis.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      {analysis.tags?.length > 0 && (
                        <Badge className="bg-white/10 text-slate-400 text-xs">
                          {analysis.tags[0]}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Selected Preview */}
          <div>
            <p className="text-sm text-slate-400 mb-2">Selecionadas ({selectedAnalyses.length})</p>
            <div className="h-48 rounded-lg border border-white/10 p-2 bg-white/5">
              {selectedAnalyses.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">
                  Selecione análises à esquerda
                </p>
              ) : (
                <div className="space-y-2">
                  {analyses.filter(a => selectedAnalyses.includes(a.id)).map(analysis => (
                    <div key={analysis.id} className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <p className="text-white text-sm">{analysis.title}</p>
                      <div className="flex gap-1 mt-1">
                        {analysis.results?.scenarios?.slice(0, 4).map((s, i) => {
                          const config = scenarioTypeConfig[s.type] || scenarioTypeConfig.baseline;
                          return (
                            <Badge key={i} className={`${config.bg} ${config.color} text-xs`}>
                              {s.type}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={runComparison}
          disabled={selectedAnalyses.length < 2 || isComparing}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isComparing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analisando Cenários...
            </>
          ) : (
            <>
              <GitCompare className="w-4 h-4 mr-2" />
              Comparar Cenários ({selectedAnalyses.length} selecionados)
            </>
          )}
        </Button>

        {/* Comparison Results */}
        {comparisonResult && (
          <div className="space-y-4 mt-6 pt-6 border-t border-white/10">
            {/* Export Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setShowPDFExport(true)}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export PDF Report
              </Button>
            </div>

            {/* Interactive Scenario Cards */}
            <div className="grid grid-cols-2 gap-3">
              {comparisonResult.selectedData?.flatMap(analysis => 
                analysis.results?.scenarios?.map((scenario, idx) => {
                  const config = scenarioTypeConfig[scenario.type] || scenarioTypeConfig.baseline;
                  const Icon = config.icon;
                  return (
                    <Card 
                      key={`${analysis.id}-${idx}`}
                      className={`${config.bg} cursor-pointer hover:scale-[1.02] transition-all`}
                      onClick={() => setDrillDownScenario({ scenario, analysis })}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className="text-white text-sm font-medium truncate">{scenario.name}</span>
                          <Badge className="ml-auto bg-white/10 text-white text-xs">
                            {Math.round((scenario.probability || 0.25) * 100)}%
                          </Badge>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </div>
                        <p className="text-slate-400 text-xs mt-1 truncate">
                          {analysis.title}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Key Differences */}
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4">
                <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Diferenças-Chave
                </h4>
                <div className="space-y-2">
                  {comparisonResult.key_differences?.map((diff, i) => (
                    <div key={i} className="p-2 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm">{diff.aspect}</span>
                        <Badge className={
                          diff.significance === 'high' ? 'bg-red-500/20 text-red-400' :
                          diff.significance === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }>
                          {diff.significance}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs">{diff.comparison}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategic Insights */}
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-4">
                <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Insights Estratégicos
                </h4>
                <div className="space-y-3">
                  {comparisonResult.strategic_insights?.map((insight, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-lg">
                      <p className="text-white text-sm mb-2">{insight.insight}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Implicações:</p>
                          <ul className="text-xs text-slate-400 space-y-1">
                            {insight.implications?.map((imp, j) => (
                              <li key={j} className="flex items-start gap-1">
                                <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-400" />
                                {imp}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Ações Recomendadas:</p>
                          <ul className="text-xs text-slate-400 space-y-1">
                            {insight.recommended_actions?.map((action, j) => (
                              <li key={j} className="flex items-start gap-1">
                                <Target className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-400" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Decision Framework */}
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-4">
                <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Framework de Decisão
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-green-400 text-xs font-semibold mb-1">Se Otimista:</p>
                    <p className="text-slate-300 text-xs">{comparisonResult.decision_framework?.if_optimistic}</p>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-blue-400 text-xs font-semibold mb-1">Se Baseline:</p>
                    <p className="text-slate-300 text-xs">{comparisonResult.decision_framework?.if_baseline}</p>
                  </div>
                  <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="text-red-400 text-xs font-semibold mb-1">Se Pessimista:</p>
                    <p className="text-slate-300 text-xs">{comparisonResult.decision_framework?.if_pessimistic}</p>
                  </div>
                  <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <p className="text-yellow-400 text-xs font-semibold mb-1">Estratégia de Hedge:</p>
                    <p className="text-slate-300 text-xs">{comparisonResult.decision_framework?.hedging_strategy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Drill Down Modal */}
        {drillDownScenario && (
          <ScenarioDrillDown
            scenario={drillDownScenario.scenario}
            analysisContext={drillDownScenario.analysis}
            onClose={() => setDrillDownScenario(null)}
          />
        )}

        {/* PDF Export Modal */}
        {showPDFExport && (
          <ComparisonPDFExport
            comparisonResult={comparisonResult}
            selectedAnalyses={analyses.filter(a => selectedAnalyses.includes(a.id))}
            onClose={() => setShowPDFExport(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}