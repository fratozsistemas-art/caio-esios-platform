import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Loader2, Sparkles, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function M4FinancialForecaster({ onForecastComplete }) {
  const [revenue, setRevenue] = useState("");
  const [growthRate, setGrowthRate] = useState("");
  const [industry, setIndustry] = useState("");
  const [forecastYears, setForecastYears] = useState("5");
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecast, setForecast] = useState(null);

  const generateForecast = async () => {
    if (!revenue) return;
    
    setIsForecasting(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior financial analyst. Generate a comprehensive financial forecast based on:

Current Annual Revenue: $${revenue}
Historical Growth Rate: ${growthRate || "Not specified"}%
Industry: ${industry || "Technology"}
Forecast Period: ${forecastYears} years

Generate forecast in the following JSON format:
{
  "base_case": {
    "revenue_projections": [{"year": 1, "revenue": 1000000, "growth": 20}, ...],
    "ebitda_margin_trend": [{"year": 1, "margin": 15}, ...],
    "free_cash_flow": [{"year": 1, "fcf": 150000}, ...],
    "terminal_value": 50000000,
    "dcf_valuation": 35000000,
    "implied_multiple": "8.5x"
  },
  "upside_case": {
    "revenue_projections": [...],
    "dcf_valuation": 45000000,
    "probability": 25
  },
  "downside_case": {
    "revenue_projections": [...],
    "dcf_valuation": 25000000,
    "probability": 20
  },
  "key_assumptions": {
    "revenue_growth_drivers": ["driver1", "driver2"],
    "margin_expansion_factors": ["factor1", "factor2"],
    "risk_factors": ["risk1", "risk2"],
    "wacc": 12,
    "terminal_growth_rate": 3
  },
  "sensitivity_analysis": {
    "growth_impact": {"1_pct_change": 5000000},
    "margin_impact": {"1_pct_change": 3000000},
    "wacc_impact": {"1_pct_change": -4000000}
  },
  "unit_economics": {
    "cac": 500,
    "ltv": 2500,
    "ltv_cac_ratio": 5,
    "payback_months": 12,
    "gross_margin": 70
  },
  "recommendations": ["recommendation1", "recommendation2"]
}

Use realistic financial assumptions for the ${industry || "technology"} industry.`,
        response_json_schema: {
          type: "object",
          properties: {
            base_case: { type: "object" },
            upside_case: { type: "object" },
            downside_case: { type: "object" },
            key_assumptions: { type: "object" },
            sensitivity_analysis: { type: "object" },
            unit_economics: { type: "object" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        },
        add_context_from_internet: true
      });

      setForecast(result);
      onForecastComplete?.(result);
    } catch (error) {
      console.error("Error generating forecast:", error);
    } finally {
      setIsForecasting(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <DollarSign className="w-5 h-5 text-green-400" />
          M4 AI Financial Forecaster
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            DCF & Valuation
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Current Annual Revenue *</label>
            <Input
              placeholder="e.g., 5000000"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              type="number"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Historical Growth Rate (%)</label>
            <Input
              placeholder="e.g., 25"
              value={growthRate}
              onChange={(e) => setGrowthRate(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              type="number"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Industry</label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saas">SaaS / Software</SelectItem>
                <SelectItem value="fintech">Fintech</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Forecast Period</label>
            <Select value={forecastYears} onValueChange={setForecastYears}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Years</SelectItem>
                <SelectItem value="5">5 Years</SelectItem>
                <SelectItem value="10">10 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={generateForecast}
          disabled={!revenue || isForecasting}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {isForecasting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Financial Forecast...</>
          ) : (
            <><BarChart3 className="w-4 h-4 mr-2" />Generate DCF Valuation</>
          )}
        </Button>

        {forecast && (
          <div className="space-y-4 mt-6">
            {/* Valuation Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-slate-400">Base Case DCF</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(forecast.base_case?.dcf_valuation)}</p>
                  <p className="text-xs text-slate-400">{forecast.base_case?.implied_multiple} Revenue</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-slate-400">Upside Case</p>
                  <p className="text-2xl font-bold text-blue-400">{formatCurrency(forecast.upside_case?.dcf_valuation)}</p>
                  <p className="text-xs text-slate-400">{forecast.upside_case?.probability}% probability</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-500/10 border-orange-500/30">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-slate-400">Downside Case</p>
                  <p className="text-2xl font-bold text-orange-400">{formatCurrency(forecast.downside_case?.dcf_valuation)}</p>
                  <p className="text-xs text-slate-400">{forecast.downside_case?.probability}% probability</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Chart */}
            {forecast.base_case?.revenue_projections && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Revenue Projection</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecast.base_case.revenue_projections}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip 
                          contentStyle={{ background: '#1F2937', border: '1px solid #374151' }}
                          formatter={(value) => [formatCurrency(value), 'Revenue']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B98130" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Unit Economics */}
            {forecast.unit_economics && (
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    Unit Economics
                  </h4>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-slate-400">CAC</p>
                      <p className="text-lg font-bold text-white">${forecast.unit_economics.cac}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">LTV</p>
                      <p className="text-lg font-bold text-white">${forecast.unit_economics.ltv}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">LTV:CAC</p>
                      <p className="text-lg font-bold text-green-400">{forecast.unit_economics.ltv_cac_ratio}x</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Payback</p>
                      <p className="text-lg font-bold text-white">{forecast.unit_economics.payback_months}mo</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Gross Margin</p>
                      <p className="text-lg font-bold text-white">{forecast.unit_economics.gross_margin}%</p>
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