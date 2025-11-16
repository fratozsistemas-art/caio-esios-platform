import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Brain, MessageSquare, Database } from "lucide-react";
import EnhancedInteractiveGraph from "../components/graph/EnhancedInteractiveGraph";
import GraphAIAssistant from "../components/graph/GraphAIAssistant";
import RelationshipInferencePanel from "../components/graph/RelationshipInferencePanel";
import AutoEnrichmentPanel from "../components/graph/AutoEnrichmentPanel";
import AdvancedGraphControls from "../components/graph/AdvancedGraphControls";
import DataSourceHub from "../components/integrations/DataSourceHub";
import ExplainabilityPanel from "../components/graph/ExplainabilityPanel";

export default function KnowledgeGraph() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [filters, setFilters] = useState({ nodeTypes: [], relationshipTypes: [] });
  const [clustering, setClustering] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [selectedInference, setSelectedInference] = useState(null);

  const { data: nodes = [], isLoading: nodesLoading, refetch: refetchNodes } = useQuery({
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

  const availableNodeTypes = [...new Set(nodes.map(n => n.node_type))];
  const availableRelationshipTypes = [...new Set(relationships.map(r => r.relationship_type))];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-blue-400" />
            Knowledge Graph
          </h1>
          <p className="text-slate-400 mt-1">
            Multi-source intelligence with explainable AI insights
          </p>
        </div>
        <Button
          onClick={() => setShowAIAssistant(!showAIAssistant)}
          className={showAIAssistant 
            ? "bg-purple-600 hover:bg-purple-700" 
            : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
          }
        >
          {showAIAssistant ? <><Network className="w-4 h-4 mr-2" />Graph</> : <><MessageSquare className="w-4 h-4 mr-2" />AI Assistant</>}
        </Button>
      </div>

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
              <Network className="w-8 h-8 text-purple-400 opacity-50" />
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
                <p className="text-xs text-slate-400">Data Sources</p>
                <p className="text-2xl font-bold text-white">6</p>
              </div>
              <Database className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          {showAIAssistant ? (
            <div className="h-[600px]">
              <GraphAIAssistant onEntityClick={handleEntityClick} />
            </div>
          ) : (
            <EnhancedInteractiveGraph
              graphData={graphData}
              onNodeClick={handleNodeClick}
              selectedNode={selectedNode}
              filters={filters}
              clustering={clustering}
              focusMode={focusMode}
              loading={isLoading}
            />
          )}
        </div>

        <div className="space-y-6 max-h-[800px] overflow-y-auto">
          <AdvancedGraphControls
            filters={filters}
            onFilterChange={setFilters}
            clustering={clustering}
            onClusteringChange={setClustering}
            focusMode={focusMode}
            onFocusModeChange={setFocusMode}
            availableNodeTypes={availableNodeTypes}
            availableRelationshipTypes={availableRelationshipTypes}
          />

          {selectedNode && (
            <>
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-4">
                  <p className="text-lg font-bold text-white">{selectedNode.label}</p>
                  <Badge className="mt-1 bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {selectedNode.node_type}
                  </Badge>
                </CardContent>
              </Card>

              {selectedInference && (
                <ExplainabilityPanel inference={selectedInference} />
              )}

              <DataSourceHub selectedEntity={selectedNode} />

              <AutoEnrichmentPanel 
                selectedNodeId={selectedNode.id} 
                onRefresh={refetchNodes}
              />

              <RelationshipInferencePanel 
                selectedNodeId={selectedNode.id}
                onInferenceSelect={setSelectedInference}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}