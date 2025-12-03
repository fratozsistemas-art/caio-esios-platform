import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Sun, Cloud, CloudRain, Sparkles, RefreshCw, Copy, Check,
  TrendingUp, TrendingDown, Minus, FileText, Users, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

/**
 * NARRATIVE VERSION GENERATOR
 * 
 * Generates multiple narrative versions for strategic scenarios:
 * - Optimistic (best-case)
 * - Neutral (balanced)
 * - Pessimistic (worst-case)
 */

const NARRATIVE_TONES = [
  { 
    id: 'optimistic', 
    label: 'Otimista', 
    icon: Sun, 
    color: 'emerald',
    description: 'Cenário favorável com oportunidades maximizadas',
    prompt_modifier: 'Focus on opportunities, growth potential, and positive outcomes. Emphasize strengths and competitive advantages. Use confident, inspiring language.'
  },
  { 
    id: 'neutral', 
    label: 'Neutro', 
    icon: Cloud, 
    color: 'slate',
    description: 'Análise equilibrada com riscos e oportunidades',
    prompt_modifier: 'Provide balanced analysis with both risks and opportunities. Use measured, objective language. Present facts without emotional bias.'
  },
  { 
    id: 'pessimistic', 
    label: 'Pessimista', 
    icon: CloudRain, 
    color: 'red',
    description: 'Cenário adverso com riscos priorizados',
    prompt_modifier: 'Focus on risks, challenges, and potential failures. Emphasize threats and weaknesses. Use cautionary, risk-aware language.'
  }
];

export default function NarrativeVersionGenerator({ scenario, culturalContext, audiences, onVersionsGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [versions, setVersions] = useState({});
  const [activeVersion, setActiveVersion] = useState('neutral');
  const [copiedVersion, setCopiedVersion] = useState(null);

  const generateAllVersions = async () => {
    if (!scenario?.trim()) {
      toast.error('Insira um cenário para gerar narrativas');
      return;
    }

    setIsGenerating(true);
    const generatedVersions = {};

    try {
      for (const tone of NARRATIVE_TONES) {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a master strategic storyteller. Generate a ${tone.label} narrative version for this strategic scenario.

SCENARIO:
"${scenario}"

CULTURAL CONTEXT: ${culturalContext || 'Corporate Brazilian'}
TARGET AUDIENCES: ${audiences?.join(', ') || 'C-Level, Managers'}

NARRATIVE TONE: ${tone.label}
${tone.prompt_modifier}

Create a compelling narrative that:
1. Frames the situation through this lens (${tone.label})
2. Identifies key characters and their roles
3. Establishes clear conflict and resolution path
4. Provides audience-specific adaptations
5. Includes actionable insights

Return JSON:
{
  "narrative": {
    "headline": "Compelling headline for this version",
    "opening": "Opening paragraph that sets the tone",
    "body": "Main narrative body (2-3 paragraphs)",
    "conclusion": "Powerful closing statement",
    "key_message": "One-sentence summary"
  },
  "framing": {
    "protagonist_role": "How the protagonist is portrayed",
    "conflict_framing": "How challenges are framed",
    "outcome_trajectory": "Expected outcome based on tone",
    "emotional_arc": "Emotional journey for the audience"
  },
  "strategic_elements": {
    "opportunities_emphasized": ["opp1", "opp2"],
    "risks_highlighted": ["risk1", "risk2"],
    "actions_recommended": ["action1", "action2"],
    "metrics_to_watch": ["metric1", "metric2"]
  },
  "audience_hooks": [
    {
      "audience": "audience type",
      "hook": "specific angle for this audience",
      "call_to_action": "what they should do"
    }
  ],
  "tone_indicators": {
    "language_style": "description of language used",
    "confidence_level": 0-100,
    "urgency_level": 0-100,
    "hope_factor": 0-100
  }
}`,
          response_json_schema: {
            type: "object",
            properties: {
              narrative: { type: "object" },
              framing: { type: "object" },
              strategic_elements: { type: "object" },
              audience_hooks: { type: "array", items: { type: "object" } },
              tone_indicators: { type: "object" }
            }
          }
        });

        generatedVersions[tone.id] = result;
      }

      setVersions(generatedVersions);
      onVersionsGenerated?.(generatedVersions);
      toast.success('3 versões narrativas geradas com sucesso!');
    } catch (error) {
      console.error('Error generating versions:', error);
      toast.error('Erro ao gerar versões narrativas');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (versionId) => {
    const version = versions[versionId];
    if (!version) return;

    const text = `${version.narrative?.headline}\n\n${version.narrative?.opening}\n\n${version.narrative?.body}\n\n${version.narrative?.conclusion}`;
    await navigator.clipboard.writeText(text);
    setCopiedVersion(versionId);
    setTimeout(() => setCopiedVersion(null), 2000);
    toast.success('Narrativa copiada!');
  };

  const getToneColor = (toneId) => {
    const tone = NARRATIVE_TONES.find(t => t.id === toneId);
    switch (tone?.color) {
      case 'emerald': return 'from-emerald-500/20 to-green-500/20 border-emerald-500/30';
      case 'red': return 'from-red-500/20 to-orange-500/20 border-red-500/30';
      default: return 'from-slate-500/20 to-gray-500/20 border-slate-500/30';
    }
  };

  const getToneTextColor = (toneId) => {
    const tone = NARRATIVE_TONES.find(t => t.id === toneId);
    switch (tone?.color) {
      case 'emerald': return 'text-emerald-400';
      case 'red': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Generator Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Gerador de Versões Narrativas</h3>
                <p className="text-xs text-slate-400">Otimista • Neutro • Pessimista</p>
              </div>
            </div>
            <Button
              onClick={generateAllVersions}
              disabled={isGenerating || !scenario?.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Gerando 3 versões...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Gerar Todas as Versões</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Versions Comparison */}
      {Object.keys(versions).length > 0 && (
        <Tabs value={activeVersion} onValueChange={setActiveVersion}>
          <TabsList className="bg-white/5 border border-white/10 w-full">
            {NARRATIVE_TONES.map(tone => {
              const Icon = tone.icon;
              return (
                <TabsTrigger 
                  key={tone.id} 
                  value={tone.id}
                  className={`flex-1 data-[state=active]:${getToneColor(tone.id)}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tone.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {NARRATIVE_TONES.map(tone => {
            const version = versions[tone.id];
            const Icon = tone.icon;

            return (
              <TabsContent key={tone.id} value={tone.id} className="mt-4">
                <AnimatePresence mode="wait">
                  {version && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      {/* Narrative Content */}
                      <Card className={`bg-gradient-to-br ${getToneColor(tone.id)}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className={`text-lg flex items-center gap-2 ${getToneTextColor(tone.id)}`}>
                              <Icon className="w-5 h-5" />
                              {version.narrative?.headline}
                            </CardTitle>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(tone.id)}
                              className="text-slate-400 hover:text-white"
                            >
                              {copiedVersion === tone.id ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-slate-300 italic">{version.narrative?.opening}</p>
                          <p className="text-slate-200 leading-relaxed">{version.narrative?.body}</p>
                          <p className={`font-medium ${getToneTextColor(tone.id)}`}>
                            {version.narrative?.conclusion}
                          </p>
                          <div className="p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-slate-400 mb-1">Mensagem-Chave</p>
                            <p className="text-white font-medium">{version.narrative?.key_message}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tone Indicators */}
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'Confiança', value: version.tone_indicators?.confidence_level, icon: Target },
                          { label: 'Urgência', value: version.tone_indicators?.urgency_level, icon: TrendingUp },
                          { label: 'Esperança', value: version.tone_indicators?.hope_factor, icon: Sun },
                        ].map((indicator, idx) => (
                          <Card key={idx} className="bg-white/5 border-white/10">
                            <CardContent className="p-3 text-center">
                              <indicator.icon className={`w-4 h-4 mx-auto mb-1 ${getToneTextColor(tone.id)}`} />
                              <p className="text-lg font-bold text-white">{indicator.value || 0}%</p>
                              <p className="text-xs text-slate-500">{indicator.label}</p>
                            </CardContent>
                          </Card>
                        ))}
                        <Card className="bg-white/5 border-white/10">
                          <CardContent className="p-3 text-center">
                            <FileText className={`w-4 h-4 mx-auto mb-1 ${getToneTextColor(tone.id)}`} />
                            <p className="text-xs text-white truncate">{version.tone_indicators?.language_style}</p>
                            <p className="text-xs text-slate-500">Estilo</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Strategic Elements */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-emerald-500/10 border-emerald-500/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-emerald-400 text-sm flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Oportunidades Destacadas
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-1">
                            {version.strategic_elements?.opportunities_emphasized?.map((opp, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {opp}
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card className="bg-red-500/10 border-red-500/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                              <TrendingDown className="w-4 h-4" />
                              Riscos Destacados
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-1">
                            {version.strategic_elements?.risks_highlighted?.map((risk, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {risk}
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Audience Hooks */}
                      {version.audience_hooks?.length > 0 && (
                        <Card className="bg-white/5 border-white/10">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-white text-sm flex items-center gap-2">
                              <Users className="w-4 h-4 text-cyan-400" />
                              Ganchos por Público
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 gap-3">
                            {version.audience_hooks.map((hook, i) => (
                              <div key={i} className="p-3 bg-white/5 rounded-lg">
                                <Badge className="bg-cyan-500/20 text-cyan-400 mb-2">{hook.audience}</Badge>
                                <p className="text-sm text-white">{hook.hook}</p>
                                <p className="text-xs text-cyan-400 mt-1">→ {hook.call_to_action}</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}