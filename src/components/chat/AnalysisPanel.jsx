import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  TrendingUp, AlertTriangle, Shield, Target, FileText, 
  Loader2, Brain, Network, Sparkles, ArrowRight, Clock
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ANALYSIS_TYPES = [
  {
    type: 'trends',
    title: 'Trend Detection',
    description: 'Identify patterns and recurring themes',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    type: 'anomalies',
    title: 'Anomaly Detection',
    description: 'Find unusual patterns and outliers',
    icon: AlertTriangle,
    color: 'from-orange-500 to-red-500'
  },
  {
    type: 'risk_assessment',
    title: 'Risk Assessment',
    description: 'Evaluate potential risks and mitigation',
    icon: Shield,
    color: 'from-red-500 to-pink-500'
  },
  {
    type: 'opportunity_scouting',
    title: 'Opportunity Scouting',
    description: 'Discover strategic opportunities',
    icon: Target,
    color: 'from-green-500 to-emerald-500'
  },
  {
    type: 'executive_summary',
    title: 'Executive Summary',
    description: 'Generate comprehensive overview',
    icon: FileText,
    color: 'from-purple-500 to-pink-500'
  }
];

const IMPACT_COLORS = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  critical: 'bg-red-600/20 text-red-400 border-red-600/30'
};

export default function AnalysisPanel({ conversationId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCorrelating, setIsCorrelating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [correlationResult, setCorrelationResult] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const handleAnalyze = async (type) => {
    setSelectedType(type);
    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('analyzeConversationPatterns', {
        conversation_id: conversationId,
        analysis_type: type
      });

      if (response.data?.success) {
        setAnalysisResult(response.data.analysis);
        toast.success('Analysis complete!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCorrelate = async () => {
    setIsCorrelating(true);
    try {
      const response = await base44.functions.invoke('correlateWithKnowledgeGraph', {
        conversation_id: conversationId
      });

      if (response.data?.success) {
        setCorrelationResult(response.data.correlation);
        toast.success('Knowledge graph correlation complete!');
      }
    } catch (error) {
      console.error('Correlation error:', error);
      toast.error('Correlation failed');
    } finally {
      setIsCorrelating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 text-white hover:bg-white/10"
        >
          <Brain className="w-4 h-4 mr-2" />
          AI Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            AI-Powered Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Analysis Types */}
          <div>
            <h3 className="text-white font-semibold mb-3">Select Analysis Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ANALYSIS_TYPES.map((analysis) => {
                const Icon = analysis.icon;
                const isSelected = selectedType === analysis.type;
                
                return (
                  <button
                    key={analysis.type}
                    onClick={() => handleAnalyze(analysis.type)}
                    disabled={isAnalyzing}
                    className={`text-left bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all ${
                      isSelected ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${analysis.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">{analysis.title}</div>
                        <div className="text-xs text-slate-400">{analysis.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Knowledge Graph Correlation */}
          <div>
            <Button
              onClick={handleCorrelate}
              disabled={isCorrelating}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isCorrelating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Correlating...
                </>
              ) : (
                <>
                  <Network className="w-4 h-4 mr-2" />
                  Correlate with Knowledge Graph
                </>
              )}
            </Button>
          </div>

          {/* Loading State */}
          {isAnalyzing && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <span className="ml-3 text-slate-400">Analyzing conversation patterns...</span>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Executive Summary */}
              {analysisResult.executive_summary && (
                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">{analysisResult.executive_summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Key Insights */}
              {analysisResult.key_insights?.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysisResult.key_insights.map((insight, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-medium">{insight.title}</h4>
                          <Badge className={IMPACT_COLORS[insight.impact]}>{insight.impact}</Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{insight.description}</p>
                        {insight.evidence && (
                          <div className="text-xs text-slate-500 italic">Evidence: {insight.evidence}</div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Patterns */}
              {analysisResult.patterns_detected?.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Patterns Detected</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysisResult.patterns_detected.map((pattern, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                        <div>
                          <div className="text-white font-medium">{pattern.pattern_name}</div>
                          <div className="text-xs text-slate-400">{pattern.significance}</div>
                        </div>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                          {pattern.trend_direction}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {analysisResult.recommendations?.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysisResult.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-medium">{rec.title}</h4>
                          <Badge className={IMPACT_COLORS[rec.priority]}>{rec.priority}</Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{rec.description}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {rec.timeframe}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Correlation Results */}
          {correlationResult && !isCorrelating && correlationResult.has_graph_data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    Knowledge Graph Correlation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Entities Mentioned */}
                  {correlationResult.entities_mentioned?.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Entities Referenced</h4>
                      <div className="flex flex-wrap gap-2">
                        {correlationResult.entities_mentioned.map((entity, idx) => (
                          <Badge
                            key={idx}
                            className={entity.in_graph ? 
                              'bg-green-500/20 text-green-400 border-green-500/30' : 
                              'bg-orange-500/20 text-orange-400 border-orange-500/30'
                            }
                          >
                            {entity.entity_name}
                            {!entity.in_graph && ' (not in graph)'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strategic Correlations */}
                  {correlationResult.strategic_correlations?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Strategic Insights</h4>
                      {correlationResult.strategic_correlations.map((corr, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-3">
                          <p className="text-sm text-slate-300">{corr.insight}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}