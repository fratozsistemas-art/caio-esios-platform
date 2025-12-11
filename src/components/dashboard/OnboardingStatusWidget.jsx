import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  CheckCircle, Clock, Target, BookOpen, Sparkles, 
  TrendingUp, Users, Zap, ArrowRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

const ONBOARDING_CHECKLIST = [
  { id: 'profile_setup', label: 'Complete Your Profile', page: 'UserSettings', icon: Users },
  { id: 'first_chat', label: 'Start First Conversation', page: 'Chat', icon: Sparkles },
  { id: 'explore_knowledge', label: 'Explore Knowledge Graph', page: 'KnowledgeGraph', icon: Target },
  { id: 'create_workspace', label: 'Create First Workspace', page: 'Workspaces', icon: Zap },
  { id: 'complete_tutorial', label: 'Complete Platform Tour', page: null, icon: BookOpen }
];

export default function OnboardingStatusWidget() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: stats } = useQuery({
    queryKey: ['user_onboarding_stats'],
    queryFn: async () => {
      const [conversations, workspaces] = await Promise.all([
        base44.agents.listConversations({ agent_name: 'caio_agent' }).catch(() => []),
        base44.entities.Workspace.filter({ created_by: user.email }).catch(() => [])
      ]);

      return {
        hasCompletedProfile: user?.onboarding_role && user?.onboarding_goals,
        hasFirstChat: conversations.length > 0,
        hasExploredKnowledge: user?.explored_knowledge_graph === true,
        hasCreatedWorkspace: workspaces.length > 0,
        hasCompletedTutorial: user?.tutorial_progress?.includes('platformTour')
      };
    },
    enabled: !!user
  });

  if (!stats) return null;

  const checklist = [
    { ...ONBOARDING_CHECKLIST[0], completed: stats.hasCompletedProfile },
    { ...ONBOARDING_CHECKLIST[1], completed: stats.hasFirstChat },
    { ...ONBOARDING_CHECKLIST[2], completed: stats.hasExploredKnowledge },
    { ...ONBOARDING_CHECKLIST[3], completed: stats.hasCreatedWorkspace },
    { ...ONBOARDING_CHECKLIST[4], completed: stats.hasCompletedTutorial }
  ];

  const completedCount = checklist.filter(item => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;
  const allCompleted = completedCount === checklist.length;

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Getting Started
          </CardTitle>
          <Badge className={allCompleted ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}>
            {completedCount}/{checklist.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm font-semibold text-white">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          {checklist.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  item.completed 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
              >
                {item.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-slate-500 flex-shrink-0" />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 ${item.completed ? 'text-green-400' : 'text-slate-400'}`} />
                <span className={`flex-1 text-sm ${item.completed ? 'text-green-300 line-through' : 'text-white'}`}>
                  {item.label}
                </span>
                {!item.completed && item.page && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => window.location.href = `/app/${item.page}`}
                    className="text-purple-400 hover:text-purple-300 h-7 px-2"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {allCompleted && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">Setup Complete!</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              You're ready to unlock the full power of CAIO·AI
            </p>
          </div>
        )}

        {!allCompleted && (
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-purple-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">Keep going!</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Complete {checklist.length - completedCount} more {checklist.length - completedCount === 1 ? 'task' : 'tasks'} to finish setup
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}