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
import GraphViewSelector from "../components/network/GraphViewSelector";
import GraphTemporalSlider from "../components/network/GraphTemporalSlider";
import AIGraphSuggestionsPanel from "../components/network/AIGraphSuggestionsPanel";
import NetworkAnomaliesPanel from "../components/network/NetworkAnomaliesPanel";
import NetworkPredictionsPanel from "../components/network/NetworkPredictionsPanel";
import KeyInfluencersPanel from "../components/network/KeyInfluencersPanel";
import NetworkReportGenerator from "../components/network/NetworkReportGenerator";
import { NetworkCollaborationProvider, useNetworkCollaboration } from "../components/network/NetworkCollaborationProvider";
import PresenceIndicators from "../components/network/PresenceIndicators";
import SharedCursors from "../components/network/SharedCursors";
import CollaborationPanel from "../components/network/CollaborationPanel";
import GraphCustomizationPanel from "../components/network/GraphCustomizationPanel";
import NetworkAutomationPanel from "../components/network/NetworkAutomationPanel";

function NetworkMapContent() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAutoPopulate, setShowAutoPopulate] = useState(false);
  const [graphView, setGraphView] = useState('force');
  const [showTemporal, setShowTemporal] = useState(false);
  const [temporalDate, setTemporalDate] = useState(new Date());
  const [isTemporalPlaying, setIsTemporalPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [customization, setCustomization] = useState(null);
  const graphContainerRef = React.useRef(null);
  const queryClient = useQueryClient();
  
  const { activeUsers, userCursors, updateCursorPosition, updateSharedState } = useNetworkCollaboration();

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

  const { data: anomalies, refetch: refetchAnomalies } = useQuery({
    queryKey: ['network_anomalies'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('detectNetworkAnomalies', {
        graph_data: { nodes, relationships }
      });
      return data.anomalies;
    },
    enabled: false
  });

  const { data: predictions, refetch: refetchPredictions } = useQuery({
    queryKey: ['network_predictions'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('predictNetworkTrends', {
        graph_data: { nodes, relationships },
        timeframe_days: 30
      });
      return data;
    },
    enabled: false
  });

  const { data: influencers, refetch: refetchInfluencers } = useQuery({
    queryKey: ['key_influencers'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('identifyKeyInfluencers', {
        graph_data: { nodes, relationships }
      });
      return data.influencers;
    },
    enabled: false
  });

  const analyzeNetworkMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        base44.functions.invoke('analyzeNetworkInsights', { analysis_type: 'full' }),
        refetchAnomalies(),
        refetchPredictions(),
        refetchInfluencers()
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['network_analysis']);
      toast.success("Full network analysis completed");
    }
  });

  // Calculate date ranges for temporal playback
  const minDate = nodes.length > 0 
    ? nodes.reduce((min, n) => new Date(n.created_date) < min ? new Date(n.created_date) : min, new Date(nodes[0].created_date))
    : new Date();

  const maxDate = new Date();

  // Temporal playback effect
  React.useEffect(() => {
    if (!isTemporalPlaying || !showTemporal) return;

    const interval = setInterval(() => {
      setTemporalDate(prev => {
        const next = new Date(prev.getTime() + (24 * 60 * 60 * 1000 * playbackSpeed));
        if (next > maxDate) {
          setIsTemporalPlaying(false);
          return maxDate;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isTemporalPlaying, showTemporal, playbackSpeed, maxDate]);

  // Filtrar por temporal
  const filteredByTime = showTemporal
    ? nodes.filter(n => new Date(n.created_date) <= temporalDate)
    : nodes;

  let filteredNodes = filteredByTime.filter(node =>
    !searchTerm || 
    node.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.node_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply customization filters
  if (customization?.filters) {
    if (customization.filters.node_types?.length > 0) {
      filteredNodes = filteredNodes.filter(n => 
        customization.filters.node_types.includes(n.node_type)
      );
    }
    if (customization.filters.search_term) {
      filteredNodes = filteredNodes.filter(n =>
        n.label?.toLowerCase().includes(customization.filters.search_term.toLowerCase())
      );
    }
  }

  const filteredNodeIds = Set ? new Set(filteredNodes.map(n => n.id)) : new window.Set(filteredNodes.map(n => n.id));
  const filteredRelationships = relationships.filter(r =>
    filteredNodeIds.has(r.from_node_id) && 
    filteredNodeIds.has(r.to_node_id) &&
    (!showTemporal || new Date(r.created_date) <= temporalDate)
  );

  const graphData = {
    nodes: filteredNodes,
    edges: filteredRelationships
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setShowSuggestions(true);
    setSelectedAnomaly(null);
    updateSharedState({ selectedNode: node });
  };

  const handleAnomalyClick = (anomaly) => {
    setSelectedAnomaly(anomaly);
    const node = nodes.find(n => n.id === anomaly.node_id);
    if (node) {
      setSelectedNode(node);
    }
  };

  const getRelatedNodesForAnomaly = (anomaly) => {
    if (!anomaly) return [];
    const connectedNodeIds = relationships
      .filter(r => r.from_node_id === anomaly.node_id || r.to_node_id === anomaly.node_id)
      .map(r => r.from_node_id === anomaly.node_id ? r.to_node_id : r.from_node_id);
    return nodes.filter(n => connectedNodeIds.includes(n.id));
  };

  const handleMouseMove = (e) => {
    if (!graphContainerRef.current) return;
    
    const rect = graphContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCursorPosition({ x, y });
    updateCursorPosition(x, y);
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

        {/* Presence Indicators */}
        <PresenceIndicators activeUsers={activeUsers} />
        <div className="flex gap-3">
          <GraphCustomizationPanel
            onApplyCustomization={setCustomization}
            currentConfig={customization}
            availableNodeTypes={[...new Set(nodes.map(n => n.node_type))]}
            availableMetrics={['traffic_load', 'error_rate', 'connection_count', 'influence_score']}
          />
          <GraphViewSelector currentView={graphView} onViewChange={setGraphView} />
          <Button
            onClick={() => setShowTemporal(!showTemporal)}
            variant="outline"
            className="border-slate-500 bg-slate-800/80 text-white hover:bg-slate-700 hover:border-slate-400"
          >
            {showTemporal ? 'Hide' : 'Show'} Timeline
          </Button>
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
                <p className="text-2xl font-bold text-white">{filteredNodes.length}</p>
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
                <p className="text-2xl font-bold text-white">{filteredRelationships.length}</p>
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
                  {filteredNodes.filter(n => n.node_type === 'company').length}
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
                  {filteredNodes.filter(n => n.node_type === 'executive').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Temporal Slider */}
      {showTemporal && (
        <GraphTemporalSlider
          minDate={minDate}
          maxDate={maxDate}
          currentDate={temporalDate}
          onDateChange={setTemporalDate}
          onPlayPause={() => setIsTemporalPlaying(!isTemporalPlaying)}
          isPlaying={isTemporalPlaying}
          playbackSpeed={playbackSpeed}
          onPlaybackSpeedChange={setPlaybackSpeed}
        />
      )}

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
              <CardTitle className="text-white">Interactive Network Graph - {graphView} view</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={graphContainerRef}
                onMouseMove={handleMouseMove}
                className="relative"
              >
                {/* Shared Cursors */}
                <SharedCursors 
                  cursors={userCursors} 
                  activeUsers={activeUsers}
                  containerRef={graphContainerRef}
                />
                {isLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  </div>
                ) : (
                  <EnhancedForceDirectedGraph
                    graphData={graphData}
                    onNodeClick={handleNodeClick}
                    selectedNode={selectedNode}
                    viewMode={graphView}
                    anomalies={anomalies}
                    predictions={showPredictions ? predictions : null}
                    influencers={influencers}
                    selectedAnomaly={selectedAnomaly}
                    customization={customization}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Network Automation */}
          <NetworkAutomationPanel />

          {/* Anomalies */}
          <NetworkAnomaliesPanel
            anomalies={anomalies}
            onAnomalyClick={handleAnomalyClick}
            relatedNodes={selectedAnomaly ? getRelatedNodesForAnomaly(selectedAnomaly) : []}
            predictions={predictions?.predictions}
          />

          {/* Predictions */}
          <NetworkPredictionsPanel
            predictions={predictions?.predictions}
            metadata={predictions?.metadata}
            onTogglePredictionView={() => setShowPredictions(!showPredictions)}
          />

          {/* Key Influencers */}
          <KeyInfluencersPanel
            influencers={influencers}
            onInfluencerClick={(influencer) => {
              const node = nodes.find(n => n.id === influencer.node_id);
              if (node) handleNodeClick(node);
            }}
          />

          {/* AI Suggestions */}
          <AIGraphSuggestionsPanel
            selectedNodeId={selectedNode?.id}
            onSuggestionApplied={() => {
              queryClient.invalidateQueries(['knowledge_graph_nodes']);
              queryClient.invalidateQueries(['knowledge_graph_relationships']);
            }}
          />

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
              </CardContent>
            </Card>
          )}

          {/* Collaboration Panel */}
          <CollaborationPanel activeUsers={activeUsers} />

          {/* Report Generator */}
          <NetworkReportGenerator
            graphData={graphData}
            anomalies={anomalies}
            predictions={predictions}
            influencers={influencers}
          />

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

export default function NetworkMap() {
  return (
    <NetworkCollaborationProvider sessionId="network-map">
      <NetworkMapContent />
    </NetworkCollaborationProvider>
  );
}