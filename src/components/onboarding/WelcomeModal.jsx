import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Users, MessageSquare, Network, Shield, 
  ArrowRight, Check, Sparkles, Play, BookOpen
} from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to CAIO·AI! 🚀',
    subtitle: 'Your Executive Strategic Intelligence Platform',
    description: 'CAIO·AI is built to transform strategic decision-making with AI-powered insights, real-time collaboration, and institutional-grade governance.',
    icon: Brain,
    color: '#00D4FF',
    features: [
      { icon: Zap, label: '11 TSI Cognitive Modules' },
      { icon: Network, label: '10K+ Strategic Connections' },
      { icon: Shield, label: 'Hermes Trust-Broker Governance' }
    ]
  },
  {
    id: 'chat',
    title: 'Chat with CAIO 💬',
    subtitle: 'Your Strategic AI Partner',
    description: 'Ask strategic questions, analyze documents, get market insights, and receive AI-powered recommendations. CAIO remembers your context across conversations.',
    icon: MessageSquare,
    color: '#00D4FF',
    tips: [
      'Upload documents for instant analysis',
      'Use @mentions to reference previous insights',
      'Ask follow-up questions for deeper analysis'
    ]
  },
  {
    id: 'collaboration',
    title: 'Real-Time Collaboration 👥',
    subtitle: 'Work Together Seamlessly',
    description: 'Collaborate with your team in real-time. Comment on analyses, assign tasks, share insights, and track activities across all strategic initiatives.',
    icon: Users,
    color: '#FFB800',
    tips: [
      'See who\'s online and what they\'re working on',
      'Add comments and reactions to any analysis',
      'Assign tasks with deadlines and priorities'
    ]
  },
  {
    id: 'insights',
    title: 'AI-Powered Insights 🧠',
    subtitle: 'Strategic Intelligence at Scale',
    description: 'Access proactive insights, predictive analysis, and cross-platform intelligence. CAIO continuously monitors and surfaces opportunities.',
    icon: Sparkles,
    color: '#00D4FF',
    tips: [
      'Dashboard widgets show real-time analytics',
      'Knowledge Graph reveals hidden connections',
      'Quick Actions execute instant strategic analyses'
    ]
  },
  {
    id: 'ready',
    title: 'You\'re All Set! ✨',
    subtitle: 'Start Your Strategic Journey',
    description: 'Explore the platform at your own pace. Access tutorials anytime from the sidebar, and use ⌘K (Ctrl+K) for quick search.',
    icon: Check,
    color: '#22C55E',
    actions: [
      { label: 'Explore Dashboard', path: 'Dashboard' },
      { label: 'Start Chatting', path: 'Chat' },
      { label: 'View Tutorials', action: 'tutorials' }
    ]
  }
];

export default function WelcomeModal({ onComplete, onOpenTutorials }) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPersonalized, setShowPersonalized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const user = await base44.auth.me();
        const hasCompletedOnboarding = user.onboarding_completed === true;
        
        if (!hasCompletedOnboarding) {
          setOpen(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await base44.auth.updateMe({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
    
    setOpen(false);
    onComplete?.();
  };

  const handleSkip = async () => {
    try {
      await base44.auth.updateMe({
        onboarding_completed: true,
        onboarding_skipped: true
      });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
    
    setOpen(false);
  };

  const handleAction = (action) => {
    if (action === 'tutorials') {
      handleComplete();
      onOpenTutorials?.();
    } else {
      handleComplete();
    }
  };

  if (isLoading) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410] border-[#00D4FF]/30 p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Progress Bar */}
        <div className="h-1 bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-[#00D4FF] to-[#FFB800]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                    boxShadow: `0 0 40px ${step.color}30`
                  }}
                >
                  <Icon className="w-10 h-10" style={{ color: step.color }} />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
                <p className="text-lg text-[#00D4FF] font-medium mb-4">{step.subtitle}</p>
                <p className="text-slate-300 leading-relaxed max-w-lg mx-auto">{step.description}</p>
              </div>

              {/* Features */}
              {step.features && (
                <div className="flex justify-center gap-6 mb-8">
                  {step.features.map((feature, idx) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div key={idx} className="flex items-center gap-2 text-slate-300">
                        <FeatureIcon className="w-5 h-5 text-[#00D4FF]" />
                        <span className="text-sm">{feature.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tips */}
              {step.tips && (
                <div className="bg-white/5 rounded-xl p-4 mb-8">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FFB800]" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-2">
                    {step.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions for last step */}
              {step.actions && (
                <div className="flex justify-center gap-3 mb-8">
                  {step.actions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant={idx === 0 ? 'default' : 'outline'}
                      onClick={() => handleAction(action.action || action.path)}
                      className={idx === 0 
                        ? 'bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold hover:opacity-90' 
                        : 'border-white/20 text-white hover:bg-white/10'
                      }
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {ONBOARDING_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep 
                    ? 'w-6 bg-[#00D4FF]' 
                    : idx < currentStep 
                      ? 'bg-[#00D4FF]/50' 
                      : 'bg-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              Skip onboarding
            </button>

            <div className="flex gap-3">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Back
                </Button>
              )}
              {!isLastStep ? (
                <Button
                  onClick={handleNext}
                  className="bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628] font-semibold"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}