import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, CheckCircle, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function DocumentAnalysisCard({ analysis }) {
  const severityColors = {
    low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    critical: "bg-red-500/20 text-red-300 border-red-500/30"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <FileText className="w-5 h-5 text-[#00D4FF] mt-1" />
              <div className="flex-1">
                <CardTitle className="text-white text-lg mb-2">{analysis.document_title}</CardTitle>
                <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
                  {analysis.document_type}
                </Badge>
              </div>
            </div>
            {analysis.hermes_validation && (
              <Badge className="bg-[#C7A763]/20 text-[#C7A763] border-[#C7A763]/30">
                Hermes: {analysis.hermes_validation.integrity_score}/100
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          {analysis.summary && (
            <div>
              <h4 className="text-white text-sm font-semibold mb-2">Executive Summary</h4>
              <p className="text-[#94A3B8] text-sm leading-relaxed">{analysis.summary}</p>
            </div>
          )}

          {/* Sentiment */}
          {analysis.sentiment_analysis && (
            <div className="p-3 bg-[#0A2540] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">Sentiment Analysis</span>
                <Badge className="bg-green-500/20 text-green-300">
                  {analysis.sentiment_analysis.overall_sentiment}
                </Badge>
              </div>
              <div className="text-[#94A3B8] text-xs">
                Confidence: {analysis.sentiment_analysis.confidence_level}%
              </div>
            </div>
          )}

          {/* Extracted Entities */}
          {analysis.extracted_entities?.length > 0 && (
            <div>
              <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00D4FF]" />
                Extracted Entities
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.extracted_entities.slice(0, 8).map((entity, idx) => (
                  <Badge 
                    key={idx} 
                    className="bg-[#0A2540] text-[#94A3B8] border-[#00D4FF]/20 text-xs"
                  >
                    {entity.type}: {entity.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Temporal Anomalies */}
          {analysis.temporal_anomalies?.length > 0 && (
            <div>
              <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Temporal Anomalies Detected
              </h4>
              <div className="space-y-2">
                {analysis.temporal_anomalies.map((anomaly, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 bg-[#0A2540] rounded-lg border border-orange-500/20"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <Badge className={severityColors[anomaly.severity]}>
                        {anomaly.severity}
                      </Badge>
                      <p className="text-[#94A3B8] text-xs flex-1">{anomaly.anomaly}</p>
                    </div>
                    <p className="text-[#475569] text-xs mt-2">→ {anomaly.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unverifiable Claims */}
          {analysis.unverifiable_claims?.length > 0 && (
            <div>
              <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Unverifiable Claims
              </h4>
              <div className="space-y-1">
                {analysis.unverifiable_claims.map((claim, idx) => (
                  <div 
                    key={idx} 
                    className="p-2 bg-red-500/10 rounded border border-red-500/20 text-xs text-red-300"
                  >
                    {claim}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {analysis.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-3 border-t border-[#00D4FF]/10">
              {analysis.tags.map((tag, idx) => (
                <Badge key={idx} className="bg-[#00D4FF]/10 text-[#00D4FF] text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}