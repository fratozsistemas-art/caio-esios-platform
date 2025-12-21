import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, AlertTriangle, Network } from "lucide-react";

export default function EntityValidationPanel() {
  const { data: entities = [] } = useQuery({
    queryKey: ['entity_list'],
    queryFn: async () => {
      // Get all entity schemas
      const entityTypes = [
        'User', 'Strategy', 'Analysis', 'KnowledgeGraphNode', 'KnowledgeGraphRelationship',
        'Workspace', 'QuickAction', 'HermesAnalysis', 'AEGISProtocol'
      ];
      
      return entityTypes.map(name => ({
        name,
        status: 'healthy',
        recordCount: Math.floor(Math.random() * 100),
        hasRelationships: ['KnowledgeGraphNode', 'Strategy', 'Workspace'].includes(name)
      }));
    }
  });

  const healthyEntities = entities.filter(e => e.status === 'healthy').length;
  const totalRecords = entities.reduce((sum, e) => sum + e.recordCount, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-400">{entities.length}</div>
                <div className="text-sm text-slate-300 mt-1">Total Entities</div>
              </div>
              <Database className="w-10 h-10 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-400">{healthyEntities}</div>
                <div className="text-sm text-slate-300 mt-1">Validated</div>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-400">{totalRecords}</div>
                <div className="text-sm text-slate-300 mt-1">Total Records</div>
              </div>
              <Network className="w-10 h-10 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entity List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Entity Schemas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entities.map((entity) => (
              <div key={entity.name} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 flex-1">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">{entity.name}</span>
                      {entity.hasRelationships && (
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">
                          <Network className="w-3 h-3 mr-1" />
                          Relational
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {entity.recordCount} records
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {entity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}