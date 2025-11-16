import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building2, X, Network, ZoomIn, ZoomOut, Maximize2, Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CVMGraphVisualization({ graphData, onNodeClick, onClose }) {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [nodePositions, setNodePositions] = useState({});
  const [simulation, setSimulation] = useState(null);

  const width = 1200;
  const height = 800;

  const getSectorColor = (sector) => {
    const colors = {
      'Financeiro': '#3b82f6',
      'Energia': '#10b981',
      'Telecomunicações': '#8b5cf6',
      'Varejo': '#f59e0b',
      'Saúde': '#ef4444',
      'Tecnologia': '#06b6d4',
      'Construção': '#84cc16',
      'Transporte': '#ec4899',
      'default': '#64748b'
    };
    return colors[sector] || colors.default;
  };

  // Initialize force simulation
  useEffect(() => {
    if (!graphData?.nodes || graphData.nodes.length === 0) return;

    const nodes = graphData.nodes.map(n => ({
      id: n.id,
      label: n.properties?.name || n.properties?.legal_name || 'Unknown',
      sector: n.properties?.sector || n.properties?.industry || 'Other',
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0
    }));

    const edges = (graphData.edges || []).filter(e => 
      nodes.find(n => n.id === e.source) && nodes.find(n => n.id === e.target)
    );

    // Force-directed layout simulation
    const runSimulation = () => {
      const iterations = 300;
      const repulsionForce = 5000;
      const attractionForce = 0.1;
      const damping = 0.85;

      for (let i = 0; i < iterations; i++) {
        // Reset forces
        nodes.forEach(node => {
          node.fx = 0;
          node.fy = 0;
        });

        // Repulsion between nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = repulsionForce / (distance * distance);
            
            nodes[i].fx -= (dx / distance) * force;
            nodes[i].fy -= (dy / distance) * force;
            nodes[j].fx += (dx / distance) * force;
            nodes[j].fy += (dy / distance) * force;
          }
        }

        // Attraction along edges
        edges.forEach(edge => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = distance * attractionForce;

            source.fx += (dx / distance) * force;
            source.fy += (dy / distance) * force;
            target.fx -= (dx / distance) * force;
            target.fy -= (dy / distance) * force;
          }
        });

        // Apply forces with damping
        nodes.forEach(node => {
          node.vx = (node.vx + node.fx) * damping;
          node.vy = (node.vy + node.fy) * damping;
          node.x += node.vx;
          node.y += node.vy;

          // Keep in bounds
          node.x = Math.max(100, Math.min(width - 100, node.x));
          node.y = Math.max(100, Math.min(height - 100, node.y));
        });
      }

      const positions = {};
      nodes.forEach(node => {
        positions[node.id] = { x: node.x, y: node.y, ...node };
      });
      setNodePositions(positions);
    };

    runSimulation();
  }, [graphData]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.3));
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
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  };

  const filteredNodes = Object.values(nodePositions).filter(node => {
    const matchesSearch = !searchTerm || node.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === "all" || node.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = (graphData?.edges || []).filter(e => 
    filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
  );

  const sectors = [...new Set(Object.values(nodePositions).map(n => n.sector))].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        <Card className="bg-slate-900 border-white/10 flex-1 flex flex-col">
          <CardHeader className="flex-shrink-0 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Network className="w-6 h-6 text-blue-400" />
                  CVM Network Graph
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  {filteredNodes.length} companies, {filteredEdges.length} relationships
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomIn}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomOut}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleResetView}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
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
                  placeholder="Search companies..."
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex gap-4 p-0 min-h-0">
            {/* Graph Canvas */}
            <div 
              className="flex-1 relative overflow-hidden bg-slate-950/50"
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
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="25"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      fill="#475569"
                    />
                  </marker>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Edges */}
                <g className="edges">
                  {filteredEdges.map((edge, idx) => {
                    const source = nodePositions[edge.source];
                    const target = nodePositions[edge.target];
                    
                    if (!source || !target) return null;

                    return (
                      <line
                        key={idx}
                        className="graph-edge"
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke="#475569"
                        strokeWidth="1.5"
                        strokeOpacity="0.6"
                        markerEnd="url(#arrowhead)"
                      />
                    );
                  })}
                </g>

                {/* Nodes */}
                <g className="nodes">
                  {filteredNodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const isHovered = hoveredNode?.id === node.id;
                    const radius = isSelected ? 14 : isHovered ? 12 : 10;
                    const color = getSectorColor(node.sector);

                    return (
                      <g
                        key={node.id}
                        className="cursor-pointer"
                        onClick={() => handleNodeClick(node)}
                        onMouseEnter={() => setHoveredNode(node)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        {/* Glow effect for selected/hovered */}
                        {(isSelected || isHovered) && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={radius + 8}
                            fill={color}
                            opacity="0.2"
                            filter="url(#glow)"
                          />
                        )}

                        {/* Node circle */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={radius}
                          fill={color}
                          stroke={isSelected ? '#fff' : color}
                          strokeWidth={isSelected ? 3 : 2}
                          opacity={isHovered ? 1 : 0.9}
                          className="transition-all"
                        />

                        {/* Node label */}
                        {(isSelected || isHovered || filteredNodes.length < 30) && (
                          <text
                            x={node.x}
                            y={node.y - radius - 5}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize="11"
                            fontWeight={isSelected ? "bold" : "normal"}
                            className="pointer-events-none select-none"
                          >
                            {node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Zoom indicator */}
              <div className="absolute bottom-4 right-4 bg-slate-800/90 rounded-lg px-3 py-2 text-white text-sm border border-white/10">
                Zoom: {Math.round(zoom * 100)}%
              </div>

              {/* Instructions */}
              <div className="absolute top-4 left-4 bg-slate-800/90 rounded-lg px-4 py-2 text-slate-300 text-xs border border-white/10">
                <p>🖱️ Drag to pan • Click nodes to inspect • Use zoom controls</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto p-4 bg-slate-900/50">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Legend
                </h3>
                <div className="space-y-2">
                  {sectors.map(sector => (
                    <div key={sector} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getSectorColor(sector) }}
                        />
                        <span className="text-xs text-slate-300">{sector}</span>
                      </div>
                      <Badge variant="outline" className="border-white/20 text-slate-400 text-xs">
                        {filteredNodes.filter(n => n.sector === sector).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {selectedNode && (
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    Selected Company
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-lg font-bold text-white mb-1">{selectedNode.label}</p>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {selectedNode.sector}
                      </Badge>
                    </div>

                    {/* Connected nodes */}
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Connections</p>
                      <div className="space-y-1">
                        {filteredEdges
                          .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                          .slice(0, 5)
                          .map((edge, idx) => {
                            const connectedId = edge.source === selectedNode.id ? edge.target : edge.source;
                            const connectedNode = nodePositions[connectedId];
                            
                            return connectedNode ? (
                              <div
                                key={idx}
                                className="text-xs text-slate-300 bg-white/5 px-2 py-1 rounded cursor-pointer hover:bg-white/10"
                                onClick={() => handleNodeClick(connectedNode)}
                              >
                                {connectedNode.label}
                              </div>
                            ) : null;
                          })}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {filteredEdges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} total connections
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {hoveredNode && !selectedNode && (
                <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                  <p className="text-white font-medium text-sm">{hoveredNode.label}</p>
                  <Badge className="bg-purple-500/20 text-purple-400 text-xs mt-2">
                    {hoveredNode.sector}
                  </Badge>
                </div>
              )}

              {/* Stats */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3">Graph Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Nodes</span>
                    <span className="text-white font-medium">{Object.keys(nodePositions).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Visible Nodes</span>
                    <span className="text-white font-medium">{filteredNodes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Relationships</span>
                    <span className="text-white font-medium">{filteredEdges.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Degree</span>
                    <span className="text-white font-medium">
                      {filteredNodes.length > 0 
                        ? ((filteredEdges.length * 2) / filteredNodes.length).toFixed(1)
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}