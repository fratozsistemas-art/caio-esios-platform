import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Compass, Plus, TrendingUp, AlertTriangle, CheckCircle, 
  Target, ArrowRight, Clock, Brain, Sparkles, Activity,
  ChevronRight, BarChart3, Shield, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format, addDays, differenceInDays } from 'date-fns';
import VectorExternalizationForm from '@/components/vectors/VectorExternalizationForm.jsx';
import VectorCheckpointForm from '@/components/vectors/VectorCheckpointForm.jsx';
import VectorVisualization from '@/components/vectors/VectorVisualization.jsx';
import VectorAIValidation from '@/components/vectors/VectorAIValidation.jsx';
import VectorTimeline from '@/components/vectors/VectorTimeline.jsx';

const STATUS_CONFIG = {
  draft: { color: 'bg-slate-500/20 text-slate-400', label: 'Rascunho' },
  active: { color: 'bg-blue-500/20 text-blue-400', label: 'Ativo' },
  monitoring: { color: 'bg-purple-500/20 text-purple-400', label: 'Monitorando' },
  completed: { color: 'bg-green-500/20 text-green-400', label: 'Concluído' },
  aborted: { color: 'bg-red-500/20 text-red-400', label: 'Abortado' },
  redirected: { color: 'bg-orange-500/20 text-orange-400', label: 'Redirecionado' }
};

const DIRECTION_ICONS = {
  expansion: '🚀', defense: '🛡️', survival: '⚡', repositioning: '🔄',
  attack: '⚔️', consolidation: '🏛️', retreat: '🔙'
};

export default function VectorDecisionEngine() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewDecision, setShowNewDecision] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const queryClient = useQueryClient();

  const { data: decisions = [], isLoading } = useQuery({
    queryKey: ['vector_decisions'],
    queryFn: () => base44.entities.VectorDecision.list('-created_date')
  });

  const { data: checkpoints = [] } = useQuery({
    queryKey: ['vector_checkpoints', selectedDecision?.id],
    queryFn: () => base44.entities.VectorCheckpoint.filter({ 
      vector_decision_id: selectedDecision?.id 
    }, '-checkpoint_date'),
    enabled: !!selectedDecision?.id
  });

  const activeDecisions = decisions.filter(d => ['active', 'monitoring'].includes(d.status));
  const pendingCheckpoints = activeDecisions.filter(d => {
    if (!d.next_checkpoint_date) return false;
    return differenceInDays(new Date(d.next_checkpoint_date), new Date()) <= 3;
  });

  const avgHealthScore = activeDecisions.length > 0
    ? activeDecisions.reduce((sum, d) => sum + (d.ai_validation?.consistency_score || 0), 0) / activeDecisions.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Compass className="w-8 h-8 text-cyan-400" />
            Vector Decision Engine
            <Badge className="bg-cyan-500/20 text-cyan-400 ml-2">CAIO.VEC</Badge>
          </h1>
          <p className="text-slate-400 mt-1">
            Externalize vetores estratégicos, monitore trajetórias e tome decisões com IA
          </p>
        </div>
        <Button
          onClick={() => setShowNewDecision(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Decisão Vetorial
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Decisões Ativas</p>
                <p className="text-2xl font-bold text-white">{activeDecisions.length}</p>
              </div>
              <Target className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Checkpoints Pendentes</p>
                <p className="text-2xl font-bold text-white">{pendingCheckpoints.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Score Médio de Saúde</p>
                <p className="text-2xl font-bold text-white">{Math.round(avgHealthScore * 100)}%</p>
              </div>
              <Activity className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Histórico</p>
                <p className="text-2xl font-bold text-white">{decisions.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Checkpoints Alert */}
      {pendingCheckpoints.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <div className="flex-1">
                <p className="text-white font-medium">
                  {pendingCheckpoints.length} checkpoint(s) precisam de atenção
                </p>
                <p className="text-sm text-slate-400">
                  Revise os vetores e registre evidências para manter o monitoramento atualizado
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedDecision(pendingCheckpoints[0]);
                  setShowCheckpoint(true);
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Revisar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Target className="w-4 h-4 mr-2" />
            Decisões Ativas
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Clock className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Active Decisions List */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  Vetores em Monitoramento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeDecisions.length === 0 ? (
                  <div className="text-center py-8">
                    <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">Nenhuma decisão vetorial ativa</p>
                    <Button
                      size="sm"
                      onClick={() => setShowNewDecision(true)}
                      className="mt-3 bg-cyan-600 hover:bg-cyan-700"
                    >
                      Criar Primeira Decisão
                    </Button>
                  </div>
                ) : (
                  activeDecisions.map(decision => (
                    <DecisionCard
                      key={decision.id}
                      decision={decision}
                      onSelect={() => setSelectedDecision(decision)}
                      onCheckpoint={() => {
                        setSelectedDecision(decision);
                        setShowCheckpoint(true);
                      }}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Vector Visualization */}
            {selectedDecision ? (
              <div className="space-y-4">
                <VectorVisualization decision={selectedDecision} />
                <VectorTimeline 
                  decision={selectedDecision} 
                  checkpoints={checkpoints}
                />
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">Selecione uma decisão para visualizar</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-4">
            {activeDecisions.map(decision => (
              <DetailedDecisionCard
                key={decision.id}
                decision={decision}
                onSelect={() => setSelectedDecision(decision)}
                onCheckpoint={() => {
                  setSelectedDecision(decision);
                  setShowCheckpoint(true);
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="grid gap-4">
            {decisions.filter(d => !['active', 'monitoring'].includes(d.status)).map(decision => (
              <DetailedDecisionCard
                key={decision.id}
                decision={decision}
                onSelect={() => setSelectedDecision(decision)}
                showHistory
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Decision Modal */}
      <AnimatePresence>
        {showNewDecision && (
          <VectorExternalizationForm
            onClose={() => setShowNewDecision(false)}
            onSave={() => {
              setShowNewDecision(false);
              queryClient.invalidateQueries(['vector_decisions']);
            }}
          />
        )}
      </AnimatePresence>

      {/* Checkpoint Modal */}
      <AnimatePresence>
        {showCheckpoint && selectedDecision && (
          <VectorCheckpointForm
            decision={selectedDecision}
            checkpointNumber={(checkpoints?.length || 0) + 1}
            onClose={() => setShowCheckpoint(false)}
            onSave={() => {
              setShowCheckpoint(false);
              queryClient.invalidateQueries(['vector_decisions']);
              queryClient.invalidateQueries(['vector_checkpoints']);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DecisionCard({ decision, onSelect, onCheckpoint }) {
  const daysToCheckpoint = decision.next_checkpoint_date
    ? differenceInDays(new Date(decision.next_checkpoint_date), new Date())
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">
              {DIRECTION_ICONS[decision.primary_vector?.direction] || '🎯'}
            </span>
            <h3 className="font-medium text-white">{decision.title}</h3>
            <Badge className={STATUS_CONFIG[decision.status]?.color}>
              {STATUS_CONFIG[decision.status]?.label}
            </Badge>
          </div>
          <p className="text-sm text-slate-400 line-clamp-1">
            {decision.primary_vector?.name}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Intensidade: {decision.primary_vector?.intensity}/5
            </span>
            {daysToCheckpoint !== null && (
              <span className={`flex items-center gap-1 ${daysToCheckpoint <= 3 ? 'text-orange-400' : ''}`}>
                <Clock className="w-3 h-3" />
                Checkpoint em {daysToCheckpoint}d
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {daysToCheckpoint !== null && daysToCheckpoint <= 3 && (
            <Button
              size="sm"
              onClick={(e) => { e.stopPropagation(); onCheckpoint(); }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Checkpoint
            </Button>
          )}
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </div>
      </div>
    </motion.div>
  );
}

function DetailedDecisionCard({ decision, onSelect, onCheckpoint, showHistory }) {
  return (
    <Card className="bg-white/5 border-white/10 hover:border-cyan-500/30 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">
                {DIRECTION_ICONS[decision.primary_vector?.direction] || '🎯'}
              </span>
              <h3 className="text-lg font-medium text-white">{decision.title}</h3>
              <Badge className={STATUS_CONFIG[decision.status]?.color}>
                {STATUS_CONFIG[decision.status]?.label}
              </Badge>
              {decision.ai_validation?.consistency_score && (
                <Badge className="bg-purple-500/20 text-purple-400">
                  <Brain className="w-3 h-3 mr-1" />
                  {Math.round(decision.ai_validation.consistency_score * 100)}% validado
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <p className="text-xs text-slate-500">Vetor Primário</p>
                <p className="text-sm text-white">{decision.primary_vector?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Direção</p>
                <p className="text-sm text-white capitalize">{decision.primary_vector?.direction}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Horizonte</p>
                <p className="text-sm text-white">{decision.horizon_days} dias</p>
              </div>
            </div>

            {decision.recommended_decision && (
              <div className="mt-3 p-2 bg-cyan-500/10 rounded border border-cyan-500/20">
                <p className="text-xs text-cyan-400">Decisão Recomendada:</p>
                <p className="text-sm text-white">{decision.recommended_decision}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onSelect}
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Target className="w-4 h-4 mr-1" />
              Detalhes
            </Button>
            {!showHistory && onCheckpoint && (
              <Button
                size="sm"
                onClick={onCheckpoint}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Checkpoint
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}