import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ZoomIn, ZoomOut, Maximize2, Search, Filter, 
  ChevronDown, ChevronUp, Network, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NODE_COLORS = {
  Company: '#3b82f6',
  Person: '#10b981',
  Technology: '#8b5cf6',
  Framework: '#f59e0b',
  Metric: '#ec4899',
  Investor: '#14b8a6',
  Market: '#ef4444'
};

const NODE_ICONS = {
  Company: '🏢',
  Person: '👤',
  Technology: '⚙️',
  Framework: '📊',
  Metric: '📈',
  Investor: '💰',
  Market: '🌐'
};

export default function InteractiveGraphVisualization({ nodes = [], relationships = [] }) {
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTypes, setFilterTypes] = useState(new Set());
  const [highlightPath, setHighlightPath] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState({});

  // Inicializar posições dos nós em layout circular
  useEffect(() => {
    if (nodes.length > 0 && Object.keys(nodePositions).length === 0) {
      const positions = {};
      const centerX = 400;
      const centerY = 400;
      const radius = 300;
      
      // Agrupar nós por tipo
      const nodesByType = {};
      nodes.forEach(node => {
        if (!nodesByType[node.type]) nodesByType[node.type] = [];
        nodesByType[node.type].push(node);
      });

      let angleOffset = 0;
      Object.keys(nodesByType).forEach((type, typeIndex) => {
        const nodesInType = nodesByType[type];
        const angleStep = (Math.PI * 2) / nodesInType.length;
        
        nodesInType.forEach((node, index) => {
          const angle = angleOffset + (index * angleStep);
          positions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          };
        });
        
        angleOffset += Math.PI / Object.keys(nodesByType).length;
      });

      setNodePositions(positions);
    }
  }, [nodes]);

  // Controles de zoom
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan
  const handleMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.tagName === 'svg') {
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Expandir/Colapsar nó
  const toggleNodeExpansion = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Filtrar nós
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = !searchTerm || 
      node.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterTypes.size === 0 || filterTypes.has(node.type);
    
    return matchesSearch && matchesFilter;
  });

  // Toggle filtro de tipo
  const toggleTypeFilter = (type) => {
    const newFilters = new Set(filterTypes);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setFilterTypes(newFilters);
  };

  // Encontrar vizinhos de um nó
  const getNodeNeighbors = (nodeId) => {
    const neighbors = new Set();
    relationships.forEach(rel => {
      if (rel.source === nodeId) neighbors.add(rel.target);
      if (rel.target === nodeId) neighbors.add(rel.source);
    });
    return Array.from(neighbors);
  };

  // Verificar se relacionamento está conectado ao nó selecionado
  const isRelationshipHighlighted = (rel) => {
    if (!selectedNode) return false;
    if (highlightPath.length > 0) {
      // Verificar se está no caminho
      for (let i = 0; i < highlightPath.length - 1; i++) {
        if ((rel.source === highlightPath[i] && rel.target === highlightPath[i + 1]) ||
            (rel.target === highlightPath[i] && rel.source === highlightPath[i + 1])) {
          return true;
        }
      }
      return false;
    }
    return rel.source === selectedNode.id || rel.target === selectedNode.id;
  };

  // Tipos únicos para filtros
  const uniqueTypes = [...new Set(nodes.map(n => n.type))];

  // Vizinhos do nó selecionado
  const selectedNeighbors = selectedNode ? getNodeNeighbors(selectedNode.id) : [];

  return (
    <div className="space-y-4">
      {/* Controles */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Busca */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar nós..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Filtros de tipo */}
            <div className="flex flex-wrap gap-2">
              {uniqueTypes.map(type => (
                <Button
                  key={type}
                  size="sm"
                  variant="outline"
                  onClick={() => toggleTypeFilter(type)}
                  className={`border-white/10 ${
                    filterTypes.has(type)
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="mr-1">{NODE_ICONS[type]}</span>
                  {type}
                </Button>
              ))}
            </div>

            {/* Controles de zoom */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleZoomOut} className="border-white/10 text-white">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleResetView} className="border-white/10 text-white">
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleZoomIn} className="border-white/10 text-white">
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Visualização do grafo */}
        <Card className="lg:col-span-3 bg-white/5 border-white/10">
          <CardContent className="p-0">
            <div className="relative w-full h-[600px] overflow-hidden rounded-lg bg-slate-950">
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="cursor-move"
              >
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Relacionamentos */}
                  {relationships.map((rel, idx) => {
                    const sourceNode = nodes.find(n => n.id === rel.source);
                    const targetNode = nodes.find(n => n.id === rel.target);
                    
                    if (!sourceNode || !targetNode || !nodePositions[rel.source] || !nodePositions[rel.target]) {
                      return null;
                    }

                    const isHighlighted = isRelationshipHighlighted(rel);
                    
                    return (
                      <g key={idx}>
                        <line
                          x1={nodePositions[rel.source].x}
                          y1={nodePositions[rel.source].y}
                          x2={nodePositions[rel.target].x}
                          y2={nodePositions[rel.target].y}
                          stroke={isHighlighted ? '#3b82f6' : '#475569'}
                          strokeWidth={isHighlighted ? 3 : 1}
                          strokeOpacity={isHighlighted ? 1 : 0.3}
                          markerEnd="url(#arrowhead)"
                        />
                      </g>
                    );
                  })}

                  {/* Nós */}
                  {filteredNodes.map((node) => {
                    if (!nodePositions[node.id]) return null;

                    const pos = nodePositions[node.id];
                    const isSelected = selectedNode?.id === node.id;
                    const isNeighbor = selectedNeighbors.includes(node.id);
                    const isExpanded = expandedNodes.has(node.id);
                    const isHovered = hoveredNode?.id === node.id;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onMouseEnter={() => setHoveredNode(node)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => setSelectedNode(node)}
                        onDoubleClick={() => toggleNodeExpansion(node.id)}
                        className="cursor-pointer"
                      >
                        <circle
                          r={isExpanded ? 35 : isSelected || isHovered ? 30 : 20}
                          fill={NODE_COLORS[node.type] || '#64748b'}
                          stroke={isSelected ? '#fff' : isNeighbor ? '#60a5fa' : 'none'}
                          strokeWidth={isSelected ? 3 : 2}
                          opacity={selectedNode && !isSelected && !isNeighbor ? 0.3 : 1}
                          className="transition-all duration-200"
                        />
                        <text
                          textAnchor="middle"
                          dy=".3em"
                          fill="white"
                          fontSize={isExpanded ? "16" : "12"}
                          fontWeight="bold"
                        >
                          {NODE_ICONS[node.type]}
                        </text>
                        {(isHovered || isSelected) && (
                          <text
                            textAnchor="middle"
                            dy="35"
                            fill="white"
                            fontSize="10"
                            className="pointer-events-none"
                          >
                            {node.label || node.name}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#475569"
                      />
                    </marker>
                  </defs>
                </g>
              </svg>

              {/* Instruções */}
              {!selectedNode && (
                <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs p-3 rounded-lg">
                  <div className="space-y-1">
                    <div>🖱️ Arraste para mover o grafo</div>
                    <div>🔍 Clique em um nó para ver detalhes</div>
                    <div>🔄 Duplo clique para expandir/colapsar</div>
                    <div>📊 Zoom com os botões acima</div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="absolute top-4 right-4 bg-black/70 text-white text-xs p-3 rounded-lg space-y-1">
                <div>Nós: {filteredNodes.length}/{nodes.length}</div>
                <div>Relações: {relationships.length}</div>
                <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Painel de detalhes */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Network className="w-4 h-4" />
              {selectedNode ? 'Detalhes do Nó' : 'Legenda'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedNode ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{NODE_ICONS[selectedNode.type]}</span>
                    <div>
                      <h4 className="text-white font-semibold">{selectedNode.label || selectedNode.name}</h4>
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                        {selectedNode.type}
                      </Badge>
                    </div>
                  </div>

                  {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                    <div className="bg-white/5 rounded-lg p-3 space-y-1">
                      {Object.entries(selectedNode.properties).slice(0, 5).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="text-slate-400">{key}:</span>
                          <span className="text-white ml-1">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedNeighbors.length > 0 && (
                  <div>
                    <h5 className="text-white text-xs font-semibold mb-2">
                      Conexões ({selectedNeighbors.length})
                    </h5>
                    <div className="space-y-1">
                      {selectedNeighbors.slice(0, 5).map(neighborId => {
                        const neighbor = nodes.find(n => n.id === neighborId);
                        if (!neighbor) return null;
                        return (
                          <div
                            key={neighborId}
                            onClick={() => setSelectedNode(neighbor)}
                            className="flex items-center gap-2 p-2 bg-white/5 rounded cursor-pointer hover:bg-white/10 transition-colors"
                          >
                            <span>{NODE_ICONS[neighbor.type]}</span>
                            <span className="text-xs text-white truncate">
                              {neighbor.label || neighbor.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedNode(null)}
                  className="w-full border-white/10 text-white"
                >
                  Limpar Seleção
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <h5 className="text-white text-xs font-semibold mb-3">Tipos de Nós</h5>
                {uniqueTypes.map(type => (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: NODE_COLORS[type] }}
                    />
                    <span className="text-xs text-slate-300">{type}</span>
                    <span className="ml-auto text-xs text-slate-500">
                      {nodes.filter(n => n.type === type).length}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}