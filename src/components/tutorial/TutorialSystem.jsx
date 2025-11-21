import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, Play, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// PLATFORM VERSION - Increment this when releasing major tutorial updates
const CURRENT_PLATFORM_VERSION = '1.0.0';

const TutorialContext = createContext();

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};

export const TutorialProvider = ({ children }) => {
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState([]);
  const [showTips, setShowTips] = useState(true);
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const user = await base44.auth.me();
        const completed = user.tutorial_progress || [];
        setCompletedTutorials(completed);
        setShowTips(user.show_tutorial_tips !== false);

        // Check if tutorial should be shown
        const userTutorialVersion = user.tutorial_version || '0.0.0';
        const skipUntilVersion = user.skip_tutorial_until_version;

        // Show tutorial if:
        // 1. User's tutorial version is older than current platform version
        // 2. AND (no skip preference OR skip preference is for older version)
        const shouldShow = 
          compareVersions(userTutorialVersion, CURRENT_PLATFORM_VERSION) < 0 &&
          (!skipUntilVersion || compareVersions(skipUntilVersion, CURRENT_PLATFORM_VERSION) < 0);

        setShouldShowTutorial(shouldShow);
      } catch (error) {
        console.error('Failed to load tutorial progress:', error);
      }
    };
    loadProgress();
  }, []);

  const startTutorial = (tutorialId) => {
    setCurrentTutorial(tutorialId);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const completeTutorial = async () => {
    if (currentTutorial && !completedTutorials.includes(currentTutorial)) {
      const updated = [...completedTutorials, currentTutorial];
      setCompletedTutorials(updated);
      
      try {
        await base44.auth.updateMe({
          tutorial_progress: updated,
          tutorial_version: CURRENT_PLATFORM_VERSION
        });
        setShouldShowTutorial(false);
      } catch (error) {
        console.error('Failed to save tutorial progress:', error);
      }
    }
    setCurrentTutorial(null);
    setCurrentStep(0);
  };

  const skipTutorial = async () => {
    try {
      await base44.auth.updateMe({
        tutorial_version: CURRENT_PLATFORM_VERSION
      });
      setShouldShowTutorial(false);
    } catch (error) {
      console.error('Failed to skip tutorial:', error);
    }
    setCurrentTutorial(null);
    setCurrentStep(0);
  };

  const skipUntilNextUpdate = async () => {
    try {
      await base44.auth.updateMe({
        skip_tutorial_until_version: CURRENT_PLATFORM_VERSION
      });
      setShouldShowTutorial(false);
    } catch (error) {
      console.error('Failed to skip tutorial:', error);
    }
    setCurrentTutorial(null);
    setCurrentStep(0);
  };

  const toggleTips = async (show) => {
    setShowTips(show);
    try {
      await base44.auth.updateMe({
        show_tutorial_tips: show
      });
    } catch (error) {
      console.error('Failed to save tips preference:', error);
    }
  };

  const isTutorialCompleted = (tutorialId) => {
    return completedTutorials.includes(tutorialId);
  };

  return (
    <TutorialContext.Provider
      value={{
        currentTutorial,
        currentStep,
        completedTutorials,
        showTips,
        shouldShowTutorial,
        startTutorial,
        nextStep,
        prevStep,
        completeTutorial,
        skipTutorial,
        skipUntilNextUpdate,
        toggleTips,
        isTutorialCompleted,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

// Helper function to compare semantic versions
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }
  return 0;
}

export const TutorialOverlay = ({ tutorial }) => {
  const { currentTutorial, currentStep, nextStep, prevStep, completeTutorial, skipTutorial, skipUntilNextUpdate } = useTutorial();
  const [targetRect, setTargetRect] = React.useState(null);

  const step = tutorial?.steps?.[currentStep];
  const isLastStep = tutorial ? currentStep === tutorial.steps.length - 1 : false;
  const isFirstStep = currentStep === 0;

  // Find and highlight target element
  React.useEffect(() => {
    if (!tutorial || currentTutorial !== tutorial.id) return;
    
    const updateTargetPosition = () => {
      // Only highlight if step explicitly has a targetSelector
      if (step?.targetSelector) {
        const element = document.querySelector(step.targetSelector);
        if (element) {
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
          
          // Scroll into view with delay for animation
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          }, 100);
        } else {
          // Element not found, don't show spotlight
          setTargetRect(null);
        }
      } else {
        // No targetSelector means no spotlight (general info step)
        setTargetRect(null);
      }
    };

    updateTargetPosition();

    // Update position on window resize and scroll only if there's a target
    if (step?.targetSelector) {
      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition, true);

      return () => {
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition, true);
      };
    }
  }, [currentStep, step?.targetSelector, tutorial, currentTutorial]);

  if (!tutorial || currentTutorial !== tutorial.id || !step) return null;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const margin = 20;
    const tooltipWidth = 400;
    const tooltipHeight = 350; // Increased for better spacing

    // Try positioning below first
    let top = targetRect.bottom + margin;
    let left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
    let placement = 'bottom';

    // If too close to bottom, position above
    if (top + tooltipHeight > window.innerHeight - margin) {
      top = targetRect.top - tooltipHeight - margin;
      placement = 'top';
      
      // If also too close to top, position to the side
      if (top < margin) {
        top = targetRect.top;
        // Position to right if there's space
        if (targetRect.right + tooltipWidth + margin < window.innerWidth) {
          left = targetRect.right + margin;
          placement = 'right';
        } else {
          left = targetRect.left - tooltipWidth - margin;
          placement = 'left';
        }
      }
    }

    // Ensure tooltip stays within viewport horizontally
    if (left < margin) left = margin;
    if (left + tooltipWidth > window.innerWidth - margin) {
      left = window.innerWidth - tooltipWidth - margin;
    }

    // Ensure tooltip stays within viewport vertically
    if (top < margin) top = margin;
    if (top + tooltipHeight > window.innerHeight - margin) {
      top = window.innerHeight - tooltipHeight - margin;
    }

    return { top: `${top}px`, left: `${left}px`, placement };
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && skipTutorial()}
      >
        {/* Spotlight on target element */}
        {targetRect && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute pointer-events-none border-4 border-cyan-400 rounded-lg shadow-2xl"
              style={{
                top: `${targetRect.top - 4}px`,
                left: `${targetRect.left - 4}px`,
                width: `${targetRect.width + 8}px`,
                height: `${targetRect.height + 8}px`,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 40px rgba(34, 211, 238, 0.6)',
              }}
            />
            {/* Pulse animation */}
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute pointer-events-none border-2 border-cyan-400 rounded-lg"
              style={{
                top: `${targetRect.top - 8}px`,
                left: `${targetRect.left - 8}px`,
                width: `${targetRect.width + 16}px`,
                height: `${targetRect.height + 16}px`,
              }}
            />
          </>
        )}

        {/* Tutorial Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute pointer-events-auto"
          style={getTooltipPosition()}
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 shadow-2xl w-[400px]">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {step.icon && <step.icon className="w-5 h-5 text-cyan-400" />}
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipTutorial}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <p className="text-slate-300 mb-6 leading-relaxed">{step.content}</p>

              {/* Progress */}
              <div className="flex items-center gap-2 mb-6">
                {tutorial.steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      idx <= currentStep ? 'bg-cyan-400' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                    {currentStep + 1} / {tutorial.steps.length}
                  </Badge>
                  {tutorial.category && (
                    <Badge variant="outline" className="text-slate-400 border-slate-600">
                      {tutorial.category}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Voltar
                    </Button>
                  )}
                  {!isLastStep ? (
                    <Button
                      size="sm"
                      onClick={nextStep}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white"
                    >
                      Próximo
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={completeTutorial}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Concluir
                    </Button>
                  )}
                </div>
              </div>

              {/* Skip options */}
              <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-700">
                <button
                  onClick={skipTutorial}
                  className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Pular agora
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={skipUntilNextUpdate}
                  className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Pular até próxima atualização
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const ContextualTip = ({ id, content, icon: Icon = Sparkles, position = 'bottom' }) => {
  const { showTips, completedTutorials } = useTutorial();
  const [dismissed, setDismissed] = useState(false);

  if (!showTips || dismissed || completedTutorials.includes(`tip_${id}`)) {
    return null;
  }

  const handleDismiss = async () => {
    setDismissed(true);
    try {
      const user = await base44.auth.me();
      const updated = [...(user.tutorial_progress || []), `tip_${id}`];
      await base44.auth.updateMe({
        tutorial_progress: updated
      });
    } catch (error) {
      console.error('Failed to save tip dismissal:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: position === 'bottom' ? -10 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: position === 'bottom' ? -10 : 10 }}
      className={`absolute ${position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'} left-0 z-40`}
    >
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 shadow-xl max-w-xs">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-slate-200 leading-relaxed">{content}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white h-6 w-6 flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};