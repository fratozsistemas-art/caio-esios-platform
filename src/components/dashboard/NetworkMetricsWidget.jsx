import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Activity, 
  Zap, 
  AlertTriangle, 
  TrendingUp,
  Network,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function NetworkMetricsWidget() {
  const { data: healthChecks = [] } = useQuery({
    queryKey: ['dashboard_health_checks'],
    queryFn: () => base44.entities.NetworkHealthCheck.list('-checked_at', 1),
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: automations = [] } = useQuery({
    queryKey: ['dashboard_automations'],
    queryFn: () => base44.entities.NetworkAutomation.list(),
    refetchInterval: 30000
  });

  const { data: anomalies = [] } = useQuery({
    queryKey: ['dashboard_anomalies'],
    queryFn: () => base44.entities.NetworkAnomaly.filter({ status: { $in: ['new', 'investigating'] } }),
    refetchInterval: 30000
  });

  const latestHealth = healthChecks[0];
  const activeAutomations = automations.filter(a => a.is_active);
  const recentExecutions = automations.filter(a => a.last_execution_at);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Health Status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Network Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestHealth ? (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-white">{latestHealth.health_score}</span>
                  <span className="text-slate-400 text-sm mb-1">/100</span>
                </div>
                <Badge className={`mt-2 ${
                  latestHealth.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                  latestHealth.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {latestHealth.status}
                </Badge>
                <p className="text-xs text-slate-400 mt-2">
                  Last checked: {new Date(latestHealth.checked_at).toLocaleTimeString()}
                </p>
              </>
            ) : (
              <p className="text-slate-400 text-sm">No health data available</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Automations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              Active Automations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{activeAutomations.length}</span>
              <span className="text-slate-400 text-sm mb-1">/ {automations.length}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-xs text-slate-400">
                {recentExecutions.filter(a => a.last_execution_status === 'success').length} successful
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Anomalies */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Active Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{anomalies.length}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              {anomalies.filter(a => a.severity === 'critical').length > 0 && (
                <Badge className="bg-red-500/20 text-red-400 text-xs">
                  {anomalies.filter(a => a.severity === 'critical').length} critical
                </Badge>
              )}
              {anomalies.filter(a => a.severity === 'high').length > 0 && (
                <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                  {anomalies.filter(a => a.severity === 'high').length} high
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Network Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Network className="w-4 h-4 text-green-400" />
              Network Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestHealth?.metrics ? (
              <>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Latency</span>
                    <span className="text-white font-medium">{latestHealth.metrics.latency_ms?.toFixed(1)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uptime</span>
                    <span className="text-white font-medium">{latestHealth.metrics.uptime_percent?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Error Rate</span>
                    <span className="text-white font-medium">{(latestHealth.metrics.error_rate * 100)?.toFixed(2)}%</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-sm">No metrics available</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}