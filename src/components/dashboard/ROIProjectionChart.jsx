import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ROIProjectionChart({ data }) {
  const currentROI = data && data.length > 0 ? data[data.length - 1].actual_roi : 0;
  const projectedROI = data && data.length > 0 ? data[data.length - 1].projected_roi : 0;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            ROI Projection
          </CardTitle>
          <div className="flex gap-2">
            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-semibold">
              Current: {currentROI}%
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
              Projected: {projectedROI}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            <Line type="monotone" dataKey="actual_roi" stroke="#10b981" strokeWidth={2} name="Actual ROI" />
            <Line type="monotone" dataKey="projected_roi" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Projected ROI" />
          </LineChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Investment</p>
            <p className="text-xl font-bold text-white">
              ${data && data.length > 0 ? (data[data.length - 1].investment || 0).toLocaleString() : 0}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Returns</p>
            <p className="text-xl font-bold text-green-400">
              ${data && data.length > 0 ? (data[data.length - 1].returns || 0).toLocaleString() : 0}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Payback Period</p>
            <p className="text-xl font-bold text-white">
              {data && data.length > 0 ? data[data.length - 1].payback_months || 0 : 0} mo
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}