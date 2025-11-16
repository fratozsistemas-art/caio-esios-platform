import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HermesAnalyzeButton({ 
  entityType, 
  entityId, 
  onComplete,
  defaultAnalysisTypes = ['narrative_integrity', 'coherence_check'],
  variant = 'default',
  size = 'sm',
  showInline = false
}) {
  const [showResults, setShowResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('hermesAnalyzeIntegrity', {
        target_entity_type: entityType,
        target_entity_id: entityId,
        analysis_types: defaultAnalysisTypes
      });
      return response.data;
    },
    onSuccess: (data) => {
      setAnalysisResults(data);
      setShowResults(true);
      toast.success(`Hermes: Score de integridade ${Math.round(data.cognitive_health_score)}%`);
      onComplete?.();
    },
    onError: (error) => {
      toast.error(`Erro na análise Hermes: ${error.message}`);
    }
  });

  if (showInline && analysisResults) {
    return (
      <Badge 
        className={`${
          analysisResults.cognitive_health_score >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
          analysisResults.cognitive_health_score >= 60 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
          'bg-red-500/20 text-red-400 border-red-500/30'
        } cursor-pointer`}
        onClick={() => setShowResults(true)}
      >
        <Shield className="w-3 h-3 mr-1" />
        Hermes: {Math.round(analysisResults.cognitive_health_score)}%
      </Badge>
    );
  }

  return (
    <>
      <Button
        onClick={() => analyzeMutation.mutate()}
        disabled={analyzeMutation.isPending}
        variant={variant}
        size={size}
        className="gap-2"
      >
        {analyzeMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Shield className="w-4 h-4" />
        )}
        {analyzeMutation.isPending ? 'Analisando...' : 'Hermes Analyze'}
      </Button>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Hermes Analysis Results
            </DialogTitle>
          </DialogHeader>
          
          {analysisResults && (
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-slate-400 mb-2">Cognitive Health Score</p>
                <p className={`text-4xl font-bold ${
                  analysisResults.cognitive_health_score >= 80 ? 'text-green-400' :
                  analysisResults.cognitive_health_score >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {Math.round(analysisResults.cognitive_health_score)}%
                </p>
              </div>

              {/* Critical Issues */}
              {analysisResults.analyses?.some(a => 
                (a.inconsistencies_detected || []).some(i => i.severity === 'critical')
              ) && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Questões Críticas
                  </p>
                  {analysisResults.analyses.map((analysis, idx) => 
                    analysis.inconsistencies_detected
                      ?.filter(i => i.severity === 'critical')
                      .map((issue, i) => (
                        <div key={`${idx}-${i}`} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                          <p className="text-sm font-medium text-white">{issue.type}</p>
                          <p className="text-xs text-slate-400 mt-1">{issue.description}</p>
                          <p className="text-xs text-cyan-400 mt-2">→ {issue.recommendation}</p>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* Recommendations */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Recomendações
                </p>
                <ul className="space-y-1">
                  {analysisResults.analyses?.flatMap(a => a.recommendations || []).slice(0, 5).map((rec, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-400">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}