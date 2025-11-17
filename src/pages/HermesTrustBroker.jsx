
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Activity, TrendingUp, AlertCircle, Network, Layers, AlertTriangle } from "lucide-react";
import HermesNeuralMap from "../components/hermes/HermesNeuralMap";
import IntegrityAnalysisPanel from "../components/hermes/IntegrityAnalysisPanel";
import BoardManagementBridge from "../components/hermes/BoardManagementBridge";
import RemediationTracker from "../components/hermes/RemediationTracker";

export default function HermesTrustBroker() {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [viewMode, setViewMode] = useState('neural_map');

  const { data: hermesAnalyses = [] } = useQuery({
    queryKey: ['hermes_analyses'],
    queryFn: () => base44.entities.HermesAnalysis.list('-created_date', 50)
  });

  const { data: cognitiveMetrics = [] } = useQuery({
    queryKey: ['cognitive_health_metrics'],
    queryFn: () => base44.entities.CognitiveHealthMetric.list('-measured_at', 20)
  });

  const { data: remediations = [] } = useQuery({
    queryKey: ['hermes_remediations'],
    queryFn: () => base44.entities.HermesRemediation.list('-action_taken_at', 50)
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['support_tickets'],
    queryFn: () => base44.entities.SupportTicket.filter({ ticket_type: { $in: ['hermes_critical', 'hermes_high'] } })
  });

  const overallHealth = cognitiveMetrics.length > 0
    ? cognitiveMetrics.reduce((sum, m) => sum + m.current_score, 0) / cognitiveMetrics.length
    : 0;

  const criticalIssues = hermesAnalyses.reduce((count, analysis) => {
    return count + (analysis.inconsistencies_detected || []).filter(i => i.severity === 'critical').length;
  }, 0);

  const healthTrend = cognitiveMetrics.length > 1
    ? cognitiveMetrics[0].current_score - cognitiveMetrics[1].current_score
    : 0;

  const analysisCount = hermesAnalyses.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            Hermes Trust-Broker
          </h1>
          <p className="text-slate-400 mt-1">
            Cognitive governance & board-management mediation layer
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode('neural_map')}
            variant={viewMode === 'neural_map' ? 'default' : 'outline'}
            size="sm"
            className={viewMode === 'neural_map' ? 'bg-cyan-600' : 'bg-white/5 border-white/10 text-white'}
          >
            <Network className="w-4 h-4 mr-2" />
            Neural Map
          </Button>
          <Button
            onClick={() => setViewMode('board_bridge')}
            variant={viewMode === 'board_bridge' ? 'default' : 'outline'}
            size="sm"
            className={viewMode === 'board_bridge' ? 'bg-cyan-600' : 'bg-white/5 border-white/10 text-white'}
          >
            Board Bridge
          </Button>
          <Button
            onClick={() => setViewMode('analysis')}
            variant={viewMode === 'analysis' ? 'default' : 'outline'}
            size="sm"
            className={viewMode === 'analysis' ? 'bg-cyan-600' : 'bg-white/5 border-white/10 text-white'}
          >
            Analysis
          </Button>
          <Button
            onClick={() => setViewMode('remediations')}
            variant={viewMode === 'remediations' ? 'default' : 'outline'}
            size="sm"
            className={viewMode === 'remediations' ? 'bg-cyan-600' : 'bg-white/5 border-white/10 text-white'}
          >
            <Layers className="w-4 h-4 mr-2" />
            Remediations
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Cognitive Health</p>
                <p className="text-2xl font-bold text-white">{Math.round(overallHealth)}%</p>
              </div>
              <Shield className={`w-8 h-8 ${overallHealth >= 80 ? 'text-green-400' : 'text-orange-400'} opacity-50`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Critical Issues</p>
                <p className="text-2xl font-bold text-white">{criticalIssues}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Health Trend</p>
                <p className={`text-2xl font-bold ${healthTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {healthTrend >= 0 ? '+' : ''}{healthTrend.toFixed(1)}
                </p>
              </div>
              <TrendingUp className={`w-8 h-8 ${healthTrend >= 0 ? 'text-green-400' : 'text-red-400'} opacity-50`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Analyses</p>
                <p className="text-2xl font-bold text-white">{analysisCount}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'neural_map' && (
        <HermesNeuralMap 
          hermesAnalyses={hermesAnalyses}
          cognitiveMetrics={cognitiveMetrics}
        />
      )}

      {viewMode === 'board_bridge' && (
        <BoardManagementBridge 
          hermesAnalyses={hermesAnalyses}
          onSelectEntity={setSelectedEntity}
        />
      )}

      {viewMode === 'analysis' && (
        <IntegrityAnalysisPanel
          hermesAnalyses={hermesAnalyses}
          onSelectEntity={setSelectedEntity}
        />
      )}

      {viewMode === 'remediations' && (
        <RemediationTracker
          remediations={remediations}
          tickets={tickets}
        />
      )}
    </div>
  );
}
