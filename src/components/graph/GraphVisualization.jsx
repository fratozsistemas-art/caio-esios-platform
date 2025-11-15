import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ZoomIn, ZoomOut, Maximize2, Network, Search, Filter,
  Building2, Users, Lightbulb, TrendingUp, X, GitBranch
} from "lucide-react";

const NODE_COLORS = {
  company: '#3b82f6',
  person: '#8b5cf6', 
  technology: '#10b981',
  project: '#f59e0b',
  industry: '#ef4444',
  topic: '#06b6d4',
  document: '#6b7280'
};

const NODE_ICONS = {
  company: Building2,
  person: Users,
  technology: Lightbulb,
  project: GitBranch,
  industry: TrendingUp
};

export default function GraphVisualization({ nodes = [], relationships = [], searchQuery = "", highlightedNodes = [] }) {
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showPaths, setShowPaths] = useState(false);
  const [pathToNode, setPathToNode] = useState(null);

  // Calculate node positions using force-directed layout simulation
  const [nodePositions, setNodePositions] = useState({});

  useEffect(() => {
    if (nodes.length === 0) return;

    // Initialize positions
    const positions = {};
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Group nodes by type for better layout
    const nodesByType = {};
    nodes.forEach(node => {
      if (!nodesByType[node.node_type]) nodesByType[node.node_type] = [];
      nodesByType[node.node_type].push(node);
    });

    // Arrange in circular clusters by type
    const types = Object.keys(nodesByType);
    const angleStep = (2 * Math.PI) / types.length;

    types.forEach((type, typeIndex) => {
      const typeNodes = nodesByType[type];
      const clusterRadius = 150 + (typeNodes.length * 3);
      const clusterAngle = angleStep * typeIndex;
      const clusterX = centerX + Math.cos(clusterAngle) * 200;
      const clusterY = centerY + Math.sin(clusterAngle) * 200;

      typeNodes.forEach((node, nodeIndex) => {
        const nodeAngle = (2 * Math.PI / typeNodes.length) * nodeIndex;
        positions[node.id] = {
          x: clusterX + Math.cos(nodeAngle) * clusterRadius,
          y: clusterY + Math.sin(nodeAngle) * clusterRadius
        };
      });
    });

    setNodePositions(positions);
  }, [nodes]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.3));
  const handleResetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'circle') return; // Don't drag if clicking node
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setPathToNode(null);
  };

  const findPath = (fromNode, toNode) => {
    if (!fromNode || !toNode) return null;
    
    const visited = new Set();
    const queue = [[fromNode.id]];
    
    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      
      if (current === toNode.id) return path;
      if (visited.has(current)) continue;
      visited.add(current);
      
      const connectedRels = relationships.filter(r => 
        r.from_node_id === current || r.to_node_id === current
      );
      
      connectedRels.forEach(rel => {
        const nextNode = rel.from_node_id === current ? rel.to_node_id : rel.from_node_id;
        if (!visited.has(nextNode)) {
          queue.push([...path, nextNode]);
        }
      });
    }
    
    return null;
  };

  const getConnectedNodes = (nodeId) => {
    const connected = new Set();
    relationships.forEach(rel => {
      if (rel.from_node_id === nodeId) connected.add(rel.to_node_id);
      if (rel.to_node_id === nodeId) connected.add(rel.from_node_id);
    });
    return connected;
  };

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = !searchTerm || 
      node.label?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || node.node_type === filterType;
    return matchesSearch && matchesType;
  });

  const isNodeInPath = (nodeId) => {
    return pathToNode?.includes(nodeId);
  };

  const isRelInPath = (rel) => {
    if (!pathToNode || pathToNode.length < 2) return false;
    for (let i = 0; i < pathToNode.length - 1; i++) {
      if ((rel.from_node_id === pathToNode[i] && rel.to_node_id === pathToNode[i + 1]) ||
          (rel.to_node_id === pathToNode[i] && rel.from_node_id === pathToNode[i + 1])) {
        return true;
      }
    }
    return false;
  };

  const connectedToSelected = selectedNode ? getConnectedNodes(selectedNode.id) : new Set();

  const nodeTypes = [...new Set(nodes.map(n => n.node_type))];

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-400" />
            Interactive Graph ({filteredNodes.length} nodes)
          </CardTitle>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-48 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="all">All Types</option>
              {nodeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="text-white hover:bg-white/10"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="text-white hover:bg-white/10"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetZoom}
              className="text-white hover:bg-white/10"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex">
          {/* Graph Canvas */}
          <div 
            className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-950 to-blue-950"
            style={{ height: '600px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Relationships */}
                <g>
                  {relationships.filter(rel => {
                    const fromNode = filteredNodes.find(n => n.id === rel.from_node_id);
                    const toNode = filteredNodes.find(n => n.id === rel.to_node_id);
                    return fromNode && toNode;
                  }).map((rel, idx) => {
                    const from = nodePositions[rel.from_node_id];
                    const to = nodePositions[rel.to_node_id];
                    if (!from || !to) return null;

                    const isHighlighted = selectedNode && 
                      (rel.from_node_id === selectedNode.id || rel.to_node_id === selectedNode.id);
                    const inPath = isRelInPath(rel);

                    return (
                      <line
                        key={idx}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke={inPath ? '#10b981' : isHighlighted ? '#3b82f6' : '#334155'}
                        strokeWidth={inPath ? 3 : isHighlighted ? 2 : 1}
                        strokeOpacity={inPath ? 1 : isHighlighted ? 0.8 : 0.3}
                      />
                    );
                  })}
                </g>

                {/* Nodes */}
                <g>
                  {filteredNodes.map((node) => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;

                    const isSelected = selectedNode?.id === node.id;
                    const isConnected = connectedToSelected.has(node.id);
                    const isHovered = hoveredNode?.id === node.id;
                    const isHighlighted = highlightedNodes?.includes(node.label);
                    const matchesSearch = searchTerm && node.label?.toLowerCase().includes(searchTerm.toLowerCase());
                    const inPath = isNodeInPath(node.id);

                    const radius = isSelected ? 12 : matchesSearch || isHighlighted ? 10 : 8;
                    const opacity = selectedNode && !isSelected && !isConnected ? 0.3 : 1;

                    return (
                      <g key={node.id}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={radius}
                          fill={inPath ? '#10b981' : NODE_COLORS[node.node_type] || '#6b7280'}
                          fillOpacity={opacity}
                          stroke={isSelected ? '#fff' : matchesSearch ? '#fbbf24' : isHighlighted ? '#a855f7' : 'none'}
                          strokeWidth={isSelected ? 3 : 2}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleNodeClick(node)}
                          onMouseEnter={() => setHoveredNode(node)}
                          onMouseLeave={() => setHoveredNode(null)}
                        />
                        {(isSelected || isHovered || matchesSearch) && (
                          <text
                            x={pos.x}
                            y={pos.y - radius - 5}
                            textAnchor="middle"
                            fill="white"
                            fontSize="12"
                            fontWeight="bold"
                          >
                            {node.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </g>
            </svg>

            {/* Zoom indicator */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-sm">
              Zoom: {Math.round(zoom * 100)}%
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-80 border-l border-white/10 bg-slate-900/50 overflow-y-auto" style={{ height: '600px' }}>
            <div className="p-4 space-y-4">
              {/* Legend */}
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Legend
                </h4>
                <div className="space-y-2">
                  {Object.entries(NODE_COLORS).map(([type, color]) => {
                    const Icon = NODE_ICONS[type];
                    const count = nodes.filter(n => n.node_type === type).length;
                    if (count === 0) return null;
                    
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: color }}
                        />
                        {Icon && <Icon className="w-3 h-3 text-slate-400" />}
                        <span className="text-sm text-slate-300 capitalize">{type}</span>
                        <Badge variant="outline" className="ml-auto text-xs border-white/10 text-slate-400">
                          {count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Node Info */}
              {selectedNode && (
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-white font-semibold">Node Details</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedNode(null)}
                      className="h-6 w-6 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Label</div>
                      <div className="text-white font-medium">{selectedNode.label}</div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Type</div>
                      <Badge className="bg-white/10 text-white border-white/20 capitalize">
                        {selectedNode.node_type}
                      </Badge>
                    </div>

                    {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                      <div>
                        <div className="text-xs text-slate-400 mb-2">Properties</div>
                        <div className="bg-white/5 rounded-lg p-2 space-y-1">
                          {Object.entries(selectedNode.properties).slice(0, 5).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="text-slate-400">{key}:</span>{' '}
                              <span className="text-slate-200">{String(value).slice(0, 50)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-xs text-slate-400 mb-1">Connections</div>
                      <div className="text-white font-medium">{connectedToSelected.size} nodes</div>
                    </div>

                    {/* Find Path */}
                    <div className="pt-3 border-t border-white/10">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (pathToNode) {
                            setPathToNode(null);
                          } else {
                            const firstNode = nodes[0];
                            const path = findPath(firstNode, selectedNode);
                            setPathToNode(path);
                          }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <GitBranch className="w-4 h-4 mr-2" />
                        {pathToNode ? 'Clear Path' : 'Show Path'}
                      </Button>
                      {pathToNode && (
                        <div className="mt-2 text-xs text-green-400">
                          Path length: {pathToNode.length} nodes
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {!selectedNode && (
                <div className="text-xs text-slate-400 space-y-2">
                  <p><strong className="text-slate-300">Click</strong> a node to view details</p>
                  <p><strong className="text-slate-300">Drag</strong> canvas to pan</p>
                  <p><strong className="text-slate-300">Search</strong> to highlight nodes</p>
                  <p><strong className="text-slate-300">Filter</strong> by node type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}