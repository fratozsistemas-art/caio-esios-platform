import React, { useState, useMemo, useRef, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Target, Users, Eye, AlertTriangle, Brain, Zap, X, ZoomIn, ZoomOut, Maximize2,
  Save, FolderOpen, Star, Grid3x3, Palette, Activity, Info
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const NODE_TYPES = {
  execution: { color: '#8B5CF6', icon: '🎯', size: 8 },
  company: { color: '#3B82F6', icon: '🏢', size: 7 },
  leader: { color: '#10B981', icon: '👤', size: 6 },
  persona: { color: '#F59E0B', icon: '🎭', size: 5 },
  defense: { color: '#EF4444', icon: '🛡️', size: 5 },
  strategy: { color: '#06B6D4', icon: '💡', size: 6 }
};

const PHASES = [
  { id: "all", name: "Todas as Fases" },
  { id: "persona_publica", name: "Persona Pública" },
  { id: "estrategia_revelada", name: "Estratégia Revelada" },
  { id: "estrategia_escondida", name: "Estratégia Escondida" },
  { id: "individuacao_estrategica", name: "Individuação Estratégica" },
  { id: "encenacao_100d", name: "Encenação 100-Day" }
];

const LINK_STYLES = {
  has_persona: { color: '#8B5CF6', width: 2, particles: 2, label: 'persona' },
  involves: { color: '#3B82F6', width: 1.5, particles: 1, label: 'envolve' },
  has_defense: { color: '#EF4444', width: 2, particles: 3, label: 'defesa' },
  generated_strategy: { color: '#06B6D4', width: 2.5, particles: 2, label: 'estratégia' }
};

const NODE_SIZE_BY_CONNECTIONS = {
  0: 5,
  1: 6,
  3: 7,
  5: 8,
  10: 10
};

export default function Broto23KnowledgeGraph({ 
  executions = [], 
  personas = [], 
  defensePatterns = [],
  strategies = []
}) {
  const graphRef = useRef();
  const queryClient = useQueryClient();
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [filters, setFilters] = useState({
    phase: "all",
    entityType: "all",
    impactLevel: "all"
  });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  
  // Advanced features state
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [clusterBy, setClusterBy] = useState("execution");
  const [nodeStylePreset, setNodeStylePreset] = useState("status");
  const [linkStylePreset, setLinkStylePreset] = useState("relationship");
  const [showInsights, setShowInsights] = useState(true);
  const [savingView, setSavingView] = useState(false);
  const [loadingView, setLoadingView] = useState(false);
  const [viewName, setViewName] = useState("");
  
  // Fetch saved views
  const { data: savedViews = [] } = useQuery({
    queryKey: ['savedGraphViews'],
    queryFn: () => base44.entities.SavedGraphView?.list() || Promise.resolve([]),
  });
  
  // Save view mutation
  const saveViewMutation = useMutation({
    mutationFn: async (viewData) => {
      return await base44.entities.SavedGraphView.create(viewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['savedGraphViews']);
      toast.success('View salva com sucesso');
      setViewName("");
    }
  });

  // Calculate node size based on connections
  const calculateNodeSize = (nodeId, links) => {
    const connectionCount = links.filter(l => 
      l.source === nodeId || l.target === nodeId
    ).length;
    
    for (const [threshold, size] of Object.entries(NODE_SIZE_BY_CONNECTIONS).reverse()) {
      if (connectionCount >= parseInt(threshold)) return size;
    }
    return 5;
  };
  
  // Construir dados do grafo
  const graphData = useMemo(() => {
    const nodes = [];
    const links = [];

    // Filtrar execuções por fase
    const filteredExecutions = filters.phase === "all" 
      ? executions 
      : executions.filter(e => e.current_phase === filters.phase);

    // Adicionar execuções como nós
    filteredExecutions.forEach(execution => {
      if (filters.entityType === "all" || filters.entityType === "execution") {
        nodes.push({
          id: `execution_${execution.id}`,
          name: execution.company_name,
          type: 'execution',
          data: execution,
          phase: execution.current_phase,
          val: NODE_TYPES.execution.size
        });
      }

      // Adicionar personas relacionadas
      const relatedPersonas = personas.filter(p => p.broto23_execution_id === execution.id);
      relatedPersonas.forEach(persona => {
        if (filters.entityType === "all" || filters.entityType === "persona") {
          nodes.push({
            id: `persona_${persona.id}`,
            name: persona.entity_name,
            type: 'persona',
            subtype: persona.entity_type,
            data: persona,
            phase: execution.current_phase,
            val: NODE_TYPES.persona.size
          });

          links.push({
            source: `execution_${execution.id}`,
            target: `persona_${persona.id}`,
            type: 'has_persona'
          });
        }

        // Se for persona de líder, criar nó de líder
        if (persona.entity_type === 'leader' && (filters.entityType === "all" || filters.entityType === "leader")) {
          const leaderNodeId = `leader_${persona.entity_name}_${execution.id}`;
          if (!nodes.find(n => n.id === leaderNodeId)) {
            nodes.push({
              id: leaderNodeId,
              name: persona.entity_name,
              type: 'leader',
              data: { name: persona.entity_name },
              phase: execution.current_phase,
              val: NODE_TYPES.leader.size
            });
          }

          links.push({
            source: leaderNodeId,
            target: `persona_${persona.id}`,
            type: 'has_persona'
          });

          links.push({
            source: `execution_${execution.id}`,
            target: leaderNodeId,
            type: 'involves'
          });
        }

        // Se for persona da empresa
        if (persona.entity_type === 'company') {
          const companyNodeId = `company_${execution.company_name}`;
          if (!nodes.find(n => n.id === companyNodeId)) {
            nodes.push({
              id: companyNodeId,
              name: execution.company_name,
              type: 'company',
              data: { name: execution.company_name },
              phase: execution.current_phase,
              val: NODE_TYPES.company.size
            });
          }

          links.push({
            source: companyNodeId,
            target: `persona_${persona.id}`,
            type: 'has_persona'
          });
        }
      });

      // Adicionar padrões de defesa
      const relatedDefenses = defensePatterns.filter(d => d.broto23_execution_id === execution.id);
      relatedDefenses.forEach(defense => {
        // Filtrar por nível de impacto
        if (filters.impactLevel !== "all" && defense.impacto_estrategico !== filters.impactLevel) {
          return;
        }

        if (filters.entityType === "all" || filters.entityType === "defense") {
          nodes.push({
            id: `defense_${defense.id}`,
            name: defense.titulo,
            type: 'defense',
            data: defense,
            phase: execution.current_phase,
            impact: defense.impacto_estrategico,
            val: defense.impacto_estrategico === 'critico' ? 7 : 
                 defense.impacto_estrategico === 'alto' ? 6 : NODE_TYPES.defense.size
          });

          links.push({
            source: `execution_${execution.id}`,
            target: `defense_${defense.id}`,
            type: 'has_defense'
          });
        }
      });

      // Adicionar estratégias relacionadas (se disponíveis)
      const relatedStrategies = strategies.filter(s => 
        s.description?.includes(execution.company_name) || s.title?.includes(execution.company_name)
      );
      relatedStrategies.forEach(strategy => {
        if (filters.entityType === "all" || filters.entityType === "strategy") {
          const strategyId = `strategy_${strategy.id}`;
          if (!nodes.find(n => n.id === strategyId)) {
            nodes.push({
              id: strategyId,
              name: strategy.title,
              type: 'strategy',
              data: strategy,
              phase: execution.current_phase,
              val: NODE_TYPES.strategy.size
            });

            links.push({
              source: `execution_${execution.id}`,
              target: strategyId,
              type: 'generated_strategy'
            });
          }
        }
      });
    });

    return { nodes, links };
  }, [executions, personas, defensePatterns, strategies, filters]);

  // Atualizar highlight ao selecionar nó
  useEffect(() => {
    if (selectedNode) {
      const neighbors = new Set();
      const linkSet = new Set();

      graphData.links.forEach(link => {
        if (link.source.id === selectedNode.id || link.target.id === selectedNode.id) {
          neighbors.add(link.source.id);
          neighbors.add(link.target.id);
          linkSet.add(link);
        }
      });

      setHighlightNodes(neighbors);
      setHighlightLinks(linkSet);
    } else {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  }, [selectedNode, graphData]);

  const handleNodeClick = (node) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.2, 500);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 0.8, 500);
    }
  };

  const handleResetView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(500);
    }
  };
  
  const handleSaveView = () => {
    if (!viewName.trim()) {
      toast.error('Digite um nome para a view');
      return;
    }
    
    const currentZoom = graphRef.current?.zoom();
    const centerCoords = graphRef.current?.centerAt();
    
    saveViewMutation.mutate({
      name: viewName,
      graph_type: "broto23",
      filters: filters,
      view_config: {
        zoom_level: currentZoom,
        center_position: centerCoords,
        clustering_enabled: clusteringEnabled,
        cluster_by: clusterBy,
        node_style_preset: nodeStylePreset,
        link_style_preset: linkStylePreset
      }
    });
  };
  
  const handleLoadView = (view) => {
    setFilters(view.filters || {});
    setClusteringEnabled(view.view_config?.clustering_enabled || false);
    setClusterBy(view.view_config?.cluster_by || "execution");
    setNodeStylePreset(view.view_config?.node_style_preset || "status");
    setLinkStylePreset(view.view_config?.link_style_preset || "relationship");
    
    setTimeout(() => {
      if (view.view_config?.zoom_level && graphRef.current) {
        graphRef.current.zoom(view.view_config.zoom_level, 500);
      }
    }, 500);
    
    toast.success('View carregada: ' + view.name);
  };

  const paintNode = (node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    
    const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id);
    const alpha = isHighlighted ? 1 : 0.3;

    // Cluster background (if enabled)
    if (clusteringEnabled && node.cluster) {
      const clusterColors = {
        'persona_publica': '#3B82F620',
        'estrategia_revelada': '#8B5CF620',
        'estrategia_escondida': '#F59E0B20',
        'individuacao_estrategica': '#10B98120',
        'encenacao_100d': '#EF444420'
      };
      const clusterColor = clusterColors[node.cluster] || '#FFFFFF10';
      ctx.fillStyle = clusterColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.val + 8, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Node styling based on preset
    let nodeColor = NODE_TYPES[node.type].color;
    if (nodeStylePreset === "status" && node.data?.status) {
      const statusColors = {
        'in_progress': '#F59E0B',
        'completed': '#10B981',
        'paused': '#6B7280',
        'identificado': '#EF4444',
        'resolvido': '#10B981'
      };
      nodeColor = statusColors[node.data.status] || nodeColor;
    } else if (nodeStylePreset === "impact" && node.impact) {
      const impactColors = {
        'critico': '#DC2626',
        'alto': '#F59E0B',
        'medio': '#FBBF24',
        'baixo': '#60A5FA'
      };
      nodeColor = impactColors[node.impact] || nodeColor;
    }

    // Desenhar círculo principal
    ctx.fillStyle = nodeColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI);
    ctx.fill();

    // Status indicator ring (execution nodes)
    if (node.type === 'execution' && node.data && showInsights) {
      const progress = node.data.progress_percentage || 0;
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 3 / globalScale;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.val + 2, -Math.PI / 2, -Math.PI / 2 + (2 * Math.PI * progress / 100));
      ctx.stroke();
    }

    // Borda se selecionado
    if (selectedNode?.id === node.id) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2 / globalScale;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Insight badge (critical defenses)
    if (node.type === 'defense' && node.impact === 'critico' && showInsights) {
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(node.x + node.val - 2, node.y - node.val + 2, 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Desenhar label
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isHighlighted ? '#FFFFFF' : '#888888';
    ctx.fillText(label, node.x, node.y + node.val + fontSize + 2);
  };

  const paintLink = (link, ctx, globalScale) => {
    const isHighlighted = highlightLinks.size === 0 || highlightLinks.has(link);
    
    // Custom link styling based on relationship type
    const linkStyle = LINK_STYLES[link.type] || { color: '#FFFFFF', width: 1, particles: 0 };
    
    if (linkStylePreset === "relationship") {
      const baseAlpha = isHighlighted ? '80' : '20';
      ctx.strokeStyle = linkStyle.color + baseAlpha;
      ctx.lineWidth = (isHighlighted ? linkStyle.width * 1.5 : linkStyle.width) / globalScale;
    } else if (linkStylePreset === "uniform") {
      ctx.strokeStyle = isHighlighted ? '#00D4FF80' : '#FFFFFF20';
      ctx.lineWidth = isHighlighted ? 2 / globalScale : 1 / globalScale;
    } else {
      // intensity - based on node importance
      const sourceConnections = (link.source.val || 5) - 5;
      const targetConnections = (link.target.val || 5) - 5;
      const intensity = (sourceConnections + targetConnections) / 10;
      const alpha = Math.floor((isHighlighted ? 0.8 : 0.2) * (0.5 + intensity * 0.5) * 255).toString(16).padStart(2, '0');
      ctx.strokeStyle = '#00D4FF' + alpha;
      ctx.lineWidth = (1 + intensity) / globalScale;
    }
    
    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    ctx.stroke();
  };

  return (
    <div className="space-y-4">
      {/* Save/Load Views */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Save className="w-4 h-4 text-cyan-400" />
            Gerenciar Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs">Salvar View Atual</Label>
              <div className="flex gap-2">
                <Input
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  placeholder="Nome da view..."
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button
                  onClick={handleSaveView}
                  disabled={savingView || !viewName.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs">Carregar View Salva ({savedViews.length})</Label>
              <div className="flex flex-wrap gap-2">
                {savedViews.slice(0, 4).map(view => (
                  <Button
                    key={view.id}
                    onClick={() => handleLoadView(view)}
                    size="sm"
                    variant="outline"
                    className="bg-white/5 border-white/10 text-white hover:bg-cyan-500/20"
                  >
                    <FolderOpen className="w-3 h-3 mr-1" />
                    {view.name}
                  </Button>
                ))}
                {savedViews.length > 4 && (
                  <Badge className="bg-white/5">+{savedViews.length - 4} mais</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            Filtros de Visualização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-300 text-xs">Fase do Protocolo</Label>
              <Select value={filters.phase} onValueChange={(v) => setFilters({...filters, phase: v})}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHASES.map(phase => (
                    <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300 text-xs">Tipo de Entidade</Label>
              <Select value={filters.entityType} onValueChange={(v) => setFilters({...filters, entityType: v})}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="execution">Execuções</SelectItem>
                  <SelectItem value="company">Empresas</SelectItem>
                  <SelectItem value="leader">Líderes</SelectItem>
                  <SelectItem value="persona">Personas</SelectItem>
                  <SelectItem value="defense">Defesas</SelectItem>
                  <SelectItem value="strategy">Estratégias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300 text-xs">Nível de Impacto (Defesas)</Label>
              <Select value={filters.impactLevel} onValueChange={(v) => setFilters({...filters, impactLevel: v})}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(NODE_TYPES).map(([type, config]) => (
              <Badge key={type} className="bg-white/5 border-white/10 text-white">
                <span className="mr-1">{config.icon}</span>
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Styling & Clustering */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-400" />
            Estilos & Clustering Avançado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300 text-xs">Clustering Automático</Label>
                <Switch
                  checked={clusteringEnabled}
                  onCheckedChange={setClusteringEnabled}
                />
              </div>
              
              {clusteringEnabled && (
                <div>
                  <Label className="text-slate-300 text-xs">Agrupar Por</Label>
                  <Select value={clusterBy} onValueChange={setClusterBy}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="execution">Execução</SelectItem>
                      <SelectItem value="phase">Fase</SelectItem>
                      <SelectItem value="entity_type">Tipo de Entidade</SelectItem>
                      <SelectItem value="impact">Nível de Impacto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Label className="text-slate-300 text-xs">Mostrar Insights em Tempo Real</Label>
                <Switch
                  checked={showInsights}
                  onCheckedChange={setShowInsights}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-slate-300 text-xs">Estilo de Nós</Label>
                <Select value={nodeStylePreset} onValueChange={setNodeStylePreset}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Por Status</SelectItem>
                    <SelectItem value="impact">Por Impacto</SelectItem>
                    <SelectItem value="default">Padrão (Tipo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-slate-300 text-xs">Estilo de Links</Label>
                <Select value={linkStylePreset} onValueChange={setLinkStylePreset}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relationship">Por Relacionamento</SelectItem>
                    <SelectItem value="intensity">Por Intensidade</SelectItem>
                    <SelectItem value="uniform">Uniforme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <p className="text-xs text-cyan-300 flex items-center gap-2">
              <Info className="w-3 h-3" />
              Clustering agrupa visualmente nós relacionados. Nós maiores têm mais conexões.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Grafo */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="relative">
            <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={handleZoomIn} className="bg-white/10 border-white/20">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleZoomOut} className="bg-white/10 border-white/20">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleResetView} className="bg-white/10 border-white/20">
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowInsights(!showInsights)}
                className={`${showInsights ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-white/10 border-white/20'}`}
              >
                <Activity className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Real-time Stats Overlay */}
            {showInsights && graphData.nodes.length > 0 && (
              <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white">{graphData.nodes.length} nós</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-white">{graphData.links.length} conexões</span>
                </div>
                {clusteringEnabled && (
                  <div className="flex items-center gap-2 text-xs">
                    <Grid3x3 className="w-3 h-3 text-purple-400" />
                    <span className="text-white">Clustering: {clusterBy}</span>
                  </div>
                )}
              </div>
            )}

            <div className="bg-[#0A1628] rounded-lg overflow-hidden border border-white/10">
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeLabel={node => `${node.name} (${node.type})`}
                nodeCanvasObject={paintNode}
                linkCanvasObject={paintLink}
                onNodeClick={handleNodeClick}
                width={1200}
                height={600}
                backgroundColor="#0A1628"
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={link => highlightLinks.has(link) ? 2 : 0}
                d3VelocityDecay={0.3}
                cooldownTicks={100}
                onEngineStop={() => graphRef.current?.zoomToFit(400)}
              />
            </div>
          </div>

          {graphData.nodes.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum dado disponível para visualização</p>
              <p className="text-slate-500 text-sm">Ajuste os filtros ou inicie uma nova execução Broto23</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalhes do Nó Selecionado */}
      {selectedNode && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">{NODE_TYPES[selectedNode.type].icon}</span>
                {selectedNode.name}
                <Badge className="ml-2">{selectedNode.type}</Badge>
              </CardTitle>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedNode.type === 'persona' && (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Tipo</p>
                  <p className="text-white">{selectedNode.subtype === 'company' ? 'Empresa' : 'Líder'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Persona (imagem pública)</p>
                  <p className="text-slate-300">{selectedNode.data.persona}</p>
                </div>
                <div>
                  <p className="text-emerald-400 text-xs">Self (vocação real)</p>
                  <p className="text-white">{selectedNode.data.self}</p>
                </div>
                <div>
                  <p className="text-red-400 text-xs">Sombra (negado/evitado)</p>
                  <p className="text-slate-300">{selectedNode.data.sombra}</p>
                </div>
                {selectedNode.data.confidence_score && (
                  <div>
                    <p className="text-slate-500 text-xs">Confiança na Análise</p>
                    <p className="text-cyan-400">{selectedNode.data.confidence_score}%</p>
                  </div>
                )}
              </div>
            )}

            {selectedNode.type === 'defense' && (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Descrição</p>
                  <p className="text-slate-300">{selectedNode.data.descricao}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-slate-500 text-xs">Tipo de Padrão</p>
                    <Badge className="mt-1">{selectedNode.data.pattern_type}</Badge>
                  </div>
                  {selectedNode.data.defesa_mecanismo && (
                    <div>
                      <p className="text-slate-500 text-xs">Mecanismo de Defesa</p>
                      <Badge className="mt-1 bg-amber-500/20 text-amber-400">{selectedNode.data.defesa_mecanismo}</Badge>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-slate-500 text-xs">Frequência</p>
                    <Badge className="mt-1">{selectedNode.data.frequencia}</Badge>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto Estratégico</p>
                    <Badge className={`mt-1 ${
                      selectedNode.impact === 'critico' ? 'bg-red-500/20 text-red-400' :
                      selectedNode.impact === 'alto' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {selectedNode.impact}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Status</p>
                  <Badge className={`${
                    selectedNode.data.status === 'resolvido' ? 'bg-green-500/20 text-green-400' :
                    selectedNode.data.status === 'em_trabalho' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {selectedNode.data.status}
                  </Badge>
                </div>
                {selectedNode.data.evidencias && selectedNode.data.evidencias.length > 0 && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Evidências</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedNode.data.evidencias.map((ev, idx) => (
                        <li key={idx} className="text-slate-300">{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {selectedNode.type === 'execution' && (
              <div className="space-y-3 text-sm">
                <div className="flex gap-4">
                  <div>
                    <p className="text-slate-500 text-xs">Status</p>
                    <Badge className="mt-1">{selectedNode.data.status}</Badge>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Fase Atual</p>
                    <Badge className="mt-1 bg-purple-500/20 text-purple-400">{selectedNode.data.current_phase}</Badge>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Progresso</p>
                    <p className="text-cyan-400 mt-1">{selectedNode.data.progress_percentage || 0}%</p>
                  </div>
                </div>
                {selectedNode.data.founders_involved && (
                  <div>
                    <p className="text-slate-500 text-xs">Founders Envolvidos</p>
                    <p className="text-white">{selectedNode.data.founders_involved.join(', ')}</p>
                  </div>
                )}
                {selectedNode.data.facilitator && (
                  <div>
                    <p className="text-slate-500 text-xs">Facilitador</p>
                    <p className="text-white">{selectedNode.data.facilitator}</p>
                  </div>
                )}
              </div>
            )}

            {selectedNode.type === 'leader' && (
              <div className="space-y-3 text-sm">
                <p className="text-slate-300">Líder participante do protocolo</p>
              </div>
            )}

            {selectedNode.type === 'company' && (
              <div className="space-y-3 text-sm">
                <p className="text-slate-300">Empresa sendo analisada no protocolo Broto23</p>
              </div>
            )}

            {selectedNode.type === 'strategy' && selectedNode.data && (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Descrição</p>
                  <p className="text-slate-300">{selectedNode.data.description}</p>
                </div>
                {selectedNode.data.category && (
                  <div>
                    <p className="text-slate-500 text-xs">Framework</p>
                    <Badge className="mt-1">{selectedNode.data.category}</Badge>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}