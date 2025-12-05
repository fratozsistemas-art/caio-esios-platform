import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GitMerge, ArrowRight, Eye, FileText, Brain, Zap, RefreshCw,
  CheckCircle, AlertTriangle, Clock, Bell, MessageSquare, Bot,
  ArrowLeftRight, Sparkles, Play
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const AGENTS = {
  market_monitor: { name: 'Market Monitor', icon: Eye, color: 'blue' },
  strategy_doc_generator: { name: 'Strategy Doc Generator', icon: FileText, color: 'purple' },
  knowledge_curator: { name: 'Knowledge Curator', icon: Brain, color: 'emerald' }
};

const COLLABORATION_RULES = [
  {
    id: 'critical_alert_to_risk_plan',
    source: 'market_monitor',
    target: 'strategy_doc_generator',
    trigger: 'critical_alert',
    action: 'Generate Risk Mitigation Plan',
    description: 'When Market Monitor detects critical alert, trigger Strategy Doc Generator to create risk plan'
  },
  {
    id: 'high_alert_to_opportunity',
    source: 'market_monitor',
    target: 'strategy_doc_generator',
    trigger: 'opportunity_detected',
    action: 'Generate Opportunity Assessment',
    description: 'When market opportunity detected, create opportunity assessment'
  },
  {
    id: 'new_insight_to_knowledge',
    source: 'market_monitor',
    target: 'knowledge_curator',
    trigger: 'new_insight',
    action: 'Suggest Knowledge Links',
    description: 'When new market insight generated, suggest relevant knowledge connections'
  },
  {
    id: 'doc_to_knowledge_link',
    source: 'strategy_doc_generator',
    target: 'knowledge_curator',
    trigger: 'document_created',
    action: 'Link to Knowledge Base',
    description: 'When strategic document created, link to relevant knowledge items'
  },
  {
    id: 'knowledge_gap_to_market',
    source: 'knowledge_curator',
    target: 'market_monitor',
    trigger: 'knowledge_gap',
    action: 'Request Market Scan',
    description: 'When knowledge gap detected, request market scan for missing info'
  },
  {
    id: 'pattern_to_doc',
    source: 'knowledge_curator',
    target: 'strategy_doc_generator',
    trigger: 'pattern_detected',
    action: 'Generate Pattern Playbook',
    description: 'When recurring pattern detected, generate strategic playbook'
  }
];

export default function AgentCollaborationLayer({ onCollaborationTriggered }) {
  const [activeRules, setActiveRules] = useState(COLLABORATION_RULES.map(r => r.id));
  const [isProcessing, setIsProcessing] = useState({});
  const queryClient = useQueryClient();

  // Fetch collaboration history
  const { data: collaborations = [], isLoading } = useQuery({
    queryKey: ['agent-collaborations'],
    queryFn: () => base44.entities.AgentCollaboration.list('-created_date', 20)
  });

  // Fetch pending collaborations
  const pendingCollabs = collaborations.filter(c => c.status === 'pending');
  const recentCompleted = collaborations.filter(c => c.status === 'completed').slice(0, 5);

  // Execute collaboration
  const executeCollaboration = async (collaboration) => {
    setIsProcessing(prev => ({ ...prev, [collaboration.id]: true }));

    try {
      const targetAgent = AGENTS[collaboration.target_agent];
      let prompt = '';
      let result;

      // Build prompt based on collaboration type
      switch (collaboration.collaboration_type) {
        case 'trigger_action':
          if (collaboration.target_agent === 'strategy_doc_generator') {
            prompt = `As Strategy Doc Generator, create a document based on this agent collaboration request:
            
Source Agent: ${collaboration.source_agent}
Trigger: ${collaboration.trigger_reason}
Context: ${JSON.stringify(collaboration.context || {})}

Generate a professional strategic document addressing this trigger. Include:
1. Executive Summary
2. Situation Analysis  
3. Key Findings
4. Recommendations
5. Action Items

Return JSON with: title, type, executive_summary, sections[], recommendations[], action_items[]`;
          } else if (collaboration.target_agent === 'knowledge_curator') {
            prompt = `As Knowledge Curator, respond to this collaboration request:
            
Source Agent: ${collaboration.source_agent}
Request: ${collaboration.trigger_reason}
Context: ${JSON.stringify(collaboration.context || {})}

Analyze and provide:
1. Suggested knowledge links
2. Relevant existing knowledge items
3. Recommended actions

Return JSON with: suggested_links[], relevant_items[], recommendations[]`;
          } else {
            prompt = `As Market Monitor, respond to this collaboration request:
            
Source Agent: ${collaboration.source_agent}
Request: ${collaboration.trigger_reason}
Context: ${JSON.stringify(collaboration.context || {})}

Provide market intelligence addressing this request.
Return JSON with: findings[], alerts[], recommendations[]`;
          }
          break;

        case 'suggest_link':
          prompt = `As Knowledge Curator, suggest links for:
Context: ${JSON.stringify(collaboration.context || {})}
Return JSON with: suggested_links[], rationale`;
          break;

        default:
          prompt = `Process this agent collaboration: ${JSON.stringify(collaboration)}
Return JSON with: result, recommendations[]`;
      }

      result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: collaboration.target_agent === 'market_monitor',
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            result: { type: "object" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Update collaboration status
      await base44.entities.AgentCollaboration.update(collaboration.id, {
        status: 'completed',
        result
      });

      queryClient.invalidateQueries(['agent-collaborations']);
      toast.success(`${targetAgent.name} completed collaboration`);

      // Trigger follow-up collaborations if needed
      if (collaboration.target_agent === 'strategy_doc_generator' && result) {
        await triggerFollowUp('strategy_doc_generator', 'knowledge_curator', 'document_created', result);
      }

      onCollaborationTriggered?.(collaboration, result);
      return result;
    } catch (error) {
      await base44.entities.AgentCollaboration.update(collaboration.id, {
        status: 'failed'
      });
      toast.error('Collaboration failed: ' + error.message);
    } finally {
      setIsProcessing(prev => ({ ...prev, [collaboration.id]: false }));
    }
  };

  // Trigger new collaboration
  const triggerCollaboration = async (sourceAgent, targetAgent, triggerType, context = {}) => {
    const collab = await base44.entities.AgentCollaboration.create({
      source_agent: sourceAgent,
      target_agent: targetAgent,
      collaboration_type: 'trigger_action',
      trigger_reason: triggerType,
      context,
      status: 'pending',
      priority: context.priority || 'medium'
    });

    queryClient.invalidateQueries(['agent-collaborations']);
    toast.success(`Collaboration triggered: ${AGENTS[sourceAgent].name} → ${AGENTS[targetAgent].name}`);

    // Auto-execute if enabled
    if (activeRules.some(r => {
      const rule = COLLABORATION_RULES.find(cr => cr.id === r);
      return rule?.source === sourceAgent && rule?.target === targetAgent;
    })) {
      await executeCollaboration(collab);
    }

    return collab;
  };

  // Trigger follow-up collaboration
  const triggerFollowUp = async (source, target, trigger, context) => {
    await triggerCollaboration(source, target, trigger, context);
  };

  // Toggle rule
  const toggleRule = (ruleId) => {
    setActiveRules(prev => 
      prev.includes(ruleId) ? prev.filter(r => r !== ruleId) : [...prev, ruleId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <GitMerge className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl">Agent Collaboration Layer</span>
              <p className="text-sm text-slate-400 font-normal">
                Autonomous agent-to-agent communication and task delegation
              </p>
            </div>
            <Badge className="ml-auto bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              {activeRules.length} Rules Active
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Agent Network Visualization */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
            Agent Communication Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-8 py-6">
            {Object.entries(AGENTS).map(([id, agent], idx) => {
              const Icon = agent.icon;
              return (
                <React.Fragment key={id}>
                  <div className={`flex flex-col items-center p-4 rounded-xl bg-${agent.color}-500/10 border border-${agent.color}-500/30`}>
                    <div className={`w-16 h-16 rounded-xl bg-${agent.color}-500/20 flex items-center justify-center mb-2`}>
                      <Icon className={`w-8 h-8 text-${agent.color}-400`} />
                    </div>
                    <p className="text-white font-medium text-sm">{agent.name}</p>
                    <Badge className={`mt-2 bg-${agent.color}-500/20 text-${agent.color}-400 text-xs`}>
                      {pendingCollabs.filter(c => c.target_agent === id).length} pending
                    </Badge>
                  </div>
                  {idx < 2 && (
                    <div className="flex items-center">
                      <ArrowRight className="w-6 h-6 text-slate-500" />
                      <ArrowRight className="w-6 h-6 text-slate-500 -ml-3" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Rules */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Collaboration Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {COLLABORATION_RULES.map((rule) => {
              const SourceIcon = AGENTS[rule.source].icon;
              const TargetIcon = AGENTS[rule.target].icon;
              const isActive = activeRules.includes(rule.id);

              return (
                <div
                  key={rule.id}
                  onClick={() => toggleRule(rule.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-green-500/10 border border-green-500/30' 
                      : 'bg-white/5 border border-white/10 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <SourceIcon className={`w-4 h-4 text-${AGENTS[rule.source].color}-400`} />
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <TargetIcon className={`w-4 h-4 text-${AGENTS[rule.target].color}-400`} />
                    <Badge className={isActive ? 'bg-green-500/20 text-green-400 ml-auto' : 'bg-slate-500/20 text-slate-400 ml-auto'}>
                      {isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-white font-medium">{rule.action}</p>
                  <p className="text-xs text-slate-400 mt-1">{rule.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Trigger */}
      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-400 text-lg flex items-center gap-2">
            <Play className="w-5 h-5" />
            Manual Trigger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={() => triggerCollaboration('market_monitor', 'strategy_doc_generator', 'critical_alert', {
                alert_type: 'market_disruption',
                priority: 'critical',
                summary: 'Manual trigger for risk plan generation'
              })}
              className="bg-blue-600 hover:bg-blue-700 flex flex-col h-auto py-3"
            >
              <div className="flex items-center gap-1 mb-1">
                <Eye className="w-4 h-4" />
                <ArrowRight className="w-3 h-3" />
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs">Market → Risk Plan</span>
            </Button>
            <Button
              onClick={() => triggerCollaboration('market_monitor', 'knowledge_curator', 'new_insight', {
                insight_type: 'market_trend',
                summary: 'Manual trigger for knowledge linking'
              })}
              className="bg-emerald-600 hover:bg-emerald-700 flex flex-col h-auto py-3"
            >
              <div className="flex items-center gap-1 mb-1">
                <Eye className="w-4 h-4" />
                <ArrowRight className="w-3 h-3" />
                <Brain className="w-4 h-4" />
              </div>
              <span className="text-xs">Market → Knowledge</span>
            </Button>
            <Button
              onClick={() => triggerCollaboration('knowledge_curator', 'strategy_doc_generator', 'pattern_detected', {
                pattern_type: 'recurring_success',
                summary: 'Manual trigger for playbook generation'
              })}
              className="bg-purple-600 hover:bg-purple-700 flex flex-col h-auto py-3"
            >
              <div className="flex items-center gap-1 mb-1">
                <Brain className="w-4 h-4" />
                <ArrowRight className="w-3 h-3" />
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs">Knowledge → Playbook</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending & Recent Collaborations */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pending */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Pending Collaborations ({pendingCollabs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingCollabs.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No pending collaborations</p>
            ) : (
              pendingCollabs.map((collab) => {
                const SourceIcon = AGENTS[collab.source_agent]?.icon || Bot;
                const TargetIcon = AGENTS[collab.target_agent]?.icon || Bot;
                return (
                  <motion.div
                    key={collab.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30"
                  >
                    <SourceIcon className={`w-5 h-5 text-${AGENTS[collab.source_agent]?.color}-400`} />
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <TargetIcon className={`w-5 h-5 text-${AGENTS[collab.target_agent]?.color}-400`} />
                    <div className="flex-1">
                      <p className="text-sm text-white">{collab.trigger_reason}</p>
                      <p className="text-xs text-slate-400">
                        {AGENTS[collab.source_agent]?.name} → {AGENTS[collab.target_agent]?.name}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => executeCollaboration(collab)}
                      disabled={isProcessing[collab.id]}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      {isProcessing[collab.id] ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </motion.div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Recent Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentCompleted.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No completed collaborations yet</p>
            ) : (
              recentCompleted.map((collab) => {
                const SourceIcon = AGENTS[collab.source_agent]?.icon || Bot;
                const TargetIcon = AGENTS[collab.target_agent]?.icon || Bot;
                return (
                  <div
                    key={collab.id}
                    className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30"
                  >
                    <SourceIcon className={`w-5 h-5 text-${AGENTS[collab.source_agent]?.color}-400`} />
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <TargetIcon className={`w-5 h-5 text-${AGENTS[collab.target_agent]?.color}-400`} />
                    <div className="flex-1">
                      <p className="text-sm text-white">{collab.trigger_reason}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(collab.updated_date || collab.created_date).toLocaleString()}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}