import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  Activity,
  Zap,
  Settings,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

const triggerTypes = [
  { value: "risk_threshold", label: "Limite de Risco", icon: AlertTriangle },
  { value: "weak_signal", label: "Sinal Fraco", icon: Activity },
  { value: "kpi_change", label: "Mudança de KPI", icon: Zap },
  { value: "vector_deviation", label: "Desvio Vetorial", icon: Activity },
  { value: "pattern_match", label: "Match de Padrão", icon: Settings },
  { value: "scheduled", label: "Agendado", icon: Settings }
];

const metricOptions = [
  { value: "cognitive_health_score", label: "Score de Saúde Cognitiva" },
  { value: "integrity_score", label: "Score de Integridade" },
  { value: "critical_issues_count", label: "Contagem de Issues Críticos" },
  { value: "analysis_confidence", label: "Confiança de Análise" },
  { value: "market_tam_change", label: "Mudança TAM de Mercado" },
  { value: "risk_score", label: "Score de Risco" }
];

const severityOptions = [
  { value: "info", label: "Info", color: "bg-blue-500/20 text-blue-400" },
  { value: "warning", label: "Warning", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "critical", label: "Critical", color: "bg-red-500/20 text-red-400" }
];

export default function AlertRuleManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger_type: "risk_threshold",
    conditions: [{ metric: "cognitive_health_score", operator: "<", threshold: 70 }],
    logic_operator: "AND",
    hermes_modules_to_trigger: ["H1"],
    notification_config: {
      notify_emails: [],
      severity: "warning",
      create_task: false,
      message_template: ""
    },
    cooldown_minutes: 60,
    is_active: true,
    priority: 50
  });

  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['hermes-trigger-rules'],
    queryFn: () => base44.entities.HermesTriggerRule.list("-created_date", 50)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.HermesTriggerRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hermes-trigger-rules']);
      setIsCreateOpen(false);
      resetForm();
      toast.success("Regra de alerta criada com sucesso!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HermesTriggerRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hermes-trigger-rules']);
      setEditingRule(null);
      resetForm();
      toast.success("Regra atualizada!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HermesTriggerRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['hermes-trigger-rules']);
      toast.success("Regra removida!");
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.HermesTriggerRule.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['hermes-trigger-rules']);
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      trigger_type: "risk_threshold",
      conditions: [{ metric: "cognitive_health_score", operator: "<", threshold: 70 }],
      logic_operator: "AND",
      hermes_modules_to_trigger: ["H1"],
      notification_config: {
        notify_emails: [],
        severity: "warning",
        create_task: false,
        message_template: ""
      },
      cooldown_minutes: 60,
      is_active: true,
      priority: 50
    });
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name || "",
      description: rule.description || "",
      trigger_type: rule.trigger_type || "risk_threshold",
      conditions: rule.conditions || [{ metric: "cognitive_health_score", operator: "<", threshold: 70 }],
      logic_operator: rule.logic_operator || "AND",
      hermes_modules_to_trigger: rule.hermes_modules_to_trigger || ["H1"],
      notification_config: rule.notification_config || { severity: "warning" },
      cooldown_minutes: rule.cooldown_minutes || 60,
      is_active: rule.is_active !== false,
      priority: rule.priority || 50
    });
    setIsCreateOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...formData.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setFormData({ ...formData, conditions: newConditions });
  };

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { metric: "integrity_score", operator: "<", threshold: 50 }]
    });
  };

  const removeCondition = (index) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index)
    });
  };

  const getTriggerTypeConfig = (type) => triggerTypes.find(t => t.value === type) || triggerTypes[0];

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-white">
          <Bell className="w-5 h-5 text-amber-400" />
          Gerenciador de Alertas
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 ml-2">
            {rules.filter(r => r.is_active).length} ativas
          </Badge>
        </CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingRule(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingRule ? "Editar Regra de Alerta" : "Criar Nova Regra de Alerta"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Nome *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Alerta de Saúde Cognitiva Baixa"
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-400">Tipo de Gatilho</Label>
                  <Select 
                    value={formData.trigger_type} 
                    onValueChange={(v) => setFormData({ ...formData, trigger_type: v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-slate-400">Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o propósito desta regra..."
                  className="bg-white/5 border-white/10 text-white mt-1 h-16"
                />
              </div>

              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-400">Condições</Label>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={formData.logic_operator} 
                      onValueChange={(v) => setFormData({ ...formData, logic_operator: v })}
                    >
                      <SelectTrigger className="w-20 h-7 bg-white/5 border-white/10 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={addCondition} className="h-7 border-white/10 text-white">
                      <Plus className="w-3 h-3 mr-1" /> Condição
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {formData.conditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <Select 
                        value={cond.metric} 
                        onValueChange={(v) => updateCondition(idx, 'metric', v)}
                      >
                        <SelectTrigger className="flex-1 bg-white/5 border-white/10 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {metricOptions.map(m => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={cond.operator} 
                        onValueChange={(v) => updateCondition(idx, 'operator', v)}
                      >
                        <SelectTrigger className="w-20 bg-white/5 border-white/10 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["<", ">", "<=", ">=", "==", "!="].map(op => (
                            <SelectItem key={op} value={op}>{op}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={cond.threshold}
                        onChange={(e) => updateCondition(idx, 'threshold', parseFloat(e.target.value))}
                        className="w-20 bg-white/5 border-white/10 text-white text-xs"
                      />
                      {formData.conditions.length > 1 && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => removeCondition(idx)}
                          className="h-8 w-8 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Config */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Severidade</Label>
                  <Select 
                    value={formData.notification_config.severity} 
                    onValueChange={(v) => setFormData({ 
                      ...formData, 
                      notification_config: { ...formData.notification_config, severity: v }
                    })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-400">Cooldown (minutos)</Label>
                  <Input
                    type="number"
                    value={formData.cooldown_minutes}
                    onChange={(e) => setFormData({ ...formData, cooldown_minutes: parseInt(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.notification_config.create_task}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      notification_config: { ...formData.notification_config, create_task: checked }
                    })}
                  />
                  <Label className="text-slate-400 text-sm">Criar tarefa ao disparar</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label className="text-slate-400 text-sm">Ativa</Label>
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" /> {editingRule ? "Atualizar" : "Criar"} Regra</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Nenhuma regra de alerta configurada</p>
            <p className="text-slate-500 text-sm">Crie sua primeira regra para monitorar métricas críticas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map(rule => {
              const typeConfig = getTriggerTypeConfig(rule.trigger_type);
              const TypeIcon = typeConfig.icon;
              const severityConfig = severityOptions.find(s => s.value === rule.notification_config?.severity) || severityOptions[1];

              return (
                <div 
                  key={rule.id} 
                  className={`p-4 rounded-lg border transition-all ${
                    rule.is_active 
                      ? 'bg-white/5 border-white/10 hover:border-amber-500/30' 
                      : 'bg-white/2 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${rule.is_active ? 'bg-amber-500/20' : 'bg-slate-500/20'}`}>
                        <TypeIcon className={`w-4 h-4 ${rule.is_active ? 'text-amber-400' : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{rule.name}</p>
                          <Badge className={severityConfig.color}>{severityConfig.label}</Badge>
                          {rule.trigger_count > 0 && (
                            <Badge className="bg-white/10 text-slate-400">
                              {rule.trigger_count}x disparado
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-500 text-sm">
                          {rule.conditions?.map(c => `${c.metric} ${c.operator} ${c.threshold}`).join(` ${rule.logic_operator} `)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: rule.id, is_active: checked })}
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleEdit(rule)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => deleteMutation.mutate(rule.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}