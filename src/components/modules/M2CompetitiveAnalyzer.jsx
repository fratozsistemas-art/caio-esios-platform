import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Target, Loader2, Sparkles, TrendingUp, TrendingDown, AlertTriangle, Shield, Zap, Eye } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function M2CompetitiveAnalyzer({ onAnalysisComplete }) {
  const [companyName, setCompanyName] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [industry, setIndustry] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeCompetitiveLandscape = async () => {
    if (!companyName) return;
    
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a competitive intelligence analyst. Perform a comprehensive competitive analysis for:

Company: ${companyName}
Industry: ${industry || "Not specified"}
Known Competitors: ${competitors || "Identify key competitors"}

Generate analysis in the following JSON format:
{
  "company_profile": {
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"],
    "market_position": "leader|challenger|follower|nicher",
    "competitive_advantage": "description of main competitive advantage"
  },
  "competitors": [
    {
      "name": "competitor name",
      "threat_level": "high|medium|low",
      "market_share_estimate": "X%",
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "recent_moves": ["move1", "move2"],
      "predicted_next_moves": ["prediction1", "prediction2"],
      "vulnerability_score": 0-100
    }
  ],
  "porter_forces": {
    "competitive_rivalry": { "intensity": "high|medium|low", "factors": ["factor1", "factor2"] },
    "supplier_power": { "intensity": "high|medium|low", "factors": ["factor1", "factor2"] },
    "buyer_power": { "intensity": "high|medium|low", "factors": ["factor1", "factor2"] },
    "threat_new_entrants": { "intensity": "high|medium|low", "factors": ["factor1", "factor2"] },
    "threat_substitutes": { "intensity": "high|medium|low", "factors": ["factor1", "factor2"] }
  },
  "strategic_recommendations": [
    {
      "action": "recommended action",
      "priority": "high|medium|low",
      "timeframe": "immediate|short-term|long-term",
      "expected_impact": "description",
      "risk_level": "high|medium|low"
    }
  ],
  "predictive_insights": {
    "market_consolidation_probability": "X%",
    "disruption_risk": "high|medium|low",
    "emerging_threats": ["threat1", "threat2"],
    "opportunity_windows": ["opportunity1", "opportunity2"]
  }
}

Use real market knowledge and be specific with insights.`,
        response_json_schema: {
          type: "object",
          properties: {
            company_profile: { type: "object" },
            competitors: { type: "array", items: { type: "object" } },
            porter_forces: { type: "object" },
            strategic_recommendations: { type: "array", items: { type: "object" } },
            predictive_insights: { type: "object" }
          }
        },
        add_context_from_internet: true
      });

      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error("Error analyzing competition:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getThreatColor = (level) => {
    switch (level) {
      case "high": return "text-red-400 bg-red-500/20 border-red-500/30";
      case "medium": return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "low": return "text-green-400 bg-green-500/20 border-green-500/30";
      default: return "text-slate-400 bg-slate-500/20 border-slate-500/30";
    }
  };

  const getForceIntensityColor = (intensity) => {
    switch (intensity) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Target className="w-5 h-5 text-purple-400" />
          M2 Competitive Intelligence Analyzer
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Predictive AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Your Company *</label>
            <Input
              placeholder="e.g., Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Industry</label>
            <Input
              placeholder="e.g., B2B SaaS, E-commerce"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Known Competitors (optional)</label>
          <Textarea
            placeholder="List known competitors, one per line..."
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-20"
          />
        </div>

        <Button
          onClick={analyzeCompetitiveLandscape}
          disabled={!companyName || isAnalyzing}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Competitive Landscape...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Analyze Competition
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4 mt-6">
            {/* Company Position */}
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{companyName}</h3>
                  <Badge className="bg-purple-500/30 text-purple-300 capitalize">
                    {analysis.company_profile?.market_position}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 mb-3">{analysis.company_profile?.competitive_advantage}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-green-400 mb-1">Strengths</p>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {analysis.company_profile?.strengths?.map((s, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-green-400" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-red-400 mb-1">Weaknesses</p>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {analysis.company_profile?.weaknesses?.map((w, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competitors */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Competitor Analysis</h4>
              {analysis.competitors?.map((comp, idx) => (
                <Card key={idx} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white">{comp.name}</h5>
                      <div className="flex items-center gap-2">
                        <Badge className={getThreatColor(comp.threat_level)}>
                          {comp.threat_level} threat
                        </Badge>
                        <span className="text-xs text-slate-400">{comp.market_share_estimate} share</span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Vulnerability Score</span>
                        <span>{comp.vulnerability_score}/100</span>
                      </div>
                      <Progress value={comp.vulnerability_score} className="h-1.5" />
                    </div>
                    <div className="mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                      <p className="text-xs text-yellow-400 font-medium mb-1">Predicted Next Moves</p>
                      <ul className="text-xs text-slate-300">
                        {comp.predicted_next_moves?.map((move, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            {move}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Porter's 5 Forces */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Porter's 5 Forces</h4>
                <div className="space-y-2">
                  {Object.entries(analysis.porter_forces || {}).map(([force, data]) => (
                    <div key={force} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-32 capitalize">
                        {force.replace(/_/g, ' ')}
                      </span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getForceIntensityColor(data.intensity)}`}
                          style={{ width: data.intensity === 'high' ? '100%' : data.intensity === 'medium' ? '60%' : '30%' }}
                        />
                      </div>
                      <span className={`text-xs capitalize ${data.intensity === 'high' ? 'text-red-400' : data.intensity === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {data.intensity}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategic Recommendations */}
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Strategic Recommendations
                </h4>
                <div className="space-y-2">
                  {analysis.strategic_recommendations?.map((rec, i) => (
                    <div key={i} className="p-2 bg-white/5 rounded border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white font-medium">{rec.action}</span>
                        <Badge className={getThreatColor(rec.priority === 'high' ? 'low' : rec.priority === 'low' ? 'high' : 'medium')}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{rec.expected_impact}</p>
                    </div>
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