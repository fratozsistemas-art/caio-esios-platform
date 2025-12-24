import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from "recharts";
import { Download, Target } from "lucide-react";

export default function CompetitiveLandscapeChart({ data, title = "Competitive Landscape", exportable = true }) {
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);

  const exportChart = () => {
    const svg = document.querySelector('#competitive-landscape-chart svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `competitive-landscape-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="bg-slate-900 border-cyan-500/30 p-3">
          <p className="text-white font-semibold mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Methodology:</span>
              <span className="text-cyan-400 font-semibold">{data.methodology}/10</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Price Point:</span>
              <span className="text-cyan-400 font-semibold">{data.price}/10</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Market Share:</span>
              <span className="text-cyan-400 font-semibold">{data.marketShare}%</span>
            </div>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-purple-400" />
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
        <div id="competitive-landscape-chart" className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis 
                type="number" 
                dataKey="methodology" 
                name="Methodology Depth" 
                domain={[0, 10]}
                stroke="#94A3B8"
                label={{ value: 'Methodology Depth', position: 'insideBottom', offset: -10, fill: '#94A3B8' }}
              />
              <YAxis 
                type="number" 
                dataKey="price" 
                name="Price Point" 
                domain={[0, 10]}
                stroke="#94A3B8"
                label={{ value: 'Price Point', angle: -90, position: 'insideLeft', fill: '#94A3B8' }}
              />
              <ZAxis type="number" dataKey="marketShare" range={[100, 1000]} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                name="Competitors" 
                data={data} 
                onClick={(data) => setSelectedCompetitor(data)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isYou ? '#FFB800' : '#00D4FF'}
                    opacity={selectedCompetitor?.name === entry.name ? 1 : 0.6}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Quadrant Labels */}
        <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <Badge className="bg-blue-500/20 text-blue-400 mb-1">Low Price / Low Methodology</Badge>
            <p className="text-slate-400">Generic AI Tools (ChatGPT, Claude)</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <Badge className="bg-purple-500/20 text-purple-400 mb-1">High Price / Low Methodology</Badge>
            <p className="text-slate-400">Vertical SaaS (Gong, Clari)</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <Badge className="bg-green-500/20 text-green-400 mb-1">Low Price / High Methodology</Badge>
            <p className="text-slate-400">CAIO·AI (Blue Ocean)</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <Badge className="bg-red-500/20 text-red-400 mb-1">High Price / High Methodology</Badge>
            <p className="text-slate-400">Traditional Consultancies</p>
          </div>
        </div>

        {selectedCompetitor && (
          <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <p className="text-white font-semibold mb-2">Selected: {selectedCompetitor.name}</p>
            <p className="text-sm text-slate-300">{selectedCompetitor.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}