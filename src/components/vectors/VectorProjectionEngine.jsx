import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  TrendingUp, TrendingDown, Activity, Loader2, Sparkles,
  Target, ArrowRight, GitBranch, BarChart3, Zap, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, AreaChart, ReferenceLine
} from 'recharts';

const SCENARIOS = [
  { id: 'optimistic', label: 'Otimista', color: '#22C55E', multiplier: 1.3 },
  { id: 'realistic', label: 'Realista', color: '#00D4FF', multiplier: 1.0 },
  { id: 'pessimistic', label: 'Pessimista', color: '#EF4444', multiplier: 0.7 },
  { id: 'stress', label: 'Stress Test', color: '#F59E0B', multiplier: 0.4 }
];

export default function VectorProjectionEngine({ decision, checkpoints = [], onProjectionComplete }) {
  const [isProjecting, setIsProjecting] = useState(false);
  const [projectionData, setProjectionData] = useState(null);
  const [scenarioWeights, setScenarioWeights] = useState({
    optimistic: 20,
    realistic: 50,
    pessimistic: 25,
    stress: 5
  });
  const [externalFactors, setExternalFactors] = useState('');

  const generateProjections = async () => {
    setIsProjecting(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Gere projeções vetoriais para a seguinte decisão estratégica:

DECISÃO: ${decision.title}
VETOR PRIMÁRIO: ${decision.primary_vector?.name}
- Direção: ${decision.primary_vector?.direction}
- Intensidade: ${decision.primary_vector?.intensity}/5

VETORES SECUNDÁRIOS: ${decision.secondary_vectors?.map(v => `${v.name} (${v.relation})`).join(', ') || 'Nenhum'}

FORÇAS OPONENTES: ${decision.opposing_forces?.map(f => `${f.description} (${f.severity})`).join(', ')}
FORÇAS ACELERADORAS: ${decision.accelerating_forces?.map(f => f.description).join(', ')}

HISTÓRICO DE CHECKPOINTS (${checkpoints.length}):
${checkpoints.slice(-3).map(c => `- Checkpoint #${c.checkpoint_number}: ${c.checkpoint_decision} - Health: ${Math.round((c.vector_health_score || 0.7) * 100)}%`).join('\n')}

FATORES EXTERNOS CONSIDERADOS: ${externalFactors || 'Nenhum especificado'}

PESOS DOS CENÁRIOS:
- Otimista: ${scenarioWeights.optimistic}%
- Realista: ${scenarioWeights.realistic}%
- Pessimista: ${scenarioWeights.pessimistic}%
- Stress: ${scenarioWeights.stress}%

Gere projeções para os próximos 90 dias (em intervalos de 15 dias) considerando os cenários ponderados.`,
        response_json_schema: {
          type: "object",
          properties: {
            projections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "integer" },
                  optimistic: { type: "number" },
                  realistic: { type: "number" },
                  pessimistic: { type: "number" },
                  stress: { type: "number" },
                  weighted: { type: "number" }
                }
              }
            },
            inflection_points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "integer" },
                  event: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            critical_thresholds: {
              type: "object",
              properties: {
                abort_threshold: { type: "number" },
                pivot_threshold: { type: "number" },
                accelerate_threshold: { type: "number" }
              }
            },
            probability_distribution: {
              type: "object",
              properties: {
                success_probability: { type: "number" },
                partial_success: { type: "number" },
                failure_probability: { type: "number" }
              }
            },
            key_dependencies: { type: "array", items: { type: "string" } },
            early_warning_signals: { type: "array", items: { type: "string" } },
            recommended_monitoring_focus: { type: "string" }
          }
        }
      });

      setProjectionData(response);
      toast.success('Projeções geradas com sucesso');
      onProjectionComplete?.(response);
    } catch (error) {
      toast.error('Erro ao gerar projeções');
      console.error(error);
    } finally {
      setIsProjecting(false);
    }
  };

  const updateScenarioWeight = (scenario, value) => {
    const remaining = 100 - value;
    const others = Object.keys(scenarioWeights).filter(s => s !== scenario);
    const currentOthersSum = others.reduce((sum, s) => sum + scenarioWeights[s], 0);
    
    const newWeights = { ...scenarioWeights, [scenario]: value };
    if (currentOthersSum > 0) {
      others.forEach(s => {
        newWeights[s] = Math.round((scenarioWeights[s] / currentOthersSum) * remaining);
      });
    }
    setScenarioWeights(newWeights);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-400" />
          Motor de Projeção Vetorial
          <Badge className="bg-blue-500/20 text-blue-400">CAIO.VEC-02</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Weights */}
        <div className="grid grid-cols-2 gap-4">
          {SCENARIOS.map(scenario => (
            <div key={scenario.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scenario.color }} />
                  {scenario.label}
                </Label>
                <span className="text-sm font-mono" style={{ color: scenario.color }}>
                  {scenarioWeights[scenario.id]}%
                </span>
              </div>
              <Slider
                value={[scenarioWeights[scenario.id]]}
                onValueChange={([v]) => updateScenarioWeight(scenario.id, v)}
                min={0}
                max={100}
                className="[&_[role=slider]]:bg-white"
              />
            </div>
          ))}
        </div>

        {/* External Factors */}
        <div>
          <Label className="text-slate-300">Fatores Externos a Considerar</Label>
          <Textarea
            value={externalFactors}
            onChange={(e) => setExternalFactors(e.target.value)}
            placeholder="Ex: Eleições em 6 meses, novo regulamento setorial, entrada de competidor..."
            className="mt-2 bg-white/5 border-white/10 text-white h-20"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateProjections}
          disabled={isProjecting}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
        >
          {isProjecting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando Projeções...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Gerar Projeções Vetoriais</>
          )}
        </Button>

        {/* Projection Results */}
        {projectionData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Chart */}
            <div className="h-64 bg-slate-900/50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData.projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" tick={{ fill: '#9CA3AF' }} label={{ value: 'Dias', fill: '#9CA3AF' }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#1F2937', border: '1px solid #374151' }}
                    labelFormatter={(v) => `Dia ${v}`}
                  />
                  <Area type="monotone" dataKey="optimistic" stroke="#22C55E" fill="#22C55E" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="realistic" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="pessimistic" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} />
                  <Line type="monotone" dataKey="weighted" stroke="#FFB800" strokeWidth={3} dot={false} />
                  {projectionData.critical_thresholds && (
                    <>
                      <ReferenceLine y={projectionData.critical_thresholds.abort_threshold * 100} stroke="#EF4444" strokeDasharray="5 5" />
                      <ReferenceLine y={projectionData.critical_thresholds.accelerate_threshold * 100} stroke="#22C55E" strokeDasharray="5 5" />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Probability Distribution */}
            {projectionData.probability_distribution && (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30 text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {Math.round(projectionData.probability_distribution.success_probability * 100)}%
                  </p>
                  <p className="text-xs text-slate-400">Sucesso</p>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30 text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    {Math.round(projectionData.probability_distribution.partial_success * 100)}%
                  </p>
                  <p className="text-xs text-slate-400">Sucesso Parcial</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30 text-center">
                  <p className="text-2xl font-bold text-red-400">
                    {Math.round(projectionData.probability_distribution.failure_probability * 100)}%
                  </p>
                  <p className="text-xs text-slate-400">Falha</p>
                </div>
              </div>
            )}

            {/* Inflection Points */}
            {projectionData.inflection_points?.length > 0 && (
              <div>
                <h4 className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Pontos de Inflexão
                </h4>
                <div className="space-y-2">
                  {projectionData.inflection_points.map((point, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg flex items-center gap-3">
                      <Badge className="bg-blue-500/20 text-blue-400">Dia {point.day}</Badge>
                      <span className="text-white flex-1">{point.event}</span>
                      <span className="text-sm text-slate-400">{point.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Early Warning Signals */}
            {projectionData.early_warning_signals?.length > 0 && (
              <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                <h4 className="text-sm text-orange-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Sinais de Alerta Antecipado
                </h4>
                <ul className="space-y-1">
                  {projectionData.early_warning_signals.map((signal, idx) => (
                    <li key={idx} className="text-sm text-white flex items-start gap-2">
                      <span className="text-orange-400">•</span>
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Monitoring Focus */}
            {projectionData.recommended_monitoring_focus && (
              <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                <h4 className="text-sm text-cyan-400 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Foco de Monitoramento Recomendado
                </h4>
                <p className="text-white text-sm">{projectionData.recommended_monitoring_focus}</p>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}