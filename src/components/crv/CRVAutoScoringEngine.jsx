import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Shield, TrendingUp, AlertTriangle, CheckCircle2, RefreshCw,
  Target, Zap, BarChart3, Eye, Brain, Sparkles, Info,
  ThumbsUp, ThumbsDown, Minus
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

/**
 * CRV Auto-Scoring Engine
 * Automatiza o cálculo de Confidence, Risk e Value para análises e decisões
 * 
 * C - Confidence (0-100): Confiança na análise/recomendação
 * R - Risk (0-100): Nível de risco associado
 * V - Value (0-100): Valor potencial/impacto
 */

const CRV_THRESHOLDS = {
  confidence: { low: 40, medium: 70, high: 85 },
  risk: { low: 30, medium: 60, high: 80 },
  value: { low: 40, medium: 70, high: 85 }
};

const getScoreLevel = (score, type) => {
  const thresholds = CRV_THRESHOLDS[type];
  if (score >= thresholds.high) return { level: 'high', color: type === 'risk' ? 'red' : 'green' };
  if (score >= thresholds.medium) return { level: 'medium', color: 'yellow' };
  return { level: 'low', color: type === 'risk' ? 'green' : 'red' };
};

const getScoreIcon = (type, level) => {
  if (type === 'risk') {
    if (level === 'high') return <AlertTriangle className="w-5 h-5 text-red-400" />;
    if (level === 'medium') return <Minus className="w-5 h-5 text-yellow-400" />;
    return <CheckCircle2 className="w-5 h-5 text-green-400" />;
  }
  if (level === 'high') return <ThumbsUp className="w-5 h-5 text-green-400" />;
  if (level === 'medium') return <Minus className="w-5 h-5 text-yellow-400" />;
  return <ThumbsDown className="w-5 h-5 text-red-400" />;
};

export default function CRVAutoScoringEngine({ 
  contentToScore,
  contentType = 'analysis',
  onScoreGenerated,
  autoScore = false
}) {
  const [inputContent, setInputContent] = useState(contentToScore || "");
  const [additionalContext, setAdditionalContext] = useState("");
  const [isScoring, setIsScoring] = useState(false);
  const [crvScore, setCrvScore] = useState(null);
  const queryClient = useQueryClient();

  // Auto-score when content changes (if enabled)
  useEffect(() => {
    if (autoScore && contentToScore && contentToScore !== inputContent) {
      setInputContent(contentToScore);
      // Debounce auto-scoring
      const timer = setTimeout(() => {
        generateCRVScore();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [contentToScore, autoScore]);

  const generateCRVScore = async () => {
    if (!inputContent.trim()) {
      toast.error("Insira o conteúdo para scoring");
      return;
    }

    setIsScoring(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the CRV (Confidence-Risk-Value) Auto-Scoring Engine for the CAIO.AI platform.

Analyze the following ${contentType} and generate CRV scores:

CONTENT TO SCORE:
"${inputContent}"

${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ''}

SCORING CRITERIA:

**CONFIDENCE (C) - 0 to 100**
Evaluate based on:
- Data quality and completeness
- Source reliability
- Analytical rigor
- Assumption validity
- Historical accuracy of similar analyses

**RISK (R) - 0 to 100**
Evaluate based on:
- Execution risk
- Market/external risk
- Resource/capability risk
- Timeline risk
- Stakeholder/political risk
- Downside potential

**VALUE (V) - 0 to 100**
Evaluate based on:
- Strategic impact
- Financial potential (ROI)
- Competitive advantage
- Scalability
- Long-term sustainability

Return JSON:
{
  "scores": {
    "confidence": {
      "score": 0-100,
      "level": "low|medium|high",
      "factors": [
        {
          "factor": "factor name",
          "impact": "positive|negative|neutral",
          "weight": 0-100,
          "explanation": "why this affects confidence"
        }
      ],
      "main_driver": "what most influences this score",
      "improvement_suggestions": ["how to increase confidence"]
    },
    "risk": {
      "score": 0-100,
      "level": "low|medium|high",
      "factors": [
        {
          "factor": "risk factor name",
          "severity": "low|medium|high|critical",
          "probability": 0-100,
          "explanation": "what this risk entails"
        }
      ],
      "main_risks": ["top 2-3 risks"],
      "mitigation_suggestions": ["how to reduce risk"]
    },
    "value": {
      "score": 0-100,
      "level": "low|medium|high",
      "factors": [
        {
          "factor": "value factor name",
          "potential": "low|medium|high|transformational",
          "timeframe": "short|medium|long term",
          "explanation": "how this creates value"
        }
      ],
      "main_value_drivers": ["what creates most value"],
      "value_enhancement_suggestions": ["how to increase value"]
    }
  },
  "composite_assessment": {
    "overall_recommendation": "proceed|proceed_with_caution|reconsider|do_not_proceed",
    "recommendation_rationale": "why this recommendation",
    "crv_balance_analysis": "how C, R, V interact",
    "decision_confidence": 0-100,
    "key_considerations": ["consideration1", "consideration2"]
  },
  "scoring_metadata": {
    "content_type": "${contentType}",
    "analysis_depth": "surface|moderate|deep",
    "data_sufficiency": "insufficient|adequate|comprehensive",
    "scoring_caveats": ["any limitations or caveats"]
  }
}`,
        response_json_schema: {
          type: "object",
          properties: {
            scores: { type: "object" },
            composite_assessment: { type: "object" },
            scoring_metadata: { type: "object" }
          }
        }
      });

      setCrvScore(result);
      onScoreGenerated?.(result);
      toast.success("CRV Score gerado com sucesso");
    } catch (error) {
      console.error("CRV scoring error:", error);
      toast.error("Erro ao gerar CRV Score");
    } finally {
      setIsScoring(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[color] || colors.blue;
  };

  const getRecommendationStyle = (rec) => {
    const styles = {
      proceed: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle2 },
      proceed_with_caution: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: AlertTriangle },
      reconsider: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', icon: Eye },
      do_not_proceed: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: ThumbsDown }
    };
    return styles[rec] || styles.proceed_with_caution;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl">CRV Auto-Scoring Engine</span>
              <p className="text-sm text-slate-400 font-normal">
                Confidence · Risk · Value — Scoring Automatizado
              </p>
            </div>
            <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              v12.5
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Input Section */}
      {!autoScore && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Conteúdo para Scoring (Análise, Decisão, Estratégia)
              </label>
              <Textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Cole aqui a análise, recomendação ou decisão que precisa de scoring CRV..."
                className="bg-white/5 border-white/10 text-white min-h-32"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Contexto Adicional (opcional)
              </label>
              <Input
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Ex: setor, empresa, timeline, stakeholders..."
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <Button
              onClick={generateCRVScore}
              disabled={isScoring || !inputContent.trim()}
              className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
            >
              {isScoring ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Calculando CRV Score...</>
              ) : (
                <><BarChart3 className="w-4 h-4 mr-2" />Gerar CRV Score</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* CRV Results */}
      {crvScore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Scores */}
          <div className="grid grid-cols-3 gap-4">
            {/* Confidence */}
            <Card className={`${getColorClasses(getScoreLevel(crvScore.scores?.confidence?.score, 'confidence').color)} border`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-bold">Confidence</span>
                  </div>
                  {getScoreIcon('confidence', crvScore.scores?.confidence?.level)}
                </div>
                <div className="text-4xl font-bold mb-2">{crvScore.scores?.confidence?.score}</div>
                <Progress value={crvScore.scores?.confidence?.score} className="h-2 mb-2" />
                <p className="text-xs opacity-80">{crvScore.scores?.confidence?.main_driver}</p>
              </CardContent>
            </Card>

            {/* Risk */}
            <Card className={`${getColorClasses(getScoreLevel(crvScore.scores?.risk?.score, 'risk').color)} border`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-bold">Risk</span>
                  </div>
                  {getScoreIcon('risk', crvScore.scores?.risk?.level)}
                </div>
                <div className="text-4xl font-bold mb-2">{crvScore.scores?.risk?.score}</div>
                <Progress value={crvScore.scores?.risk?.score} className="h-2 mb-2" />
                <p className="text-xs opacity-80">{crvScore.scores?.risk?.main_risks?.[0]}</p>
              </CardContent>
            </Card>

            {/* Value */}
            <Card className={`${getColorClasses(getScoreLevel(crvScore.scores?.value?.score, 'value').color)} border`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-bold">Value</span>
                  </div>
                  {getScoreIcon('value', crvScore.scores?.value?.level)}
                </div>
                <div className="text-4xl font-bold mb-2">{crvScore.scores?.value?.score}</div>
                <Progress value={crvScore.scores?.value?.score} className="h-2 mb-2" />
                <p className="text-xs opacity-80">{crvScore.scores?.value?.main_value_drivers?.[0]}</p>
              </CardContent>
            </Card>
          </div>

          {/* Composite Assessment */}
          {crvScore.composite_assessment && (
            <Card className={`${getRecommendationStyle(crvScore.composite_assessment.overall_recommendation).bg} ${getRecommendationStyle(crvScore.composite_assessment.overall_recommendation).border} border`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {React.createElement(getRecommendationStyle(crvScore.composite_assessment.overall_recommendation).icon, {
                    className: `w-6 h-6 ${getRecommendationStyle(crvScore.composite_assessment.overall_recommendation).text}`
                  })}
                  <div>
                    <p className={`font-bold text-lg ${getRecommendationStyle(crvScore.composite_assessment.overall_recommendation).text}`}>
                      {crvScore.composite_assessment.overall_recommendation?.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-sm text-slate-300">
                      Confiança na Decisão: {crvScore.composite_assessment.decision_confidence}%
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-3">
                  {crvScore.composite_assessment.recommendation_rationale}
                </p>
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-xs text-slate-400 mb-1">Análise de Balanço CRV:</p>
                  <p className="text-sm text-white">{crvScore.composite_assessment.crv_balance_analysis}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Factors */}
          <div className="grid grid-cols-3 gap-4">
            {/* Confidence Factors */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Fatores de Confiança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {crvScore.scores?.confidence?.factors?.map((f, i) => (
                  <div key={i} className="p-2 bg-white/5 rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{f.factor}</span>
                      <Badge className={`text-xs ${
                        f.impact === 'positive' ? 'bg-green-500/20 text-green-400' :
                        f.impact === 'negative' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {f.impact}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Fatores de Risco
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {crvScore.scores?.risk?.factors?.map((f, i) => (
                  <div key={i} className="p-2 bg-white/5 rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{f.factor}</span>
                      <Badge className={`text-xs ${
                        f.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        f.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        f.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {f.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Value Factors */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Fatores de Valor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {crvScore.scores?.value?.factors?.map((f, i) => (
                  <div key={i} className="p-2 bg-white/5 rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{f.factor}</span>
                      <Badge className={`text-xs ${
                        f.potential === 'transformational' ? 'bg-purple-500/20 text-purple-400' :
                        f.potential === 'high' ? 'bg-green-500/20 text-green-400' :
                        f.potential === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {f.potential}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Metadata */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-400">Metadados do Scoring</span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-slate-500">Tipo de Conteúdo</p>
                  <p className="text-white mt-1">{crvScore.scoring_metadata?.content_type}</p>
                </div>
                <div>
                  <p className="text-slate-500">Profundidade</p>
                  <p className="text-white mt-1">{crvScore.scoring_metadata?.analysis_depth}</p>
                </div>
                <div>
                  <p className="text-slate-500">Suficiência de Dados</p>
                  <p className="text-white mt-1">{crvScore.scoring_metadata?.data_sufficiency}</p>
                </div>
                <div>
                  <p className="text-slate-500">Ressalvas</p>
                  <p className="text-white mt-1">{crvScore.scoring_metadata?.scoring_caveats?.[0] || 'Nenhuma'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}