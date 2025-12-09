import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users, Eye, Search, Brain, Target, Zap, CheckCircle, 
  AlertTriangle, TrendingUp, FileText, MessageSquare, Plus, Loader2, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const PHASES = [
  { 
    id: "persona_publica", 
    name: "Fase I: Persona Pública", 
    icon: Eye,
    color: "text-blue-400",
    description: "O que a empresa diz que é (e o que o mundo vê)"
  },
  { 
    id: "estrategia_revelada", 
    name: "Fase II: Estratégia Revelada", 
    icon: Users,
    color: "text-purple-400",
    description: "O que os atores realmente querem da empresa"
  },
  { 
    id: "estrategia_escondida", 
    name: "Fase III: Estratégia Escondida", 
    icon: Search,
    color: "text-amber-400",
    description: "O que os dados e o time contam que ninguém está dizendo"
  },
  { 
    id: "individuacao_estrategica", 
    name: "Fase IV: Individuação Estratégica", 
    icon: Brain,
    color: "text-emerald-400",
    description: "Estratégia Integrada Self-Sistema"
  },
  { 
    id: "encenacao_100d", 
    name: "Fase V: Encenação 100-Day Run", 
    icon: Zap,
    color: "text-red-400",
    description: "Botar a nova história em cena em 100 dias"
  }
];

export default function Broto23Protocol() {
  const [newExecution, setNewExecution] = useState({
    company_name: "",
    founders_involved: "",
    facilitator: ""
  });
  const [selectedExecution, setSelectedExecution] = useState(null);

  const queryClient = useQueryClient();

  const { data: executions = [], isLoading } = useQuery({
    queryKey: ['broto23Executions'],
    queryFn: () => base44.entities.Broto23Execution.list('-created_date'),
    initialData: []
  });

  const { data: personas = [] } = useQuery({
    queryKey: ['strategicPersonas'],
    queryFn: () => base44.entities.StrategicPersona.list(),
    initialData: []
  });

  const { data: defensePatterns = [] } = useQuery({
    queryKey: ['defensePatterns'],
    queryFn: () => base44.entities.DefensePattern.list(),
    initialData: []
  });

  const createExecutionMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Broto23Execution.create({
        ...data,
        founders_involved: data.founders_involved.split(',').map(f => f.trim()),
        current_phase: 'persona_publica',
        status: 'in_progress',
        progress_percentage: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['broto23Executions']);
      setNewExecution({ company_name: "", founders_involved: "", facilitator: "" });
      toast.success('Nova execução Broto23 iniciada');
    },
    onError: (error) => {
      toast.error('Erro ao criar execução: ' + error.message);
    }
  });

  const updatePhaseMutation = useMutation({
    mutationFn: async ({ id, phase }) => {
      return await base44.entities.Broto23Execution.update(id, {
        current_phase: phase,
        progress_percentage: (PHASES.findIndex(p => p.id === phase) + 1) * 20
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['broto23Executions']);
      toast.success('Fase atualizada');
    }
  });

  const getPhaseIndex = (phaseId) => PHASES.findIndex(p => p.id === phaseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          Protocolo Broto23
        </h1>
        <p className="text-slate-400">
          Individuação Estratégica: da Persona Pública à Estratégia Integrada Self-Sistema
        </p>
      </div>

      {/* Criar Nova Execução */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-400" />
            Iniciar Nova Execução Broto23
          </CardTitle>
          <CardDescription>
            Comece um novo processo de individuação estratégica para uma empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-300">Nome da Empresa</Label>
              <Input
                value={newExecution.company_name}
                onChange={(e) => setNewExecution({...newExecution, company_name: e.target.value})}
                placeholder="Ex: B23 Ventures"
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Founders/C-Level (separados por vírgula)</Label>
              <Input
                value={newExecution.founders_involved}
                onChange={(e) => setNewExecution({...newExecution, founders_involved: e.target.value})}
                placeholder="Ex: João Silva, Maria Santos"
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Facilitador</Label>
              <Input
                value={newExecution.facilitator}
                onChange={(e) => setNewExecution({...newExecution, facilitator: e.target.value})}
                placeholder="Seu nome"
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
          </div>
          <Button
            onClick={() => createExecutionMutation.mutate(newExecution)}
            disabled={!newExecution.company_name || createExecutionMutation.isPending}
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {createExecutionMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Iniciar Protocolo Broto23
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Execuções */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {executions.map((execution) => {
          const currentPhaseIndex = getPhaseIndex(execution.current_phase);
          const CurrentPhaseIcon = PHASES[currentPhaseIndex]?.icon || Brain;
          
          return (
            <motion.div
              key={execution.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card 
                className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-all cursor-pointer group"
                onClick={() => setSelectedExecution(execution)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={execution.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}>
                      {execution.status === 'completed' ? 'Completo' : 'Em Progresso'}
                    </Badge>
                    <CurrentPhaseIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                    {execution.company_name}
                  </CardTitle>
                  <CardDescription>
                    Facilitador: {execution.facilitator || 'Não definido'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Progresso</span>
                        <span className="text-white font-medium">{execution.progress_percentage || 0}%</span>
                      </div>
                      <Progress value={execution.progress_percentage || 0} className="h-2" />
                    </div>
                    <div className="text-xs text-slate-400">
                      Fase Atual: <span className="text-purple-400 font-medium">{PHASES[currentPhaseIndex]?.name}</span>
                    </div>
                    {execution.founders_involved && (
                      <div className="text-xs text-slate-400">
                        Founders: <span className="text-white">{execution.founders_involved.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {executions.length === 0 && !isLoading && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma execução iniciada</h3>
            <p className="text-slate-400">
              Comece um novo processo Broto23 para revelar a estratégia verdadeira de uma empresa
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes (simplificado) */}
      {selectedExecution && (
        <Card className="bg-white/5 border-purple-500/30 mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                {selectedExecution.company_name}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedExecution(null)}
                className="border-white/10 text-slate-400"
              >
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="fases" className="w-full">
              <TabsList className="bg-white/5">
                <TabsTrigger value="fases">Fases</TabsTrigger>
                <TabsTrigger value="personas">Self/Persona/Sombra</TabsTrigger>
                <TabsTrigger value="defesas">Defesas & Padrões</TabsTrigger>
                <TabsTrigger value="chat">Chat com Broto23</TabsTrigger>
              </TabsList>

              <TabsContent value="fases" className="space-y-4 mt-4">
                {PHASES.map((phase, idx) => {
                  const Icon = phase.icon;
                  const isActive = phase.id === selectedExecution.current_phase;
                  const isCompleted = getPhaseIndex(selectedExecution.current_phase) > idx;
                  
                  return (
                    <Card key={phase.id} className={`bg-white/5 ${isActive ? 'border-purple-500/50' : 'border-white/10'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${isActive ? 'bg-purple-500/20' : 'bg-white/5'} flex items-center justify-center`}>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : (
                                <Icon className={`w-5 h-5 ${phase.color}`} />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">{phase.name}</p>
                              <p className="text-xs text-slate-400">{phase.description}</p>
                            </div>
                          </div>
                          {!isCompleted && !isActive && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePhaseMutation.mutate({ id: selectedExecution.id, phase: phase.id })}
                              className="border-white/10 text-slate-400"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          )}
                          {isActive && (
                            <Badge className="bg-purple-500/20 text-purple-400">Em andamento</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="personas" className="mt-4">
                <div className="space-y-4">
                  {personas.filter(p => p.broto23_execution_id === selectedExecution.id).map((persona) => (
                    <Card key={persona.id} className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          {persona.entity_type === 'company' ? <Target className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                          {persona.entity_name}
                          <Badge className="ml-auto">{persona.entity_type === 'company' ? 'Empresa' : 'Líder'}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div>
                          <p className="text-slate-500 text-xs">Persona (imagem pública)</p>
                          <p className="text-slate-300">{persona.persona}</p>
                        </div>
                        <div>
                          <p className="text-emerald-400 text-xs">Self (vocação real)</p>
                          <p className="text-white">{persona.self}</p>
                        </div>
                        <div>
                          <p className="text-red-400 text-xs">Sombra (negado/evitado)</p>
                          <p className="text-slate-300">{persona.sombra}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {personas.filter(p => p.broto23_execution_id === selectedExecution.id).length === 0 && (
                    <p className="text-center text-slate-400 py-8">Nenhuma persona mapeada ainda</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="defesas" className="mt-4">
                <div className="space-y-4">
                  {defensePatterns.filter(d => d.broto23_execution_id === selectedExecution.id).map((pattern) => (
                    <Card key={pattern.id} className="bg-white/5 border-amber-500/30">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            {pattern.titulo}
                          </CardTitle>
                          <Badge className={
                            pattern.impacto_estrategico === 'critico' ? 'bg-red-500/20 text-red-400' :
                            pattern.impacto_estrategico === 'alto' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }>
                            {pattern.impacto_estrategico}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p className="text-slate-300">{pattern.descricao}</p>
                        {pattern.defesa_mecanismo && (
                          <p className="text-xs text-slate-500">
                            Mecanismo: <span className="text-amber-400">{pattern.defesa_mecanismo}</span>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {defensePatterns.filter(d => d.broto23_execution_id === selectedExecution.id).length === 0 && (
                    <p className="text-center text-slate-400 py-8">Nenhum padrão identificado ainda</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="chat" className="mt-4">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-white font-medium mb-2">Chat com Agente Broto23</p>
                    <p className="text-slate-400 text-sm mb-4">
                      Converse com o agente especializado para conduzir o protocolo
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Abrir Chat
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}