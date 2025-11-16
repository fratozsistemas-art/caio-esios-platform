import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, GitBranch, CheckCircle2, Clock, 
  Loader2, AlertCircle, Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function AgentCommunicationTrace({ agents = [], executionMode = 'sequential' }) {
  const getAgentIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-slate-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getAgentColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 border-green-500/30';
      case 'running':
        return 'bg-blue-500/20 border-blue-500/30 shadow-lg shadow-blue-500/20';
      case 'pending':
        return 'bg-slate-500/20 border-slate-500/30';
      case 'failed':
        return 'bg-red-500/20 border-red-500/30';
      default:
        return 'bg-slate-500/20 border-slate-500/30';
    }
  };

  if (executionMode === 'parallel') {
    return (
      <div className="relative">
        <div className="flex items-center gap-4 mb-4">
          <Badge className="bg-purple-500/20 text-purple-400">
            <Zap className="w-3 h-3 mr-1" />
            Parallel Execution
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {agents.map((agent, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-3 rounded-lg border ${getAgentColor(agent.status)} backdrop-blur-sm`}
            >
              <div className="flex items-center gap-2 mb-2">
                {getAgentIcon(agent.status)}
                <span className="text-sm font-medium text-white">
                  {agent.name || agent}
                </span>
              </div>
              
              {agent.role && (
                <Badge className="text-xs" variant="outline">
                  {agent.role}
                </Badge>
              )}
              
              {agent.duration_ms && (
                <p className="text-xs text-slate-400 mt-2">
                  {agent.duration_ms}ms
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Sequential execution flow
  return (
    <div className="relative">
      <div className="flex items-center gap-4 mb-4">
        <Badge className="bg-blue-500/20 text-blue-400">
          Sequential Execution
        </Badge>
      </div>

      <div className="space-y-3">
        {agents.map((agent, idx) => (
          <div key={idx} className="relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className={`p-4 rounded-lg border ${getAgentColor(agent.status)} backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    {getAgentIcon(agent.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {agent.name || agent}
                    </p>
                    {agent.role && (
                      <Badge className="text-xs mt-1" variant="outline">
                        {agent.role}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  {agent.duration_ms && (
                    <p className="text-xs text-slate-400">{agent.duration_ms}ms</p>
                  )}
                  {agent.replanned && (
                    <Badge className="bg-orange-500/20 text-orange-400 text-xs mt-1">
                      <GitBranch className="w-3 h-3 mr-1" />
                      Replanned
                    </Badge>
                  )}
                </div>
              </div>

              {/* Context passed indicator */}
              {agent.context_passed && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-xs text-slate-400">
                    Context: {agent.context_passed}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Arrow to next agent */}
            {idx < agents.length - 1 && (
              <div className="flex justify-center my-2">
                <ArrowRight className="w-5 h-5 text-slate-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}