import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from "lucide-react";

const COLORS = ['#00D4FF', '#FFB800', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function CSVDataVisualizer({ data, headers }) {
  const [chartType, setChartType] = useState("bar");
  const [xAxis, setXAxis] = useState(headers[0] || "");
  const [yAxis, setYAxis] = useState(headers[1] || "");

  const numericHeaders = useMemo(() => {
    if (!data || data.length === 0) return [];
    return headers.filter(h => !isNaN(parseFloat(data[0][h])));
  }, [data, headers]);

  const chartData = useMemo(() => {
    if (!data || !xAxis || !yAxis) return [];
    return data.map(row => ({
      name: row[xAxis],
      value: parseFloat(row[yAxis]) || 0
    }));
  }, [data, xAxis, yAxis]);

  if (!data || data.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <p className="text-slate-400">No data to visualize</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Data Visualization
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select value={xAxis} onValueChange={setXAxis}>
              <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white text-xs">
                <SelectValue placeholder="X-Axis" />
              </SelectTrigger>
              <SelectContent>
                {headers.map(h => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yAxis} onValueChange={setYAxis}>
              <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white text-xs">
                <SelectValue placeholder="Y-Axis" />
              </SelectTrigger>
              <SelectContent>
                {numericHeaders.map(h => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-24 bg-white/5 border-white/10 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="pie">Pie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          {chartType === "bar" && (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#00D4FF" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
          {chartType === "line" && (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="value" stroke="#00D4FF" strokeWidth={3} dot={{ fill: '#00D4FF', r: 4 }} />
            </LineChart>
          )}
          {chartType === "pie" && (
            <PieChart>
              <Pie
                data={chartData.slice(0, 8)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Total Records</p>
            <p className="text-lg font-bold text-white">{data.length}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Fields</p>
            <p className="text-lg font-bold text-white">{headers.length}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Average</p>
            <p className="text-lg font-bold text-white">
              {(chartData.reduce((acc, d) => acc + d.value, 0) / chartData.length).toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Max Value</p>
            <p className="text-lg font-bold text-white">
              {Math.max(...chartData.map(d => d.value)).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}