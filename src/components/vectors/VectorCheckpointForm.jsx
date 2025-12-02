import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  X, Save, Plus, Trash2, CheckCircle, AlertTriangle, 
  TrendingUp, TrendingDown, Sparkles, Brain, Loader2, 
  ArrowRight, RotateCcw, Zap, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

const CHECKPOINT_DECISIONS = [
  { value: 'maintain', label: 'Manter Direção', icon: ArrowRight, color: 'bg-blue-500/20 text-blue-400' },
  { value: 'accelerate', label: 'Acelerar', icon: Zap, color: 'bg-green-500/20 text-green-400' },
  { value: 'decelerate', label: 'Desacelerar', icon: TrendingDown, color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'redirect', label: 'Redirecionar', icon: RotateCcw, color: 'bg-purple-500/20 text-purple-400' },
  { value: 'pivot', label: 'Pivotar', icon: TrendingUp, color: 'bg-orange-500/20 text-orange-400' },
  { value: 'abort', label: 'Abortar', icon: X, color: 'bg-red-500/20 text-red-400' }
];

export default function VectorCheckpointForm({ decision, checkpointNumber, onClose, onSave }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    vector_decision_id: decision.id,
    checkpoint_number: checkpointNumber,
    checkpoint_date: format(new Date(), 'yyyy-MM-dd'),
    evidence_observed: [{ description: '', supports_vector: true, source: '' }],
    deviations: [{ description: '', severity: 'minor', cause: '' }],
    emergent_vectors: [],
    adjustments_needed: [],
    checkpoint_decision: 'maintain',
    decision_rationale: '',
    vector_health_score: 0.7,
    ai_analysis: null
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Create checkpoint
      const checkpoint = await base44.entities.VectorCheckpoint.create(data);
      
      // Update decision with new status and next checkpoint date
      const newStatus = data.checkpoint_decision === 'abort' ? 'aborted' 
        : data.checkpoint_decision === 'redirect' || data.checkpoint_decision === 'pivot' ? 'redirected'
        : 'monitoring';
      
      await base44.entities.VectorDecision.update(decision.id, {
        status: newStatus,
        next_checkpoint_date: format(addDays(new Date(), decision.checkpoint_interval_days || 7), 'yyyy-MM-dd')
      });

      return checkpoint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['vector_decisions']);
      queryClient.invalidateQueries(['vector_checkpoints']);
      toast.success('Checkpoint registrado com sucesso');
      onSave?.();
    },
    onError: (error) => {
      toast.error('Erro ao salvar: ' + error.message);
    }
  });

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise este checkpoint de vetor estratégico:

DECISÃO ORIGINAL: ${decision.title}
VETOR PRIMÁRIO: ${decision.primary_vector?.name} (${decision.primary_vector?.direction})
CHECKPOINT #${checkpointNumber}

EVIDÊNCIAS OBSERVADAS:
${formData.evidence_observed.map(e => `- ${e.description} (${e.supports_vector ? 'suporta' : 'contradiz'} vetor)`).join('\n')}

DESVIOS PERCEBIDOS:
${formData.deviations.map(d => `- ${d.description} (${d.severity})`).join('\n')}

VETORES EMERGENTES:
${formData.emergent_vectors.map(v => `- ${v.name} (${v.type})`).join('\n') || 'Nenhum'}

DECISÃO DO CHECKPOINT: ${formData.checkpoint_decision}

Analise e forneça em JSON:`,
        response_json_schema: {
          type: "object",
          properties: {
            trajectory_assessment: { type: "string", description: "Avaliação da trajetória do vetor" },
            risk_delta: { type: "number", description: "Mudança no risco (-1 a 1)" },
            recommendations: { type: "array", items: { type: "string" } },
            pattern_matches: { type: "array", items: { type: "string" }, description: "Padrões similares históricos" },
            health_score: { type: "number", description: "Score de saúde 0-1" },
            suggested_decision: { type: "string", enum: ["maintain", "accelerate", "decelerate", "redirect", "pivot", "abort"] }
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        ai_analysis: response,
        vector_health_score: response.health_score || prev.vector_health_score
      }));

      toast.success('Análise IA concluída');
    } catch (error) {
      toast.error('Erro na análise IA');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addEvidence = () => {
    setFormData(prev => ({
      ...prev,
      evidence_observed: [...prev.evidence_observed, { description: '', supports_vector: true, source: '' }]
    }));
  };

  const addDeviation = () => {
    setFormData(prev => ({
      ...prev,
      deviations: [...prev.deviations, { description: '', severity: 'minor', cause: '' }]
    }));
  };

  const addEmergentVector = () => {
    setFormData(prev => ({
      ...prev,
      emergent_vectors: [...prev.emergent_vectors, { name: '', type: 'neutral', intensity: 3, recommended_action: '' }]
    }));
  };

  const addAdjustment = () => {
    setFormData(prev => ({
      ...prev,
      adjustments_needed: [...prev.adjustments_needed, { area: '', adjustment: '', priority: 'medium', owner: '' }]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <Card className="bg-slate-900 border-purple-500/30">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  Checkpoint #{checkpointNumber}
                  <Badge className="bg-purple-500/20 text-purple-400">CAIO.VEC-03</Badge>
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">{decision.title}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto space-y-6">
            
            {/* Original Vector Summary */}
            <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <h4 className="text-sm text-cyan-400 mb-2">Vetor em Monitoramento</h4>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-white font-medium">{decision.primary_vector?.name}</p>
                  <p className="text-xs text-slate-400">
                    Direção: {decision.primary_vector?.direction} | Intensidade: {decision.primary_vector?.intensity}/5
                  </p>
                </div>
              </div>
            </div>

            {/* Evidence Observed */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  Checkpoint 1: Evidências Observadas
                </h3>
                <Button size="sm" variant="ghost" onClick={addEvidence} className="text-blue-400">
                  <Plus className="w-3 h-3 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="space-y-3">
                {formData.evidence_observed.map((ev, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        value={ev.description}
                        onChange={(e) => {
                          const updated = [...formData.evidence_observed];
                          updated[idx].description = e.target.value;
                          setFormData({ ...formData, evidence_observed: updated });
                        }}
                        placeholder="O que você observou?"
                        className="col-span-2 bg-white/5 border-white/10 text-white"
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={ev.supports_vector}
                          onCheckedChange={(checked) => {
                            const updated = [...formData.evidence_observed];
                            updated[idx].supports_vector = checked;
                            setFormData({ ...formData, evidence_observed: updated });
                          }}
                        />
                        <span className={`text-xs ${ev.supports_vector ? 'text-green-400' : 'text-red-400'}`}>
                          {ev.supports_vector ? 'Suporta' : 'Contradiz'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deviations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Checkpoint 2: Desvios Percebidos
                </h3>
                <Button size="sm" variant="ghost" onClick={addDeviation} className="text-yellow-400">
                  <Plus className="w-3 h-3 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="space-y-3">
                {formData.deviations.map((dev, idx) => (
                  <div key={idx} className="p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        value={dev.description}
                        onChange={(e) => {
                          const updated = [...formData.deviations];
                          updated[idx].description = e.target.value;
                          setFormData({ ...formData, deviations: updated });
                        }}
                        placeholder="O que saiu diferente?"
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Select
                        value={dev.severity}
                        onValueChange={(v) => {
                          const updated = [...formData.deviations];
                          updated[idx].severity = v;
                          setFormData({ ...formData, deviations: updated });
                        }}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minor">Menor</SelectItem>
                          <SelectItem value="moderate">Moderado</SelectItem>
                          <SelectItem value="significant">Significativo</SelectItem>
                          <SelectItem value="critical">Crítico</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={dev.cause}
                        onChange={(e) => {
                          const updated = [...formData.deviations];
                          updated[idx].cause = e.target.value;
                          setFormData({ ...formData, deviations: updated });
                        }}
                        placeholder="Causa provável"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergent Vectors */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Checkpoint 3: Vetores Emergentes
                </h3>
                <Button size="sm" variant="ghost" onClick={addEmergentVector} className="text-purple-400">
                  <Plus className="w-3 h-3 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="space-y-3">
                {formData.emergent_vectors.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Nenhum vetor emergente identificado</p>
                ) : (
                  formData.emergent_vectors.map((vec, idx) => (
                    <div key={idx} className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          value={vec.name}
                          onChange={(e) => {
                            const updated = [...formData.emergent_vectors];
                            updated[idx].name = e.target.value;
                            setFormData({ ...formData, emergent_vectors: updated });
                          }}
                          placeholder="Nome do vetor"
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <Select
                          value={vec.type}
                          onValueChange={(v) => {
                            const updated = [...formData.emergent_vectors];
                            updated[idx].type = v;
                            setFormData({ ...formData, emergent_vectors: updated });
                          }}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="opportunity">Oportunidade</SelectItem>
                            <SelectItem value="threat">Ameaça</SelectItem>
                            <SelectItem value="neutral">Neutro</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={vec.recommended_action}
                          onChange={(e) => {
                            const updated = [...formData.emergent_vectors];
                            updated[idx].recommended_action = e.target.value;
                            setFormData({ ...formData, emergent_vectors: updated });
                          }}
                          placeholder="Ação recomendada"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Adjustments */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-orange-400" />
                  Checkpoint 4: Ajustes Necessários
                </h3>
                <Button size="sm" variant="ghost" onClick={addAdjustment} className="text-orange-400">
                  <Plus className="w-3 h-3 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="space-y-3">
                {formData.adjustments_needed.map((adj, idx) => (
                  <div key={idx} className="p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={adj.area}
                        onChange={(e) => {
                          const updated = [...formData.adjustments_needed];
                          updated[idx].area = e.target.value;
                          setFormData({ ...formData, adjustments_needed: updated });
                        }}
                        placeholder="Área do ajuste"
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Input
                        value={adj.adjustment}
                        onChange={(e) => {
                          const updated = [...formData.adjustments_needed];
                          updated[idx].adjustment = e.target.value;
                          setFormData({ ...formData, adjustments_needed: updated });
                        }}
                        placeholder="O que precisa ajustar"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Decision */}
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                Checkpoint Final: Decisão
              </h3>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {CHECKPOINT_DECISIONS.map(dec => {
                  const Icon = dec.icon;
                  return (
                    <div
                      key={dec.value}
                      onClick={() => setFormData({ ...formData, checkpoint_decision: dec.value })}
                      className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                        formData.checkpoint_decision === dec.value
                          ? 'border-purple-500 ' + dec.color
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <p className="text-xs text-white">{dec.label}</p>
                    </div>
                  );
                })}
              </div>

              <div>
                <Label className="text-slate-300">Racional da Decisão</Label>
                <Textarea
                  value={formData.decision_rationale}
                  onChange={(e) => setFormData({ ...formData, decision_rationale: e.target.value })}
                  placeholder="Por que você tomou essa decisão?"
                  className="mt-1 bg-white/5 border-white/10 text-white h-20"
                />
              </div>
            </div>

            {/* AI Analysis */}
            <div className="text-center py-4 border-t border-white/10">
              <Button
                onClick={analyzeWithAI}
                disabled={isAnalyzing}
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</>
                ) : (
                  <><Brain className="w-4 h-4 mr-2" /> Validar com IA</>
                )}
              </Button>
            </div>

            {formData.ai_analysis && (
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30 space-y-3">
                <h4 className="text-purple-400 font-medium">Análise IA</h4>
                <p className="text-sm text-white">{formData.ai_analysis.trajectory_assessment}</p>
                {formData.ai_analysis.recommendations?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Recomendações:</p>
                    <ul className="text-sm text-white space-y-1">
                      {formData.ai_analysis.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Sparkles className="w-3 h-3 text-purple-400 mt-1" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <div className="p-4 border-t border-white/10 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white/5 border-white/10 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={saveMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {saveMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Registrar Checkpoint</>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}