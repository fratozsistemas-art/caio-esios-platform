import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, TrendingDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ComplianceWidget() {
  const { data: issues = [] } = useQuery({
    queryKey: ['compliance-issues-widget'],
    queryFn: () => base44.entities.ComplianceIssue.filter({
      status: 'open'
    }, '-created_date', 10),
    refetchInterval: 60000
  });

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const highCount = issues.filter(i => i.severity === 'high').length;

  return (
    <Card className="bg-white/5 border-white/10 h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <Shield className="w-4 h-4 text-red-400" />
          Compliance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="text-center py-6">
            <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">All Clear</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
                <p className="text-xs text-slate-400">Critical</p>
              </div>
              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-400">{highCount}</p>
                <p className="text-xs text-slate-400">High</p>
              </div>
            </div>

            <div className="space-y-2">
              {issues.slice(0, 3).map((issue) => (
                <div key={issue.id} className="p-2 bg-white/5 rounded border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={
                      issue.severity === 'critical' ? 'bg-red-500/20 text-red-400 text-[10px]' :
                      'bg-orange-500/20 text-orange-400 text-[10px]'
                    }>
                      {issue.severity}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(issue.created_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white text-xs truncate">{issue.violation_description}</p>
                </div>
              ))}
            </div>

            <Link to={createPageUrl('ComplianceMonitoring')}>
              <Button variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10">
                View All Issues
                <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}