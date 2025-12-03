import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp, TrendingDown, Target, CheckCircle, AlertTriangle,
  Clock, DollarSign, ArrowRight, Lightbulb, BarChart3, Zap
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * SIMULATION RESULTS PANEL
 * Displays comprehensive simulation outcomes
 */

export default function SimulationResultsPanel({ results }) {
  const { simulation_summary, outcome_projections, risk_reward_analysis, implementation_roadmap, strategic_recommendations, monte_carlo_summary } = results;

  const getActionColor = (action) => {
    switch (action) {
      case 'proceed': return 'emerald';
      case 'proceed_with_caution': return 'amber';
      case 'defer': return 'blue';
      case 'abort': return 'red';
      default: return 'slate';
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'proceed': return 'Prosseguir';
      case 'proceed_with_caution': return 'Prosseguir com Cautela';
      case 'defer': return 'Adiar';
      case 'abort': return 'Abortar';
      default: return action;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`bg-gradient-to-r from-${getActionColor(simulation_summary?.recommended_action)}-500/20 to-transparent border-${getActionColor(simulation_summary?.recommended_action)}-500/30`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">{simulation_summary?.scenario_name}</h3>
                <p className="text-slate-300 mb-4">{simulation_summary?.executive_summary}</p>
                <Badge className={`bg-${getActionColor(simulation_summary?.recommended_action)}-500/20 text-${getActionColor(simulation_summary?.recommended_action)}-400 text-sm px-4 py-1`}>
                  Recomendação: {getActionLabel(simulation_summary?.recommended_action)}
                </Badge>
              </div>
              <div className="text-right space-y-2">
                <div>
                  <p className="text-xs text-slate-500">Viabilidade</p>
                  <p className="text-3xl font-bold text-white">{simulation_summary?.viability_score}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Confiança</p>
                  <p className="text-xl font-bold text-slate-400">{simulation_summary?.confidence_level}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Outcome Projections */}
      <div className="grid grid-cols-3 gap-4">
        {/* Best Case */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-emerald-500/10 border-emerald-500/30 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-400 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Melhor Cenário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Probabilidade</span>
                <Badge className="bg-emerald-500/20 text-emerald-400">{outcome_projections?.best_case?.probability}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">ROI</span>
                <span className="text-emerald-400 font-bold">{outcome_projections?.best_case?.roi}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Timeline</span>
                <span className="text-white">{outcome_projections?.best_case?.timeline}</span>
              </div>
              <p className="text-xs text-slate-300 pt-2 border-t border-emerald-500/20">
                {outcome_projections?.best_case?.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Base Case */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-blue-500/10 border-blue-500/30 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Cenário Base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Probabilidade</span>
                <Badge className="bg-blue-500/20 text-blue-400">{outcome_projections?.base_case?.probability}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">ROI</span>
                <span className="text-blue-400 font-bold">{outcome_projections?.base_case?.roi}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Timeline</span>
                <span className="text-white">{outcome_projections?.base_case?.timeline}</span>
              </div>
              <p className="text-xs text-slate-300 pt-2 border-t border-blue-500/20">
                {outcome_projections?.base_case?.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Worst Case */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-red-500/10 border-red-500/30 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Pior Cenário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Probabilidade</span>
                <Badge className="bg-red-500/20 text-red-400">{outcome_projections?.worst_case?.probability}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">ROI</span>
                <span className="text-red-400 font-bold">{outcome_projections?.worst_case?.roi}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Timeline</span>
                <span className="text-white">{outcome_projections?.worst_case?.timeline}</span>
              </div>
              <p className="text-xs text-slate-300 pt-2 border-t border-red-500/20">
                {outcome_projections?.worst_case?.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Risk/Reward Analysis */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Análise Risco/Retorno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-slate-500">Valor Esperado</p>
              <p className="text-lg font-bold text-white">{risk_reward_analysis?.expected_value}</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-slate-500">Retorno Ajustado</p>
              <p className="text-lg font-bold text-emerald-400">{risk_reward_analysis?.risk_adjusted_return}%</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-slate-500">Sharpe Equiv.</p>
              <p className="text-lg font-bold text-blue-400">{risk_reward_analysis?.sharpe_ratio_equivalent}</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-slate-500">Downside Risk</p>
              <p className="text-lg font-bold text-red-400">{risk_reward_analysis?.downside_risk}%</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-slate-500">Upside Potential</p>
              <p className="text-lg font-bold text-emerald-400">{risk_reward_analysis?.upside_potential}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Risk Factors */}
            <div>
              <p className="text-xs text-red-400 font-medium mb-2">Fatores de Risco</p>
              <div className="space-y-2">
                {risk_reward_analysis?.risk_factors?.slice(0, 4).map((risk, i) => (
                  <div key={i} className="p-2 bg-red-500/10 rounded border border-red-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{risk.factor}</span>
                      <Badge className={`text-xs ${
                        risk.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                        risk.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {risk.probability}%
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">→ {risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunity Factors */}
            <div>
              <p className="text-xs text-emerald-400 font-medium mb-2">Fatores de Oportunidade</p>
              <div className="space-y-2">
                {risk_reward_analysis?.opportunity_factors?.slice(0, 4).map((opp, i) => (
                  <div key={i} className="p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{opp.factor}</span>
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                        {opp.probability}%
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">→ {opp.how_to_capture}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monte Carlo Summary */}
      {monte_carlo_summary && (
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Resumo Monte Carlo ({monte_carlo_summary.simulations_run} simulações)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-500">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-purple-400">{monte_carlo_summary.success_rate}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Resultado Mediano</p>
                <p className="text-sm text-white">{monte_carlo_summary.median_outcome}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">P95 (Melhor)</p>
                <p className="text-sm text-emerald-400">{monte_carlo_summary["95th_percentile"]}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">P5 (Pior)</p>
                <p className="text-sm text-red-400">{monte_carlo_summary["5th_percentile"]}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Implementation Roadmap */}
      {implementation_roadmap?.phases && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Roadmap de Implementação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
              <div className="space-y-4">
                {implementation_roadmap.phases.map((phase, i) => (
                  <div key={i} className="relative pl-10">
                    <div className={`absolute left-2 w-4 h-4 rounded-full ${
                      i === 0 ? 'bg-blue-500' : 'bg-white/20'
                    } border-2 border-white/20`} />
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{phase.phase}</h4>
                          <Badge className="bg-blue-500/20 text-blue-400">{phase.duration}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {phase.key_activities?.map((activity, j) => (
                            <Badge key={j} className="bg-white/10 text-slate-400 text-xs">{activity}</Badge>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">Recursos: {phase.resources_required}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategic Recommendations */}
      {strategic_recommendations && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Recomendações Estratégicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strategic_recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className={`p-1 rounded ${
                    rec.priority === 'high' ? 'bg-red-500/20' :
                    rec.priority === 'medium' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                  }`}>
                    <CheckCircle className={`w-4 h-4 ${
                      rec.priority === 'high' ? 'text-red-400' :
                      rec.priority === 'medium' ? 'text-amber-400' : 'text-blue-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{rec.recommendation}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">Timing: {rec.timing}</span>
                      <span className="text-xs text-emerald-400">Impacto: {rec.expected_impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}