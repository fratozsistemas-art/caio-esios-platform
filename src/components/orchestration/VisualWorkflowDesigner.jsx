import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, Trash2, Save, Play, Settings, ArrowRight, 
  GitBranch, Zap, RefreshCw, AlertCircle, CheckCircle,
  Move, Link2, Unlink, Copy, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AGENT_TYPES = [
  { value: 'research', label: 'Research', color: '#00D4FF', icon: '🔍' },
  { value: 'analysis', label: 'Analysis', color: '#FFB800', icon: '📊' },
  { value: 'synthesis', label: 'Synthesis', color: '#22C55E', icon: '🧩' },
  { value: 'extraction', label: 'Extraction', color: '#A855F7', icon: '📤' },
  { value: 'enrichment', label: 'Enrichment', color: '#EC4899', icon: '✨' },
  { value: 'validation', label: 'Validation', color: '#F97316', icon: '✅' },
  { value: 'decision', label: 'Decision', color: '#EF4444', icon: '🔀' },
  { value: 'correction', label: 'Self-Correct', color: '#6366F1', icon: '🔄' }
];

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;

export default function VisualWorkflowDesigner({ 
  workflow, 
  onChange, 
  onSave,
  isExecuting = false,
  executionState = {}
}) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState(workflow?.steps || []);
  const [connections, setConnections] = useState(workflow?.connections || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (workflow?.steps) {
      setNodes(workflow.steps.map((step, idx) => ({
        ...step,
        position: step.position || { x: 100 + (idx % 3) * 250, y: 100 + Math.floor(idx / 3) * 150 }
      })));
    }
    if (workflow?.connections) {
      setConnections(workflow.connections);
    }
  }, [workflow]);

  const handleNodeDragStart = (e, node) => {
    if (isConnecting) return;
    setIsDragging(true);
    setSelectedNode(node.id);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = useCallback((e) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const x = (e.clientX - canvasRect.left - canvasOffset.x) / zoom;
    const y = (e.clientY - canvasRect.top - canvasOffset.y) / zoom;
    setMousePos({ x, y });

    if (isDragging && selectedNode) {
      setNodes(prev => prev.map(node => 
        node.id === selectedNode 
          ? { ...node, position: { x: x - dragOffset.x, y: y - dragOffset.y } }
          : node
      ));
    }
  }, [isDragging, selectedNode, dragOffset, canvasOffset, zoom]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      notifyChange();
    }
    if (isConnecting) {
      setIsConnecting(false);
      setConnectingFrom(null);
    }
  }, [isDragging, isConnecting]);

  const notifyChange = useCallback(() => {
    onChange?.({
      ...workflow,
      steps: nodes,
      connections
    });
  }, [nodes, connections, workflow, onChange]);

  const addNode = (type) => {
    const newNode = {
      id: `step_${Date.now()}`,
      name: `New ${type} Step`,
      agent_type: type,
      config: {},
      dependencies: [],
      retry_config: { max_retries: 2, retry_delay_seconds: 5 },
      timeout_seconds: 60,
      position: { x: 200 + Math.random() * 100, y: 200 + Math.random() * 100 }
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode.id);
  };

  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from_step !== nodeId && c.to_step !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  const startConnection = (nodeId) => {
    setIsConnecting(true);
    setConnectingFrom(nodeId);
  };

  const completeConnection = (toNodeId) => {
    if (connectingFrom && connectingFrom !== toNodeId) {
      const exists = connections.some(c => c.from_step === connectingFrom && c.to_step === toNodeId);
      if (!exists) {
        setConnections([...connections, {
          from_step: connectingFrom,
          to_step: toNodeId,
          condition: 'always',
          data_mapping: {}
        }]);
      }
    }
    setIsConnecting(false);
    setConnectingFrom(null);
  };

  const deleteConnection = (fromStep, toStep) => {
    setConnections(connections.filter(c => !(c.from_step === fromStep && c.to_step === toStep)));
  };

  const duplicateNode = (node) => {
    const newNode = {
      ...node,
      id: `step_${Date.now()}`,
      name: `${node.name} (Copy)`,
      position: { x: node.position.x + 50, y: node.position.y + 50 }
    };
    setNodes([...nodes, newNode]);
  };

  const getNodeCenter = (node) => ({
    x: (node.position?.x || 0) + NODE_WIDTH / 2,
    y: (node.position?.y || 0) + NODE_HEIGHT / 2
  });

  const getNodeStatus = (nodeId) => {
    if (!isExecuting) return 'idle';
    return executionState[nodeId]?.status || 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return '#00D4FF';
      case 'completed': return '#22C55E';
      case 'failed': return '#EF4444';
      case 'retrying': return '#F97316';
      case 'correcting': return '#6366F1';
      default: return '#64748B';
    }
  };

  return (
    <Card className="bg-slate-900 border-white/10 overflow-hidden">
      <CardHeader className="border-b border-white/10 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-400" />
            Visual Workflow Designer
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                className="h-7 w-7 p-0 text-slate-400"
              >
                -
              </Button>
              <span className="text-xs text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                className="h-7 w-7 p-0 text-slate-400"
              >
                +
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setZoom(1); setCanvasOffset({ x: 0, y: 0 }); }}
              className="text-slate-400"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex">
          {/* Toolbox */}
          <div className="w-48 border-r border-white/10 p-3 space-y-2 bg-slate-900/50">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Agent Types</p>
            {AGENT_TYPES.map(type => (
              <Button
                key={type.value}
                onClick={() => addNode(type.value)}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-white/10"
                style={{ borderLeft: `3px solid ${type.color}` }}
              >
                <span className="mr-2">{type.icon}</span>
                <span className="text-white text-sm">{type.label}</span>
              </Button>
            ))}
          </div>

          {/* Canvas */}
          <div 
            ref={canvasRef}
            className="flex-1 h-[500px] bg-slate-950 relative overflow-hidden cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
              {connections.map((conn, idx) => {
                const fromNode = nodes.find(n => n.id === conn.from_step);
                const toNode = nodes.find(n => n.id === conn.to_step);
                if (!fromNode || !toNode) return null;
                
                const from = getNodeCenter(fromNode);
                const to = getNodeCenter(toNode);
                const midX = (from.x + to.x) / 2;
                
                return (
                  <g key={idx}>
                    <path
                      d={`M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
                      fill="none"
                      stroke="#6366F1"
                      strokeWidth="2"
                      strokeDasharray={conn.condition !== 'always' ? '5,5' : 'none'}
                      className="transition-all duration-300"
                    />
                    <circle cx={to.x} cy={to.y} r="4" fill="#6366F1" />
                  </g>
                );
              })}
              
              {/* Active connection being drawn */}
              {isConnecting && connectingFrom && (
                <line
                  x1={getNodeCenter(nodes.find(n => n.id === connectingFrom))?.x || 0}
                  y1={getNodeCenter(nodes.find(n => n.id === connectingFrom))?.y || 0}
                  x2={mousePos.x}
                  y2={mousePos.y}
                  stroke="#00D4FF"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              )}
            </svg>

            {/* Nodes */}
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
              <AnimatePresence>
                {nodes.map(node => {
                  const agentType = AGENT_TYPES.find(t => t.value === node.agent_type);
                  const status = getNodeStatus(node.id);
                  const isSelected = selectedNode === node.id;
                  
                  return (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`absolute cursor-move select-none ${isSelected ? 'z-10' : 'z-0'}`}
                      style={{
                        left: node.position?.x || 0,
                        top: node.position?.y || 0,
                        width: NODE_WIDTH,
                        height: NODE_HEIGHT
                      }}
                      onMouseDown={(e) => handleNodeDragStart(e, node)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isConnecting) {
                          completeConnection(node.id);
                        } else {
                          setSelectedNode(node.id);
                        }
                      }}
                    >
                      <div 
                        className={`h-full rounded-xl border-2 transition-all duration-200 ${
                          isSelected ? 'border-white shadow-lg shadow-white/20' : 'border-white/20'
                        }`}
                        style={{ 
                          background: `linear-gradient(135deg, ${agentType?.color}20, ${agentType?.color}10)`,
                          boxShadow: status === 'running' ? `0 0 20px ${agentType?.color}50` : undefined
                        }}
                      >
                        {/* Status indicator */}
                        <div 
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900"
                          style={{ backgroundColor: getStatusColor(status) }}
                        >
                          {status === 'running' && (
                            <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: getStatusColor(status), opacity: 0.5 }} />
                          )}
                        </div>

                        <div className="p-3 h-full flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{agentType?.icon}</span>
                            <span className="text-xs font-medium text-white truncate flex-1">
                              {node.name}
                            </span>
                          </div>
                          <Badge 
                            className="text-[10px] w-fit"
                            style={{ backgroundColor: `${agentType?.color}30`, color: agentType?.color }}
                          >
                            {agentType?.label}
                          </Badge>

                          {/* Action buttons on hover */}
                          {isSelected && (
                            <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); startConnection(node.id); }}
                                className="h-6 w-6 p-0 bg-purple-600 hover:bg-purple-700"
                              >
                                <Link2 className="w-3 h-3 text-white" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); duplicateNode(node); }}
                                className="h-6 w-6 p-0 bg-blue-600 hover:bg-blue-700"
                              >
                                <Copy className="w-3 h-3 text-white" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                                className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700"
                              >
                                <Trash2 className="w-3 h-3 text-white" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Properties Panel */}
          {selectedNode && (
            <div className="w-64 border-l border-white/10 p-4 bg-slate-900/50 space-y-4">
              <h3 className="text-sm font-semibold text-white">Step Properties</h3>
              {(() => {
                const node = nodes.find(n => n.id === selectedNode);
                if (!node) return null;
                
                return (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400">Name</label>
                      <Input
                        value={node.name}
                        onChange={(e) => setNodes(nodes.map(n => 
                          n.id === selectedNode ? { ...n, name: e.target.value } : n
                        ))}
                        className="mt-1 h-8 bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Timeout (seconds)</label>
                      <Input
                        type="number"
                        value={node.timeout_seconds || 60}
                        onChange={(e) => setNodes(nodes.map(n => 
                          n.id === selectedNode ? { ...n, timeout_seconds: parseInt(e.target.value) } : n
                        ))}
                        className="mt-1 h-8 bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Max Retries</label>
                      <Input
                        type="number"
                        value={node.retry_config?.max_retries || 2}
                        onChange={(e) => setNodes(nodes.map(n => 
                          n.id === selectedNode ? { 
                            ...n, 
                            retry_config: { ...n.retry_config, max_retries: parseInt(e.target.value) }
                          } : n
                        ))}
                        className="mt-1 h-8 bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-slate-500 mb-2">Connections</p>
                      {connections.filter(c => c.from_step === selectedNode || c.to_step === selectedNode).map((conn, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1">
                          <span className="text-slate-400">
                            {conn.from_step === selectedNode ? '→ ' : '← '}
                            {nodes.find(n => n.id === (conn.from_step === selectedNode ? conn.to_step : conn.from_step))?.name || 'Unknown'}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteConnection(conn.from_step, conn.to_step)}
                            className="h-5 w-5 p-0 text-red-400 hover:text-red-300"
                          >
                            <Unlink className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Bottom toolbar */}
        <div className="border-t border-white/10 p-3 flex items-center justify-between bg-slate-900/80">
          <div className="text-xs text-slate-500">
            {nodes.length} nodes · {connections.length} connections
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={notifyChange}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Play className="w-4 h-4 mr-2" />
              Save & Activate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}