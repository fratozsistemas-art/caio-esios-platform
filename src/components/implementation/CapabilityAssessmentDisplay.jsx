import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function CapabilityAssessmentDisplay({ assessment }) {
  if (!assessment) return null;

  const getStatusIcon = (maturity) => {
    if (maturity >= 4) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (maturity >= 2) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  const getStatusColor = (maturity) => {
    if (maturity >= 4) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (maturity >= 2) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Overall Readiness */}
      <Card className="bg-gradient-to-br from-[#00D4FF]/10 to-[#8B5CF6]/10 border-[#00D4FF]/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Platform Readiness Assessment</span>
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF]">
              {assessment.readiness_score}% Ready
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Overall Confidence</p>
              <p className="text-3xl font-bold text-white">{assessment.overall_confidence}%</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Risk Level</p>
              <Badge className={
                assessment.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
                assessment.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }>
                {assessment.risk_level.toUpperCase()}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Version</p>
              <p className="text-xl font-bold text-[#00D4FF]">{assessment.version}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities Matrix */}
      <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
        <CardHeader>
          <CardTitle className="text-white">Implemented Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(assessment.capabilities).map(([key, capability]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 rounded-lg bg-[#0A2540] border border-[#00D4FF]/10"
            >
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(capability.maturity)}
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{key.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="text-[#94A3B8] text-xs">{capability.evidence}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={(capability.maturity / 5) * 100} className="w-24 h-2" />
                <Badge className={getStatusColor(capability.maturity)}>
                  {capability.maturity}/5
                </Badge>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Gap Analysis */}
      {assessment.gaps && Object.keys(assessment.gaps).length > 0 && (
        <Card className="bg-red-500/5 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Critical Gaps Identified
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(assessment.gaps).map(([key, gap]) => (
              <div 
                key={key}
                className="flex items-start justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{key.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="text-red-300 text-xs mt-1">{gap.description}</p>
                </div>
                <Badge className={
                  gap.priority === 'high' ? 'bg-red-500/30 text-red-300' :
                  gap.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-blue-500/30 text-blue-300'
                }>
                  {gap.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Metrics Dashboard */}
      <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00D4FF]" />
            Platform Metrics Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(assessment.metrics).slice(0, 12).map(([key, value]) => (
              <div key={key} className="p-3 bg-[#0A2540] rounded-lg">
                <p className="text-[#94A3B8] text-xs mb-1">{key.replace(/_/g, ' ')}</p>
                <p className="text-white text-xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}