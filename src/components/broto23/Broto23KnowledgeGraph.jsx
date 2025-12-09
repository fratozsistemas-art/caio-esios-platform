import React, { useState, useMemo, useRef, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Target, Users, Eye, AlertTriangle, Brain, Zap, X, ZoomIn, ZoomOut, Maximize2
} from "lucide-react";

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

export default function Broto23KnowledgeGraph({ 
  executions = [], 
  personas = [], 
  defensePatterns = [],
  strategies = []
}) {
  const graphRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [filters, setFilters] = useState({
    phase: "all",
    entityType: "all",
    impactLevel: "all"
  });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

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

  const paintNode = (node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    
    const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id);
    const alpha = isHighlighted ? 1 : 0.3;

    // Desenhar círculo
    ctx.fillStyle = NODE_TYPES[node.type].color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI);
    ctx.fill();

    // Borda se selecionado
    if (selectedNode?.id === node.id) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    // Desenhar label
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isHighlighted ? '#FFFFFF' : '#888888';
    ctx.fillText(label, node.x, node.y + node.val + fontSize + 2);
  };

  const paintLink = (link, ctx, globalScale) => {
    const isHighlighted = highlightLinks.size === 0 || highlightLinks.has(link);
    ctx.strokeStyle = isHighlighted ? '#00D4FF80' : '#FFFFFF20';
    ctx.lineWidth = isHighlighted ? 2 / globalScale : 1 / globalScale;
    
    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    ctx.stroke();
  };

  return (
    <div className="space-y-4">
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

      {/* Grafo */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button size="sm" variant="outline" onClick={handleZoomIn} className="bg-white/10 border-white/20">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleZoomOut} className="bg-white/10 border-white/20">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleResetView} className="bg-white/10 border-white/20">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>

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