import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  GitMerge, Eye, FileText, Brain, Zap, RefreshCw, Play, CheckCircle,
  AlertTriangle, Clock, ArrowRight, Sparkles, Bot, Settings, History,
  BarChart3, Activity, Network, Workflow, Filter, Search, Trash2,
  MessageSquare, Send, Users, CheckSquare, Square, UserCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import NotificationPreferences from "../components/agents/NotificationPreferences";
import { useNotifications } from "../components/agents/useNotifications";

const AGENTS = {
  market_monitor: { name: 'Market Monitor', icon: Eye, color: '#3b82f6', shortName: 'MM', status: 'active' },
  strategy_doc_generator: { name: 'Strategy Doc Generator', icon: FileText, color: '#a855f7', shortName: 'SDG', status: 'active' },
  knowledge_curator: { name: 'Knowledge Curator', icon: Brain, color: '#10b981', shortName: 'KC', status: 'idle' }
};

const COLLABORATION_RULES = [
  { id: 'critical_alert_to_risk_plan', source: 'market_monitor', target: 'strategy_doc_generator', trigger: 'critical_alert', action: 'Generate Risk Mitigation Plan', description: 'Critical market alerts trigger automatic risk plan generation', priority: 'critical' },
  { id: 'high_alert_to_opportunity', source: 'market_monitor', target: 'strategy_doc_generator', trigger: 'opportunity_detected', action: 'Generate Opportunity Assessment', description: 'Market opportunities trigger opportunity assessments', priority: 'high' },
  { id: 'new_insight_to_knowledge', source: 'market_monitor', target: 'knowledge_curator', trigger: 'new_insight', action: 'Suggest Knowledge Links', description: 'New insights trigger knowledge linking suggestions', priority: 'medium' },
  { id: 'doc_to_knowledge_link', source: 'strategy_doc_generator', target: 'knowledge_curator', trigger: 'document_created', action: 'Link to Knowledge Base', description: 'New documents are automatically linked to knowledge items', priority: 'medium' },
  { id: 'knowledge_gap_to_market', source: 'knowledge_curator', target: 'market_monitor', trigger: 'knowledge_gap', action: 'Request Market Scan', description: 'Knowledge gaps trigger targeted market scans', priority: 'low' },
  { id: 'pattern_to_doc', source: 'knowledge_curator', target: 'strategy_doc_generator', trigger: 'pattern_detected', action: 'Generate Pattern Playbook', description: 'Detected patterns trigger playbook generation', priority: 'high' }
];

export default function AgentCollaborationHub() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeRules, setActiveRules] = useState(COLLABORATION_RULES.map(r => r.id));
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState({});
  const [agentPresence, setAgentPresence] = useState(AGENTS);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const { notify, requestPermission } = useNotifications();
  const queryClient = useQueryClient();

  // Fetch collaborations
  const { data: collaborations = [], isLoading } = useQuery({
    queryKey: ['agent-collaborations'],
    queryFn: () => base44.entities.AgentCollaboration.list('-created_date', 50),
    refetchInterval: 10000
  });

  // Simulate real-time presence updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentPresence(prev => {
        const agents = { ...prev };
        const agentKeys = Object.keys(agents);
        const randomAgent = agentKeys[Math.floor(Math.random() * agentKeys.length)];
        const statuses = ['active', 'idle', 'busy'];
        agents[randomAgent] = { 
          ...agents[randomAgent], 
          status: statuses[Math.floor(Math.random() * statuses.length)],
          lastActive: new Date().toISOString()
        };
        return agents;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Load messages and tasks from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('agent_messages');
    const savedTasks = localStorage.getItem('shared_tasks');
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    if (savedTasks) setSharedTasks(JSON.parse(savedTasks));
  }, []);

  // Save messages to localStorage
  const saveMessages = (msgs) => {
    setMessages(msgs);
    localStorage.setItem('agent_messages', JSON.stringify(msgs));
  };

  // Save tasks to localStorage
  const saveTasks = (tasks) => {
    setSharedTasks(tasks);
    localStorage.setItem('shared_tasks', JSON.stringify(tasks));
  };

  // Filter collaborations
  const filteredCollaborations = collaborations.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery && !c.trigger_reason?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Stats
  const stats = {
    total: collaborations.length,
    pending: collaborations.filter(c => c.status === 'pending').length,
    completed: collaborations.filter(c => c.status === 'completed').length,
    failed: collaborations.filter(c => c.status === 'failed').length,
    activeRules: activeRules.length,
    totalRules: COLLABORATION_RULES.length
  };

  // Chart data
  const statusChartData = [
    { name: 'Completed', value: stats.completed, color: '#22c55e' },
    { name: 'Pending', value: stats.pending, color: '#eab308' },
    { name: 'Failed', value: stats.failed, color: '#ef4444' }
  ];

  const agentActivityData = Object.keys(AGENTS).map(agentId => ({
    name: AGENTS[agentId].shortName,
    triggered: collaborations.filter(c => c.source_agent === agentId).length,
    received: collaborations.filter(c => c.target_agent === agentId).length
  }));

  // Toggle rule
  const toggleRule = (ruleId) => {
    setActiveRules(prev => 
      prev.includes(ruleId) ? prev.filter(r => r !== ruleId) : [...prev, ruleId]
    );
    toast.success(`Rule ${prev => prev.includes(ruleId) ? 'disabled' : 'enabled'}`);
  };

  // Trigger collaboration
  const triggerCollaboration = async (sourceAgent, targetAgent, triggerType, context = {}) => {
    const key = `${sourceAgent}-${targetAgent}`;
    setIsProcessing(prev => ({ ...prev, [key]: true }));

    try {
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

      // Critical trigger notification
      if (context.priority === 'critical') {
        notify('critical', `Critical collaboration triggered: ${triggerType}`, {
          duration: 10000
        });
      }

      // Auto-execute
      await executeCollaboration(collab);
    } catch (error) {
      toast.error('Failed to trigger collaboration');
    } finally {
      setIsProcessing(prev => ({ ...prev, [key]: false }));
    }
  };

  // Execute collaboration
  const executeCollaboration = async (collaboration) => {
    setIsProcessing(prev => ({ ...prev, [collaboration.id]: true }));

    try {
      let prompt = '';
      if (collaboration.target_agent === 'strategy_doc_generator') {
        prompt = `As Strategy Doc Generator, create a document for: ${collaboration.trigger_reason}. Context: ${JSON.stringify(collaboration.context)}. Return JSON with: title, executive_summary, sections[], recommendations[]`;
      } else if (collaboration.target_agent === 'knowledge_curator') {
        prompt = `As Knowledge Curator, respond to: ${collaboration.trigger_reason}. Context: ${JSON.stringify(collaboration.context)}. Return JSON with: suggested_links[], recommendations[]`;
      } else {
        prompt = `As Market Monitor, respond to: ${collaboration.trigger_reason}. Context: ${JSON.stringify(collaboration.context)}. Return JSON with: findings[], alerts[], recommendations[]`;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: collaboration.target_agent === 'market_monitor',
        response_json_schema: { type: "object", properties: { title: { type: "string" }, recommendations: { type: "array", items: { type: "string" } } } }
      });

      await base44.entities.AgentCollaboration.update(collaboration.id, { status: 'completed', result });
      queryClient.invalidateQueries(['agent-collaborations']);
      toast.success('Collaboration completed');
    } catch (error) {
      await base44.entities.AgentCollaboration.update(collaboration.id, { status: 'failed' });
      queryClient.invalidateQueries(['agent-collaborations']);
      toast.error('Collaboration failed');
    } finally {
      setIsProcessing(prev => ({ ...prev, [collaboration.id]: false }));
    }
  };

  // Delete collaboration
  const deleteCollaboration = async (id) => {
    await base44.entities.AgentCollaboration.delete(id);
    queryClient.invalidateQueries(['agent-collaborations']);
    toast.success('Collaboration deleted');
  };

  // Send message to agent
  const sendMessage = () => {
    if (!messageText.trim() || !selectedAgent) return;
    
    const newMessage = {
      id: Date.now(),
      from: 'user',
      to: selectedAgent,
      text: messageText,
      timestamp: new Date().toISOString()
    };
    
    saveMessages([...messages, newMessage]);
    setMessageText("");
    toast.success(`Message sent to ${AGENTS[selectedAgent].name}`);
    
    // Simulate agent response
    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        from: selectedAgent,
        to: 'user',
        text: `Acknowledged your message. Processing request...`,
        timestamp: new Date().toISOString()
      };
      saveMessages([...messages, newMessage, response]);
      
      // Trigger notification for agent response
      notify('message', `${AGENTS[selectedAgent].name}: Acknowledged your message`, {
        duration: 5000
      });
    }, 2000);
  };

  // Add shared task
  const addSharedTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      completed: false,
      assignedTo: null,
      createdAt: new Date().toISOString()
    };
    
    saveTasks([...sharedTasks, newTask]);
    setNewTaskTitle("");
    toast.success('Task added to shared workspace');
    notify('task', `New task created: ${newTaskTitle}`);
  };

  // Toggle task completion
  const toggleTask = (taskId) => {
    const updated = sharedTasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
  };

  // Assign task to agent
  const assignTask = (taskId, agentId) => {
    const task = sharedTasks.find(t => t.id === taskId);
    const updated = sharedTasks.map(t => 
      t.id === taskId ? { ...t, assignedTo: agentId } : t
    );
    saveTasks(updated);
    toast.success(`Task assigned to ${AGENTS[agentId].name}`);
    notify('task', `Task "${task.title}" assigned to ${AGENTS[agentId].name}`);
  };

  // Delete task
  const deleteTask = (taskId) => {
    saveTasks(sharedTasks.filter(t => t.id !== taskId));
    toast.success('Task deleted');
  };

  // Get status color
  const getPresenceColor = (status) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'busy': return '#f59e0b';
      case 'idle': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Network className="w-6 h-6 text-white" />
            </div>
            Agent Collaboration Hub
          </h1>
          <p className="text-slate-400 mt-1">Central command for autonomous agent interactions</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
            <Activity className="w-3 h-3 mr-1" />
            {stats.activeRules}/{stats.totalRules} Rules Active
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-3 py-1">
            <Clock className="w-3 h-3 mr-1" />
            {stats.pending} Pending
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Collaborations', value: stats.total, icon: GitMerge, color: 'cyan' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'green' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'yellow' },
          { label: 'Failed', value: stats.failed, icon: AlertTriangle, color: 'red' }
        ].map((stat, i) => (
          <Card key={i} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 text-${stat.color}-400 opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-cyan-500/20">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="workspace" className="data-[state=active]:bg-orange-500/20">
            <Users className="w-4 h-4 mr-2" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-pink-500/20">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
            {messages.filter(m => m.to === 'user' && m.from !== 'user').length > 0 && (
              <Badge className="ml-2 bg-pink-500 text-white text-xs px-1.5 py-0">
                {messages.filter(m => m.to === 'user' && m.from !== 'user').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-yellow-500/20">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="trigger" className="data-[state=active]:bg-purple-500/20">
            <Zap className="w-4 h-4 mr-2" />
            Trigger
          </TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-green-500/20">
            <Settings className="w-4 h-4 mr-2" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-blue-500/20">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Workspace Tab */}
        <TabsContent value="workspace" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Agent Presence Panel */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-cyan-400" />
                  Agent Presence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(agentPresence).map(([agentId, agent]) => {
                    const Icon = agent.icon;
                    return (
                      <div key={agentId} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-500/50 transition-all">
                        <div className="relative">
                          <Icon className="w-8 h-8" style={{ color: agent.color }} />
                          <div 
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900"
                            style={{ backgroundColor: getPresenceColor(agent.status) }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{agent.name}</p>
                          <p className="text-xs text-slate-400 capitalize">{agent.status}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAgent(agentId);
                            setShowMessageDialog(true);
                          }}
                          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Shared Task Workspace */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-orange-400" />
                  Shared Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Add a new task..."
                      className="bg-white/5 border-white/10 text-white"
                      onKeyDown={(e) => e.key === 'Enter' && addSharedTask()}
                    />
                    <Button onClick={addSharedTask} className="bg-orange-600 hover:bg-orange-700">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {sharedTasks.length === 0 ? (
                    <p className="text-slate-500 text-center py-8 text-sm">No tasks yet</p>
                  ) : (
                    sharedTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${task.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleTask(task.id)}
                          className="w-6 h-6 p-0"
                        >
                          {task.completed ? (
                            <CheckSquare className="w-5 h-5 text-green-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <p className={`text-sm ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                            {task.title}
                          </p>
                          {task.assignedTo && (
                            <p className="text-xs text-slate-400">
                              Assigned to {AGENTS[task.assignedTo]?.shortName}
                            </p>
                          )}
                        </div>
                        <Select value={task.assignedTo || ''} onValueChange={(value) => assignTask(task.id, value)}>
                          <SelectTrigger className="w-20 h-7 bg-white/5 border-white/10 text-xs">
                            <SelectValue placeholder="Assign" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(AGENTS).map(([id, agent]) => (
                              <SelectItem key={id} value={id}>{agent.shortName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteTask(task.id)}
                          className="w-6 h-6 p-0 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <div className="grid grid-cols-2 gap-6">
            <NotificationPreferences onSave={(prefs) => {
              if (prefs.desktopNotifications) {
                requestPermission();
              }
            }} />
            
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Notification History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <p className="text-xs text-slate-400 mb-4">Recent notifications from the past 24 hours</p>
                  {[
                    { type: 'message', text: 'New message from Market Monitor', time: '2 min ago', icon: MessageSquare, color: 'pink' },
                    { type: 'task', text: 'Task assigned: Review Q4 Strategy', time: '15 min ago', icon: CheckSquare, color: 'orange' },
                    { type: 'critical', text: 'Critical alert: Market volatility detected', time: '1 hour ago', icon: AlertTriangle, color: 'red' },
                    { type: 'message', text: 'Strategy Doc Generator completed analysis', time: '3 hours ago', icon: CheckCircle, color: 'green' }
                  ].map((notif, idx) => (
                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg bg-${notif.color}-500/10 border border-${notif.color}-500/30`}>
                      <notif.icon className={`w-4 h-4 text-${notif.color}-400 mt-0.5`} />
                      <div className="flex-1">
                        <p className="text-sm text-white">{notif.text}</p>
                        <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-pink-400" />
                Direct Agent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No messages yet. Start a conversation with an agent!</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto p-4 bg-black/20 rounded-lg">
                    {messages.map((msg) => {
                      const isUser = msg.from === 'user';
                      const agent = isUser ? AGENTS[msg.to] : AGENTS[msg.from];
                      const Icon = agent?.icon || Bot;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`}>
                            {isUser ? <UserCircle className="w-5 h-5 text-cyan-400" /> : <Icon className="w-5 h-5" style={{ color: agent?.color }} />}
                          </div>
                          <div className={`flex-1 max-w-md ${isUser ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-3 rounded-lg ${isUser ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-purple-500/20 border border-purple-500/30'}`}>
                              <p className="text-sm text-white">{msg.text}</p>
                              <p className="text-xs text-slate-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <Select value={selectedAgent || ''} onValueChange={setSelectedAgent}>
                    <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select agent..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AGENTS).map(([id, agent]) => (
                        <SelectItem key={id} value={id}>{agent.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-white/5 border-white/10 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={!selectedAgent}
                  />
                  <Button onClick={sendMessage} disabled={!selectedAgent || !messageText.trim()} className="bg-pink-600 hover:bg-pink-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Status Distribution */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                        {statusChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {statusChartData.map((s, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-xs text-slate-400">{s.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Agent Activity */}
            <Card className="col-span-2 bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Agent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={agentActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                      <YAxis tick={{ fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                      <Area type="monotone" dataKey="triggered" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Triggered" />
                      <Area type="monotone" dataKey="received" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Received" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Collaborations */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-yellow-400" />
                Active Collaborations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {collaborations.filter(c => c.status === 'pending' || c.status === 'in_progress').length === 0 ? (
                <p className="text-slate-500 text-center py-6">No active collaborations</p>
              ) : (
                <div className="space-y-2">
                  {collaborations.filter(c => c.status === 'pending' || c.status === 'in_progress').slice(0, 5).map((collab) => {
                    const SourceIcon = AGENTS[collab.source_agent]?.icon || Bot;
                    const TargetIcon = AGENTS[collab.target_agent]?.icon || Bot;
                    return (
                      <div key={collab.id} className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                        <SourceIcon className="w-5 h-5" style={{ color: AGENTS[collab.source_agent]?.color }} />
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                        <TargetIcon className="w-5 h-5" style={{ color: AGENTS[collab.target_agent]?.color }} />
                        <div className="flex-1">
                          <p className="text-sm text-white">{collab.trigger_reason}</p>
                        </div>
                        <Button size="sm" onClick={() => executeCollaboration(collab)} disabled={isProcessing[collab.id]} className="bg-yellow-600 hover:bg-yellow-700">
                          {isProcessing[collab.id] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trigger Tab */}
        <TabsContent value="trigger" className="mt-6">
          <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Manual Trigger Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {COLLABORATION_RULES.map((rule) => {
                  const SourceIcon = AGENTS[rule.source].icon;
                  const TargetIcon = AGENTS[rule.target].icon;
                  const key = `${rule.source}-${rule.target}`;
                  return (
                    <Card key={rule.id} className={`bg-white/5 border-white/10 hover:border-purple-500/50 transition-all ${!activeRules.includes(rule.id) ? 'opacity-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <SourceIcon className="w-5 h-5" style={{ color: AGENTS[rule.source].color }} />
                          <ArrowRight className="w-4 h-4 text-slate-500" />
                          <TargetIcon className="w-5 h-5" style={{ color: AGENTS[rule.target].color }} />
                          <Badge className={`ml-auto ${rule.priority === 'critical' ? 'bg-red-500/20 text-red-400' : rule.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {rule.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-white font-medium mb-1">{rule.action}</p>
                        <p className="text-xs text-slate-400 mb-3">{rule.description}</p>
                        <Button
                          size="sm"
                          onClick={() => triggerCollaboration(rule.source, rule.target, rule.trigger, { priority: rule.priority })}
                          disabled={isProcessing[key] || !activeRules.includes(rule.id)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          {isProcessing[key] ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          Trigger
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-400" />
                Automation Rules Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {COLLABORATION_RULES.map((rule) => {
                  const SourceIcon = AGENTS[rule.source].icon;
                  const TargetIcon = AGENTS[rule.target].icon;
                  const isActive = activeRules.includes(rule.id);
                  return (
                    <div key={rule.id} className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${isActive ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10 opacity-60'}`}>
                      <Switch checked={isActive} onCheckedChange={() => toggleRule(rule.id)} />
                      <div className="flex items-center gap-2">
                        <SourceIcon className="w-5 h-5" style={{ color: AGENTS[rule.source].color }} />
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                        <TargetIcon className="w-5 h-5" style={{ color: AGENTS[rule.target].color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{rule.action}</p>
                        <p className="text-xs text-slate-400">{rule.description}</p>
                      </div>
                      <Badge className={rule.priority === 'critical' ? 'bg-red-500/20 text-red-400' : rule.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : rule.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}>
                        {rule.priority}
                      </Badge>
                      <Badge className={isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                        {isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-400" />
                  Collaboration History
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-white/5 border-white/10 text-white w-48"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCollaborations.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No collaborations found</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredCollaborations.map((collab) => {
                    const SourceIcon = AGENTS[collab.source_agent]?.icon || Bot;
                    const TargetIcon = AGENTS[collab.target_agent]?.icon || Bot;
                    return (
                      <motion.div
                        key={collab.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          collab.status === 'completed' ? 'bg-green-500/10 border-green-500/30' :
                          collab.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30' :
                          'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <SourceIcon className="w-5 h-5" style={{ color: AGENTS[collab.source_agent]?.color }} />
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                        <TargetIcon className="w-5 h-5" style={{ color: AGENTS[collab.target_agent]?.color }} />
                        <div className="flex-1">
                          <p className="text-sm text-white">{collab.trigger_reason}</p>
                          <p className="text-xs text-slate-400">{new Date(collab.created_date).toLocaleString()}</p>
                        </div>
                        <Badge className={
                          collab.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          collab.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }>
                          {collab.status}
                        </Badge>
                        <Button size="icon" variant="ghost" onClick={() => deleteCollaboration(collab.id)} className="text-slate-400 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-400" />
              Message {selectedAgent ? AGENTS[selectedAgent]?.name : 'Agent'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="bg-white/5 border-white/10 text-white min-h-32"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMessageDialog(false)} className="border-white/20 text-white">
                Cancel
              </Button>
              <Button onClick={() => {
                sendMessage();
                setShowMessageDialog(false);
              }} className="bg-pink-600 hover:bg-pink-700">
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}