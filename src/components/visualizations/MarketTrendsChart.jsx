import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, TrendingUp, Settings } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MarketTrendsChart({ data, title = "Market Trends Analysis", exportable = true }) {
  const [chartType, setChartType] = useState("line");
  const [timeRange, setTimeRange] = useState("all");

  const filteredData = timeRange === "all" ? data : data.slice(-parseInt(timeRange));

  const exportChart = () => {
    const svg = document.querySelector('#market-trends-chart svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-trends-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="bg-slate-900 border-cyan-500/30 p-3">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-400">{entry.name}:</span>
              <span className="text-cyan-400 font-semibold">
                {entry.value.toLocaleString()}
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
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-white">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={timeRange} onValueChange={setTimeRange}>
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="6" className="text-xs">6M</TabsTrigger>
                <TabsTrigger value="12" className="text-xs">1Y</TabsTrigger>
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChartType(chartType === "line" ? "area" : "line")}
              className="text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
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
        </div>
      </CardHeader>
      <CardContent>
        <div id="market-trends-chart" className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="period" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#94A3B8' }} />
                <Line type="monotone" dataKey="tam" stroke="#00D4FF" strokeWidth={2} dot={{ fill: '#00D4FF' }} />
                <Line type="monotone" dataKey="sam" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} />
                <Line type="monotone" dataKey="som" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
              </LineChart>
            ) : (
              <AreaChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="period" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#94A3B8' }} />
                <Area type="monotone" dataKey="tam" stackId="1" stroke="#00D4FF" fill="#00D4FF30" />
                <Area type="monotone" dataKey="sam" stackId="1" stroke="#8B5CF6" fill="#8B5CF630" />
                <Area type="monotone" dataKey="som" stackId="1" stroke="#10B981" fill="#10B98130" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
            <Badge className="bg-cyan-500/20 text-cyan-400 mb-2">TAM</Badge>
            <p className="text-2xl font-bold text-white">
              ${filteredData[filteredData.length - 1]?.tam}B
            </p>
            <p className="text-xs text-slate-400">Total Addressable Market</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <Badge className="bg-purple-500/20 text-purple-400 mb-2">SAM</Badge>
            <p className="text-2xl font-bold text-white">
              ${filteredData[filteredData.length - 1]?.sam}B
            </p>
            <p className="text-xs text-slate-400">Serviceable Available Market</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <Badge className="bg-green-500/20 text-green-400 mb-2">SOM</Badge>
            <p className="text-2xl font-bold text-white">
              ${filteredData[filteredData.length - 1]?.som}M
            </p>
            <p className="text-xs text-slate-400">Serviceable Obtainable Market</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}