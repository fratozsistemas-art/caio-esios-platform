import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, XCircle, CheckCircle, ArrowRight, Target,
  Zap, Clock, Users, DollarSign, TrendingUp, TrendingDown, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * RISK & BOTTLENECK ANALYZER
 * Deep analysis of risks, bottlenecks, and unintended consequences
 */

export default function RiskBottleneckAnalyzer({ results }) {
  const [expandedBottleneck, setExpandedBottleneck] = useState(null);
  const [expandedConsequence, setExpandedConsequence] = useState(null);

  const { bottleneck_analysis, unintended_consequences, sensitivity_analysis } = results;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'amber';
      case 'low': return 'blue';
      default: return 'slate';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return CheckCircle;
      default: return Target;
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Bottlenecks */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Gargalos Críticos
            <Badge className="bg-red-500/20 text-red-400 ml-2">
              {bottleneck_analysis?.critical_bottlenecks?.length || 0} identificados
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bottleneck_analysis?.critical_bottlenecks?.map((bottleneck, i) => {
            const isExpanded = expandedBottleneck === i;
            const SeverityIcon = getSeverityIcon(bottleneck.severity);
            const color = getSeverityColor(bottleneck.severity);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`bg-${color}-500/10 border-${color}-500/20`}>
                  <CardContent className="p-4">
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedBottleneck(isExpanded ? null : i)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
                          <SeverityIcon className={`w-5 h-5 text-${color}-400`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{bottleneck.bottleneck}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`bg-${color}-500/20 text-${color}-400 text-xs`}>
                              {bottleneck.severity}
                            </Badge>
                            <span className="text-xs text-slate-500">Fase: {bottleneck.phase}</span>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                            <div>
                              <p className="text-xs text-red-400 font-medium mb-1">Impacto se não endereçado</p>
                              <p className="text-sm text-slate-300">{bottleneck.impact}</p>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded border border-emerald-500/20">
                              <p className="text-xs text-emerald-400 font-medium mb-1">Resolução Recomendada</p>
                              <p className="text-sm text-white">{bottleneck.resolution}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Resource Constraints */}
      {bottleneck_analysis?.resource_constraints?.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Restrições de Recursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bottleneck_analysis.resource_constraints.map((constraint, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-medium">{constraint.resource}</span>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400">Gap: {constraint.gap}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-slate-500">Capacidade Atual</p>
                      <p className="text-sm text-slate-300">{constraint.current_capacity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Capacidade Necessária</p>
                      <p className="text-sm text-white">{constraint.required_capacity}</p>
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-500/10 rounded">
                    <p className="text-xs text-emerald-400">Solução: {constraint.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dependency Chain */}
      {bottleneck_analysis?.dependency_chain?.length > 0 && (
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Cadeia de Dependências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              {bottleneck_analysis.dependency_chain.map((dep, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Badge className="bg-blue-500/20 text-blue-400">{dep}</Badge>
                  {i < bottleneck_analysis.dependency_chain.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unintended Consequences */}
      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
            <Target className="w-4 h-4" />
            Consequências Não-Intencionais
            <Badge className="bg-purple-500/20 text-purple-400 ml-2">
              {unintended_consequences?.length || 0} detectadas
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {unintended_consequences?.map((consequence, i) => {
            const isExpanded = expandedConsequence === i;
            const isNegative = consequence.type === 'negative';
            const isPositive = consequence.type === 'positive';

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`${
                  isNegative ? 'bg-red-500/10 border-red-500/20' :
                  isPositive ? 'bg-emerald-500/10 border-emerald-500/20' :
                  'bg-slate-500/10 border-slate-500/20'
                }`}>
                  <CardContent className="p-4">
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedConsequence(isExpanded ? null : i)}
                    >
                      <div className="flex items-start gap-3">
                        {isNegative ? (
                          <TrendingDown className="w-5 h-5 text-red-400 mt-0.5" />
                        ) : isPositive ? (
                          <TrendingUp className="w-5 h-5 text-emerald-400 mt-0.5" />
                        ) : (
                          <Target className="w-5 h-5 text-slate-400 mt-0.5" />
                        )}
                        <div>
                          <p className="text-white font-medium">{consequence.consequence}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${
                              isNegative ? 'bg-red-500/20 text-red-400' :
                              isPositive ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {consequence.type}
                            </Badge>
                            <Badge className={`text-xs ${
                              consequence.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                              consequence.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {consequence.severity}
                            </Badge>
                            <span className="text-xs text-slate-500">Probabilidade: {consequence.likelihood}%</span>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Áreas Afetadas</p>
                              <div className="flex flex-wrap gap-1">
                                {consequence.affected_areas?.map((area, j) => (
                                  <Badge key={j} className="bg-white/10 text-slate-400 text-xs">{area}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className={`p-3 rounded ${
                              isNegative ? 'bg-amber-500/10 border border-amber-500/20' :
                              'bg-emerald-500/10 border border-emerald-500/20'
                            }`}>
                              <p className={`text-xs font-medium mb-1 ${
                                isNegative ? 'text-amber-400' : 'text-emerald-400'
                              }`}>
                                {isNegative ? 'Prevenção' : 'Como Potencializar'}
                              </p>
                              <p className="text-sm text-white">{consequence.prevention_or_enhancement}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Sensitivity Analysis */}
      {sensitivity_analysis && (
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Análise de Sensibilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-3">Variáveis Mais Sensíveis</p>
              <div className="space-y-2">
                {sensitivity_analysis.most_sensitive_variables?.map((variable, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{variable.variable}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${
                          variable.impact_direction === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                          variable.impact_direction === 'negative' ? 'bg-red-500/20 text-red-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {variable.impact_direction}
                        </Badge>
                        <span className="text-cyan-400 font-bold">{variable.sensitivity_score}%</span>
                      </div>
                    </div>
                    <Progress value={variable.sensitivity_score} className="h-2" />
                    <p className="text-xs text-slate-500 mt-1">Threshold crítico: {variable.threshold}</p>
                  </div>
                ))}
              </div>
            </div>

            {sensitivity_analysis.scenario_variations?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-3">Variações de Cenário</p>
                <div className="grid grid-cols-2 gap-3">
                  {sensitivity_analysis.scenario_variations.map((variation, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-sm text-white mb-1">{variation.variation}</p>
                      <p className="text-xs text-slate-400">{variation.impact_on_outcome}</p>
                      <Badge className={`mt-2 text-xs ${
                        variation.probability_shift?.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {variation.probability_shift}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}