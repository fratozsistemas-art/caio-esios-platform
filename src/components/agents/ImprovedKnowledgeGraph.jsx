import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Network, Brain, FileText, MessageSquare, Eye, Zap, RefreshCw,
  ZoomIn, ZoomOut, Maximize2, Filter, Sparkles, Move, MousePointer
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const NODE_TYPES = {
  analysis: { color: '#3b82f6', label: 'Analysis' },
  knowledge_item: { color: '#10b981', label: 'Knowledge' },
  agent_feedback: { color: '#a855f7', label: 'Feedback' },
  agent: { color: '#f59e0b', label: 'Agent' }
};

const NODE_ICONS = {
  analysis: '📊',
  knowledge_item: '📚',
  agent_feedback: '💬',
  agent: '🤖'
};

export default function ImprovedKnowledgeGraph() {
  const containerRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });

  // Fetch data
  const { data: analyses = [] } = useQuery({
    queryKey: ['analyses-graph'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 50)
  });

  const { data: knowledgeItems = [] } = useQuery({
    queryKey: ['knowledge-items-graph'],
    queryFn: () => base44.entities.KnowledgeItem.list('-created_date', 50)
  });

  const { data: agentFeedback = [] } = useQuery({
    queryKey: ['agent-feedback-graph'],
    queryFn: () => base44.entities.AgentFeedback.list('-created_date', 100)
  });

  // Generate graph with compact layout
  const generateGraph = async () => {
    setIsGenerating(true);
    try {
      const graphNodes = [];
      const graphEdges = [];

      // Compact layout - all nodes within visible area
      const width = 750;
      const height = 420;
      const padding = 50;

      // Add agent nodes in center row
      const agentIds = ['market_monitor', 'strategy_doc_generator', 'knowledge_curator'];
      agentIds.forEach((agentId, idx) => {
        graphNodes.push({
          id: `agent-${agentId}`,
          type: 'agent',
          label: agentId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          x: padding + 120 + idx * 220,
          y: height / 2,
          size: 28,
          data: { agentId }
        });
      });

      // Add analysis nodes - top row, evenly spaced
      const maxAnalyses = Math.min(analyses.length, 6);
      const analysisSpacing = (width - padding * 2) / Math.max(maxAnalyses, 1);
      analyses.slice(0, maxAnalyses).forEach((analysis, idx) => {
        graphNodes.push({
          id: `analysis-${analysis.id}`,
          type: 'analysis',
          label: (analysis.title || 'Analysis').slice(0, 12),
          x: padding + analysisSpacing * idx + analysisSpacing / 2,
          y: padding + 30,
          size: 20,
          data: analysis
        });
      });

      // Add knowledge items - bottom row, evenly spaced
      const maxKnowledge = Math.min(knowledgeItems.length, 6);
      const knowledgeSpacing = (width - padding * 2) / Math.max(maxKnowledge, 1);
      knowledgeItems.slice(0, maxKnowledge).forEach((item, idx) => {
        graphNodes.push({
          id: `knowledge-${item.id}`,
          type: 'knowledge_item',
          label: (item.title || 'Knowledge').slice(0, 12),
          x: padding + knowledgeSpacing * idx + knowledgeSpacing / 2,
          y: height - padding - 20,
          size: 18,
          data: item
        });
      });

      // Add feedback nodes - around agents
      const maxFeedback = Math.min(agentFeedback.length, 6);
      agentFeedback.slice(0, maxFeedback).forEach((fb, idx) => {
        const agentNode = graphNodes.find(n => n.id === `agent-${fb.agent_id}`);
        const baseX = agentNode ? agentNode.x : padding + 120 + (idx % 3) * 220;
        const offsetX = (idx % 2 === 0 ? -50 : 50);
        const offsetY = (idx < 3 ? -60 : 60);
        graphNodes.push({
          id: `feedback-${fb.id}`,
          type: 'agent_feedback',
          label: `${fb.feedback_type?.slice(0, 6) || 'fb'} ${fb.rating ? `${fb.rating}★` : ''}`,
          x: baseX + offsetX,
          y: height / 2 + offsetY,
          size: 14,
          data: fb
        });
      });

      // Create edges for feedback -> agent
      agentFeedback.slice(0, maxFeedback).forEach(fb => {
        const fbNode = graphNodes.find(n => n.id === `feedback-${fb.id}`);
        const agentNode = graphNodes.find(n => n.id === `agent-${fb.agent_id}`);
        if (fbNode && agentNode) {
          graphEdges.push({
            id: `edge-fb-${fb.id}`,
            source: fbNode.id,
            target: agentNode.id,
            strength: (fb.rating || 3) / 5,
            label: 'trains'
          });
        }
      });

      // Create some analysis-knowledge connections - limit to avoid clutter
      analyses.slice(0, 4).forEach(analysis => {
        const relatedKnowledge = knowledgeItems.slice(0, maxKnowledge).find(k => 
          k.type === analysis.type || 
          k.tags?.some(t => analysis.tags?.includes(t))
        );
        if (relatedKnowledge) {
          const aNode = graphNodes.find(n => n.id === `analysis-${analysis.id}`);
          const kNode = graphNodes.find(n => n.id === `knowledge-${relatedKnowledge.id}`);
          if (aNode && kNode) {
            graphEdges.push({
              id: `edge-ak-${analysis.id}`,
              source: aNode.id,
              target: kNode.id,
              strength: 0.5,
              label: 'relates'
            });
          }
        }
      });

      setNodes(graphNodes);
      setEdges(graphEdges);
      toast.success(`Graph: ${graphNodes.length} nodes, ${graphEdges.length} edges`);
    } catch (error) {
      toast.error('Failed to generate graph');
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter nodes
  const visibleNodes = filter === 'all' ? nodes : nodes.filter(n => n.type === filter);
  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));

  // Mouse handlers
  const handleMouseDown = (e, node = null) => {
    if (node) {
      setDragNode(node.id);
      setIsDragging(true);
    } else {
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && dragNode) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setNodes(prev => prev.map(n => n.id === dragNode ? { ...n, x, y } : n));
    } else if (isPanning) {
      const dx = e.clientX - lastPanPos.x;
      const dy = e.clientY - lastPanPos.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragNode(null);
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.3, Math.min(2, z * delta)));
  };

  // Stats
  const stats = {
    analyses: visibleNodes.filter(n => n.type === 'analysis').length,
    knowledge: visibleNodes.filter(n => n.type === 'knowledge_item').length,
    feedback: visibleNodes.filter(n => n.type === 'agent_feedback').length,
    connections: visibleEdges.length
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-green-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg">AI Knowledge Graph</span>
              <p className="text-xs text-slate-400 font-normal">
                Interactive visualization • Drag nodes to rearrange
              </p>
            </div>
            <div className="ml-auto flex gap-2 items-center">
              <div className="flex items-center gap-2 mr-4">
                <span className="text-xs text-slate-400">Zoom</span>
                <Slider
                  value={[zoom * 50]}
                  min={15}
                  max={100}
                  step={5}
                  onValueChange={([v]) => setZoom(v / 50)}
                  className="w-24"
                />
                <span className="text-xs text-white w-8">{Math.round(zoom * 100)}%</span>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-36 bg-white/5 border-white/20 text-white text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="agent">Agents</SelectItem>
                  <SelectItem value="analysis">Analyses</SelectItem>
                  <SelectItem value="knowledge_item">Knowledge</SelectItem>
                  <SelectItem value="agent_feedback">Feedback</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="border-white/20 text-white">
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={generateGraph} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700">
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span className="ml-1">Generate</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Analyses', value: stats.analyses, color: '#3b82f6' },
          { label: 'Knowledge', value: stats.knowledge, color: '#10b981' },
          { label: 'Feedback', value: stats.feedback, color: '#a855f7' },
          { label: 'Connections', value: stats.connections, color: '#06b6d4' }
        ].map((s, i) => (
          <Card key={i} className="bg-white/5 border-white/10">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graph Container */}
      <Card className="bg-slate-900/50 border-white/10 overflow-hidden">
        <CardContent className="p-2">
          <div
            ref={containerRef}
            className="relative w-full h-[420px] bg-slate-950 rounded-lg cursor-grab active:cursor-grabbing"
            style={{ backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
            >
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" fillOpacity="0.6" />
                </marker>
              </defs>
              {/* Edges */}
              {visibleEdges.map(edge => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                if (!source || !target) return null;
                
                return (
                  <g key={edge.id}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={`rgba(99, 102, 241, ${edge.strength || 0.4})`}
                      strokeWidth={Math.max(1, edge.strength * 3)}
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            <div 
              className="absolute inset-0"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
            >
              {visibleNodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode?.id === node.id;
                
                return (
                  <motion.div
                    key={node.id}
                    className="absolute cursor-pointer"
                    style={{
                      left: node.x - node.size,
                      top: node.y - node.size,
                      width: node.size * 2,
                      height: node.size * 2,
                    }}
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, node); }}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}
                    whileHover={{ scale: 1.1 }}
                    animate={{ 
                      scale: isSelected ? 1.2 : 1,
                      boxShadow: isSelected ? `0 0 20px ${NODE_TYPES[node.type].color}` : 'none'
                    }}
                  >
                    <div 
                      className={`w-full h-full rounded-full flex items-center justify-center border-2 transition-all ${isSelected ? 'border-white' : 'border-transparent'}`}
                      style={{ 
                        backgroundColor: NODE_TYPES[node.type].color,
                        boxShadow: isHovered ? `0 0 15px ${NODE_TYPES[node.type].color}80` : 'none'
                      }}
                    >
                      <span className="text-lg">{NODE_ICONS[node.type]}</span>
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                      <span className="text-[10px] text-slate-400 bg-slate-900/80 px-1 rounded">
                        {node.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Network className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">Click "Generate" to build the knowledge graph</p>
                </div>
              </div>
            )}

            {/* Controls hint */}
            <div className="absolute bottom-3 left-3 flex gap-2">
              <Badge className="bg-slate-800/80 text-slate-400 text-[10px]">
                <MousePointer className="w-3 h-3 mr-1" />
                Click to select
              </Badge>
              <Badge className="bg-slate-800/80 text-slate-400 text-[10px]">
                <Move className="w-3 h-3 mr-1" />
                Drag to move
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border" style={{ backgroundColor: `${NODE_TYPES[selectedNode.type].color}15`, borderColor: `${NODE_TYPES[selectedNode.type].color}50` }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${NODE_TYPES[selectedNode.type].color}30` }}
                >
                  {NODE_ICONS[selectedNode.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge style={{ backgroundColor: `${NODE_TYPES[selectedNode.type].color}30`, color: NODE_TYPES[selectedNode.type].color }}>
                      {NODE_TYPES[selectedNode.type].label}
                    </Badge>
                    <Badge className="bg-white/10 text-slate-400">
                      {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} connections
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedNode.label}</h3>
                  {selectedNode.data?.type && (
                    <p className="text-sm text-slate-400 mt-1">Type: {selectedNode.data.type}</p>
                  )}
                  {selectedNode.data?.rating && (
                    <p className="text-sm text-slate-400">Rating: {selectedNode.data.rating}/5</p>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedNode(null)} className="text-slate-400">
                  ✕
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex gap-6 justify-center">
        {Object.entries(NODE_TYPES).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.color }} />
            <span className="text-xs text-slate-400">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}