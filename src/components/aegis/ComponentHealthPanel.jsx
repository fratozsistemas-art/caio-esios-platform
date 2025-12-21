import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, AlertTriangle, Search, FileCode } from "lucide-react";

export default function ComponentHealthPanel() {
  const [components, setComponents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scan components for health issues
    scanComponents();
  }, []);

  const scanComponents = async () => {
    setLoading(true);
    
    // Simulate component scanning (in production, this would call a backend function)
    const mockComponents = [
      {
        name: "Dashboard",
        path: "pages/Dashboard.jsx",
        status: "healthy",
        imports: 30,
        dependencies: ["@tanstack/react-query", "lucide-react", "framer-motion"],
        issues: []
      },
      {
        name: "KnowledgeGraphWidget",
        path: "components/dashboard/KnowledgeGraphWidget.jsx",
        status: "healthy",
        imports: 8,
        dependencies: ["lucide-react"],
        issues: []
      },
      {
        name: "ComparisonAIvsConsulting",
        path: "pages/ComparisonAIvsConsulting.jsx",
        status: "warning",
        imports: 7,
        dependencies: ["lucide-react"],
        issues: [
          {
            type: "missing_import",
            severity: "warning",
            message: "Database icon used in child components but not imported"
          }
        ]
      },
      {
        name: "FounderProfile",
        path: "pages/FounderProfile.jsx",
        status: "healthy",
        imports: 5,
        dependencies: ["lucide-react"],
        issues: []
      },
      {
        name: "Landing",
        path: "pages/Landing.jsx",
        status: "healthy",
        imports: 25,
        dependencies: ["framer-motion", "lucide-react"],
        issues: []
      }
    ];

    setComponents(mockComponents);
    setLoading(false);
  };

  const filteredComponents = components.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.path.toLowerCase().includes(search.toLowerCase())
  );

  const healthCounts = components.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-400">{healthCounts.healthy || 0}</div>
                <div className="text-sm text-slate-300 mt-1">Healthy</div>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-400">{healthCounts.warning || 0}</div>
                <div className="text-sm text-slate-300 mt-1">Warnings</div>
              </div>
              <AlertTriangle className="w-10 h-10 text-yellow-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-400">{healthCounts.error || 0}</div>
                <div className="text-sm text-slate-300 mt-1">Errors</div>
              </div>
              <XCircle className="w-10 h-10 text-red-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search components..."
          className="pl-10 bg-white/5 border-white/10 text-white"
        />
      </div>

      {/* Component List */}
      <div className="space-y-3">
        {filteredComponents.map((component) => (
          <Card key={component.path} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileCode className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-semibold">{component.name}</span>
                    <Badge className={`${
                      component.status === 'healthy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      component.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {component.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400 mb-3">{component.path}</div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-300 mb-3">
                    <span>{component.imports} imports</span>
                    <span>•</span>
                    <span>{component.dependencies.length} dependencies</span>
                  </div>

                  {component.issues.length > 0 && (
                    <div className="space-y-2">
                      {component.issues.map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          {issue.severity === 'error' ? (
                            <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                          )}
                          <div>
                            <span className="text-slate-300">{issue.message}</span>
                            <Badge className="ml-2 text-xs">{issue.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}