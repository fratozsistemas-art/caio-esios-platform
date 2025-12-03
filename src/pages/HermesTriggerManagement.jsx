import React from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, Sparkles } from "lucide-react";
import HermesTriggerManager from "../components/hermes/HermesTriggerManager";

export default function HermesTriggerManagement() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400" />
            Hermes Auto-Trigger Management
          </h1>
          <p className="text-slate-400 mt-1">
            Configure regras de acionamento automático para governança cognitiva HERMES
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30 px-4 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          Codex v12.3
        </Badge>
      </div>

      {/* Enhanced Trigger Manager */}
      <HermesTriggerManager />
    </div>
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