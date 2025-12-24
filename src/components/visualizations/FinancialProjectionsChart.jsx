import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, DollarSign, TrendingUp } from "lucide-react";

export default function FinancialProjectionsChart({ 
  initialData, 
  title = "Financial Projections", 
  interactive = true,
  exportable = true 
}) {
  const [growthRate, setGrowthRate] = useState(15);
  const [burnMultiple, setBurnMultiple] = useState(1.5);

  const generateProjections = () => {
    return initialData.map((item, idx) => {
      const growth = Math.pow(1 + growthRate / 100, idx);
      const revenue = item.revenue * growth;
      const burn = revenue * burnMultiple;
      const cashBalance = item.cashBalance - burn * idx;
      
      return {
        ...item,
        revenue: Math.round(revenue * 100) / 100,
        burn: Math.round(burn * 100) / 100,
        cashBalance: Math.round(cashBalance * 100) / 100,
        runway: Math.round(cashBalance / burn)
      };
    });
  };

  const data = interactive ? generateProjections() : initialData;

  const exportChart = () => {
    const svg = document.querySelector('#financial-projections-chart svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-projections-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="bg-slate-900 border-green-500/30 p-3">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-400">{entry.name}:</span>
              <span 
                className="font-semibold"
                style={{ color: entry.color }}
              >
                ${entry.value.toFixed(2)}M
              </span>
            </div>
          ))}
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
            <DollarSign className="w-5 h-5 text-green-400" />
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
        {interactive && (
          <div className="space-y-4 mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-slate-300">Monthly Growth Rate</label>
                <span className="text-green-400 font-semibold">{growthRate}%</span>
              </div>
              <Slider
                value={[growthRate]}
                onValueChange={(values) => setGrowthRate(values[0])}
                min={5}
                max={30}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-slate-300">Burn Multiple</label>
                <span className="text-red-400 font-semibold">{burnMultiple.toFixed(1)}x</span>
              </div>
              <Slider
                value={[burnMultiple]}
                onValueChange={(values) => setBurnMultiple(values[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        )}

        <div id="financial-projections-chart" className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="quarter" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94A3B8' }} />
              <Area type="monotone" dataKey="cashBalance" fill="#F59E0B30" stroke="#F59E0B" name="Cash Balance" />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
              <Line type="monotone" dataKey="burn" stroke="#EF4444" strokeWidth={2} name="Monthly Burn" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <Badge className="bg-green-500/20 text-green-400 mb-2">
              <TrendingUp className="w-3 h-3 mr-1" />
              Revenue
            </Badge>
            <p className="text-2xl font-bold text-white">
              ${data[data.length - 1]?.revenue.toFixed(1)}M
            </p>
            <p className="text-xs text-slate-400">Projected ARR</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <Badge className="bg-red-500/20 text-red-400 mb-2">Burn Rate</Badge>
            <p className="text-2xl font-bold text-white">
              ${data[data.length - 1]?.burn.toFixed(1)}M
            </p>
            <p className="text-xs text-slate-400">Monthly</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <Badge className="bg-amber-500/20 text-amber-400 mb-2">Runway</Badge>
            <p className="text-2xl font-bold text-white">
              {data[data.length - 1]?.runway}m
            </p>
            <p className="text-xs text-slate-400">Months remaining</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}