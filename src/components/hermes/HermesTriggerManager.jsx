import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield, Zap, AlertTriangle, Plus, Trash2, Play, Clock,
  Settings, Target, Activity, Bell, CheckCircle, XCircle,
  RefreshCw, TrendingDown, TrendingUp, Eye, Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

/**
 * HERMES TRIGGER MANAGER
 * 
 * Configuração de disparadores automáticos para HERMES:
 * - Níveis de risco (score de consistência abaixo de X%)
 * - Sinais fracos em monitoramento contínuo
 * - Mudanças significativas em KPIs
 * - Desvios vetoriais
 * - Acionamento manual
 */

const TRIGGER_TYPES = [
  { value: 'risk_threshold', label: 'Limite de Risco', icon: AlertTriangle, color: 'red' },
  { value: 'weak_signal', label: 'Sinal Fraco', icon: Activity, color: 'yellow' },
  { value: 'kpi_change', label: 'Mudança de KPI', icon: TrendingUp, color: 'blue' },
  { value: 'vector_deviation', label: 'Desvio Vetorial', icon: Target, color: 'purple' },
  { value: 'pattern_match', label: 'Padrão Detectado', icon: Eye, color: 'cyan' },
  { value: 'scheduled', label: 'Agendado', icon: Clock, color: 'green' },
  { value: 'manual', label: 'Manual', icon: Zap, color: 'amber' }
];

const OPERATORS = [
  { value: '<', label: 'Menor que' },
  { value: '>', label: 'Maior que' },
  { value: '<=', label: 'Menor ou igual' },
  { value: '>=', label: 'Maior ou igual' },
  { value: '==', label: 'Igual a' },
  { value: '!=', label: 'Diferente de' },
  { value: 'changed_by', label: 'Mudou em %' }
];

const AVAILABLE_METRICS = [
  { value: 'consistency_score', label: 'Score de Consistência' },
  { value: 'risk_score', label: 'Score de Risco' },
  { value: 'completeness_score', label: 'Score de Completude' },
  { value: 'vector_health_score', label: 'Saúde Vetorial' },
  { value: 'integration_score', label: 'Score de Integração' },
  { value: 'success_rate', label: 'Taxa de Sucesso' },
  { value: 'execution_time', label: 'Tempo de Execução' }
];

export default function HermesTriggerManager() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [testingRule, setTestingRule] = useState(null);
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['hermes_trigger_rules'],
    queryFn: () => base44.entities.HermesTriggerRule.list('-priority')
  });

  const createRuleMutation = useMutation({
    mutationFn: (data) => base44.entities.HermesTriggerRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hermes_trigger_rules']);
      toast.success('Regra criada com sucesso');
      setShowCreate(false);
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HermesTriggerRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hermes_trigger_rules']);
      toast.success('Regra atualizada');
      setEditingRule(null);
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id) => base44.entities.HermesTriggerRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['hermes_trigger_rules']);
      toast.success('Regra removida');
    }
  });

  const toggleRuleMutation = useMutation({
    mutationFn: ({ id, is_active }) => 
      base44.entities.HermesTriggerRule.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['hermes_trigger_rules']);
    }
  });

  // Manual trigger execution
  const triggerHermesManually = async (rule) => {
    setTestingRule(rule.id);
    try {
      await base44.functions.invoke('hermesAutoTrigger', {
        rule_id: rule.id,
        manual: true
      });
      toast.success('HERMES acionado manualmente');
      
      // Update trigger count
      await base44.entities.HermesTriggerRule.update(rule.id, {
        trigger_count: (rule.trigger_count || 0) + 1,
        last_triggered_at: new Date().toISOString()
      });
      queryClient.invalidateQueries(['hermes_trigger_rules']);
    } catch (error) {
      toast.error('Erro ao acionar HERMES');
    } finally {
      setTestingRule(null);
    }
  };

  const activeRules = rules.filter(r => r.is_active);
  const totalTriggers = rules.reduce((sum, r) => sum + (r.trigger_count || 0), 0);

  const getTypeConfig = (type) => TRIGGER_TYPES.find(t => t.value === type) || TRIGGER_TYPES[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-amber-400" />
            Regras de Acionamento HERMES
          </h2>
          <p className="text-slate-400 mt-1">
            Configure disparadores automáticos para governança cognitiva
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total de Regras</p>
                <p className="text-2xl font-bold text-white">{rules.length}</p>
              </div>
              <Settings className="w-8 h-8 text-slate-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Regras Ativas</p>
                <p className="text-2xl font-bold text-green-400">{activeRules.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Acionamentos</p>
                <p className="text-2xl font-bold text-amber-400">{totalTriggers}</p>
              </div>
              <Zap className="w-8 h-8 text-amber-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Última Verificação</p>
                <p className="text-sm font-bold text-white">
                  {rules[0]?.last_evaluation_at 
                    ? format(new Date(rules[0].last_evaluation_at), 'HH:mm')
                    : 'N/A'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-slate-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => {
          const typeConfig = getTypeConfig(rule.trigger_type);
          const Icon = typeConfig.icon;
          
          return (
            <Card 
              key={rule.id} 
              className={`bg-white/5 border-white/10 ${
                !rule.is_active ? 'opacity-60' : ''
              } hover:border-amber-500/30 transition-all`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg bg-${typeConfig.color}-500/20 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${typeConfig.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{rule.name}</h3>
                        <Badge className={`bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400`}>
                          {typeConfig.label}
                        </Badge>
                        {rule.hermes_modules_to_trigger?.map((m, i) => (
                          <Badge key={i} className="bg-white/10 text-slate-400 text-xs">
                            {m}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{rule.description}</p>
                      
                      {/* Conditions Display */}
                      {rule.conditions?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {rule.conditions.map((cond, i) => (
                            <Badge key={i} className="bg-slate-800 text-slate-300 text-xs">
                              {cond.metric} {cond.operator} {cond.threshold || cond.threshold_string}
                            </Badge>
                          ))}
                          {rule.conditions.length > 1 && (
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                              {rule.logic_operator}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {rule.trigger_count || 0} acionamentos
                        </span>
                        {rule.last_triggered_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Último: {format(new Date(rule.last_triggered_at), 'dd/MM HH:mm')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          Cooldown: {rule.cooldown_minutes}min
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => 
                        toggleRuleMutation.mutate({ id: rule.id, is_active: checked })
                      }
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => triggerHermesManually(rule)}
                      disabled={testingRule === rule.id}
                      className="text-amber-400 hover:bg-amber-500/10"
                    >
                      {testingRule === rule.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingRule(rule)}
                      className="text-slate-400 hover:bg-white/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteRuleMutation.mutate(rule.id)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {rules.length === 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Nenhuma regra configurada</p>
              <Button
                onClick={() => setShowCreate(true)}
                className="mt-4 bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Regra
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreate || editingRule) && (
          <TriggerRuleModal
            rule={editingRule}
            onClose={() => {
              setShowCreate(false);
              setEditingRule(null);
            }}
            onSave={(data) => {
              if (editingRule) {
                updateRuleMutation.mutate({ id: editingRule.id, data });
              } else {
                createRuleMutation.mutate(data);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Trigger Rule Modal
function TriggerRuleModal({ rule, onClose, onSave }) {
  const [formData, setFormData] = useState(rule || {
    name: '',
    description: '',
    trigger_type: 'risk_threshold',
    conditions: [{ metric: 'consistency_score', operator: '<', threshold: 50 }],
    logic_operator: 'AND',
    hermes_modules_to_trigger: ['FULL'],
    cooldown_minutes: 60,
    priority: 50,
    is_active: true,
    notification_config: {
      severity: 'warning',
      create_task: true
    }
  });

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { metric: 'risk_score', operator: '>', threshold: 70 }]
    });
  };

  const removeCondition = (index) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index)
    });
  };

  const updateCondition = (index, field, value) => {
    const updated = [...formData.conditions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, conditions: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
      >
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            {rule ? 'Editar Regra' : 'Nova Regra de Acionamento'}
          </h2>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Nome da Regra</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Risco de consistência crítico"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Tipo de Gatilho</label>
                <Select 
                  value={formData.trigger_type}
                  onValueChange={(v) => setFormData({ ...formData, trigger_type: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Descrição</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva quando esta regra deve ser acionada"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Conditions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-400">Condições</label>
                <Button size="sm" variant="ghost" onClick={addCondition} className="text-amber-400">
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar
                </Button>
              </div>

              {formData.conditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <Select 
                    value={cond.metric}
                    onValueChange={(v) => updateCondition(idx, 'metric', v)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_METRICS.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={cond.operator}
                    onValueChange={(v) => updateCondition(idx, 'operator', v)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    value={cond.threshold}
                    onChange={(e) => updateCondition(idx, 'threshold', parseFloat(e.target.value))}
                    className="bg-white/5 border-white/10 text-white w-20"
                  />

                  {formData.conditions.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCondition(idx)}
                      className="text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}

              {formData.conditions.length > 1 && (
                <Select 
                  value={formData.logic_operator}
                  onValueChange={(v) => setFormData({ ...formData, logic_operator: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white w-24 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* HERMES Modules */}
            <div>
              <label className="text-xs text-slate-400">Módulos HERMES a Acionar</label>
              <div className="flex gap-2 mt-2">
                {['H1', 'H2', 'H3', 'H4', 'FULL'].map(m => (
                  <Badge
                    key={m}
                    className={`cursor-pointer ${
                      formData.hermes_modules_to_trigger?.includes(m)
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-white/10 text-slate-400'
                    }`}
                    onClick={() => {
                      const modules = formData.hermes_modules_to_trigger || [];
                      const updated = modules.includes(m)
                        ? modules.filter(x => x !== m)
                        : [...modules, m];
                      setFormData({ ...formData, hermes_modules_to_trigger: updated });
                    }}
                  >
                    {m}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400">Cooldown (min)</label>
                <Input
                  type="number"
                  value={formData.cooldown_minutes}
                  onChange={(e) => setFormData({ ...formData, cooldown_minutes: parseInt(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Prioridade</label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Severidade</label>
                <Select 
                  value={formData.notification_config?.severity || 'warning'}
                  onValueChange={(v) => setFormData({
                    ...formData,
                    notification_config: { ...formData.notification_config, severity: v }
                  })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 text-white">
              Cancelar
            </Button>
            <Button 
              onClick={() => onSave(formData)} 
              disabled={!formData.name}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {rule ? 'Salvar Alterações' : 'Criar Regra'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}