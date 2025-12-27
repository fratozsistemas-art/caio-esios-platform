import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Play, CheckCircle, GraduationCap, Sparkles, Clock } from 'lucide-react';
import { useTutorial } from './TutorialSystem';
import { TUTORIALS, TUTORIAL_CATEGORIES, getTutorialsByCategory, RECOMMENDED_ORDER } from './tutorials';
import { motion } from 'framer-motion';

export default function TutorialLauncher({ trigger }) {
  const [open, setOpen] = useState(false);
  const { startTutorial, isTutorialCompleted, showTips, toggleTips, shouldShowTutorial } = useTutorial();

  const handleStartTutorial = (tutorialId) => {
    startTutorial(tutorialId);
    setOpen(false);
  };

  const tutorialsArray = Object.values(TUTORIALS);
  const completedCount = tutorialsArray.filter(t => isTutorialCompleted(t.id)).length;
  const categorizedTutorials = getTutorialsByCategory();
  const sortedCategories = Object.values(categorizedTutorials).sort((a, b) => a.order - b.order);

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return difficulty;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-[#C7A763]/30 bg-[#C7A763]/10 text-[#E3C37B] hover:bg-[#C7A763]/20 hover:text-[#E3C37B]"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            {shouldShowTutorial ? 'Tutoriais (Novo!)' : 'Tutoriais'}
            {completedCount < tutorialsArray.length && (
              <Badge className="ml-2 bg-[#C7A763]/30 text-[#E3C37B] text-xs">
                {completedCount}/{tutorialsArray.length}
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[85vh] bg-gradient-to-br from-[#06101F] to-[#0A1E3A] border-[#C7A763]/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#C7A763]" />
            Centro de Tutoriais
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Aprenda a usar o ESIOS CAIO através de tutoriais organizados por jornada do usuário.
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="bg-white/5 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Progresso Geral</span>
            <span className="text-sm font-semibold text-white">
              {completedCount} / {tutorialsArray.length} tutoriais completos
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / tutorialsArray.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-[#C7A763] to-[#E3C37B]"
            />
          </div>
        </div>

        {/* Tips Toggle */}
        <div className="bg-white/5 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#E3C37B]" />
            <div>
              <p className="text-sm font-medium text-white">Dicas Contextuais</p>
              <p className="text-xs text-slate-400">Mostrar dicas durante a navegação</p>
            </div>
          </div>
          <Button
            variant={showTips ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleTips(!showTips)}
            className={showTips ? 'bg-[#C7A763] hover:bg-[#E3C37B] text-[#06101F]' : 'border-slate-600'}
          >
            {showTips ? 'Ativado' : 'Desativado'}
          </Button>
        </div>

        {/* Categorized Tutorials */}
        <Tabs defaultValue="onboarding" className="flex-1">
          <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto gap-1 p-1">
            {sortedCategories.map(cat => {
              const CatIcon = cat.icon;
              const catCompleted = cat.tutorials.filter(t => isTutorialCompleted(t.id)).length;
              return (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="data-[state=active]:bg-[#C7A763]/20 data-[state=active]:text-[#E3C37B] text-xs px-3 py-1.5"
                >
                  <CatIcon className="w-3.5 h-3.5 mr-1.5" />
                  {cat.label}
                  <Badge className="ml-1.5 bg-white/10 text-white text-[10px] px-1.5">
                    {catCompleted}/{cat.tutorials.length}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {sortedCategories.map(cat => (
            <TabsContent key={cat.id} value={cat.id} className="mt-4">
              <div className="grid gap-3 max-h-[40vh] overflow-y-auto pr-2">
                {cat.tutorials.map((tutorial, idx) => {
                  const Icon = tutorial.steps[0]?.icon || Play;
                  const completed = isTutorialCompleted(tutorial.id);

                  return (
                    <motion.div
                      key={tutorial.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Card className={`bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#C7A763]/30 transition-all ${completed ? 'opacity-70' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${cat.color}20` }}
                              >
                                <Icon className="w-5 h-5" style={{ color: cat.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold text-white">{tutorial.title}</h3>
                                  {completed && (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 mb-2 line-clamp-1">
                                  {tutorial.description}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={`${getDifficultyBadge(tutorial.difficulty)} text-[10px]`}>
                                    {getDifficultyLabel(tutorial.difficulty)}
                                  </Badge>
                                  <Badge className="bg-white/10 text-slate-300 text-[10px]">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {tutorial.duration}
                                  </Badge>
                                  <Badge className="bg-white/10 text-slate-300 text-[10px]">
                                    {tutorial.steps.length} passos
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleStartTutorial(tutorial.id)}
                              className="bg-[#C7A763] hover:bg-[#E3C37B] text-[#06101F] flex-shrink-0"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              {completed ? 'Revisar' : 'Iniciar'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}