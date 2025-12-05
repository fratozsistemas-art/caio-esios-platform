import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, MessageCircle, Lightbulb, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const REFRAMING_LEVELS = [
  { id: 'surface', label: 'Superficial', depth: 1, color: '#60a5fa' },
  { id: 'tactical', label: 'Tático', depth: 2, color: '#a78bfa' },
  { id: 'strategic', label: 'Estratégico', depth: 3, color: '#f472b6' },
  { id: 'paradigm', label: 'Paradigma', depth: 4, color: '#fb923c' },
  { id: 'ontological', label: 'Ontológico', depth: 5, color: '#ef4444' }
];

const QUESTIONING_TECHNIQUES = [
  { id: 'socratic', name: 'Socrático', description: 'Questionar pressupostos fundamentais' },
  { id: 'provocative', name: 'Provocativo', description: 'Desafiar crenças estabelecidas' },
  { id: 'systemic', name: 'Sistêmico', description: 'Explorar interdependências' },
  { id: 'temporal', name: 'Temporal', description: 'Analisar através do tempo' },
  { id: 'perspective', name: 'Multi-perspectiva', description: 'Múltiplos pontos de vista' }
];

export default function M8MaieuticReframingEnhanced() {
  const [statement, setStatement] = useState('');
  const [context, setContext] = useState('');
  const [selectedTechniques, setSelectedTechniques] = useState(['socratic']);
  const [targetDepth, setTargetDepth] = useState(3);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const toggleTechnique = (id) => {
    setSelectedTechniques(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const performReframing = async () => {
    if (!statement.trim()) {
      toast.error('Digite uma afirmação ou problema para analisar');
      return;
    }

    setIsAnalyzing(true);
    try {
      const prompt = `
Você é um mestre em Reframing Maiêutico. Analise a seguinte afirmação/problema usando questionamento profundo.

**Afirmação/Problema:**
${statement}

**Contexto Adicional:**
${context || 'Nenhum contexto adicional fornecido'}

**Técnicas de Questionamento Solicitadas:**
${selectedTechniques.map(id => {
  const tech = QUESTIONING_TECHNIQUES.find(t => t.id === id);
  return `- ${tech.name}: ${tech.description}`;
}).join('\n')}

**Profundidade Alvo:** Nível ${targetDepth} de 5 (${REFRAMING_LEVELS[targetDepth - 1].label})

**Sua tarefa:**
1. Identifique os pressupostos ocultos na afirmação
2. Gere perguntas maiêuticas profundas (${targetDepth * 3} perguntas mínimo)
3. Proponha ${targetDepth} reframings alternativos em diferentes níveis de profundidade
4. Identifique contradições internas e pontos cegos
5. Sugira insights disruptivos baseados no reframing

Retorne um JSON estruturado.
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            hidden_assumptions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  assumption: { type: 'string' },
                  implicit_belief: { type: 'string' },
                  danger_level: { type: 'string' }
                }
              }
            },
            maieutic_questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  technique: { type: 'string' },
                  depth_level: { type: 'number' },
                  purpose: { type: 'string' }
                }
              }
            },
            alternative_framings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  level: { type: 'string' },
                  reframing: { type: 'string' },
                  shift_type: { type: 'string' },
                  potential_impact: { type: 'string' }
                }
              }
            },
            contradictions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  contradiction: { type: 'string' },
                  tension: { type: 'string' }
                }
              }
            },
            blind_spots: {
              type: 'array',
              items: { type: 'string' }
            },
            disruptive_insights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  insight: { type: 'string' },
                  paradigm_shift: { type: 'string' }
                }
              }
            },
            recommended_next_questions: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      setResults(response);
      toast.success('Reframing completo!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao realizar reframing');
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
            <Sparkles className="w-5 h-5 text-pink-400" />
            Entrada: Afirmação ou Problema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ex: 'Nossa empresa precisa reduzir custos para ser competitiva'"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            className="min-h-24 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
          <Textarea
            placeholder="Contexto adicional (opcional)"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="min-h-16 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />

          {/* Technique Selection */}
          <div>
            <p className="text-sm text-slate-300 mb-2">Técnicas de Questionamento:</p>
            <div className="flex flex-wrap gap-2">
              {QUESTIONING_TECHNIQUES.map(tech => (
                <Badge
                  key={tech.id}
                  onClick={() => toggleTechnique(tech.id)}
                  className={`cursor-pointer transition-all ${
                    selectedTechniques.includes(tech.id)
                      ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {tech.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Depth Selector */}
          <div>
            <p className="text-sm text-slate-300 mb-2">Profundidade Alvo:</p>
            <div className="flex gap-2">
              {REFRAMING_LEVELS.map((level, idx) => (
                <button
                  key={level.id}
                  onClick={() => setTargetDepth(idx + 1)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    targetDepth === idx + 1
                      ? 'text-white border-2'
                      : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                  }`}
                  style={targetDepth === idx + 1 ? { 
                    backgroundColor: `${level.color}20`, 
                    borderColor: level.color 
                  } : {}}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={performReframing}
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Iniciar Reframing Maiêutico
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
          <Tabs defaultValue="assumptions">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="assumptions">Pressupostos</TabsTrigger>
              <TabsTrigger value="questions">Perguntas</TabsTrigger>
              <TabsTrigger value="reframings">Reframings</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="assumptions" className="space-y-3">
              {results.hidden_assumptions?.map((item, idx) => (
                <Card key={idx} className="bg-white/5 border-orange-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">{item.assumption}</p>
                        <p className="text-sm text-slate-400 mb-2">{item.implicit_belief}</p>
                        <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                          Risco: {item.danger_level}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="questions" className="space-y-3">
              {results.maieutic_questions?.map((q, idx) => (
                <Card key={idx} className="bg-white/5 border-purple-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">{q.question}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            {q.technique}
                          </Badge>
                          <Badge className="bg-white/10 text-slate-300 text-xs">
                            Nível {q.depth_level}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{q.purpose}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="reframings" className="space-y-3">
              {results.alternative_framings?.map((frame, idx) => (
                <Card key={idx} className="bg-white/5 border-pink-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <Badge className="bg-pink-500/20 text-pink-400 text-xs mb-2">
                          {frame.level} - {frame.shift_type}
                        </Badge>
                        <p className="text-white font-medium mb-2">{frame.reframing}</p>
                        <p className="text-sm text-slate-400">{frame.potential_impact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card className="bg-white/5 border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Insights Disruptivos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {results.disruptive_insights?.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-medium mb-1">{insight.insight}</p>
                        <p className="text-xs text-slate-400">{insight.paradigm_shift}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {results.blind_spots && results.blind_spots.length > 0 && (
                <Card className="bg-white/5 border-yellow-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Pontos Cegos Identificados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.blind_spots.map((spot, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-yellow-400">•</span>
                          {spot}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}