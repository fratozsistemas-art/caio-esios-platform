import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Network, Building2, Users, Code, TrendingUp, Target, 
  DollarSign, GitMerge, Database, Search, ChevronRight,
  ExternalLink, Sparkles, ArrowRight, Loader2, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const NODE_CONFIG = {
  company: { color: '#3b82f6', icon: Building2, label: 'Companies' },
  person: { color: '#8b5cf6', icon: Users, label: 'People' },
  executive: { color: '#8b5cf6', icon: Users, label: 'Executives' },
  technology: { color: '#06b6d4', icon: Code, label: 'Technologies' },
  market: { color: '#10b981', icon: TrendingUp, label: 'Markets' },
  strategy: { color: '#f59e0b', icon: Target, label: 'Strategies' },
  investor: { color: '#10b981', icon: DollarSign, label: 'Investors' },
  framework: { color: '#ec4899', icon: GitMerge, label: 'Frameworks' },
  metric: { color: '#84cc16', icon: Database, label: 'Metrics' }
};

export default function StrategicConnectionsExplorer({ 
  contextEntities = [],
  onEntitySelect,
  compact = false 
}) {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: nodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ['strategic_connections_nodes'],
    queryFn: () => base44.entities.KnowledgeGraphNode.list('-created_date', 200)
  });

  const { data: relationships = [], isLoading: relsLoading } = useQuery({
    queryKey: ['strategic_connections_relationships'],
    queryFn: () => base44.entities.KnowledgeGraphRelationship.list('-created_date', 500)
  });

  // Find relevant nodes based on context
  const relevantNodes = React.useMemo(() => {
    if (contextEntities.length === 0) return nodes.slice(0, 50);
    
    const contextLabels = contextEntities.map(e => e.toLowerCase());
    const directMatches = nodes.filter(n => 
      contextLabels.some(label => 
        n.label?.toLowerCase().includes(label) || 
        label.includes(n.label?.toLowerCase())
      )
    );

    const directIds = new Set(directMatches.map(n => n.id));
    const connectedIds = new Set();
    
    relationships.forEach(r => {
      if (directIds.has(r.from_node_id)) connectedIds.add(r.to_node_id);
      if (directIds.has(r.to_node_id)) connectedIds.add(r.from_node_id);
    });

    const connectedNodes = nodes.filter(n => connectedIds.has(n.id) && !directIds.has(n.id));
    return [...directMatches, ...connectedNodes];
  }, [nodes, relationships, contextEntities]);

  // Group by type
  const nodesByType = React.useMemo(() => {
    const groups = {};
    relevantNodes.forEach(node => {
      const type = node.node_type || 'other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(node);
    });
    return groups;
  }, [relevantNodes]);

  // Filter nodes
  const filteredNodes = relevantNodes.filter(node => {
    const matchesSearch = !searchTerm || node.label?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || node.node_type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Get connections for a node
  const getConnections = (nodeId) => {
    const connected = [];
    relationships.forEach(r => {
      if (r.from_node_id === nodeId) {
        const target = nodes.find(n => n.id === r.to_node_id);
        if (target) connected.push({ node: target, type: r.relationship_type, direction: 'outgoing' });
      }
      if (r.to_node_id === nodeId) {
        const source = nodes.find(n => n.id === r.from_node_id);
        if (source) connected.push({ node: source, type: r.relationship_type, direction: 'incoming' });
      }
    });
    return connected;
  };

  const handleEntityClick = (node) => {
    setSelectedEntity(node);
    if (onEntitySelect) onEntitySelect(node);
  };

  const isLoading = nodesLoading || relsLoading;
  const categories = Object.keys(nodesByType);

  if (compact) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              Related Entities
            </CardTitle>
            <Link
              to={createPageUrl("KnowledgeGraph")}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View Graph <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredNodes.slice(0, 12).map(node => {
                const config = NODE_CONFIG[node.node_type] || { color: '#64748b', icon: Network };
                const Icon = config.icon;
                return (
                  <Badge
                    key={node.id}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ 
                      backgroundColor: config.color + '20',
                      color: config.color,
                      borderColor: config.color + '40'
                    }}
                    onClick={() => handleEntityClick(node)}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {node.label?.length > 15 ? node.label.substring(0, 15) + '...' : node.label}
                  </Badge>
                );
              })}
              {filteredNodes.length > 12 && (
                <Badge className="bg-white/10 text-slate-400 border-white/20">
                  +{filteredNodes.length - 12} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="py-3 px-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            Strategic Connections Explorer
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
              {relevantNodes.length} entities
            </Badge>
          </CardTitle>
          <Link
            to={createPageUrl("KnowledgeGraph")}
            className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
          >
            Full Knowledge Graph <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Search and Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entities..."
              className="pl-9 bg-white/5 border-white/10 text-white h-9"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-4">
          <TabsList className="bg-white/5 p-1 flex-wrap h-auto">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              All ({relevantNodes.length})
            </TabsTrigger>
            {categories.map(type => {
              const config = NODE_CONFIG[type] || { color: '#64748b', icon: Network, label: type };
              const Icon = config.icon;
              return (
                <TabsTrigger 
                  key={type} 
                  value={type}
                  className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                >
                  <Icon className="w-3 h-3 mr-1" style={{ color: config.color }} />
                  {config.label || type} ({nodesByType[type]?.length || 0})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Entity List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {filteredNodes.slice(0, 20).map(node => {
                const config = NODE_CONFIG[node.node_type] || { color: '#64748b', icon: Network };
                const Icon = config.icon;
                const isSelected = selectedEntity?.id === node.id;
                const connections = getConnections(node.id);

                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-cyan-500/10 border-cyan-500/30' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => handleEntityClick(node)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: config.color + '20' }}
                        >
                          <Icon className="w-4 h-4" style={{ color: config.color }} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {node.label?.length > 25 ? node.label.substring(0, 25) + '...' : node.label}
                          </p>
                          <p className="text-xs text-slate-500">{node.node_type}</p>
                        </div>
                      </div>
                      <Badge className="bg-white/10 text-slate-400 text-xs">
                        {connections.length}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
              {filteredNodes.length > 20 && (
                <p className="text-xs text-slate-500 text-center py-2">
                  +{filteredNodes.length - 20} more entities
                </p>
              )}
            </div>

            {/* Selected Entity Details */}
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              {selectedEntity ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    {React.createElement(NODE_CONFIG[selectedEntity.node_type]?.icon || Network, {
                      className: "w-6 h-6 mt-1",
                      style: { color: NODE_CONFIG[selectedEntity.node_type]?.color }
                    })}
                    <div>
                      <h3 className="text-white font-semibold">{selectedEntity.label}</h3>
                      <Badge 
                        className="mt-1 text-xs"
                        style={{ 
                          backgroundColor: NODE_CONFIG[selectedEntity.node_type]?.color + '20',
                          color: NODE_CONFIG[selectedEntity.node_type]?.color 
                        }}
                      >
                        {selectedEntity.node_type}
                      </Badge>
                    </div>
                  </div>

                  {selectedEntity.properties && Object.keys(selectedEntity.properties).length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-white/10">
                      <h4 className="text-xs text-slate-400 uppercase">Properties</h4>
                      {Object.entries(selectedEntity.properties).slice(0, 5).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-slate-500">{key}</span>
                          <span className="text-white">{String(value).substring(0, 30)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 pt-3 border-t border-white/10">
                    <h4 className="text-xs text-slate-400 uppercase">
                      Connections ({getConnections(selectedEntity.id).length})
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {getConnections(selectedEntity.id).slice(0, 10).map((conn, idx) => {
                        const config = NODE_CONFIG[conn.node.node_type] || { color: '#64748b', icon: Network };
                        return (
                          <div 
                            key={idx}
                            className="flex items-center justify-between p-2 bg-white/5 rounded text-xs cursor-pointer hover:bg-white/10"
                            onClick={() => handleEntityClick(conn.node)}
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: config.color }}
                              />
                              <span className="text-white">{conn.node.label}</span>
                            </div>
                            <Badge className="bg-white/10 text-slate-400 text-xs">
                              {conn.type || 'related'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Link
                    to={createPageUrl("KnowledgeGraph")}
                    className="flex items-center justify-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 pt-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Explore in Full Graph
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Info className="w-8 h-8 text-slate-600 mb-3" />
                  <p className="text-slate-400 text-sm">Select an entity to view details</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Discover connections and relationships
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}