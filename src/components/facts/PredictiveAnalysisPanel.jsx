import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const momentumColors = {
  accelerating: { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-400' },
  stable: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400' },
  declining: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400' }
};

function PredictiveAnalysisPanel() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['fact-predictions'],
    queryFn: async () => {
      const response = await base44.functions.invoke('predictFactTrends', {});
      return response.data;
    },
    staleTime: 30 * 60 * 1000
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </CardContent>
      </Card>
    );
  }

  const predictions = data?.predictions || [];
  const momentum = data?.topic_momentum || [];
  const scenarios = data?.geopolitical_scenarios || [];
  const blackSwans = data?.black_swan_events || [];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Predictive Trend Analysis
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => refetch()} className="text-cyan-400">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictions.map((pred, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-semibold">{pred.trend_name}</h4>
                <Badge className={
                  pred.probability >= 0.7 ? 'bg-green-500/20 text-green-400' :
                  pred.probability >= 0.4 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }>
                  {(pred.probability * 100).toFixed(0)}% probability
                </Badge>
              </div>
              <p className="text-sm text-slate-300 mb-3">{pred.description}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <Zap className="w-3 h-3" />
                <span>Timeframe: {pred.timeframe}</span>
              </div>
              {pred.related_topics && pred.related_topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {pred.related_topics.map((topic, i) => (
                    <Badge key={i} className="bg-cyan-500/20 text-cyan-400 text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
              {pred.key_indicators && pred.key_indicators.length > 0 && (
                <div className="bg-slate-900/50 rounded p-2 mt-2">
                  <p className="text-xs text-slate-400 mb-1">Key Indicators to Watch:</p>
                  <ul className="space-y-1">
                    {pred.key_indicators.map((indicator, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-1">
                        <span className="text-cyan-400">•</span>
                        <span>{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Topic Momentum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {momentum.map((m, idx) => {
            const config = momentumColors[m.momentum];
            return (
              <div key={idx} className={`${config.bg} border ${config.border} rounded-lg p-3`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium text-sm">{m.topic}</span>
                  <Badge className={`${config.bg} ${config.text} border ${config.border} text-xs uppercase`}>
                    {m.momentum}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300">{m.reasoning}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {scenarios.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Geopolitical Scenarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scenarios.map((scenario, idx) => (
              <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-semibold">{scenario.scenario_name}</h4>
                  <Badge className={
                    scenario.impact_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                    scenario.impact_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    scenario.impact_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }>
                    {scenario.impact_level} impact
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 mb-2">{scenario.description}</p>
                <div className="text-xs text-slate-400">
                  Probability: {(scenario.probability * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {blackSwans.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-red-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              Black Swan Possibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {blackSwans.map((swan, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-3">
                <h4 className="text-white font-semibold text-sm mb-1">{swan.event}</h4>
                <p className="text-xs text-slate-300 mb-2">{swan.impact_description}</p>
                <p className="text-xs text-purple-400">{swan.probability_assessment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

PredictiveAnalysisPanel.propTypes = {};

export default PredictiveAnalysisPanel;