import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Locate, Info } from "lucide-react";

export default function GraphVisualization({ nodes, relationships, searchQuery }) {
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [networkStats, setNetworkStats] = useState({ avgConnections: 0, maxConnections: 0 });

  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    // Calculate network statistics
    const nodeConnections = {};
    relationships.forEach(rel => {
      nodeConnections[rel.from_node_id] = (nodeConnections[rel.from_node_id] || 0) + 1;
      nodeConnections[rel.to_node_id] = (nodeConnections[rel.to_node_id] || 0) + 1;
    });

    const connections = Object.values(nodeConnections);
    const avgConnections = connections.length > 0 
      ? (connections.reduce((a, b) => a + b, 0) / connections.length).toFixed(1)
      : 0;
    const maxConnections = connections.length > 0 ? Math.max(...connections) : 0;

    setNetworkStats({ avgConnections, maxConnections });
  }, [nodes, relationships]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 20, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 20, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Group nodes by type for legend
  const nodeTypes = [...new Set(nodes.map(n => n.node_type))];
  const typeColors = {
    company: "#3b82f6",
    industry: "#f59e0b",
    strategy: "#10b981",
    metric: "#8b5cf6",
    framework: "#ec4899",
    outcome: "#06b6d4"
  };

  // Find most connected nodes
  const nodeConnectionCount = {};
  relationships.forEach(rel => {
    nodeConnectionCount[rel.from_node_id] = (nodeConnectionCount[rel.from_node_id] || 0) + 1;
    nodeConnectionCount[rel.to_node_id] = (nodeConnectionCount[rel.to_node_id] || 0) + 1;
  });

  const topNodes = nodes
    .map(node => ({
      ...node,
      connections: nodeConnectionCount[node.id] || 0
    }))
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 5);

  return (
    <Card className={`bg-white/5 border-white/10 backdrop-blur-sm ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              Graph Visualization
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {nodes.length} nodes • {relationships.length} edges
              </Badge>
            </CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              Avg {networkStats.avgConnections} connections per node • Max {networkStats.maxConnections}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetZoom}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <Locate className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="text-sm text-slate-400 min-w-[60px] text-center">
              {zoomLevel}%
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
          {/* Main Visualization Area */}
          <div 
            ref={containerRef}
            className="lg:col-span-3 relative bg-slate-950/50 overflow-hidden"
            style={{ height: isFullscreen ? 'calc(100vh - 200px)' : '600px' }}
          >
            {/* Placeholder for actual graph visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="relative w-64 h-64 mx-auto">
                  {/* Simple SVG visualization placeholder */}
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Draw sample nodes */}
                    {nodes.slice(0, 15).map((node, idx) => {
                      const angle = (idx / Math.min(15, nodes.length)) * 2 * Math.PI;
                      const x = 100 + 70 * Math.cos(angle);
                      const y = 100 + 70 * Math.sin(angle);
                      const color = typeColors[node.node_type] || "#64748b";
                      const connections = nodeConnectionCount[node.id] || 0;
                      const size = 3 + Math.min(connections * 0.5, 7);
                      
                      return (
                        <g key={idx}>
                          <circle
                            cx={x}
                            cy={y}
                            r={size}
                            fill={color}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedNode(node)}
                          />
                          {connections > 3 && (
                            <circle
                              cx={x}
                              cy={y}
                              r={size + 3}
                              fill="none"
                              stroke={color}
                              strokeWidth="0.5"
                              opacity="0.3"
                            />
                          )}
                        </g>
                      );
                    })}
                    
                    {/* Draw sample edges */}
                    {relationships.slice(0, 20).map((rel, idx) => {
                      const fromIdx = nodes.findIndex(n => n.id === rel.from_node_id);
                      const toIdx = nodes.findIndex(n => n.id === rel.to_node_id);
                      if (fromIdx === -1 || toIdx === -1 || fromIdx > 14 || toIdx > 14) return null;
                      
                      const fromAngle = (fromIdx / Math.min(15, nodes.length)) * 2 * Math.PI;
                      const toAngle = (toIdx / Math.min(15, nodes.length)) * 2 * Math.PI;
                      const x1 = 100 + 70 * Math.cos(fromAngle);
                      const y1 = 100 + 70 * Math.sin(fromAngle);
                      const x2 = 100 + 70 * Math.cos(toAngle);
                      const y2 = 100 + 70 * Math.sin(toAngle);
                      
                      return (
                        <line
                          key={idx}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#475569"
                          strokeWidth="0.5"
                          opacity="0.3"
                        />
                      );
                    })}
                  </svg>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm text-blue-400 font-medium mb-1">
                        Interactive Graph Coming Soon
                      </p>
                      <p className="text-xs text-slate-400">
                        This is a simplified preview. Full interactive visualization with force-directed layout, 
                        zoom, pan, and node details will be available with the vis-network library integration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Zoom level indicator */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 rounded-lg px-3 py-2 border border-white/10">
              <div className="text-xs text-slate-400">
                Showing {Math.min(15, nodes.length)} of {nodes.length} nodes
              </div>
            </div>
          </div>

          {/* Right Sidebar - Info Panel */}
          <div className="bg-slate-900/50 border-l border-white/10 p-6 space-y-6 overflow-y-auto" style={{ maxHeight: isFullscreen ? 'calc(100vh - 200px)' : '600px' }}>
            {/* Legend */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Node Types</h3>
              <div className="space-y-2">
                {nodeTypes.map(type => {
                  const count = nodes.filter(n => n.node_type === type).length;
                  const color = typeColors[type] || "#64748b";
                  return (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-slate-300 capitalize">{type}</span>
                      </div>
                      <span className="text-slate-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Connected Nodes */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Most Connected</h3>
              <div className="space-y-2">
                {topNodes.map((node, idx) => (
                  <div 
                    key={node.id}
                    className="bg-white/5 rounded-lg p-3 border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
                    onClick={() => setSelectedNode(node)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">#{idx + 1}</span>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        {node.connections} links
                      </Badge>
                    </div>
                    <div className="text-sm text-white font-medium truncate">{node.label}</div>
                    <div className="text-xs text-slate-500 capitalize">{node.node_type}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Selected Node</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-400 hover:text-white h-6 text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Name</div>
                    <div className="text-sm text-white font-medium">{selectedNode.label}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Type</div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {selectedNode.node_type}
                    </Badge>
                  </div>
                  {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                    <div>
                      <div className="text-xs text-slate-500 mb-2">Properties</div>
                      <div className="space-y-1">
                        {Object.entries(selectedNode.properties).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-slate-400">{key}:</span>
                            <span className="text-slate-300 ml-2">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Connections</div>
                    <div className="text-sm text-white">{nodeConnectionCount[selectedNode.id] || 0}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}