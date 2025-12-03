import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, GitBranch, ArrowRight, ArrowDown, ChevronRight,
  Shield, Target, Layers, Network, Eye, EyeOff,
  ZoomIn, ZoomOut, Maximize2, Filter, Box, FileCode,
  Workflow, Building2, AlertTriangle, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ORGANIZATIONAL BLUEPRINT VISUALIZER
 * 
 * Visualiza estrutura organizacional, dependências e linhas de reporte
 * baseado nos outputs do NIA Blueprint (architecture_layers + governance_structure)
 */

const LAYER_COLORS = {
  governance: { bg: "bg-amber-500/20", border: "border-amber-500/50", text: "text-amber-400", icon: Shield },
  capability: { bg: "bg-blue-500/20", border: "border-blue-500/50", text: "text-blue-400", icon: Target },
  process: { bg: "bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-400", icon: Workflow },
  technology: { bg: "bg-cyan-500/20", border: "border-cyan-500/50", text: "text-cyan-400", icon: FileCode },
  data: { bg: "bg-green-500/20", border: "border-green-500/50", text: "text-green-400", icon: Box },
  integration: { bg: "bg-pink-500/20", border: "border-pink-500/50", text: "text-pink-400", icon: Network },
  organizational: { bg: "bg-orange-500/20", border: "border-orange-500/50", text: "text-orange-400", icon: Building2 }
};

const MATURITY_COLORS = {
  basic: "bg-red-500/20 text-red-400",
  intermediate: "bg-yellow-500/20 text-yellow-400",
  advanced: "bg-green-500/20 text-green-400"
};

export default function OrganizationalBlueprintVisualizer({ blueprint }) {
  const [activeView, setActiveView] = useState("layers");
  const [selectedLayer, setSelectedLayer] = useState("all");
  const [selectedNode, setSelectedNode] = useState(null);
  const [showDependencies, setShowDependencies] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Extract data from blueprint
  const architectureLayers = blueprint?.architecture_layers || [];
  const governanceStructure = blueprint?.governance_structure || {};
  const implementationPhases = blueprint?.implementation_phases || [];

  // Build component nodes for visualization
  const allComponents = useMemo(() => {
    const components = [];
    architectureLayers.forEach((layer, layerIdx) => {
      layer.components?.forEach((comp, compIdx) => {
        components.push({
          ...comp,
          layer_name: layer.layer_name,
          layer_type: layer.layer_type,
          layer_index: layerIdx,
          unique_id: `${layer.layer_type}-${comp.component_id || compIdx}`
        });
      });
    });
    return components;
  }, [architectureLayers]);

  // Build interfaces/dependencies map
  const allInterfaces = useMemo(() => {
    const interfaces = [];
    architectureLayers.forEach((layer) => {
      layer.interfaces?.forEach((iface) => {
        interfaces.push({
          ...iface,
          layer_name: layer.layer_name,
          layer_type: layer.layer_type
        });
      });
    });
    return interfaces;
  }, [architectureLayers]);

  // Filter components by selected layer
  const filteredComponents = useMemo(() => {
    if (selectedLayer === "all") return allComponents;
    return allComponents.filter(c => c.layer_type === selectedLayer);
  }, [allComponents, selectedLayer]);

  const getLayerStyle = (layerType) => {
    return LAYER_COLORS[layerType] || LAYER_COLORS.capability;
  };

  const LayerIcon = ({ layerType, className }) => {
    const style = getLayerStyle(layerType);
    const Icon = style.icon;
    return <Icon className={className} />;
  };

  if (!blueprint) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <Layers className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Nenhum Blueprint Disponível</h3>
          <p className="text-sm text-slate-400">
            Gere um blueprint arquitetural no NIA para visualizar a estrutura organizacional.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Network className="w-5 h-5 text-indigo-400" />
            Visualizador de Blueprint Organizacional
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDependencies(!showDependencies)}
              className={`text-xs ${showDependencies ? 'text-indigo-400' : 'text-slate-400'}`}
            >
              {showDependencies ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
              Dependências
            </Button>
            <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>
                <ZoomOut className="w-3 h-3 text-slate-400" />
              </Button>
              <span className="text-xs text-slate-400 w-10 text-center">{zoomLevel}%</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}>
                <ZoomIn className="w-3 h-3 text-slate-400" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Navigation Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="layers" className="data-[state=active]:bg-indigo-500/20">
              <Layers className="w-4 h-4 mr-2" />
              Camadas
            </TabsTrigger>
            <TabsTrigger value="hierarchy" className="data-[state=active]:bg-purple-500/20">
              <GitBranch className="w-4 h-4 mr-2" />
              Hierarquia
            </TabsTrigger>
            <TabsTrigger value="governance" className="data-[state=active]:bg-amber-500/20">
              <Shield className="w-4 h-4 mr-2" />
              Governança
            </TabsTrigger>
            <TabsTrigger value="dependencies" className="data-[state=active]:bg-cyan-500/20">
              <Network className="w-4 h-4 mr-2" />
              Dependências
            </TabsTrigger>
          </TabsList>

          {/* LAYERS VIEW */}
          <TabsContent value="layers" className="mt-4">
            <div className="space-y-4">
              {/* Layer Filter */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                    <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Filtrar por camada" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Camadas</SelectItem>
                      {architectureLayers.map((layer, idx) => (
                        <SelectItem key={idx} value={layer.layer_type}>
                          {layer.layer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Badge className="bg-white/10 text-slate-300">
                  {filteredComponents.length} componentes
                </Badge>
              </div>

              {/* Layers Visualization */}
              <div 
                className="space-y-4 transition-transform"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
              >
                {architectureLayers
                  .filter(layer => selectedLayer === "all" || layer.layer_type === selectedLayer)
                  .map((layer, layerIdx) => {
                    const style = getLayerStyle(layer.layer_type);
                    return (
                      <motion.div
                        key={layerIdx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: layerIdx * 0.1 }}
                        className={`p-4 rounded-lg border ${style.bg} ${style.border}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <LayerIcon layerType={layer.layer_type} className={`w-5 h-5 ${style.text}`} />
                            <h4 className="text-white font-semibold">{layer.layer_name}</h4>
                            <Badge className={`${style.bg} ${style.text} text-xs`}>
                              {layer.layer_type}
                            </Badge>
                          </div>
                          <span className="text-xs text-slate-400">
                            {layer.components?.length || 0} componentes
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-400 mb-3">{layer.purpose}</p>

                        {/* Components Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {layer.components?.map((comp, compIdx) => (
                            <motion.div
                              key={compIdx}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => setSelectedNode(comp)}
                              className={`p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:border-white/30 transition-all ${
                                selectedNode?.component_id === comp.component_id ? 'ring-2 ring-indigo-500' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-slate-700 text-slate-300 text-[10px]">
                                  {comp.component_id}
                                </Badge>
                              </div>
                              <p className="text-sm text-white font-medium truncate">{comp.name}</p>
                              <p className="text-xs text-slate-400 truncate">{comp.owner_profile}</p>
                              <Badge className={`mt-2 text-[10px] ${MATURITY_COLORS[comp.maturity_required] || 'bg-slate-500/20 text-slate-400'}`}>
                                {comp.maturity_required}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>

                        {/* Interfaces */}
                        {showDependencies && layer.interfaces?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-xs text-slate-400 mb-2">Interfaces:</p>
                            <div className="flex flex-wrap gap-2">
                              {layer.interfaces.map((iface, ifaceIdx) => (
                                <div key={ifaceIdx} className="flex items-center gap-1 text-xs bg-white/5 rounded px-2 py-1">
                                  <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">{iface.from}</Badge>
                                  <ArrowRight className="w-3 h-3 text-slate-400" />
                                  <Badge className="bg-green-500/20 text-green-400 text-[10px]">{iface.to}</Badge>
                                  <span className="text-slate-500">({iface.interface_type})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </TabsContent>

          {/* HIERARCHY VIEW */}
          <TabsContent value="hierarchy" className="mt-4">
            <HierarchyDiagram 
              layers={architectureLayers} 
              governance={governanceStructure}
              onNodeClick={setSelectedNode}
              selectedNode={selectedNode}
            />
          </TabsContent>

          {/* GOVERNANCE VIEW */}
          <TabsContent value="governance" className="mt-4">
            <GovernanceStructureView 
              governance={governanceStructure}
              onNodeClick={setSelectedNode}
              selectedNode={selectedNode}
            />
          </TabsContent>

          {/* DEPENDENCIES VIEW */}
          <TabsContent value="dependencies" className="mt-4">
            <DependencyMatrix 
              components={allComponents}
              interfaces={allInterfaces}
              onNodeClick={setSelectedNode}
              selectedNode={selectedNode}
            />
          </TabsContent>
        </Tabs>

        {/* Selected Node Detail Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-indigo-500/20 text-indigo-400">
                          {selectedNode.component_id || selectedNode.decision_type || 'Detalhe'}
                        </Badge>
                        <h4 className="text-white font-semibold">
                          {selectedNode.name || selectedNode.decision_maker || 'Selecionado'}
                        </h4>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">
                        {selectedNode.description || selectedNode.process || '-'}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {selectedNode.owner_profile && (
                          <div className="p-2 bg-white/5 rounded">
                            <p className="text-xs text-slate-400">Owner</p>
                            <p className="text-sm text-white">{selectedNode.owner_profile}</p>
                          </div>
                        )}
                        {selectedNode.maturity_required && (
                          <div className="p-2 bg-white/5 rounded">
                            <p className="text-xs text-slate-400">Maturidade</p>
                            <Badge className={MATURITY_COLORS[selectedNode.maturity_required]}>
                              {selectedNode.maturity_required}
                            </Badge>
                          </div>
                        )}
                        {selectedNode.dependencies?.length > 0 && (
                          <div className="p-2 bg-white/5 rounded col-span-2">
                            <p className="text-xs text-slate-400 mb-1">Dependências</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedNode.dependencies.map((dep, i) => (
                                <Badge key={i} className="bg-cyan-500/20 text-cyan-400 text-xs">{dep}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedNode(null)}
                      className="text-slate-400"
                    >
                      ✕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// HIERARCHY DIAGRAM COMPONENT
function HierarchyDiagram({ layers, governance, onNodeClick, selectedNode }) {
  const escalationPath = governance?.escalation_path || [];
  
  return (
    <div className="space-y-4">
      {/* Escalation Path Hierarchy */}
      {escalationPath.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Caminho de Escalação
            </h4>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {escalationPath.map((level, idx) => (
                <React.Fragment key={idx}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => onNodeClick({ name: level, type: 'escalation', level: idx + 1 })}
                    className={`px-4 py-3 rounded-lg bg-white/10 border border-white/20 cursor-pointer hover:border-amber-500/50 transition-all ${
                      selectedNode?.name === level ? 'ring-2 ring-amber-500' : ''
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-1">
                        <span className="text-amber-400 font-bold text-sm">{idx + 1}</span>
                      </div>
                      <p className="text-sm text-white font-medium">{level}</p>
                    </div>
                  </motion.div>
                  {idx < escalationPath.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-amber-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layer Hierarchy */}
      <div className="relative">
        {layers.map((layer, layerIdx) => {
          const style = LAYER_COLORS[layer.layer_type] || LAYER_COLORS.capability;
          return (
            <div key={layerIdx} className="relative mb-4">
              {layerIdx > 0 && (
                <div className="absolute left-1/2 -top-4 transform -translate-x-1/2">
                  <ArrowDown className="w-4 h-4 text-slate-500" />
                </div>
              )}
              <div className={`p-4 rounded-lg border ${style.bg} ${style.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${style.bg}`}>
                      <span className={`font-bold text-sm ${style.text}`}>L{layerIdx + 1}</span>
                    </div>
                    <h5 className="text-white font-medium">{layer.layer_name}</h5>
                  </div>
                  <Badge className={`${style.bg} ${style.text} text-xs`}>{layer.layer_type}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {layer.components?.map((comp, compIdx) => (
                    <motion.div
                      key={compIdx}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onNodeClick(comp)}
                      className={`px-3 py-2 bg-white/10 rounded border border-white/10 cursor-pointer hover:border-white/30 ${
                        selectedNode?.component_id === comp.component_id ? 'ring-1 ring-indigo-500' : ''
                      }`}
                    >
                      <p className="text-xs text-white">{comp.name}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// GOVERNANCE STRUCTURE VIEW
function GovernanceStructureView({ governance, onNodeClick, selectedNode }) {
  const decisionRights = governance?.decision_rights || [];
  const kpis = governance?.kpis || [];
  const reviewCadence = governance?.review_cadence;

  return (
    <div className="space-y-4">
      {/* Decision Rights Matrix */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            Matriz de Direitos de Decisão (RACI)
          </h4>
          
          {decisionRights.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-2 text-slate-400 font-medium">Tipo de Decisão</th>
                    <th className="text-center p-2 text-green-400 font-medium">Responsável</th>
                    <th className="text-center p-2 text-blue-400 font-medium">Consultado</th>
                    <th className="text-center p-2 text-slate-400 font-medium">Informado</th>
                  </tr>
                </thead>
                <tbody>
                  {decisionRights.map((dr, idx) => (
                    <motion.tr 
                      key={idx} 
                      className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${
                        selectedNode?.decision_type === dr.decision_type ? 'bg-indigo-500/10' : ''
                      }`}
                      onClick={() => onNodeClick(dr)}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <td className="p-2 text-white">{dr.decision_type}</td>
                      <td className="p-2 text-center">
                        <Badge className="bg-green-500/20 text-green-400">{dr.decision_maker}</Badge>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {dr.consulted?.map((c, i) => (
                            <Badge key={i} className="bg-blue-500/20 text-blue-400 text-xs">{c}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {dr.informed?.map((inf, i) => (
                            <Badge key={i} className="bg-slate-500/20 text-slate-400 text-xs">{inf}</Badge>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">
              Nenhum direito de decisão definido no blueprint.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Review Cadence & KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviewCadence && (
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Cadência de Revisão</h4>
              <p className="text-lg text-white font-medium capitalize">{reviewCadence}</p>
            </CardContent>
          </Card>
        )}

        {kpis.length > 0 && (
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold text-green-400 mb-2">KPIs de Governança</h4>
              <div className="space-y-2">
                {kpis.slice(0, 3).map((kpi, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-xs text-white">{kpi.kpi}</span>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">{kpi.target}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// DEPENDENCY MATRIX VIEW
function DependencyMatrix({ components, interfaces, onNodeClick, selectedNode }) {
  const dependencyGroups = useMemo(() => {
    const groups = {};
    components.forEach(comp => {
      if (!groups[comp.layer_type]) {
        groups[comp.layer_type] = [];
      }
      groups[comp.layer_type].push(comp);
    });
    return groups;
  }, [components]);

  return (
    <div className="space-y-4">
      {/* Interface Flow Diagram */}
      <Card className="bg-cyan-500/10 border-cyan-500/30">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <Network className="w-4 h-4" />
            Fluxo de Interfaces ({interfaces.length})
          </h4>
          
          {interfaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {interfaces.map((iface, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-500/20 text-blue-400">{iface.from}</Badge>
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                    <Badge className="bg-green-500/20 text-green-400">{iface.to}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={`text-xs ${
                      iface.interface_type === 'data' ? 'bg-purple-500/20 text-purple-400' :
                      iface.interface_type === 'control' ? 'bg-red-500/20 text-red-400' :
                      iface.interface_type === 'event' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {iface.interface_type}
                    </Badge>
                    <span className="text-xs text-slate-400">{iface.description}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">
              Nenhuma interface definida no blueprint.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dependencies by Layer */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-white mb-4">Dependências por Componente</h4>
          <div className="space-y-3">
            {components.filter(c => c.dependencies?.length > 0).map((comp, idx) => (
              <motion.div
                key={idx}
                onClick={() => onNodeClick(comp)}
                className={`p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:border-indigo-500/30 ${
                  selectedNode?.component_id === comp.component_id ? 'ring-1 ring-indigo-500' : ''
                }`}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">{comp.component_id}</Badge>
                    <span className="text-sm text-white font-medium">{comp.name}</span>
                  </div>
                  <Badge className={`text-xs ${LAYER_COLORS[comp.layer_type]?.bg || 'bg-slate-500/20'} ${LAYER_COLORS[comp.layer_type]?.text || 'text-slate-400'}`}>
                    {comp.layer_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Depende de:</span>
                  <div className="flex flex-wrap gap-1">
                    {comp.dependencies.map((dep, i) => (
                      <Badge key={i} className="bg-orange-500/20 text-orange-400 text-xs">{dep}</Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
            {components.filter(c => c.dependencies?.length > 0).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                Nenhuma dependência explícita definida nos componentes.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}