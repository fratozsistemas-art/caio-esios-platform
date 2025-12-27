import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  high: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  medium: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
  low: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' }
};

export default function NetworkAnomaliesPanel({ anomalies, onAnomalyClick }) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-green-400" />
            Network Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-slate-400">No anomalies detected</p>
            <p className="text-xs text-slate-500 mt-1">Network appears healthy</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedAnomalies = [...anomalies].sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
  });

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          Network Anomalies
          <Badge className="ml-auto bg-red-500/20 text-red-400 border-red-500/30">
            {anomalies.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {sortedAnomalies.slice(0, 10).map((anomaly, idx) => {
          const config = severityConfig[anomaly.severity] || severityConfig.low;
          const Icon = config.icon;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-3 rounded-lg border ${config.bg} ${config.border} cursor-pointer hover:bg-opacity-30 transition-all`}
              onClick={() => onAnomalyClick?.(anomaly)}
            >
              <div className="flex items-start gap-2">
                <Icon className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-white text-sm font-medium truncate">
                      {anomaly.node_label || 'Unknown Node'}
                    </p>
                    <Badge className={`${config.bg} ${config.color} border-none text-xs flex-shrink-0`}>
                      {anomaly.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-1">
                    {anomaly.details}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="border-white/20 text-slate-500">
                      {anomaly.type.replace(/_/g, ' ')}
                    </Badge>
                    {anomaly.detected_at && (
                      <span className="text-slate-500">
                        {new Date(anomaly.detected_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
              </div>
            </motion.div>
          );
        })}

        {anomalies.length > 10 && (
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              +{anomalies.length - 10} more anomalies
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}