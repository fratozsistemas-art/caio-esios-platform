import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, FileCode, Database, Zap, Network, Shield } from "lucide-react";

export default function ArchitectureVisualization() {
  const layers = [
    {
      name: "Presentation Layer",
      icon: FileCode,
      color: "cyan",
      components: ["Pages (45)", "Components (120)", "Layout"],
      health: "healthy"
    },
    {
      name: "Business Logic",
      icon: Zap,
      color: "purple",
      components: ["Agents (12)", "Functions (48)", "Workflows (8)"],
      health: "healthy"
    },
    {
      name: "Data Layer",
      icon: Database,
      color: "blue",
      components: ["Entities (85)", "Knowledge Graph", "Cache"],
      health: "healthy"
    },
    {
      name: "Integration Layer",
      icon: Network,
      color: "green",
      components: ["APIs (14)", "Webhooks (3)", "External Services"],
      health: "warning"
    },
    {
      name: "Security & Governance",
      icon: Shield,
      color: "yellow",
      components: ["AEGIS", "Hermes", "RBAC"],
      health: "healthy"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Architecture Layers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {layers.map((layer, idx) => {
              const Icon = layer.icon;
              return (
                <div key={idx} className="relative">
                  {idx < layers.length - 1 && (
                    <div className="absolute left-6 top-full h-4 w-0.5 bg-gradient-to-b from-white/20 to-transparent" />
                  )}
                  <div className={`p-4 rounded-lg border bg-gradient-to-br ${
                    layer.color === 'cyan' ? 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30' :
                    layer.color === 'purple' ? 'from-purple-500/10 to-pink-500/10 border-purple-500/30' :
                    layer.color === 'blue' ? 'from-blue-500/10 to-indigo-500/10 border-blue-500/30' :
                    layer.color === 'green' ? 'from-green-500/10 to-emerald-500/10 border-green-500/30' :
                    'from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          layer.color === 'cyan' ? 'bg-cyan-500/20' :
                          layer.color === 'purple' ? 'bg-purple-500/20' :
                          layer.color === 'blue' ? 'bg-blue-500/20' :
                          layer.color === 'green' ? 'bg-green-500/20' :
                          'bg-yellow-500/20'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            layer.color === 'cyan' ? 'text-cyan-400' :
                            layer.color === 'purple' ? 'text-purple-400' :
                            layer.color === 'blue' ? 'text-blue-400' :
                            layer.color === 'green' ? 'text-green-400' :
                            'text-yellow-400'
                          }`} />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{layer.name}</div>
                          <div className="text-xs text-slate-400">Layer {idx + 1} of {layers.length}</div>
                        </div>
                      </div>
                      <Badge className={`${
                        layer.health === 'healthy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {layer.health}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {layer.components.map((comp, compIdx) => (
                        <Badge key={compIdx} variant="outline" className="border-white/20 text-slate-300">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Architecture Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="text-sm text-slate-400 mb-1">Total Components</div>
            <div className="text-3xl font-bold text-white">280+</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="text-sm text-slate-400 mb-1">Architecture Depth</div>
            <div className="text-3xl font-bold text-white">5 Layers</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="text-sm text-slate-400 mb-1">Health Score</div>
            <div className="text-3xl font-bold text-green-400">98%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}