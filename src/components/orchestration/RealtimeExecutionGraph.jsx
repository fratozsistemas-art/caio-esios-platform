import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, Play, Pause, SkipForward, RefreshCw, Maximize2,
  CheckCircle, Clock, AlertCircle, Loader2, Zap, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AGENT_STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' },
  running: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', animate: true },
  completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
  failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  paused: { icon: Pause, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' }
};

export default function RealtimeExecutionGraph({ execution, workflow, onAgentSelect, onControlAction }) {
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const graphRef = useRef(null);

  useEffect(() => {
    if (autoScroll && graphRef.current && execution?.status === 'running') {
      const runningElement = graphRef.current.querySelector('[data-status="running"]');
      if (runningElement) {
        runningElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [execution, autoScroll]);

  if (!execution || !workflow) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 text-center">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No execution data available</p>
        </CardContent>
      </Card>
    );
  }

  const agentStates = execution.agent_states || {};
  const hierarchicalConfig = workflow.hierarchical_config;

  const renderAgentNode = (agent, level = 0) => {
    const state = agentStates[agent.id] || { status: 'pending' };
    const statusConfig = AGENT_STATUS_CONFIG[state.status] || AGENT_STATUS_CONFIG.pending;
    const Icon = statusConfig.icon;
    const isExpanded = expandedAgent === agent.id;

    return (
      <motion.div
        key={agent.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.1 }}
        style={{ marginLeft: `${level * 24}px` }}
        data-status={state.status}
      >
        <div
          onClick={() => {
            setExpandedAgent(isExpanded ? null : agent.id);
            onAgentSelect?.(agent.id);
          }}
          className={`p-4 rounded-lg mb-3 cursor-pointer transition-all ${
            isExpanded 
              ? `${statusConfig.bg} border-2 ${statusConfig.border}` 
              : 'bg-white/5 border border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg ${statusConfig.bg} ${statusConfig.border} border`}>
                <Icon className={`w-4 h-4 ${statusConfig.color} ${statusConfig.animate ? 'animate-spin' : ''}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white truncate">{agent.name || `Agent ${agent.id}`}</p>
                  <Badge className={`${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} text-xs`}>
                    {agent.role}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  {state.start_time && (
                    <span>Started: {new Date(state.start_time).toLocaleTimeString()}</span>
                  )}
                  {state.duration_ms && (
                    <span>Duration: {(state.duration_ms / 1000).toFixed(2)}s</span>
                  )}
                  {state.messages_sent > 0 && (
                    <span>📤 {state.messages_sent} msgs</span>
                  )}
                  {state.messages_received > 0 && (
                    <span>📥 {state.messages_received} msgs</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {state.status === 'running' && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 rounded-full bg-blue-400"
                />
              )}
              {state.status === 'completed' && (
                <Zap className="w-4 h-4 text-green-400" />
              )}
              {state.status === 'failed' && (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/10 space-y-3"
              >
                {/* Inputs */}
                {state.inputs && Object.keys(state.inputs).length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                      <ArrowRight className="w-3 h-3" />
                      Inputs:
                    </p>
                    <div className="bg-blue-500/10 rounded p-2 border border-blue-500/20">
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap max-h-32 overflow-auto">
                        {JSON.stringify(state.inputs, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Outputs */}
                {state.outputs && Object.keys(state.outputs).length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                      <ArrowRight className="w-3 h-3" />
                      Outputs:
                    </p>
                    <div className="bg-green-500/10 rounded p-2 border border-green-500/20">
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap max-h-32 overflow-auto">
                        {JSON.stringify(state.outputs, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Error */}
                {state.error && (
                  <div>
                    <p className="text-xs text-red-400 mb-2">Error:</p>
                    <div className="bg-red-500/10 rounded p-2 border border-red-500/20">
                      <p className="text-xs text-red-300">{state.error}</p>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2">
                  {state.status === 'running' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onControlAction?.('pause', agent.id);
                      }}
                      className="h-7 text-xs bg-white/5 border-white/10"
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  )}
                  {state.status === 'paused' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onControlAction?.('resume', agent.id);
                      }}
                      className="h-7 text-xs bg-white/5 border-white/10"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Resume
                    </Button>
                  )}
                  {(state.status === 'failed' || state.status === 'completed') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onControlAction?.('retry', agent.id);
                      }}
                      className="h-7 text-xs bg-white/5 border-white/10"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onControlAction?.('step', agent.id);
                    }}
                    className="h-7 text-xs bg-white/5 border-white/10"
                  >
                    <SkipForward className="w-3 h-3 mr-1" />
                    Step
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sub-agents */}
        {agent.sub_agents && agent.sub_agents.length > 0 && (
          <div className="ml-6 border-l-2 border-purple-500/30 pl-2">
            {agent.sub_agents.map(subAgent => renderAgentNode(subAgent, level + 1))}
          </div>
        )}
      </motion.div>
    );
  };

  const progress = execution.completed_steps?.length || 0;
  const total = workflow.steps?.length || 0;
  const progressPercent = total > 0 ? (progress / total) * 100 : 0;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Real-time Execution Graph
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs text-slate-400">
                {progress}/{total}
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setAutoScroll(!autoScroll)}
              className={`h-7 w-7 ${autoScroll ? 'text-blue-400' : 'text-slate-400'}`}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent 
        ref={graphRef}
        className="space-y-2 max-h-[600px] overflow-y-auto"
      >
        {hierarchicalConfig?.agents && hierarchicalConfig.agents.length > 0 ? (
          hierarchicalConfig.agents.map(agent => renderAgentNode(agent))
        ) : workflow.steps ? (
          workflow.steps.map((step, idx) => {
            const state = agentStates[step.id] || { 
              status: execution.completed_steps?.includes(step.id) ? 'completed' : 
                      execution.current_step === step.id ? 'running' : 'pending'
            };
            const statusConfig = AGENT_STATUS_CONFIG[state.status];
            const Icon = statusConfig.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                data-status={state.status}
              >
                <div
                  onClick={() => {
                    setExpandedAgent(expandedAgent === step.id ? null : step.id);
                    onAgentSelect?.(step.id);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    expandedAgent === step.id
                      ? `${statusConfig.bg} border-2 ${statusConfig.border}`
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${statusConfig.bg}`}>
                        <Icon className={`w-4 h-4 ${statusConfig.color} ${statusConfig.animate ? 'animate-spin' : ''}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{step.name || `Step ${idx + 1}`}</p>
                        <p className="text-xs text-slate-400 capitalize">{step.agent_type}</p>
                      </div>
                    </div>
                    <Badge className={`${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                      {state.status}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No agents configured</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}