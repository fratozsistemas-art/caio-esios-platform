import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, Save, Plus, Trash2, Compass, TrendingUp, Shield, 
  Zap, AlertTriangle, Sparkles, Brain, Loader2, Target, ArrowRight,
  Rocket, ShieldCheck, Activity, RefreshCw, Swords, Building, ArrowLeft,
  Crosshair, Scale, DollarSign, Settings, Siren, Handshake, Globe, RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';

const CONTEXT_TYPES = [
  { value: 'strategic_initiative', label: 'Iniciativa Estratégica', icon: Crosshair, color: 'text-cyan-400' },
  { value: 'conflict_resolution', label: 'Resolução de Conflito', icon: Scale, color: 'text-purple-400' },
  { value: 'investment_decision', label: 'Decisão de Investimento', icon: DollarSign, color: 'text-green-400' },
  { value: 'operational_change', label: 'Mudança Operacional', icon: Settings, color: 'text-slate-400' },
  { value: 'crisis_response', label: 'Resposta a Crise', icon: Siren, color: 'text-red-400' },
  { value: 'partnership', label: 'Parceria', icon: Handshake, color: 'text-amber-400' },
  { value: 'market_entry', label: 'Entrada em Mercado', icon: Rocket, color: 'text-blue-400' },
  { value: 'restructuring', label: 'Reestruturação', icon: RotateCcw, color: 'text-orange-400' }
];

const DIRECTIONS = [
  { value: 'expansion', label: 'Expansão', icon: Rocket, color: 'bg-green-500', iconColor: 'text-green-400' },
  { value: 'defense', label: 'Defesa', icon: ShieldCheck, color: 'bg-blue-500', iconColor: 'text-blue-400' },
  { value: 'survival', label: 'Sobrevivência', icon: Zap, color: 'bg-red-500', iconColor: 'text-red-400' },
  { value: 'repositioning', label: 'Reposicionamento', icon: RefreshCw, color: 'bg-purple-500', iconColor: 'text-purple-400' },
  { value: 'attack', label: 'Ataque', icon: Swords, color: 'bg-orange-500', iconColor: 'text-orange-400' },
  { value: 'consolidation', label: 'Consolidação', icon: Building, color: 'bg-cyan-500', iconColor: 'text-cyan-400' },
  { value: 'retreat', label: 'Recuo Estratégico', icon: ArrowLeft, color: 'bg-slate-500', iconColor: 'text-slate-400' }
];

const RELATIONS = [
  { value: 'reinforces', label: 'Reforça', color: 'text-green-400' },
  { value: 'neutralizes', label: 'Neutraliza', color: 'text-yellow-400' },
  { value: 'threatens', label: 'Ameaça', color: 'text-red-400' },
  { value: 'independent', label: 'Independente', color: 'text-slate-400' }
];

export default function VectorExternalizationForm({ decision, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('context');
  const [isValidating, setIsValidating] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: decision?.title || '',
    context_type: decision?.context_type || 'strategic_initiative',
    horizon_days: decision?.horizon_days || 30,
    primary_vector: decision?.primary_vector || {
      name: '',
      direction: 'expansion',
      intensity: 3,
      evidence: [''],
      rationale: ''
    },
    secondary_vectors: decision?.secondary_vectors || [],
    opposing_forces: decision?.opposing_forces || [{ description: '', severity: 'medium', mitigation: '' }],
    accelerating_forces: decision?.accelerating_forces || [{ description: '', leverage_potential: 'medium' }],
    projection_30d: decision?.projection_30d || '',
    projection_90d: decision?.projection_90d || '',
    recommended_decision: decision?.recommended_decision || '',
    decision_rationale: decision?.decision_rationale || '',
    checkpoint_interval_days: decision?.checkpoint_interval_days || 7,
    status: 'draft'
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        next_checkpoint_date: format(addDays(new Date(), data.checkpoint_interval_days), 'yyyy-MM-dd')
      };
      if (decision?.id) {
        return await base44.entities.VectorDecision.update(decision.id, payload);
      }
      return await base44.entities.VectorDecision.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['vector_decisions']);
      toast.success('Decisão vetorial salva com sucesso');
      onSave?.();
    },
    onError: (error) => {
      toast.error('Erro ao salvar: ' + error.message);
    }
  });

  const validateWithAI = async () => {
    setIsValidating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta decisão vetorial e forneça validação:

CONTEXTO: ${CONTEXT_TYPES.find(c => c.value === formData.context_type)?.label}
TÍTULO: ${formData.title}

VETOR PRIMÁRIO:
- Nome: ${formData.primary_vector.name}
- Direção: ${formData.primary_vector.direction}
- Intensidade: ${formData.primary_vector.intensity}/5
- Evidências: ${formData.primary_vector.evidence.filter(e => e).join(', ')}

VETORES SECUNDÁRIOS: ${formData.secondary_vectors.map(v => `${v.name} (${v.relation})`).join(', ') || 'Nenhum'}

FORÇAS OPONENTES: ${formData.opposing_forces.map(f => f.description).filter(d => d).join(', ')}
FORÇAS ACELERADORAS: ${formData.accelerating_forces.map(f => f.description).filter(d => d).join(', ')}

PROJEÇÃO 30 DIAS: ${formData.projection_30d}
DECISÃO RECOMENDADA: ${formData.recommended_decision}

Forneça análise em JSON:`,
        response_json_schema: {
          type: "object",
          properties: {
            consistency_score: { type: "number", description: "0-1 score de consistência lógica" },
            completeness_score: { type: "number", description: "0-1 score de completude" },
            risk_score: { type: "number", description: "0-1 score de risco" },
            suggestions: { type: "array", items: { type: "string" }, description: "Sugestões de melhoria" },
            blind_spots: { type: "array", items: { type: "string" }, description: "Pontos cegos identificados" },
            alternative_vectors: { type: "array", items: { type: "string" }, description: "Vetores alternativos a considerar" },
            overall_assessment: { type: "string", description: "Avaliação geral em 2-3 frases" }
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        ai_validation: {
          ...response,
          validated_at: new Date().toISOString()
        }
      }));

      toast.success('Validação IA concluída');
    } catch (error) {
      toast.error('Erro na validação IA');
    } finally {
      setIsValidating(false);
    }
  };

  const addSecondaryVector = () => {
    setFormData(prev => ({
      ...prev,
      secondary_vectors: [...prev.secondary_vectors, { name: '', relation: 'reinforces', intensity: 3, evidence: [] }]
    }));
  };

  const removeSecondaryVector = (index) => {
    setFormData(prev => ({
      ...prev,
      secondary_vectors: prev.secondary_vectors.filter((_, i) => i !== index)
    }));
  };

  const addEvidence = () => {
    setFormData(prev => ({
      ...prev,
      primary_vector: {
        ...prev.primary_vector,
        evidence: [...prev.primary_vector.evidence, '']
      }
    }));
  };

  const updateEvidence = (index, value) => {
    setFormData(prev => ({
      ...prev,
      primary_vector: {
        ...prev.primary_vector,
        evidence: prev.primary_vector.evidence.map((e, i) => i === index ? value : e)
      }
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
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <Card className="bg-slate-900 border-cyan-500/30">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                {decision ? 'Editar' : 'Nova'} Externalização de Vetores
                <Badge className="bg-cyan-500/20 text-cyan-400">CAIO.VEC-01</Badge>
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[calc(90vh-140px)] overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-white/5 rounded-none border-b border-white/10 p-1">
                <TabsTrigger value="context" className="flex-1 data-[state=active]:bg-cyan-500/20">
                  1. Contexto
                </TabsTrigger>
                <TabsTrigger value="vectors" className="flex-1 data-[state=active]:bg-cyan-500/20">
                  2. Vetores
                </TabsTrigger>
                <TabsTrigger value="forces" className="flex-1 data-[state=active]:bg-cyan-500/20">
                  3. Forças
                </TabsTrigger>
                <TabsTrigger value="projection" className="flex-1 data-[state=active]:bg-cyan-500/20">
                  4. Projeção
                </TabsTrigger>
                <TabsTrigger value="validation" className="flex-1 data-[state=active]:bg-cyan-500/20">
                  5. Validação IA
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="context" className="mt-0 space-y-4">
                  <div>
                    <Label className="text-slate-300">Título da Decisão</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Expansão para mercado B2B Enterprise"
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Tipo de Contexto</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {CONTEXT_TYPES.map(type => {
                        const Icon = type.icon;
                        return (
                          <div
                            key={type.value}
                            onClick={() => setFormData({ ...formData, context_type: type.value })}
                            className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                              formData.context_type === type.value
                                ? 'bg-cyan-500/20 border-cyan-500/50'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <Icon className={`w-6 h-6 mx-auto ${type.color}`} />
                            <p className="text-xs text-white mt-1">{type.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Horizonte de Decisão</Label>
                      <Select
                        value={formData.horizon_days.toString()}
                        onValueChange={(v) => setFormData({ ...formData, horizon_days: parseInt(v) })}
                      >
                        <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 dias</SelectItem>
                          <SelectItem value="90">90 dias</SelectItem>
                          <SelectItem value="180">180 dias</SelectItem>
                          <SelectItem value="365">1 ano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-300">Intervalo de Checkpoints</Label>
                      <Select
                        value={formData.checkpoint_interval_days.toString()}
                        onValueChange={(v) => setFormData({ ...formData, checkpoint_interval_days: parseInt(v) })}
                      >
                        <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 dias</SelectItem>
                          <SelectItem value="7">7 dias</SelectItem>
                          <SelectItem value="14">14 dias</SelectItem>
                          <SelectItem value="30">30 dias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="vectors" className="mt-0 space-y-6">
                  {/* Primary Vector */}
                  <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      Vetor Primário
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-300">Nome do Vetor</Label>
                        <Input
                          value={formData.primary_vector.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            primary_vector: { ...formData.primary_vector, name: e.target.value }
                          })}
                          placeholder="Ex: Geração de Caixa Rápida"
                          className="mt-1 bg-white/5 border-white/10 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-slate-300">Direção Estratégica</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {DIRECTIONS.map(dir => {
                            const Icon = dir.icon;
                            return (
                              <div
                                key={dir.value}
                                onClick={() => setFormData({
                                  ...formData,
                                  primary_vector: { ...formData.primary_vector, direction: dir.value }
                                })}
                                className={`p-2 rounded-lg border cursor-pointer transition-all text-center ${
                                  formData.primary_vector.direction === dir.value
                                    ? 'bg-cyan-500/20 border-cyan-500/50'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                              >
                                <Icon className={`w-5 h-5 mx-auto ${dir.iconColor}`} />
                                <p className="text-xs text-white mt-1">{dir.label}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-slate-300">Intensidade</Label>
                          <span className="text-cyan-400 font-mono">{formData.primary_vector.intensity}/5</span>
                        </div>
                        <Slider
                          value={[formData.primary_vector.intensity]}
                          onValueChange={([v]) => setFormData({
                            ...formData,
                            primary_vector: { ...formData.primary_vector, intensity: v }
                          })}
                          min={1}
                          max={5}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-slate-300">Evidências</Label>
                          <Button size="sm" variant="ghost" onClick={addEvidence} className="text-cyan-400">
                            <Plus className="w-3 h-3 mr-1" /> Adicionar
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {formData.primary_vector.evidence.map((ev, idx) => (
                            <Input
                              key={idx}
                              value={ev}
                              onChange={(e) => updateEvidence(idx, e.target.value)}
                              placeholder={`Evidência ${idx + 1}`}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-slate-300">Racional</Label>
                        <Textarea
                          value={formData.primary_vector.rationale}
                          onChange={(e) => setFormData({
                            ...formData,
                            primary_vector: { ...formData.primary_vector, rationale: e.target.value }
                          })}
                          placeholder="Por que este é o vetor primário?"
                          className="mt-1 bg-white/5 border-white/10 text-white h-20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary Vectors */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        Vetores Secundários
                      </h3>
                      <Button size="sm" onClick={addSecondaryVector} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-3 h-3 mr-1" /> Adicionar
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {formData.secondary_vectors.map((vector, idx) => (
                        <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 grid grid-cols-3 gap-3">
                              <Input
                                value={vector.name}
                                onChange={(e) => {
                                  const updated = [...formData.secondary_vectors];
                                  updated[idx].name = e.target.value;
                                  setFormData({ ...formData, secondary_vectors: updated });
                                }}
                                placeholder="Nome do vetor"
                                className="bg-white/5 border-white/10 text-white"
                              />
                              <Select
                                value={vector.relation}
                                onValueChange={(v) => {
                                  const updated = [...formData.secondary_vectors];
                                  updated[idx].relation = v;
                                  setFormData({ ...formData, secondary_vectors: updated });
                                }}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {RELATIONS.map(r => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Int:</span>
                                <Slider
                                  value={[vector.intensity]}
                                  onValueChange={([v]) => {
                                    const updated = [...formData.secondary_vectors];
                                    updated[idx].intensity = v;
                                    setFormData({ ...formData, secondary_vectors: updated });
                                  }}
                                  min={1}
                                  max={5}
                                  className="flex-1"
                                />
                                <span className="text-xs text-cyan-400">{vector.intensity}</span>
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeSecondaryVector(idx)}
                              className="text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="forces" className="mt-0 space-y-6">
                  {/* Opposing Forces */}
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      Forças Oponentes
                    </h3>
                    <div className="space-y-3">
                      {formData.opposing_forces.map((force, idx) => (
                        <div key={idx} className="p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                          <div className="grid grid-cols-3 gap-3">
                            <Input
                              value={force.description}
                              onChange={(e) => {
                                const updated = [...formData.opposing_forces];
                                updated[idx].description = e.target.value;
                                setFormData({ ...formData, opposing_forces: updated });
                              }}
                              placeholder="Descrição da força"
                              className="bg-white/5 border-white/10 text-white"
                            />
                            <Select
                              value={force.severity}
                              onValueChange={(v) => {
                                const updated = [...formData.opposing_forces];
                                updated[idx].severity = v;
                                setFormData({ ...formData, opposing_forces: updated });
                              }}
                            >
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Baixa</SelectItem>
                                <SelectItem value="medium">Média</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                                <SelectItem value="critical">Crítica</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              value={force.mitigation}
                              onChange={(e) => {
                                const updated = [...formData.opposing_forces];
                                updated[idx].mitigation = e.target.value;
                                setFormData({ ...formData, opposing_forces: updated });
                              }}
                              placeholder="Mitigação"
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setFormData({
                          ...formData,
                          opposing_forces: [...formData.opposing_forces, { description: '', severity: 'medium', mitigation: '' }]
                        })}
                        className="text-red-400"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Adicionar Força Oponente
                      </Button>
                    </div>
                  </div>

                  {/* Accelerating Forces */}
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      Forças Aceleradoras
                    </h3>
                    <div className="space-y-3">
                      {formData.accelerating_forces.map((force, idx) => (
                        <div key={idx} className="p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              value={force.description}
                              onChange={(e) => {
                                const updated = [...formData.accelerating_forces];
                                updated[idx].description = e.target.value;
                                setFormData({ ...formData, accelerating_forces: updated });
                              }}
                              placeholder="Descrição da força"
                              className="bg-white/5 border-white/10 text-white"
                            />
                            <Select
                              value={force.leverage_potential}
                              onValueChange={(v) => {
                                const updated = [...formData.accelerating_forces];
                                updated[idx].leverage_potential = v;
                                setFormData({ ...formData, accelerating_forces: updated });
                              }}
                            >
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Baixo</SelectItem>
                                <SelectItem value="medium">Médio</SelectItem>
                                <SelectItem value="high">Alto</SelectItem>
                                <SelectItem value="transformational">Transformacional</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setFormData({
                          ...formData,
                          accelerating_forces: [...formData.accelerating_forces, { description: '', leverage_potential: 'medium' }]
                        })}
                        className="text-green-400"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Adicionar Força Aceleradora
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="projection" className="mt-0 space-y-4">
                  <div>
                    <Label className="text-slate-300">Projeção de 30 Dias</Label>
                    <p className="text-xs text-slate-500 mb-2">Se nada mudar, o que tende a acontecer?</p>
                    <Textarea
                      value={formData.projection_30d}
                      onChange={(e) => setFormData({ ...formData, projection_30d: e.target.value })}
                      placeholder="Descreva o cenário mais provável em 30 dias..."
                      className="bg-white/5 border-white/10 text-white h-24"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Projeção de 90 Dias (opcional)</Label>
                    <Textarea
                      value={formData.projection_90d}
                      onChange={(e) => setFormData({ ...formData, projection_90d: e.target.value })}
                      placeholder="Descreva o cenário mais provável em 90 dias..."
                      className="bg-white/5 border-white/10 text-white h-24"
                    />
                  </div>

                  <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30">
                    <Label className="text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      Decisão Recomendada (Racional Vetorial)
                    </Label>
                    <p className="text-xs text-slate-500 mb-2">Dada a configuração atual de vetores, qual é a direção racional?</p>
                    <Textarea
                      value={formData.recommended_decision}
                      onChange={(e) => setFormData({ ...formData, recommended_decision: e.target.value })}
                      placeholder="Ex: Cortar dispersão, priorizar 1 rota de caixa e reconfigurar time comercial."
                      className="bg-white/5 border-white/10 text-white h-24"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Racional da Decisão</Label>
                    <Textarea
                      value={formData.decision_rationale}
                      onChange={(e) => setFormData({ ...formData, decision_rationale: e.target.value })}
                      placeholder="Explique o raciocínio por trás da decisão..."
                      className="bg-white/5 border-white/10 text-white h-20"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="validation" className="mt-0 space-y-4">
                  <div className="text-center py-6">
                    <Brain className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-2">Validação com IA</h3>
                    <p className="text-sm text-slate-400 mb-4">
                      A IA analisará consistência, completude e identificará pontos cegos
                    </p>
                    <Button
                      onClick={validateWithAI}
                      disabled={isValidating || !formData.title || !formData.primary_vector.name}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      {isValidating ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validando...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-2" /> Validar com IA</>
                      )}
                    </Button>
                  </div>

                  {formData.ai_validation && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <ScoreCard 
                          label="Consistência" 
                          value={formData.ai_validation.consistency_score} 
                          color="cyan" 
                        />
                        <ScoreCard 
                          label="Completude" 
                          value={formData.ai_validation.completeness_score} 
                          color="green" 
                        />
                        <ScoreCard 
                          label="Risco" 
                          value={formData.ai_validation.risk_score} 
                          color="red" 
                          inverted 
                        />
                      </div>

                      {formData.ai_validation.overall_assessment && (
                        <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                          <p className="text-sm text-white">{formData.ai_validation.overall_assessment}</p>
                        </div>
                      )}

                      {formData.ai_validation.suggestions?.length > 0 && (
                        <div>
                          <h4 className="text-sm text-slate-400 mb-2">Sugestões</h4>
                          <ul className="space-y-1">
                            {formData.ai_validation.suggestions.map((s, i) => (
                              <li key={i} className="text-sm text-white flex items-start gap-2">
                                <Sparkles className="w-3 h-3 text-purple-400 mt-1 flex-shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {formData.ai_validation.blind_spots?.length > 0 && (
                        <div>
                          <h4 className="text-sm text-slate-400 mb-2">Pontos Cegos</h4>
                          <ul className="space-y-1">
                            {formData.ai_validation.blind_spots.map((s, i) => (
                              <li key={i} className="text-sm text-orange-400 flex items-start gap-2">
                                <AlertTriangle className="w-3 h-3 mt-1 flex-shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
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
              disabled={!formData.title || !formData.primary_vector.name || saveMutation.isPending}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              {saveMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Salvar Decisão</>
              )}
            </Button>
            <Button
              onClick={() => {
                setFormData({ ...formData, status: 'active' });
                saveMutation.mutate({ ...formData, status: 'active' });
              }}
              disabled={!formData.title || !formData.primary_vector.name || saveMutation.isPending}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <Zap className="w-4 h-4 mr-2" /> Salvar e Ativar
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function ScoreCard({ label, value, color, inverted }) {
  const percentage = Math.round((value || 0) * 100);
  const isGood = inverted ? percentage < 50 : percentage >= 70;
  
  const colors = {
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[color]}`}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-bold">{percentage}%</p>
    </div>
  );
}