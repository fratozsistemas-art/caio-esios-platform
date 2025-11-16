import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  GitMerge, Plus, Trash2, ChevronRight, Settings, 
  Brain, Workflow, Shield, Zap, Sliders, Wrench, AlertTriangle
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

const AVAILABLE_TOOLS = [
  { value: 'web_search', label: 'Web Search', description: 'Search the internet for information' },
  { value: 'knowledge_graph', label: 'Knowledge Graph Query', description: 'Query the knowledge graph' },
  { value: 'entity_crud', label: 'Entity Operations', description: 'Create, read, update, delete entities' },
  { value: 'data_enrichment', label: 'Data Enrichment', description: 'Enrich entities with external data' },
  { value: 'document_search', label: 'Document Search', description: 'Search and analyze documents' }
];

const FALLBACK_STRATEGIES = [
  { value: 'retry', label: 'Retry', description: 'Retry the same operation' },
  { value: 'alternate_model', label: 'Alternate Model', description: 'Switch to a different LLM model' },
  { value: 'simplified_prompt', label: 'Simplified Prompt', description: 'Use a simpler prompt version' },
  { value: 'skip_with_default', label: 'Skip with Default', description: 'Skip and use default values' },
  { value: 'escalate', label: 'Escalate to Parent', description: 'Let parent agent handle the error' },
  { value: 'abort', label: 'Abort Workflow', description: 'Stop the entire workflow' }
];

export default function HierarchicalAgentBuilder({ agentConfig, onChange }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addSubAgent = (parentId) => {
    const newAgent = {
      id: `agent_${Date.now()}`,
      name: '',
      role: 'workflow',
      isolation_mode: 'isolated',
      tools: [],
      sub_agents: [],
      config: {},
      llm_parameters: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2000
      },
      tool_config: {
        enabled_tools: [],
        tool_choice: 'auto'
      },
      fallback_strategy: {
        enabled: true,
        max_retries: 2,
        strategies: ['retry', 'simplified_prompt']
      }
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

  const toggleTool = (toolValue) => {
    const currentTools = selectedAgent.tool_config?.enabled_tools || [];
    const updated = currentTools.includes(toolValue)
      ? currentTools.filter(t => t !== toolValue)
      : [...currentTools, toolValue];
    
    updateAgent(selectedAgent.id, {
      tool_config: {
        ...selectedAgent.tool_config,
        enabled_tools: updated
      }
    });
  };

  const toggleFallbackStrategy = (strategyValue) => {
    const currentStrategies = selectedAgent.fallback_strategy?.strategies || [];
    const updated = currentStrategies.includes(strategyValue)
      ? currentStrategies.filter(s => s !== strategyValue)
      : [...currentStrategies, strategyValue];
    
    updateAgent(selectedAgent.id, {
      fallback_strategy: {
        ...selectedAgent.fallback_strategy,
        strategies: updated
      }
    });
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
                {agent.tool_config?.enabled_tools?.length > 0 && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {agent.tool_config.enabled_tools.length} tools
                  </Badge>
                )}
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
        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
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
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-400 hover:text-blue-300 h-7"
                >
                  <Sliders className="w-3 h-3 mr-1" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteAgent(selectedAgent.id)}
                  className="text-red-400 hover:text-red-300 h-7"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
            {/* Basic Configuration */}
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

            {/* Advanced Configuration */}
            {showAdvanced && (
              <>
                {/* LLM Parameters */}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <Label className="text-blue-400 text-sm font-medium">LLM Parameters</Label>
                  </div>
                  <div className="space-y-3 bg-blue-500/5 rounded-lg p-3 border border-blue-500/20">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-slate-400 text-xs">Temperature</Label>
                        <span className="text-white text-xs font-mono">
                          {selectedAgent.llm_parameters?.temperature ?? 0.7}
                        </span>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={selectedAgent.llm_parameters?.temperature ?? 0.7}
                        onChange={(e) => updateAgent(selectedAgent.id, {
                          llm_parameters: {
                            ...selectedAgent.llm_parameters,
                            temperature: parseFloat(e.target.value)
                          }
                        })}
                        className="bg-white/5 border-white/10 text-white h-8"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Higher = more creative, Lower = more deterministic
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-slate-400 text-xs">Top P</Label>
                        <span className="text-white text-xs font-mono">
                          {selectedAgent.llm_parameters?.top_p ?? 0.9}
                        </span>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        value={selectedAgent.llm_parameters?.top_p ?? 0.9}
                        onChange={(e) => updateAgent(selectedAgent.id, {
                          llm_parameters: {
                            ...selectedAgent.llm_parameters,
                            top_p: parseFloat(e.target.value)
                          }
                        })}
                        className="bg-white/5 border-white/10 text-white h-8"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Nucleus sampling threshold
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-slate-400 text-xs">Max Tokens</Label>
                        <span className="text-white text-xs font-mono">
                          {selectedAgent.llm_parameters?.max_tokens ?? 2000}
                        </span>
                      </div>
                      <Input
                        type="number"
                        min="100"
                        max="8000"
                        step="100"
                        value={selectedAgent.llm_parameters?.max_tokens ?? 2000}
                        onChange={(e) => updateAgent(selectedAgent.id, {
                          llm_parameters: {
                            ...selectedAgent.llm_parameters,
                            max_tokens: parseInt(e.target.value)
                          }
                        })}
                        className="bg-white/5 border-white/10 text-white h-8"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Maximum response length
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tool Configuration */}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-4 h-4 text-green-400" />
                    <Label className="text-green-400 text-sm font-medium">Tool Capabilities</Label>
                  </div>
                  <div className="space-y-3 bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                    <div>
                      <Label className="text-slate-400 text-xs mb-2 block">Available Tools</Label>
                      <div className="space-y-2">
                        {AVAILABLE_TOOLS.map(tool => {
                          const isEnabled = selectedAgent.tool_config?.enabled_tools?.includes(tool.value);
                          return (
                            <div
                              key={tool.value}
                              onClick={() => toggleTool(tool.value)}
                              className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-all ${
                                isEnabled 
                                  ? 'bg-green-500/20 border border-green-500/30' 
                                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 ${
                                isEnabled ? 'border-green-400 bg-green-400' : 'border-slate-500'
                              }`}>
                                {isEnabled && <div className="w-2 h-2 bg-white rounded-sm" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-white">{tool.label}</p>
                                <p className="text-xs text-slate-400">{tool.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-400 text-xs">Tool Calling Mode</Label>
                      <Select
                        value={selectedAgent.tool_config?.tool_choice || 'auto'}
                        onValueChange={(value) => updateAgent(selectedAgent.id, {
                          tool_config: {
                            ...selectedAgent.tool_config,
                            tool_choice: value
                          }
                        })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto - LLM decides</SelectItem>
                          <SelectItem value="required">Required - Must use tools</SelectItem>
                          <SelectItem value="none">None - No tool calling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Fallback Strategy */}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <Label className="text-orange-400 text-sm font-medium">Fallback Strategy</Label>
                    </div>
                    <Switch
                      checked={selectedAgent.fallback_strategy?.enabled ?? true}
                      onCheckedChange={(checked) => updateAgent(selectedAgent.id, {
                        fallback_strategy: {
                          ...selectedAgent.fallback_strategy,
                          enabled: checked
                        }
                      })}
                    />
                  </div>
                  
                  {selectedAgent.fallback_strategy?.enabled && (
                    <div className="space-y-3 bg-orange-500/5 rounded-lg p-3 border border-orange-500/20">
                      <div>
                        <Label className="text-slate-400 text-xs mb-1 block">Max Retries</Label>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          value={selectedAgent.fallback_strategy?.max_retries ?? 2}
                          onChange={(e) => updateAgent(selectedAgent.id, {
                            fallback_strategy: {
                              ...selectedAgent.fallback_strategy,
                              max_retries: parseInt(e.target.value)
                            }
                          })}
                          className="bg-white/5 border-white/10 text-white h-8"
                        />
                      </div>

                      <div>
                        <Label className="text-slate-400 text-xs mb-2 block">Strategies (in order)</Label>
                        <div className="space-y-2">
                          {FALLBACK_STRATEGIES.map((strategy, idx) => {
                            const isEnabled = selectedAgent.fallback_strategy?.strategies?.includes(strategy.value);
                            return (
                              <div
                                key={strategy.value}
                                onClick={() => toggleFallbackStrategy(strategy.value)}
                                className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-all ${
                                  isEnabled 
                                    ? 'bg-orange-500/20 border border-orange-500/30' 
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 ${
                                  isEnabled ? 'border-orange-400 bg-orange-400' : 'border-slate-500'
                                }`}>
                                  {isEnabled && <div className="w-2 h-2 bg-white rounded-sm" />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-white">{strategy.label}</p>
                                  <p className="text-xs text-slate-400">{strategy.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <Label className="text-slate-400 text-xs mb-1 block">Timeout (seconds)</Label>
                        <Input
                          type="number"
                          min="10"
                          max="300"
                          value={selectedAgent.fallback_strategy?.timeout_seconds ?? 60}
                          onChange={(e) => updateAgent(selectedAgent.id, {
                            fallback_strategy: {
                              ...selectedAgent.fallback_strategy,
                              timeout_seconds: parseInt(e.target.value)
                            }
                          })}
                          className="bg-white/5 border-white/10 text-white h-8"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

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