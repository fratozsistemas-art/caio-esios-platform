import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Play, CheckCircle, GraduationCap, Sparkles } from 'lucide-react';
import { useTutorial } from './TutorialSystem';
import { TUTORIALS } from './tutorials';
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            {shouldShowTutorial ? 'Tutoriais (Novo!)' : 'Tutoriais'}
            {completedCount < tutorialsArray.length && (
              <Badge className="ml-2 bg-purple-500/30 text-purple-300 text-xs">
                {completedCount}/{tutorialsArray.length}
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-400" />
            Centro de Tutoriais
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Aprenda a usar todas as funcionalidades do CAIO·AI através de tutoriais interativos.
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="bg-white/5 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Progresso Geral</span>
            <span className="text-sm font-semibold text-white">
              {completedCount} / {tutorialsArray.length}
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / tutorialsArray.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            />
          </div>
        </div>

        {/* Tips Toggle */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-white">Dicas Contextuais</p>
                <p className="text-xs text-slate-400">Mostrar dicas durante a navegação</p>
              </div>
            </div>
            <Button
              variant={showTips ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleTips(!showTips)}
              className={showTips ? 'bg-purple-500 hover:bg-purple-600' : 'border-slate-600'}
            >
              {showTips ? 'Ativado' : 'Desativado'}
            </Button>
          </div>
        </div>

        {/* Tutorial Cards */}
        <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
          {tutorialsArray.map((tutorial, idx) => {
            const Icon = tutorial.steps[0]?.icon || Play;
            const completed = isTutorialCompleted(tutorial.id);

            return (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer ${completed ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{tutorial.title}</h3>
                            {completed && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mb-2">
                            {tutorial.steps.length} passos
                          </p>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            {tutorial.category}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleStartTutorial(tutorial.id)}
                        className="bg-purple-500 hover:bg-purple-600 text-white flex-shrink-0"
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
      </DialogContent>
    </Dialog>
  );
}