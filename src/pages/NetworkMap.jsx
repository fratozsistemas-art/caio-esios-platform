import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Network, Sparkles, TrendingUp, Users, Building2, 
  Loader2, Search, Plus, Play, GitMerge
} from "lucide-react";
import { toast } from "sonner";
import EnhancedForceDirectedGraph from "../components/network/EnhancedForceDirectedGraph";
import RelationshipSuggestions from "../components/network/RelationshipSuggestions";
import NetworkInsightsPanel from "../components/network/NetworkInsightsPanel";
import AutoPopulateDialog from "../components/network/AutoPopulateDialog";

export default function NetworkMap() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAutoPopulate, setShowAutoPopulate] = useState(false);
  const queryClient = useQueryClient();

  const { data: nodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ['knowledge_graph_nodes'],
    queryFn: () => base44.entities.KnowledgeGraphNode.list()
  });

  const { data: relationships = [], isLoading: relsLoading } = useQuery({
    queryKey: ['knowledge_graph_relationships'],
    queryFn: () => base44.entities.KnowledgeGraphRelationship.list()
  });

  const { data: networkAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['network_analysis'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('analyzeNetworkInsights', {
        analysis_type: 'full'
      });
      return data;
    },
    enabled: nodes.length > 0
  });

  const analyzeNetworkMutation = useMutation({
    mutationFn: () => base44.functions.invoke('analyzeNetworkInsights', {
      analysis_type: 'full'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['network_analysis']);
      toast.success("Network analysis updated");
    }
  });

  const filteredNodes = nodes.filter(node =>
    !searchTerm || 
    node.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.node_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredRelationships = relationships.filter(r =>
    filteredNodeIds.has(r.from_node_id) && filteredNodeIds.has(r.to_node_id)
  );

  const graphData = {
    nodes: filteredNodes,
    edges: filteredRelationships
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setShowSuggestions(true);
  };

  const handleRelationshipCreated = () => {
    queryClient.invalidateQueries(['knowledge_graph_relationships']);
    toast.success("Relationship created");
  };

  const isLoading = nodesLoading || relsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-blue-400" />
            Network Intelligence Map
          </h1>
          <p className="text-slate-400 mt-1">
            AI-powered relationship discovery and network analysis
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAutoPopulate(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Auto-Populate Network
          </Button>
          <Button
            onClick={() => analyzeNetworkMutation.mutate()}
            disabled={analysisLoading || analyzeNetworkMutation.isPending}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/10"
          >
            {analyzeNetworkMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4 mr-2" />
            )}
            Analyze Network
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Nodes</p>
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
              <GitMerge className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Companies</p>
                <p className="text-2xl font-bold text-white">
                  {nodes.filter(n => n.node_type === 'company').length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Executives</p>
                <p className="text-2xl font-bold text-white">
                  {nodes.filter(n => n.node_type === 'executive').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search nodes by name or type..."
          className="pl-12 bg-white/5 border-white/10 text-white"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Graph Visualization */}
        <div className="col-span-2">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Interactive Network Graph</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
              ) : (
                <EnhancedForceDirectedGraph
                  graphData={graphData}
                  onNodeClick={handleNodeClick}
                  selectedNode={selectedNode}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Selected Node Info */}
          {selectedNode && (
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Selected Node
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-lg font-bold text-white">{selectedNode.label}</p>
                  <Badge className="mt-1">{selectedNode.node_type}</Badge>
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
                <Button
                  onClick={() => setShowSuggestions(true)}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Suggest Relationships
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Network Insights */}
          {networkAnalysis && (
            <NetworkInsightsPanel analysis={networkAnalysis} />
          )}
        </div>
      </div>

      {/* Relationship Suggestions Dialog */}
      {showSuggestions && selectedNode && (
        <RelationshipSuggestions
          selectedNode={selectedNode}
          onClose={() => setShowSuggestions(false)}
          onRelationshipCreated={handleRelationshipCreated}
        />
      )}

      {/* Auto-Populate Dialog */}
      {showAutoPopulate && (
        <AutoPopulateDialog
          onClose={() => setShowAutoPopulate(false)}
          onComplete={() => {
            queryClient.invalidateQueries(['knowledge_graph_nodes']);
            queryClient.invalidateQueries(['knowledge_graph_relationships']);
            setShowAutoPopulate(false);
          }}
        />
      )}
    </div>
  );
}