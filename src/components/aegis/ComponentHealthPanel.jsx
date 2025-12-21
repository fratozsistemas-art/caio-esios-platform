import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, AlertTriangle, Search, FileCode, Download, Filter } from "lucide-react";
import ComponentDetailModal from "./ComponentDetailModal";
import { exportToCSV, exportToPDF } from "./ExportUtils";

export default function ComponentHealthPanel() {
  const [components, setComponents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedComponent, setSelectedComponent] = useState(null);

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
        type: "page",
        status: "healthy",
        imports: 30,
        dependencies: ["@tanstack/react-query", "lucide-react", "framer-motion"],
        issues: []
      },
      {
        name: "KnowledgeGraphWidget",
        path: "components/dashboard/KnowledgeGraphWidget.jsx",
        type: "component",
        status: "healthy",
        imports: 8,
        dependencies: ["lucide-react"],
        issues: []
      },
      {
        name: "ComparisonAIvsConsulting",
        path: "pages/ComparisonAIvsConsulting.jsx",
        type: "page",
        status: "healthy",
        imports: 7,
        dependencies: ["lucide-react"],
        issues: []
      },
      {
        name: "FounderProfile",
        path: "pages/FounderProfile.jsx",
        type: "page",
        status: "healthy",
        imports: 5,
        dependencies: ["lucide-react"],
        issues: []
      },
      {
        name: "Landing",
        path: "pages/Landing.jsx",
        type: "page",
        status: "healthy",
        imports: 25,
        dependencies: ["framer-motion", "lucide-react"],
        issues: []
      },
      {
        name: "AEGISProtocol",
        path: "pages/AEGISProtocol.jsx",
        type: "page",
        status: "healthy",
        imports: 18,
        dependencies: ["@tanstack/react-query", "lucide-react", "framer-motion"],
        issues: []
      }
    ];

    setComponents(mockComponents);
    setLoading(false);
  };

  const filteredComponents = components.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.path.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesType = typeFilter === "all" || c.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const healthCounts = components.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const handleExportCSV = () => {
    const exportData = filteredComponents.map(c => ({
      name: c.name,
      path: c.path,
      type: c.type,
      status: c.status,
      imports: c.imports,
      dependencies: c.dependencies.join('; '),
      issues: c.issues.length
    }));
    exportToCSV(exportData, 'component_health_report');
  };

  const handleExportPDF = () => {
    const sections = [
      {
        title: 'Summary',
        content: `Total: ${components.length} | Healthy: ${healthCounts.healthy || 0} | Warnings: ${healthCounts.warning || 0} | Errors: ${healthCounts.error || 0}`
      },
      {
        title: 'Components',
        content: filteredComponents.map(c => 
          `${c.name} (${c.path}) - Status: ${c.status}, Imports: ${c.imports}, Dependencies: ${c.dependencies.length}`
        )
      }
    ];
    exportToPDF('Component Health Report', sections, 'component_health_report');
  };

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

      {/* Filters and Export */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search components..."
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1628] border-white/20">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1628] border-white/20">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="page">Pages</SelectItem>
                <SelectItem value="component">Components</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component List */}
      <div className="space-y-3">
        {filteredComponents.map((component) => (
          <Card 
            key={component.path} 
            className="bg-white/5 border-white/10 cursor-pointer hover:border-cyan-500/30 transition-all"
            onClick={() => setSelectedComponent(component)}
          >
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

      {/* Detail Modal */}
      <ComponentDetailModal
        component={selectedComponent}
        open={!!selectedComponent}
        onClose={() => setSelectedComponent(null)}
      />
    </div>
  );
}