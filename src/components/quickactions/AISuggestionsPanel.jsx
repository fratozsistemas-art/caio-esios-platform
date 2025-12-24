import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, AlertCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const priorityConfig = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' }
};

export default function AISuggestionsPanel({ onActionSelect }) {
  const { data: suggestions, isLoading, refetch } = useQuery({
    queryKey: ['ai-suggestions'],
    queryFn: async () => {
      const response = await base44.functions.invoke('suggestNextActions', {});
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Sugestões de IA
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </CardContent>
      </Card>
    );
  }

  const actions = suggestions?.suggestions || [];
  const insights = suggestions?.insights || {};

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Sugestões de IA para Você
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            className="text-purple-400 hover:text-purple-300"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        {insights.focus_area && (
          <p className="text-sm text-slate-400 mt-2">
            Foco detectado: <span className="text-purple-400 font-medium">{insights.focus_area}</span>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma sugestão disponível no momento</p>
          </div>
        ) : (
          actions.map((action, idx) => {
            const config = priorityConfig[action.priority] || priorityConfig.medium;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${config.bg} border ${config.border} rounded-lg p-4 hover:bg-opacity-20 transition-all cursor-pointer group`}
                onClick={() => onActionSelect?.(action)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${config.bg} ${config.text} border ${config.border} text-xs uppercase`}>
                        {action.priority}
                      </Badge>
                      <Badge className="bg-slate-700 text-slate-300 text-xs">
                        {action.category}
                      </Badge>
                    </div>
                    <h4 className="text-white font-medium mb-1 group-hover:text-purple-400 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-slate-400 mb-2">{action.reason}</p>
                    {action.estimated_impact && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <TrendingUp className="w-3 h-3" />
                        <span>Impacto: {action.estimated_impact}</span>
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                </div>
              </motion.div>
            );
          })
        )}

        {insights.recommendations && insights.recommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-purple-500/20">
            <p className="text-xs text-slate-400 mb-2">Recomendações Gerais:</p>
            <ul className="space-y-1">
              {insights.recommendations.slice(0, 3).map((rec, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}