import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GitMerge, Zap, CheckCircle, Clock, AlertCircle, 
  TrendingUp, Brain, Network, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AgentOrchestrationPanel({ orchestrationData }) {
  const [expanded, setExpanded] = useState(false);

  if (!orchestrationData) return null;

  const { intent, agents_used, execution_mode, total_steps } = orchestrationData;

  const getModeColor = (mode) => {
    switch (mode) {
      case 'parallel': return 'bg-blue-500/20 text-blue-400';
      case 'sequential': return 'bg-purple-500/20 text-purple-400';
      case 'hybrid': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'simple': return 'bg-green-500/20 text-green-400';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400';
      case 'complex': return 'bg-orange-500/20 text-orange-400';
      case 'multi_phase': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-purple-400" />
            Agent Orchestration
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getModeColor(execution_mode)}>
              {execution_mode}
            </Badge>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent className="space-y-4 pt-0">
              {/* Intent Analysis */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <h4 className="text-xs text-slate-400 mb-2">Intent Classification</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {intent.primary_intent}
                  </Badge>
                  <Badge className={getComplexityColor(intent.complexity)}>
                    {intent.complexity}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-slate-300">
                    {intent.stakeholder_level}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-slate-300">
                    {intent.time_horizon}
                  </Badge>
                </div>
              </div>

              {/* Frameworks & Modules */}
              {(intent.frameworks_needed?.length > 0 || intent.modules_needed?.length > 0) && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <h4 className="text-xs text-slate-400 mb-2">Activated Frameworks</h4>
                  <div className="flex flex-wrap gap-2">
                    {intent.frameworks_needed?.map((fw, idx) => (
                      <Badge key={idx} className="bg-purple-500/20 text-purple-400 text-xs">
                        {fw}
                      </Badge>
                    ))}
                    {intent.modules_needed?.map((mod, idx) => (
                      <Badge key={idx} className="bg-green-500/20 text-green-400 text-xs">
                        {mod}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Agents Pipeline */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <h4 className="text-xs text-slate-400 mb-2">Agent Pipeline ({total_steps} steps)</h4>
                <div className="space-y-2">
                  {agents_used.map((agent, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-white flex-1">{agent}</span>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/5 rounded p-2 text-center border border-white/10">
                  <p className="text-slate-400">Agents</p>
                  <p className="text-white font-bold">{total_steps}</p>
                </div>
                <div className="bg-white/5 rounded p-2 text-center border border-white/10">
                  <p className="text-slate-400">Mode</p>
                  <p className="text-white font-bold capitalize">{execution_mode}</p>
                </div>
                <div className="bg-white/5 rounded p-2 text-center border border-white/10">
                  <p className="text-slate-400">Confidence</p>
                  <p className="text-white font-bold">{intent.confidence}%</p>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}