import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  BookOpen, AlertTriangle, Rocket, Zap, Shield, TrendingUp, Users,
  Building2, Globe, RefreshCw, Sparkles, ArrowRight, Play, Search
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

/**
 * NARRATIVE TEMPLATE LIBRARY
 * 
 * Pre-built templates for common strategic narratives:
 * - Crisis Response
 * - Innovation Launch
 * - Market Disruption
 * - Transformation Journey
 * - M&A Integration
 * - Turnaround Story
 */

const NARRATIVE_TEMPLATES = [
  {
    id: 'crisis_response',
    name: 'Resposta a Crise',
    icon: AlertTriangle,
    color: 'red',
    category: 'defense',
    description: 'Narrativa para comunicação durante crises e gestão de reputação',
    arc: 'overcoming_monster',
    structure: {
      protagonist: 'A organização e sua liderança',
      antagonist: 'A crise/ameaça externa',
      conflict: 'Sobrevivência e recuperação da confiança',
      resolution: 'Superação fortalecida e lições aprendidas'
    },
    key_elements: ['Transparência', 'Ação imediata', 'Empatia', 'Plano de recuperação'],
    audiences: ['board', 'employees', 'media', 'customers'],
    prompt_template: `Crisis narrative for: [CRISIS_TYPE]
Key stakeholders affected: [STAKEHOLDERS]
Current stage: [STAGE: detection/response/recovery/learning]
Main concern: [PRIMARY_CONCERN]`
  },
  {
    id: 'innovation_launch',
    name: 'Lançamento de Inovação',
    icon: Rocket,
    color: 'purple',
    category: 'growth',
    description: 'Narrativa para lançamento de produtos, serviços ou iniciativas inovadoras',
    arc: 'quest',
    structure: {
      protagonist: 'Equipe de inovação/produto',
      antagonist: 'Status quo e resistência à mudança',
      conflict: 'Provar valor e ganhar adoção',
      resolution: 'Transformação do mercado/organização'
    },
    key_elements: ['Visão transformadora', 'Prova de conceito', 'Diferenciação', 'Roadmap'],
    audiences: ['investors', 'early_adopters', 'internal_teams', 'partners'],
    prompt_template: `Innovation launch narrative for: [PRODUCT/SERVICE]
Target market: [MARKET]
Key differentiator: [DIFFERENTIATOR]
Launch timeline: [TIMELINE]`
  },
  {
    id: 'market_disruption',
    name: 'Disrupção de Mercado',
    icon: Zap,
    color: 'amber',
    category: 'attack',
    description: 'Narrativa para posicionamento como disruptor de mercado',
    arc: 'rags_riches',
    structure: {
      protagonist: 'A empresa desafiante',
      antagonist: 'Incumbentes e modelo tradicional',
      conflict: 'Mudar as regras do jogo',
      resolution: 'Nova ordem de mercado estabelecida'
    },
    key_elements: ['Insurgência', 'Modelo superior', 'Velocidade', 'Cliente no centro'],
    audiences: ['investors', 'talent', 'customers', 'media'],
    prompt_template: `Market disruption narrative for: [INDUSTRY]
Current pain point: [PAIN_POINT]
Disruptive advantage: [ADVANTAGE]
Vision for industry: [VISION]`
  },
  {
    id: 'transformation_journey',
    name: 'Jornada de Transformação',
    icon: RefreshCw,
    color: 'blue',
    category: 'change',
    description: 'Narrativa para transformações digitais, culturais ou organizacionais',
    arc: 'rebirth',
    structure: {
      protagonist: 'A organização em evolução',
      antagonist: 'Inércia e práticas legadas',
      conflict: 'Metamorfose sem perder identidade',
      resolution: 'Organização renovada e competitiva'
    },
    key_elements: ['Visão de futuro', 'Quick wins', 'Engajamento', 'Celebração de marcos'],
    audiences: ['employees', 'board', 'customers', 'partners'],
    prompt_template: `Transformation narrative for: [TRANSFORMATION_TYPE]
Current state: [CURRENT_STATE]
Desired state: [DESIRED_STATE]
Timeline: [TIMELINE]`
  },
  {
    id: 'ma_integration',
    name: 'Integração M&A',
    icon: Building2,
    color: 'cyan',
    category: 'integration',
    description: 'Narrativa para fusões, aquisições e integrações corporativas',
    arc: 'voyage_return',
    structure: {
      protagonist: 'As organizações unidas',
      antagonist: 'Incerteza e conflitos culturais',
      conflict: 'Criar uma cultura unificada',
      resolution: 'Organização integrada mais forte'
    },
    key_elements: ['Sinergias claras', 'Respeito mútuo', 'Nova identidade', 'Governança clara'],
    audiences: ['employees_both', 'customers', 'regulators', 'investors'],
    prompt_template: `M&A integration narrative for: [DEAL_TYPE]
Acquirer: [ACQUIRER]
Target: [TARGET]
Strategic rationale: [RATIONALE]`
  },
  {
    id: 'turnaround_story',
    name: 'Virada Estratégica',
    icon: TrendingUp,
    color: 'emerald',
    category: 'recovery',
    description: 'Narrativa para recuperação e reestruturação de negócios em dificuldade',
    arc: 'hero_journey',
    structure: {
      protagonist: 'Nova liderança/equipe',
      antagonist: 'Dívida, ineficiência, mercado adverso',
      conflict: 'Salvar a empresa da falência',
      resolution: 'Empresa saudável e sustentável'
    },
    key_elements: ['Honestidade sobre situação', 'Plano claro', 'Sacrifícios compartilhados', 'Luz no fim do túnel'],
    audiences: ['creditors', 'employees', 'board', 'customers'],
    prompt_template: `Turnaround narrative for: [COMPANY/UNIT]
Root cause of difficulties: [ROOT_CAUSE]
Key restructuring actions: [ACTIONS]
Target timeline: [TIMELINE]`
  },
  {
    id: 'market_entry',
    name: 'Entrada em Novo Mercado',
    icon: Globe,
    color: 'indigo',
    category: 'expansion',
    description: 'Narrativa para expansão geográfica ou entrada em novo segmento',
    arc: 'quest',
    structure: {
      protagonist: 'Empresa em expansão',
      antagonist: 'Players locais e barreiras de entrada',
      conflict: 'Conquistar relevância no novo mercado',
      resolution: 'Posição estabelecida e crescimento'
    },
    key_elements: ['Conhecimento local', 'Proposta diferenciada', 'Parcerias estratégicas', 'Paciência'],
    audiences: ['local_partners', 'new_customers', 'investors', 'local_talent'],
    prompt_template: `Market entry narrative for: [NEW_MARKET]
Entry strategy: [STRATEGY]
Key challenges: [CHALLENGES]
Local value proposition: [VALUE_PROP]`
  },
  {
    id: 'succession_leadership',
    name: 'Sucessão de Liderança',
    icon: Users,
    color: 'pink',
    category: 'governance',
    description: 'Narrativa para transições de liderança e sucessão executiva',
    arc: 'voyage_return',
    structure: {
      protagonist: 'Organização em transição',
      antagonist: 'Incerteza e resistência à mudança',
      conflict: 'Manter continuidade com renovação',
      resolution: 'Nova era de liderança estabelecida'
    },
    key_elements: ['Legado honrado', 'Visão renovada', 'Transição suave', 'Confiança construída'],
    audiences: ['board', 'employees', 'investors', 'customers'],
    prompt_template: `Leadership succession narrative for: [POSITION]
Outgoing leader: [OUTGOING]
Incoming leader: [INCOMING]
Strategic priorities: [PRIORITIES]`
  }
];

export default function NarrativeTemplateLibrary({ onTemplateSelect, onNarrativeGenerated }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customInputs, setCustomInputs] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [generatedNarrative, setGeneratedNarrative] = useState(null);

  const filteredTemplates = NARRATIVE_TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category) => {
    switch (category) {
      case 'defense': return 'bg-red-500/20 text-red-400';
      case 'growth': return 'bg-purple-500/20 text-purple-400';
      case 'attack': return 'bg-amber-500/20 text-amber-400';
      case 'change': return 'bg-blue-500/20 text-blue-400';
      case 'integration': return 'bg-cyan-500/20 text-cyan-400';
      case 'recovery': return 'bg-emerald-500/20 text-emerald-400';
      case 'expansion': return 'bg-indigo-500/20 text-indigo-400';
      case 'governance': return 'bg-pink-500/20 text-pink-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getIconColor = (color) => {
    switch (color) {
      case 'red': return 'text-red-400 bg-red-500/20';
      case 'purple': return 'text-purple-400 bg-purple-500/20';
      case 'amber': return 'text-amber-400 bg-amber-500/20';
      case 'blue': return 'text-blue-400 bg-blue-500/20';
      case 'cyan': return 'text-cyan-400 bg-cyan-500/20';
      case 'emerald': return 'text-emerald-400 bg-emerald-500/20';
      case 'indigo': return 'text-indigo-400 bg-indigo-500/20';
      case 'pink': return 'text-pink-400 bg-pink-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const extractPlaceholders = (template) => {
    const matches = template.match(/\[([^\]]+)\]/g) || [];
    return matches.map(m => m.replace(/[\[\]]/g, ''));
  };

  const generateFromTemplate = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    try {
      // Replace placeholders with custom inputs
      let filledPrompt = selectedTemplate.prompt_template;
      Object.entries(customInputs).forEach(([key, value]) => {
        filledPrompt = filledPrompt.replace(`[${key}]`, value || `[${key}]`);
      });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a master strategic storyteller using the "${selectedTemplate.name}" narrative template.

TEMPLATE CONTEXT:
- Narrative Arc: ${selectedTemplate.arc}
- Protagonist: ${selectedTemplate.structure.protagonist}
- Antagonist: ${selectedTemplate.structure.antagonist}
- Core Conflict: ${selectedTemplate.structure.conflict}
- Resolution Path: ${selectedTemplate.structure.resolution}
- Key Elements: ${selectedTemplate.key_elements.join(', ')}

USER INPUTS:
${filledPrompt}

Generate a complete strategic narrative following this template structure.

Return JSON:
{
  "narrative": {
    "title": "Compelling narrative title",
    "tagline": "One-line summary",
    "opening_hook": "Powerful opening statement",
    "act_1_setup": "The current situation and stakes",
    "act_2_confrontation": "The challenges and journey",
    "act_3_resolution": "The path forward and transformation",
    "closing_call": "Final call to action"
  },
  "story_elements": {
    "hero_profile": "Detailed protagonist description",
    "villain_profile": "What we're fighting against",
    "allies": ["ally1", "ally2"],
    "obstacles": ["obstacle1", "obstacle2"],
    "key_moments": [
      {"moment": "description", "emotional_beat": "feeling evoked"}
    ]
  },
  "audience_versions": [
    {
      "audience": "audience type",
      "adapted_message": "message tailored for them",
      "key_proof_points": ["proof1", "proof2"],
      "desired_action": "what we want them to do"
    }
  ],
  "visual_elements": {
    "suggested_imagery": ["image1", "image2"],
    "color_palette": "emotional color scheme",
    "tone": "overall communication tone"
  },
  "implementation": {
    "channels": ["channel1", "channel2"],
    "timing": "when to deploy",
    "sequence": ["step1", "step2", "step3"]
  }
}`,
        response_json_schema: {
          type: "object",
          properties: {
            narrative: { type: "object" },
            story_elements: { type: "object" },
            audience_versions: { type: "array", items: { type: "object" } },
            visual_elements: { type: "object" },
            implementation: { type: "object" }
          }
        }
      });

      setGeneratedNarrative(result);
      onNarrativeGenerated?.({ template: selectedTemplate, result });
      toast.success('Narrativa gerada com sucesso!');
    } catch (error) {
      console.error('Error generating narrative:', error);
      toast.error('Erro ao gerar narrativa');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Biblioteca de Templates Narrativos</h3>
                <p className="text-xs text-slate-400">{NARRATIVE_TEMPLATES.length} templates estratégicos disponíveis</p>
              </div>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border-white/10 text-white pl-10 w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate?.id === template.id;

          return (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-white/10 border-indigo-500/50 ring-1 ring-indigo-500/30' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => {
                  setSelectedTemplate(template);
                  setCustomInputs({});
                  setGeneratedNarrative(null);
                  onTemplateSelect?.(template);
                }}
              >
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-lg ${getIconColor(template.color)} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-white font-medium mb-1">{template.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-2">{template.description}</p>
                  <div className="flex gap-1">
                    <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                    <Badge className="bg-white/10 text-slate-400">{template.arc}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Template Detail */}
      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                {React.createElement(selectedTemplate.icon, { className: `w-6 h-6 ${getIconColor(selectedTemplate.color).split(' ')[0]}` })}
                {selectedTemplate.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Structure Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 mb-1">Protagonista</p>
                  <p className="text-sm text-white">{selectedTemplate.structure.protagonist}</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-xs text-red-400 mb-1">Antagonista</p>
                  <p className="text-sm text-white">{selectedTemplate.structure.antagonist}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p className="text-xs text-amber-400 mb-1">Conflito</p>
                  <p className="text-sm text-white">{selectedTemplate.structure.conflict}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-xs text-blue-400 mb-1">Resolução</p>
                  <p className="text-sm text-white">{selectedTemplate.structure.resolution}</p>
                </div>
              </div>

              {/* Key Elements */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Elementos-Chave</p>
                <div className="flex flex-wrap gap-1">
                  {selectedTemplate.key_elements.map((el, i) => (
                    <Badge key={i} className="bg-indigo-500/20 text-indigo-400">{el}</Badge>
                  ))}
                </div>
              </div>

              {/* Custom Inputs */}
              <div className="space-y-3">
                <p className="text-sm text-white font-medium">Personalize sua narrativa:</p>
                {extractPlaceholders(selectedTemplate.prompt_template).map((placeholder) => (
                  <div key={placeholder}>
                    <label className="text-xs text-slate-400 block mb-1">
                      {placeholder.replace(/_/g, ' ')}
                    </label>
                    <Input
                      value={customInputs[placeholder] || ''}
                      onChange={(e) => setCustomInputs({ ...customInputs, [placeholder]: e.target.value })}
                      placeholder={`Insira ${placeholder.toLowerCase().replace(/_/g, ' ')}...`}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={generateFromTemplate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Gerando Narrativa...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Gerar Narrativa Completa</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generated Narrative Display */}
      {generatedNarrative && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {generatedNarrative.narrative?.title}
              </CardTitle>
              <p className="text-sm text-slate-400 italic">{generatedNarrative.narrative?.tagline}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Story Acts */}
              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-xs text-purple-400 mb-1 font-semibold">Opening Hook</p>
                  <p className="text-white">{generatedNarrative.narrative?.opening_hook}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-xs text-blue-400 mb-1 font-semibold">Ato 1: Setup</p>
                  <p className="text-slate-300">{generatedNarrative.narrative?.act_1_setup}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-xs text-amber-400 mb-1 font-semibold">Ato 2: Confrontação</p>
                  <p className="text-slate-300">{generatedNarrative.narrative?.act_2_confrontation}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-xs text-emerald-400 mb-1 font-semibold">Ato 3: Resolução</p>
                  <p className="text-slate-300">{generatedNarrative.narrative?.act_3_resolution}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                  <p className="text-xs text-pink-400 mb-1 font-semibold">Call to Action</p>
                  <p className="text-white font-medium">{generatedNarrative.narrative?.closing_call}</p>
                </div>
              </div>

              {/* Audience Versions */}
              {generatedNarrative.audience_versions?.length > 0 && (
                <div>
                  <p className="text-sm text-white font-medium mb-2">Versões por Público</p>
                  <div className="grid grid-cols-2 gap-3">
                    {generatedNarrative.audience_versions.map((av, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-lg">
                        <Badge className="bg-cyan-500/20 text-cyan-400 mb-2">{av.audience}</Badge>
                        <p className="text-sm text-slate-300">{av.adapted_message}</p>
                        <p className="text-xs text-cyan-400 mt-2">→ {av.desired_action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Implementation */}
              {generatedNarrative.implementation && (
                <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <p className="text-sm text-indigo-400 font-medium mb-2">Implementação</p>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-slate-500">Canais</p>
                      <p className="text-white">{generatedNarrative.implementation.channels?.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Timing</p>
                      <p className="text-white">{generatedNarrative.implementation.timing}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Sequência</p>
                      <div className="flex flex-wrap gap-1">
                        {generatedNarrative.implementation.sequence?.map((s, i) => (
                          <Badge key={i} className="bg-white/10 text-slate-400">{i+1}. {s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}