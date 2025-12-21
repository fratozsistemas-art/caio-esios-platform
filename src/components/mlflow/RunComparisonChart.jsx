import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

export default function RunComparisonChart({ selectedRuns }) {
  const [view, setView] = useState("metrics");

  if (!selectedRuns || selectedRuns.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Select runs to compare</p>
        </CardContent>
      </Card>
    );
  }

  // Extract all unique metrics from selected runs
  const allMetrics = new Set();
  selectedRuns.forEach(run => {
    if (run.data?.metrics) {
      run.data.metrics.forEach(m => allMetrics.add(m.key));
    }
  });

  // Extract all unique params
  const allParams = new Set();
  selectedRuns.forEach(run => {
    if (run.data?.params) {
      run.data.params.forEach(p => allParams.add(p.key));
    }
  });

  // Prepare metrics data for comparison
  const metricsData = Array.from(allMetrics).map(metricKey => {
    const dataPoint = { metric: metricKey };
    selectedRuns.forEach((run, idx) => {
      const metric = run.data?.metrics?.find(m => m.key === metricKey);
      dataPoint[`run${idx}`] = metric ? metric.value : null;
    });
    return dataPoint;
  });

  // Prepare params data
  const paramsData = Array.from(allParams).map(paramKey => {
    const dataPoint = { param: paramKey };
    selectedRuns.forEach((run, idx) => {
      const param = run.data?.params?.find(p => p.key === paramKey);
      dataPoint[`run${idx}`] = param ? (isNaN(param.value) ? 0 : parseFloat(param.value)) : 0;
    });
    return dataPoint;
  });

  const colors = ['#00D4FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Run Comparison
          </span>
          <div className="flex gap-2">
            {selectedRuns.map((run, idx) => (
              <Badge key={run.info.run_id} style={{ backgroundColor: `${colors[idx % colors.length]}40`, color: colors[idx % colors.length], border: `1px solid ${colors[idx % colors.length]}60` }}>
                Run {idx + 1}
              </Badge>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="params">Parameters</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="metric" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A1628', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  labelStyle={{ color: '#ffffff' }}
                />
                <Legend />
                {selectedRuns.map((run, idx) => (
                  <Bar 
                    key={`run${idx}`}
                    dataKey={`run${idx}`}
                    fill={colors[idx % colors.length]}
                    name={`Run ${idx + 1}`}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="params" className="space-y-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={paramsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="param" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A1628', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  labelStyle={{ color: '#ffffff' }}
                />
                <Legend />
                {selectedRuns.map((run, idx) => (
                  <Bar 
                    key={`run${idx}`}
                    dataKey={`run${idx}`}
                    fill={colors[idx % colors.length]}
                    name={`Run ${idx + 1}`}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}