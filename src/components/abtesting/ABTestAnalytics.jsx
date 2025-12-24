import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Target, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ABTestAnalytics({ test, stats, events }) {
  // Calculate statistical significance
  const calculateSignificance = (variantA, variantB) => {
    const n1 = variantA.impressions;
    const n2 = variantB.impressions;
    const p1 = variantA.conversions / n1;
    const p2 = variantB.conversions / n2;
    
    if (n1 < 30 || n2 < 30) return { significant: false, confidence: 0, message: 'Insufficient data (need 30+ impressions)' };
    
    const pooled = (variantA.conversions + variantB.conversions) / (n1 + n2);
    const se = Math.sqrt(pooled * (1 - pooled) * (1/n1 + 1/n2));
    const z = Math.abs(p1 - p2) / se;
    
    // Z-score to confidence level
    let confidence = 0;
    if (z > 2.576) confidence = 99;
    else if (z > 1.96) confidence = 95;
    else if (z > 1.645) confidence = 90;
    else confidence = Math.round((1 - 2 * (1 - 0.5 * (1 + Math.erf(z / Math.sqrt(2))))) * 100);
    
    return {
      significant: z > 1.96,
      confidence,
      message: z > 1.96 ? `${confidence}% confidence` : 'Not statistically significant yet'
    };
  };

  // Prepare data for charts
  const variantComparison = test.variants.map(variant => {
    const variantStats = stats[variant.id] || {};
    return {
      name: variant.name,
      conversions: variantStats.conversions || 0,
      impressions: variantStats.impressions || 0,
      rate: parseFloat(variantStats.conversionRate || 0)
    };
  });

  // Time series data (group by day)
  const timeSeriesData = events.reduce((acc, event) => {
    const date = new Date(event.timestamp || event.created_date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = {};
      test.variants.forEach(v => {
        acc[date][v.id] = { impressions: 0, conversions: 0 };
      });
    }
    
    if (event.event_type === 'impression') {
      acc[date][event.variant_id].impressions++;
    } else if (event.event_type === 'conversion') {
      acc[date][event.variant_id].conversions++;
    }
    
    return acc;
  }, {});

  const timeSeriesArray = Object.entries(timeSeriesData).map(([date, data]) => ({
    date,
    ...Object.fromEntries(
      test.variants.map(v => [
        v.name,
        data[v.id].impressions > 0 ? (data[v.id].conversions / data[v.id].impressions * 100).toFixed(1) : 0
      ])
    )
  }));

  // Determine winner
  const sortedVariants = Object.entries(stats).sort(
    ([, a], [, b]) => parseFloat(b.conversionRate || 0) - parseFloat(a.conversionRate || 0)
  );
  const winner = sortedVariants[0];
  const runnerUp = sortedVariants[1];

  const significance = winner && runnerUp ? calculateSignificance(
    stats[winner[0]],
    stats[runnerUp[0]]
  ) : null;

  const totalImpressions = Object.values(stats).reduce((sum, s) => sum + (s.impressions || 0), 0);
  const totalConversions = Object.values(stats).reduce((sum, s) => sum + (s.conversions || 0), 0);
  const avgConversionRate = totalImpressions > 0 ? (totalConversions / totalImpressions * 100).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      {/* Winner Banner */}
      {significance?.significant && (
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-bold text-white">Statistical Significance Achieved!</h3>
                </div>
                <p className="text-slate-300">
                  <span className="font-semibold text-green-400">
                    {test.variants.find(v => v.id === winner[0])?.name}
                  </span>
                  {' '}is winning with {significance.confidence}% confidence
                </p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2 text-lg">
                Winner
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-slate-400">Total Impressions</p>
            </div>
            <p className="text-2xl font-bold text-white">{totalImpressions}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <p className="text-xs text-slate-400">Total Conversions</p>
            </div>
            <p className="text-2xl font-bold text-white">{totalConversions}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-slate-400">Avg Conv. Rate</p>
            </div>
            <p className="text-2xl font-bold text-white">{avgConversionRate}%</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-slate-400">Confidence</p>
            </div>
            <p className="text-2xl font-bold text-white">{significance?.confidence || 0}%</p>
            <p className="text-xs text-slate-500 mt-1">{significance?.message || 'Calculating...'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Variant Comparison Chart */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Variant Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={variantComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="impressions" fill="#3b82f6" name="Impressions" />
              <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion Rate Trend */}
      {timeSeriesArray.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Conversion Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesArray}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" label={{ value: 'Conv. Rate (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                {test.variants.map((variant, idx) => (
                  <Line 
                    key={variant.id}
                    type="monotone" 
                    dataKey={variant.name} 
                    stroke={idx === 0 ? '#3b82f6' : '#10b981'}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}