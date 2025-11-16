import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Plus, Trash2, Play, Pause, Shield, Bell } from "lucide-react";
import { toast } from "sonner";

const ENTITY_TYPES = [
  { value: 'strategy', label: 'Estratégia' },
  { value: 'workspace', label: 'Workspace' },
  { value: 'tsi_project', label: 'TSI Project' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'workflow_execution', label: 'Execução de Workflow' },
  { value: 'enrichment_suggestion', label: 'Sugestão de Enriquecimento' }
];

const TRIGGER_EVENTS = [
  { value: 'on_create', label: 'Ao Criar' },
  { value: 'on_update', label: 'Ao Atualizar' },
  { value: 'on_complete', label: 'Ao Completar' },
  { value: 'on_error', label: 'Ao Encontrar Erro' },
  { value: 'on_threshold', label: 'Ao Atingir Threshold' }
];

const ANALYSIS_TYPES = [
  { value: 'narrative_integrity', label: 'Integridade Narrativa' },
  { value: 'board_management_gap', label: 'Gap Board-Management' },
  { value: 'silo_reconciliation', label: 'Reconciliação de Silos' },
  { value: 'tension_analysis', label: 'Análise de Tensões' },
  { value: 'coherence_check', label: 'Verificação de Coerência' },
  { value: 'reasoning_audit', label: 'Auditoria de Raciocínio' }
];

export default function HermesTriggerManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const queryClient = useQueryClient();

  const { data: triggerRules = [] } = useQuery({
    queryKey: ['hermes_trigger_rules'],
    queryFn: () => base44.entities.HermesTriggerRule.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.HermesTriggerRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hermes_trigger_rules']);
      setShowForm(false);
      setEditingRule(null);
      toast.success('Regra de trigger criada');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HermesTriggerRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hermes_trigger_rules']);
      setShowForm(false);
      setEditingRule(null);
      toast.success('Regra atualizada');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HermesTriggerRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['hermes_trigger_rules']);
      toast.success('Regra deletada');
    }
  });

  const activeRules = triggerRules.filter(r => r.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            Hermes Auto-Trigger
          </h1>
          <p className="text-slate-400 mt-1">
            Configurar análises automáticas baseadas em eventos
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Regras Ativas</p>
            <p className="text-2xl font-bold text-white">{activeRules.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Total de Triggers</p>
            <p className="text-2xl font-bold text-white">
              {triggerRules.reduce((sum, r) => sum + (r.triggered_count || 0), 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Regras Configuradas</p>
            <p className="text-2xl font-bold text-white">{triggerRules.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      {showForm && (
        <TriggerRuleForm
          rule={editingRule}
          onSave={(data) => {
            if (editingRule) {
              updateMutation.mutate({ id: editingRule.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingRule(null);
          }}
        />
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {triggerRules.map(rule => (
          <TriggerRuleCard
            key={rule.id}
            rule={rule}
            onEdit={(r) => {
              setEditingRule(r);
              setShowForm(true);
            }}
            onToggle={(id, active) => 
              updateMutation.mutate({ id, data: { is_active: active } })
            }
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>
    </div>
  );
}

function TriggerRuleForm({ rule, onSave, onCancel }) {
  const [formData, setFormData] = useState(rule || {
    name: '',
    description: '',
    entity_type: 'workflow_execution',
    trigger_event: 'on_complete',
    analysis_types: ['narrative_integrity', 'coherence_check'],
    priority: 'medium',
    is_active: true,
    trigger_conditions: {},
    notification_config: { notify_on_critical: true, notify_users: [] }
  });

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-sm">
          {rule ? 'Editar Regra' : 'Nova Regra de Trigger'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-400 text-xs">Nome da Regra</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-slate-400 text-xs">Prioridade</Label>
            <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-slate-400 text-xs">Descrição</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-white/5 border-white/10 text-white mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-400 text-xs">Tipo de Entidade</Label>
            <Select value={formData.entity_type} onValueChange={(v) => setFormData({ ...formData, entity_type: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map(et => (
                  <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-400 text-xs">Evento de Trigger</Label>
            <Select value={formData.trigger_event} onValueChange={(v) => setFormData({ ...formData, trigger_event: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_EVENTS.map(te => (
                  <SelectItem key={te.value} value={te.value}>{te.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-slate-400 text-xs mb-2 block">Tipos de Análise</Label>
          <div className="grid grid-cols-2 gap-2">
            {ANALYSIS_TYPES.map(at => {
              const isSelected = formData.analysis_types.includes(at.value);
              return (
                <div
                  key={at.value}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      analysis_types: isSelected
                        ? formData.analysis_types.filter(t => t !== at.value)
                        : [...formData.analysis_types, at.value]
                    });
                  }}
                  className={`p-2 rounded cursor-pointer transition-all ${
                    isSelected ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <span className={`text-xs ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                    {at.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
          <div>
            <Label className="text-slate-400 text-xs">Notificar em questões críticas</Label>
            <p className="text-xs text-slate-500 mt-1">Enviar notificações quando issues críticos forem detectados</p>
          </div>
          <Switch
            checked={formData.notification_config?.notify_on_critical}
            onCheckedChange={(checked) => setFormData({
              ...formData,
              notification_config: { ...formData.notification_config, notify_on_critical: checked }
            })}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancelar
          </Button>
          <Button onClick={() => onSave(formData)} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
            {rule ? 'Atualizar' : 'Criar'} Regra
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TriggerRuleCard({ rule, onEdit, onToggle, onDelete }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-white font-medium">{rule.name}</h3>
              {rule.is_active ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Ativa
                </Badge>
              ) : (
                <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                  Pausada
                </Badge>
              )}
              <Badge className={`${
                rule.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                rule.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {rule.priority}
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mb-3">{rule.description}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="border-white/20 text-slate-300 text-xs">
                {rule.entity_type}
              </Badge>
              <Badge variant="outline" className="border-white/20 text-slate-300 text-xs">
                {rule.trigger_event.replace('on_', '')}
              </Badge>
              <Badge variant="outline" className="border-white/20 text-slate-300 text-xs">
                {rule.analysis_types?.length || 0} análises
              </Badge>
              {rule.triggered_count > 0 && (
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  {rule.triggered_count} triggers
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggle(rule.id, !rule.is_active)}
              className="h-8"
            >
              {rule.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(rule)}
              className="h-8"
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(rule.id)}
              className="h-8 text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}