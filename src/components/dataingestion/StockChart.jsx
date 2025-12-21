import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StockChart({ data, symbol, chartType = "line" }) {
  if (!data || !data.length) return null;

  const latestPrice = data[data.length - 1]?.close || 0;
  const oldestPrice = data[0]?.close || 0;
  const priceChange = latestPrice - oldestPrice;
  const priceChangePercent = ((priceChange / oldestPrice) * 100).toFixed(2);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0B0F1A] border border-white/20 rounded-lg p-3">
          <p className="text-white text-sm font-semibold mb-1">{payload[0].payload.date}</p>
          <div className="space-y-1">
            <p className="text-xs text-slate-400">
              Open: <span className="text-white">${payload[0].payload.open?.toFixed(2)}</span>
            </p>
            <p className="text-xs text-slate-400">
              High: <span className="text-green-400">${payload[0].payload.high?.toFixed(2)}</span>
            </p>
            <p className="text-xs text-slate-400">
              Low: <span className="text-red-400">${payload[0].payload.low?.toFixed(2)}</span>
            </p>
            <p className="text-xs text-slate-400">
              Close: <span className="text-white font-semibold">${payload[0].payload.close?.toFixed(2)}</span>
            </p>
            <p className="text-xs text-slate-400">
              Volume: <span className="text-blue-400">{payload[0].payload.volume?.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            {symbol} Price Chart
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={priceChange >= 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
              {priceChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {priceChangePercent}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="close" stroke="#00D4FF" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="close" stroke="#00D4FF" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="high" stroke="#10B981" strokeWidth={1} dot={false} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="low" stroke="#EF4444" strokeWidth={1} dot={false} strokeDasharray="3 3" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}