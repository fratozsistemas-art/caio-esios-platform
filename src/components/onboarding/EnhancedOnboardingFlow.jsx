import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, Circle, PlayCircle, TrendingUp, Newspaper, 
  Activity, Brain, MessageSquare, Zap, Network, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from '../tutorial/TutorialSystem';

const ONBOARDING_STEPS = [
  {
    id: 'dashboard',
    titleEN: 'Explore Dashboard',
    titlePT: 'Explorar Dashboard',
    descriptionEN: 'Get familiar with your command center',
    descriptionPT: 'Familiarize-se com seu centro de comando',
    icon: TrendingUp,
    tutorial: 'dashboard',
    estimatedTime: '3 min'
  },
  {
    id: 'real_time_widgets',
    titleEN: 'Real-Time Data',
    titlePT: 'Dados em Tempo Real',
    descriptionEN: 'Learn to use market data widgets',
    descriptionPT: 'Aprenda a usar widgets de dados de mercado',
    icon: Activity,
    tutorial: 'real_time_widgets',
    estimatedTime: '5 min'
  },
  {
    id: 'market_intelligence',
    titleEN: 'Market Intelligence',
    titlePT: 'Inteligência de Mercado',
    descriptionEN: 'Master the M1 analysis module',
    descriptionPT: 'Domine o módulo de análise M1',
    icon: Brain,
    tutorial: 'market_intelligence',
    estimatedTime: '8 min'
  },
  {
    id: 'chat',
    titleEN: 'Chat with CAIO',
    titlePT: 'Chat com CAIO',
    descriptionEN: 'Start conversations with AI',
    descriptionPT: 'Inicie conversas com a IA',
    icon: MessageSquare,
    tutorial: 'chat',
    estimatedTime: '4 min'
  },
  {
    id: 'quickactions',
    titleEN: 'Quick Actions',
    titlePT: 'Ações Rápidas',
    descriptionEN: 'Execute strategic analyses quickly',
    descriptionPT: 'Execute análises estratégicas rapidamente',
    icon: Zap,
    tutorial: 'quickactions',
    estimatedTime: '6 min'
  },
  {
    id: 'graph',
    titleEN: 'Knowledge Graph',
    titlePT: 'Grafo de Conhecimento',
    descriptionEN: 'Explore strategic connections',
    descriptionPT: 'Explore conexões estratégicas',
    icon: Network,
    tutorial: 'graph',
    estimatedTime: '7 min'
  }
];

export default function EnhancedOnboardingFlow() {
  const [visible, setVisible] = useState(true);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const { startTutorial, isTutorialCompleted } = useTutorial();

  useEffect(() => {
    // Load completed tutorials
    const loadProgress = async () => {
      try {
        const user = await base44.auth.me();
        const progress = await base44.entities.UserDashboardConfig.filter({
          user_email: user.email
        });
        
        if (progress && progress.length > 0) {
          const completed = ONBOARDING_STEPS
            .filter(step => isTutorialCompleted(step.tutorial))
            .map(step => step.id);
          setCompletedSteps(completed);
        }
        
        // Check if onboarding is complete
        const allCompleted = ONBOARDING_STEPS.every(step => 
          isTutorialCompleted(step.tutorial)
        );
        
        if (allCompleted) {
          setVisible(false);
        }
      } catch (error) {
        console.error('Error loading onboarding progress:', error);
      }
    };
    
    loadProgress();
  }, []);

  const progress = (completedSteps.length / ONBOARDING_STEPS.length) * 100;
  const isPT = currentLanguage === 'pt-BR';

  const handleStartTutorial = (tutorialId) => {
    startTutorial(tutorialId);
  };

  const handleDismiss = async () => {
    setVisible(false);
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        onboarding_completed: true
      });
    } catch (error) {
      console.error('Error dismissing onboarding:', error);
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex-1">
              <CardTitle className="text-white text-xl mb-2 flex items-center gap-2">
                🚀 {isPT ? 'Bem-vindo ao ESIOS CAIO' : 'Welcome to ESIOS CAIO'}
              </CardTitle>
              <p className="text-sm text-slate-300">
                {isPT 
                  ? 'Complete estes passos para dominar a plataforma de inteligência estratégica'
                  : 'Complete these steps to master the strategic intelligence platform'
                }
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">
                  {isPT ? 'Progresso Geral' : 'Overall Progress'}
                </span>
                <span className="text-sm font-semibold text-white">
                  {completedSteps.length} / {ONBOARDING_STEPS.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ONBOARDING_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.includes(step.id);
                const isNext = !isCompleted && completedSteps.length === idx;
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-lg border transition-all ${
                      isCompleted 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : isNext
                        ? 'bg-blue-500/10 border-blue-500/40 ring-2 ring-blue-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500/20' 
                          : isNext
                          ? 'bg-blue-500/20'
                          : 'bg-white/10'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Icon className={`w-5 h-5 ${isNext ? 'text-blue-400' : 'text-slate-400'}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm mb-1">
                          {isPT ? step.titlePT : step.titleEN}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {isPT ? step.descriptionPT : step.descriptionEN}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                        {step.estimatedTime}
                      </Badge>
                      {!isCompleted && (
                        <Button
                          size="sm"
                          onClick={() => handleStartTutorial(step.tutorial)}
                          className={`${
                            isNext 
                              ? 'bg-blue-500 hover:bg-blue-600' 
                              : 'bg-white/10 hover:bg-white/20'
                          } text-white h-8 px-3`}
                        >
                          <PlayCircle className="w-3 h-3 mr-1" />
                          {isPT ? 'Iniciar' : 'Start'}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Completion Message */}
            {progress === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center"
              >
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-white font-semibold mb-1">
                  {isPT ? '🎉 Onboarding Completo!' : '🎉 Onboarding Complete!'}
                </p>
                <p className="text-sm text-slate-300 mb-3">
                  {isPT 
                    ? 'Você dominou os fundamentos do ESIOS CAIO. Pronto para análises estratégicas!'
                    : "You've mastered ESIOS CAIO fundamentals. Ready for strategic analysis!"
                  }
                </p>
                <Button
                  onClick={handleDismiss}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isPT ? 'Fechar e Começar' : 'Close and Get Started'}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}