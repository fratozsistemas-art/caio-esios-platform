import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, CheckCircle, Trash2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ABTestCard({ test, stats, onUpdate, onDelete }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const totalImpressions = Object.values(stats).reduce((sum, s) => sum + (s.impressions || 0), 0);
  const bestVariant = Object.entries(stats).sort(
    ([, a], [, b]) => parseFloat(b.conversionRate || 0) - parseFloat(a.conversionRate || 0)
  )[0];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-white mb-2">{test.name}</CardTitle>
              <p className="text-sm text-slate-400 mb-3">{test.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {test.test_type}
                </Badge>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {totalImpressions} impressions
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {test.status === 'active' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdate({ status: 'paused' })}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Pause className="w-4 h-4" />
                </Button>
              )}
              {test.status === 'paused' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdate({ status: 'active' })}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
              {test.status === 'draft' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdate({ status: 'active' })}
                  className="border-green-500/20 text-green-400 hover:bg-green-500/10"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete()}
                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {test.variants.map((variant) => {
              const variantStats = stats[variant.id] || {};
              const isBest = bestVariant && bestVariant[0] === variant.id;
              
              return (
                <div 
                  key={variant.id} 
                  className={`p-4 rounded-lg border ${
                    isBest 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{variant.name}</h4>
                    {isBest && totalImpressions > 50 && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{variant.weight}% traffic</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Impressions</span>
                      <span className="text-white font-medium">{variantStats.impressions || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Conversions</span>
                      <span className="text-white font-medium">{variantStats.conversions || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Conv. Rate</span>
                      <span className="text-green-400 font-medium">{variantStats.conversionRate || 0}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}