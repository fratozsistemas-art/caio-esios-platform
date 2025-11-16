import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, AlertTriangle, CheckCircle, Brain, TrendingUp, TrendingDown,
  Minus, Eye, FileText, Briefcase, MessageSquare, GitMerge
} from "lucide-react";
import HermesNeuralMap from "../components/hermes/HermesNeuralMap";
import IntegrityAnalysisPanel from "../components/hermes/IntegrityAnalysisPanel";
import BoardManagementBridge from "../components/hermes/BoardManagementBridge";

export default function HermesTrustBroker() {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [viewMode, setViewMode] = useState('neural_map');
  const queryClient = useQueryClient();

  const { data: cognitiveMetrics = [] } = useQuery({
    queryKey: ['cognitive_health_metrics'],
    queryFn: () => base44.entities.CognitiveHealthMetric.list('-measured_at', 50)
  });

  const { data: hermesAnalyses = [] } = useQuery({
    queryKey: ['hermes_analyses'],
    queryFn: () => base44.entities.HermesAnalysis.list('-created_date', 20)
  });

  const overallHealth = cognitiveMetrics.length > 0
    ? cognitiveMetrics.reduce((sum, m) => sum + m.current_score, 0) / cognitiveMetrics.length
    : 0;

  const criticalIssues = hermesAnalyses.filter(a => 
    (a.inconsistencies_detected || []).some(i => i.severity === 'critical')
  ).length;

  const healthTrend = cognitiveMetrics.length > 1
    ? cognitiveMetrics[0].current_score > cognitiveMetrics[1].current_score
      ? 'improving'
      : cognitiveMetrics[0].current_score < cognitiveMetrics[1].current_score
        ? 'declining'
        : 'stable'
    : 'stable';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            Hermes Trust-Broker
          </h1>
          <p className="text-slate-400 mt-1">
            Governança cognitiva e mediação Board-Management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode('neural_map')}
            className={viewMode === 'neural_map'
              ? 'bg-cyan-600 hover:bg-cyan-700'
              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            }
          >
            <Brain className="w-4 h-4 mr-2" />
            Neural Map
          </Button>
          <Button
            onClick={() => setViewMode('analyses')}
            className={viewMode === 'analyses'
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            }
          >
            <Eye className="w-4 h-4 mr-2" />
            Análises
          </Button>
          <Button
            onClick={() => setViewMode('board_bridge')}
            className={viewMode === 'board_bridge'
              ? 'bg-orange-600 hover:bg-orange-700'
              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            }
          >
            <GitMerge className="w-4 h-4 mr-2" />
            Board Bridge
          </Button>
        </div>
      </div>

      {/* Cognitive Health Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Saúde Cognitiva</p>
                <p className="text-2xl font-bold text-white">{Math.round(overallHealth)}%</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                overallHealth >= 80 ? 'bg-green-500/20' :
                overallHealth >= 60 ? 'bg-yellow-500/20' :
                'bg-red-500/20'
              }`}>
                <Brain className={`w-6 h-6 ${
                  overallHealth >= 80 ? 'text-green-400' :
                  overallHealth >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Questões Críticas</p>
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
                <p className="text-xs text-slate-400">Tendência</p>
                <p className="text-sm font-bold text-white capitalize">{healthTrend}</p>
              </div>
              {healthTrend === 'improving' && <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />}
              {healthTrend === 'declining' && <TrendingDown className="w-8 h-8 text-red-400 opacity-50" />}
              {healthTrend === 'stable' && <Minus className="w-8 h-8 text-blue-400 opacity-50" />}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Análises Realizadas</p>
                <p className="text-2xl font-bold text-white">{hermesAnalyses.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main View */}
      {viewMode === 'neural_map' && (
        <HermesNeuralMap 
          cognitiveMetrics={cognitiveMetrics}
          hermesAnalyses={hermesAnalyses}
        />
      )}

      {viewMode === 'analyses' && (
        <IntegrityAnalysisPanel
          hermesAnalyses={hermesAnalyses}
          onSelectEntity={setSelectedEntity}
        />
      )}

      {viewMode === 'board_bridge' && (
        <BoardManagementBridge
          hermesAnalyses={hermesAnalyses.filter(a => a.analysis_type === 'board_management_gap')}
        />
      )}
    </div>
  );
}