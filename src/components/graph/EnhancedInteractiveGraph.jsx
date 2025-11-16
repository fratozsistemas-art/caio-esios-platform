import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Maximize2, Loader2 } from 'lucide-react';

export default function EnhancedInteractiveGraph({ 
  graphData, 
  onNodeClick, 
  selectedNode,
  filters = {},
  clustering = false,
  focusMode = false,
  loading = false
}) {
  const canvasRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [nodePositions, setNodePositions] = useState({});
  const [clusters, setClusters] = useState([]);

  // Filter nodes and edges based on filters
  const filteredNodes = graphData.nodes.filter(node => {
    if (filters.nodeTypes?.length > 0 && !filters.nodeTypes.includes(node.node_type)) {
      return false;
    }
    return true;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  
  const filteredEdges = graphData.edges.filter(edge => {
    if (!filteredNodeIds.has(edge.from) || !filteredNodeIds.has(edge.to)) {
      return false;
    }
    if (filters.relationshipTypes?.length > 0 && !filters.relationshipTypes.includes(edge.type)) {
      return false;
    }
    return true;
  });

  // Focus mode: show only selected node and its immediate neighbors
  const focusedData = focusMode && selectedNode ? (() => {
    const connectedNodeIds = new Set([selectedNode.id]);
    filteredEdges.forEach(edge => {
      if (edge.from === selectedNode.id) connectedNodeIds.add(edge.to);
      if (edge.to === selectedNode.id) connectedNodeIds.add(edge.from);
    });
    
    const focusedNodes = filteredNodes.filter(n => connectedNodeIds.has(n.id));
    const focusedEdges = filteredEdges.filter(e => 
      connectedNodeIds.has(e.from) && connectedNodeIds.has(e.to)
    );
    
    return { nodes: focusedNodes, edges: focusedEdges };
  })() : { nodes: filteredNodes, edges: filteredEdges };

  // Clustering algorithm (simple community detection)
  useEffect(() => {
    if (!clustering || focusedData.nodes.length === 0) {
      setClusters([]);
      return;
    }

    // Group nodes by type for simple clustering
    const clusterMap = {};
    focusedData.nodes.forEach(node => {
      const type = node.node_type || 'other';
      if (!clusterMap[type]) {
        clusterMap[type] = [];
      }
      clusterMap[type].push(node.id);
    });

    const clusterArray = Object.entries(clusterMap).map(([type, nodeIds], index) => ({
      id: `cluster_${index}`,
      type: type,
      nodeIds: nodeIds,
      color: getClusterColor(index)
    }));

    setClusters(clusterArray);
  }, [clustering, focusedData.nodes]);

  // Force-directed layout
  useEffect(() => {
    if (focusedData.nodes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Initialize positions if not exists
    const positions = { ...nodePositions };
    let needsInit = false;

    focusedData.nodes.forEach(node => {
      if (!positions[node.id]) {
        needsInit = true;
        if (clustering && clusters.length > 0) {
          // Position based on cluster
          const cluster = clusters.find(c => c.nodeIds.includes(node.id));
          const clusterIndex = clusters.indexOf(cluster);
          const angle = (clusterIndex / clusters.length) * 2 * Math.PI;
          const radius = Math.min(width, height) * 0.3;
          positions[node.id] = {
            x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 100,
            y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 100,
            vx: 0,
            vy: 0
          };
        } else {
          positions[node.id] = {
            x: centerX + (Math.random() - 0.5) * width * 0.5,
            y: centerY + (Math.random() - 0.5) * height * 0.5,
            vx: 0,
            vy: 0
          };
        }
      }
    });

    if (needsInit) {
      setNodePositions(positions);
    }

    // Force simulation
    const iterations = 50;
    for (let i = 0; i < iterations; i++) {
      // Repulsion between all nodes
      focusedData.nodes.forEach(node1 => {
        focusedData.nodes.forEach(node2 => {
          if (node1.id === node2.id) return;
          const dx = positions[node2.id].x - positions[node1.id].x;
          const dy = positions[node2.id].y - positions[node1.id].y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 2000 / (distance * distance);
          positions[node1.id].vx -= (dx / distance) * force;
          positions[node1.id].vy -= (dy / distance) * force;
        });
      });

      // Attraction along edges
      focusedData.edges.forEach(edge => {
        const source = positions[edge.from];
        const target = positions[edge.to];
        if (!source || !target) return;
        
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = distance * 0.01;
        
        source.vx += (dx / distance) * force;
        source.vy += (dy / distance) * force;
        target.vx -= (dx / distance) * force;
        target.vy -= (dy / distance) * force;
      });

      // Update positions
      focusedData.nodes.forEach(node => {
        positions[node.id].x += positions[node.id].vx;
        positions[node.id].y += positions[node.id].vy;
        positions[node.id].vx *= 0.8;
        positions[node.id].vy *= 0.8;
      });
    }

    setNodePositions(positions);
  }, [focusedData.nodes, focusedData.edges, clustering, clusters]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    // Draw clusters (if enabled)
    if (clustering && clusters.length > 0) {
      clusters.forEach(cluster => {
        const clusterNodes = cluster.nodeIds
          .map(id => ({ id, pos: nodePositions[id] }))
          .filter(n => n.pos);
        
        if (clusterNodes.length === 0) return;

        // Calculate cluster bounds
        const xs = clusterNodes.map(n => n.pos.x);
        const ys = clusterNodes.map(n => n.pos.y);
        const minX = Math.min(...xs) - 40;
        const maxX = Math.max(...xs) + 40;
        const minY = Math.min(...ys) - 40;
        const maxY = Math.max(...ys) + 40;

        ctx.fillStyle = cluster.color + '20';
        ctx.strokeStyle = cluster.color + '60';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(minX, minY, maxX - minX, maxY - minY, 20);
        ctx.fill();
        ctx.stroke();
      });
    }

    // Draw edges
    focusedData.edges.forEach(edge => {
      const source = nodePositions[edge.from];
      const target = nodePositions[edge.to];
      if (!source || !target) return;

      const isSelected = selectedNode && (edge.from === selectedNode.id || edge.to === selectedNode.id);
      
      ctx.strokeStyle = isSelected ? '#8b5cf6' : 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();

      // Draw arrow
      if (isSelected) {
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowSize = 8;
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.moveTo(
          target.x - arrowSize * Math.cos(angle - Math.PI / 6),
          target.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(target.x, target.y);
        ctx.lineTo(
          target.x - arrowSize * Math.cos(angle + Math.PI / 6),
          target.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.fill();
      }
    });

    // Draw nodes
    focusedData.nodes.forEach(node => {
      const pos = nodePositions[node.id];
      if (!pos) return;

      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const radius = isSelected ? 12 : isHovered ? 10 : 8;

      // Node circle
      ctx.fillStyle = getNodeColor(node.node_type);
      ctx.strokeStyle = isSelected ? '#8b5cf6' : isHovered ? '#60a5fa' : '#334155';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Node label
      if (isSelected || isHovered) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, pos.x, pos.y + radius + 15);
      }
    });

    ctx.restore();
  }, [focusedData, nodePositions, transform, selectedNode, hoveredNode, clustering, clusters]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({ ...t, scale: Math.max(0.1, Math.min(3, t.scale * delta)) }));
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - transform.x) / transform.scale;
    const y = (e.clientY - rect.top - transform.y) / transform.scale;

    // Check if clicked on a node
    const clickedNode = focusedData.nodes.find(node => {
      const pos = nodePositions[node.id];
      if (!pos) return false;
      const dx = x - pos.x;
      const dy = y - pos.y;
      return Math.sqrt(dx * dx + dy * dy) < 12;
    });

    if (clickedNode) {
      onNodeClick?.(clickedNode.id);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - transform.x) / transform.scale;
    const y = (e.clientY - rect.top - transform.y) / transform.scale;

    if (isDragging) {
      setTransform(t => ({
        ...t,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    } else {
      const hovered = focusedData.nodes.find(node => {
        const pos = nodePositions[node.id];
        if (!pos) return false;
        const dx = x - pos.x;
        const dy = y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) < 12;
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  const zoomIn = () => {
    setTransform(t => ({ ...t, scale: Math.min(3, t.scale * 1.2) }));
  };

  const zoomOut = () => {
    setTransform(t => ({ ...t, scale: Math.max(0.1, t.scale / 1.2) }));
  };

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10 relative">
      <CardContent className="p-0">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-[600px] cursor-move"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={zoomIn}
            className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={zoomOut}
            className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20"
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={resetView}
            className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </Button>
        </div>

        {/* Stats */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            {focusedData.nodes.length} nodes
          </Badge>
          <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            {focusedData.edges.length} edges
          </Badge>
          {clustering && clusters.length > 0 && (
            <Badge className="bg-cyan-500/20 backdrop-blur-sm border-cyan-500/30 text-cyan-400">
              {clusters.length} clusters
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getNodeColor(type) {
  const colors = {
    company: '#3b82f6',
    executive: '#a855f7',
    technology: '#10b981',
    framework: '#f97316',
    metric: '#ec4899',
    investor: '#14b8a6',
    market: '#f59e0b'
  };
  return colors[type] || '#64748b';
}

function getClusterColor(index) {
  const colors = ['#3b82f6', '#a855f7', '#10b981', '#f97316', '#ec4899', '#14b8a6'];
  return colors[index % colors.length];
}