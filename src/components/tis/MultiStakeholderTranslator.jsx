import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Building2, Briefcase, Settings, RefreshCw,
  Crown, Target, Zap, FileText, Copy, Check, Sparkles
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";

/**
 * TIS Multi-Stakeholder Translator
 * Traduz conteúdo estratégico para diferentes públicos:
 * - Board/Conselho
 * - C-Suite Executives
 * - VPs/Diretores
 * - Gerentes/Operacional
 */

const STAKEHOLDER_PROFILES = [
  {
    id: 'board',
    label: 'Board/Conselho',
    icon: Crown,
    color: 'amber',
    focus: 'Governança, risco, valor de longo prazo, compliance',
    tone: 'Formal, conciso, orientado a decisões estratégicas',
    metrics: 'ROI, market cap, risk exposure, shareholder value'
  },
  {
    id: 'c_suite',
    label: 'C-Suite',
    icon: Building2,
    color: 'blue',
    focus: 'Estratégia, execução, KPIs, competitividade',
    tone: 'Executivo, orientado a ação, data-driven',
    metrics: 'Revenue growth, market share, operational efficiency'
  },
  {
    id: 'directors',
    label: 'VPs/Diretores',
    icon: Target,
    color: 'purple',
    focus: 'Implementação, recursos, timeline, dependências',
    tone: 'Tático, detalhado, orientado a plano',
    metrics: 'Project milestones, team capacity, budget allocation'
  },
  {
    id: 'managers',
    label: 'Gerentes/Operacional',
    icon: Settings,
    color: 'green',
    focus: 'Tarefas, processos, ferramentas, treinamento',
    tone: 'Prático, passo-a-passo, orientado a execução',
    metrics: 'Task completion, process efficiency, team productivity'
  }
];

export default function MultiStakeholderTranslator({ 
  sourceContent, 
  sourceContext,
  onTranslationsGenerated 
}) {
  const [inputContent, setInputContent] = useState(sourceContent || "");
  const [translations, setTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState("board");
  const [copiedId, setCopiedId] = useState(null);

  const generateTranslations = async () => {
    if (!inputContent.trim()) {
      toast.error("Insira o conteúdo a ser traduzido");
      return;
    }

    setIsTranslating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a TIS (Translational Interpretation System) expert specializing in multi-stakeholder communication.

ORIGINAL STRATEGIC CONTENT:
"${inputContent}"

${sourceContext ? `CONTEXT: ${sourceContext}` : ''}

Translate this content for 4 different stakeholder levels, adapting:
1. Language complexity and terminology
2. Focus areas and priorities
3. Level of detail
4. Metrics and KPIs highlighted
5. Call-to-action appropriate for each level

Return JSON:
{
  "translations": {
    "board": {
      "title": "Executive Summary for Board",
      "summary": "1-2 sentence high-level summary",
      "key_points": ["point1", "point2", "point3"],
      "risks_opportunities": "Risk/opportunity framing for governance",
      "decision_required": "What decision the board needs to make",
      "metrics": ["relevant metric 1", "relevant metric 2"],
      "full_translation": "Full translated content (2-3 paragraphs max)"
    },
    "c_suite": {
      "title": "Strategic Brief for C-Suite",
      "summary": "1-2 sentence executive summary",
      "key_points": ["point1", "point2", "point3"],
      "strategic_implications": "How this affects company strategy",
      "action_items": ["action1", "action2"],
      "metrics": ["relevant metric 1", "relevant metric 2"],
      "full_translation": "Full translated content"
    },
    "directors": {
      "title": "Implementation Brief for VPs/Directors",
      "summary": "1-2 sentence tactical summary",
      "key_points": ["point1", "point2", "point3"],
      "resource_requirements": "Resources and dependencies",
      "timeline": "Suggested timeline",
      "metrics": ["relevant metric 1", "relevant metric 2"],
      "full_translation": "Full translated content with more detail"
    },
    "managers": {
      "title": "Operational Guide for Managers",
      "summary": "1-2 sentence practical summary",
      "key_points": ["point1", "point2", "point3"],
      "process_changes": "What changes in day-to-day operations",
      "training_needs": "Skills or training required",
      "metrics": ["relevant metric 1", "relevant metric 2"],
      "full_translation": "Full translated content with step-by-step guidance"
    }
  },
  "translation_metadata": {
    "complexity_reduction": "How complexity was reduced across levels",
    "key_message_preserved": "Core message that remains consistent",
    "adaptation_notes": "Notes on how content was adapted"
  }
}`,
        response_json_schema: {
          type: "object",
          properties: {
            translations: { type: "object" },
            translation_metadata: { type: "object" }
          }
        }
      });

      setTranslations(result);
      onTranslationsGenerated?.(result);
      toast.success("Traduções geradas para todos os stakeholders");
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Erro ao gerar traduções");
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copiado!");
  };

  const getColorClasses = (color) => {
    const colors = {
      amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl">TIS Multi-Stakeholder Translator</span>
              <p className="text-sm text-slate-400 font-normal">
                Tradução automática para Board, C-Suite, VPs e Gerentes
              </p>
            </div>
            <Badge className="ml-auto bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              XAI Engine
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Input Section */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Conteúdo Original (Estratégico/Técnico)
            </label>
            <Textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Cole aqui o conteúdo estratégico, análise, decisão ou recomendação que precisa ser comunicada para diferentes stakeholders..."
              className="bg-white/5 border-white/10 text-white min-h-32"
            />
          </div>

          <Button
            onClick={generateTranslations}
            disabled={isTranslating || !inputContent.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isTranslating ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Traduzindo para 4 públicos...</>
            ) : (
              <><Users className="w-4 h-4 mr-2" />Gerar Traduções Multi-Stakeholder</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Stakeholder Profiles */}
      <div className="grid grid-cols-4 gap-3">
        {STAKEHOLDER_PROFILES.map((profile) => {
          const Icon = profile.icon;
          const hasTranslation = translations?.translations?.[profile.id];
          return (
            <Card 
              key={profile.id}
              className={`bg-white/5 border-white/10 cursor-pointer transition-all ${
                activeTab === profile.id ? 'ring-2 ring-' + profile.color + '-500' : ''
              } ${hasTranslation ? 'opacity-100' : 'opacity-60'}`}
              onClick={() => hasTranslation && setActiveTab(profile.id)}
            >
              <CardContent className="p-3 text-center">
                <div className={`w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center ${getColorClasses(profile.color)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-white">{profile.label}</p>
                <p className="text-xs text-slate-500 mt-1">{profile.focus.split(',')[0]}</p>
                {hasTranslation && (
                  <Badge className="mt-2 bg-green-500/20 text-green-400 text-xs">✓ Pronto</Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Translations Display */}
      {translations?.translations && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10">
            {STAKEHOLDER_PROFILES.map((profile) => {
              const Icon = profile.icon;
              return (
                <TabsTrigger 
                  key={profile.id} 
                  value={profile.id}
                  className={`data-[state=active]:${getColorClasses(profile.color)}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {profile.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {STAKEHOLDER_PROFILES.map((profile) => {
            const translation = translations.translations[profile.id];
            if (!translation) return null;

            return (
              <TabsContent key={profile.id} value={profile.id} className="mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Title & Summary */}
                  <Card className={`${getColorClasses(profile.color)} border`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">{translation.title}</h3>
                          <p className="text-sm text-slate-300 mt-1">{translation.summary}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(translation.full_translation, `full-${profile.id}`)}
                          className="text-slate-400 hover:text-white"
                        >
                          {copiedId === `full-${profile.id}` ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Points */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-400">Pontos-Chave</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {translation.key_points?.map((point, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-white/5 rounded">
                          <Zap className="w-4 h-4 text-yellow-400 mt-0.5" />
                          <span className="text-sm text-white">{point}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Full Translation */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-400 flex items-center justify-between">
                        <span>Comunicação Completa</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(translation.full_translation, `content-${profile.id}`)}
                          className="text-slate-400 hover:text-white"
                        >
                          {copiedId === `content-${profile.id}` ? (
                            <><Check className="w-3 h-3 mr-1" />Copiado</>
                          ) : (
                            <><Copy className="w-3 h-3 mr-1" />Copiar</>
                          )}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {translation.full_translation}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Metrics */}
                  {translation.metrics?.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {translation.metrics.map((metric, i) => (
                        <Badge key={i} className="bg-white/10 text-slate-300">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {/* Translation Metadata */}
      {translations?.translation_metadata && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-400">Metadados da Tradução</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-slate-500">Mensagem Preservada</p>
                <p className="text-white mt-1">{translations.translation_metadata.key_message_preserved}</p>
              </div>
              <div>
                <p className="text-slate-500">Redução de Complexidade</p>
                <p className="text-white mt-1">{translations.translation_metadata.complexity_reduction}</p>
              </div>
              <div>
                <p className="text-slate-500">Notas de Adaptação</p>
                <p className="text-white mt-1">{translations.translation_metadata.adaptation_notes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}