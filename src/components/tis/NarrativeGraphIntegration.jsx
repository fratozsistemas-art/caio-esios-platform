import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Network, BookOpen, Users, Target, ArrowRight, Sparkles,
  RefreshCw, Save, Eye, Link2, Zap, Play
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

/**
 * NARRATIVE GRAPH INTEGRATION
 * 
 * Visualizes narrative elements as knowledge graph nodes:
 * - Story arcs as node clusters
 * - Character relationships
 * - Conflict/resolution paths
 * - Audience connections
 */

const NODE_TYPES = {
  protagonist: { color: '#10b981', label: 'Protagonista' },
  antagonist: { color: '#ef4444', label: 'Antagonista' },
  ally: { color: '#3b82f6', label: 'Aliado' },
  obstacle: { color: '#f59e0b', label: 'Obstáculo' },
  conflict: { color: '#8b5cf6', label: 'Conflito' },
  resolution: { color: '#06b6d4', label: 'Resolução' },
  audience: { color: '#ec4899', label: 'Público' },
  theme: { color: '#6366f1', label: 'Tema' }
};

const RELATIONSHIP_TYPES = {
  opposes: { color: '#ef4444', label: 'Opõe-se a' },
  supports: { color: '#10b981', label: 'Apoia' },
  transforms_into: { color: '#8b5cf6', label: 'Transforma-se em' },
  leads_to: { color: '#3b82f6', label: 'Leva a' },
  targets: { color: '#ec4899', label: 'Direciona-se a' },
  overcomes: { color: '#f59e0b', label: 'Supera' }
};

export default function NarrativeGraphIntegration({ narrativeData, onGraphSaved }) {
  const [graphNodes, setGraphNodes] = useState([]);
  const [graphEdges, setGraphEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: existingNodes = [] } = useQuery({
    queryKey: ['kg_nodes_for_narrative'],
    queryFn: () => base44.entities.KnowledgeGraphNode.list('-created_date', 100)
  });

  const createNodeMutation = useMutation({
    mutationFn: (data) => base44.entities.KnowledgeGraphNode.create(data),
    onSuccess: () => queryClient.invalidateQueries(['kg_nodes_for_narrative'])
  });

  const createRelationshipMutation = useMutation({
    mutationFn: (data) => base44.entities.KnowledgeGraphRelationship.create(data),
    onSuccess: () => queryClient.invalidateQueries(['kg_relationships'])
  });

  // Extract narrative elements into graph structure
  const extractNarrativeGraph = async () => {
    if (!narrativeData) {
      toast.error('Nenhuma narrativa para processar');
      return;
    }

    setIsExtracting(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this narrative and extract a knowledge graph structure:

NARRATIVE DATA:
${JSON.stringify(narrativeData, null, 2)}

Extract:
1. Main characters/entities as nodes
2. Relationships between them
3. Story arc progression
4. Audience connections

Return JSON:
{
  "nodes": [
    {
      "id": "node_1",
      "label": "Node name",
      "type": "protagonist|antagonist|ally|obstacle|conflict|resolution|audience|theme",
      "description": "Brief description",
      "properties": {
        "role_in_story": "their function",
        "emotional_weight": 0-100,
        "importance": "high|medium|low"
      }
    }
  ],
  "edges": [
    {
      "source": "node_1",
      "target": "node_2",
      "relationship": "opposes|supports|transforms_into|leads_to|targets|overcomes",
      "weight": 0-100,
      "narrative_moment": "when this relationship occurs"
    }
  ],
  "story_arc": {
    "phases": [
      {
        "phase": "setup|confrontation|climax|resolution",
        "nodes_involved": ["node_1", "node_2"],
        "tension_level": 0-100
      }
    ]
  },
  "central_theme": "The overarching theme of the narrative",
  "moral": "The lesson or takeaway"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            nodes: { type: "array", items: { type: "object" } },
            edges: { type: "array", items: { type: "object" } },
            story_arc: { type: "object" },
            central_theme: { type: "string" },
            moral: { type: "string" }
          }
        }
      });

      setGraphNodes(result.nodes || []);
      setGraphEdges(result.edges || []);
      
      toast.success(`${result.nodes?.length || 0} nós e ${result.edges?.length || 0} conexões extraídos`);
    } catch (error) {
      console.error('Error extracting graph:', error);
      toast.error('Erro ao extrair grafo narrativo');
    } finally {
      setIsExtracting(false);
    }
  };

  // Save extracted nodes to Knowledge Graph
  const saveToKnowledgeGraph = async () => {
    if (graphNodes.length === 0) {
      toast.error('Nenhum nó para salvar');
      return;
    }

    setIsSaving(true);
    try {
      const nodeIdMap = {};

      // Create nodes
      for (const node of graphNodes) {
        const createdNode = await createNodeMutation.mutateAsync({
          label: node.label,
          node_type: 'narrative_element',
          properties: {
            narrative_role: node.type,
            description: node.description,
            ...node.properties,
            source: 'TIS_narrative_extraction'
          },
          embedding_vector: null
        });
        nodeIdMap[node.id] = createdNode.id;
      }

      // Create relationships
      for (const edge of graphEdges) {
        if (nodeIdMap[edge.source] && nodeIdMap[edge.target]) {
          await createRelationshipMutation.mutateAsync({
            source_node_id: nodeIdMap[edge.source],
            target_node_id: nodeIdMap[edge.target],
            relationship_type: edge.relationship,
            properties: {
              weight: edge.weight,
              narrative_moment: edge.narrative_moment
            },
            confidence: edge.weight / 100
          });
        }
      }

      toast.success(`${graphNodes.length} nós salvos no Knowledge Graph!`);
      onGraphSaved?.({ nodes: graphNodes, edges: graphEdges, nodeIdMap });
    } catch (error) {
      console.error('Error saving to KG:', error);
      toast.error('Erro ao salvar no Knowledge Graph');
    } finally {
      setIsSaving(false);
    }
  };

  // Simple canvas visualization
  useEffect(() => {
    if (!canvasRef.current || graphNodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Position nodes in a circle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    const nodePositions = graphNodes.map((node, i) => {
      const angle = (i / graphNodes.length) * Math.PI * 2 - Math.PI / 2;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    // Draw edges
    graphEdges.forEach(edge => {
      const source = nodePositions.find(n => n.id === edge.source);
      const target = nodePositions.find(n => n.id === edge.target);
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = RELATIONSHIP_TYPES[edge.relationship]?.color || '#666';
        ctx.lineWidth = (edge.weight || 50) / 25;
        ctx.stroke();

        // Arrow
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowX = target.x - 25 * Math.cos(angle);
        const arrowY = target.y - 25 * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 10 * Math.cos(angle - 0.3), arrowY - 10 * Math.sin(angle - 0.3));
        ctx.lineTo(arrowX - 10 * Math.cos(angle + 0.3), arrowY - 10 * Math.sin(angle + 0.3));
        ctx.closePath();
        ctx.fillStyle = RELATIONSHIP_TYPES[edge.relationship]?.color || '#666';
        ctx.fill();
      }
    });

    // Draw nodes
    nodePositions.forEach(node => {
      const nodeColor = NODE_TYPES[node.type]?.color || '#6b7280';
      const isSelected = selectedNode?.id === node.id;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, isSelected ? 25 : 20, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      if (isSelected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label.slice(0, 15), node.x, node.y + 35);
    });

  }, [graphNodes, graphEdges, selectedNode]);

  // Handle canvas click
  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    const clicked = graphNodes.find((node, i) => {
      const angle = (i / graphNodes.length) * Math.PI * 2 - Math.PI / 2;
      const nodeX = centerX + radius * Math.cos(angle);
      const nodeY = centerY + radius * Math.sin(angle);
      const dist = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      return dist < 25;
    });

    setSelectedNode(clicked || null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Network className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Integração com Knowledge Graph</h3>
                <p className="text-xs text-slate-400">Visualize arcos narrativos como nós conectados</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={extractNarrativeGraph}
                disabled={isExtracting || !narrativeData}
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                {isExtracting ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Extraindo...</>
                ) : (
                  <><Zap className="w-4 h-4 mr-2" />Extrair Grafo</>
                )}
              </Button>
              <Button
                onClick={saveToKnowledgeGraph}
                disabled={isSaving || graphNodes.length === 0}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                {isSaving ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />Salvar no KG</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graph Visualization */}
      {graphNodes.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {/* Canvas */}
          <div className="col-span-2">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  Grafo Narrativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={400}
                  onClick={handleCanvasClick}
                  className="w-full bg-slate-900/50 rounded-lg cursor-pointer"
                />
              </CardContent>
            </Card>
          </div>

          {/* Node Details & Legend */}
          <div className="space-y-4">
            {/* Selected Node Details */}
            {selectedNode && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Nó Selecionado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: NODE_TYPES[selectedNode.type]?.color }}
                    />
                    <span className="text-white font-medium">{selectedNode.label}</span>
                  </div>
                  <Badge className="bg-white/10 text-slate-400 mb-2">
                    {NODE_TYPES[selectedNode.type]?.label}
                  </Badge>
                  <p className="text-xs text-slate-400">{selectedNode.description}</p>
                  {selectedNode.properties?.role_in_story && (
                    <p className="text-xs text-cyan-400 mt-2">
                      Papel: {selectedNode.properties.role_in_story}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Legend */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Legenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-slate-500 mb-2">Tipos de Nó</p>
                {Object.entries(NODE_TYPES).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: value.color }}
                    />
                    <span className="text-xs text-slate-400">{value.label}</span>
                  </div>
                ))}
                <p className="text-xs text-slate-500 mt-3 mb-2">Relacionamentos</p>
                {Object.entries(RELATIONSHIP_TYPES).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div 
                      className="w-6 h-0.5" 
                      style={{ backgroundColor: value.color }}
                    />
                    <span className="text-xs text-slate-400">{value.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyan-400">{graphNodes.length}</p>
                    <p className="text-xs text-slate-500">Nós</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{graphEdges.length}</p>
                    <p className="text-xs text-slate-500">Conexões</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Nodes List */}
      {graphNodes.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-400" />
              Elementos Narrativos Extraídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {graphNodes.map(node => (
                <motion.div
                  key={node.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedNode?.id === node.id 
                      ? 'bg-cyan-500/20 border border-cyan-500/30' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedNode(node)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: NODE_TYPES[node.type]?.color }}
                    />
                    <span className="text-sm text-white font-medium truncate">{node.label}</span>
                  </div>
                  <Badge className="bg-white/10 text-slate-400 text-xs">
                    {NODE_TYPES[node.type]?.label}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}