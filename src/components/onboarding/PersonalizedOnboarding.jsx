import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Brain, Target, Users, TrendingUp, Zap, CheckCircle,
  Sparkles, Network, FileText, Bot, ArrowRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

const ONBOARDING_STEPS = [
  {
    id: 'role',
    title: 'What\'s your role?',
    description: 'Help us personalize your experience'
  },
  {
    id: 'goals',
    title: 'What are your main goals?',
    description: 'Select all that apply'
  },
  {
    id: 'recommendations',
    title: 'AI-Powered Recommendations',
    description: 'Based on your profile'
  },
  {
    id: 'walkthrough',
    title: 'Interactive Walkthrough',
    description: 'Get started with key features'
  }
];

const ROLES = [
  { id: 'ceo', label: 'CEO/Founder', icon: Target, description: 'Strategic oversight and decision-making' },
  { id: 'strategy', label: 'Strategy Director', icon: Brain, description: 'Strategic planning and execution' },
  { id: 'analyst', label: 'Analyst', icon: TrendingUp, description: 'Data analysis and insights' },
  { id: 'pm', label: 'Product Manager', icon: Zap, description: 'Product strategy and roadmap' },
  { id: 'consultant', label: 'Consultant', icon: Users, description: 'Advisory and consulting services' }
];

const GOALS = [
  { id: 'market_intelligence', label: 'Market Intelligence', icon: TrendingUp },
  { id: 'competitive_analysis', label: 'Competitive Analysis', icon: Target },
  { id: 'strategy_development', label: 'Strategy Development', icon: Brain },
  { id: 'knowledge_management', label: 'Knowledge Management', icon: FileText },
  { id: 'ai_automation', label: 'AI Automation', icon: Bot },
  { id: 'network_insights', label: 'Network Insights', icon: Network }
];

const WALKTHROUGHS = [
  {
    id: 'knowledge_graph',
    title: 'Knowledge Graph',
    description: 'Visualize and explore strategic connections',
    icon: Network,
    page: 'KnowledgeGraph',
    duration: '3 min'
  },
  {
    id: 'strategy_advisor',
    title: 'Strategy Advisor',
    description: 'Get AI-powered strategic recommendations',
    icon: Brain,
    page: 'StrategyAdvisor',
    duration: '2 min'
  },
  {
    id: 'ai_agents',
    title: 'AI Agent Creation',
    description: 'Build autonomous AI agents for your workflows',
    icon: Bot,
    page: 'AutonomousAgents',
    duration: '4 min'
  }
];

export default function PersonalizedOnboarding({ open, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('generateOnboardingRecommendations', {
        role: data.role,
        goals: data.goals,
        user_email: user?.email
      });
      return response.data;
    },
    onSuccess: (data) => {
      setRecommendations(data);
      setLoadingRecommendations(false);
    }
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (preferences) => {
      await base44.auth.updateMe({
        onboarding_completed: true,
        onboarding_role: preferences.role,
        onboarding_goals: preferences.goals,
        onboarding_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast.success('Preferences saved!');
      onComplete();
    }
  });

  const handleNext = () => {
    if (currentStep === 1 && selectedRole && selectedGoals.length > 0) {
      setLoadingRecommendations(true);
      generateRecommendationsMutation.mutate({
        role: selectedRole,
        goals: selectedGoals
      });
    }
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    savePreferencesMutation.mutate({
      role: selectedRole,
      goals: selectedGoals
    });
  };

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#0A2540] to-[#1A1D29] border-[#00D4FF]/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#FFB800] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#0A1628]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {ONBOARDING_STEPS[currentStep].title}
                  </h2>
                  <p className="text-slate-400">
                    {ONBOARDING_STEPS[currentStep].description}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onComplete}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Role Selection */}
            {currentStep === 0 && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
                  {ROLES.map((role) => {
                    const Icon = role.icon;
                    return (
                      <Label
                        key={role.id}
                        htmlFor={role.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedRole === role.id
                            ? 'border-[#00D4FF] bg-[#00D4FF]/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <RadioGroupItem value={role.id} id={role.id} />
                        <Icon className="w-8 h-8 text-[#00D4FF]" />
                        <div className="flex-1">
                          <p className="text-white font-semibold">{role.label}</p>
                          <p className="text-sm text-slate-400">{role.description}</p>
                        </div>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </motion.div>
            )}

            {/* Step 2: Goals Selection */}
            {currentStep === 1 && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 gap-4"
              >
                {GOALS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <Card
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#00D4FF]/20 border-[#00D4FF]'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <Icon className="w-6 h-6 text-[#00D4FF]" />
                        <div className="flex-1">
                          <p className="text-white font-medium">{goal.label}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-[#00D4FF]" />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </motion.div>
            )}

            {/* Step 3: AI Recommendations */}
            {currentStep === 2 && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {loadingRecommendations ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#00D4FF]/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Brain className="w-8 h-8 text-[#00D4FF] animate-spin" />
                    </div>
                    <p className="text-white font-medium">Generating personalized recommendations...</p>
                    <p className="text-slate-400 text-sm mt-2">Analyzing your profile with AI</p>
                  </div>
                ) : recommendations ? (
                  <div className="space-y-4">
                    <Card className="bg-gradient-to-br from-[#00D4FF]/10 to-[#FFB800]/10 border-[#00D4FF]/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[#FFB800]" />
                          Recommended Modules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {recommendations.modules?.map((module, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                            <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/20 flex items-center justify-center">
                              <span className="text-[#00D4FF] font-bold">{module.priority}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">{module.name}</p>
                              <p className="text-sm text-slate-400">{module.reason}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Target className="w-5 h-5 text-[#00D4FF]" />
                          Suggested Workflows
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {recommendations.workflows?.map((workflow, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded bg-white/5">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-white text-sm">{workflow}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                ) : null}
              </motion.div>
            )}

            {/* Step 4: Walkthroughs */}
            {currentStep === 3 && (
              <motion.div
                key="walkthrough"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-slate-300 mb-4">
                  Choose a feature to explore with an interactive guided tour
                </p>
                {WALKTHROUGHS.map((walkthrough) => {
                  const Icon = walkthrough.icon;
                  return (
                    <Card
                      key={walkthrough.id}
                      className="bg-white/5 border-white/10 hover:border-[#00D4FF]/30 transition-all cursor-pointer"
                      onClick={() => {
                        window.location.href = `/app/${walkthrough.page}?tutorial=true`;
                      }}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/20 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-[#00D4FF]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{walkthrough.title}</h3>
                          <p className="text-sm text-slate-400">{walkthrough.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-[#FFB800]/20 text-[#FFB800]">
                            {walkthrough.duration}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Back
            </Button>
            <div className="flex items-center gap-2">
              {ONBOARDING_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentStep ? 'bg-[#00D4FF] w-8' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <Button
              onClick={currentStep === ONBOARDING_STEPS.length - 1 ? handleComplete : handleNext}
              disabled={
                (currentStep === 0 && !selectedRole) ||
                (currentStep === 1 && selectedGoals.length === 0)
              }
              className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628]"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                <>
                  Complete
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}