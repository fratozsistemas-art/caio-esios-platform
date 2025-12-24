import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Zap, Activity, AlertTriangle, BarChart3, Users, TrendingUp } from 'lucide-react';

const AVAILABLE_WIDGETS = [
  { 
    id: 'quick-actions', 
    name: 'Ações Rápidas Recentes', 
    icon: Zap,
    description: 'Visualize execuções recentes de quick actions',
    defaultEnabled: true
  },
  { 
    id: 'business-health', 
    name: 'Saúde do Negócio', 
    icon: Activity,
    description: 'Métricas de performance e confiança',
    defaultEnabled: true
  },
  { 
    id: 'critical-alerts', 
    name: 'Alertas Críticos', 
    icon: AlertTriangle,
    description: 'Notificações de segurança e integridade',
    defaultEnabled: true
  },
  { 
    id: 'analytics', 
    name: 'Analytics Overview', 
    icon: BarChart3,
    description: 'Estatísticas gerais e tendências',
    defaultEnabled: true
  },
  { 
    id: 'conversations', 
    name: 'Histórico de Conversas', 
    icon: Users,
    description: 'Conversas recentes com CAIO',
    defaultEnabled: true
  },
  { 
    id: 'insights', 
    name: 'Insights Proativos', 
    icon: TrendingUp,
    description: 'Recomendações e oportunidades',
    defaultEnabled: true
  }
];

export default function DashboardCustomizer({ enabledWidgets, onWidgetsChange }) {
  const [localEnabled, setLocalEnabled] = useState(enabledWidgets);
  const [open, setOpen] = useState(false);

  const handleToggle = (widgetId) => {
    const updated = {
      ...localEnabled,
      [widgetId]: !localEnabled[widgetId]
    };
    setLocalEnabled(updated);
  };

  const handleSave = () => {
    onWidgetsChange(localEnabled);
    localStorage.setItem('dashboard-widgets', JSON.stringify(localEnabled));
    setOpen(false);
  };

  const handleReset = () => {
    const defaults = AVAILABLE_WIDGETS.reduce((acc, widget) => {
      acc[widget.id] = widget.defaultEnabled;
      return acc;
    }, {});
    setLocalEnabled(defaults);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
          <Settings className="w-4 h-4 mr-2" />
          Personalizar
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Personalizar Dashboard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <p className="text-sm text-slate-400">
            Escolha quais widgets deseja visualizar no seu dashboard
          </p>
          
          <div className="space-y-3">
            {AVAILABLE_WIDGETS.map((widget) => {
              const Icon = widget.icon;
              return (
                <div 
                  key={widget.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={widget.id} className="text-white font-medium cursor-pointer">
                      {widget.name}
                    </Label>
                    <p className="text-sm text-slate-400 mt-1">{widget.description}</p>
                  </div>
                  <Switch
                    id={widget.id}
                    checked={localEnabled[widget.id] ?? widget.defaultEnabled}
                    onCheckedChange={() => handleToggle(widget.id)}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <Button
              variant="ghost"
              onClick={handleReset}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Restaurar Padrão
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Salvar Configuração
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}