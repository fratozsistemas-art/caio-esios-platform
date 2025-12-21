import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, Building2, TrendingUp, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function KnowledgeGraphWidget({ graphStats }) {
  const nodesByType = graphStats?.nodes_by_type || {};
  const totalNodes = graphStats?.total_nodes || 0;
  const totalRels = graphStats?.total_relationships || 0;

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            Knowledge Graph
          </CardTitle>
          <Link to={createPageUrl('KnowledgeGraph')}>
            <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg p-3 border border-cyan-500/30">
            <div className="text-2xl font-bold text-white">{totalNodes}</div>
            <div className="text-xs text-slate-400">Nodes</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-500/30">
            <div className="text-2xl font-bold text-white">{totalRels}</div>
            <div className="text-xs text-slate-400">Connections</div>
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(nodesByType).slice(0, 4).map(([type, count]) => {
            const icons = {
              company: Building2,
              industry: TrendingUp,
              strategy: Target,
              metric: TrendingUp
            };
            const Icon = icons[type] || Network;
            
            return (
              <div key={type} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300 capitalize">{type}</span>
                </div>
                <Badge variant="outline" className="border-white/20 text-white">
                  {count}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}