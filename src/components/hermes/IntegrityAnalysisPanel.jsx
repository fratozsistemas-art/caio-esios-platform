import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertCircle, CheckCircle, Eye, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const ANALYSIS_TYPES = [
  { value: 'narrative_integrity', label: 'Integridade Narrativa', icon: Shield },
  { value: 'board_management_gap', label: 'Gap Board-Management', icon: AlertCircle },
  { value: 'silo_reconciliation', label: 'Reconciliação de Silos', icon: CheckCircle },
  { value: 'tension_analysis', label: 'Análise de Tensões', icon: AlertCircle },
  { value: 'coherence_check', label: 'Verificação de Coerência', icon: CheckCircle },
  { value: 'reasoning_audit', label: 'Auditoria de Raciocínio', icon: Eye }
];

export default function IntegrityAnalysisPanel({ hermesAnalyses, onSelectEntity }) {
  const [targetType, setTargetType] = useState('strategy');
  const [targetId, setTargetId] = useState('');
  const [selectedAnalysisTypes, setSelectedAnalysisTypes] = useState(['narrative_integrity', 'board_management_gap']);
  const queryClient = useQueryClient();

  const analyzeMutation = useMutation({
    mutationFn: async ({ target_entity_type, target_entity_id, analysis_types }) => {
      const response = await base44.functions.invoke('hermesAnalyzeIntegrity', {
        target_entity_type,
        target_entity_id,
        analysis_types
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['hermes_analyses']);
      queryClient.invalidateQueries(['cognitive_health_metrics']);
      toast.success('Análise Hermes concluída com sucesso');
      setTargetId('');
    },
    onError: (error) => {
      toast.error(`Erro na análise: ${error.message}`);
    }
  });

  const handleAnalyze = () => {
    if (!targetId) {
      toast.error('Selecione uma entidade para analisar');
      return;
    }

    analyzeMutation.mutate({
      target_entity_type: targetType,
      target_entity_id: targetId,
      analysis_types: selectedAnalysisTypes
    });
  };

  const toggleAnalysisType = (type) => {
    setSelectedAnalysisTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="space-y-6">
      {/* Analysis Configuration */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Nova Análise Hermes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Tipo de Entidade</label>
              <Select value={targetType} onValueChange={setTargetType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strategy">Estratégia</SelectItem>
                  <SelectItem value="analysis">Análise</SelectItem>
                  <SelectItem value="workspace">Workspace</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                  <SelectItem value="tsi_project">TSI Project</SelectItem>
                  <SelectItem value="workflow">Workflow de Agentes</SelectItem>
                  <SelectItem value="enrichment_suggestion">Sugestão de Enriquecimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">ID da Entidade</label>
              <Input
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="ID da entidade..."
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">Tipos de Análise</label>
            <div className="grid grid-cols-2 gap-2">
              {ANALYSIS_TYPES.map(type => {
                const Icon = type.icon;
                const isSelected = selectedAnalysisTypes.includes(type.value);
                return (
                  <div
                    key={type.value}
                    onClick={() => toggleAnalysisType(type.value)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border border-cyan-500/30'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className={`text-xs ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                      {type.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
          >
            <Search className="w-4 h-4 mr-2" />
            {analyzeMutation.isPending ? 'Analisando...' : 'Executar Análise Hermes'}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Análises Recentes</h3>
        {hermesAnalyses.map(analysis => (
          <Card key={analysis.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-2">
                    {analysis.analysis_type.replace(/_/g, ' ')}
                  </Badge>
                  <p className="text-xs text-slate-400">
                    {analysis.target_entity_type} • {new Date(analysis.created_date).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{Math.round(analysis.integrity_score || 0)}%</p>
                  <p className="text-xs text-slate-400">Integridade</p>
                </div>
              </div>

              {/* Inconsistencies */}
              {analysis.inconsistencies_detected && analysis.inconsistencies_detected.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs font-medium text-slate-300">Inconsistências Detectadas:</p>
                  {analysis.inconsistencies_detected.slice(0, 3).map((issue, idx) => (
                    <div key={idx} className={`p-2 rounded border ${
                      issue.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                      issue.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                      'bg-yellow-500/10 border-yellow-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-xs ${
                          issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          issue.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {issue.severity}
                        </Badge>
                        <span className="text-xs font-medium text-white">{issue.type}</span>
                      </div>
                      <p className="text-xs text-slate-400">{issue.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Board-Management Gaps */}
              {analysis.board_management_gaps && analysis.board_management_gaps.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs font-medium text-slate-300">Gaps Board-Management:</p>
                  {analysis.board_management_gaps.slice(0, 2).map((gap, idx) => (
                    <div key={idx} className="p-2 rounded bg-purple-500/10 border border-purple-500/30">
                      <p className="text-xs font-medium text-white">{gap.gap_type?.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-400 mt-1">{gap.description}</p>
                      <p className="text-xs text-cyan-400 mt-1">→ {gap.suggested_bridge}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Silos */}
              {analysis.silos_detected && analysis.silos_detected.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs font-medium text-slate-300">Silos Detectados:</p>
                  {analysis.silos_detected.slice(0, 2).map((silo, idx) => (
                    <div key={idx} className="p-2 rounded bg-orange-500/10 border border-orange-500/30">
                      <p className="text-xs font-medium text-white">{silo.silo_name}</p>
                      <p className="text-xs text-slate-400 mt-1">{silo.reconciliation_strategy}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tensions */}
              {analysis.organizational_tensions && analysis.organizational_tensions.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs font-medium text-slate-300">Tensões Organizacionais:</p>
                  {analysis.organizational_tensions.slice(0, 2).map((tension, idx) => (
                    <div key={idx} className="p-2 rounded bg-red-500/10 border border-red-500/30">
                      <p className="text-xs font-medium text-white">{tension.tension_type?.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-400 mt-1">{tension.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Severidade: {Math.round(tension.severity || 0)}%
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reasoning Trail */}
              {analysis.reasoning_trail && analysis.reasoning_trail.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs font-medium text-slate-300">Trilha de Raciocínio:</p>
                  <div className="space-y-2">
                    {analysis.reasoning_trail.slice(0, 3).map((step, idx) => (
                      <div key={idx} className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                        <p className="text-xs font-medium text-white">Passo {idx + 1}: {step.step}</p>
                        <p className="text-xs text-slate-400 mt-1">Premissa: {step.premise}</p>
                        <p className="text-xs text-slate-400">Conclusão: {step.conclusion}</p>
                        <p className="text-xs text-cyan-400 mt-1">
                          Confiança: {Math.round(step.confidence || 0)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs font-medium text-slate-300 mb-2">Recomendações:</p>
                  <ul className="space-y-1">
                    {analysis.recommendations.slice(0, 3).map((rec, idx) => (
                      <li key={idx} className="text-xs text-cyan-400 flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {hermesAnalyses.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Nenhuma análise Hermes realizada ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}