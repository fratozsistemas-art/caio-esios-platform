import React, { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Workflow, Eye, FileText, Brain, Zap, Play, Save, Trash2, Plus,
  Settings, ArrowRight, GitBranch, Clock, Database, AlertTriangle,
  CheckCircle, RefreshCw, MousePointer, Link2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const NODE_TYPES = {
  trigger: { label: 'Trigger', icon: Zap, color: '#f59e0b', category: 'control' },
  agent_market: { label: 'Market Monitor', icon: Eye, color: '#3b82f6', category: 'agent', agentId: 'market_monitor' },
  agent_strategy: { label: 'Strategy Doc', icon: FileText, color: '#a855f7', category: 'agent', agentId: 'strategy_doc_generator' },
  agent_knowledge: { label: 'Knowledge Curator', icon: Brain, color: '#10b981', category: 'agent', agentId: 'knowledge_curator' },
  condition: { label: 'Condition', icon: GitBranch, color: '#ec4899', category: 'control' },
  delay: { label: 'Delay', icon: Clock, color: '#6366f1', category: 'control' },
  data_transform: { label: 'Data Transform', icon: Database, color: '#14b8a6', category: 'data' }
};

const TRIGGER_TYPES = [
  { id: 'manual', label: 'Manual Trigger' },
  { id: 'schedule', label: 'Scheduled' },
  { id: 'collaboration_event', label: 'Collaboration Event' },
  { id: 'data_change', label: 'Data Change' },
  { id: 'alert_threshold', label: 'Alert Threshold' }
];

export default function VisualWorkflowBuilder({ workflowId, onSave, onClose }) {
  const canvasRef = useRef(null);
  const [workflow, setWorkflow] = useState({
    name: '',
    description: '',
    nodes: [],
    connections: [],
    triggers: [{ type: 'manual', config: {} }]
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [showNodeConfig, setShowNodeConfig] = useState(false);
  const [draggedType, setDraggedType] = useState(null);
  const queryClient = useQueryClient();

  // Load existing workflow
  const { data: existingWorkflow } = useQuery({
    queryKey: ['workflow-design', workflowId],
    queryFn: () => workflowId ? base44.entities.AgentWorkflowDesign.filter({ id: workflowId }) : null,
    enabled: !!workflowId
  });

  React.useEffect(() => {
    if (existingWorkflow?.[0]) {
      setWorkflow(existingWorkflow[0]);
    }
  }, [existingWorkflow]);

  // Save workflow
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (workflowId) {
        return await base44.entities.AgentWorkflowDesign.update(workflowId, data);
      }
      return await base44.entities.AgentWorkflowDesign.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workflow-designs']);
      toast.success('Workflow saved');
      onSave?.();
    }
  });

  // Add node
  const addNode = (type, x, y) => {
    const nodeType = NODE_TYPES[type];
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      agent_id: nodeType.agentId,
      position: { x: x || 200 + Math.random() * 400, y: y || 150 + Math.random() * 300 },
      config: {}
    };
    setWorkflow(w => ({ ...w, nodes: [...w.nodes, newNode] }));
  };

  // Delete node
  const deleteNode = (nodeId) => {
    setWorkflow(w => ({
      ...w,
      nodes: w.nodes.filter(n => n.id !== nodeId),
      connections: w.connections.filter(c => c.source_node !== nodeId && c.target_node !== nodeId)
    }));
    setSelectedNode(null);
  };

  // Start connection
  const startConnection = (nodeId) => {
    setIsConnecting(true);
    setConnectionStart(nodeId);
  };

  // Complete connection
  const completeConnection = (targetNodeId) => {
    if (connectionStart && connectionStart !== targetNodeId) {
      const exists = workflow.connections.some(
        c => c.source_node === connectionStart && c.target_node === targetNodeId
      );
      if (!exists) {
        setWorkflow(w => ({
          ...w,
          connections: [...w.connections, {
            id: `conn-${Date.now()}`,
            source_node: connectionStart,
            target_node: targetNodeId,
            condition: '',
            data_mapping: {}
          }]
        }));
      }
    }
    setIsConnecting(false);
    setConnectionStart(null);
  };

  // Handle canvas drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedType) {
      const rect = canvasRef.current.getBoundingClientRect();
      addNode(draggedType, e.clientX - rect.left - 50, e.clientY - rect.top - 25);
      setDraggedType(null);
    }
  };

  // Drag node
  const handleNodeDrag = (nodeId, e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 50;
    const y = e.clientY - rect.top - 25;
    setWorkflow(w => ({
      ...w,
      nodes: w.nodes.map(n => n.id === nodeId ? { ...n, position: { x, y } } : n)
    }));
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Left Sidebar - Node Palette */}
      <Card className="w-64 bg-white/5 border-white/10 flex-shrink-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Workflow className="w-4 h-4 text-purple-400" />
            Node Palette
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Triggers */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Triggers</p>
            <div
              draggable
              onDragStart={() => setDraggedType('trigger')}
              className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg cursor-grab hover:bg-yellow-500/20"
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white">Trigger</span>
            </div>
          </div>

          {/* Agents */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Agents</p>
            <div className="space-y-2">
              {['agent_market', 'agent_strategy', 'agent_knowledge'].map(type => {
                const node = NODE_TYPES[type];
                const Icon = node.icon;
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={() => setDraggedType(type)}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-grab hover:opacity-80"
                    style={{ backgroundColor: `${node.color}15`, border: `1px solid ${node.color}40` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: node.color }} />
                    <span className="text-sm text-white">{node.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Control */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Control Flow</p>
            <div className="space-y-2">
              {['condition', 'delay'].map(type => {
                const node = NODE_TYPES[type];
                const Icon = node.icon;
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={() => setDraggedType(type)}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-grab hover:opacity-80"
                    style={{ backgroundColor: `${node.color}15`, border: `1px solid ${node.color}40` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: node.color }} />
                    <span className="text-sm text-white">{node.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Data</p>
            <div
              draggable
              onDragStart={() => setDraggedType('data_transform')}
              className="flex items-center gap-2 p-2 bg-teal-500/10 border border-teal-500/30 rounded-lg cursor-grab hover:bg-teal-500/20"
            >
              <Database className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-white">Data Transform</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="flex-1 bg-slate-900/50 border-white/10 overflow-hidden">
        <CardHeader className="pb-2 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Input
                value={workflow.name}
                onChange={(e) => setWorkflow(w => ({ ...w, name: e.target.value }))}
                placeholder="Workflow Name"
                className="bg-white/5 border-white/10 text-white w-48"
              />
              <Select
                value={workflow.triggers?.[0]?.type || 'manual'}
                onValueChange={(val) => setWorkflow(w => ({ ...w, triggers: [{ type: val, config: {} }] }))}
              >
                <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => saveMutation.mutate(workflow)} className="border-green-500/30 text-green-400">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Play className="w-4 h-4 mr-1" />
                Test Run
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-full">
          <div
            ref={canvasRef}
            className="relative w-full h-[500px] bg-[#0a0f1a] overflow-auto"
            style={{ backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Connections SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {workflow.connections.map(conn => {
                const source = workflow.nodes.find(n => n.id === conn.source_node);
                const target = workflow.nodes.find(n => n.id === conn.target_node);
                if (!source || !target) return null;
                return (
                  <g key={conn.id}>
                    <line
                      x1={source.position.x + 50}
                      y1={source.position.y + 25}
                      x2={target.position.x + 50}
                      y2={target.position.y + 25}
                      stroke="#6366f1"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {workflow.nodes.map(node => {
              const nodeType = NODE_TYPES[node.type];
              const Icon = nodeType?.icon || Settings;
              const isSelected = selectedNode?.id === node.id;

              return (
                <motion.div
                  key={node.id}
                  drag
                  dragMomentum={false}
                  onDrag={(e, info) => handleNodeDrag(node.id, e)}
                  onClick={() => setSelectedNode(node)}
                  onDoubleClick={() => { setSelectedNode(node); setShowNodeConfig(true); }}
                  className={`absolute cursor-move p-3 rounded-lg border-2 transition-all ${
                    isSelected ? 'ring-2 ring-white/50' : ''
                  }`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    backgroundColor: `${nodeType?.color}20`,
                    borderColor: isSelected ? nodeType?.color : `${nodeType?.color}60`,
                    minWidth: 100
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" style={{ color: nodeType?.color }} />
                    <span className="text-xs text-white font-medium">{nodeType?.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{node.config?.action || 'Click to configure'}</p>
                  
                  {/* Connection Points */}
                  <div
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 cursor-crosshair flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); isConnecting ? completeConnection(node.id) : startConnection(node.id); }}
                  >
                    <Link2 className="w-2 h-2 text-white" />
                  </div>
                  <div
                    className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 cursor-crosshair flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); isConnecting && completeConnection(node.id); }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </motion.div>
              );
            })}

            {/* Empty State */}
            {workflow.nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MousePointer className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Drag nodes from the palette to build your workflow</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Sidebar - Node Config */}
      {selectedNode && (
        <Card className="w-72 bg-white/5 border-white/10 flex-shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                Node Configuration
              </span>
              <Button size="icon" variant="ghost" onClick={() => deleteNode(selectedNode.id)} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Node Type</label>
              <Badge style={{ backgroundColor: `${NODE_TYPES[selectedNode.type]?.color}30`, color: NODE_TYPES[selectedNode.type]?.color }}>
                {NODE_TYPES[selectedNode.type]?.label}
              </Badge>
            </div>

            {selectedNode.type.startsWith('agent_') && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Action</label>
                <Select
                  value={selectedNode.config?.action || ''}
                  onValueChange={(val) => {
                    setWorkflow(w => ({
                      ...w,
                      nodes: w.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, action: val } } : n)
                    }));
                  }}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white text-xs">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analyze">Analyze Data</SelectItem>
                    <SelectItem value="generate">Generate Output</SelectItem>
                    <SelectItem value="scan">Scan & Monitor</SelectItem>
                    <SelectItem value="link">Link Knowledge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedNode.type === 'condition' && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Condition</label>
                <Textarea
                  value={selectedNode.config?.condition || ''}
                  onChange={(e) => {
                    setWorkflow(w => ({
                      ...w,
                      nodes: w.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, condition: e.target.value } } : n)
                    }));
                  }}
                  placeholder="e.g., output.risk_level > 0.7"
                  className="bg-white/5 border-white/10 text-white text-xs h-20"
                />
              </div>
            )}

            {selectedNode.type === 'delay' && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Delay (minutes)</label>
                <Input
                  type="number"
                  value={selectedNode.config?.delay_minutes || 0}
                  onChange={(e) => {
                    setWorkflow(w => ({
                      ...w,
                      nodes: w.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, delay_minutes: parseInt(e.target.value) } } : n)
                    }));
                  }}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 block mb-1">Description</label>
              <Textarea
                value={selectedNode.config?.description || ''}
                onChange={(e) => {
                  setWorkflow(w => ({
                    ...w,
                    nodes: w.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, description: e.target.value } } : n)
                  }));
                }}
                placeholder="What does this step do?"
                className="bg-white/5 border-white/10 text-white text-xs h-16"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}