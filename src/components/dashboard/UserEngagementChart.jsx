import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function UserEngagementChart({ data }) {
  const calculateTrend = () => {
    if (!data || data.length < 2) return 0;
    const recent = data.slice(-7).reduce((sum, d) => sum + d.sessions, 0);
    const previous = data.slice(-14, -7).reduce((sum, d) => sum + d.sessions, 0);
    return previous ? Math.round(((recent - previous) / previous) * 100) : 0;
  };

  const trend = calculateTrend();

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            User Engagement
          </CardTitle>
          <Badge className={`${
            trend >= 0 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          } font-semibold`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend >= 0 ? '+' : ''}{trend}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Area type="monotone" dataKey="sessions" stroke="#3b82f6" fillOpacity={1} fill="url(#sessionsGradient)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Avg Session</p>
            <p className="text-2xl font-bold text-white">
              {data ? Math.round(data.reduce((sum, d) => sum + (d.duration || 0), 0) / data.length) : 0}m
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-white">
              {data ? data.reduce((sum, d) => sum + (d.users || 0), 0) : 0}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Peak Day</p>
            <p className="text-2xl font-bold text-white">
              {data && data.length > 0 ? data.reduce((max, d) => d.sessions > max.sessions ? d : max, data[0]).date : '-'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}