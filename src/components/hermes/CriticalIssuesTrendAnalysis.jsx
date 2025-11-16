import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

export default function CriticalIssuesTrendAnalysis({ analyses }) {
  const [viewMode, setViewMode] = useState('timeline');

  const timelineData = analyses
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .reduce((acc, analysis) => {
      const date = new Date(analysis.created_date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, critical: 0, high: 0, medium: 0, low: 0, total: 0 };
      }
      
      (analysis.inconsistencies_detected || []).forEach(issue => {
        acc[date][issue.severity]++;
        acc[date].total++;
      });
      
      return acc;
    }, {});

  const timeline = Object.values(timelineData).slice(-14);

  const rootCauses = analyses.reduce((acc, analysis) => {
    (analysis.inconsistencies_detected || [])
      .filter(i => i.severity === 'critical' || i.severity === 'high')
      .forEach(issue => {
        const type = issue.type || 'unknown';
        if (!acc[type]) {
          acc[type] = { type, count: 0, severity_breakdown: { critical: 0, high: 0 } };
        }
        acc[type].count++;
        acc[type].severity_breakdown[issue.severity]++;
      });
    return acc;
  }, {});

  const rootCauseData = Object.values(rootCauses)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const trend = timeline.length > 1
    ? ((timeline[timeline.length - 1].total - timeline[0].total) / timeline[0].total) * 100
    : 0;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm">Critical Issues Trend Analysis</CardTitle>
          <div className="flex items-center gap-2">
            {trend > 0 ? (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{Math.round(trend)}%
              </Badge>
            ) : (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <TrendingDown className="w-3 h-3 mr-1" />
                {Math.round(trend)}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1 rounded text-xs transition-all ${
              viewMode === 'timeline'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('root_causes')}
            className={`px-3 py-1 rounded text-xs transition-all ${
              viewMode === 'root_causes'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            Root Causes
          </button>
        </div>

        {viewMode === 'timeline' ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Legend />
              <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} name="Critical" />
              <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} name="High" />
              <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} name="Medium" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rootCauseData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="type" type="category" stroke="#94a3b8" width={120} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Bar dataKey="count" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        )}

        <div className="pt-4 border-t border-white/10">
          <p className="text-xs font-medium text-slate-400 mb-2">Most Common Root Causes:</p>
          <div className="space-y-2">
            {rootCauseData.slice(0, 3).map((cause, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-orange-400" />
                  <span className="text-white">{cause.type.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500/20 text-red-400 text-xs">
                    {cause.severity_breakdown.critical} critical
                  </Badge>
                  <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                    {cause.severity_breakdown.high} high
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}