import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Network, Loader2, RefreshCw, Database, TrendingUp,
  BarChart3, Sparkles, GitMerge
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import InteractiveGraphVisualization from "../components/graph/InteractiveGraphVisualization";
import GraphInsights from "../components/graph/GraphInsights";

export default function KnowledgeGraph() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('visualization');

  // Query para estatísticas do grafo
  const { data: graphStats, isLoading: statsLoading } = useQuery({
    queryKey: ['graphStats'],
    queryFn: async () => {
      const nodes = await base44.entities.KnowledgeGraphNode.list();
      const relationships = await base44.entities.KnowledgeGraphRelationship.list();
      
      const nodesByType = {};
      nodes.forEach(node => {
        nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
      });

      const relsByType = {};
      relationships.forEach(rel => {
        relsByType[rel.type] = (relsByType[rel.type] || 0) + 1;
      });

      return {
        total_nodes: nodes.length,
        total_relationships: relationships.length,
        nodes_by_type: nodesByType,
        relationships_by_type: relsByType,
        avg_connections: nodes.length > 0 ? (relationships.length * 2 / nodes.length).toFixed(2) : 0
      };
    },
    refetchInterval: 30000
  });

  // Query para nós e relacionamentos
  const { data: graphData, isLoading: graphLoading } = useQuery({
    queryKey: ['graphData'],
    queryFn: async () => {
      const nodes = await base44.entities.KnowledgeGraphNode.list();
      const relationships = await base44.entities.KnowledgeGraphRelationship.list();
      return { nodes, relationships };
    }
  });

  // Mutation para build do grafo
  const buildGraphMutation = useMutation({
    mutationFn: () => base44.functions.invoke('buildKnowledgeGraph'),
    onSuccess: () => {
      toast.success('Knowledge Graph construído com sucesso!');
      queryClient.invalidateQueries(['graphStats']);
      queryClient.invalidateQueries(['graphData']);
    },
    onError: () => toast.error('Erro ao construir o grafo')
  });

  // Mutation para análise AI
  const analyzeGraphMutation = useMutation({
    mutationFn: () => base44.functions.invoke('analyzeKnowledgeGraph'),
    onSuccess: (response) => {
      toast.success('Análise AI concluída!');
      queryClient.invalidateQueries(['graphInsights']);
    },
    onError: () => toast.error('Erro na análise AI')
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Knowledge Graph</h1>
            <p className="text-slate-400">Visualização interativa e inteligência de relacionamentos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => buildGraphMutation.mutate()}
            disabled={buildGraphMutation.isPending}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
          >
            {buildGraphMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={() => analyzeGraphMutation.mutate()}
            disabled={analyzeGraphMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {analyzeGraphMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Análise AI
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {graphStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Database, label: 'Total de Nós', value: graphStats.total_nodes, color: 'from-blue-500 to-cyan-500' },
            { icon: GitMerge, label: 'Relacionamentos', value: graphStats.total_relationships, color: 'from-green-500 to-emerald-500' },
            { icon: BarChart3, label: 'Tipos de Nós', value: Object.keys(graphStats.nodes_by_type).length, color: 'from-purple-500 to-pink-500' },
            { icon: TrendingUp, label: 'Conexões Médias', value: graphStats.avg_connections, color: 'from-orange-500 to-red-500' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="visualization">Visualização Interativa</TabsTrigger>
          <TabsTrigger value="insights">Insights AI</TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="mt-6">
          {graphLoading ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
                <p className="text-slate-400">Carregando grafo...</p>
              </CardContent>
            </Card>
          ) : graphData && graphData.nodes.length > 0 ? (
            <InteractiveGraphVisualization
              nodes={graphData.nodes}
              relationships={graphData.relationships}
            />
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-12 text-center">
                <Network className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Knowledge Graph Vazio</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Construa o grafo para começar a visualizar relacionamentos entre entidades
                </p>
                <Button onClick={() => buildGraphMutation.mutate()} className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Construir Knowledge Graph
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <GraphInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
}