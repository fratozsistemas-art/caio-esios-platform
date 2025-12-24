import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell, ReferenceLine } from "recharts";
import { Download, BarChart3 } from "lucide-react";
import { CheckCircleIcon } from "../utils/icons";

export default function OpportunityMatrixChart({ 
  opportunities, 
  onSelect,
  selectedIds = [],
  title = "Opportunity Portfolio Matrix",
  exportable = true 
}) {
  const [hoveredOpp, setHoveredOpp] = useState(null);

  const exportChart = () => {
    const svg = document.querySelector('#opportunity-matrix-chart svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opportunity-matrix-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const roi = (data.impact / data.effort).toFixed(2);
      
      return (
        <Card className="bg-slate-900 border-amber-500/30 p-3 max-w-xs">
          <p className="text-white font-semibold mb-2">{data.name}</p>
          <p className="text-xs text-slate-300 mb-2">{data.description}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Impact:</span>
              <span className="text-green-400 font-semibold">{data.impact}/10</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Effort:</span>
              <span className="text-amber-400 font-semibold">{data.effort}/10</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">ROI:</span>
              <span className="text-cyan-400 font-semibold">{roi}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Revenue:</span>
              <span className="text-white font-semibold">{data.revenue}</span>
            </div>
          </div>
        </Card>
      );
    }
    return null;
  };

  const getQuadrantColor = (impact, effort) => {
    const roi = impact / effort;
    if (roi >= 1.5) return '#10B981'; // High ROI - green
    if (roi >= 1.0) return '#3B82F6'; // Good ROI - blue
    if (roi >= 0.7) return '#F59E0B'; // Medium ROI - amber
    return '#EF4444'; // Low ROI - red
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <CardTitle className="text-white">{title}</CardTitle>
          </div>
          {exportable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={exportChart}
              className="text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div id="opportunity-matrix-chart" className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis 
                type="number" 
                dataKey="effort" 
                name="Effort" 
                domain={[0, 10]}
                stroke="#94A3B8"
                label={{ value: 'Effort Required', position: 'insideBottom', offset: -10, fill: '#94A3B8' }}
              />
              <YAxis 
                type="number" 
                dataKey="impact" 
                name="Impact" 
                domain={[0, 10]}
                stroke="#94A3B8"
                label={{ value: 'Business Impact', angle: -90, position: 'insideLeft', fill: '#94A3B8' }}
              />
              <ZAxis type="number" dataKey="effort" range={[200, 400]} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              
              {/* Quadrant Lines */}
              <ReferenceLine x={5} stroke="#ffffff40" strokeDasharray="5 5" />
              <ReferenceLine y={5} stroke="#ffffff40" strokeDasharray="5 5" />
              
              <Scatter 
                name="Opportunities" 
                data={opportunities}
                onClick={(data) => onSelect && onSelect(data)}
                onMouseEnter={(data) => setHoveredOpp(data.id)}
                onMouseLeave={() => setHoveredOpp(null)}
              >
                {opportunities.map((entry, index) => {
                  const isSelected = selectedIds.includes(entry.id);
                  const isHovered = hoveredOpp === entry.id;
                  
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isSelected ? '#FFB800' : getQuadrantColor(entry.impact, entry.effort)}
                      opacity={isHovered ? 1 : isSelected ? 0.9 : 0.6}
                      cursor="pointer"
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Quadrants */}
        <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <Badge className="bg-green-500/20 text-green-400 mb-1">Quick Wins</Badge>
            <p className="text-slate-400">High Impact / Low Effort (ROI {'>'}1.5)</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <Badge className="bg-blue-500/20 text-blue-400 mb-1">Major Projects</Badge>
            <p className="text-slate-400">High Impact / High Effort</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <Badge className="bg-amber-500/20 text-amber-400 mb-1">Fill-Ins</Badge>
            <p className="text-slate-400">Low Impact / Low Effort</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <Badge className="bg-red-500/20 text-red-400 mb-1">Time Sinks</Badge>
            <p className="text-slate-400">Low Impact / High Effort (Avoid)</p>
          </div>
        </div>

        {/* Selected Opportunities Summary */}
        {selectedIds.length > 0 && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-4 h-4 text-amber-400" />
              <p className="text-white font-semibold">Selected: {selectedIds.length} opportunities</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-slate-400">Avg ROI: </span>
                <span className="text-amber-400 font-semibold">
                  {(opportunities
                    .filter(o => selectedIds.includes(o.id))
                    .reduce((sum, o) => sum + (o.impact / o.effort), 0) / selectedIds.length
                  ).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Total Impact: </span>
                <span className="text-green-400 font-semibold">
                  {opportunities.filter(o => selectedIds.includes(o.id)).reduce((sum, o) => sum + o.impact, 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Total Effort: </span>
                <span className="text-red-400 font-semibold">
                  {opportunities.filter(o => selectedIds.includes(o.id)).reduce((sum, o) => sum + o.effort, 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}