
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Network, Database, Loader2, AlertCircle,
  TrendingUp, Building2, Target, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import GraphVisualization from "../components/graph/GraphVisualization";

export default function KnowledgeGraph() {
  const queryClient = useQueryClient();
  const [isBuilding, setIsBuilding] = useState(false);
  const [isSeedingIbovespa, setIsSeedingIbovespa] = useState(false);

  // ✅ Fetch Graph Stats
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
        // Add raw data for visualization
        all_nodes: nodes,
        all_relationships: relationships
      };
    },
    refetchInterval: 10000 // Refresh every 10s
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

  const statCards = [
    {
      title: "Total Nodes",
      value: graphStats?.total_nodes || 0,
      icon: Network,
      color: "from-blue-500 to-cyan-500",
      description: "Entities in the graph"
    },
    {
      title: "Companies",
      value: graphStats?.nodes_by_type?.company || 0,
      icon: Building2,
      color: "from-purple-500 to-pink-500",
      description: "Company nodes"
    },
    {
      title: "Relationships",
      value: graphStats?.total_relationships || 0,
      icon: Target,
      color: "from-green-500 to-emerald-500",
      description: "Connections between entities"
    },
    {
      title: "Industries",
      value: graphStats?.nodes_by_type?.industry || 0,
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      description: "Industry/sector nodes"
    }
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Network className="w-10 h-10 text-blue-400" />
            Knowledge Graph
          </h1>
          <p className="text-slate-400">
            Graph database status and management
          </p>
        </div>
        <div className="flex gap-3">
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

      {/* ✅ NEW: Enhanced Graph Visualization */}
      {(graphStats?.all_nodes?.length || 0) > 0 ? (
        <GraphVisualization 
          nodes={graphStats?.all_nodes || []}
          relationships={graphStats?.all_relationships || []}
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
                <p className="text-sm text-slate-500">
                  Build the graph or seed Ibovespa companies to see a visualization.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
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

      {/* Node Types Breakdown */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white">Node Types</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : graphStats?.total_nodes === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Knowledge Graph is empty</p>
              <Button
                onClick={handleBuildGraph}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Build Graph Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(graphStats?.nodes_by_type || {}).map(([type, count]) => (
                <div key={type} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-white mb-1">{count}</div>
                  <div className="text-sm text-slate-400 capitalize">{type}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relationship Types */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white">Relationship Types</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : graphStats?.total_relationships === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No relationships yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(graphStats?.relationships_by_type || {}).map(([type, count]) => (
                <div key={type} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-white mb-1">{count}</div>
                  <div className="text-sm text-slate-400">{type}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Nodes */}
      {graphStats?.sample_nodes && graphStats.sample_nodes.length > 0 && (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white">Sample Nodes</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {graphStats.sample_nodes.map((node, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {node.node_type}
                    </Badge>
                    <span className="text-white font-medium">{node.label}</span>
                  </div>
                  {node.properties?.ticker && (
                    <Badge variant="outline" className="border-white/20 text-white">
                      {node.properties.ticker}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
