import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, Filter, ZoomIn, ZoomOut, Maximize2, Eye, 
  EyeOff, GitMerge, Network, Building2, Users, Target,
  Code, TrendingUp, DollarSign, Database
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const nodeTypeConfig = {
  company: { color: '#3b82f6', icon: Building2 },
  person: { color: '#8b5cf6', icon: Users },
  technology: { color: '#06b6d4', icon: Code },
  market: { color: '#10b981', icon: TrendingUp },
  strategy: { color: '#f59e0b', icon: Target },
  investor: { color: '#10b981', icon: DollarSign },
  framework: { color: '#ec4899', icon: GitMerge },
  metric: { color: '#84cc16', icon: Database }
};

export default function InteractiveGraphVisualization({ nodes, relationships }) {
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState({});
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showPath, setShowPath] = useState(null);

  const width = 1400;
  const height = 900;

  // Initialize force-directed layout
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    const nodeMap = {};
    const nodesArray = nodes.map(n => ({
      ...n,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0
    }));

    // Force simulation
    const iterations = 400;
    const repulsion = 8000;
    const attraction = 0.08;
    const damping = 0.9;
    const centerForce = 0.02;

    for (let iter = 0; iter < iterations; iter++) {
      // Reset forces
      nodesArray.forEach(node => {
        node.fx = 0;
        node.fy = 0;
      });

      // Repulsion
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

      // Attraction along edges
      relationships?.forEach(rel => {
        const source = nodesArray.find(n => n.id === rel.source_id);
        const target = nodesArray.find(n => n.id === rel.target_id);
        
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

      // Center gravity
      nodesArray.forEach(node => {
        node.fx += (width / 2 - node.x) * centerForce;
        node.fy += (height / 2 - node.y) * centerForce;
      });

      // Apply forces
      nodesArray.forEach(node => {
        node.vx = (node.vx + node.fx) * damping;
        node.vy = (node.vy + node.fy) * damping;
        node.x += node.vx;
        node.y += node.vy;

        node.x = Math.max(80, Math.min(width - 80, node.x));
        node.y = Math.max(80, Math.min(height - 80, node.y));
      });
    }

    // Store positions
    nodesArray.forEach(node => {
      nodeMap[node.id] = node;
    });
    setNodePositions(nodeMap);

  }, [nodes, relationships]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.4));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

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
    setShowPath(null);
  };

  const toggleNodeExpansion = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const filteredNodes = Object.values(nodePositions).filter(node => {
    const matchesSearch = !searchTerm || node.label?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || node.node_type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredRelationships = (relationships || []).filter(r =>
    filteredNodeIds.has(r.source_id) && filteredNodeIds.has(r.target_id)
  );

  const nodeTypes = [...new Set(nodes?.map(n => n.node_type))].filter(Boolean);

  const getConnectedNodes = (nodeId) => {
    return relationships?.filter(r => 
      r.source_id === nodeId || r.target_id === nodeId
    ).map(r => r.source_id === nodeId ? r.target_id : r.source_id) || [];
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-400" />
              Interactive Knowledge Graph
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {filteredNodes.length} nodes, {filteredRelationships.length} relationships
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomIn} className="border-white/10 text-white hover:bg-white/10 h-8 w-8">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomOut} className="border-white/10 text-white hover:bg-white/10 h-8 w-8">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleResetView} className="border-white/10 text-white hover:bg-white/10 h-8 w-8">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search nodes..."
              className="pl-10 bg-white/5 border-white/10 text-white h-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white h-9">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {nodeTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex">
        {/* Graph Canvas */}
        <div 
          className="flex-1 relative overflow-hidden bg-slate-950/50"
          style={{ height: '700px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`${-pan.x / zoom} ${-pan.y / zoom} ${width / zoom} ${height / zoom}`}
            className="cursor-move"
          >
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="22" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#64748b" opacity="0.6" />
              </marker>
              <filter id="node-glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Relationships */}
            <g className="edges">
              {filteredRelationships.map((rel, idx) => {
                const source = nodePositions[rel.source_id];
                const target = nodePositions[rel.target_id];
                
                if (!source || !target) return null;

                const isHighlighted = selectedNode?.id === rel.source_id || selectedNode?.id === rel.target_id;

                return (
                  <g key={idx}>
                    <line
                      className="graph-edge"
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isHighlighted ? "#60a5fa" : "#475569"}
                      strokeWidth={isHighlighted ? "2" : "1.5"}
                      strokeOpacity={isHighlighted ? "0.8" : "0.4"}
                      markerEnd="url(#arrow)"
                    />
                    {/* Relationship label on hover */}
                    {isHighlighted && rel.relationship_type && (
                      <text
                        x={(source.x + target.x) / 2}
                        y={(source.y + target.y) / 2}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9"
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
                const config = nodeTypeConfig[node.node_type] || { color: '#64748b', icon: Network };
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode?.id === node.id;
                const isExpanded = expandedNodes.has(node.id);
                const radius = isSelected ? 16 : isHovered ? 14 : 12;
                const IconComponent = config.icon;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer transition-all"
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onDoubleClick={() => toggleNodeExpansion(node.id)}
                  >
                    {/* Glow for selected/hovered */}
                    {(isSelected || isHovered) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius + 12}
                        fill={config.color}
                        opacity="0.15"
                        filter="url(#node-glow)"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      fill={config.color}
                      stroke={isSelected ? '#fff' : isExpanded ? config.color : '#334155'}
                      strokeWidth={isSelected ? 3 : isExpanded ? 2 : 1.5}
                      opacity={isHovered || isSelected ? 1 : 0.85}
                    />

                    {/* Expansion indicator */}
                    {isExpanded && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius + 6}
                        fill="none"
                        stroke={config.color}
                        strokeWidth="1"
                        strokeDasharray="3,3"
                        opacity="0.5"
                      />
                    )}

                    {/* Node label */}
                    <text
                      x={node.x}
                      y={node.y - radius - 6}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={isSelected ? "12" : "10"}
                      fontWeight={isSelected ? "bold" : "normal"}
                      className="pointer-events-none select-none"
                    >
                      {node.label?.length > 25 ? node.label.substring(0, 25) + '...' : node.label}
                    </text>

                    {/* Node type badge */}
                    {(isSelected || isHovered) && (
                      <text
                        x={node.x}
                        y={node.y + radius + 12}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="8"
                        className="pointer-events-none"
                      >
                        {node.node_type}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4 bg-slate-800/95 rounded-lg px-3 py-1.5 text-white text-xs border border-white/10 backdrop-blur-sm">
            Zoom: {Math.round(zoom * 100)}%
          </div>

          {/* Instructions */}
          <div className="absolute top-4 left-4 bg-slate-800/95 rounded-lg px-4 py-2 border border-white/10 backdrop-blur-sm">
            <p className="text-slate-300 text-xs">
              🖱️ Click: select • Double-click: expand • Drag: pan
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-slate-900/50 border-l border-white/10 p-4 space-y-4 overflow-y-auto" style={{ height: '700px' }}>
          {/* Legend */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <h4 className="text-white font-semibold text-sm mb-3">Legend</h4>
            <div className="space-y-2">
              {Object.entries(nodeTypeConfig).map(([type, config]) => {
                const Icon = config.icon;
                const count = filteredNodes.filter(n => n.node_type === type).length;
                
                if (count === 0) return null;
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <Icon className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-300 capitalize">{type}</span>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-slate-400 text-xs">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Node Details */}
          {selectedNode && (
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  {React.createElement(nodeTypeConfig[selectedNode.node_type]?.icon || Network, {
                    className: "w-4 h-4 text-blue-400"
                  })}
                  Node Details
                </h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedNode(null)}
                  className="h-6 w-6 text-slate-400 hover:text-white"
                >
                  <EyeOff className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-white font-bold mb-1">{selectedNode.label}</p>
                  <Badge 
                    className="text-xs"
                    style={{ 
                      backgroundColor: nodeTypeConfig[selectedNode.node_type]?.color + '30',
                      color: nodeTypeConfig[selectedNode.node_type]?.color 
                    }}
                  >
                    {selectedNode.node_type}
                  </Badge>
                </div>

                {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                  <div>
                    <h5 className="text-xs text-slate-400 mb-2">Properties</h5>
                    <div className="space-y-1">
                      {Object.entries(selectedNode.properties).slice(0, 5).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-slate-400">{key}:</span>
                          <span className="text-white font-medium">
                            {typeof value === 'string' && value.length > 20 
                              ? value.substring(0, 20) + '...' 
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Nodes */}
                <div>
                  <h5 className="text-xs text-slate-400 mb-2">Connections</h5>
                  <div className="space-y-1">
                    {filteredRelationships
                      .filter(r => r.source_id === selectedNode.id || r.target_id === selectedNode.id)
                      .slice(0, 6)
                      .map((rel, idx) => {
                        const connectedId = rel.source_id === selectedNode.id ? rel.target_id : rel.source_id;
                        const connectedNode = nodePositions[connectedId];
                        
                        return connectedNode ? (
                          <div
                            key={idx}
                            className="text-xs bg-white/5 px-2 py-1.5 rounded cursor-pointer hover:bg-white/10 transition-all"
                            onClick={() => handleNodeClick(connectedNode)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white truncate">{connectedNode.label}</span>
                              <Badge 
                                variant="outline" 
                                className="border-white/20 text-slate-400 text-xs ml-2"
                              >
                                {rel.relationship_type || rel.type}
                              </Badge>
                            </div>
                          </div>
                        ) : null;
                      })}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {getConnectedNodes(selectedNode.id).length} total connections
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <h4 className="text-white font-semibold text-sm mb-3">Statistics</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Nodes</span>
                <span className="text-white font-medium">{Object.keys(nodePositions).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Visible</span>
                <span className="text-white font-medium">{filteredNodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Relationships</span>
                <span className="text-white font-medium">{filteredRelationships.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Degree</span>
                <span className="text-white font-medium">
                  {filteredNodes.length > 0 
                    ? ((filteredRelationships.length * 2) / filteredNodes.length).toFixed(1)
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}