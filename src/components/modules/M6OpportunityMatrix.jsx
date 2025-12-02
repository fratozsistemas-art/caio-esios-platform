import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BarChart, Loader2, Sparkles, AlertTriangle, CheckCircle, Target, TrendingUp } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function M6OpportunityMatrix({ onAnalysisComplete }) {
  const [opportunities, setOpportunities] = useState("");
  const [constraints, setConstraints] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeOpportunities = async () => {
    if (!opportunities) return;
    
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a strategic portfolio analyst. Analyze the following opportunities and create a prioritized opportunity matrix:

Opportunities to analyze:
${opportunities}

Constraints:
${constraints || "Standard resource constraints"}

Generate analysis in the following JSON format:
{
  "opportunities": [
    {
      "id": 1,
      "name": "opportunity name",
      "category": "growth|efficiency|innovation|defensive",
      "risk_score": 1-10,
      "return_score": 1-10,
      "strategic_fit": 1-10,
      "resource_requirement": "low|medium|high",
      "time_to_value_months": 12,
      "investment_required": "$X.XM",
      "expected_roi": "XX%",
      "risks": [
        {"risk": "description", "severity": "high|medium|low", "mitigation": "strategy"}
      ],
      "dependencies": ["dependency1"],
      "quick_wins": ["win1"],
      "recommendation": "pursue|defer|decline",
      "priority_rank": 1
    }
  ],
  "portfolio_summary": {
    "total_investment_required": "$XX.XM",
    "expected_portfolio_roi": "XX%",
    "risk_adjusted_return": "XX%",
    "optimal_allocation": {
      "growth": 40,
      "efficiency": 30,
      "innovation": 20,
      "defensive": 10
    }
  },
  "resource_allocation": {
    "phase_1": {"opportunities": [1, 2], "investment": "$XM", "timeline": "Q1-Q2"},
    "phase_2": {"opportunities": [3], "investment": "$XM", "timeline": "Q3-Q4"}
  },
  "risk_mitigation_plan": {
    "portfolio_risks": ["risk1", "risk2"],
    "hedging_strategies": ["strategy1", "strategy2"],
    "contingency_budget": "$XM"
  }
}

Prioritize based on risk-adjusted returns and strategic fit.`,
        response_json_schema: {
          type: "object",
          properties: {
            opportunities: { type: "array", items: { type: "object" } },
            portfolio_summary: { type: "object" },
            resource_allocation: { type: "object" },
            risk_mitigation_plan: { type: "object" }
          }
        },
        add_context_from_internet: false
      });

      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error("Error analyzing opportunities:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case "pursue": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "defer": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "decline": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const chartData = analysis?.opportunities?.map(opp => ({
    name: opp.name,
    risk: opp.risk_score,
    return: opp.return_score,
    recommendation: opp.recommendation
  })) || [];

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart className="w-5 h-5 text-orange-400" />
          M6 AI Opportunity Matrix
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Risk-Return Analysis
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Strategic Opportunities *</label>
          <Textarea
            placeholder="List your strategic opportunities, one per line:&#10;1. Expand to European market&#10;2. Launch new product line&#10;3. Acquire competitor X"
            value={opportunities}
            onChange={(e) => setOpportunities(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-32"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Resource Constraints</label>
          <Textarea
            placeholder="e.g., $10M budget, 50 FTEs available, 18-month timeline..."
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-20"
          />
        </div>

        <Button
          onClick={analyzeOpportunities}
          disabled={!opportunities || isAnalyzing}
          className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
        >
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing Opportunities...</>
          ) : (
            <><Target className="w-4 h-4 mr-2" />Generate Opportunity Matrix</>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4 mt-6">
            {/* Risk-Return Scatter */}
            {chartData.length > 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Risk-Return Matrix</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" dataKey="risk" name="Risk" domain={[0, 10]} stroke="#9CA3AF" fontSize={12} label={{ value: 'Risk →', position: 'bottom', fill: '#9CA3AF', fontSize: 10 }} />
                        <YAxis type="number" dataKey="return" name="Return" domain={[0, 10]} stroke="#9CA3AF" fontSize={12} label={{ value: 'Return →', angle: -90, position: 'left', fill: '#9CA3AF', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151' }} />
                        <Scatter data={chartData}>
                          {chartData.map((entry, index) => (
                            <Cell key={index} fill={entry.recommendation === 'pursue' ? '#10B981' : entry.recommendation === 'defer' ? '#F59E0B' : '#EF4444'} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prioritized Opportunities */}
            <div className="space-y-3">
              {analysis.opportunities?.sort((a, b) => a.priority_rank - b.priority_rank).map((opp, idx) => (
                <Card key={idx} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">
                          {opp.priority_rank}
                        </div>
                        <h5 className="font-medium text-white">{opp.name}</h5>
                      </div>
                      <Badge className={getRecommendationColor(opp.recommendation)}>
                        {opp.recommendation}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                      <div><span className="text-slate-400">Risk:</span> <span className="text-white">{opp.risk_score}/10</span></div>
                      <div><span className="text-slate-400">Return:</span> <span className="text-white">{opp.return_score}/10</span></div>
                      <div><span className="text-slate-400">Investment:</span> <span className="text-white">{opp.investment_required}</span></div>
                      <div><span className="text-slate-400">ROI:</span> <span className="text-green-400">{opp.expected_roi}</span></div>
                    </div>
                    {opp.risks?.length > 0 && (
                      <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                        <p className="text-xs text-red-400 font-medium mb-1">Key Risks & Mitigations</p>
                        {opp.risks.slice(0, 2).map((r, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5" />
                            <span>{r.risk} → <span className="text-green-400">{r.mitigation}</span></span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Portfolio Summary */}
            {analysis.portfolio_summary && (
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-green-400 mb-3">Portfolio Summary</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Total Investment</p>
                      <p className="text-xl font-bold text-white">{analysis.portfolio_summary.total_investment_required}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Expected ROI</p>
                      <p className="text-xl font-bold text-green-400">{analysis.portfolio_summary.expected_portfolio_roi}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Risk-Adjusted Return</p>
                      <p className="text-xl font-bold text-blue-400">{analysis.portfolio_summary.risk_adjusted_return}</p>
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