import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot, Eye, FileText, Brain, Zap, RefreshCw, Play, Pause,
  Bell, CheckCircle, AlertTriangle, Clock, ArrowRight, Sparkles,
  TrendingUp, Shield, Lightbulb, MessageSquare, Send, GitMerge
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import AgentCollaborationLayer from "./AgentCollaborationLayer";

const AGENTS = [
  {
    id: 'market_monitor',
    name: 'Market Monitor',
    description: 'Tracks market trends, competitor actions, and generates alerts',
    icon: Eye,
    color: 'blue',
    capabilities: ['Market Tracking', 'Competitor Alerts', 'Trend Detection', 'Early Warnings']
  },
  {
    id: 'strategy_doc_generator',
    name: 'Strategy Doc Generator',
    description: 'Drafts risk plans, opportunity assessments, and strategic documents',
    icon: FileText,
    color: 'purple',
    capabilities: ['Risk Plans', 'Opportunity Assessments', 'Playbooks', 'Board Memos']
  },
  {
    id: 'knowledge_curator',
    name: 'Knowledge Curator',
    description: 'Suggests links, conversions, and maintains knowledge health',
    icon: Brain,
    color: 'emerald',
    capabilities: ['Link Suggestions', 'Pattern Detection', 'Deadline Alerts', 'Knowledge Health']
  }
];

export default function AutonomousAgentsDashboard() {
  const [activeAgent, setActiveAgent] = useState('market_monitor');
  const [activeTab, setActiveTab] = useState('agents');
  const [chatMessage, setChatMessage] = useState('');
  const [conversations, setConversations] = useState({});
  const [isProcessing, setIsProcessing] = useState({});
  const queryClient = useQueryClient();

  // Fetch recent agent activities
  const { data: recentAlerts = [] } = useQuery({
    queryKey: ['agent-alerts'],
    queryFn: () => base44.entities.MonitoringAlert.list('-created_date', 10)
  });

  const { data: recentSuggestions = [] } = useQuery({
    queryKey: ['agent-suggestions'],
    queryFn: () => base44.entities.EnrichmentSuggestion.filter({ status: 'pending' }, '-created_date', 10)
  });

  // Trigger agent action
  const triggerAgentAction = async (agentId, action, context = '') => {
    setIsProcessing(prev => ({ ...prev, [agentId]: true }));
    
    try {
      let prompt = '';
      let result;

      switch (agentId) {
        case 'market_monitor':
          prompt = `As the Market Monitor Agent, ${action}. Context: ${context || 'General market scan requested.'}
          
          Provide:
          1. Key market developments (last 7 days)
          2. Competitor activity highlights
          3. Emerging trends
          4. Recommended alerts (with priority)
          5. Strategic implications
          
          Format as structured JSON with: developments, competitors, trends, alerts[], implications[]`;
          break;

        case 'strategy_doc_generator':
          prompt = `As the Strategy Doc Generator Agent, create a ${action}. Context: ${context || 'Standard strategic document requested.'}
          
          Generate a professional document with:
          1. Executive Summary
          2. Situation Analysis
          3. Key Findings/Risks/Opportunities
          4. Recommendations
          5. Action Items with Owners
          6. Timeline
          
          Apply CAIO frameworks (EVA, CSI, VTE) where relevant.
          Format as structured JSON with: title, executive_summary, sections[], recommendations[], action_items[], timeline`;
          break;

        case 'knowledge_curator':
          prompt = `As the Knowledge Curator Agent, ${action}. Context: ${context || 'Knowledge health check requested.'}
          
          Analyze and provide:
          1. Suggested knowledge links (based on recent analyses)
          2. Insights worthy of conversion to KnowledgeItems
          3. Pattern matches detected
          4. Upcoming deadline reminders
          5. Knowledge health score and recommendations
          
          Format as structured JSON with: suggested_links[], conversion_candidates[], patterns[], deadline_reminders[], health_score, recommendations[]`;
          break;
      }

      result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: agentId === 'market_monitor',
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            items: { type: "array", items: { type: "object" } },
            recommendations: { type: "array", items: { type: "string" } },
            alerts: { type: "array", items: { type: "object" } },
            health_score: { type: "number" }
          }
        }
      });

      // Update conversation
      setConversations(prev => ({
        ...prev,
        [agentId]: [
          ...(prev[agentId] || []),
          { role: 'user', content: `${action}: ${context}`, timestamp: new Date() },
          { role: 'agent', content: result, timestamp: new Date() }
        ]
      }));

      toast.success(`${AGENTS.find(a => a.id === agentId)?.name} completed action`);
      
      // Create alert if market monitor
      if (agentId === 'market_monitor' && result.alerts?.length > 0) {
        for (const alert of result.alerts.slice(0, 3)) {
          await base44.entities.MonitoringAlert.create({
            alert_type: 'market_intelligence',
            severity: alert.priority || 'medium',
            title: alert.title || 'Market Alert',
            description: alert.description || alert.content,
            source: 'market_monitor_agent',
            is_active: true
          });
        }
        queryClient.invalidateQueries(['agent-alerts']);
      }

      return result;
    } catch (error) {
      toast.error('Agent action failed: ' + error.message);
    } finally {
      setIsProcessing(prev => ({ ...prev, [agentId]: false }));
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const message = chatMessage;
    setChatMessage('');
    
    // Determine action based on message
    let action = 'analyze and respond to';
    if (activeAgent === 'market_monitor') {
      action = 'scan market for';
    } else if (activeAgent === 'strategy_doc_generator') {
      action = 'generate document for';
    } else if (activeAgent === 'knowledge_curator') {
      action = 'find knowledge connections for';
    }

    await triggerAgentAction(activeAgent, action, message);
  };

  const currentAgent = AGENTS.find(a => a.id === activeAgent);
  const AgentIcon = currentAgent?.icon || Bot;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl">Autonomous Agents</span>
              <p className="text-sm text-slate-400 font-normal">
                Proactive intelligence for market monitoring, document generation, and knowledge curation
              </p>
            </div>
            <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
              <Zap className="w-3 h-3 mr-1" />
              3 Agents Active
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 grid grid-cols-2 w-64">
          <TabsTrigger value="agents" className="data-[state=active]:bg-blue-500/20">
            <Bot className="w-4 h-4 mr-2" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="data-[state=active]:bg-purple-500/20">
            <GitMerge className="w-4 h-4 mr-2" />
            Collaboration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collaboration" className="mt-6">
          <AgentCollaborationLayer />
        </TabsContent>

        <TabsContent value="agents" className="mt-6">
      {/* Agent Selection */}
      <div className="grid grid-cols-3 gap-4">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          const isActive = activeAgent === agent.id;
          return (
            <Card
              key={agent.id}
              onClick={() => setActiveAgent(agent.id)}
              className={`cursor-pointer transition-all ${
                isActive 
                  ? `bg-${agent.color}-500/20 border-${agent.color}-500/50 ring-2 ring-${agent.color}-500/30`
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-${agent.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${agent.color}-400`} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{agent.name}</p>
                    {isProcessing[agent.id] && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Processing
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-3">{agent.description}</p>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map((cap, i) => (
                    <Badge key={i} className={`bg-${agent.color}-500/10 text-${agent.color}-400 text-xs`}>
                      {cap}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Agent Interface */}
      <div className="grid grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Zap className={`w-5 h-5 text-${currentAgent?.color}-400`} />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeAgent === 'market_monitor' && (
              <>
                <Button
                  onClick={() => triggerAgentAction('market_monitor', 'perform full market scan')}
                  disabled={isProcessing.market_monitor}
                  className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Full Market Scan
                </Button>
                <Button
                  onClick={() => triggerAgentAction('market_monitor', 'analyze competitor movements')}
                  disabled={isProcessing.market_monitor}
                  variant="outline"
                  className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10 justify-start"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Competitor Analysis
                </Button>
                <Button
                  onClick={() => triggerAgentAction('market_monitor', 'identify emerging trends')}
                  disabled={isProcessing.market_monitor}
                  variant="outline"
                  className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10 justify-start"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Trend Detection
                </Button>
              </>
            )}

            {activeAgent === 'strategy_doc_generator' && (
              <>
                <Button
                  onClick={() => triggerAgentAction('strategy_doc_generator', 'Risk Mitigation Plan')}
                  disabled={isProcessing.strategy_doc_generator}
                  className="w-full bg-purple-600 hover:bg-purple-700 justify-start"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Generate Risk Plan
                </Button>
                <Button
                  onClick={() => triggerAgentAction('strategy_doc_generator', 'Opportunity Assessment')}
                  disabled={isProcessing.strategy_doc_generator}
                  variant="outline"
                  className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10 justify-start"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Opportunity Assessment
                </Button>
                <Button
                  onClick={() => triggerAgentAction('strategy_doc_generator', 'Executive Briefing')}
                  disabled={isProcessing.strategy_doc_generator}
                  variant="outline"
                  className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10 justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Executive Briefing
                </Button>
              </>
            )}

            {activeAgent === 'knowledge_curator' && (
              <>
                <Button
                  onClick={() => triggerAgentAction('knowledge_curator', 'analyze all recent analyses for link suggestions')}
                  disabled={isProcessing.knowledge_curator}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 justify-start"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Find Connections
                </Button>
                <Button
                  onClick={() => triggerAgentAction('knowledge_curator', 'identify conversion candidates')}
                  disabled={isProcessing.knowledge_curator}
                  variant="outline"
                  className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 justify-start"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Conversion Candidates
                </Button>
                <Button
                  onClick={() => triggerAgentAction('knowledge_curator', 'perform knowledge health check')}
                  disabled={isProcessing.knowledge_curator}
                  variant="outline"
                  className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 justify-start"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Health Check
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="col-span-2 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <MessageSquare className={`w-5 h-5 text-${currentAgent?.color}-400`} />
              Chat with {currentAgent?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Conversation History */}
            <div className="h-64 overflow-y-auto mb-4 space-y-3 p-3 bg-white/5 rounded-lg">
              {(conversations[activeAgent] || []).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <AgentIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start a conversation with {currentAgent?.name}</p>
                  <p className="text-sm">Or use the quick actions on the left</p>
                </div>
              ) : (
                <AnimatePresence>
                  {(conversations[activeAgent] || []).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-500/20 text-white'
                          : `bg-${currentAgent?.color}-500/10 text-slate-300`
                      }`}>
                        {msg.role === 'agent' && typeof msg.content === 'object' ? (
                          <div className="space-y-2">
                            {msg.content.summary && (
                              <p className="text-sm">{msg.content.summary}</p>
                            )}
                            {msg.content.recommendations?.slice(0, 3).map((rec, j) => (
                              <p key={j} className="text-xs text-slate-400">• {rec}</p>
                            ))}
                            {msg.content.health_score && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-slate-500">Health Score:</span>
                                <Progress value={msg.content.health_score} className="flex-1 h-2" />
                                <span className="text-xs text-emerald-400">{msg.content.health_score}%</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm">{typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content).slice(0, 200)}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Ask ${currentAgent?.name}...`}
                className="bg-white/5 border-white/10 text-white"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isProcessing[activeAgent] || !chatMessage.trim()}
                className={`bg-${currentAgent?.color}-600 hover:bg-${currentAgent?.color}-700`}
              >
                {isProcessing[activeAgent] ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAlerts.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No recent alerts</p>
            ) : (
              recentAlerts.slice(0, 5).map((alert, i) => (
                <div key={i} className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-400' :
                    alert.severity === 'high' ? 'text-orange-400' :
                    'text-yellow-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-white">{alert.title}</p>
                    <p className="text-xs text-slate-400">{alert.description?.slice(0, 80)}...</p>
                  </div>
                  <Badge className={
                    alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }>
                    {alert.severity}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Suggestions */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-emerald-400" />
              Pending Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentSuggestions.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No pending suggestions</p>
            ) : (
              recentSuggestions.slice(0, 5).map((suggestion, i) => (
                <div key={i} className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                  <Brain className="w-4 h-4 mt-0.5 text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-sm text-white">{suggestion.title}</p>
                    <p className="text-xs text-slate-400">{suggestion.suggestion_type}</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}