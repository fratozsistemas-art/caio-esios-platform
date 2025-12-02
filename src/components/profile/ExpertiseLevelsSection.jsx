import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, MessageSquare, Brain, Network, FileText, 
  BarChart3, GitMerge, Zap, Users, Star, Crown, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

const featureConfig = {
  chat: { 
    icon: MessageSquare, 
    label: 'Chat com CAIO', 
    color: 'text-blue-400',
    bg: 'from-blue-500/20 to-blue-600/20'
  },
  analysis: { 
    icon: BarChart3, 
    label: 'Análises', 
    color: 'text-green-400',
    bg: 'from-green-500/20 to-green-600/20'
  },
  knowledge_graph: { 
    icon: Network, 
    label: 'Knowledge Graph', 
    color: 'text-purple-400',
    bg: 'from-purple-500/20 to-purple-600/20'
  },
  tsi_projects: { 
    icon: Brain, 
    label: 'Projetos TSI', 
    color: 'text-cyan-400',
    bg: 'from-cyan-500/20 to-cyan-600/20'
  },
  collaboration: { 
    icon: Users, 
    label: 'Colaboração', 
    color: 'text-orange-400',
    bg: 'from-orange-500/20 to-orange-600/20'
  },
  workflows: { 
    icon: GitMerge, 
    label: 'Workflows IA', 
    color: 'text-pink-400',
    bg: 'from-pink-500/20 to-pink-600/20'
  },
  file_analyzer: { 
    icon: FileText, 
    label: 'File Analyzer', 
    color: 'text-amber-400',
    bg: 'from-amber-500/20 to-amber-600/20'
  },
  data_analysis: { 
    icon: Zap, 
    label: 'Data Analysis', 
    color: 'text-red-400',
    bg: 'from-red-500/20 to-red-600/20'
  }
};

const levelConfig = {
  beginner: { label: 'Iniciante', color: 'bg-slate-500', icon: Star, xpNeeded: 100 },
  intermediate: { label: 'Intermediário', color: 'bg-blue-500', icon: Star, xpNeeded: 500 },
  advanced: { label: 'Avançado', color: 'bg-purple-500', icon: Crown, xpNeeded: 1500 },
  expert: { label: 'Expert', color: 'bg-[#FFB800]', icon: Shield, xpNeeded: 5000 }
};

export default function ExpertiseLevelsSection({ userEmail }) {
  const { data: expertiseData = [], isLoading } = useQuery({
    queryKey: ['user-expertise', userEmail],
    queryFn: () => base44.entities.UserExpertise.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  // Calculate overall level
  const totalXP = expertiseData.reduce((sum, e) => sum + (e.xp_points || 0), 0);
  const overallLevel = totalXP >= 5000 ? 'expert' : totalXP >= 1500 ? 'advanced' : totalXP >= 500 ? 'intermediate' : 'beginner';

  // Fill in missing features with defaults
  const allFeatures = Object.keys(featureConfig);
  const expertiseMap = expertiseData.reduce((acc, e) => {
    acc[e.feature] = e;
    return acc;
  }, {});

  const getProgressToNextLevel = (xp) => {
    if (xp >= 5000) return 100;
    if (xp >= 1500) return ((xp - 1500) / 3500) * 100;
    if (xp >= 500) return ((xp - 500) / 1000) * 100;
    if (xp >= 100) return ((xp - 100) / 400) * 100;
    return (xp / 100) * 100;
  };

  if (isLoading) {
    return <div className="text-center py-8 text-slate-400">Carregando especialização...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overall Level Card */}
      <Card className="bg-gradient-to-br from-[#00D4FF]/10 to-[#FFB800]/10 border-[#00D4FF]/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00D4FF] to-[#FFB800] flex items-center justify-center">
              <Award className="w-10 h-10 text-[#0A1628]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">Nível Geral</h2>
                <Badge className={`${levelConfig[overallLevel].color} text-white`}>
                  {levelConfig[overallLevel].label}
                </Badge>
              </div>
              <p className="text-slate-400 mb-3">
                {totalXP.toLocaleString()} XP total
              </p>
              <div className="flex items-center gap-3">
                <Progress value={getProgressToNextLevel(totalXP)} className="flex-1 h-3" />
                <span className="text-sm text-slate-400">
                  {overallLevel !== 'expert' && `${levelConfig[overallLevel === 'beginner' ? 'intermediate' : overallLevel === 'intermediate' ? 'advanced' : 'expert'].xpNeeded - totalXP} XP para próximo nível`}
                  {overallLevel === 'expert' && 'Nível máximo!'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Expertise Grid */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-[#FFB800]" />
            Especialização por Funcionalidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {allFeatures.map((feature, idx) => {
              const config = featureConfig[feature];
              const expertise = expertiseMap[feature] || { level: 'beginner', xp_points: 0, interaction_count: 0 };
              const Icon = config.icon;
              const LevelIcon = levelConfig[expertise.level]?.icon || Star;

              return (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-xl bg-gradient-to-br ${config.bg} border border-white/10`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{config.label}</h3>
                        <p className="text-xs text-slate-400">
                          {expertise.interaction_count || 0} interações
                        </p>
                      </div>
                    </div>
                    <Badge className={`${levelConfig[expertise.level].color} text-white text-xs`}>
                      <LevelIcon className="w-3 h-3 mr-1" />
                      {levelConfig[expertise.level].label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{expertise.xp_points || 0} XP</span>
                      <span>{Math.round(getProgressToNextLevel(expertise.xp_points || 0))}%</span>
                    </div>
                    <Progress value={getProgressToNextLevel(expertise.xp_points || 0)} className="h-2" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Level Legend */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Como Subir de Nível</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(levelConfig).map(([level, config]) => {
              const Icon = config.icon;
              return (
                <div key={level} className="text-center p-3 rounded-lg bg-slate-800/50">
                  <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-medium text-white text-sm">{config.label}</p>
                  <p className="text-xs text-slate-500">{config.xpNeeded}+ XP</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            Ganhe XP usando cada funcionalidade: análises, chats, colaboração e mais!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}