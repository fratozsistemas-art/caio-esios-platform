import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GitMerge, Plus, Trash2, ChevronRight, Settings, 
  Brain, Workflow, Shield, Zap
} from 'lucide-react';

const AGENT_ROLES = [
  { value: 'root', label: 'Root Orchestrator', icon: GitMerge, description: 'Main controller that delegates to sub-agents' },
  { value: 'conversational', label: 'Conversational Agent', icon: Brain, description: 'Handles user interaction and onboarding' },
  { value: 'workflow', label: 'Workflow Agent', icon: Workflow, description: 'Executes structured multi-step processes' },
  { value: 'tool', label: 'Tool Agent', icon: Zap, description: 'Isolated agent wrapped as a tool' },
  { value: 'validator', label: 'Validator Agent', icon: Shield, description: 'Validates outputs and ensures quality' }
];

const ISOLATION_MODES = [
  { value: 'shared', label: 'Shared State', description: 'Agent shares state with parent' },
  { value: 'isolated', label: 'Isolated State', description: 'Agent has its own clean state (Agent-as-a-Tool)' },
  { value: 'controlled', label: 'Controlled State', description: 'State explicitly passed between agents' }
];

export default function HierarchicalAgentBuilder({ agentConfig, onChange }) {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const addSubAgent = (parentId) => {
    const newAgent = {
      id: `agent_${Date.now()}`,
      name: '',
      role: 'workflow',
      isolation_mode: 'isolated',
      tools: [],
      sub_agents: [],
      config: {}
    };

    const updateAgents = (agents, targetId) => {
      return agents.map(agent => {
        if (agent.id === targetId) {
          return {
            ...agent,
            sub_agents: [...(agent.sub_agents || []), newAgent]
          };
        }
        if (agent.sub_agents) {
          return {
            ...agent,
            sub_agents: updateAgents(agent.sub_agents, targetId)
          };
        }
        return agent;
      });
    };

    if (!parentId) {
      onChange({
        ...agentConfig,
        agents: [...(agentConfig.agents || []), newAgent]
      });
    } else {
      onChange({
        ...agentConfig,
        agents: updateAgents(agentConfig.agents || [], parentId)
      });
    }
  };

  const updateAgent = (agentId, updates) => {
    const updateInTree = (agents) => {
      return agents.map(agent => {
        if (agent.id === agentId) {
          return { ...agent, ...updates };
        }
        if (agent.sub_agents) {
          return {
            ...agent,
            sub_agents: updateInTree(agent.sub_agents)
          };
        }
        return agent;
      });
    };

    onChange({
      ...agentConfig,
      agents: updateInTree(agentConfig.agents || [])
    });
  };

  const deleteAgent = (agentId) => {
    const removeFromTree = (agents) => {
      return agents
        .filter(agent => agent.id !== agentId)
        .map(agent => ({
          ...agent,
          sub_agents: agent.sub_agents ? removeFromTree(agent.sub_agents) : []
        }));
    };

    onChange({
      ...agentConfig,
      agents: removeFromTree(agentConfig.agents || [])
    });
    setSelectedAgent(null);
  };

  const renderAgentTree = (agents, level = 0) => {
    return agents.map(agent => {
      const roleConfig = AGENT_ROLES.find(r => r.value === agent.role);
      const Icon = roleConfig?.icon || Brain;

      return (
        <div key={agent.id} style={{ marginLeft: `${level * 24}px` }}>
          <div
            onClick={() => setSelectedAgent(agent)}
            className={`flex items-center gap-2 p-3 rounded-lg mb-2 cursor-pointer transition-all ${
              selectedAgent?.id === agent.id
                ? 'bg-purple-500/20 border-2 border-purple-500/50'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4 text-purple-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {agent.name || 'Unnamed Agent'}
              </p>
              <div className="flex gap-2 mt-1">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  {roleConfig?.label}
                </Badge>
                <Badge variant="outline" className="border-white/20 text-slate-400 text-xs">
                  {agent.isolation_mode}
                </Badge>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                addSubAgent(agent.id);
              }}
              className="h-7 w-7 text-green-400 hover:text-green-300"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {agent.sub_agents && agent.sub_agents.length > 0 && (
            <div className="ml-4 border-l-2 border-purple-500/30 pl-2">
              {renderAgentTree(agent.sub_agents, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Agent Tree */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-purple-400" />
              Agent Hierarchy
            </CardTitle>
            <Button
              size="sm"
              onClick={() => addSubAgent(null)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Root
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {agentConfig.agents && agentConfig.agents.length > 0 ? (
            renderAgentTree(agentConfig.agents)
          ) : (
            <div className="text-center py-12">
              <GitMerge className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">No agents configured</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Configuration */}
      {selectedAgent && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Agent Configuration
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteAgent(selectedAgent.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label className="text-slate-400 text-xs">Agent Name</Label>
              <Input
                value={selectedAgent.name}
                onChange={(e) => updateAgent(selectedAgent.id, { name: e.target.value })}
                placeholder="e.g., Research Orchestrator"
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-400 text-xs">Role</Label>
              <Select
                value={selectedAgent.role}
                onValueChange={(value) => updateAgent(selectedAgent.id, { role: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="w-4 h-4" />
                        <div>
                          <p className="font-medium">{role.label}</p>
                          <p className="text-xs text-slate-400">{role.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-400 text-xs">State Isolation</Label>
              <Select
                value={selectedAgent.isolation_mode}
                onValueChange={(value) => updateAgent(selectedAgent.id, { isolation_mode: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISOLATION_MODES.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>
                      <div>
                        <p className="font-medium">{mode.label}</p>
                        <p className="text-xs text-slate-400">{mode.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-400 text-xs">Description</Label>
              <Textarea
                value={selectedAgent.description || ''}
                onChange={(e) => updateAgent(selectedAgent.id, { description: e.target.value })}
                placeholder="What does this agent do?"
                className="bg-white/5 border-white/10 text-white mt-1 h-20"
              />
            </div>

            <div>
              <Label className="text-slate-400 text-xs">System Prompt</Label>
              <Textarea
                value={selectedAgent.system_prompt || ''}
                onChange={(e) => updateAgent(selectedAgent.id, { system_prompt: e.target.value })}
                placeholder="Instructions for this agent..."
                className="bg-white/5 border-white/10 text-white mt-1 h-24"
              />
            </div>

            {selectedAgent.role === 'tool' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3">
                <p className="text-xs text-amber-400 font-medium mb-1">
                  Agent-as-a-Tool Pattern
                </p>
                <p className="text-xs text-slate-300">
                  This agent will be wrapped as a tool with isolated state. Perfect for loop iterations.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}