import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  Brain,
  Shield
} from "lucide-react";

export default function AlertDashboard() {
  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['hermes-trigger-rules'],
    queryFn: () => base44.entities.HermesTriggerRule.list("-created_date", 50)
  });

  const { data: hermesAnalyses = [], isLoading: analysesLoading } = useQuery({
    queryKey: ['hermes-analyses-dashboard'],
    queryFn: () => base44.entities.HermesAnalysis.list("-created_date", 10)
  });

  const { data: notifications = [], isLoading: notificationsLoading, refetch } = useQuery({
    queryKey: ['recent-notifications'],
    queryFn: () => base44.entities.Notification.list("-created_date", 20)
  });

  const activeRules = rules.filter(r => r.is_active);
  const criticalAlerts = notifications.filter(n => n.severity === 'critical');
  const warningAlerts = notifications.filter(n => n.severity === 'warning');
  
  const avgIntegrity = hermesAnalyses.length > 0 
    ? Math.round(hermesAnalyses.reduce((acc, a) => acc + (a.integrity_score || 0), 0) / hermesAnalyses.length)
    : 0;

  const isLoading = rulesLoading || analysesLoading || notificationsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-sm">Regras Ativas</p>
                <p className="text-3xl font-bold text-white">{activeRules.length}</p>
              </div>
              <Bell className="w-10 h-10 text-amber-400/50" />
            </div>
            <p className="text-xs text-slate-400 mt-2">de {rules.length} regras totais</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm">Alertas Críticos</p>
                <p className="text-3xl font-bold text-white">{criticalAlerts.length}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-400/50" />
            </div>
            <p className="text-xs text-slate-400 mt-2">requerem atenção imediata</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm">Warnings</p>
                <p className="text-3xl font-bold text-white">{warningAlerts.length}</p>
              </div>
              <Activity className="w-10 h-10 text-yellow-400/50" />
            </div>
            <p className="text-xs text-slate-400 mt-2">monitorando</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 text-sm">Saúde Cognitiva</p>
                <p className="text-3xl font-bold text-white">{avgIntegrity}%</p>
              </div>
              <Brain className="w-10 h-10 text-emerald-400/50" />
            </div>
            <p className="text-xs text-slate-400 mt-2">média de integridade</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts & Rule Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Alertas Recentes
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => refetch()} className="text-slate-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-400">Nenhum alerta recente</p>
                <p className="text-slate-500 text-sm">Todos os sistemas operando normalmente</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {notifications.slice(0, 10).map(notif => (
                  <div 
                    key={notif.id}
                    className={`p-3 rounded-lg border ${
                      notif.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                      notif.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {notif.severity === 'critical' ? (
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      ) : notif.severity === 'warning' ? (
                        <Activity className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      ) : (
                        <Bell className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{notif.title}</p>
                        <p className="text-slate-400 text-xs mt-1">{notif.message}</p>
                        <p className="text-slate-500 text-xs mt-2">
                          {new Date(notif.created_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Rules Status */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Status das Regras
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeRules.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Nenhuma regra ativa</p>
                <p className="text-slate-500 text-sm">Configure regras na aba "Regras"</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {activeRules.map(rule => (
                  <div 
                    key={rule.id}
                    className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <div>
                          <p className="text-white text-sm font-medium">{rule.name}</p>
                          <p className="text-slate-500 text-xs">
                            {rule.conditions?.map(c => `${c.metric} ${c.operator} ${c.threshold}`).join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {rule.trigger_count > 0 && (
                          <Badge className="bg-white/10 text-slate-400 text-xs">
                            {rule.trigger_count}x
                          </Badge>
                        )}
                        <Badge className={
                          rule.notification_config?.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          rule.notification_config?.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }>
                          {rule.notification_config?.severity || 'info'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}