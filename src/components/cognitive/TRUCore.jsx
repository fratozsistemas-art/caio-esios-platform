import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Languages, Loader2, Sparkles, ArrowRight, Users,
  CheckCircle, MessageSquare, BookOpen, FileText,
  Presentation, Mail, Video, Zap
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * TRU — TRANSLATIONAL REASONING UNIT
 * 
 * Traduz linguagem estratégica e vetores complexos em terminologia operacional
 * Core function: Reduzir fricção na implementação através de comunicação clara
 * 
 * Integração com HERMES (H2) mas com foco em múltiplas equipas simultaneamente
 */

const TARGET_TEAMS = [
  { id: "executive", label: "Executivos/C-Suite", context: "Decisão estratégica, ROI, riscos" },
  { id: "management", label: "Gestores/Gerência", context: "Alocação recursos, timelines, dependências" },
  { id: "technical", label: "Equipa Técnica", context: "Specs, arquitetura, implementação" },
  { id: "operations", label: "Operações", context: "Processos, SLAs, capacidade" },
  { id: "sales", label: "Comercial/Vendas", context: "Valor cliente, diferenciação, pitch" },
  { id: "hr", label: "Pessoas/RH", context: "Impacto organizacional, mudança, skills" },
  { id: "finance", label: "Financeiro", context: "Budget, custos, projeções" },
  { id: "external", label: "Stakeholders Externos", context: "Comunicação institucional, compliance" }
];

const OUTPUT_FORMATS = [
  { value: "briefing", label: "Briefing Executivo", icon: FileText },
  { value: "presentation", label: "Apresentação", icon: Presentation },
  { value: "email", label: "Email/Comunicado", icon: Mail },
  { value: "documentation", label: "Documentação", icon: BookOpen },
  { value: "talking_points", label: "Talking Points", icon: MessageSquare },
  { value: "video_script", label: "Script para Vídeo", icon: Video }
];

export default function TRUCore({ onTranslationComplete, moduleOutputs, hermesOutputs }) {
  const [strategicContent, setStrategicContent] = useState("");
  const [selectedTeams, setSelectedTeams] = useState(["management", "operations"]);
  const [outputFormat, setOutputFormat] = useState("briefing");
  const [urgencyLevel, setUrgencyLevel] = useState("normal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [translations, setTranslations] = useState(null);

  const toggleTeam = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(t => t !== teamId)
        : [...prev, teamId]
    );
  };

  const runTranslation = async () => {
    if (!strategicContent || selectedTeams.length === 0) return;
    
    setIsProcessing(true);
    try {
      const moduleContext = moduleOutputs ? 
        `\n\nContexto dos módulos TSI:\n${JSON.stringify(moduleOutputs, null, 2).slice(0, 1500)}` : '';
      
      const hermesContext = hermesOutputs ? 
        `\n\nAnálises HERMES:\n${JSON.stringify(hermesOutputs, null, 2).slice(0, 1000)}` : '';

      const teamsInfo = selectedTeams.map(t => {
        const team = TARGET_TEAMS.find(tt => tt.id === t);
        return `- ${team?.label}: ${team?.context}`;
      }).join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are TRU — Translational Reasoning Unit, a core cognitive module within CAIO.AI.

Your role is to translate strategic language and complex vectors into clear operational terminology for different teams, reducing implementation friction.

STRATEGIC CONTENT TO TRANSLATE:
${strategicContent}

TARGET TEAMS:
${teamsInfo}

OUTPUT FORMAT: ${outputFormat}
URGENCY: ${urgencyLevel}
${moduleContext}
${hermesContext}

Generate comprehensive translations in JSON:
{
  "translation_quality_score": 0-100,
  "friction_reduction_potential": 0-100,
  "original_complexity": "extreme|high|medium|low",
  
  "team_translations": [
    {
      "team_id": "team identifier",
      "team_name": "team name",
      "translation": {
        "headline": "one-line summary for this team",
        "context": "why this matters to them specifically",
        "key_messages": ["message1", "message2", "message3"],
        "action_items": [
          {
            "action": "what they need to do",
            "deadline": "when",
            "priority": "critical|high|medium|low"
          }
        ],
        "success_metrics": ["how they'll know they succeeded"],
        "dependencies": ["what they need from other teams"],
        "risks_relevant_to_them": ["risk1"]
      },
      "vocabulary_mapping": [
        {
          "strategic_term": "original term",
          "team_term": "how this team calls it",
          "explanation": "bridge explanation"
        }
      ],
      "tone_adjustments": {
        "original_tone": "how it was written",
        "adjusted_tone": "how it should sound for this team",
        "rationale": "why the adjustment"
      },
      "formatting": {
        "recommended_length": "brief|moderate|detailed",
        "visual_aids_needed": ["chart type1", "diagram type2"],
        "follow_up_format": "meeting|email|slack|document"
      }
    }
  ],
  
  "cross_team_alignment": {
    "shared_terminology": [
      {
        "term": "common term all teams should use",
        "definition": "agreed definition",
        "examples": ["example1"]
      }
    ],
    "handoff_points": [
      {
        "from_team": "team1",
        "to_team": "team2",
        "what_transfers": "deliverable/information",
        "when": "timing",
        "format": "how it should be handed off"
      }
    ],
    "potential_misalignments": [
      {
        "issue": "where teams might diverge",
        "teams_involved": ["team1", "team2"],
        "resolution": "how to prevent/fix"
      }
    ]
  },
  
  "communication_artifacts": {
    "format": "${outputFormat}",
    "master_document": {
      "title": "document title",
      "sections": [
        {
          "section": "section name",
          "content": "section content",
          "audience": "who this section is for"
        }
      ]
    },
    "supporting_materials": [
      {
        "material": "what to create",
        "purpose": "why it helps",
        "owner": "who should create it"
      }
    ]
  },
  
  "implementation_support": {
    "faq_anticipated": [
      {
        "question": "likely question",
        "answer": "clear answer",
        "from_teams": ["team1", "team2"]
      }
    ],
    "objection_handling": [
      {
        "objection": "likely pushback",
        "response": "how to address",
        "evidence": "supporting points"
      }
    ],
    "escalation_triggers": [
      {
        "trigger": "when to escalate",
        "to_whom": "escalation target",
        "process": "how to escalate"
      }
    ]
  },
  
  "tru_synthesis": {
    "translation_confidence": 0-100,
    "key_insight": "most important translation insight",
    "highest_friction_area": "where most friction is expected",
    "recommended_sequence": "which team to communicate with first and why",
    "critical_success_factor": "what must happen for translation to work"
  }
}

Be clear, actionable, and team-specific. Reduce jargon without losing meaning.`,
        response_json_schema: {
          type: "object",
          properties: {
            translation_quality_score: { type: "number" },
            friction_reduction_potential: { type: "number" },
            original_complexity: { type: "string" },
            team_translations: { type: "array", items: { type: "object" } },
            cross_team_alignment: { type: "object" },
            communication_artifacts: { type: "object" },
            implementation_support: { type: "object" },
            tru_synthesis: { type: "object" }
          }
        }
      });

      setTranslations(result);
      onTranslationComplete?.(result);
    } catch (error) {
      console.error("TRU Translation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Languages className="w-5 h-5 text-emerald-400" />
          TRU — Translational Reasoning Unit
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Codex CAIO.AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-300">
          Traduz linguagem estratégica em terminologia operacional clara para diferentes equipas.
        </p>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Conteúdo Estratégico a Traduzir *
          </label>
          <Textarea
            placeholder="Cole aqui a decisão estratégica, vetor complexo ou comunicação que precisa ser traduzida para as equipas..."
            value={strategicContent}
            onChange={(e) => setStrategicContent(e.target.value)}
            className="bg-white/5 border-white/10 text-white h-28"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-2 block">Equipas Alvo (selecione múltiplas)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TARGET_TEAMS.map((team) => (
              <div
                key={team.id}
                onClick={() => toggleTeam(team.id)}
                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                  selectedTeams.includes(team.id)
                    ? 'bg-emerald-500/20 border-emerald-500/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Checkbox checked={selectedTeams.includes(team.id)} />
                  <span className="text-xs text-white font-medium">{team.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Formato de Output</label>
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTPUT_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Urgência</label>
            <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Crítica (agora)</SelectItem>
                <SelectItem value="high">Alta (hoje)</SelectItem>
                <SelectItem value="normal">Normal (esta semana)</SelectItem>
                <SelectItem value="low">Baixa (quando possível)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={runTranslation}
          disabled={!strategicContent || selectedTeams.length === 0 || isProcessing}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          {isProcessing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traduzindo para {selectedTeams.length} equipas...</>
          ) : (
            <><Languages className="w-4 h-4 mr-2" />Gerar Traduções TRU ({selectedTeams.length} equipas)</>
          )}
        </Button>

        {translations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mt-4"
          >
            {/* Scores */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <p className="text-xs text-slate-400 mb-1">Qualidade</p>
                <p className="text-2xl font-bold text-emerald-400">{translations.translation_quality_score}%</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <p className="text-xs text-slate-400 mb-1">Redução Fricção</p>
                <p className="text-2xl font-bold text-teal-400">{translations.friction_reduction_potential}%</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <p className="text-xs text-slate-400 mb-1">Complexidade</p>
                <Badge className="bg-white/10 text-white">{translations.original_complexity}</Badge>
              </div>
            </div>

            {/* TRU Synthesis */}
            {translations.tru_synthesis && (
              <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Languages className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-400 mb-1">Síntese TRU</p>
                      <p className="text-sm text-white mb-2">{translations.tru_synthesis.key_insight}</p>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="p-2 bg-white/10 rounded">
                          <p className="text-xs text-yellow-400">Maior Fricção:</p>
                          <p className="text-xs text-white">{translations.tru_synthesis.highest_friction_area}</p>
                        </div>
                        <div className="p-2 bg-white/10 rounded">
                          <p className="text-xs text-cyan-400">Sequência:</p>
                          <p className="text-xs text-white">{translations.tru_synthesis.recommended_sequence}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Translations */}
            {translations.team_translations?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Traduções por Equipa ({translations.team_translations.length})
                </h4>
                {translations.team_translations.map((tt, idx) => (
                  <Card key={idx} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-emerald-500/20 text-emerald-400">{tt.team_name}</Badge>
                        <Badge className="bg-white/10 text-slate-300 text-xs">
                          {tt.formatting?.recommended_length}
                        </Badge>
                      </div>
                      
                      <h5 className="text-white font-medium mb-2">{tt.translation?.headline}</h5>
                      <p className="text-xs text-slate-400 mb-3">{tt.translation?.context}</p>
                      
                      {/* Key Messages */}
                      <div className="mb-3">
                        <p className="text-xs text-emerald-400 mb-1">Mensagens-Chave:</p>
                        {tt.translation?.key_messages?.map((msg, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-300 mb-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5" />
                            {msg}
                          </div>
                        ))}
                      </div>

                      {/* Action Items */}
                      {tt.translation?.action_items?.length > 0 && (
                        <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20">
                          <p className="text-xs text-cyan-400 mb-1">Ações para esta equipa:</p>
                          {tt.translation.action_items.slice(0, 2).map((action, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <ArrowRight className="w-3 h-3 text-cyan-400 mt-0.5" />
                              <span className="text-white">{action.action}</span>
                              <Badge className={`ml-auto text-xs ${
                                action.priority === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {action.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Vocabulary Mapping */}
                      {tt.vocabulary_mapping?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs text-slate-400 mb-1">Tradução de Termos:</p>
                          <div className="flex flex-wrap gap-2">
                            {tt.vocabulary_mapping.slice(0, 3).map((vocab, i) => (
                              <div key={i} className="text-xs">
                                <span className="text-red-400 line-through">{vocab.strategic_term}</span>
                                <span className="text-slate-400 mx-1">→</span>
                                <span className="text-green-400">{vocab.team_term}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Cross-Team Alignment */}
            {translations.cross_team_alignment?.handoff_points?.length > 0 && (
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Pontos de Handoff entre Equipas
                  </h4>
                  <div className="space-y-2">
                    {translations.cross_team_alignment.handoff_points.map((hp, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-white/5 rounded">
                        <Badge className="bg-blue-500/20 text-blue-400">{hp.from_team}</Badge>
                        <ArrowRight className="w-3 h-3 text-purple-400" />
                        <Badge className="bg-green-500/20 text-green-400">{hp.to_team}</Badge>
                        <span className="text-slate-300 ml-2">{hp.what_transfers}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQ */}
            {translations.implementation_support?.faq_anticipated?.length > 0 && (
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    FAQ Antecipadas
                  </h4>
                  {translations.implementation_support.faq_anticipated.slice(0, 3).map((faq, idx) => (
                    <div key={idx} className="p-2 bg-white/5 rounded mb-2">
                      <p className="text-xs text-white font-medium">❓ {faq.question}</p>
                      <p className="text-xs text-slate-300 mt-1">✓ {faq.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}