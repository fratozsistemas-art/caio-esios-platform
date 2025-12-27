import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

export default function EnhancedForceDirectedGraph({ 
  graphData, 
  onNodeClick, 
  selectedNode,
  viewMode = 'force',
  anomalies = [],
  predictions = null,
  influencers = [],
  selectedAnomaly = null,
  customization = null
}) {
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState({});

  const width = 800;
  const height = 600;

  useEffect(() => {
    if (!graphData?.nodes || graphData.nodes.length === 0) return;

    const nodes = graphData.nodes.map(n => ({
      ...n,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0
    }));

    const iterations = 300;
    const repulsion = 6000;
    const attraction = 0.1;
    const damping = 0.88;

    for (let iter = 0; iter < iterations; iter++) {
      nodes.forEach(node => {
        node.fx = 0;
        node.fy = 0;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);
          
          nodes[i].fx -= (dx / dist) * force;
          nodes[i].fy -= (dy / dist) * force;
          nodes[j].fx += (dx / dist) * force;
          nodes[j].fy += (dy / dist) * force;
        }
      }

      graphData.edges?.forEach(edge => {
        const source = nodes.find(n => n.id === edge.from_node_id);
        const target = nodes.find(n => n.id === edge.to_node_id);
        
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

      nodes.forEach(node => {
        node.vx = (node.vx + node.fx) * damping;
        node.vy = (node.vy + node.fy) * damping;
        node.x += node.vx;
        node.y += node.vy;

        node.x = Math.max(60, Math.min(width - 60, node.x));
        node.y = Math.max(60, Math.min(height - 60, node.y));
      });
    }

    const positions = {};
    nodes.forEach(node => {
      positions[node.id] = node;
    });
    setNodePositions(positions);
  }, [graphData]);

  const interpolateColor = (color1, color2, ratio) => {
    const hex = (color) => {
      const c = color.replace('#', '');
      return [
        parseInt(c.substring(0, 2), 16),
        parseInt(c.substring(2, 4), 16),
        parseInt(c.substring(4, 6), 16)
      ];
    };
    
    const [r1, g1, b1] = hex(color1);
    const [r2, g2, b2] = hex(color2);
    
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const getNodeColor = (node) => {
    // Apply custom color scheme if provided
    if (customization?.color_scheme) {
      const { mode, node_colors, metric_key, gradient_range } = customization.color_scheme;
      
      if (mode === 'type' && node_colors) {
        return node_colors[node.node_type] || '#64748b';
      }
      
      if (mode === 'metric' && metric_key && gradient_range) {
        const metricValue = node.properties?.[metric_key] || node.metadata?.[metric_key] || 0;
        const maxValue = 100;
        const ratio = Math.min(metricValue / maxValue, 1);
        return interpolateColor(gradient_range.min_color, gradient_range.max_color, ratio);
      }
      
      if (mode === 'status' && node.status && node_colors) {
        return node_colors[node.status] || '#64748b';
      }
    }
    
    // Default colors
    const colors = {
      company: '#3b82f6',
      executive: '#8b5cf6',
      technology: '#06b6d4',
      market: '#10b981',
      strategy: '#f59e0b',
      investor: '#10b981',
      framework: '#ec4899',
      metric: '#84cc16'
    };
    return colors[node.node_type] || '#64748b';
  };

  const isNodeAnomalous = (nodeId) => {
    return anomalies?.some(a => a.node_id === nodeId);
  };

  const getNodeInfluenceScore = (nodeId) => {
    const influencer = influencers?.find(i => i.node_id === nodeId);
    return influencer?.influence_score || 0;
  };

  const isPredictedRelationship = (fromId, toId) => {
    return predictions?.predicted_relationships?.some(
      r => (r.from_node_id === fromId && r.to_node_id === toId) ||
           (r.from_node_id === toId && r.to_node_id === fromId)
    );
  };

  const isRelatedToAnomaly = (nodeId) => {
    if (!selectedAnomaly) return false;
    if (nodeId === selectedAnomaly.node_id) return true;
    // Check if node is connected to anomalous node
    return graphData.edges?.some(e => 
      (e.from_node_id === selectedAnomaly.node_id && e.to_node_id === nodeId) ||
      (e.to_node_id === selectedAnomaly.node_id && e.from_node_id === nodeId)
    );
  };

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

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="border-white/10 text-white hover:bg-white/10 h-8 w-8"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="border-white/10 text-white hover:bg-white/10 h-8 w-8"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleResetView}
          className="border-white/10 text-white hover:bg-white/10 h-8 w-8"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`${-pan.x / zoom} ${-pan.y / zoom} ${width / zoom} ${height / zoom}`}
        className="cursor-move bg-slate-950/50 rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="20"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#64748b" opacity="0.6" />
          </marker>
        </defs>

        {/* Edges */}
        <g className="edges">
          {graphData.edges?.map((edge, idx) => {
            const source = nodePositions[edge.from_node_id];
            const target = nodePositions[edge.to_node_id];

            if (!source || !target) return null;

            const isHighlighted = selectedNode?.id === edge.from_node_id || selectedNode?.id === edge.to_node_id;
            const isAnomalyRelated = selectedAnomaly && (
              edge.from_node_id === selectedAnomaly.node_id || 
              edge.to_node_id === selectedAnomaly.node_id
            );

            return (
              <line
                key={idx}
                className="graph-edge"
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isAnomalyRelated ? "#ef4444" : isHighlighted ? "#60a5fa" : "#475569"}
                strokeWidth={isAnomalyRelated ? "3" : isHighlighted ? "2" : "1"}
                strokeOpacity={isAnomalyRelated ? "0.9" : isHighlighted ? "0.8" : "0.3"}
                markerEnd="url(#arrowhead)"
                strokeDasharray={isAnomalyRelated ? "5,3" : "0"}
                />
            );
          })}
        </g>

        {/* Predicted Relationships */}
        {predictions && (
          <g className="predicted-edges">
            {predictions.predicted_relationships?.slice(0, 10).map((pred, idx) => {
              const source = nodePositions[pred.from_node_id];
              const target = nodePositions[pred.to_node_id];
              
              if (!source || !target) return null;

              return (
                <line
                  key={`pred-${idx}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeOpacity="0.3"
                  strokeDasharray="5,5"
                />
              );
            })}
          </g>
        )}

        {/* Nodes */}
        <g className="nodes">
          {Object.values(nodePositions).map((node) => {
            const color = getNodeColor(node.node_type);
            const isSelected = selectedNode?.id === node.id;
            const isAnomalous = isNodeAnomalous(node.id);
            const influenceScore = getNodeInfluenceScore(node.id);
            const isInfluencer = influenceScore > 50;
            const isAnomalyRelated = isRelatedToAnomaly(node.id);
            
            let radius = 10;
            if (customization?.view_config?.node_size_mode === 'degree') {
              const degree = graphData.edges.filter(e => 
                e.from_node_id === node.id || e.to_node_id === node.id
              ).length;
              radius = 8 + Math.min(degree, 10);
            } else if (customization?.view_config?.node_size_mode === 'metric' && customization.color_scheme?.metric_key) {
              const metricValue = node.properties?.[customization.color_scheme.metric_key] || 0;
              radius = 8 + (metricValue / 10);
            } else if (isSelected) {
              radius = 14;
            } else if (isInfluencer) {
              radius = 12;
            } else if (isAnomalyRelated) {
              radius = 11;
            }

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={() => onNodeClick(node)}
              >
                {/* Anomaly indicator */}
                {isAnomalous && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 8}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="3,3"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="r"
                      from={radius + 6}
                      to={radius + 10}
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Anomaly-related highlight */}
                {isAnomalyRelated && !isAnomalous && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 6}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2"
                    strokeDasharray="2,2"
                    opacity="0.6"
                  />
                )}

                {/* Influencer glow */}
                {isInfluencer && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 6}
                    fill="#fbbf24"
                    opacity="0.2"
                  />
                )}

                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 10}
                    fill={color}
                    opacity="0.2"
                  />
                )}

                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={isAnomalous ? '#ef4444' : isInfluencer ? '#fbbf24' : getNodeColor(node)}
                  stroke={isSelected ? '#fff' : isAnomalous ? '#dc2626' : isInfluencer ? '#f59e0b' : getNodeColor(node)}
                  strokeWidth={isSelected ? 3 : isAnomalous || isInfluencer ? 2 : 1.5}
                  opacity="0.9"
                />

                {(customization?.view_config?.show_labels !== false) && (
                  <text
                    x={node.x}
                    y={node.y - radius - 5}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="10"
                    fontWeight={isSelected ? "bold" : "normal"}
                    className="pointer-events-none select-none"
                  >
                    {node.label?.length > 20 ? node.label.substring(0, 20) + '...' : node.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="absolute bottom-4 right-4 bg-slate-800/90 rounded-lg px-3 py-2 text-white text-xs border border-white/10">
        Zoom: {Math.round(zoom * 100)}%
      </div>

      {/* Legend for visual indicators */}
      {(anomalies?.length > 0 || influencers?.length > 0 || predictions) && (
        <div className="absolute bottom-4 left-4 bg-slate-800/95 rounded-lg p-3 border border-white/10 space-y-2 text-xs">
          {anomalies?.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-600" />
              <span className="text-slate-300">Anomaly</span>
            </div>
          )}
          {influencers?.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-500" />
              <span className="text-slate-300">Key Influencer</span>
            </div>
          )}
          {predictions && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-purple-500 opacity-50" style={{ borderTop: '2px dashed' }} />
              <span className="text-slate-300">Predicted Link</span>
            </div>
          )}
          {selectedAnomaly && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-orange-500 border-dashed" />
              <span className="text-slate-300">Related to Anomaly</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}