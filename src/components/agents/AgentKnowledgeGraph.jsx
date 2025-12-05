import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Network, Brain, FileText, MessageSquare, Eye, Zap, RefreshCw,
  ZoomIn, ZoomOut, Maximize2, Filter, Sparkles, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const NODE_TYPES = {
  analysis: { color: '#3b82f6', icon: '📊', label: 'Analysis' },
  knowledge_item: { color: '#10b981', icon: '📚', label: 'Knowledge' },
  agent_feedback: { color: '#a855f7', icon: '💬', label: 'Feedback' },
  agent: { color: '#f59e0b', icon: '🤖', label: 'Agent' }
};

export default function AgentKnowledgeGraph() {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch data
  const { data: analyses = [] } = useQuery({
    queryKey: ['analyses-graph'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 50)
  });

  const { data: knowledgeItems = [] } = useQuery({
    queryKey: ['knowledge-items-graph'],
    queryFn: () => base44.entities.KnowledgeItem.list('-created_date', 50)
  });

  const { data: agentFeedback = [] } = useQuery({
    queryKey: ['agent-feedback-graph'],
    queryFn: () => base44.entities.AgentFeedback.list('-created_date', 100)
  });

  // Generate graph
  const generateGraph = async () => {
    setIsGenerating(true);
    try {
      const graphNodes = [];
      const graphEdges = [];

      // Add agent nodes
      ['market_monitor', 'strategy_doc_generator', 'knowledge_curator'].forEach((agentId, idx) => {
        graphNodes.push({
          id: `agent-${agentId}`,
          type: 'agent',
          label: agentId.replace(/_/g, ' '),
          x: 400 + idx * 200,
          y: 100,
          data: { agentId }
        });
      });

      // Add analysis nodes
      analyses.slice(0, 15).forEach((analysis, idx) => {
        graphNodes.push({
          id: `analysis-${analysis.id}`,
          type: 'analysis',
          label: analysis.title?.slice(0, 20) || 'Analysis',
          x: 100 + (idx % 5) * 180,
          y: 250 + Math.floor(idx / 5) * 120,
          data: analysis
        });
      });

      // Add knowledge items
      knowledgeItems.slice(0, 15).forEach((item, idx) => {
        graphNodes.push({
          id: `knowledge-${item.id}`,
          type: 'knowledge_item',
          label: item.title?.slice(0, 20) || 'Knowledge',
          x: 100 + (idx % 5) * 180,
          y: 500 + Math.floor(idx / 5) * 120,
          data: item
        });
      });

      // Add feedback nodes
      agentFeedback.slice(0, 20).forEach((fb, idx) => {
        graphNodes.push({
          id: `feedback-${fb.id}`,
          type: 'agent_feedback',
          label: `${fb.feedback_type} (${fb.rating || '?'})`,
          x: 800 + (idx % 4) * 100,
          y: 250 + Math.floor(idx / 4) * 80,
          data: fb
        });
      });

      // Generate edges using AI
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these entities and identify meaningful relationships:

ANALYSES (${analyses.length}):
${JSON.stringify(analyses.slice(0, 10).map(a => ({ id: a.id, title: a.title, type: a.type, tags: a.tags })), null, 2)}

KNOWLEDGE ITEMS (${knowledgeItems.length}):
${JSON.stringify(knowledgeItems.slice(0, 10).map(k => ({ id: k.id, title: k.title, type: k.type, framework: k.framework, tags: k.tags })), null, 2)}

AGENT FEEDBACK (${agentFeedback.length}):
${JSON.stringify(agentFeedback.slice(0, 15).map(f => ({ id: f.id, agent_id: f.agent_id, feedback_type: f.feedback_type, rating: f.rating })), null, 2)}

Identify relationships between these entities. Consider:
1. Analyses that relate to knowledge items by topic/framework
2. Feedback that influences agent behavior
3. Knowledge that informs analysis
4. Agent connections to their feedback

Return JSON with edges array:
{
  "edges": [
    { "source": "analysis-ID", "target": "knowledge-ID", "relationship": "informs", "strength": 0.8 },
    { "source": "feedback-ID", "target": "agent-AGENT_ID", "relationship": "trains", "strength": 0.9 }
  ],
  "insights": ["insight about the graph structure"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            edges: { type: "array", items: { type: "object" } },
            insights: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Add edges from AI analysis
      result.edges?.forEach(edge => {
        const sourceNode = graphNodes.find(n => n.id === edge.source || n.id.includes(edge.source));
        const targetNode = graphNodes.find(n => n.id === edge.target || n.id.includes(edge.target));
        if (sourceNode && targetNode) {
          graphEdges.push({
            source: sourceNode.id,
            target: targetNode.id,
            relationship: edge.relationship,
            strength: edge.strength || 0.5
          });
        }
      });

      // Add direct feedback-to-agent edges
      agentFeedback.forEach(fb => {
        const fbNode = graphNodes.find(n => n.id === `feedback-${fb.id}`);
        const agentNode = graphNodes.find(n => n.id === `agent-${fb.agent_id}`);
        if (fbNode && agentNode) {
          graphEdges.push({
            source: fbNode.id,
            target: agentNode.id,
            relationship: 'trains',
            strength: (fb.rating || 3) / 5
          });
        }
      });

      setNodes(graphNodes);
      setEdges(graphEdges);
      toast.success(`Graph generated: ${graphNodes.length} nodes, ${graphEdges.length} edges`);
    } catch (error) {
      toast.error('Failed to generate graph');
    } finally {
      setIsGenerating(false);
    }
  };

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(zoom, zoom);

    // Draw edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = `rgba(100, 150, 255, ${edge.strength || 0.3})`;
      ctx.lineWidth = edge.strength * 3 || 1;
      ctx.stroke();
    });

    // Draw nodes
    const filteredNodes = filter === 'all' ? nodes : nodes.filter(n => n.type === filter);
    filteredNodes.forEach(node => {
      const config = NODE_TYPES[node.type];
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
      ctx.fillStyle = selectedNode?.id === node.id ? '#fff' : config.color;
      ctx.fill();
      ctx.strokeStyle = selectedNode?.id === node.id ? config.color : '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Icon
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.icon, node.x, node.y);

      // Label
      ctx.font = '10px Arial';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(node.label, node.x, node.y + 40);
    });

    ctx.restore();
  }, [nodes, edges, zoom, filter, selectedNode]);

  // Handle click
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const clickedNode = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });

    setSelectedNode(clickedNode || null);
  };

  const stats = {
    analyses: nodes.filter(n => n.type === 'analysis').length,
    knowledge: nodes.filter(n => n.type === 'knowledge_item').length,
    feedback: nodes.filter(n => n.type === 'agent_feedback').length,
    connections: edges.length
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-green-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg">AI Knowledge Graph</span>
              <p className="text-xs text-slate-400 font-normal">
                Relationships between analyses, knowledge & feedback
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="border-white/20">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="border-white/20">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="analysis">Analyses</SelectItem>
                  <SelectItem value="knowledge_item">Knowledge</SelectItem>
                  <SelectItem value="agent_feedback">Feedback</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={generateGraph} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700">
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span className="ml-1">Generate</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Analyses', value: stats.analyses, color: 'blue' },
          { label: 'Knowledge', value: stats.knowledge, color: 'green' },
          { label: 'Feedback', value: stats.feedback, color: 'purple' },
          { label: 'Connections', value: stats.connections, color: 'cyan' }
        ].map((s, i) => (
          <Card key={i} className={`bg-${s.color}-500/10 border-${s.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graph Canvas */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardContent className="p-2">
          <canvas
            ref={canvasRef}
            width={1200}
            height={700}
            onClick={handleCanvasClick}
            className="w-full h-[500px] rounded-lg bg-slate-950 cursor-pointer"
          />
        </CardContent>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`bg-${NODE_TYPES[selectedNode.type].color}/10 border-${NODE_TYPES[selectedNode.type].color}/30`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{NODE_TYPES[selectedNode.type].icon}</span>
                <div className="flex-1">
                  <Badge className="mb-2">{NODE_TYPES[selectedNode.type].label}</Badge>
                  <h3 className="text-lg font-bold text-white">{selectedNode.label}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} connections
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex gap-4 justify-center">
        {Object.entries(NODE_TYPES).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.color }} />
            <span className="text-xs text-slate-400">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}