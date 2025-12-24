import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CriticalAlertsWidget() {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['critical-alerts'],
    queryFn: async () => {
      // Fetch recent alerts or monitoring data
      const hermesAnalyses = await base44.entities.HermesAnalysis.list('-created_date', 5);
      const feedbacks = await base44.entities.Feedback.filter(
        { priority: 'high', status: 'new' },
        '-created_date',
        3
      );
      
      const alertsList = [];
      
      // Add Hermes critical issues
      hermesAnalyses.forEach(analysis => {
        if (analysis.issues_found?.length > 0) {
          analysis.issues_found.slice(0, 2).forEach(issue => {
            alertsList.push({
              id: `hermes-${analysis.id}-${issue}`,
              type: 'integrity',
              severity: 'high',
              title: issue,
              source: 'HERMES',
              timestamp: analysis.created_date
            });
          });
        }
      });
      
      // Add critical feedback
      feedbacks.forEach(feedback => {
        alertsList.push({
          id: feedback.id,
          type: 'feedback',
          severity: feedback.priority === 'critical' ? 'critical' : 'high',
          title: feedback.comment?.slice(0, 60) + '...' || 'Feedback crítico',
          source: feedback.target_component || 'Sistema',
          timestamp: feedback.created_date
        });
      });
      
      // Sort by severity and timestamp
      return alertsList.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }).slice(0, 5);
    },
    refetchInterval: 30000
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Alertas Críticos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
        </CardContent>
      </Card>
    );
  }

  const severityConfig = {
    critical: { 
      icon: AlertTriangle, 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/30', 
      text: 'text-red-400',
      badgeBg: 'bg-red-500/20'
    },
    high: { 
      icon: AlertCircle, 
      bg: 'bg-orange-500/10', 
      border: 'border-orange-500/30', 
      text: 'text-orange-400',
      badgeBg: 'bg-orange-500/20'
    },
    medium: { 
      icon: Info, 
      bg: 'bg-yellow-500/10', 
      border: 'border-yellow-500/30', 
      text: 'text-yellow-400',
      badgeBg: 'bg-yellow-500/20'
    },
    low: { 
      icon: CheckCircle, 
      bg: 'bg-blue-500/10', 
      border: 'border-blue-500/30', 
      text: 'text-blue-400',
      badgeBg: 'bg-blue-500/20'
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Alertas Críticos
          </CardTitle>
          {alerts.length > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              {alerts.length} ativos
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500/30" />
            <p className="text-sm text-slate-400">Nenhum alerta crítico</p>
            <p className="text-xs text-slate-500 mt-1">Sistema operando normalmente</p>
          </div>
        ) : (
          alerts.map((alert, idx) => {
            const config = severityConfig[alert.severity] || severityConfig.medium;
            const Icon = config.icon;
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`${config.bg} border ${config.border} rounded-lg p-3 hover:bg-opacity-20 transition-all`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 ${config.text} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${config.badgeBg} ${config.text} border ${config.border} text-xs uppercase`}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-slate-500">{alert.source}</span>
                    </div>
                    <p className="text-white text-sm leading-tight">{alert.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}