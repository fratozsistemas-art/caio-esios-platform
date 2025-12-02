import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Network, Building2, Users, Code, TrendingUp, Target, 
  DollarSign, GitMerge, Database, Search, ChevronRight,
  ExternalLink, Sparkles, ArrowRight, Loader2, Info, X,
  Plus, Minus, Route, Filter, Eye, Link2, MousePointer,
  Brain, Save, Share2, Copy, Grid3X3, Wand2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

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
  compact = false,
  highlightedInsights = []
}) {
  const [selectedEntities, setSelectedEntities] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedEntities, setExpandedEntities] = useState(new Set());
  const [highlightedPath, setHighlightedPath] = useState([]);
  const [insightFilters, setInsightFilters] = useState([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [isAIPathfinding, setIsAIPathfinding] = useState(false);
  const [aiPathResult, setAiPathResult] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [viewName, setViewName] = useState("");
  const [clusteringEnabled, setClusteringEnabled] = useState(false);
  const [clusters, setClusters] = useState([]);

  const { data: nodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ['strategic_connections_nodes'],
    queryFn: () => base44.entities.KnowledgeGraphNode.list('-created_date', 300)
  });

  const { data: relationships = [], isLoading: relsLoading } = useQuery({
    queryKey: ['strategic_connections_relationships'],
    queryFn: () => base44.entities.KnowledgeGraphRelationship.list('-created_date', 800)
  });

  // Get connections for a node
  const getConnections = useCallback((nodeId) => {
    const connected = [];
    relationships.forEach(r => {
      if (r.from_node_id === nodeId) {
        const target = nodes.find(n => n.id === r.to_node_id);
        if (target) connected.push({ node: target, type: r.relationship_type, direction: 'outgoing', relId: r.id });
      }
      if (r.to_node_id === nodeId) {
        const source = nodes.find(n => n.id === r.from_node_id);
        if (source) connected.push({ node: source, type: r.relationship_type, direction: 'incoming', relId: r.id });
      }
    });
    return connected;
  }, [nodes, relationships]);

  // Find path between two nodes (BFS)
  const findPath = useCallback((startId, endId) => {
    if (!startId || !endId) return [];
    
    const queue = [[startId]];
    const visited = new Set([startId]);
    
    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      
      if (current === endId) return path;
      
      const neighbors = [];
      relationships.forEach(r => {
        if (r.from_node_id === current && !visited.has(r.to_node_id)) {
          neighbors.push(r.to_node_id);
        }
        if (r.to_node_id === current && !visited.has(r.from_node_id)) {
          neighbors.push(r.from_node_id);
        }
      });
      
      for (const neighbor of neighbors) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
    
    return [];
  }, [relationships]);

  // AI-powered strategic pathfinding
  const findStrategicPath = useCallback(async (startId, endId) => {
    const startNode = nodes.find(n => n.id === startId);
    const endNode = nodes.find(n => n.id === endId);
    if (!startNode || !endNode) return null;

    setIsAIPathfinding(true);
    try {
      const paths = [];
      const findAllPaths = (current, target, visited, path, depth) => {
        if (depth > 4) return;
        if (current === target) { paths.push([...path]); return; }
        relationships.forEach(r => {
          let next = null;
          if (r.from_node_id === current && !visited.has(r.to_node_id)) next = r.to_node_id;
          if (r.to_node_id === current && !visited.has(r.from_node_id)) next = r.from_node_id;
          if (next) {
            visited.add(next);
            path.push(next);
            findAllPaths(next, target, visited, path, depth + 1);
            path.pop();
            visited.delete(next);
          }
        });
      };
      findAllPaths(startId, endId, new Set([startId]), [startId], 0);

      if (paths.length === 0) { toast.error("No path found"); return null; }

      const pathsWithDetails = paths.slice(0, 10).map(path => ({
        nodes: path.map(id => { const n = nodes.find(node => node.id === id); return { id, label: n?.label, type: n?.node_type }; }),
        relationships: path.slice(0, -1).map((id, idx) => {
          const rel = relationships.find(r => (r.from_node_id === id && r.to_node_id === path[idx + 1]) || (r.to_node_id === id && r.from_node_id === path[idx + 1]));
          return rel?.relationship_type || 'connected';
        })
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze paths between "${startNode.label}" and "${endNode.label}":\n${pathsWithDetails.map((p, i) => `Path ${i + 1}: ${p.nodes.map(n => n.label).join(' → ')}`).join('\n')}\nSelect most strategically relevant path.`,
        response_json_schema: {
          type: "object",
          properties: {
            best_path_index: { type: "integer" },
            strategic_score: { type: "number" },
            reasoning: { type: "string" },
            opportunities: { type: "array", items: { type: "string" } }
          }
        }
      });

      setHighlightedPath(paths[result.best_path_index] || paths[0]);
      setAiPathResult(result);
      toast.success(`Strategic path found (score: ${result.strategic_score})`);
      return result;
    } catch (error) {
      toast.error("AI pathfinding failed");
      return null;
    } finally {
      setIsAIPathfinding(false);
    }
  }, [nodes, relationships]);

  // Clustering
  const computeClusters = useMemo(() => {
    if (!clusteringEnabled || relevantNodes.length < 8) return [];
    const typeGroups = {};
    relevantNodes.forEach(node => {
      const type = node.node_type || 'other';
      if (!typeGroups[type]) typeGroups[type] = [];
      typeGroups[type].push(node);
    });
    return Object.entries(typeGroups).filter(([_, n]) => n.length >= 3).map(([type, nodeList]) => ({
      type,
      count: nodeList.length,
      color: NODE_CONFIG[type]?.color || '#64748b'
    }));
  }, [clusteringEnabled, relevantNodes]);

  // Save view
  const saveCurrentView = useCallback(async () => {
    try {
      await base44.entities.SharedInsight.create({
        title: viewName || `Explorer View ${new Date().toLocaleDateString()}`,
        content: JSON.stringify({
          selectedEntities: Array.from(selectedEntities),
          expandedEntities: Array.from(expandedEntities),
          highlightedPath,
          filters: insightFilters
        }),
        source_entity_type: 'knowledge_graph',
        visibility: 'team',
        tags: ['explorer-view', ...insightFilters.slice(0, 3)]
      });
      toast.success("View saved!");
      setShowSaveDialog(false);
      setViewName("");
    } catch (error) {
      toast.error("Failed to save");
    }
  }, [viewName, selectedEntities, expandedEntities, highlightedPath, insightFilters]);

  // Find relevant nodes based on context and expansions
  const relevantNodes = React.useMemo(() => {
    const allFilters = [...contextEntities, ...insightFilters].filter(Boolean);
    
    if (allFilters.length === 0 && expandedEntities.size === 0) {
      return nodes.slice(0, 50);
    }
    
    const contextLabels = allFilters.map(e => e?.toLowerCase()).filter(Boolean);
    const directMatches = nodes.filter(n => 
      contextLabels.some(label => 
        n.label?.toLowerCase().includes(label) || 
        label.includes(n.label?.toLowerCase())
      )
    );

    const directIds = new Set(directMatches.map(n => n.id));
    const connectedIds = new Set();
    
    // Add connections from context matches
    relationships.forEach(r => {
      if (directIds.has(r.from_node_id)) connectedIds.add(r.to_node_id);
      if (directIds.has(r.to_node_id)) connectedIds.add(r.from_node_id);
    });

    // Add connections from expanded entities
    expandedEntities.forEach(entityId => {
      relationships.forEach(r => {
        if (r.from_node_id === entityId) connectedIds.add(r.to_node_id);
        if (r.to_node_id === entityId) connectedIds.add(r.from_node_id);
      });
    });

    const connectedNodes = nodes.filter(n => 
      connectedIds.has(n.id) && !directIds.has(n.id)
    );
    
    return [...directMatches, ...connectedNodes];
  }, [nodes, relationships, contextEntities, expandedEntities, insightFilters]);

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

  const handleEntityClick = (node) => {
    if (multiSelectMode) {
      setSelectedEntities(prev => {
        const newSet = new Set(prev);
        if (newSet.has(node.id)) {
          newSet.delete(node.id);
        } else {
          newSet.add(node.id);
        }
        return newSet;
      });
    } else {
      setSelectedEntities(new Set([node.id]));
      if (onEntitySelect) onEntitySelect(node);
    }
  };

  const toggleExpansion = (nodeId) => {
    setExpandedEntities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
        toast.info("Entity collapsed");
      } else {
        newSet.add(nodeId);
        toast.success("Entity expanded - showing connections");
      }
      return newSet;
    });
  };

  const showPathBetweenSelected = () => {
    const selectedArray = Array.from(selectedEntities);
    if (selectedArray.length === 2) {
      const path = findPath(selectedArray[0], selectedArray[1]);
      if (path.length > 0) {
        setHighlightedPath(path);
        toast.success(`Path found: ${path.length} entities`);
      } else {
        toast.error("No path found between selected entities");
      }
    }
  };

  const clearSelection = () => {
    setSelectedEntities(new Set());
    setHighlightedPath([]);
  };

  const addInsightFilter = (insight) => {
    const filterText = insight.split(' ').slice(0, 4).join(' ');
    if (!insightFilters.includes(filterText)) {
      setInsightFilters(prev => [...prev, filterText]);
      toast.success("Filter added");
    }
  };

  const removeInsightFilter = (filter) => {
    setInsightFilters(prev => prev.filter(f => f !== filter));
  };

  const isLoading = nodesLoading || relsLoading;
  const categories = Object.keys(nodesByType);

  // Compact view
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
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {filteredNodes.slice(0, 12).map(node => {
                  const config = NODE_CONFIG[node.node_type] || { color: '#64748b', icon: Network };
                  const Icon = config.icon;
                  const isSelected = selectedEntities.has(node.id);
                  const isExpanded = expandedEntities.has(node.id);
                  
                  return (
                    <Badge
                      key={node.id}
                      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-white' : ''} ${isExpanded ? 'ring-1 ring-purple-400' : ''}`}
                      style={{ 
                        backgroundColor: config.color + '20',
                        color: config.color,
                        borderColor: config.color + '40'
                      }}
                      onClick={() => handleEntityClick(node)}
                      onDoubleClick={() => toggleExpansion(node.id)}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {node.label?.length > 15 ? node.label.substring(0, 15) + '...' : node.label}
                      {isExpanded && <Plus className="w-2 h-2 ml-1" />}
                    </Badge>
                  );
                })}
                {filteredNodes.length > 12 && (
                  <Badge className="bg-white/10 text-slate-400 border-white/20">
                    +{filteredNodes.length - 12} more
                  </Badge>
                )}
              </div>
              {highlightedInsights.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-slate-500 mb-1">Filter by insight:</p>
                  <div className="flex flex-wrap gap-1">
                    {highlightedInsights.slice(0, 3).map((insight, idx) => (
                      <Badge
                        key={idx}
                        className="text-xs bg-slate-700/50 text-slate-300 cursor-pointer hover:bg-amber-500/20 hover:text-amber-400"
                        onClick={() => addInsightFilter(insight)}
                      >
                        <Plus className="w-2 h-2 mr-1" />
                        {insight.length > 20 ? insight.substring(0, 20) + '...' : insight}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full view
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
        {/* Controls Bar */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entities..."
              className="pl-9 bg-white/5 border-white/10 text-white h-9"
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMultiSelectMode(!multiSelectMode)}
            className={`h-9 px-3 ${multiSelectMode ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-white/5 text-slate-400'} border border-white/10`}
          >
            <MousePointer className="w-3 h-3 mr-1" />
            {multiSelectMode ? 'Multi-Select' : 'Single'}
          </Button>

          {selectedEntities.size === 2 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={showPathBetweenSelected}
                className="h-9 px-3 bg-purple-500/20 text-purple-400 border border-purple-500/30"
              >
                <Route className="w-3 h-3 mr-1" />
                Path
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const [a, b] = Array.from(selectedEntities);
                  findStrategicPath(a, b);
                }}
                disabled={isAIPathfinding}
                className="h-9 px-3 bg-amber-500/20 text-amber-400 border border-amber-500/30"
              >
                {isAIPathfinding ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Brain className="w-3 h-3 mr-1" />}
                AI Path
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setClusteringEnabled(!clusteringEnabled)}
            className={`h-9 px-3 ${clusteringEnabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-slate-400'} border border-white/10`}
          >
            <Grid3X3 className="w-3 h-3 mr-1" />
            Cluster
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            className="h-9 px-3 bg-white/5 text-slate-400 border border-white/10"
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>

          {(selectedEntities.size > 0 || highlightedPath.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-9 px-3 bg-white/5 text-slate-400 border border-white/10"
            >
              <X className="w-3 h-3 mr-1" />
              Clear ({selectedEntities.size})
            </Button>
          )}
        </div>

        {/* Insight Filters */}
        {(insightFilters.length > 0 || highlightedInsights.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4 p-2 bg-white/5 rounded-lg border border-white/10">
            <span className="text-xs text-slate-500 self-center">Filters:</span>
            {insightFilters.map((filter, idx) => (
              <Badge 
                key={idx}
                className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs cursor-pointer hover:bg-amber-500/30"
                onClick={() => removeInsightFilter(filter)}
              >
                {filter}
                <X className="w-2 h-2 ml-1" />
              </Badge>
            ))}
            {highlightedInsights.slice(0, 4).map((insight, idx) => (
              <Badge 
                key={`hi-${idx}`}
                className="bg-slate-700/50 text-slate-300 text-xs cursor-pointer hover:bg-cyan-500/20 hover:text-cyan-400"
                onClick={() => addInsightFilter(insight)}
              >
                <Plus className="w-2 h-2 mr-1" />
                {insight.length > 20 ? insight.substring(0, 20) + '...' : insight}
              </Badge>
            ))}
          </div>
        )}

        {/* AI Path Result */}
        <AnimatePresence>
          {aiPathResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span className="text-white text-sm font-medium">AI Strategic Path</span>
                  <Badge className="bg-amber-500/20 text-amber-400 text-xs">Score: {aiPathResult.strategic_score}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setAiPathResult(null); setHighlightedPath([]); }} className="h-5 w-5 text-slate-400">
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-slate-300">{aiPathResult.reasoning}</p>
              {aiPathResult.opportunities?.[0] && (
                <div className="mt-2 text-xs text-green-400"><Sparkles className="w-3 h-3 inline mr-1" />{aiPathResult.opportunities[0]}</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cluster Summary */}
        {clusteringEnabled && computeClusters.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {computeClusters.map(cluster => (
              <Badge key={cluster.type} style={{ backgroundColor: cluster.color + '20', color: cluster.color, borderColor: cluster.color + '40' }}>
                <Grid3X3 className="w-3 h-3 mr-1" />
                {NODE_CONFIG[cluster.type]?.label || cluster.type}: {cluster.count}
              </Badge>
            ))}
          </div>
        )}

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
              {filteredNodes.slice(0, 25).map(node => {
                const config = NODE_CONFIG[node.node_type] || { color: '#64748b', icon: Network };
                const Icon = config.icon;
                const isSelected = selectedEntities.has(node.id);
                const isExpanded = expandedEntities.has(node.id);
                const isInPath = highlightedPath.includes(node.id);
                const connections = getConnections(node.id);

                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isInPath 
                        ? 'bg-cyan-500/20 border-cyan-500/50' 
                        : isSelected 
                          ? 'bg-blue-500/20 border-blue-500/50' 
                          : isExpanded
                            ? 'bg-purple-500/10 border-purple-500/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => handleEntityClick(node)}
                    onDoubleClick={() => toggleExpansion(node.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${isInPath ? 'ring-2 ring-cyan-400' : ''}`}
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
                      <div className="flex items-center gap-1">
                        {isExpanded && (
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            expanded
                          </Badge>
                        )}
                        <Badge className="bg-white/10 text-slate-400 text-xs">
                          {connections.length}
                        </Badge>
                      </div>
                    </div>

                    {/* Expanded connections preview */}
                    {isExpanded && connections.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                        {connections.slice(0, 3).map((conn, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between text-xs bg-white/5 rounded px-2 py-1"
                          >
                            <span className="text-slate-300 truncate">{conn.node.label}</span>
                            <Badge className="bg-white/10 text-slate-500 text-xs scale-75">
                              {conn.type || 'related'}
                            </Badge>
                          </div>
                        ))}
                        {connections.length > 3 && (
                          <p className="text-xs text-slate-500 text-center">+{connections.length - 3} more</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {filteredNodes.length > 25 && (
                <p className="text-xs text-slate-500 text-center py-2">
                  +{filteredNodes.length - 25} more entities
                </p>
              )}
            </div>

            {/* Selected Entity Details */}
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              {selectedEntities.size > 0 ? (
                <div className="space-y-4">
                  {selectedEntities.size === 1 ? (
                    // Single selection view
                    (() => {
                      const entityId = Array.from(selectedEntities)[0];
                      const selectedEntity = nodes.find(n => n.id === entityId);
                      if (!selectedEntity) return null;
                      
                      const connections = getConnections(entityId);
                      
                      return (
                        <>
                          <div className="flex items-start gap-3">
                            {React.createElement(NODE_CONFIG[selectedEntity.node_type]?.icon || Network, {
                              className: "w-6 h-6 mt-1",
                              style: { color: NODE_CONFIG[selectedEntity.node_type]?.color }
                            })}
                            <div className="flex-1">
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

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleExpansion(entityId)}
                              className={`h-8 px-3 text-xs ${expandedEntities.has(entityId) ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400'}`}
                            >
                              {expandedEntities.has(entityId) ? <Minus className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                              {expandedEntities.has(entityId) ? 'Collapse' : 'Expand'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => addInsightFilter(selectedEntity.label)}
                              className="h-8 px-3 text-xs bg-white/5 text-slate-400"
                            >
                              <Filter className="w-3 h-3 mr-1" />
                              Add Filter
                            </Button>
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
                              Connections ({connections.length})
                            </h4>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {connections.slice(0, 10).map((conn, idx) => {
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
                        </>
                      );
                    })()
                  ) : (
                    // Multiple selection view
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">{selectedEntities.size} entities selected</h3>
                        <Button size="sm" variant="ghost" onClick={clearSelection} className="h-7 px-2 text-slate-400">
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {selectedEntities.size === 2 && (
                        <Button
                          onClick={showPathBetweenSelected}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <Route className="w-4 h-4 mr-2" />
                          Find Path Between Selected
                        </Button>
                      )}

                      {highlightedPath.length > 0 && (
                        <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                          <h4 className="text-xs text-cyan-400 uppercase mb-2">Path Found ({highlightedPath.length} nodes)</h4>
                          <div className="flex flex-wrap items-center gap-1">
                            {highlightedPath.map((nodeId, idx) => {
                              const pathNode = nodes.find(n => n.id === nodeId);
                              return (
                                <React.Fragment key={nodeId}>
                                  <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                                    {pathNode?.label?.substring(0, 15)}
                                  </Badge>
                                  {idx < highlightedPath.length - 1 && (
                                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        {Array.from(selectedEntities).map(entityId => {
                          const entity = nodes.find(n => n.id === entityId);
                          if (!entity) return null;
                          const config = NODE_CONFIG[entity.node_type] || { color: '#64748b' };
                          return (
                            <div key={entityId} className="flex items-center justify-between p-2 bg-white/5 rounded text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                                <span className="text-white">{entity.label}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedEntities(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(entityId);
                                    return newSet;
                                  });
                                }}
                                className="h-5 w-5 p-0 text-slate-400 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Link
                    to={createPageUrl("KnowledgeGraph")}
                    className="flex items-center justify-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 pt-2 border-t border-white/10"
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
                    Double-click to expand connections
                  </p>
                  <p className="text-slate-500 text-xs">
                    Use multi-select to find paths
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Save className="w-5 h-5 text-cyan-400" />
              Save Explorer View
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="View name..."
              className="bg-white/5 border-white/10 text-white"
            />
            <div className="text-xs text-slate-500">
              Saves: {selectedEntities.size} selected, {expandedEntities.size} expanded, {highlightedPath.length > 0 ? 'path' : 'no path'}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSaveDialog(false)} className="text-slate-400">Cancel</Button>
            <Button onClick={saveCurrentView} className="bg-cyan-600 hover:bg-cyan-700">
              <Save className="w-4 h-4 mr-2" />Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}