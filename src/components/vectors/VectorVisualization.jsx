import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Compass, TrendingUp, TrendingDown, AlertTriangle, 
  Zap, Shield, Target, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const DIRECTION_CONFIG = {
  expansion: { icon: '🚀', color: '#22C55E', angle: 45 },
  defense: { icon: '🛡️', color: '#3B82F6', angle: 0 },
  survival: { icon: '⚡', color: '#EF4444', angle: -45 },
  repositioning: { icon: '🔄', color: '#A855F7', angle: 90 },
  attack: { icon: '⚔️', color: '#F97316', angle: 30 },
  consolidation: { icon: '🏛️', color: '#06B6D4', angle: 0 },
  retreat: { icon: '🔙', color: '#64748B', angle: 180 }
};

const RELATION_COLORS = {
  reinforces: '#22C55E',
  neutralizes: '#EAB308',
  threatens: '#EF4444',
  independent: '#64748B'
};

export default function VectorVisualization({ decision }) {
  if (!decision) return null;

  const primaryDir = DIRECTION_CONFIG[decision.primary_vector?.direction] || DIRECTION_CONFIG.expansion;
  
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          Mapa de Vetores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Vector Compass */}
        <div className="relative w-full aspect-square max-w-xs mx-auto mb-6">
          {/* Background Circle */}
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-4 rounded-full border border-white/5" />
          <div className="absolute inset-8 rounded-full border border-white/5" />
          
          {/* Center Point */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-500" />
          
          {/* Primary Vector Arrow */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1/2 left-1/2 origin-left"
            style={{ 
              transform: `translate(-50%, -50%) rotate(${primaryDir.angle}deg)`,
              width: `${(decision.primary_vector?.intensity || 3) * 15 + 20}%`
            }}
          >
            <div 
              className="h-2 rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${primaryDir.color}80, ${primaryDir.color})` 
              }}
            />
            <div 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 rotate-45 border-t-2 border-r-2"
              style={{ borderColor: primaryDir.color }}
            />
          </motion.div>

          {/* Secondary Vectors */}
          {decision.secondary_vectors?.map((vec, idx) => {
            const angle = primaryDir.angle + (idx + 1) * 40 * (idx % 2 === 0 ? 1 : -1);
            const color = RELATION_COLORS[vec.relation] || RELATION_COLORS.independent;
            const length = (vec.intensity || 3) * 10 + 15;
            
            return (
              <motion.div
                key={idx}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.7 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="absolute top-1/2 left-1/2 origin-left"
                style={{ 
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  width: `${length}%`
                }}
              >
                <div 
                  className="h-1 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </motion.div>
            );
          })}

          {/* Direction Label */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 text-center">
            <span className="text-3xl">{primaryDir.icon}</span>
            <p className="text-xs text-white capitalize mt-1">{decision.primary_vector?.direction}</p>
          </div>
        </div>

        {/* Vector Details */}
        <div className="space-y-4">
          {/* Primary Vector */}
          <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-cyan-400 font-medium">Vetor Primário</span>
              <Badge className="bg-cyan-500/20 text-cyan-400">
                Intensidade {decision.primary_vector?.intensity}/5
              </Badge>
            </div>
            <p className="text-white">{decision.primary_vector?.name}</p>
            <Progress 
              value={(decision.primary_vector?.intensity || 0) * 20} 
              className="mt-2 h-2"
            />
          </div>

          {/* Secondary Vectors */}
          {decision.secondary_vectors?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase">Vetores Secundários</p>
              {decision.secondary_vectors.map((vec, idx) => (
                <div 
                  key={idx}
                  className="p-2 bg-white/5 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: RELATION_COLORS[vec.relation] }}
                    />
                    <span className="text-sm text-white">{vec.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${RELATION_COLORS[vec.relation]}20`,
                        color: RELATION_COLORS[vec.relation]
                      }}
                    >
                      {vec.relation}
                    </Badge>
                    <span className="text-xs text-slate-500">{vec.intensity}/5</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Forces Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400">Forças Oponentes</span>
              </div>
              <p className="text-lg font-bold text-white">
                {decision.opposing_forces?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">Forças Aceleradoras</span>
              </div>
              <p className="text-lg font-bold text-white">
                {decision.accelerating_forces?.length || 0}
              </p>
            </div>
          </div>

          {/* AI Validation Score */}
          {decision.ai_validation && (
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-400">Score IA</span>
                <span className="text-xl font-bold text-white">
                  {Math.round((decision.ai_validation.consistency_score || 0) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}