import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Languages, Eye, BookOpen, Network, Sparkles, RefreshCw,
  Target, ArrowRight, Layers, Brain, MessageSquare, Play,
  FileText, Users, Lightbulb, Link2, Search, Zap, Sun, Library, Crown
} from "lucide-react";
import NarrativeVersionGenerator from "./NarrativeVersionGenerator";
import NarrativeTemplateLibrary from "./NarrativeTemplateLibrary";
import NarrativeGraphIntegration from "./NarrativeGraphIntegration";
import MultiStakeholderTranslator from "./MultiStakeholderTranslator";
import { motion } from "framer-motion";
import { toast } from "sonner";

/**
 * TIS — TRANSLATIONAL INTERPRETATION SYSTEM
 * 
 * Camada de Interpretação Sistêmica:
 * - Análise Semiótica e Simbólica
 * - Modelagem Narrativa (Storytelling)
 * - Descoberta de Padrões Ocultos
 * - Integração com Knowledge Graph
 */

const NARRATIVE_ARCS = [
  { value: 'hero_journey', label: 'Jornada do Herói', description: 'Transformação através de desafios' },
  { value: 'tragedy', label: 'Tragédia', description: 'Queda causada por falha fatal' },
  { value: 'comedy', label: 'Comédia', description: 'Confusão levando a resolução feliz' },
  { value: 'rebirth', label: 'Renascimento', description: 'Transformação e renovação' },
  { value: 'quest', label: 'Busca', description: 'Jornada em busca de objetivo' },
  { value: 'voyage_return', label: 'Viagem e Retorno', description: 'Jornada a mundo estranho e volta' },
  { value: 'rags_riches', label: 'Do Nada ao Tudo', description: 'Ascensão de origens humildes' },
  { value: 'overcoming_monster', label: 'Superando o Monstro', description: 'Vitória contra ameaça' }
];

const CULTURAL_CONTEXTS = [
  { value: 'corporate_brazilian', label: 'Corporativo Brasileiro' },
  { value: 'startup_latam', label: 'Startup LATAM' },
  { value: 'enterprise_global', label: 'Enterprise Global' },
  { value: 'government_public', label: 'Governo/Setor Público' },
  { value: 'family_business', label: 'Empresa Familiar' },
  { value: 'tech_silicon_valley', label: 'Tech/Silicon Valley' }
];

const TARGET_AUDIENCES = [
  { value: 'board', label: 'Board/Conselho', icon: Users },
  { value: 'c_level', label: 'C-Level Executives', icon: Target },
  { value: 'vp_directors', label: 'VPs/Diretores', icon: Layers },
  { value: 'managers', label: 'Gerentes', icon: Users },
  { value: 'operations', label: 'Operações', icon: Zap },
  { value: 'external_investors', label: 'Investidores', icon: Target }
];

export default function TISInterpretationModule({ moduleOutputs, onAnalysisComplete }) {
  const [activeTab, setActiveTab] = useState("semiotic");
  const [inputText, setInputText] = useState("");
  const [culturalContext, setCulturalContext] = useState("corporate_brazilian");
  const [selectedAudiences, setSelectedAudiences] = useState(['c_level', 'managers']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: graphNodes = [] } = useQuery({
    queryKey: ['tis_graph_nodes'],
    queryFn: () => base44.entities.KnowledgeGraphNode.list('-created_date', 50)
  });

  const createAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.TISAnalysis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tis_analyses']);
      toast.success('Análise TIS salva');
    }
  });

  // Semiotic Analysis
  const runSemioticAnalysis = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a semiotic analysis expert. Perform deep semiotic and symbolic analysis of the following content:

CONTENT TO ANALYZE:
"${inputText}"

CULTURAL CONTEXT: ${CULTURAL_CONTEXTS.find(c => c.value === culturalContext)?.label}

Perform semiotic analysis focusing on:
1. Signs and their meanings (signifier/signified)
2. Symbolic patterns and cultural codes
3. Hidden meanings and connotations
4. Power dynamics embedded in language
5. Cultural assumptions and biases

Return JSON:
{
  "semiotic_analysis": {
    "signs_identified": [
      {
        "sign": "the sign/symbol",
        "signifier": "what is literally expressed",
        "signified": "deeper meaning/concept",
        "cultural_weight": 0-100,
        "interpretation": "what this means in context"
      }
    ],
    "symbolic_patterns": [
      {
        "pattern": "pattern description",
        "frequency": "how often it appears",
        "cultural_origin": "where this pattern comes from",
        "strategic_implication": "what this means strategically"
      }
    ],
    "cultural_codes": [
      {
        "code": "cultural code",
        "meaning": "what it signifies",
        "audience_resonance": "who responds to this",
        "usage_recommendation": "how to leverage"
      }
    ],
    "hidden_meanings": [
      {
        "surface": "what is said",
        "underlying": "what is really meant",
        "tension": "potential conflict/opportunity"
      }
    ],
    "power_dynamics": {
      "dominant_voice": "who has power in the text",
      "marginalized_voices": ["who is excluded"],
      "recommendation": "how to balance"
    }
  },
  "synthesis": "Overall semiotic interpretation",
  "strategic_recommendations": ["how to use these insights"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            semiotic_analysis: { type: "object" },
            synthesis: { type: "string" },
            strategic_recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAnalysisResult(result);
      
      // Save to database
      createAnalysisMutation.mutate({
        title: `Análise Semiótica: ${inputText.slice(0, 50)}...`,
        analysis_type: 'semiotic',
        input_data: { text_content: inputText, cultural_context: culturalContext },
        semiotic_analysis: result.semiotic_analysis,
        confidence_score: 85,
        status: 'completed'
      });

      onAnalysisComplete?.(result);
    } catch (error) {
      console.error("Semiotic analysis error:", error);
      toast.error("Erro na análise semiótica");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Narrative Modeling
  const runNarrativeModeling = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a master storyteller and narrative strategist. Transform the following strategic content into a compelling narrative model:

CONTENT:
"${inputText}"

CULTURAL CONTEXT: ${CULTURAL_CONTEXTS.find(c => c.value === culturalContext)?.label}
TARGET AUDIENCES: ${selectedAudiences.join(', ')}

Create a narrative model that:
1. Identifies the most fitting narrative arc
2. Casts the key players as story characters
3. Defines the conflict and resolution path
4. Creates emotional trajectory
5. Generates audience-specific tellings

Return JSON:
{
  "narrative_model": {
    "narrative_arc": "hero_journey|tragedy|comedy|rebirth|quest|voyage_return|rags_riches|overcoming_monster",
    "arc_justification": "why this arc fits",
    "protagonist": {
      "identity": "who is the hero",
      "motivation": "what drives them",
      "transformation": "how they change"
    },
    "antagonist": {
      "identity": "the opposing force (can be abstract)",
      "nature": "internal|external|market|competitor|self",
      "threat_level": 0-100
    },
    "conflict": {
      "core_tension": "the central conflict",
      "stakes": "what is at risk",
      "ticking_clock": "urgency factor"
    },
    "resolution_path": {
      "obstacles": ["obstacle1", "obstacle2"],
      "allies": ["ally1", "ally2"],
      "turning_point": "the key moment",
      "resolution": "how it ends"
    },
    "emotional_trajectory": [
      {"phase": "opening", "emotion": "emotion name", "narrative_beat": "what happens"},
      {"phase": "rising", "emotion": "emotion name", "narrative_beat": "what happens"},
      {"phase": "climax", "emotion": "emotion name", "narrative_beat": "what happens"},
      {"phase": "resolution", "emotion": "emotion name", "narrative_beat": "what happens"}
    ],
    "story_summary": "The complete story in 2-3 paragraphs"
  },
  "audience_adaptations": [
    {
      "audience": "audience type",
      "framing": "how to present to this audience",
      "key_metaphors": ["metaphor1", "metaphor2"],
      "emotional_hooks": ["hook1", "hook2"],
      "call_to_action": "what you want them to do",
      "adapted_story": "the story retold for this audience"
    }
  ],
  "presentation_recommendations": {
    "visual_style": "suggested visual approach",
    "tone": "communication tone",
    "medium": "best delivery medium"
  }
}`,
        response_json_schema: {
          type: "object",
          properties: {
            narrative_model: { type: "object" },
            audience_adaptations: { type: "array", items: { type: "object" } },
            presentation_recommendations: { type: "object" }
          }
        }
      });

      setAnalysisResult(result);
      
      createAnalysisMutation.mutate({
        title: `Modelagem Narrativa: ${inputText.slice(0, 50)}...`,
        analysis_type: 'narrative',
        input_data: { text_content: inputText, cultural_context: culturalContext },
        narrative_model: result.narrative_model,
        multi_audience_explanations: result.audience_adaptations,
        confidence_score: 80,
        status: 'completed'
      });

      onAnalysisComplete?.(result);
    } catch (error) {
      console.error("Narrative modeling error:", error);
      toast.error("Erro na modelagem narrativa");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Pattern Discovery with Knowledge Graph
  const runPatternDiscovery = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const graphContext = graphNodes.slice(0, 20).map(n => ({
        label: n.label,
        type: n.node_type,
        properties: n.properties
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a pattern recognition and analogical reasoning expert. Discover hidden patterns in the following content and find analogues in the knowledge graph:

CONTENT TO ANALYZE:
"${inputText}"

KNOWLEDGE GRAPH ENTITIES:
${JSON.stringify(graphContext, null, 2)}

Discover:
1. Hidden patterns not immediately obvious
2. Cross-domain analogies and parallels
3. Emergent themes across different areas
4. Historical parallels and precedents
5. Connections to knowledge graph entities

Return JSON:
{
  "pattern_discovery": {
    "hidden_patterns": [
      {
        "pattern": "pattern description",
        "evidence": ["evidence1", "evidence2"],
        "confidence": 0-100,
        "pattern_type": "behavioral|structural|temporal|causal",
        "strategic_value": "why this matters"
      }
    ],
    "cross_domain_analogies": [
      {
        "source_domain": "where the pattern comes from",
        "target_application": "how it applies here",
        "analogy": "the parallel",
        "lessons_transferable": ["lesson1", "lesson2"],
        "cautions": ["what might not transfer"]
      }
    ],
    "historical_parallels": [
      {
        "historical_case": "what happened before",
        "similarity_score": 0-100,
        "outcome_in_history": "how it played out",
        "applicable_lessons": ["lesson1"]
      }
    ],
    "emergent_themes": [
      {
        "theme": "emerging theme",
        "strength": 0-100,
        "trajectory": "growing|stable|declining",
        "implications": "what this means"
      }
    ]
  },
  "knowledge_graph_connections": [
    {
      "node_label": "connected entity",
      "connection_type": "causal|correlative|analogical|temporal",
      "relevance": 0-100,
      "insight": "what this connection reveals"
    }
  ],
  "meta_patterns": {
    "overarching_theme": "the big picture pattern",
    "systemic_insight": "what this tells us about the system",
    "predictive_implications": "what might happen next"
  }
}`,
        response_json_schema: {
          type: "object",
          properties: {
            pattern_discovery: { type: "object" },
            knowledge_graph_connections: { type: "array", items: { type: "object" } },
            meta_patterns: { type: "object" }
          }
        }
      });

      setAnalysisResult(result);
      
      createAnalysisMutation.mutate({
        title: `Descoberta de Padrões: ${inputText.slice(0, 50)}...`,
        analysis_type: 'pattern_discovery',
        input_data: { text_content: inputText },
        pattern_discovery: result.pattern_discovery,
        knowledge_graph_links: result.knowledge_graph_connections,
        confidence_score: 75,
        status: 'completed'
      });

      onAnalysisComplete?.(result);
    } catch (error) {
      console.error("Pattern discovery error:", error);
      toast.error("Erro na descoberta de padrões");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getArcInfo = (arc) => NARRATIVE_ARCS.find(a => a.value === arc);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Languages className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xl">TIS — Translational Interpretation System</span>
                <p className="text-sm text-slate-400 font-normal">
                  Interpretação Sistêmica & Análise de Significados
                </p>
              </div>
            </CardTitle>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Codex v12.3
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Input Section */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Conteúdo para Análise</label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Cole aqui o texto, documento, comunicação ou conteúdo a ser interpretado..."
              className="bg-white/5 border-white/10 text-white min-h-32"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Contexto Cultural</label>
              <Select value={culturalContext} onValueChange={setCulturalContext}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CULTURAL_CONTEXTS.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Públicos-Alvo</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {TARGET_AUDIENCES.map(aud => (
                  <Badge
                    key={aud.value}
                    className={`cursor-pointer text-xs ${
                      selectedAudiences.includes(aud.value)
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'bg-white/10 text-slate-400'
                    }`}
                    onClick={() => {
                      setSelectedAudiences(prev =>
                        prev.includes(aud.value)
                          ? prev.filter(a => a !== aud.value)
                          : [...prev, aud.value]
                      );
                    }}
                  >
                    {aud.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="semiotic" className="data-[state=active]:bg-blue-500/20">
            <Eye className="w-4 h-4 mr-2" />
            Análise Semiótica
          </TabsTrigger>
          <TabsTrigger value="narrative" className="data-[state=active]:bg-purple-500/20">
            <BookOpen className="w-4 h-4 mr-2" />
            Modelagem Narrativa
          </TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-cyan-500/20">
            <Network className="w-4 h-4 mr-2" />
            Padrões Ocultos
          </TabsTrigger>
          <TabsTrigger value="versions" className="data-[state=active]:bg-emerald-500/20">
            <Sun className="w-4 h-4 mr-2" />
            Versões Narrativas
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-indigo-500/20">
            <Library className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="graph" className="data-[state=active]:bg-pink-500/20">
            <Link2 className="w-4 h-4 mr-2" />
            Integração KG
          </TabsTrigger>
          <TabsTrigger value="stakeholder" className="data-[state=active]:bg-amber-500/20">
            <Users className="w-4 h-4 mr-2" />
            Multi-Stakeholder
          </TabsTrigger>
          </TabsList>

        {/* SEMIOTIC TAB */}
        <TabsContent value="semiotic" className="mt-6 space-y-4">
          <Button
            onClick={runSemioticAnalysis}
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isAnalyzing ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Analisando Signos...</>
            ) : (
              <><Eye className="w-4 h-4 mr-2" />Executar Análise Semiótica</>
            )}
          </Button>

          {analysisResult?.semiotic_analysis && (
            <SemioticResultsDisplay result={analysisResult} />
          )}
        </TabsContent>

        {/* NARRATIVE TAB */}
        <TabsContent value="narrative" className="mt-6 space-y-4">
          <Button
            onClick={runNarrativeModeling}
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isAnalyzing ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Modelando Narrativa...</>
            ) : (
              <><BookOpen className="w-4 h-4 mr-2" />Criar Modelo Narrativo</>
            )}
          </Button>

          {analysisResult?.narrative_model && (
            <NarrativeResultsDisplay result={analysisResult} />
          )}
        </TabsContent>

        {/* PATTERNS TAB */}
        <TabsContent value="patterns" className="mt-6 space-y-4">
          <Button
            onClick={runPatternDiscovery}
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
          >
            {isAnalyzing ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Descobrindo Padrões...</>
            ) : (
              <><Network className="w-4 h-4 mr-2" />Descobrir Padrões com Knowledge Graph</>
            )}
          </Button>

          {analysisResult?.pattern_discovery && (
            <PatternResultsDisplay result={analysisResult} />
          )}
        </TabsContent>

        {/* NARRATIVE VERSIONS TAB */}
        <TabsContent value="versions" className="mt-6">
          <NarrativeVersionGenerator
            scenario={inputText}
            culturalContext={CULTURAL_CONTEXTS.find(c => c.value === culturalContext)?.label}
            audiences={selectedAudiences}
            onVersionsGenerated={(versions) => {
              setAnalysisResult({ ...analysisResult, narrative_versions: versions });
              onAnalysisComplete?.({ type: 'versions', versions });
            }}
          />
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="mt-6">
          <NarrativeTemplateLibrary
            onTemplateSelect={(template) => {
              console.log('Template selected:', template);
            }}
            onNarrativeGenerated={(data) => {
              setAnalysisResult({ ...analysisResult, template_narrative: data });
              onAnalysisComplete?.({ type: 'template', ...data });
            }}
          />
        </TabsContent>

        {/* GRAPH INTEGRATION TAB */}
        <TabsContent value="graph" className="mt-6">
          <NarrativeGraphIntegration
            narrativeData={analysisResult?.narrative_model || analysisResult?.template_narrative?.result}
            onGraphSaved={(graphData) => {
              toast.success('Narrativa integrada ao Knowledge Graph!');
              onAnalysisComplete?.({ type: 'graph', ...graphData });
            }}
          />
        </TabsContent>

        {/* MULTI-STAKEHOLDER TAB */}
        <TabsContent value="stakeholder" className="mt-6">
          <MultiStakeholderTranslator
            sourceContent={inputText}
            sourceContext={CULTURAL_CONTEXTS.find(c => c.value === culturalContext)?.label}
            onTranslationsGenerated={(translations) => {
              setAnalysisResult({ ...analysisResult, stakeholder_translations: translations });
              onAnalysisComplete?.({ type: 'stakeholder', ...translations });
            }}
          />
        </TabsContent>
        </Tabs>
    </div>
  );
}

// Semiotic Results Display
function SemioticResultsDisplay({ result }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Signs Identified */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Signos Identificados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {result.semiotic_analysis?.signs_identified?.map((sign, i) => (
            <div key={i} className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{sign.sign}</span>
                <Badge className="bg-blue-500/20 text-blue-400">
                  Peso: {sign.cultural_weight}%
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Significante:</span>
                  <p className="text-slate-300">{sign.signifier}</p>
                </div>
                <div>
                  <span className="text-slate-500">Significado:</span>
                  <p className="text-slate-300">{sign.signified}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">{sign.interpretation}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cultural Codes */}
      {result.semiotic_analysis?.cultural_codes?.length > 0 && (
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Códigos Culturais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.semiotic_analysis.cultural_codes.map((code, i) => (
              <div key={i} className="p-2 bg-white/5 rounded">
                <p className="text-sm text-white font-medium">{code.code}</p>
                <p className="text-xs text-slate-400">{code.meaning}</p>
                <p className="text-xs text-purple-400 mt-1">→ {code.usage_recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Synthesis */}
      <Card className="bg-indigo-500/10 border-indigo-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-indigo-400 mb-1">Síntese Semiótica</p>
              <p className="text-sm text-slate-300">{result.synthesis}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Narrative Results Display
function NarrativeResultsDisplay({ result }) {
  const arcInfo = NARRATIVE_ARCS.find(a => a.value === result.narrative_model?.narrative_arc);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Narrative Arc */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <div>
              <p className="text-lg font-bold text-white">{arcInfo?.label}</p>
              <p className="text-sm text-slate-400">{arcInfo?.description}</p>
            </div>
          </div>
          <p className="text-sm text-slate-300">{result.narrative_model?.arc_justification}</p>
        </CardContent>
      </Card>

      {/* Characters */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <p className="text-xs text-green-400 mb-1">Protagonista</p>
            <p className="text-white font-medium">{result.narrative_model?.protagonist?.identity}</p>
            <p className="text-xs text-slate-400 mt-1">{result.narrative_model?.protagonist?.motivation}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <p className="text-xs text-red-400 mb-1">Antagonista</p>
            <p className="text-white font-medium">{result.narrative_model?.antagonist?.identity}</p>
            <Badge className="mt-1 bg-red-500/20 text-red-400 text-xs">
              Ameaça: {result.narrative_model?.antagonist?.threat_level}%
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Story Summary */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            A História
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300 leading-relaxed">
            {result.narrative_model?.story_summary}
          </p>
        </CardContent>
      </Card>

      {/* Audience Adaptations */}
      {result.audience_adaptations?.length > 0 && (
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Adaptações por Público
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.audience_adaptations.map((adapt, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-cyan-500/20 text-cyan-400">{adapt.audience}</Badge>
                </div>
                <p className="text-sm text-white mb-2">{adapt.framing}</p>
                <p className="text-xs text-slate-300">{adapt.adapted_story}</p>
                {adapt.key_metaphors?.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {adapt.key_metaphors.map((m, j) => (
                      <Badge key={j} className="bg-white/10 text-slate-400 text-xs">{m}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// Pattern Results Display
function PatternResultsDisplay({ result }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Hidden Patterns */}
      <Card className="bg-cyan-500/10 border-cyan-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
            <Search className="w-4 h-4" />
            Padrões Ocultos Descobertos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {result.pattern_discovery?.hidden_patterns?.map((pattern, i) => (
            <div key={i} className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{pattern.pattern}</span>
                <div className="flex gap-2">
                  <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                    {pattern.pattern_type}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    {pattern.confidence}% confiança
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-slate-400">{pattern.strategic_value}</p>
              {pattern.evidence?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {pattern.evidence.map((e, j) => (
                    <Badge key={j} className="bg-white/10 text-slate-400 text-xs">{e}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Knowledge Graph Connections */}
      {result.knowledge_graph_connections?.length > 0 && (
        <Card className="bg-indigo-500/10 border-indigo-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-indigo-400 text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Conexões no Knowledge Graph
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.knowledge_graph_connections.map((conn, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-white">{conn.node_label}</span>
                  <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                    {conn.connection_type}
                  </Badge>
                </div>
                <span className="text-xs text-slate-400">{conn.relevance}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Meta Patterns */}
      {result.meta_patterns && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-400 mb-1">Meta-Padrão</p>
                <p className="text-white font-medium">{result.meta_patterns?.overarching_theme}</p>
                <p className="text-sm text-slate-300 mt-2">{result.meta_patterns?.systemic_insight}</p>
                <p className="text-xs text-amber-400 mt-2">
                  → {result.meta_patterns?.predictive_implications}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}