import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Loader2, Sparkles, DollarSign, Building2, Users, Target } from "lucide-react";

export default function M9FundingIntelligence({ onAnalysisComplete }) {
  const [companyInfo, setCompanyInfo] = useState("");
  const [fundingNeed, setFundingNeed] = useState("");
  const [stage, setStage] = useState("");
  const [industry, setIndustry] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeFunding = async () => {
    if (!companyInfo || !fundingNeed) return;
    
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an investment banking advisor specializing in capital strategy. Analyze:

Company Information:
${companyInfo}

Funding Need: $${fundingNeed}
Stage: ${stage || "Growth"}
Industry: ${industry || "Technology"}

Generate comprehensive funding analysis:

{
  "funding_strategy": {
    "recommended_structure": "equity|debt|hybrid|revenue-based",
    "optimal_timing": "immediate|3-6 months|6-12 months",
    "rationale": "why this structure and timing"
  },
  "valuation_analysis": {
    "estimated_pre_money": "$XXM",
    "valuation_method": "method used",
    "comparable_multiples": {"revenue": "X.Xx", "ebitda": "X.Xx"},
    "key_value_drivers": ["driver1", "driver2"],
    "valuation_risks": ["risk1", "risk2"]
  },
  "investor_landscape": [
    {
      "investor_type": "VC|PE|Strategic|Family Office|Debt Provider",
      "fit_score": 0-100,
      "typical_check_size": "$XM-$XM",
      "key_criteria": ["criteria1", "criteria2"],
      "example_firms": ["firm1", "firm2"],
      "approach_strategy": "how to approach"
    }
  ],
  "deal_structure": {
    "recommended_terms": {
      "equity_percentage": "XX%",
      "board_seats": 1,
      "liquidation_preference": "1x non-participating",
      "anti_dilution": "broad-based weighted average"
    },
    "negotiation_priorities": ["priority1", "priority2"],
    "terms_to_avoid": ["term1", "term2"]
  },
  "use_of_funds": {
    "recommended_allocation": {
      "product_development": 30,
      "sales_marketing": 40,
      "operations": 20,
      "reserve": 10
    },
    "milestone_based_deployment": [
      {"milestone": "description", "capital_required": "$XM", "timeline": "Q1"}
    ]
  },
  "pitch_positioning": {
    "key_narratives": ["narrative1", "narrative2"],
    "proof_points_needed": ["point1", "point2"],
    "anticipated_objections": [
      {"objection": "description", "counter": "response"}
    ]
  },
  "timeline": {
    "preparation_weeks": 4,
    "fundraising_months": 4,
    "key_milestones": [
      {"milestone": "description", "week": 2}
    ]
  },
  "success_probability": {
    "overall": 70,
    "by_investor_type": {"vc": 60, "strategic": 80, "debt": 75}
  }
}

Use current market conditions and realistic expectations.`,
        response_json_schema: {
          type: "object",
          properties: {
            funding_strategy: { type: "object" },
            valuation_analysis: { type: "object" },
            investor_landscape: { type: "array", items: { type: "object" } },
            deal_structure: { type: "object" },
            use_of_funds: { type: "object" },
            pitch_positioning: { type: "object" },
            timeline: { type: "object" },
            success_probability: { type: "object" }
          }
        },
        add_context_from_internet: true
      });

      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error("Error analyzing funding:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          M9 AI Funding Intelligence
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Capital Strategy
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Company Information *</label>
          <Textarea
            placeholder="Describe your company: revenue, growth rate, business model, team, traction..."
            value={companyInfo}
            onChange={(e) => setCompanyInfo(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-24"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Funding Need ($) *</label>
            <Input
              placeholder="e.g., 10000000"
              value={fundingNeed}
              onChange={(e) => setFundingNeed(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              type="number"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Stage</label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seed">Seed</SelectItem>
                <SelectItem value="series-a">Series A</SelectItem>
                <SelectItem value="series-b">Series B</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="pre-ipo">Pre-IPO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Industry</label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saas">SaaS</SelectItem>
                <SelectItem value="fintech">Fintech</SelectItem>
                <SelectItem value="healthtech">Healthtech</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="deeptech">Deep Tech</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={analyzeFunding}
          disabled={!companyInfo || !fundingNeed || isAnalyzing}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing Funding Strategy...</>
          ) : (
            <><DollarSign className="w-4 h-4 mr-2" />Generate Funding Intelligence</>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4 mt-6">
            {/* Funding Strategy */}
            {analysis.funding_strategy && (
              <Card className="bg-emerald-500/10 border-emerald-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-3">Recommended Strategy</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Structure</p>
                      <p className="text-lg font-bold text-white capitalize">{analysis.funding_strategy.recommended_structure}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Timing</p>
                      <p className="text-lg font-bold text-white capitalize">{analysis.funding_strategy.optimal_timing}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mt-3">{analysis.funding_strategy.rationale}</p>
                </CardContent>
              </Card>
            )}

            {/* Valuation */}
            {analysis.valuation_analysis && (
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-blue-400 mb-3">Valuation Analysis</h4>
                  <div className="text-center mb-3">
                    <p className="text-xs text-slate-400">Estimated Pre-Money</p>
                    <p className="text-3xl font-bold text-white">{analysis.valuation_analysis.estimated_pre_money}</p>
                    <p className="text-xs text-slate-400">Method: {analysis.valuation_analysis.valuation_method}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-white/5 rounded text-center">
                      <p className="text-xs text-slate-400">Revenue Multiple</p>
                      <p className="text-lg font-bold text-blue-400">{analysis.valuation_analysis.comparable_multiples?.revenue}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded text-center">
                      <p className="text-xs text-slate-400">EBITDA Multiple</p>
                      <p className="text-lg font-bold text-blue-400">{analysis.valuation_analysis.comparable_multiples?.ebitda}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Investor Landscape */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                Investor Landscape
              </h4>
              {analysis.investor_landscape?.map((investor, idx) => (
                <Card key={idx} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white">{investor.investor_type}</h5>
                      <Badge className={`${investor.fit_score >= 70 ? 'bg-green-500/20 text-green-400' : investor.fit_score >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {investor.fit_score}% fit
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">Check size: {investor.typical_check_size}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {investor.example_firms?.map((firm, i) => (
                        <Badge key={i} className="bg-white/10 text-slate-300 text-xs">{firm}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-emerald-400">→ {investor.approach_strategy}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Success Probability */}
            {analysis.success_probability && (
              <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30">
                <CardContent className="p-4 text-center">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2">Success Probability</h4>
                  <p className="text-4xl font-bold text-white">{analysis.success_probability.overall}%</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Timeline: {analysis.timeline?.preparation_weeks} weeks prep + {analysis.timeline?.fundraising_months} months raise
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}