import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Loader2, ShieldAlert, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const severityConfig = {
  critical: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', icon: ShieldAlert },
  high: { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400', icon: AlertTriangle },
  medium: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', icon: AlertTriangle },
  low: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', icon: AlertTriangle }
};

function ConflictAnalysisPanel() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['fact-conflicts'],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyzeFactConflicts', {});
      return response.data;
    },
    staleTime: 15 * 60 * 1000
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </CardContent>
      </Card>
    );
  }

  const conflicts = data?.conflicts || [];
  const consistencyScore = data?.consistency_score || 0;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Conflict Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={consistencyScore >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
              Consistency: {consistencyScore}%
            </Badge>
            <Button size="sm" variant="ghost" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-2">{data?.summary}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {conflicts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400 opacity-50" />
            <p className="text-slate-300">No conflicts detected</p>
          </div>
        ) : (
          conflicts.map((conflict, idx) => {
            const config = severityConfig[conflict.severity];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${config.bg} border ${config.border} rounded-lg p-4`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${config.text} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${config.bg} ${config.text} border ${config.border} text-xs uppercase`}>
                        {conflict.severity}
                      </Badge>
                      <Badge className="bg-slate-700 text-slate-300 text-xs">
                        {conflict.conflict_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-white text-sm mb-2">{conflict.description}</p>
                    <div className="text-xs text-slate-400 mb-2">
                      Affected facts: {conflict.fact_ids?.join(', ')}
                    </div>
                    <div className="bg-slate-900/50 rounded p-2 mt-2">
                      <p className="text-xs text-slate-300">
                        <strong className="text-white">Recommended:</strong> {conflict.recommended_action}
                      </p>
                    </div>
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