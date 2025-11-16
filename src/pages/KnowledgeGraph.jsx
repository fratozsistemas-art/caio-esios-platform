import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Brain, MessageSquare, Sparkles } from "lucide-react";
import InteractiveGraphVisualization from "../components/graph/InteractiveGraphVisualization";
import GraphAIAssistant from "../components/graph/GraphAIAssistant";
import RelationshipInferencePanel from "../components/graph/RelationshipInferencePanel";

export default function KnowledgeGraph() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const queryClient = useQueryClient();

  const { data: nodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ['knowledge_graph_nodes'],
    queryFn: () => base44.entities.KnowledgeGraphNode.list()
  });

  const { data: relationships = [], isLoading: relsLoading } = useQuery({
    queryKey: ['knowledge_graph_relationships'],
    queryFn: () => base44.entities.KnowledgeGraphRelationship.list()
  });

  const graphData = {
    nodes: nodes.map(n => ({
      id: n.id,
      label: n.label,
      node_type: n.node_type,
      properties: n.properties
    })),
    edges: relationships.map(r => ({
      id: r.id,
      from: r.from_node_id,
      to: r.to_node_id,
      type: r.relationship_type,
      properties: r.properties
    }))
  };

  const handleNodeClick = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    setSelectedNode(node);
  };

  const handleEntityClick = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setShowAIAssistant(false);
    }
  };

  const isLoading = nodesLoading || relsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-blue-400" />
            Knowledge Graph
          </h1>
          <p className="text-slate-400 mt-1">
            AI-powered entity relationship mapping with intelligent inference
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={showAIAssistant 
              ? "bg-purple-600 hover:bg-purple-700" 
              : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
            }
          >
            {showAIAssistant ? (
              <>
                <Network className="w-4 h-4 mr-2" />
                Show Graph
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Assistant
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Entities</p>
                <p className="text-2xl font-bold text-white">{nodes.length}</p>
              </div>
              <Network className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Relationships</p>
                <p className="text-2xl font-bold text-white">{relationships.length}</p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">AI Inferred</p>
                <p className="text-2xl font-bold text-white">
                  {relationships.filter(r => r.properties?.ai_inferred).length}
                </p>
              </div>
              <Brain className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Node Types</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(nodes.map(n => n.node_type)).size}
                </p>
              </div>
              <Network className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Graph or AI Assistant */}
        <div className="col-span-2">
          {showAIAssistant ? (
            <div className="h-[600px]">
              <GraphAIAssistant onEntityClick={handleEntityClick} />
            </div>
          ) : (
            <InteractiveGraphVisualization
              graphData={graphData}
              onNodeClick={handleNodeClick}
              selectedNode={selectedNode}
              loading={isLoading}
            />
          )}
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Selected Node */}
          {selectedNode && (
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-white">{selectedNode.label}</p>
                    <Badge className="mt-1 bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {selectedNode.node_type}
                    </Badge>
                  </div>
                </div>
                {selectedNode.properties && (
                  <div className="space-y-1 text-sm">
                    {Object.entries(selectedNode.properties).slice(0, 5).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-400">{key}:</span>
                        <span className="text-white font-medium">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Relationship Inference */}
          {selectedNode && (
            <RelationshipInferencePanel selectedNodeId={selectedNode.id} />
          )}
        </div>
      </div>
    </div>
  );
}