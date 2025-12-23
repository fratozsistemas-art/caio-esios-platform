import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, Circle, Play, Sparkles, TrendingUp,
  MessageSquare, Zap, Network, Briefcase, Brain
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTutorial } from './TutorialSystem';
import { RECOMMENDED_ORDER, TUTORIALS } from './tutorials';

/**
 * OnboardingChecklist - Shows user progress through key onboarding tasks
 * Can be embedded in Dashboard or shown as a sidebar widget
 */

const ONBOARDING_TASKS = [
  {
    id: 'complete_profile',
    title: 'Complete Your Profile',
    description: 'Add your role and goals',
    icon: Circle,
    tutorialId: null,
    action: 'Go to Settings',
    page: 'UserSettings'
  },
  {
    id: 'first_chat',
    title: 'Chat with CAIO',
    description: 'Ask your first strategic question',
    icon: MessageSquare,
    tutorialId: 'chatWithCaio',
    action: 'Open Chat',
    page: 'Chat'
  },
  {
    id: 'run_quick_action',
    title: 'Run a Quick Action',
    description: 'Execute your first TSI analysis',
    icon: Zap,
    tutorialId: 'quickActions',
    action: 'Try Quick Actions',
    page: 'QuickActions'
  },
  {
    id: 'explore_graph',
    title: 'Explore Knowledge Graph',
    description: 'Visualize strategic connections',
    icon: Network,
    tutorialId: 'knowledgeGraph',
    action: 'Open Graph',
    page: 'KnowledgeGraph'
  },
  {
    id: 'create_workspace',
    title: 'Create a Workspace',
    description: 'Organize your first strategic project',
    icon: Briefcase,
    tutorialId: 'workspaces',
    action: 'Create Workspace',
    page: 'Workspaces'
  },
  {
    id: 'run_tsi_module',
    title: 'Run a TSI Module',
    description: 'Deep dive with M1-M11',
    icon: Brain,
    tutorialId: 'tsiMethodology',
    action: 'Open AI Modules',
    page: 'AIModules'
  }
];

export default function OnboardingChecklist({ compact = false }) {
  const { startTutorial, isTutorialCompleted } = useTutorial();

  // Calculate completion
  const completedCount = ONBOARDING_TASKS.filter(task => {
    if (!task.tutorialId) return false;
    return isTutorialCompleted(task.tutorialId);
  }).length;

  const progress = (completedCount / ONBOARDING_TASKS.length) * 100;
  const isComplete = completedCount === ONBOARDING_TASKS.length;

  const handleTaskAction = (task) => {
    if (task.tutorialId) {
      startTutorial(task.tutorialId);
    } else if (task.page) {
      window.location.href = `/app/${task.page}`;
    }
  };

  if (compact) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C7A763]" />
              Getting Started
            </CardTitle>
            <Badge className="bg-[#C7A763]/20 text-[#E3C37B]">
              {completedCount}/{ONBOARDING_TASKS.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progress} className="h-2" />
          <div className="space-y-2">
            {ONBOARDING_TASKS.slice(0, 3).map((task, idx) => {
              const Icon = task.icon;
              const completed = task.tutorialId ? isTutorialCompleted(task.tutorialId) : false;
              
              return (
                <button
                  key={task.id}
                  onClick={() => handleTaskAction(task)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all text-left"
                >
                  {completed ? (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {task.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {!isComplete && (
            <Button
              size="sm"
              variant="outline"
              className="w-full border-[#C7A763]/30 text-[#E3C37B] hover:bg-[#C7A763]/10 text-xs"
            >
              View All Tasks
              <ArrowRight className="w-3 h-3 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-[#0A2540] to-[#1A1D29] border-[#C7A763]/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C7A763]" />
            Getting Started with CAIO·AI
          </CardTitle>
          {isComplete && (
            <Badge className="bg-green-500/20 text-green-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete!
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Progress</span>
            <span className="text-white font-semibold">{completedCount}/{ONBOARDING_TASKS.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {ONBOARDING_TASKS.map((task, idx) => {
          const Icon = task.icon;
          const completed = task.tutorialId ? isTutorialCompleted(task.tutorialId) : false;

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className={`p-4 rounded-lg border transition-all ${
                completed 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : 'bg-white/5 border-white/10 hover:border-[#C7A763]/30'
              }`}>
                <div className="flex items-start gap-3">
                  {completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold mb-1 ${
                      completed ? 'text-slate-400 line-through' : 'text-white'
                    }`}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-400 mb-2">
                      {task.description}
                    </p>
                    
                    {!completed && (
                      <Button
                        size="sm"
                        onClick={() => handleTaskAction(task)}
                        className="bg-[#C7A763]/20 hover:bg-[#C7A763]/30 text-[#E3C37B] text-xs h-7"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        {task.action}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center"
          >
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-semibold mb-1">Onboarding Complete! 🎉</p>
            <p className="text-xs text-slate-300">
              You're ready to use all CAIO·AI features. Explore advanced tutorials for deeper insights.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}