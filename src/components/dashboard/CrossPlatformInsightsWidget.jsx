import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitMerge, TrendingUp, AlertTriangle, Target, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function CrossPlatformInsightsWidget() {
  const { data: recentAnalysis } = useQuery({
    queryKey: ['recentCrossPlatformAnalysis'],
    queryFn: async () => {
      const analyses = await base44.entities.Analysis.filter({
        title: 'Cross-Platform Intelligence Report'
      });
      return analyses.sort((a, b) => 
        new Date(b.completed_at) - new Date(a.completed_at)
      )[0];
    }
  });

  const insights = recentAnalysis?.results;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-blue-400" />
            Cross-Platform Insights
          </CardTitle>
          <Link to={createPageUrl('Integrations')}>
            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {insights ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">Opportunities</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {insights.opportunities?.length || 0}
                </div>
              </div>
              <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400">Risks</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {insights.risk_signals?.length || 0}
                </div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-400">Trends</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {insights.emergent_trends?.length || 0}
                </div>
              </div>
            </div>

            {insights.opportunities?.slice(0, 2).map((opp, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-white text-sm font-medium">{opp.opportunity_title}</h4>
                  <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                    {opp.potential_value}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{opp.description.slice(0, 100)}...</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <GitMerge className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-3">No cross-platform analysis yet</p>
            <Link to={createPageUrl('Integrations')}>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Run Analysis
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}