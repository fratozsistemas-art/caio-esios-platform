import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, CheckCircle, XCircle, Clock, Search, Download, Filter } from "lucide-react";
import { exportToCSV, exportToPDF } from "./ExportUtils";

export default function IntegrationStatusPanel() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const integrations = [
    { name: "OpenAI", status: "healthy", latency: 234, uptime: 99.9 },
    { name: "Anthropic", status: "healthy", latency: 189, uptime: 99.8 },
    { name: "Stripe", status: "error", latency: null, uptime: 0, error: "Invalid API Key" },
    { name: "LinkedIn", status: "healthy", latency: 456, uptime: 98.5 },
    { name: "Neo4j", status: "healthy", latency: 123, uptime: 99.7 }
  ];

  const healthyCount = integrations.filter(i => i.status === 'healthy').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  const filteredIntegrations = integrations.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const exportData = filteredIntegrations.map(i => ({
      name: i.name,
      status: i.status,
      latency: i.latency || 'N/A',
      uptime: i.uptime ? `${i.uptime}%` : 'N/A',
      error: i.error || ''
    }));
    exportToCSV(exportData, 'integration_status_report');
  };

  const handleExportPDF = () => {
    const sections = [
      {
        title: 'Summary',
        content: `Total: ${integrations.length} | Operational: ${healthyCount} | Errors: ${errorCount}`
      },
      {
        title: 'Integrations',
        content: filteredIntegrations.map(i => 
          `${i.name} - Status: ${i.status}${i.latency ? `, Latency: ${i.latency}ms` : ''}${i.error ? `, Error: ${i.error}` : ''}`
        )
      }
    ];
    exportToPDF('Integration Status Report', sections, 'integration_status_report');
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-400">{integrations.length}</div>
                <div className="text-sm text-slate-300 mt-1">Total Integrations</div>
              </div>
              <Zap className="w-10 h-10 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-400">{healthyCount}</div>
                <div className="text-sm text-slate-300 mt-1">Operational</div>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-400">{errorCount}</div>
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
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search integrations..."
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1628] border-white/20">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
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
        </CardContent>
      </Card>

      {/* Integration List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Integration Health ({filteredIntegrations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredIntegrations.map((integration) => (
              <div key={integration.name} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-semibold">{integration.name}</span>
                  </div>
                  <Badge className={`${
                    integration.status === 'healthy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {integration.status === 'healthy' ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Operational</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> Error</>
                    )}
                  </Badge>
                </div>
                
                {integration.status === 'healthy' ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Latency</div>
                      <div className="text-white font-semibold">{integration.latency}ms</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Uptime</div>
                      <div className="text-white font-semibold">{integration.uptime}%</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-sm text-red-400">
                    <XCircle className="w-4 h-4 mt-0.5" />
                    <span>{integration.error}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}