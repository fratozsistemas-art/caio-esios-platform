import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, CheckCircle, AlertTriangle, TrendingUp, 
  ArrowRight, RotateCcw, Zap, X
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const DECISION_CONFIG = {
  maintain: { icon: ArrowRight, color: 'bg-blue-500', label: 'Mantido' },
  accelerate: { icon: Zap, color: 'bg-green-500', label: 'Acelerado' },
  decelerate: { icon: TrendingUp, color: 'bg-yellow-500', label: 'Desacelerado' },
  redirect: { icon: RotateCcw, color: 'bg-purple-500', label: 'Redirecionado' },
  pivot: { icon: TrendingUp, color: 'bg-orange-500', label: 'Pivotado' },
  abort: { icon: X, color: 'bg-red-500', label: 'Abortado' }
};

export default function VectorTimeline({ decision, checkpoints = [] }) {
  if (!decision) return null;

  const sortedCheckpoints = [...checkpoints].sort((a, b) => 
    new Date(b.checkpoint_date) - new Date(a.checkpoint_date)
  );

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Histórico de Checkpoints
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedCheckpoints.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Nenhum checkpoint registrado ainda</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />

            <div className="space-y-4">
              {sortedCheckpoints.map((checkpoint, idx) => {
                const config = DECISION_CONFIG[checkpoint.checkpoint_decision] || DECISION_CONFIG.maintain;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={checkpoint.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative pl-10"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-2 w-5 h-5 rounded-full ${config.color} flex items-center justify-center`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${config.color}/20 text-white`}>
                            Checkpoint #{checkpoint.checkpoint_number}
                          </Badge>
                          <Badge className={`${config.color}/20`} style={{ color: config.color.replace('bg-', '') }}>
                            {config.label}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(checkpoint.checkpoint_date), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>

                      {/* Summary */}
                      <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-slate-400">
                            {checkpoint.evidence_observed?.filter(e => e.supports_vector).length || 0} evidências +
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-yellow-400" />
                          <span className="text-slate-400">
                            {checkpoint.deviations?.length || 0} desvios
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-purple-400" />
                          <span className="text-slate-400">
                            {checkpoint.emergent_vectors?.length || 0} emergentes
                          </span>
                        </div>
                      </div>

                      {checkpoint.decision_rationale && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                          {checkpoint.decision_rationale}
                        </p>
                      )}

                      {checkpoint.vector_health_score && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-slate-500">Saúde:</span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full"
                              style={{ 
                                width: `${checkpoint.vector_health_score * 100}%`,
                                backgroundColor: checkpoint.vector_health_score > 0.7 ? '#22C55E' : 
                                  checkpoint.vector_health_score > 0.4 ? '#EAB308' : '#EF4444'
                              }}
                            />
                          </div>
                          <span className="text-xs text-white">
                            {Math.round(checkpoint.vector_health_score * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Next Checkpoint */}
        {decision.next_checkpoint_date && (
          <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-400">Próximo Checkpoint</span>
              </div>
              <span className="text-sm text-white">
                {format(new Date(decision.next_checkpoint_date), 'dd/MM/yyyy')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}