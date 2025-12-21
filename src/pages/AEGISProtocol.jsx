import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  RefreshCw,
  FileCode,
  Database,
  Network,
  Zap,
  Layers,
  Activity,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import ComponentHealthPanel from "../components/aegis/ComponentHealthPanel";
import DependencyMapPanel from "../components/aegis/DependencyMapPanel";
import EntityValidationPanel from "../components/aegis/EntityValidationPanel";
import IntegrationStatusPanel from "../components/aegis/IntegrationStatusPanel";
import ArchitectureVisualization from "../components/aegis/ArchitectureVisualization";
import TestRunnerPanel from "../components/aegis/TestRunnerPanel";

export default function AEGISProtocol() {
  const [activeTab, setActiveTab] = useState("overview");
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const { data: aegisResults, refetch: refetchAEGIS } = useQuery({
    queryKey: ['aegis_protocol'],
    queryFn: async () => {
      // Fetch AEGIS validations from backend
      const results = await base44.entities.AEGISProtocol.list('-created_date', 10);
      return results[0] || null;
    }
  });

  const runAEGISTests = useMutation({
    mutationFn: async () => {
      setIsRunning(true);
      try {
        // Execute AEGIS protocol validation
        const result = await base44.functions.invoke('executeAEGISProtocol', {
          target_entity_type: 'System',
          target_entity_id: 'global',
          validation_scope: 'full'
        });
        
        setTestResults(result.data);
        await refetchAEGIS();
        return result;
      } finally {
        setIsRunning(false);
      }
    }
  });

  const overallHealth = aegisResults ? {
    score: aegisResults.overall_aegis_score || 0,
    status: aegisResults.status || 'unknown',
    lastRun: aegisResults.created_date,
    criticalIssues: (aegisResults.hard_stops_triggered || []).filter(h => h.severity === 'hard_stop').length
  } : {
    score: 0,
    status: 'not_run',
    lastRun: null,
    criticalIssues: 0
  };

  const getStatusColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-cyan-400" />
            AEGIS Protocol
          </h1>
          <p className="text-slate-400">
            Architecture, Entities, Governance, Integrity & Security Validation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => refetchAEGIS()}
            variant="outline"
            size="sm"
            className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => runAEGISTests.mutate()}
            disabled={isRunning}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Full Validation
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Overall Score</span>
              {getStatusIcon(overallHealth.status)}
            </div>
            <div className={`text-3xl font-bold ${getStatusColor(overallHealth.score)}`}>
              {overallHealth.score}%
            </div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${
                  overallHealth.score >= 90 ? 'from-green-400 to-emerald-400' :
                  overallHealth.score >= 70 ? 'from-yellow-400 to-orange-400' :
                  'from-red-400 to-red-600'
                }`}
                style={{ width: `${overallHealth.score}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Critical Issues</span>
              <AlertTriangle className={`w-5 h-5 ${overallHealth.criticalIssues > 0 ? 'text-red-400' : 'text-green-400'}`} />
            </div>
            <div className={`text-3xl font-bold ${overallHealth.criticalIssues > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {overallHealth.criticalIssues}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {overallHealth.criticalIssues === 0 ? 'All systems operational' : 'Requires attention'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Status</span>
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <Badge className={`text-sm font-semibold ${
              overallHealth.status === 'passed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              overallHealth.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}>
              {overallHealth.status?.toUpperCase() || 'NOT RUN'}
            </Badge>
            <div className="text-xs text-slate-500 mt-3">
              {overallHealth.lastRun ? `Last run: ${new Date(overallHealth.lastRun).toLocaleString()}` : 'Never run'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Test Coverage</span>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400">
              {aegisResults?.execution_metadata?.checks_performed || 0}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Validation checks
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20">
            <Shield className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="components" className="data-[state=active]:bg-cyan-500/20">
            <FileCode className="w-4 h-4 mr-2" />
            Components
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="data-[state=active]:bg-cyan-500/20">
            <Network className="w-4 h-4 mr-2" />
            Dependencies
          </TabsTrigger>
          <TabsTrigger value="entities" className="data-[state=active]:bg-cyan-500/20">
            <Database className="w-4 h-4 mr-2" />
            Entities
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-cyan-500/20">
            <Zap className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="architecture" className="data-[state=active]:bg-cyan-500/20">
            <Layers className="w-4 h-4 mr-2" />
            Architecture
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <TestRunnerPanel aegisResults={aegisResults} testResults={testResults} />
        </TabsContent>

        <TabsContent value="components" className="mt-6">
          <ComponentHealthPanel />
        </TabsContent>

        <TabsContent value="dependencies" className="mt-6">
          <DependencyMapPanel />
        </TabsContent>

        <TabsContent value="entities" className="mt-6">
          <EntityValidationPanel />
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <IntegrationStatusPanel />
        </TabsContent>

        <TabsContent value="architecture" className="mt-6">
          <ArchitectureVisualization />
        </TabsContent>
      </Tabs>
    </div>
  );
}