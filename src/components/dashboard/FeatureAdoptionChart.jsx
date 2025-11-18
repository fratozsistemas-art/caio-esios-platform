import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Zap, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function FeatureAdoptionChart({ data }) {
  const avgAdoption = data ? Math.round(data.reduce((sum, d) => sum + d.adoption_rate, 0) / data.length) : 0;
  const topFeature = data && data.length > 0 ? data.reduce((max, d) => d.adoption_rate > max.adoption_rate ? d : max, data[0]) : null;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Feature Adoption
          </CardTitle>
          <Badge className="bg-purple-500/20 text-purple-400">
            Avg: {avgAdoption}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="feature" stroke="#94a3b8" fontSize={12} angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Bar dataKey="adoption_rate" radius={[8, 8, 0, 0]}>
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs text-slate-400">Top Feature</p>
            <p className="text-sm font-bold text-white truncate">
              {topFeature ? topFeature.feature : '-'}
            </p>
            <p className="text-xs text-green-400">{topFeature ? topFeature.adoption_rate : 0}% adoption</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Active Users</p>
            <p className="text-lg font-bold text-white">
              {data ? data.reduce((sum, d) => sum + (d.active_users || 0), 0) : 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}