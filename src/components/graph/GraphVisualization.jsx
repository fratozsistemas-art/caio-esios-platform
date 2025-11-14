import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ZoomIn, ZoomOut, Search, Building2, Cpu, TrendingUp
} from "lucide-react";

/**
 * Interactive Knowledge Graph Visualization
 * Uses force-directed layout for node positioning
 */

export default function GraphVisualization({ nodes = [], relationships = [] }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const nodeTypeConfig = {
    company: { color: '#3b82f6', icon: '🏢', size: 12 },
    technology: { color: '#8b5cf6', icon: '💻', size: 10 },
    industry: { color: '#10b981', icon: '📊', size: 14 },
    person: { color: '#f59e0b', icon: '👤', size: 8 },
    framework: { color: '#ec4899', icon: '🎯', size: 10 },
    metric: { color: '#06b6d4', icon: '📈', size: 8 }
  };

  // Filter nodes based on type and search
  const filteredNodes = nodes.filter(node => {
    const matchesFilter = filter === 'all' || node.node_type === filter;
    const matchesSearch = !searchTerm || 
      node.label?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filter relationships to only show connections between visible nodes
  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredRelationships = relationships.filter(rel => 
    visibleNodeIds.has(rel.from_node_id) && visibleNodeIds.has(rel.to_node_id)
  );

  useEffect(() => {
    if (!canvasRef.current || filteredNodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2; // Retina display
    const height = canvas.height = canvas.offsetHeight * 2;
    
    ctx.scale(2, 2);

    // Simple force-directed layout simulation
    const simulation = {
      nodes: filteredNodes.map(node => ({
        ...node,
        x: Math.random() * width / 2,
        y: Math.random() * height / 2,
        vx: 0,
        vy: 0
      })),
      alpha: 1,
      alphaDecay: 0.02
    };

    function tick() {
      // Apply forces
      simulation.nodes.forEach(node => {
        // Center force
        const centerX = width / 4;
        const centerY = height / 4;
        node.vx += (centerX - node.x) * 0.001;
        node.vy += (centerY - node.y) * 0.001;

        // Repulsion between nodes
        simulation.nodes.forEach(other => {
          if (node.id === other.id) return;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = -50 / (dist * dist);
          node.vx += dx * force;
          node.vy += dy * force;
        });

        // Link attraction
        filteredRelationships.forEach(rel => {
          if (rel.from_node_id === node.id) {
            const target = simulation.nodes.find(n => n.id === rel.to_node_id);
            if (target) {
              const dx = target.x - node.x;
              const dy = target.y - node.y;
              node.vx += dx * 0.001;
              node.vy += dy * 0.001;
            }
          }
        });

        // Apply velocity
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.9;
        node.vy *= 0.9;
      });

      // Clear canvas
      ctx.clearRect(0, 0, width / 2, height / 2);

      // Draw relationships
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      filteredRelationships.forEach(rel => {
        const source = simulation.nodes.find(n => n.id === rel.from_node_id);
        const target = simulation.nodes.find(n => n.id === rel.to_node_id);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      simulation.nodes.forEach(node => {
        const config = nodeTypeConfig[node.node_type] || nodeTypeConfig.company;
        const size = config.size * zoom;

        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (selectedNode?.id === node.id) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw label if zoomed in
        if (zoom > 0.8) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `${10 * zoom}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(node.label?.substring(0, 20) || '', node.x, node.y + size + 12);
        }
      });

      simulation.alpha *= (1 - simulation.alphaDecay);
      if (simulation.alpha > 0.01) {
        requestAnimationFrame(tick);
      }
    }

    tick();

    // Handle click
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * 2;
      const y = (e.clientY - rect.top) * 2;

      const clicked = simulation.nodes.find(node => {
        const dx = node.x - x / 2;
        const dy = node.y - y / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < (nodeTypeConfig[node.node_type]?.size || 10) * zoom;
      });

      setSelectedNode(clicked || null);
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [filteredNodes, filteredRelationships, zoom, selectedNode?.id]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search nodes..."
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="border-white/20"
              >
                All
              </Button>
              <Button
                variant={filter === 'company' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('company')}
                className="border-white/20"
              >
                <Building2 className="w-4 h-4 mr-1" />
                Companies
              </Button>
              <Button
                variant={filter === 'technology' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('technology')}
                className="border-white/20"
              >
                <Cpu className="w-4 h-4 mr-1" />
                Tech
              </Button>
              <Button
                variant={filter === 'industry' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('industry')}
                className="border-white/20"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Markets
              </Button>
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
                className="border-white/20"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                className="border-white/20"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graph Canvas */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-0">
          <canvas
            ref={canvasRef}
            className="w-full h-[600px] cursor-pointer"
          />
        </CardContent>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {nodeTypeConfig[selectedNode.node_type]?.icon}
              {selectedNode.label}
              <Badge variant="outline" className="ml-auto border-white/20 text-slate-400">
                {selectedNode.node_type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              {Object.entries(selectedNode.properties || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <dt className="text-slate-400">{key.replace(/_/g, ' ')}:</dt>
                  <dd className="text-white font-medium">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{filteredNodes.length}</div>
            <div className="text-sm text-slate-400">Nodes Visible</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{filteredRelationships.length}</div>
            <div className="text-sm text-slate-400">Relationships</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{Math.round(zoom * 100)}%</div>
            <div className="text-sm text-slate-400">Zoom Level</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}