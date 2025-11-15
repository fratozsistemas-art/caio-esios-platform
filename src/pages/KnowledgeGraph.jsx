import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Network, Database, Loader2, CheckCircle, AlertCircle,
  TrendingUp, Building2, Users, Target, Sparkles, Search, Filter,
  ZoomIn, ZoomOut, Maximize2, RefreshCw, Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import GraphVisualization from "../components/graph/GraphVisualization";
import GraphInsights from "../components/graph/GraphInsights";

export default function KnowledgeGraph() {
  const queryClient = useQueryClient();
  const [isBuilding, setIsBuilding] = useState(false);
  const [isSeedingIbovespa, setIsSeedingIbovespa] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeType, setSelectedNodeType] = useState("all");
  const [selectedRelType, setSelectedRelType] = useState("all");
  const [showInsights, setShowInsights] = useState(false);

  const { data: graphStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['graphStats'],
    queryFn: async () => {
      const nodes = await base44.entities.KnowledgeGraphNode.list();
      const relationships = await base44.entities.KnowledgeGraphRelationship.list();

      const nodesByType = nodes.reduce((acc, node) => {
        acc[node.node_type] = (acc[node.node_type] || 0) + 1;
        return acc;
      }, {});

      const relsByType = relationships.reduce((acc, rel) => {
        acc[rel.relationship_type] = (acc[rel.relationship_type] || 0) + 1;
        return acc;
      }, {});

      return {
        total_nodes: nodes.length,
        total_relationships: relationships.length,
        nodes_by_type: nodesByType,
        relationships_by_type: relsByType,
        sample_nodes: nodes.slice(0, 10),
        all_nodes: nodes,
        all_relationships: relationships
      };
    },
    refetchInterval: 10000
  });

  const analyzeGraphMutation = useMutation({
    mutationFn: () => base44.functions.invoke('analyzeKnowledgeGraph'),
    onSuccess: (response) => {
      toast.success('AI analysis complete!');
      setShowInsights(true);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Analysis failed');
    }
  });

  const buildGraphMutation = useMutation({
    mutationFn: () => base44.functions.invoke('buildKnowledgeGraph'),
    onSuccess: (response) => {
      toast.success(`✅ Graph built! ${response.data?.graph_stats?.nodes_created || 0} nodes created`);
      refetchStats();
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`);
    }
  });

  const seedIbovespaMutation = useMutation({
    mutationFn: () => base44.functions.invoke('seedIbovespaCompanies'),
    onSuccess: (response) => {
      toast.success(`✅ ${response.data?.stats?.companies_created || 0} Ibovespa companies added!`);
      refetchStats();
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`);
    }
  });

  const handleBuildGraph = async () => {
    setIsBuilding(true);
    try {
      await buildGraphMutation.mutateAsync();
    } finally {
      setIsBuilding(false);
    }
  };

  const handleSeedIbovespa = async () => {
    setIsSeedingIbovespa(true);
    try {
      await seedIbovespaMutation.mutateAsync();
    } finally {
      setIsSeedingIbovespa(false);
    }
  };

  const handleAnalyzeGraph = async () => {
    await analyzeGraphMutation.mutateAsync();
  };

  const filteredNodes = graphStats?.all_nodes?.filter(node => {
    const matchesSearch = !searchQuery || 
      node.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.properties?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedNodeType === "all" || node.node_type === selectedNodeType;
    return matchesSearch && matchesType;
  }) || [];

  const filteredRelationships = graphStats?.all_relationships?.filter(rel => {
    const matchesType = selectedRelType === "all" || rel.relationship_type === selectedRelType;
    const hasFromNode = filteredNodes.some(n => n.id === rel.from_node_id);
    const hasToNode = filteredNodes.some(n => n.id === rel.to_node_id);
    return matchesType && hasFromNode && hasToNode;
  }) || [];

  const statCards = [
    {
      title: "Total Nodes",
      value: graphStats?.total_nodes || 0,
      filtered: filteredNodes.length,
      icon: Network,
      color: "from-blue-500 to-cyan-500",
      description: "Entities in the graph"
    },
    {
      title: "Companies",
      value: graphStats?.nodes_by_type?.company || 0,
      filtered: filteredNodes.filter(n => n.node_type === 'company').length,
      icon: Building2,
      color: "from-purple-500 to-pink-500",
      description: "Company nodes"
    },
    {
      title: "Relationships",
      value: graphStats?.total_relationships || 0,
      filtered: filteredRelationships.length,
      icon: Target,
      color: "from-green-500 to-emerald-500",
      description: "Connections between entities"
    },
    {
      title: "Industries",
      value: graphStats?.nodes_by_type?.industry || 0,
      filtered: filteredNodes.filter(n => n.node_type === 'industry').length,
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      description: "Industry/sector nodes"
    }
  ];

  const nodeTypes = ["all", ...(Object.keys(graphStats?.nodes_by_type || {}))];
  const relTypes = ["all", ...(Object.keys(graphStats?.relationships_by_type || {}))];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Network className="w-10 h-10 text-blue-400" />
            Knowledge Graph
          </h1>
          <p className="text-slate-400">
            Interactive graph database visualization with AI-powered insights
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => refetchStats()}
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
          
          {graphStats?.total_nodes > 0 && (
            <Button
              onClick={handleAnalyzeGraph}
              disabled={analyzeGraphMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {analyzeGraphMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  AI Insights
                </>
              )}
            </Button>
          )}

          <Button
            onClick={handleBuildGraph}
            disabled={isBuilding}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            {isBuilding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Building...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Build Graph
              </>
            )}
          </Button>

          <Button
            onClick={handleSeedIbovespa}
            disabled={isSeedingIbovespa}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isSeedingIbovespa ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                🇧🇷
                <span className="ml-2">Seed Ibovespa</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showInsights && analyzeGraphMutation.data?.data?.analysis && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GraphInsights 
              analysis={analyzeGraphMutation.data.data.analysis}
              onNodeHighlight={(nodeName) => setSearchQuery(nodeName)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.filtered !== stat.value && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {stat.filtered} filtered
                    </Badge>
                  )}
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {statsLoading ? "-" : stat.value.toLocaleString()}
                </h3>
                <p className="text-sm text-slate-400">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {(graphStats?.all_nodes?.length || 0) > 0 && (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search nodes by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <Select value={selectedNodeType} onValueChange={setSelectedNodeType}>
                <SelectTrigger className="w-full md:w-[200px] bg-white/5 border-white/10 text-white">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {nodeTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'all' ? 'All Node Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRelType} onValueChange={setSelectedRelType}>
                <SelectTrigger className="w-full md:w-[200px] bg-white/5 border-white/10 text-white">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {relTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'all' ? 'All Relations' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchQuery || selectedNodeType !== 'all' || selectedRelType !== 'all') && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedNodeType("all");
                    setSelectedRelType("all");
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  Clear
                </Button>
              )}
            </div>
            {(searchQuery || selectedNodeType !== 'all' || selectedRelType !== 'all') && (
              <div className="mt-4 text-sm text-slate-400">
                Showing {filteredNodes.length} nodes and {filteredRelationships.length} relationships
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(graphStats?.all_nodes?.length || 0) > 0 ? (
        <GraphVisualization 
          nodes={filteredNodes}
          relationships={filteredRelationships}
          searchQuery={searchQuery}
          highlightedNodes={analyzeGraphMutation.data?.data?.analysis?.highlighted_nodes}
        />
      ) : (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white">Graph Visualization</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <p className="ml-2 text-slate-400">Loading graph data...</p>
              </div>
            ) : (
              <>
                <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No graph data available to visualize.</p>
                <p className="text-sm text-slate-500 mb-6">
                  Build the graph or seed Ibovespa companies to see a visualization.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleBuildGraph}
                    disabled={isBuilding}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Build Graph
                  </Button>
                  <Button
                    onClick={handleSeedIbovespa}
                    disabled={isSeedingIbovespa}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    🇧🇷
                    <span className="ml-2">Seed Ibovespa</span>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}