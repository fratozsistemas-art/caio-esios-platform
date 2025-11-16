import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, AlertCircle, Lightbulb, Target } from "lucide-react";

export default function NetworkInsightsPanel({ analysis }) {
  if (!analysis?.insights) return null;

  const { insights, analysis: networkAnalysis } = analysis;

  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Network Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-300">{insights.executive_summary}</p>
          
          {networkAnalysis?.network_stats && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded p-2">
                <p className="text-slate-400">Density</p>
                <p className="text-white font-bold">{networkAnalysis.network_stats.network_density}</p>
              </div>
              <div className="bg-white/5 rounded p-2">
                <p className="text-slate-400">Avg Degree</p>
                <p className="text-white font-bold">{networkAnalysis.network_stats.average_degree}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Insights */}
      {insights.key_insights?.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.key_insights.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="text-xs text-slate-300 bg-white/5 rounded p-2">
                  • {insight}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interlocks */}
      {networkAnalysis?.interlocks?.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Board Interlocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {networkAnalysis.interlocks.slice(0, 3).map((interlock, idx) => (
                <div key={idx} className="bg-white/5 rounded p-2">
                  <p className="text-xs text-white font-medium">{interlock.executive.name}</p>
                  <p className="text-xs text-slate-400">{interlock.executive.title}</p>
                  <Badge className="mt-1 text-xs bg-purple-500/20 text-purple-400">
                    {interlock.companies.length} connections
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategic Opportunities */}
      {insights.strategic_opportunities?.length > 0 && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-green-400" />
              Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.strategic_opportunities.slice(0, 2).map((opp, idx) => (
                <div key={idx} className="text-xs text-green-300 bg-white/5 rounded p-2">
                  • {opp}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risks */}
      {insights.risks_identified?.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.risks_identified.slice(0, 2).map((risk, idx) => (
                <div key={idx} className="text-xs text-red-300 bg-white/5 rounded p-2">
                  • {risk}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}