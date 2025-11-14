import { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, ZoomOut, Maximize2, RefreshCw, 
  Shapes, Building2, X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CVMGraphVisualization({ graphData, onNodeClick, onClose }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [layout, setLayout] = useState('forceAtlas2Based');
  const [colorBy, setColorBy] = useState('sector');
  const [selectedNode, setSelectedNode] = useState(null);

  const layouts = {
    forceAtlas2Based: {
      name: 'Force Directed',
      physics: {
        enabled: true,
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08,
          avoidOverlap: 0.5
        },
        stabilization: { iterations: 100 }
      }
    },
    hierarchical: {
      name: 'Hierarchical',
      layout: {
        hierarchical: {
          direction: 'UD',
          sortMethod: 'directed',
          nodeSpacing: 150
        }
      },
      physics: { enabled: false }
    },
    circular: {
      name: 'Circular',
      physics: { enabled: false },
      layout: {
        randomSeed: 42
      }
    }
  };

  const getSectorColor = (sector) => {
    const colors = {
      'Financeiro': '#3b82f6',
      'Energia': '#10b981',
      'Telecomunicações': '#8b5cf6',
      'Varejo': '#f59e0b',
      'Saúde': '#ef4444',
      'Tecnologia': '#06b6d4',
      'Construção': '#84cc16',
      'default': '#64748b'
    };
    return colors[sector] || colors.default;
  };

  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    // Process nodes
    const nodes = graphData.nodes.map(node => {
      const props = node.properties || {};
      const sector = props.sector || 'Unknown';
      
      return {
        id: node.id,
        label: props.name || 'Unknown',
        title: `${props.name}\n${sector}\nConnections: ${props.connections || 0}`,
        color: {
          background: getSectorColor(sector),
          border: getSectorColor(sector),
          highlight: {
            background: '#fbbf24',
            border: '#f59e0b'
          }
        },
        size: 20 + (props.connections || 0) * 2,
        font: { color: '#ffffff', size: 12 },
        sector,
        properties: props
      };
    });

    // Process edges
    const edges = graphData.edges.map(edge => ({
      from: edge.source,
      to: edge.target,
      label: edge.type || '',
      arrows: 'to',
      color: { color: '#64748b', highlight: '#3b82f6' },
      width: 1,
      smooth: { type: 'curvedCW', roundness: 0.2 }
    }));

    const data = { nodes, edges };

    const options = {
      ...layouts[layout],
      nodes: {
        shape: 'dot',
        scaling: {
          min: 10,
          max: 30
        },
        font: {
          size: 12,
          face: 'Inter, system-ui, sans-serif'
        }
      },
      edges: {
        width: 1,
        smooth: {
          type: 'continuous'
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true
      }
    };

    networkRef.current = new Network(containerRef.current, data, options);

    // Event listeners
    networkRef.current.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodes.find(n => n.id === nodeId);
        setSelectedNode(node);
        if (onNodeClick) onNodeClick(node);
      }
    });

    networkRef.current.on('stabilizationIterationsDone', () => {
      networkRef.current.setOptions({ physics: false });
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [graphData, layout]);

  const handleZoomIn = () => {
    networkRef.current?.moveTo({ scale: networkRef.current.getScale() * 1.2 });
  };

  const handleZoomOut = () => {
    networkRef.current?.moveTo({ scale: networkRef.current.getScale() * 0.8 });
  };

  const handleFit = () => {
    networkRef.current?.fit({ animation: { duration: 500 } });
  };

  const handleReset = () => {
    networkRef.current?.stabilize();
  };

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        <Card className="bg-slate-900 border-white/10 flex-1 flex flex-col">
          <CardHeader className="flex-shrink-0 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-xl">CVM Network Graph</CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  {graphData?.nodes?.length || 0} companies, {graphData?.edges?.length || 0} relationships
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex gap-4 p-4 min-h-0">
            {/* Controls Sidebar */}
            <div className="w-64 flex-shrink-0 space-y-4 overflow-y-auto">
              {/* Layout Controls */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Shapes className="w-4 h-4" />
                  Layout
                </h3>
                <Select value={layout} onValueChange={handleLayoutChange}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forceAtlas2Based">Force Directed</SelectItem>
                    <SelectItem value="hierarchical">Hierarchical</SelectItem>
                    <SelectItem value="circular">Circular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Controls */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3">View Controls</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    <ZoomIn className="w-4 h-4 mr-1" />
                    Zoom In
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    <ZoomOut className="w-4 h-4 mr-1" />
                    Zoom Out
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFit}
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    <Maximize2 className="w-4 h-4 mr-1" />
                    Fit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Legend */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3">Sectors</h3>
                <div className="space-y-2">
                  {['Financeiro', 'Energia', 'Telecomunicações', 'Varejo', 'Saúde', 'Tecnologia', 'Construção'].map(sector => (
                    <div key={sector} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getSectorColor(sector) }}
                      />
                      <span className="text-xs text-slate-300">{sector}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Node Info */}
              {selectedNode && (
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {selectedNode.label}
                  </h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sector</span>
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                        {selectedNode.sector}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Connections</span>
                      <span className="text-white">{selectedNode.properties?.connections || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Graph Container */}
            <div className="flex-1 bg-slate-950 rounded-lg border border-white/10 relative overflow-hidden">
              <div
                ref={containerRef}
                className="w-full h-full"
                style={{ background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)' }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}