import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Shield, Activity, Eye, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

const categoryIcons = {
  Strategy: TrendingUp,
  Security: Shield,
  Operations: Activity
};

const categoryColors = {
  Strategy: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  Security: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  Operations: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' }
};

export default function QuickActionsResultsWidget() {
  const navigate = useNavigate();
  
  const { data: recentActions = [], isLoading } = useQuery({
    queryKey: ['recent-quick-actions'],
    queryFn: async () => {
      const analyses = await base44.entities.Analysis.filter(
        { analysis_type: 'quick_action' },
        '-created_date',
        6
      );
      return analyses;
    },
    refetchInterval: 60000
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Ações Rápidas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Ações Rápidas Recentes
          </CardTitle>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            {recentActions.length} execuções
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentActions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma ação rápida executada ainda</p>
          </div>
        ) : (
          recentActions.map((action, idx) => {
            const category = action.metadata?.action_category || 'Strategy';
            const Icon = categoryIcons[category] || Zap;
            const colors = categoryColors[category] || categoryColors.Strategy;
            
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`${colors.bg} border ${colors.border} rounded-lg p-3 hover:bg-opacity-20 transition-all cursor-pointer group`}
                onClick={() => navigate(createPageUrl('AnalysesDashboard'))}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                      <Icon className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate group-hover:text-blue-400 transition-colors">
                        {action.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${colors.bg} ${colors.text} border ${colors.border} text-xs`}>
                          {category}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {new Date(action.created_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </div>
              </motion.div>
            );
          })
        )}
        
        {recentActions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(createPageUrl('AnalysesDashboard'))}
            className="w-full text-slate-400 hover:text-white hover:bg-white/5"
          >
            Ver todas as análises →
          </Button>
        )}
      </CardContent>
    </Card>
  );
}