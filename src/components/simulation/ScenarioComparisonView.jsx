import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  GitBranch, BarChart3, TrendingUp, TrendingDown, Target,
  CheckCircle, XCircle, ArrowRight, Trash2
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * SCENARIO COMPARISON VIEW
 * Compare multiple saved simulation scenarios side-by-side
 */

export default function ScenarioComparisonView({ scenarios, onDeleteScenario }) {
  const [selectedScenarios, setSelectedScenarios] = useState(
    scenarios.slice(0, 2).map(s => s.id)
  );

  const selectedData = scenarios.filter(s => selectedScenarios.includes(s.id));

  const getActionColor = (action) => {
    switch (action) {
      case 'proceed': return 'emerald';
      case 'proceed_with_caution': return 'amber';
      case 'defer': return 'blue';
      case 'abort': return 'red';
      default: return 'slate';
    }
  };

  const comparisonMetrics = [
    { key: 'viability_score', label: 'Viabilidade', unit: '%', path: 'simulation_summary.viability_score' },
    { key: 'confidence_level', label: 'Confiança', unit: '%', path: 'simulation_summary.confidence_level' },
    { key: 'success_rate', label: 'Taxa de Sucesso MC', unit: '%', path: 'monte_carlo_summary.success_rate' },
    { key: 'risk_adjusted_return', label: 'Retorno Ajustado', unit: '%', path: 'risk_reward_analysis.risk_adjusted_return' },
    { key: 'downside_risk', label: 'Risco Downside', unit: '%', path: 'risk_reward_analysis.downside_risk' },
    { key: 'upside_potential', label: 'Potencial Upside', unit: '%', path: 'risk_reward_analysis.upside_potential' },
  ];

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  const getBetterIndicator = (metric, values) => {
    if (values.some(v => v === undefined || v === null)) return null;
    
    const isHigherBetter = !metric.key.includes('risk') && !metric.key.includes('downside');
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    
    return isHigherBetter ? values.indexOf(maxVal) : values.indexOf(minVal);
  };

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            Selecionar Cenários para Comparação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1].map((index) => (
              <Select
                key={index}
                value={selectedScenarios[index]?.toString()}
                onValueChange={(val) => {
                  const newSelected = [...selectedScenarios];
                  newSelected[index] = parseInt(val);
                  setSelectedScenarios(newSelected);
                }}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder={`Selecionar cenário ${index + 1}`} />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id.toString()}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Comparison */}
      {selectedData.length >= 2 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-6">
            {selectedData.map((scenario, idx) => {
              const summary = scenario.results.simulation_summary;
              const color = getActionColor(summary?.recommended_action);
              
              return (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={`bg-${color}-500/10 border-${color}-500/30`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white">{scenario.name}</h3>
                          <Badge className={`bg-${color}-500/20 text-${color}-400 mt-1`}>
                            {summary?.recommended_action}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">{summary?.viability_score}%</p>
                          <p className="text-xs text-slate-500">Viabilidade</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300">{summary?.executive_summary}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Metrics Comparison Table */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Comparação de Métricas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparisonMetrics.map((metric, mIdx) => {
                  const values = selectedData.map(s => getNestedValue(s.results, metric.path));
                  const betterIndex = getBetterIndicator(metric, values);

                  return (
                    <div key={metric.key} className="grid grid-cols-3 gap-4 p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-sm text-slate-400">{metric.label}</span>
                      </div>
                      {values.map((value, vIdx) => (
                        <div 
                          key={vIdx}
                          className={`text-center p-2 rounded ${
                            betterIndex === vIdx ? 'bg-emerald-500/20 border border-emerald-500/30' : ''
                          }`}
                        >
                          <p className={`text-lg font-bold ${
                            betterIndex === vIdx ? 'text-emerald-400' : 'text-white'
                          }`}>
                            {value ?? '-'}{value !== undefined && metric.unit}
                          </p>
                          {betterIndex === vIdx && (
                            <CheckCircle className="w-3 h-3 text-emerald-400 mx-auto mt-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Outcome Projections Comparison */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Comparação de Projeções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {['best_case', 'base_case', 'worst_case'].map(caseType => {
                  const labels = {
                    best_case: { label: 'Melhor Cenário', color: 'emerald', icon: TrendingUp },
                    base_case: { label: 'Cenário Base', color: 'blue', icon: Target },
                    worst_case: { label: 'Pior Cenário', color: 'red', icon: TrendingDown }
                  };
                  const { label, color, icon: Icon } = labels[caseType];

                  return (
                    <div key={caseType}>
                      <div className={`flex items-center gap-2 mb-3 text-${color}-400`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <div className="space-y-2">
                        {selectedData.map((scenario, idx) => {
                          const projection = scenario.results.outcome_projections?.[caseType];
                          return (
                            <div key={idx} className={`p-3 bg-${color}-500/10 rounded border border-${color}-500/20`}>
                              <p className="text-xs text-slate-500 mb-1">{scenario.name}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-white font-bold">{projection?.roi || '-'}</span>
                                <Badge className={`bg-${color}-500/20 text-${color}-400 text-xs`}>
                                  {projection?.probability}%
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{projection?.timeline}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Risk Comparison */}
          <div className="grid grid-cols-2 gap-6">
            {selectedData.map((scenario, idx) => (
              <Card key={scenario.id} className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">{scenario.name} - Riscos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scenario.results.risk_reward_analysis?.risk_factors?.slice(0, 3).map((risk, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-red-500/10 rounded">
                        <span className="text-sm text-slate-300">{risk.factor}</span>
                        <Badge className={`text-xs ${
                          risk.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                          risk.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {risk.probability}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottleneck Comparison */}
          <div className="grid grid-cols-2 gap-6">
            {selectedData.map((scenario, idx) => (
              <Card key={scenario.id} className="bg-amber-500/10 border-amber-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-400 text-sm">
                    {scenario.name} - Gargalos ({scenario.results.bottleneck_analysis?.critical_bottlenecks?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scenario.results.bottleneck_analysis?.critical_bottlenecks?.slice(0, 3).map((bn, i) => (
                      <div key={i} className="p-2 bg-white/5 rounded">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            bn.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            bn.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {bn.severity}
                          </Badge>
                          <span className="text-sm text-white">{bn.bottleneck}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Winner Summary */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Análise Comparativa</h3>
              {(() => {
                const scores = selectedData.map(s => s.results.simulation_summary?.viability_score || 0);
                const winnerIdx = scores.indexOf(Math.max(...scores));
                const winner = selectedData[winnerIdx];
                
                return (
                  <div>
                    <p className="text-slate-400 mb-4">
                      Baseado na análise de viabilidade, riscos e projeções:
                    </p>
                    <div className="inline-flex items-center gap-3 p-4 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                      <div className="text-left">
                        <p className="text-lg font-bold text-white">{winner.name}</p>
                        <p className="text-sm text-emerald-400">
                          Viabilidade: {winner.results.simulation_summary?.viability_score}% • 
                          MC Success: {winner.results.monte_carlo_summary?.success_rate}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}