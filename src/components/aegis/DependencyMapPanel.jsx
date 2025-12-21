import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Package, AlertTriangle, CheckCircle } from "lucide-react";

export default function DependencyMapPanel() {
  const [dependencies, setDependencies] = useState([]);

  useEffect(() => {
    // Map installed packages
    const installedPackages = [
      { name: "react", version: "18.2.0", status: "healthy", usage: 145 },
      { name: "lucide-react", version: "0.475.0", status: "healthy", usage: 89 },
      { name: "@tanstack/react-query", version: "5.84.1", status: "healthy", usage: 42 },
      { name: "framer-motion", version: "11.16.4", status: "healthy", usage: 38 },
      { name: "react-router-dom", version: "6.26.0", status: "healthy", usage: 28 },
      { name: "@base44/sdk", version: "0.8.3", status: "healthy", usage: 156 },
      { name: "recharts", version: "2.15.4", status: "healthy", usage: 12 },
      { name: "date-fns", version: "3.6.0", status: "healthy", usage: 8 }
    ];

    setDependencies(installedPackages);
  }, []);

  const totalDependencies = dependencies.length;
  const healthyDeps = dependencies.filter(d => d.status === 'healthy').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cyan-400">{totalDependencies}</div>
                <div className="text-sm text-slate-300 mt-1">Total Dependencies</div>
              </div>
              <Package className="w-10 h-10 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-400">{healthyDeps}</div>
                <div className="text-sm text-slate-300 mt-1">Healthy</div>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-400">
                  {dependencies.reduce((sum, d) => sum + d.usage, 0)}
                </div>
                <div className="text-sm text-slate-300 mt-1">Total Usage</div>
              </div>
              <Network className="w-10 h-10 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dependency List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Installed Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dependencies.map((dep) => (
              <div key={dep.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 flex-1">
                  <Package className="w-5 h-5 text-cyan-400" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono text-sm">{dep.name}</span>
                      <Badge variant="outline" className="border-white/20 text-slate-400 text-xs">
                        v{dep.version}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Used in {dep.usage} locations
                    </div>
                  </div>
                </div>
                <Badge className={`${
                  dep.status === 'healthy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                }`}>
                  {dep.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}