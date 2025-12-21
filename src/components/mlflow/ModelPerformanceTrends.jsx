import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity } from "lucide-react";

export default function ModelPerformanceTrends({ model, versions }) {
  const { data: performanceData = [], isLoading } = useQuery({
    queryKey: ['mlflow_model_performance', model?.name],
    queryFn: async () => {
      if (!model || !versions || versions.length === 0) return [];
      
      // Fetch run data for each version
      const versionPerformance = await Promise.all(
        versions.map(async (version) => {
          try {
            const { data } = await base44.functions.invoke('mlflowClient', {
              action: 'getRun',
              data: { run_id: version.run_id }
            });
            
            const run = data.run;
            const metrics = {};
            if (run?.data?.metrics) {
              run.data.metrics.forEach(m => {
                metrics[m.key] = m.value;
              });
            }
            
            return {
              version: `v${version.version}`,
              versionNumber: parseInt(version.version),
              timestamp: parseInt(version.creation_timestamp),
              stage: version.current_stage,
              ...metrics
            };
          } catch (error) {
            return {
              version: `v${version.version}`,
              versionNumber: parseInt(version.version),
              timestamp: parseInt(version.creation_timestamp),
              stage: version.current_stage
            };
          }
        })
      );
      
      return versionPerformance.sort((a, b) => a.versionNumber - b.versionNumber);
    },
    enabled: !!model && !!versions && versions.length > 0
  });

  if (!model || !versions || versions.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Select a model with versions to view trends</p>
        </CardContent>
      </Card>
    );
  }

  // Extract all metric keys
  const metricKeys = new Set();
  performanceData.forEach(data => {
    Object.keys(data).forEach(key => {
      if (!['version', 'versionNumber', 'timestamp', 'stage'].includes(key)) {
        metricKeys.add(key);
      }
    });
  });

  const colors = ['#00D4FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Performance Trends - {model.name}
          </span>
          <Badge variant="outline" className="border-white/20 text-slate-300">
            {versions.length} versions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
        ) : metricKeys.size === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No metrics available for these versions</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="version" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A1628', border: '1px solid #ffffff20', borderRadius: '8px' }}
                labelStyle={{ color: '#ffffff' }}
              />
              <Legend />
              {Array.from(metricKeys).map((metricKey, idx) => (
                <Line
                  key={metricKey}
                  type="monotone"
                  dataKey={metricKey}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[idx % colors.length], r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}