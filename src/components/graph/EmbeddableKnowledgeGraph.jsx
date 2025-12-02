import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, Filter, ZoomIn, ZoomOut, Maximize2, Minimize2,
  Network, Building2, Users, Target, ExternalLink, Loader2,
  Code, TrendingUp, DollarSign, Database, GitMerge, Sparkles,
  ChevronRight, Info, X, Play, Pause, RotateCcw, Plus, Minus,
  Eye, Route, MoreHorizontal, Focus, Trash2, Link2, MousePointer
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

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
  onEntitySelect,
  highlightedInsights = []
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [hoveredNode, setHoveredNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [highlightedPath, setHighlightedPath] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [insightFilters, setInsightFilters] = useState([]);

  const width = 900;
  const graphHeight = height - 60;

  // Fetch graph data
  const { data: allNodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ['embeddable_graph_nodes'],
    queryFn: () => base44.entities.KnowledgeGraphNode.list('-created_date', 300)
  });

  const { data: allRelationships = [], isLoading: relsLoading } = useQuery({
    queryKey: ['embeddable_graph_relationships'],
    queryFn: () => base44.entities.KnowledgeGraphRelationship.list('-created_date', 800)
  });

  // Get connected nodes for expansion
  const getConnectedNodes = useCallback((nodeId) => {
    const connected = new Set();
    allRelationships.forEach(r => {
      if (r.from_node_id === nodeId) connected.add(r.to_node_id);
      if (r.to_node_id === nodeId) connected.add(r.from_node_id);
    });
    return connected;
  }, [allRelationships]);

  // Filter nodes based on context, expansion, and insight filters
  const relevantNodes = React.useMemo(() => {
    const contextLabels = [...contextEntities, ...insightFilters].map(e => e?.toLowerCase()).filter(Boolean);
    
    // Start with context matches
    let directMatches = allNodes.filter(n => 
      contextLabels.some(label => 
        n.label?.toLowerCase().includes(label) || 
        label.includes(n.label?.toLowerCase())
      )
    );

    const directIds = new Set(directMatches.map(n => n.id));
    
    // Add expanded nodes' connections
    const expandedConnections = new Set();
    expandedNodes.forEach(nodeId => {
      const connected = getConnectedNodes(nodeId);
      connected.forEach(id => expandedConnections.add(id));
    });

    // Get first-level connections for context nodes
    const connectedIds = new Set();
    allRelationships.forEach(r => {
      if (directIds.has(r.from_node_id)) connectedIds.add(r.to_node_id);
      if (directIds.has(r.to_node_id)) connectedIds.add(r.from_node_id);
    });

    // Combine all relevant nodes
    const allRelevantIds = new Set([...directIds, ...connectedIds, ...expandedConnections, ...expandedNodes]);
    
    let result = allNodes.filter(n => allRelevantIds.has(n.id));
    
    // If no context, show top nodes
    if (result.length === 0) {
      result = allNodes.slice(0, 50);
    }

    return result.slice(0, 100);
  }, [allNodes, allRelationships, contextEntities, expandedNodes, insightFilters, getConnectedNodes]);

  const relevantNodeIds = new Set(relevantNodes.map(n => n.id));
  const relevantRelationships = allRelationships.filter(r => 
    relevantNodeIds.has(r.from_node_id) && relevantNodeIds.has(r.to_node_id)
  );

  // Find path between two nodes (BFS)
  const findPath = useCallback((startId, endId) => {
    if (!startId || !endId) return [];
    
    const queue = [[startId]];
    const visited = new Set([startId]);
    
    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      
      if (current === endId) return path;
      
      const neighbors = [];
      allRelationships.forEach(r => {
        if (r.from_node_id === current && !visited.has(r.to_node_id)) {
          neighbors.push(r.to_node_id);
        }
        if (r.to_node_id === current && !visited.has(r.from_node_id)) {
          neighbors.push(r.from_node_id);
        }
      });
      
      for (const neighbor of neighbors) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
    
    return [];
  }, [allRelationships]);

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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.4));
  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.closest('.graph-edge')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
    setContextMenu(null);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleNodeClick = (node, e) => {
    e.stopPropagation();
    
    if (multiSelectMode) {
      setSelectedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(node.id)) {
          newSet.delete(node.id);
        } else {
          newSet.add(node.id);
        }
        return newSet;
      });
    } else {
      setSelectedNodes(new Set([node.id]));
      if (onEntitySelect) onEntitySelect(node);
    }
  };

  const handleNodeDoubleClick = (node, e) => {
    e.stopPropagation();
    toggleNodeExpansion(node.id);
  };

  const handleNodeContextMenu = (node, e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node,
      type: 'node'
    });
  };

  const handleEdgeContextMenu = (rel, e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      relationship: rel,
      type: 'edge'
    });
  };

  const toggleNodeExpansion = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
        toast.info("Node collapsed");
      } else {
        newSet.add(nodeId);
        toast.success("Node expanded - showing connections");
      }
      return newSet;
    });
  };

  const showPathBetweenSelected = () => {
    const selectedArray = Array.from(selectedNodes);
    if (selectedArray.length === 2) {
      const path = findPath(selectedArray[0], selectedArray[1]);
      if (path.length > 0) {
        setHighlightedPath(path);
        toast.success(`Path found: ${path.length} nodes`);
      } else {
        toast.error("No path found between selected nodes");
      }
    }
  };

  const clearSelection = () => {
    setSelectedNodes(new Set());
    setHighlightedPath([]);
  };

  const addInsightFilter = (insight) => {
    if (!insightFilters.includes(insight)) {
      setInsightFilters(prev => [...prev, insight]);
      toast.success("Filter added from insight");
    }
  };

  const removeInsightFilter = (insight) => {
    setInsightFilters(prev => prev.filter(f => f !== insight));
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
  const isLoading = nodesLoading || relsLoading;

  const getNodeConnections = (nodeId) => {
    return relevantRelationships.filter(r => 
      r.from_node_id === nodeId || r.to_node_id === nodeId
    ).map(r => ({
      ...r,
      connectedId: r.from_node_id === nodeId ? r.to_node_id : r.from_node_id
    }));
  };

  const GraphContent = ({ fullScreen = false }) => (
    <div className={`relative ${fullScreen ? 'h-full' : ''}`}>
      {/* Controls */}
      <div className="absolute top-3 left-3 z-10 flex gap-2 flex-wrap">
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
          size="sm"
          onClick={() => setMultiSelectMode(!multiSelectMode)}
          className={`h-8 px-2 ${multiSelectMode ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-slate-800/95 text-white'} border border-white/10`}
        >
          <MousePointer className="w-3 h-3 mr-1" />
          {multiSelectMode ? 'Multi' : 'Single'}
        </Button>

        {selectedNodes.size === 2 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={showPathBetweenSelected}
            className="h-8 px-2 bg-purple-500/20 text-purple-400 border border-purple-500/30"
          >
            <Route className="w-3 h-3 mr-1" />
            Find Path
          </Button>
        )}

        {(selectedNodes.size > 0 || highlightedPath.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-8 px-2 bg-slate-800/95 text-slate-400 border border-white/10"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
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

      {/* Insight Filters */}
      {(insightFilters.length > 0 || highlightedInsights.length > 0) && (
        <div className="absolute top-14 left-3 z-10 flex flex-wrap gap-1 max-w-md">
          {insightFilters.map((filter, idx) => (
            <Badge 
              key={idx}
              className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs cursor-pointer hover:bg-amber-500/30"
              onClick={() => removeInsightFilter(filter)}
            >
              {filter.length > 20 ? filter.substring(0, 20) + '...' : filter}
              <X className="w-2 h-2 ml-1" />
            </Badge>
          ))}
          {highlightedInsights.slice(0, 3).map((insight, idx) => (
            <Badge 
              key={`hi-${idx}`}
              className="bg-slate-700/80 text-slate-300 border-white/10 text-xs cursor-pointer hover:bg-cyan-500/20 hover:text-cyan-400"
              onClick={() => addInsightFilter(insight)}
            >
              <Plus className="w-2 h-2 mr-1" />
              {insight.length > 15 ? insight.substring(0, 15) + '...' : insight}
            </Badge>
          ))}
        </div>
      )}

      {/* SVG Canvas */}
      <div 
        className="w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        style={{ height: fullScreen ? 'calc(100vh - 200px)' : graphHeight }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setContextMenu(null)}
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
              <marker id="arrow-embed" markerWidth="8" markerHeight="8" refX="20" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#64748b" opacity="0.5" />
              </marker>
              <marker id="arrow-highlight" markerWidth="8" markerHeight="8" refX="20" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#22d3ee" opacity="0.8" />
              </marker>
              <filter id="glow-embed">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Edges */}
            <g className="edges">
              {filteredRelationships.map((rel, idx) => {
                const source = nodePositions[rel.from_node_id];
                const target = nodePositions[rel.to_node_id];
                if (!source || !target) return null;

                const isSelected = selectedNodes.has(rel.from_node_id) || selectedNodes.has(rel.to_node_id);
                const isInPath = highlightedPath.includes(rel.from_node_id) && highlightedPath.includes(rel.to_node_id);

                return (
                  <g key={idx}>
                    <line
                      className="graph-edge cursor-pointer"
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isInPath ? "#22d3ee" : isSelected ? "#60a5fa" : "#475569"}
                      strokeWidth={isInPath ? "3" : isSelected ? "2" : "1"}
                      strokeOpacity={isInPath ? "0.9" : isSelected ? "0.7" : "0.3"}
                      markerEnd={isInPath ? "url(#arrow-highlight)" : "url(#arrow-embed)"}
                      onContextMenu={(e) => handleEdgeContextMenu(rel, e)}
                    />
                    {(isSelected || isInPath) && rel.relationship_type && (
                      <text
                        x={(source.x + target.x) / 2}
                        y={(source.y + target.y) / 2 - 5}
                        textAnchor="middle"
                        fill={isInPath ? "#22d3ee" : "#94a3b8"}
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
                const isSelected = selectedNodes.has(node.id);
                const isHovered = hoveredNode?.id === node.id;
                const isExpanded = expandedNodes.has(node.id);
                const isInPath = highlightedPath.includes(node.id);
                const isContext = contextEntities.some(e => 
                  node.label?.toLowerCase().includes(e?.toLowerCase())
                ) || insightFilters.some(f => node.label?.toLowerCase().includes(f?.toLowerCase()));
                
                const radius = isSelected ? 14 : isHovered ? 12 : isExpanded ? 12 : isContext ? 11 : 9;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={(e) => handleNodeClick(node, e)}
                    onDoubleClick={(e) => handleNodeDoubleClick(node, e)}
                    onContextMenu={(e) => handleNodeContextMenu(node, e)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {(isSelected || isHovered || isInPath || isExpanded) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius + 10}
                        fill={isInPath ? "#22d3ee" : config.color}
                        opacity={isSelected ? 0.3 : 0.2}
                        filter="url(#glow-embed)"
                      />
                    )}

                    {isExpanded && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius + 6}
                        fill="none"
                        stroke={config.color}
                        strokeWidth="1.5"
                        strokeDasharray="4,2"
                        opacity="0.6"
                      />
                    )}

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      fill={isInPath ? "#22d3ee" : config.color}
                      stroke={isSelected ? '#fff' : isExpanded ? config.color : '#334155'}
                      strokeWidth={isSelected ? 2.5 : isExpanded ? 2 : 1}
                      opacity={isHovered || isSelected || isInPath ? 1 : 0.85}
                    />

                    <text
                      x={node.x}
                      y={node.y - radius - 5}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={isSelected ? "11" : "9"}
                      fontWeight={isSelected || isContext || isInPath ? "600" : "normal"}
                      className="pointer-events-none select-none"
                    >
                      {node.label?.length > 20 ? node.label.substring(0, 20) + '...' : node.label}
                    </text>

                    {isExpanded && (
                      <text
                        x={node.x + radius + 3}
                        y={node.y + 3}
                        fill={config.color}
                        fontSize="10"
                        className="pointer-events-none"
                      >
                        ↔
                      </text>
                    )}
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
          {filteredRelationships.length} edges
        </Badge>
        {selectedNodes.size > 0 && (
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
            {selectedNodes.size} selected
          </Badge>
        )}
        {expandedNodes.size > 0 && (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
            {expandedNodes.size} expanded
          </Badge>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-3 right-3 bg-slate-800/80 rounded px-2 py-1 text-xs text-slate-400">
        Click: select • Double-click: expand • Right-click: menu
      </div>

      {/* Selected Node Panel */}
      <AnimatePresence>
        {selectedNodes.size === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-16 right-3 w-64 bg-slate-900/95 border border-white/10 rounded-lg p-3 backdrop-blur-sm max-h-80 overflow-y-auto"
          >
            {(() => {
              const nodeId = Array.from(selectedNodes)[0];
              const node = nodePositions[nodeId];
              if (!node) return null;
              
              const connections = getNodeConnections(nodeId);
              
              return (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {React.createElement(NODE_CONFIG[node.node_type]?.icon || Network, {
                        className: "w-4 h-4",
                        style: { color: NODE_CONFIG[node.node_type]?.color }
                      })}
                      <span className="text-white font-semibold text-sm truncate max-w-[140px]">
                        {node.label}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearSelection}
                      className="h-5 w-5 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <Badge 
                      className="text-xs"
                      style={{ 
                        backgroundColor: NODE_CONFIG[node.node_type]?.color + '20',
                        color: NODE_CONFIG[node.node_type]?.color 
                      }}
                    >
                      {node.node_type}
                    </Badge>
                    <Badge className="text-xs bg-white/10 text-slate-400">
                      {connections.length} connections
                    </Badge>
                  </div>

                  <div className="flex gap-1 mb-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleNodeExpansion(nodeId)}
                      className={`h-7 px-2 text-xs ${expandedNodes.has(nodeId) ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400'}`}
                    >
                      {expandedNodes.has(nodeId) ? <Minus className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                      {expandedNodes.has(nodeId) ? 'Collapse' : 'Expand'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addInsightFilter(node.label)}
                      className="h-7 px-2 text-xs bg-white/5 text-slate-400"
                    >
                      <Filter className="w-3 h-3 mr-1" />
                      Filter
                    </Button>
                  </div>

                  {connections.length > 0 && (
                    <div className="space-y-1 border-t border-white/10 pt-2">
                      <p className="text-xs text-slate-500 mb-1">Connected to:</p>
                      {connections.slice(0, 5).map((conn, idx) => {
                        const connNode = nodePositions[conn.connectedId];
                        if (!connNode) return null;
                        return (
                          <div 
                            key={idx}
                            className="flex items-center justify-between text-xs bg-white/5 rounded px-2 py-1 cursor-pointer hover:bg-white/10"
                            onClick={() => setSelectedNodes(new Set([conn.connectedId]))}
                          >
                            <span className="text-white truncate max-w-[120px]">{connNode.label}</span>
                            <Badge className="bg-white/10 text-slate-400 text-xs scale-75">
                              {conn.relationship_type || 'related'}
                            </Badge>
                          </div>
                        );
                      })}
                      {connections.length > 5 && (
                        <p className="text-xs text-slate-500 text-center">+{connections.length - 5} more</p>
                      )}
                    </div>
                  )}

                  <Link
                    to={createPageUrl("KnowledgeGraph")}
                    className="flex items-center justify-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-3 pt-2 border-t border-white/10"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in Full Graph
                  </Link>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bg-slate-900 border border-white/20 rounded-lg shadow-xl z-50 py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.type === 'node' && (
              <>
                <button
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                  onClick={() => { handleNodeClick(contextMenu.node, { stopPropagation: () => {} }); setContextMenu(null); }}
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  View Details
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                  onClick={() => { toggleNodeExpansion(contextMenu.node.id); setContextMenu(null); }}
                >
                  {expandedNodes.has(contextMenu.node.id) ? (
                    <><Minus className="w-4 h-4 text-purple-400" /> Collapse Node</>
                  ) : (
                    <><Plus className="w-4 h-4 text-purple-400" /> Expand Node</>
                  )}
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                  onClick={() => { addInsightFilter(contextMenu.node.label); setContextMenu(null); }}
                >
                  <Filter className="w-4 h-4 text-amber-400" />
                  Add to Filters
                </button>
                {selectedNodes.size === 1 && !selectedNodes.has(contextMenu.node.id) && (
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                    onClick={() => {
                      const path = findPath(Array.from(selectedNodes)[0], contextMenu.node.id);
                      if (path.length > 0) {
                        setHighlightedPath(path);
                        toast.success(`Path found: ${path.length} nodes`);
                      } else {
                        toast.error("No path found");
                      }
                      setContextMenu(null);
                    }}
                  >
                    <Route className="w-4 h-4 text-green-400" />
                    Find Path to Selected
                  </button>
                )}
                <div className="border-t border-white/10 my-1" />
                <Link
                  to={createPageUrl("KnowledgeGraph")}
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                  onClick={() => setContextMenu(null)}
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  Open Full Graph
                </Link>
              </>
            )}
            {contextMenu.type === 'edge' && (
              <>
                <div className="px-3 py-2 text-xs text-slate-400 border-b border-white/10">
                  {contextMenu.relationship.relationship_type || 'Relationship'}
                </div>
                <button
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                  onClick={() => {
                    setSelectedNodes(new Set([contextMenu.relationship.from_node_id, contextMenu.relationship.to_node_id]));
                    setContextMenu(null);
                  }}
                >
                  <Link2 className="w-4 h-4 text-cyan-400" />
                  Select Connected Nodes
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                  onClick={() => {
                    setHighlightedPath([contextMenu.relationship.from_node_id, contextMenu.relationship.to_node_id]);
                    setContextMenu(null);
                  }}
                >
                  <Focus className="w-4 h-4 text-purple-400" />
                  Highlight Connection
                </button>
              </>
            )}
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