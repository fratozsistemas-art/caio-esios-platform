import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GitMerge, ChevronDown, ChevronRight, Brain, 
  Workflow, Shield, Zap, ArrowRight
} from 'lucide-react';

const ROLE_CONFIG = {
  root: { icon: GitMerge, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  conversational: { icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  workflow: { icon: Workflow, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
  tool: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  validator: { icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' }
};

export default function AgentHierarchyVisualizer({ agentConfig, execution }) {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getExecutionStatus = (agentId) => {
    if (!execution) return null;
    return execution.agent_states?.[agentId]?.status || 'pending';
  };

  const renderAgent = (agent, level = 0, parentPath = '') => {
    const config = ROLE_CONFIG[agent.role] || ROLE_CONFIG.root;
    const Icon = config.icon;
    const isExpanded = expandedNodes.has(agent.id);
    const hasChildren = agent.sub_agents && agent.sub_agents.length > 0;
    const status = getExecutionStatus(agent.id);
    const currentPath = parentPath ? `${parentPath} → ${agent.name}` : agent.name;

    return (
      <div key={agent.id}>
        <div className="flex items-start gap-3 mb-3">
          {/* Vertical line for nested items */}
          {level > 0 && (
            <div className="flex items-center">
              <div className="w-6 border-t-2 border-white/20" />
              <ArrowRight className="w-4 h-4 text-white/40 -ml-1" />
            </div>
          )}

          {/* Agent Card */}
          <div className="flex-1">
            <div className={`${config.bg} border ${config.border} rounded-lg p-3`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  {hasChildren && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleNode(agent.id)}
                      className="h-5 w-5 text-slate-400 hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{agent.name}</p>
                    {agent.description && (
                      <p className="text-xs text-slate-400 mt-1">{agent.description}</p>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className={`${config.bg} ${config.color} ${config.border} text-xs`}>
                        {agent.role}
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-slate-400 text-xs">
                        {agent.isolation_mode}
                      </Badge>
                      {status && (
                        <Badge className={
                          status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          status === 'running' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }>
                          {status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Stats */}
              {execution?.agent_states?.[agent.id] && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Invocations</p>
                      <p className="text-white font-medium">
                        {execution.agent_states[agent.id].invocation_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Duration</p>
                      <p className="text-white font-medium">
                        {execution.agent_states[agent.id].duration_ms || 0}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">State Size</p>
                      <p className="text-white font-medium">
                        {execution.agent_states[agent.id].state_size || 0}kb
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sub-agents */}
            {isExpanded && hasChildren && (
              <div className="ml-8 mt-3 space-y-3 border-l-2 border-white/10 pl-2">
                {agent.sub_agents.map(subAgent => 
                  renderAgent(subAgent, level + 1, currentPath)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!agentConfig?.agents || agentConfig.agents.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 text-center">
          <GitMerge className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">No hierarchical agents configured</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-purple-400" />
          Agent Execution Hierarchy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {agentConfig.agents.map(agent => renderAgent(agent))}
      </CardContent>
    </Card>
  );
}