import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Sparkles, Brain, Zap, Network, CheckCircle, ArrowRight, 
  Target, Users, FileText, TrendingUp, Compass, Bot, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from './TutorialSystem';
import { TUTORIALS, RECOMMENDED_ORDER } from './tutorials';
import ABTestWrapper from '@/components/abtesting/ABTestWrapper';
import { useABTest } from '@/components/abtesting/ABTestProvider';

/**
 * SmartOnboarding - Intelligent onboarding that adapts to user behavior
 * Shows progressive tutorials based on features used and time spent
 */

export default function SmartOnboarding() {
  const { startTutorial, isTutorialCompleted } = useTutorial();
  const { trackInteraction, trackConversion } = useABTest();
  const [currentPhase, setCurrentPhase] = useState(0); // 0: setup, 1: core, 2: advanced
  const [showBanner, setShowBanner] = useState(false);
  const [nextTutorial, setNextTutorial] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    if (!user) return;

    // Check onboarding status
    const hasCompletedOnboarding = user.onboarding_completed;
    const accountAge = user.created_date ? 
      (Date.now() - new Date(user.created_date).getTime()) / (1000 * 60 * 60 * 24) : 0;

    // Phase 0: First 24 hours - Setup
    if (accountAge < 1 && !hasCompletedOnboarding) {
      setCurrentPhase(0);
      setNextTutorial(TUTORIALS.platformTour);
      setShowBanner(true);
      return;
    }

    // Find next uncompleted tutorial in recommended order
    const nextUncompleted = RECOMMENDED_ORDER.find(tutorialId => 
      !isTutorialCompleted(tutorialId)
    );

    if (nextUncompleted) {
      setNextTutorial(TUTORIALS[nextUncompleted]);
      
      // Determine phase based on which tutorials are completed
      const completedBasic = ['platformTour', 'dashboard', 'chatWithCaio'].every(id => 
        isTutorialCompleted(id)
      );
      const completedCore = RECOMMENDED_ORDER.slice(0, 5).every(id => 
        isTutorialCompleted(id)
      );

      if (!completedBasic) {
        setCurrentPhase(0);
      } else if (!completedCore) {
        setCurrentPhase(1);
      } else {
        setCurrentPhase(2);
      }

      // Show banner if user hasn't interacted in current session
      const hasInteracted = sessionStorage.getItem('caio_has_interacted');
      if (!hasInteracted && accountAge < 7) { // Show for first week
        setShowBanner(true);
      }
    }
  }, [user, isTutorialCompleted]);

  const handleStartTutorial = () => {
    if (nextTutorial) {
      startTutorial(nextTutorial.id);
      setShowBanner(false);
      sessionStorage.setItem('caio_has_interacted', 'true');
      trackConversion('onboarding_flow', 'tutorial_started', 1, { tutorialId: nextTutorial.id });
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('caio_has_interacted', 'true');
    trackInteraction('onboarding_flow', 'dismissed');
  };

  const phaseConfig = {
    0: {
      title: 'Getting Started with CAIO·AI',
      icon: Sparkles,
      color: '#C7A763',
      gradient: 'from-[#C7A763] to-[#E3C37B]'
    },
    1: {
      title: 'Master Core Features',
      icon: Brain,
      color: '#00D4FF',
      gradient: 'from-[#00D4FF] to-[#00A8CC]'
    },
    2: {
      title: 'Unlock Advanced Capabilities',
      icon: Zap,
      color: '#8B5CF6',
      gradient: 'from-purple-500 to-pink-500'
    }
  };

  const config = phaseConfig[currentPhase];
  const Icon = config.icon;

  // Calculate progress
  const completedTutorials = RECOMMENDED_ORDER.filter(id => 
    isTutorialCompleted(id)
  ).length;
  const progress = (completedTutorials / RECOMMENDED_ORDER.length) * 100;

  if (!showBanner || !nextTutorial) return null;

  return (
    <ABTestWrapper testName="onboarding_flow" fallback={null}>
      {() => (
        <AnimatePresence>
          <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 right-6 z-40 max-w-md"
      >
        <Card className="bg-gradient-to-br from-[#0A2540] to-[#1A1D29] border-2 shadow-2xl"
          style={{ borderColor: config.color }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${config.color}30, ${config.color}10)`,
                    boxShadow: `0 0 20px ${config.color}40`
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-white text-base mb-1">
                    {config.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="h-1.5 flex-1" />
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {completedTutorials}/{RECOMMENDED_ORDER.length}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="h-6 w-6 text-slate-400 hover:text-white flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Next Tutorial */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  Next Up
                </Badge>
                <Badge className="bg-white/10 text-slate-300 text-xs">
                  {nextTutorial.duration}
                </Badge>
              </div>
              <h4 className="text-white font-semibold mb-1">{nextTutorial.title}</h4>
              <p className="text-slate-300 text-xs mb-3">{nextTutorial.description}</p>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleStartTutorial}
                  className={`bg-gradient-to-r ${config.gradient} text-white hover:opacity-90 flex-1`}
                >
                  <Sparkles className="w-3 h-3 mr-2" />
                  Start Tutorial
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-white"
                >
                  Later
                </Button>
              </div>
            </div>

            {/* Progress Milestones */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Your Progress:</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { count: completedTutorials, label: 'Completed', icon: CheckCircle, color: 'text-green-400' },
                  { count: RECOMMENDED_ORDER.length - completedTutorials, label: 'Remaining', icon: Target, color: 'text-slate-400' },
                  { count: currentPhase + 1, label: 'Phase', icon: TrendingUp, color: 'text-[#00D4FF]' }
                ].map((stat, idx) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={idx} className="bg-white/5 rounded-lg p-2 text-center">
                      <StatIcon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                      <div className="text-white font-bold text-sm">{stat.count}</div>
                      <div className="text-[10px] text-slate-400">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </ABTestWrapper>
  );
}