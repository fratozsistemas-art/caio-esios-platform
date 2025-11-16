import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, Pause, Play, SkipForward, AlertTriangle, 
  CheckCircle2, Clock, Zap, X
} from "lucide-react";
import SubTeamProgressCard from "./SubTeamProgressCard";
import AgentCommunicationTrace from "./AgentCommunicationTrace";
import InterventionPanel from "./InterventionPanel";
import { motion, AnimatePresence } from "framer-motion";

export default function OrchestrationDashboard({ 
  orchestrationData, 
  isActive,
  onClose,
  onIntervene
}) {
  const [expandedSubTeam, setExpandedSubTeam] = useState(null);
  const [showIntervention, setShowIntervention] = useState(false);

  if (!orchestrationData || !isActive) return null;

  const { 
    intent, 
    agents_used = [], 
    sub_teams = [], 
    execution_mode,
    replanning_events = 0,
    total_steps = 0,
    knowledge_entities_used = 0,
    memories_retrieved = 0
  } = orchestrationData;

  const completedSteps = agents_used.filter(a => a.completed).length;
  const progress = total_steps > 0 ? (completedSteps / total_steps) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <Card className="bg-slate-900 border-purple-500/30 shadow-2xl">
          <CardHeader className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">
                    Advanced Orchestration Dashboard
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time agent collaboration monitoring
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/20 text-purple-400">
                  {execution_mode}
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white">
                  {completedSteps}/{total_steps} steps
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Overall Progress</span>
                <span className="text-xs text-white font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid grid-cols-3 gap-0 border-b border-white/10">
              {/* Quick Stats */}
              <div className="p-4 border-r border-white/10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Intent</span>
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                      {intent?.primary_intent}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Complexity</span>
                    <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                      {intent?.complexity}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Agents</span>
                    <span className="text-white font-semibold">{agents_used.length}</span>
                  </div>
                  {sub_teams.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Sub-Teams</span>
                      <span className="text-white font-semibold">{sub_teams.length}</span>
                    </div>
                  )}
                  {replanning_events > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Replanned</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                        {replanning_events}x
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Context Stats */}
              <div className="p-4 border-r border-white/10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">KG Entities</span>
                    <span className="text-white font-semibold">{knowledge_entities_used}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Memories</span>
                    <span className="text-white font-semibold">{memories_retrieved}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Frameworks</span>
                    <span className="text-white font-semibold">
                      {intent?.frameworks_needed?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Modules</span>
                    <span className="text-white font-semibold">
                      {intent?.modules_needed?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Intervention Controls */}
              <div className="p-4">
                <Button
                  onClick={() => setShowIntervention(!showIntervention)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  size="sm"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Intervene
                </Button>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Pause, adjust, or redirect execution
                </p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="max-h-[60vh] overflow-y-auto">
              {/* Sub-Teams Section */}
              {sub_teams.length > 0 && (
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Parallel Sub-Teams
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {sub_teams.map((subTeam, idx) => (
                      <SubTeamProgressCard
                        key={idx}
                        subTeam={subTeam}
                        isExpanded={expandedSubTeam === idx}
                        onToggle={() => setExpandedSubTeam(expandedSubTeam === idx ? null : idx)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Agent Communication Trace */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-3">Agent Communication Flow</h3>
                <AgentCommunicationTrace 
                  agents={agents_used}
                  executionMode={execution_mode}
                />
              </div>

              {/* Intervention Panel */}
              <AnimatePresence>
                {showIntervention && (
                  <InterventionPanel
                    orchestrationData={orchestrationData}
                    onIntervene={onIntervene}
                    onClose={() => setShowIntervention(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}