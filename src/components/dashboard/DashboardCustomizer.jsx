import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, Activity, AlertTriangle, BarChart3, Users, TrendingUp, Network, Briefcase, Shield, Clock, Lock } from 'lucide-react';

const AVAILABLE_WIDGETS = [
  { 
    id: 'quick-actions', 
    name: 'Ações Rápidas Recentes', 
    icon: Zap,
    description: 'Visualize execuções recentes de quick actions',
    defaultEnabled: true,
    roles: ['admin', 'analyst', 'editor', 'viewer']
  },
  { 
    id: 'business-health', 
    name: 'Saúde do Negócio', 
    icon: Activity,
    description: 'Métricas de performance e confiança',
    defaultEnabled: true,
    roles: ['admin', 'analyst', 'editor', 'viewer']
  },
  { 
    id: 'critical-alerts', 
    name: 'Alertas Críticos', 
    icon: AlertTriangle,
    description: 'Notificações de segurança e integridade',
    defaultEnabled: true,
    roles: ['admin', 'analyst', 'editor']
  },
  { 
    id: 'realtime', 
    name: 'Métricas em Tempo Real', 
    icon: Activity,
    description: 'Dados ao vivo do sistema',
    defaultEnabled: true,
    roles: ['admin', 'analyst']
  },
  { 
    id: 'stats', 
    name: 'Estatísticas Rápidas', 
    icon: BarChart3,
    description: 'KPIs principais em cards',
    defaultEnabled: true,
    roles: ['admin', 'analyst', 'editor', 'viewer']
  },
  { 
    id: 'portfolio', 
    name: 'Portfolio Intelligence', 
    icon: Briefcase,
    description: 'Análise de portfólio',
    defaultEnabled: true,
    roles: ['admin', 'analyst']
  },
  { 
    id: 'crossinsights', 
    name: 'Cross Insights', 
    icon: Network,
    description: 'Insights cruzados',
    defaultEnabled: true,
    roles: ['admin', 'analyst']
  },
  { 
    id: 'abtests', 
    name: 'A/B Tests', 
    icon: BarChart3,
    description: 'Experimentos ativos',
    defaultEnabled: true,
    roles: ['admin']
  },
  { 
    id: 'deployments', 
    name: 'Status de Deployments', 
    icon: Clock,
    description: 'CI/CD pipeline status',
    defaultEnabled: true,
    roles: ['admin']
  },
  { 
    id: 'compliance', 
    name: 'Compliance Monitor', 
    icon: Shield,
    description: 'Status de conformidade',
    defaultEnabled: false,
    roles: ['admin']
  },
  { 
    id: 'conversations', 
    name: 'Histórico de Conversas', 
    icon: Users,
    description: 'Conversas recentes com CAIO',
    defaultEnabled: true,
    roles: ['admin', 'analyst', 'editor', 'viewer']
  },
  { 
    id: 'insights', 
    name: 'Analysis Insights', 
    icon: TrendingUp,
    description: 'Insights de análises',
    defaultEnabled: true,
    roles: ['admin', 'analyst', 'editor', 'viewer']
  },
  { 
    id: 'graph', 
    name: 'Knowledge Graph', 
    icon: Network,
    description: 'Grafo de conhecimento',
    defaultEnabled: true,
    roles: ['admin', 'analyst', 'editor']
  },
  { 
    id: 'actions', 
    name: 'Action Items', 
    icon: AlertTriangle,
    description: 'Itens de ação pendentes',
    defaultEnabled: true,
    roles: ['admin', 'analyst', 'editor']
  }
];

export default function DashboardCustomizer({ currentLayout, onLayoutChange, userRole = 'viewer' }) {
  const [localLayout, setLocalLayout] = useState(currentLayout);
  const [open, setOpen] = useState(false);

  // Filter widgets available for user's role
  const availableWidgets = AVAILABLE_WIDGETS.filter(widget => 
    widget.roles.includes(userRole)
  );

  const handleToggle = (widgetId) => {
    if (localLayout.includes(widgetId)) {
      setLocalLayout(localLayout.filter(id => id !== widgetId));
    } else {
      setLocalLayout([...localLayout, widgetId]);
    }
  };

  const handleSave = async () => {
    onLayoutChange(localLayout);
    setOpen(false);
  };

  const handleReset = () => {
    const defaults = availableWidgets
      .filter(w => w.defaultEnabled)
      .map(w => w.id);
    setLocalLayout(defaults);
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Escolha quais widgets deseja visualizar no seu dashboard
            </p>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Role: {userRole}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {availableWidgets.map((widget) => {
              const Icon = widget.icon;
              const isEnabled = localLayout.includes(widget.id);
              
              return (
                <div 
                  key={widget.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                    isEnabled 
                      ? 'bg-blue-500/10 border-blue-500/30' 
                      : 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                  }`}
                >
                  <div className={`p-2 rounded-lg border ${
                    isEnabled 
                      ? 'bg-blue-500/20 border-blue-500/40' 
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${isEnabled ? 'text-blue-400' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={widget.id} className="text-white font-medium cursor-pointer">
                      {widget.name}
                    </Label>
                    <p className="text-sm text-slate-400 mt-1">{widget.description}</p>
                  </div>
                  <Switch
                    id={widget.id}
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(widget.id)}
                  />
                </div>
              );
            })}
          </div>
          
          {AVAILABLE_WIDGETS.length > availableWidgets.length && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <Lock className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-300">
                {AVAILABLE_WIDGETS.length - availableWidgets.length} widgets restritos ao seu role atual
              </p>
            </div>
          )}

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