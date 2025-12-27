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
  influencers = []
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

  const getNodeColor = (type) => {
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
    return colors[type] || '#64748b';
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

            return (
              <line
                key={idx}
                className="graph-edge"
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isHighlighted ? "#60a5fa" : "#475569"}
                strokeWidth={isHighlighted ? "2" : "1"}
                strokeOpacity={isHighlighted ? "0.8" : "0.3"}
                markerEnd="url(#arrowhead)"
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
            const radius = isSelected ? 14 : isInfluencer ? 12 : 10;

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
                  fill={isAnomalous ? '#ef4444' : isInfluencer ? '#fbbf24' : color}
                  stroke={isSelected ? '#fff' : isAnomalous ? '#dc2626' : isInfluencer ? '#f59e0b' : color}
                  strokeWidth={isSelected ? 3 : isAnomalous || isInfluencer ? 2 : 1.5}
                  opacity="0.9"
                />

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
              </g>
            );
          })}
        </g>
      </svg>

      <div className="absolute bottom-4 right-4 bg-slate-800/90 rounded-lg px-3 py-2 text-white text-xs border border-white/10">
        Zoom: {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}