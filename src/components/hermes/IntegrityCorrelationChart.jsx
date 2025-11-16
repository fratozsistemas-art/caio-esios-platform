import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function IntegrityCorrelationChart({ analyses, executions }) {
  const correlationData = analyses
    .filter(a => a.target_entity_type === 'workflow_execution')
    .map(analysis => {
      const execution = executions.find(e => e.id === analysis.target_entity_id);
      if (!execution) return null;

      return {
        integrity_score: analysis.integrity_score || 0,
        duration: execution.duration_seconds || 0,
        success: execution.status === 'completed' ? 100 : 0,
        entity: execution.workflow_name,
        critical_issues: (analysis.inconsistencies_detected || []).filter(i => i.severity === 'critical').length
      };
    })
    .filter(Boolean);

  const successCorrelation = correlationData.length > 0
    ? correlationData.reduce((sum, d) => sum + (d.integrity_score > 80 && d.success === 100 ? 1 : 0), 0) / correlationData.length * 100
    : 0;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm">Integrity vs. Workflow Success</CardTitle>
          <div className="text-right">
            <p className="text-xs text-slate-400">Success Correlation</p>
            <p className="text-lg font-bold text-green-400">{Math.round(successCorrelation)}%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              type="number" 
              dataKey="integrity_score" 
              name="Integrity Score" 
              stroke="#94a3b8"
              label={{ value: 'Integrity Score', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
            />
            <YAxis 
              type="number" 
              dataKey="duration" 
              name="Duration (s)" 
              stroke="#94a3b8"
              label={{ value: 'Duration (s)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <ZAxis type="number" dataKey="critical_issues" range={[50, 400]} name="Critical Issues" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              formatter={(value, name) => {
                if (name === 'Integrity Score') return [value + '%', name];
                if (name === 'Duration (s)') return [value.toFixed(1) + 's', name];
                return [value, name];
              }}
            />
            <Scatter 
              name="Workflows" 
              data={correlationData} 
              fill="#06b6d4"
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-slate-400 mb-2">Key Insights:</p>
          <div className="space-y-1 text-xs text-slate-300">
            <p>• Workflows with integrity &gt;80% have {Math.round(successCorrelation)}% success rate</p>
            <p>• Average duration: {(correlationData.reduce((s, d) => s + d.duration, 0) / correlationData.length).toFixed(1)}s</p>
            <p>• Total critical issues detected: {correlationData.reduce((s, d) => s + d.critical_issues, 0)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}