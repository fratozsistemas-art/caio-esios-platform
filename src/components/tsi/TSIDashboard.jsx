
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, CheckCircle, Clock, AlertTriangle, FileText,
  Download, TrendingUp, Shield, Zap, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast"; // Assuming toast is imported from react-hot-toast or similar

export default function TSIDashboard({ project, onBack }) {
  const [selectedDeliverable, setSelectedDeliverable] = React.useState(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const { data: deliverables = [] } = useQuery({
    queryKey: ['tsi-deliverables', project.id],
    queryFn: () => base44.entities.TSIDeliverable.filter({ project_id: project.id }),
    initialData: [],
  });

  // ✅ FIX: Remove duplicates (keep only latest by deliverable_code)
  const uniqueDeliverables = React.useMemo(() => {
    const seen = new Map();

    // Sort by created_date DESC (newest first)
    const sorted = [...deliverables].sort((a, b) =>
      new Date(b.created_date) - new Date(a.created_date)
    );

    // Keep only first occurrence of each deliverable_code
    for (const deliverable of sorted) {
      if (!seen.has(deliverable.deliverable_code)) {
        seen.set(deliverable.deliverable_code, deliverable);
      }
    }

    return Array.from(seen.values());
  }, [deliverables]);

  const phaseGroups = {
    context: uniqueDeliverables.filter(d => d.phase === 'context'),
    strategy: uniqueDeliverables.filter(d => d.phase === 'strategy'),
    execution: uniqueDeliverables.filter(d => d.phase === 'execution')
  };

  const gateStatus = {
    gate_0: project.gate_0_status || 'pending',
    gate_1: project.gate_1_status || 'pending',
    gate_2: project.gate_2_status || 'pending'
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'blocked': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getGateIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'failed': return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case 'in_progress': return <Clock className="w-6 h-6 text-blue-400 animate-spin" />;
      default: return <Clock className="w-6 h-6 text-slate-400" />;
    }
  };

  const handleExportDeliverable = async (deliverable) => {
    setIsExporting(true);
    try {
      const response = await base44.functions.invoke('exportTSIReport', {
        deliverable_id: deliverable.id
      }, {
        responseType: 'arraybuffer' // Important for binary data
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deliverable.deliverable_code}_${deliverable.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success('✅ PDF exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('❌ Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFullProject = async () => {
    setIsExporting(true);
    try {
      const response = await base44.functions.invoke('exportTSIReport', {
        project_id: project.id
      }, {
        responseType: 'arraybuffer' // Important for binary data
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.replace(/[^a-z0-9]/gi, '_')}_Full_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success('✅ Full report exported!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('❌ Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
          <div className="flex items-center gap-3">
            <Badge className={project.mode === 'express' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}>
              {project.mode.toUpperCase()} MODE
            </Badge>
            <Badge className="bg-white/10 text-white">
              {project.status}
            </Badge>
          </div>
        </div>
        <Button
          onClick={handleExportFullProject}
          disabled={isExporting}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Full Report
            </>
          )}
        </Button>
      </div>

      {/* Scores Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-4xl font-bold text-white mb-1">
              {project.sci_ia_score || 0}
            </div>
            <div className="text-sm text-slate-400">
              SCI·IA Score
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Strategic Context Intelligence
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-6 text-center">
            <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-4xl font-bold text-white mb-1">
              {project.icv_ia_score || 0}
            </div>
            <div className="text-sm text-slate-400">
              ICV·IA Score
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Intelligence Confidence Value
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-4xl font-bold text-white mb-1">
              {project.clq_ia_score || 0}
            </div>
            <div className="text-sm text-slate-400">
              CLQ·IA Score
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Cognitive Load Quality
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phases & Gates */}
      <div className="space-y-6">
        {/* PHASE 1: CONTEXT */}
        <PhaseCard
          title="PHASE 1: CONTEXT"
          deliverables={phaseGroups.context}
          gateStatus={gateStatus.gate_0}
          gateName="GATE 0: Foundation Validation"
          onSelectDeliverable={setSelectedDeliverable}
        />

        {/* PHASE 2: STRATEGY */}
        <PhaseCard
          title="PHASE 2: STRATEGY"
          deliverables={phaseGroups.strategy}
          gateStatus={gateStatus.gate_1}
          gateName="GATE 1: Strategy Validation"
          onSelectDeliverable={setSelectedDeliverable}
        />

        {/* PHASE 3: EXECUTION (only if Enterprise) */}
        {project.mode === 'enterprise' && (
          <PhaseCard
            title="PHASE 3: EXECUTION"
            deliverables={phaseGroups.execution}
            gateStatus={gateStatus.gate_2}
            gateName="GATE 2: Execution Validation"
            onSelectDeliverable={setSelectedDeliverable}
          />
        )}
      </div>

      {/* Deliverable Detail Modal */}
      {selectedDeliverable && (
        <DeliverableModal
          deliverable={selectedDeliverable}
          onClose={() => setSelectedDeliverable(null)}
          onExport={() => handleExportDeliverable(selectedDeliverable)}
          isExporting={isExporting}
        />
      )}
    </div>
  );
}

// Phase Card Component
function PhaseCard({ title, deliverables, gateStatus, gateName, onSelectDeliverable }) {
  const completedCount = deliverables.filter(d => d.status === 'completed').length;
  const progress = deliverables.length > 0 ? (completedCount / deliverables.length) * 100 : 0;

  const getGateColor = (status) => {
    switch (status) {
      case 'passed': return 'from-green-500/10 to-emerald-500/10 border-green-500/30';
      case 'failed': return 'from-red-500/10 to-orange-500/10 border-red-500/30';
      case 'in_progress': return 'from-blue-500/10 to-cyan-500/10 border-blue-500/30';
      default: return 'from-slate-500/10 to-slate-500/10 border-slate-500/30';
    }
  };

  const getGateIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'failed': return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case 'in_progress': return <Clock className="w-6 h-6 text-blue-400 animate-spin" />;
      default: return <Clock className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="border-b border-white/10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">{title}</CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {completedCount}/{deliverables.length} completed
            </span>
            <Progress value={progress} className="w-32 h-2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {deliverables.map((deliverable) => (
            <DeliverableCard
              key={deliverable.id}
              deliverable={deliverable}
              onClick={() => onSelectDeliverable(deliverable)}
            />
          ))}
        </div>

        {/* Gate Status */}
        <Card className={`bg-gradient-to-r ${getGateColor(gateStatus)}`}>
          <CardContent className="p-4 flex items-center gap-4">
            {getGateIcon(gateStatus)}
            <div className="flex-1">
              <h4 className="text-white font-semibold">{gateName}</h4>
              <p className="text-slate-400 text-sm">
                Status: <span className="capitalize">{gateStatus}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

// Deliverable Card
function DeliverableCard({ deliverable, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20';
      case 'blocked': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4 animate-spin" />;
      case 'blocked': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card
      className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <Badge className={`${getStatusColor(deliverable.status)} flex items-center gap-1`}>
            {getStatusIcon(deliverable.status)}
            <span className="text-xs">{deliverable.deliverable_code}</span>
          </Badge>
        </div>

        <h4 className="text-white font-medium text-sm mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
          {deliverable.title}
        </h4>

        {deliverable.crv_score && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <span className="text-xs text-slate-400">CRV Score</span>
            <span className={`text-sm font-bold ${
              deliverable.crv_score >= 70 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {deliverable.crv_score}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Deliverable Detail Modal
function DeliverableModal({ deliverable, onClose, onExport, isExporting }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <Badge className="mb-2">{deliverable.deliverable_code}</Badge>
              <h2 className="text-2xl font-bold text-white">{deliverable.title}</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              ×
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Executive Summary */}
          {deliverable.executive_summary && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Executive Summary</h3>
              <p className="text-slate-300 leading-relaxed">{deliverable.executive_summary}</p>
            </div>
          )}

          {/* CRV Score */}
          {deliverable.crv_score && (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Confidence & Risk Validation</span>
                  <div className="text-3xl font-bold text-green-400">
                    {deliverable.crv_score}%
                  </div>
                </div>
                <Progress value={deliverable.crv_score} className="mt-3 h-2" />
              </CardContent>
            </Card>
          )}

          {/* Key Findings */}
          {deliverable.content?.key_findings && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Key Findings</h3>
              <ul className="space-y-2">
                {deliverable.content.key_findings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {deliverable.content?.recommendations && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {deliverable.content.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Assumptions */}
          {deliverable.assumptions && deliverable.assumptions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Assumptions</h3>
              <div className="space-y-2">
                {deliverable.assumptions.map((assumption, idx) => (
                  <Card key={idx} className="bg-white/5 border-white/10">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-slate-300 text-sm flex-1">{assumption.assumption}</p>
                        <div className="flex gap-2">
                          <Badge className={
                            assumption.confidence === 'FATO'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }>
                            {assumption.confidence}
                          </Badge>
                          {assumption.impact_if_wrong && (
                            <Badge variant="outline" className="text-xs">
                              Impact: {assumption.impact_if_wrong}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/5"
            onClick={onExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
