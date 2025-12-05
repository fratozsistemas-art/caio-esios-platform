import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Brain, Target, TrendingUp, AlertCircle, Loader2, Zap, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const BEHAVIORAL_DIMENSIONS = [
  { id: 'personality', label: 'Personalidade', icon: Users, color: '#8b5cf6' },
  { id: 'decision_making', label: 'Tomada de Decisão', icon: Brain, color: '#3b82f6' },
  { id: 'risk_profile', label: 'Perfil de Risco', icon: AlertCircle, color: '#f59e0b' },
  { id: 'influence_patterns', label: 'Padrões de Influência', icon: Zap, color: '#10b981' },
  { id: 'power_dynamics', label: 'Dinâmicas de Poder', icon: Shield, color: '#ef4444' }
];

const STAKEHOLDER_TYPES = [
  { id: 'executive', label: 'Executivo C-Level' },
  { id: 'board', label: 'Conselheiro' },
  { id: 'investor', label: 'Investidor' },
  { id: 'founder', label: 'Fundador/Empreendedor' },
  { id: 'manager', label: 'Gerente/Diretor' },
  { id: 'technical', label: 'Técnico/Especialista' }
];

export default function M10BehavioralIntelligenceEnhanced() {
  const [stakeholderName, setStakeholderName] = useState('');
  const [stakeholderType, setStakeholderType] = useState('executive');
  const [context, setContext] = useState('');
  const [observedBehaviors, setObservedBehaviors] = useState('');
  const [selectedDimensions, setSelectedDimensions] = useState(['personality', 'decision_making']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const toggleDimension = (id) => {
    setSelectedDimensions(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const analyzeStakeholder = async () => {
    if (!stakeholderName.trim()) {
      toast.error('Digite o nome do stakeholder');
      return;
    }

    setIsAnalyzing(true);
    try {
      const prompt = `
Você é um especialista em Behavioral Intelligence e análise de perfis executivos.

**Stakeholder:** ${stakeholderName}
**Tipo:** ${STAKEHOLDER_TYPES.find(t => t.id === stakeholderType)?.label}
**Contexto:** ${context || 'Análise geral'}
**Comportamentos Observados:** ${observedBehaviors || 'Não especificado'}

**Dimensões para Análise:**
${selectedDimensions.map(id => {
  const dim = BEHAVIORAL_DIMENSIONS.find(d => d.id === id);
  return `- ${dim.label}`;
}).join('\n')}

**Sua tarefa:**
1. Construa um perfil comportamental detalhado
2. Identifique motivações primárias e secundárias
3. Mapeie gatilhos emocionais e valores core
4. Analise estilo de comunicação preferido
5. Identifique padrões de resistência e aceitação
6. Sugira estratégias de engajamento personalizadas
7. Mapeie dinâmicas de poder e influência
8. Identifique riscos comportamentais

Retorne um JSON estruturado.
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            profile_summary: {
              type: 'object',
              properties: {
                archetype: { type: 'string' },
                core_traits: { type: 'array', items: { type: 'string' } },
                leadership_style: { type: 'string' },
                confidence_level: { type: 'number' }
              }
            },
            motivations: {
              type: 'object',
              properties: {
                primary: { type: 'array', items: { type: 'string' } },
                secondary: { type: 'array', items: { type: 'string' } },
                hidden_drivers: { type: 'array', items: { type: 'string' } }
              }
            },
            emotional_triggers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  trigger: { type: 'string' },
                  response_pattern: { type: 'string' },
                  intensity: { type: 'string' }
                }
              }
            },
            core_values: {
              type: 'array',
              items: { type: 'string' }
            },
            communication_style: {
              type: 'object',
              properties: {
                preferred_channel: { type: 'string' },
                information_density: { type: 'string' },
                tone_preference: { type: 'string' },
                key_phrases: { type: 'array', items: { type: 'string' } }
              }
            },
            resistance_patterns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  situation: { type: 'string' },
                  typical_reaction: { type: 'string' },
                  mitigation_strategy: { type: 'string' }
                }
              }
            },
            engagement_strategies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  strategy: { type: 'string' },
                  rationale: { type: 'string' },
                  expected_outcome: { type: 'string' }
                }
              }
            },
            power_dynamics: {
              type: 'object',
              properties: {
                influence_level: { type: 'string' },
                key_relationships: { type: 'array', items: { type: 'string' } },
                political_positioning: { type: 'string' }
              }
            },
            behavioral_risks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  risk: { type: 'string' },
                  probability: { type: 'string' },
                  mitigation: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setResults(response);
      toast.success('Análise comportamental completa!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao analisar perfil');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Análise de Perfil Comportamental
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Nome do Stakeholder"
              value={stakeholderName}
              onChange={(e) => setStakeholderName(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <select
              value={stakeholderType}
              onChange={(e) => setStakeholderType(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-md px-3 py-2"
            >
              {STAKEHOLDER_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          <Textarea
            placeholder="Contexto (função, empresa, situação relevante)"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="min-h-20 bg-white/5 border-white/10 text-white"
          />

          <Textarea
            placeholder="Comportamentos observados, interações anteriores, feedback de terceiros..."
            value={observedBehaviors}
            onChange={(e) => setObservedBehaviors(e.target.value)}
            className="min-h-24 bg-white/5 border-white/10 text-white"
          />

          {/* Dimension Selection */}
          <div>
            <p className="text-sm text-slate-300 mb-2">Dimensões de Análise:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {BEHAVIORAL_DIMENSIONS.map(dim => {
                const Icon = dim.icon;
                return (
                  <button
                    key={dim.id}
                    onClick={() => toggleDimension(dim.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg transition-all text-left ${
                      selectedDimensions.includes(dim.id)
                        ? 'border-2'
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                    style={selectedDimensions.includes(dim.id) ? {
                      backgroundColor: `${dim.color}20`,
                      borderColor: dim.color
                    } : {}}
                  >
                    <Icon 
                      className="w-4 h-4" 
                      style={{ color: selectedDimensions.includes(dim.id) ? dim.color : '#94a3b8' }} 
                    />
                    <span className={`text-xs font-medium ${
                      selectedDimensions.includes(dim.id) ? 'text-white' : 'text-slate-400'
                    }`}>
                      {dim.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={analyzeStakeholder}
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analisar Perfil Comportamental
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Tabs defaultValue="profile">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="motivations">Motivações</TabsTrigger>
              <TabsTrigger value="communication">Comunicação</TabsTrigger>
              <TabsTrigger value="strategies">Estratégias</TabsTrigger>
              <TabsTrigger value="risks">Riscos</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card className="bg-white/5 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Arquétipo & Traços</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-purple-500/20 text-purple-400 mb-4 text-sm">
                    {results.profile_summary?.archetype}
                  </Badge>
                  <div className="space-y-2">
                    {results.profile_summary?.core_traits?.map((trait, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span className="text-sm text-slate-300">{trait}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Estilo de Liderança</p>
                    <p className="text-sm text-white">{results.profile_summary?.leadership_style}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Valores Core</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {results.core_values?.map((value, idx) => (
                      <Badge key={idx} className="bg-blue-500/20 text-blue-400">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="motivations" className="space-y-3">
              <Card className="bg-white/5 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-400" />
                    Motivações Primárias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.motivations?.primary?.map((mot, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-green-400 font-bold">•</span>
                        {mot}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {results.motivations?.hidden_drivers && results.motivations.hidden_drivers.length > 0 && (
                <Card className="bg-white/5 border-orange-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-400" />
                      Drivers Ocultos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.motivations.hidden_drivers.map((driver, idx) => (
                        <li key={idx} className="text-sm text-slate-300">{driver}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="communication" className="space-y-3">
              <Card className="bg-white/5 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Estilo de Comunicação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Canal Preferido</p>
                      <p className="text-sm text-white">{results.communication_style?.preferred_channel}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Tom</p>
                      <p className="text-sm text-white">{results.communication_style?.tone_preference}</p>
                    </div>
                  </div>
                  {results.communication_style?.key_phrases && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Frases-Chave</p>
                      <div className="flex flex-wrap gap-2">
                        {results.communication_style.key_phrases.map((phrase, idx) => (
                          <Badge key={idx} className="bg-blue-500/20 text-blue-400 text-xs">
                            "{phrase}"
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strategies" className="space-y-3">
              {results.engagement_strategies?.map((strat, idx) => (
                <Card key={idx} className="bg-white/5 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">{strat.strategy}</p>
                        <p className="text-sm text-slate-400 mb-2">{strat.rationale}</p>
                        <div className="flex items-center gap-2 text-xs text-green-400">
                          <TrendingUp className="w-3 h-3" />
                          {strat.expected_outcome}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="risks" className="space-y-3">
              {results.behavioral_risks?.map((risk, idx) => (
                <Card key={idx} className="bg-white/5 border-red-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-medium">{risk.risk}</p>
                          <Badge className="bg-red-500/20 text-red-400 text-xs">
                            {risk.probability}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">{risk.mitigation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}