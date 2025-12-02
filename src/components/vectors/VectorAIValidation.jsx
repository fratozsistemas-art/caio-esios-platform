import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, Sparkles, AlertTriangle, CheckCircle, 
  Lightbulb, Target, Loader2, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function VectorAIValidation({ decision, onUpdate }) {
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState(decision?.ai_validation || null);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um especialista em análise estratégica vetorial. Analise criticamente esta decisão:

TÍTULO: ${decision.title}
CONTEXTO: ${decision.context_type}
HORIZONTE: ${decision.horizon_days} dias

VETOR PRIMÁRIO:
- Nome: ${decision.primary_vector?.name}
- Direção: ${decision.primary_vector?.direction}
- Intensidade: ${decision.primary_vector?.intensity}/5
- Evidências: ${decision.primary_vector?.evidence?.join(', ')}
- Racional: ${decision.primary_vector?.rationale}

VETORES SECUNDÁRIOS: 
${decision.secondary_vectors?.map(v => `- ${v.name}: ${v.relation}, intensidade ${v.intensity}`).join('\n') || 'Nenhum'}

FORÇAS OPONENTES:
${decision.opposing_forces?.map(f => `- ${f.description} (${f.severity})`).join('\n') || 'Nenhuma'}

FORÇAS ACELERADORAS:
${decision.accelerating_forces?.map(f => `- ${f.description} (${f.leverage_potential})`).join('\n') || 'Nenhuma'}

PROJEÇÃO 30 DIAS: ${decision.projection_30d}
DECISÃO RECOMENDADA: ${decision.recommended_decision}

Forneça uma análise profunda em JSON com:
1. Consistência lógica entre vetores e decisão
2. Completude da análise (o que está faltando?)
3. Avaliação de risco
4. Pontos cegos que podem comprometer a decisão
5. Vetores alternativos que deveriam ser considerados
6. Sugestões de melhoria`,
        response_json_schema: {
          type: "object",
          properties: {
            consistency_score: { type: "number" },
            completeness_score: { type: "number" },
            risk_score: { type: "number" },
            overall_assessment: { type: "string" },
            logical_gaps: { type: "array", items: { type: "string" } },
            blind_spots: { type: "array", items: { type: "string" } },
            alternative_vectors: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } },
            stress_test_questions: { type: "array", items: { type: "string" } },
            confidence_level: { type: "string", enum: ["low", "medium", "high"] }
          }
        }
      });

      const validationData = {
        ...response,
        validated_at: new Date().toISOString()
      };

      setValidation(validationData);

      // Update decision with validation
      await base44.entities.VectorDecision.update(decision.id, {
        ai_validation: validationData
      });

      onUpdate?.();
      toast.success('Validação IA concluída');
    } catch (error) {
      toast.error('Erro na validação: ' + error.message);
    } finally {
      setIsValidating(false);
    }
  };

  const getScoreColor = (score, inverted = false) => {
    const value = inverted ? 1 - score : score;
    if (value >= 0.7) return 'text-green-400';
    if (value >= 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Validação IA
          </CardTitle>
          <Button
            size="sm"
            onClick={runValidation}
            disabled={isValidating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isValidating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</>
            ) : validation ? (
              <><RefreshCw className="w-4 h-4 mr-2" /> Revalidar</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Validar</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!validation ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">
              A IA analisará a consistência lógica, identificará pontos cegos e sugerirá melhorias
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Scores */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Consistência</p>
                <p className={`text-3xl font-bold ${getScoreColor(validation.consistency_score)}`}>
                  {Math.round(validation.consistency_score * 100)}%
                </p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Completude</p>
                <p className={`text-3xl font-bold ${getScoreColor(validation.completeness_score)}`}>
                  {Math.round(validation.completeness_score * 100)}%
                </p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Risco</p>
                <p className={`text-3xl font-bold ${getScoreColor(validation.risk_score, true)}`}>
                  {Math.round(validation.risk_score * 100)}%
                </p>
              </div>
            </div>

            {/* Overall Assessment */}
            {validation.overall_assessment && (
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <p className="text-sm text-white">{validation.overall_assessment}</p>
              </div>
            )}

            {/* Blind Spots */}
            {validation.blind_spots?.length > 0 && (
              <div>
                <h4 className="text-sm text-orange-400 font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Pontos Cegos
                </h4>
                <div className="space-y-2">
                  {validation.blind_spots.map((spot, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20"
                    >
                      <p className="text-sm text-white">{spot}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {validation.suggestions?.length > 0 && (
              <div>
                <h4 className="text-sm text-purple-400 font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Sugestões de Melhoria
                </h4>
                <div className="space-y-2">
                  {validation.suggestions.map((sug, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 flex items-start gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-white">{sug}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative Vectors */}
            {validation.alternative_vectors?.length > 0 && (
              <div>
                <h4 className="text-sm text-cyan-400 font-medium mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Vetores Alternativos a Considerar
                </h4>
                <div className="flex flex-wrap gap-2">
                  {validation.alternative_vectors.map((vec, idx) => (
                    <Badge 
                      key={idx}
                      className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                    >
                      {vec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stress Test Questions */}
            {validation.stress_test_questions?.length > 0 && (
              <div>
                <h4 className="text-sm text-red-400 font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Perguntas de Stress Test
                </h4>
                <ul className="space-y-2">
                  {validation.stress_test_questions.map((q, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-red-400 font-bold">{idx + 1}.</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confidence Level */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs text-slate-500">Confiança da Análise</span>
              <Badge className={`${
                validation.confidence_level === 'high' ? 'bg-green-500/20 text-green-400' :
                validation.confidence_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {validation.confidence_level === 'high' ? 'Alta' :
                 validation.confidence_level === 'medium' ? 'Média' : 'Baixa'}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}