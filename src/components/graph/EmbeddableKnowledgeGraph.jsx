import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Filter, ZoomIn, ZoomOut, Maximize2, Eye, Minimize2,
  Network, Building2, Users, Target, ExternalLink, Loader2,
  Code, TrendingUp, DollarSign, Database, GitMerge, Sparkles,
  ChevronRight, Info, X, Play, Pause, RotateCcw
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const NODE_CONFIG = {
  company: { color: '#3b82f6', icon: Building2, label: 'Company' },
  person: { color: '#8b5cf6', icon: Users, label: 'Person' },
  executive: { color: '#8b5cf6', icon: Users, label: 'Executive' },
  technology: { color: '#06b6d4', icon: Code, label: 'Technology' },
  market: { color: '#10b981', icon: TrendingUp, label: 'Market' },
  strategy: { color: '#f59e0b', icon: Target, label: 'Strategy' },
  investor: { color: '#10b981', icon: DollarSign, label: 'Investor' },
  framework: { color: '#ec4899', icon: GitMerge, label: 'Framework' },
  metric: { color: '#84cc16', icon: Database, label: 'Metric' }
};

export default function EmbeddableKnowledgeGraph({ 
  contextEntities = [], 
  contextType = "analysis",
  title = "Strategic Connections",
  height = 500,
  showFullScreenButton = true,
  onEntitySelect
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [activeTab, setActiveTab] = useState("graph");
  const animationRef = useRef(null);

  const width = 900;
  const graphHeight = height - 60;

  // Fetch graph data
  const { data: nodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ['embeddable_graph_nodes'],
    queryFn: () => base44.entities.KnowledgeGraphNode.list('-created_date', 200)
  });

  const { data: relationships = [], isLoading: relsLoading } = useQuery({
    queryKey: ['embeddable_graph_relationships'],
    queryFn: () => base44.entities.KnowledgeGraphRelationship.list('-created_date', 500)
  });

  // Filter nodes based on context
  const relevantNodes = React.useMemo(() => {
    if (contextEntities.length === 0) return nodes;
    
    const contextLabels = contextEntities.map(e => e.toLowerCase());
    const directMatches = nodes.filter(n => 
      contextLabels.some(label => 
        n.label?.toLowerCase().includes(label) || 
        label.includes(n.label?.toLowerCase())
      )
    );

    const directIds = new Set(directMatches.map(n => n.id));
    const connectedIds = new Set();
    
    relationships.forEach(r => {
      if (directIds.has(r.from_node_id)) connectedIds.add(r.to_node_id);
      if (directIds.has(r.to_node_id)) connectedIds.add(r.from_node_id);
    });

    const connectedNodes = nodes.filter(n => connectedIds.has(n.id) && !directIds.has(n.id));
    return [...directMatches, ...connectedNodes.slice(0, 30)];
  }, [nodes, relationships, contextEntities]);

  const relevantNodeIds = new Set(relevantNodes.map(n => n.id));
  const relevantRelationships = relationships.filter(r => 
    relevantNodeIds.has(r.from_node_id) && relevantNodeIds.has(r.to_node_id)
  );

  // Force-directed layout
  useEffect(() => {
    if (relevantNodes.length === 0) return;

    const nodesArray = relevantNodes.map(n => ({
      ...n,
      x: Math.random() * width * 0.8 + width * 0.1,
      y: Math.random() * graphHeight * 0.8 + graphHeight * 0.1,
      vx: 0,
      vy: 0
    }));

    const iterations = 300;
    const repulsion = 6000;
    const attraction = 0.06;
    const damping = 0.85;
    const centerForce = 0.015;

    for (let iter = 0; iter < iterations; iter++) {
      nodesArray.forEach(node => { node.fx = 0; node.fy = 0; });

      for (let i = 0; i < nodesArray.length; i++) {
        for (let j = i + 1; j < nodesArray.length; j++) {
          const dx = nodesArray[j].x - nodesArray[i].x;
          const dy = nodesArray[j].y - nodesArray[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);
          
          nodesArray[i].fx -= (dx / dist) * force;
          nodesArray[i].fy -= (dy / dist) * force;
          nodesArray[j].fx += (dx / dist) * force;
          nodesArray[j].fy += (dy / dist) * force;
        }
      }

      relevantRelationships.forEach(rel => {
        const source = nodesArray.find(n => n.id === rel.from_node_id);
        const target = nodesArray.find(n => n.id === rel.to_node_id);
        
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = dist * attraction;

          source.fx += (dx / dist) * force;
          source.fy += (dy / dist) * force;
          target.fx -= (dx / dist) * force;
          target.fy -= (dy / dist) * force;
        }
      });

      nodesArray.forEach(node => {
        node.fx += (width / 2 - node.x) * centerForce;
        node.fy += (graphHeight / 2 - node.y) * centerForce;
      });

      nodesArray.forEach(node => {
        node.vx = (node.vx + node.fx) * damping;
        node.vy = (node.vy + node.fy) * damping;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(60, Math.min(width - 60, node.x));
        node.y = Math.max(60, Math.min(graphHeight - 60, node.y));
      });
    }

    const nodeMap = {};
    nodesArray.forEach(node => { nodeMap[node.id] = node; });
    setNodePositions(nodeMap);
  }, [relevantNodes, relevantRelationships, width, graphHeight]);

  // Animation for pulse effect
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }
    
    let time = 0;
    const animate = () => {
      time += 0.02;
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAnimating]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.4));
  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.closest('.graph-edge')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    if (onEntitySelect) onEntitySelect(node);
  };

  const filteredNodes = Object.values(nodePositions).filter(node => {
    const matchesSearch = !searchTerm || node.label?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || node.node_type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredRelationships = relevantRelationships.filter(r =>
    filteredNodeIds.has(r.from_node_id) && filteredNodeIds.has(r.to_node_id)
  );

  const nodeTypes = [...new Set(relevantNodes.map(n => n.node_type))].filter(Boolean);

  const getConnectedNodes = (nodeId) => {
    return relevantRelationships.filter(r => 
      r.from_node_id === nodeId || r.to_node_id === nodeId
    ).map(r => r.from_node_id === nodeId ? r.to_node_id : r.from_node_id);
  };

  const isLoading = nodesLoading || relsLoading;

  const GraphContent = ({ fullScreen = false }) => (
    <div className={`relative ${fullScreen ? 'h-full' : ''}`}>
      {/* Controls */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <div className="flex bg-slate-800/95 rounded-lg border border-white/10 overflow-hidden">
          <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-white hover:bg-white/10 h-8 w-8 rounded-none">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-white hover:bg-white/10 h-8 w-8 rounded-none border-x border-white/10">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleResetView} className="text-white hover:bg-white/10 h-8 w-8 rounded-none">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAnimating(!isAnimating)}
          className="bg-slate-800/95 border border-white/10 text-white hover:bg-white/10 h-8 w-8"
        >
          {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="pl-7 h-8 w-40 bg-slate-800/95 border-white/10 text-white text-xs"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-8 w-32 bg-slate-800/95 border-white/10 text-white text-xs">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {nodeTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showFullScreenButton && !fullScreen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullScreen(true)}
            className="bg-slate-800/95 border border-white/10 text-white hover:bg-white/10 h-8 w-8"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* SVG Canvas */}
      <div 
        className="w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        style={{ height: fullScreen ? 'calc(100vh - 200px)' : graphHeight }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`${-pan.x / zoom} ${-pan.y / zoom} ${width / zoom} ${graphHeight / zoom}`}
            className="cursor-move"
          >
            <defs>
              <marker id="arrow-embeddable" markerWidth="8" markerHeight="8" refX="20" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#64748b" opacity="0.5" />
              </marker>
              <filter id="glow-embeddable">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx={width/2} cy={graphHeight/2} r={Math.min(width, graphHeight) * 0.4} fill="url(#bg-gradient)" />

            {/* Edges */}
            <g className="edges">
              {filteredRelationships.map((rel, idx) => {
                const source = nodePositions[rel.from_node_id];
                const target = nodePositions[rel.to_node_id];
                if (!source || !target) return null;

                const isHighlighted = selectedNode?.id === rel.from_node_id || selectedNode?.id === rel.to_node_id;

                return (
                  <g key={idx}>
                    <line
                      className="graph-edge"
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isHighlighted ? "#60a5fa" : "#475569"}
                      strokeWidth={isHighlighted ? "2" : "1"}
                      strokeOpacity={isHighlighted ? "0.8" : "0.3"}
                      markerEnd="url(#arrow-embeddable)"
                    />
                    {isHighlighted && rel.relationship_type && (
                      <text
                        x={(source.x + target.x) / 2}
                        y={(source.y + target.y) / 2 - 5}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="8"
                        className="pointer-events-none"
                      >
                        {rel.relationship_type}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {filteredNodes.map((node) => {
                const config = NODE_CONFIG[node.node_type] || { color: '#64748b', icon: Network };
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode?.id === node.id;
                const isContext = contextEntities.some(e => 
                  node.label?.toLowerCase().includes(e.toLowerCase())
                );
                const radius = isSelected ? 14 : isHovered ? 12 : isContext ? 11 : 9;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {(isSelected || isHovered || isContext) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius + 8}
                        fill={config.color}
                        opacity={isSelected ? 0.25 : 0.15}
                        filter="url(#glow-embeddable)"
                      />
                    )}

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      fill={config.color}
                      stroke={isSelected ? '#fff' : isContext ? config.color : '#334155'}
                      strokeWidth={isSelected ? 2.5 : isContext ? 2 : 1}
                      opacity={isHovered || isSelected ? 1 : 0.85}
                    />

                    <text
                      x={node.x}
                      y={node.y - radius - 5}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={isSelected ? "11" : "9"}
                      fontWeight={isSelected || isContext ? "600" : "normal"}
                      className="pointer-events-none select-none"
                    >
                      {node.label?.length > 20 ? node.label.substring(0, 20) + '...' : node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-3 left-3 flex gap-3">
        <Badge className="bg-slate-800/95 text-slate-300 border-white/10 text-xs">
          {filteredNodes.length} nodes
        </Badge>
        <Badge className="bg-slate-800/95 text-slate-300 border-white/10 text-xs">
          {filteredRelationships.length} connections
        </Badge>
        <Badge className="bg-slate-800/95 text-cyan-400 border-cyan-500/30 text-xs">
          {Math.round(zoom * 100)}%
        </Badge>
      </div>

      {/* Selected Node Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-3 right-3 w-64 bg-slate-900/95 border border-white/10 rounded-lg p-3 backdrop-blur-sm"
            style={{ top: 50 }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {React.createElement(NODE_CONFIG[selectedNode.node_type]?.icon || Network, {
                  className: "w-4 h-4",
                  style: { color: NODE_CONFIG[selectedNode.node_type]?.color }
                })}
                <span className="text-white font-semibold text-sm truncate max-w-[160px]">
                  {selectedNode.label}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedNode(null)}
                className="h-5 w-5 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            <Badge 
              className="text-xs mb-3"
              style={{ 
                backgroundColor: NODE_CONFIG[selectedNode.node_type]?.color + '20',
                color: NODE_CONFIG[selectedNode.node_type]?.color 
              }}
            >
              {selectedNode.node_type}
            </Badge>

            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                {getConnectedNodes(selectedNode.id).length} connections
              </p>

              {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                <div className="space-y-1 pt-2 border-t border-white/10">
                  {Object.entries(selectedNode.properties).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-slate-500">{key}:</span>
                      <span className="text-slate-300 truncate ml-2 max-w-[120px]">
                        {String(value).substring(0, 25)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Link
                to={createPageUrl("KnowledgeGraph")}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-2"
              >
                <ExternalLink className="w-3 h-3" />
                View in Full Graph
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <Card className="bg-white/5 border-white/10 overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              {title}
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs ml-2">
                {relevantNodes.length} entities
              </Badge>
            </CardTitle>
            <Link
              to={createPageUrl("KnowledgeGraph")}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Explore Full Graph
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <GraphContent />
        </CardContent>
      </Card>

      {/* Full Screen Dialog */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] bg-slate-900 border-white/10 p-0">
          <DialogHeader className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-cyan-400" />
                {title} - Full View
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs ml-2">
                  {relevantNodes.length} entities • {relevantRelationships.length} connections
                </Badge>
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreen(false)}
                className="text-slate-400 hover:text-white"
              >
                <Minimize2 className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <GraphContent fullScreen />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}