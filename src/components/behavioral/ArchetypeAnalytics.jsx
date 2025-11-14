import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Award } from 'lucide-react';

export default function ArchetypeAnalytics({ profiles, engagements, archetypes }) {
  // Calculate archetype distribution
  const archetypeDistribution = {};
  profiles.forEach(profile => {
    const archetypeId = profile.primary_archetype_id;
    if (archetypeId) {
      if (!archetypeDistribution[archetypeId]) {
        archetypeDistribution[archetypeId] = {
          count: 0,
          totalConfidence: 0,
          totalEngagements: 0,
          satisfactionSum: 0,
          satisfactionCount: 0
        };
      }
      archetypeDistribution[archetypeId].count++;
      archetypeDistribution[archetypeId].totalConfidence += (profile.overall_confidence || 50);
      archetypeDistribution[archetypeId].totalEngagements += (profile.total_engagements || 0);
    }
  });

  // Add satisfaction from engagements
  engagements.forEach(engagement => {
    const profile = profiles.find(p => p.id === engagement.behavioral_profile_id);
    if (profile && profile.primary_archetype_id && engagement.client_satisfaction) {
      const archetypeId = profile.primary_archetype_id;
      if (archetypeDistribution[archetypeId]) {
        archetypeDistribution[archetypeId].satisfactionSum += engagement.client_satisfaction;
        archetypeDistribution[archetypeId].satisfactionCount++;
      }
    }
  });

  // Calculate predictive accuracy
  const accuracyData = engagements
    .filter(e => e.confirmation_rate != null)
    .reduce((acc, engagement) => {
      const profile = profiles.find(p => p.id === engagement.behavioral_profile_id);
      if (profile && profile.primary_archetype_id) {
        const archetypeId = profile.primary_archetype_id;
        if (!acc[archetypeId]) {
          acc[archetypeId] = { total: 0, count: 0 };
        }
        acc[archetypeId].total += engagement.confirmation_rate;
        acc[archetypeId].count++;
      }
      return acc;
    }, {});

  // Format data for charts
  const distributionData = Object.entries(archetypeDistribution).map(([archetypeId, data]) => {
    const archetype = archetypes.find(a => a.archetype_id === archetypeId);
    return {
      name: archetype?.archetype_name || archetypeId,
      count: data.count,
      avgConfidence: Math.round(data.totalConfidence / data.count),
      avgSatisfaction: data.satisfactionCount > 0 
        ? (data.satisfactionSum / data.satisfactionCount).toFixed(1)
        : 'N/A',
      totalEngagements: data.totalEngagements,
      accuracy: accuracyData[archetypeId] 
        ? Math.round(accuracyData[archetypeId].total / accuracyData[archetypeId].count)
        : 0
    };
  });

  const pieData = distributionData.map(d => ({
    name: d.name,
    value: d.count
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-white/20 p-3 rounded-lg shadow-lg">
          <p className="text-white font-semibold mb-2">{data.name}</p>
          <p className="text-sm text-blue-400">Clients: {data.count}</p>
          <p className="text-sm text-green-400">Avg Confidence: {data.avgConfidence}%</p>
          <p className="text-sm text-purple-400">Avg Satisfaction: {data.avgSatisfaction}/5</p>
          <p className="text-sm text-orange-400">Engagements: {data.totalEngagements}</p>
          <p className="text-sm text-yellow-400">Accuracy: {data.accuracy}%</p>
        </div>
      );
    }
    return null;
  };

  // Calculate overall metrics
  const overallMetrics = {
    totalClients: profiles.length,
    avgConfidence: profiles.length > 0
      ? Math.round(profiles.reduce((sum, p) => sum + (p.overall_confidence || 50), 0) / profiles.length)
      : 0,
    avgAccuracy: Object.keys(accuracyData).length > 0
      ? Math.round(
          Object.values(accuracyData).reduce((sum, d) => sum + (d.total / d.count), 0) / 
          Object.keys(accuracyData).length
        )
      : 0,
    topArchetype: distributionData.length > 0
      ? distributionData.reduce((max, d) => d.count > max.count ? d : max, distributionData[0])
      : null
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Avg Pattern Confidence</p>
                <p className="text-3xl font-bold text-green-400">{overallMetrics.avgConfidence}%</p>
                <p className="text-xs text-slate-500 mt-1">Across all profiles</p>
              </div>
              <Target className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Predictive Accuracy</p>
                <p className="text-3xl font-bold text-blue-400">{overallMetrics.avgAccuracy}%</p>
                <p className="text-xs text-slate-500 mt-1">Archetype predictions</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Top Archetype</p>
                <p className="text-lg font-bold text-purple-400">
                  {overallMetrics.topArchetype?.name || 'N/A'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {overallMetrics.topArchetype?.count || 0} clients
                </p>
              </div>
              <Award className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Archetype Distribution */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Archetype Distribution</CardTitle>
            <p className="text-sm text-slate-400">Client count by archetype</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Success Metrics by Archetype */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Success Metrics by Archetype</CardTitle>
            <p className="text-sm text-slate-400">Confidence & accuracy comparison</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8"
                  style={{ fontSize: '11px' }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="avgConfidence" fill="#22c55e" name="Avg Confidence %" />
                <Bar dataKey="accuracy" fill="#3b82f6" name="Predictive Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Archetype Performance */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Archetype Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 text-slate-400 font-medium">Archetype</th>
                  <th className="text-center py-3 px-2 text-slate-400 font-medium">Clients</th>
                  <th className="text-center py-3 px-2 text-slate-400 font-medium">Engagements</th>
                  <th className="text-center py-3 px-2 text-slate-400 font-medium">Avg Confidence</th>
                  <th className="text-center py-3 px-2 text-slate-400 font-medium">Predictive Accuracy</th>
                  <th className="text-center py-3 px-2 text-slate-400 font-medium">Avg Satisfaction</th>
                  <th className="text-center py-3 px-2 text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {distributionData.map((data, idx) => (
                  <tr key={idx} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 text-white font-medium">{data.name}</td>
                    <td className="text-center py-3 px-2 text-white">{data.count}</td>
                    <td className="text-center py-3 px-2 text-white">{data.totalEngagements}</td>
                    <td className="text-center py-3 px-2">
                      <span className={`font-semibold ${
                        data.avgConfidence >= 80 ? 'text-green-400' : 
                        data.avgConfidence >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {data.avgConfidence}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={`font-semibold ${
                        data.accuracy >= 80 ? 'text-green-400' : 
                        data.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {data.accuracy}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-2 text-white">
                      {data.avgSatisfaction}/5
                    </td>
                    <td className="text-center py-3 px-2">
                      <Badge className={
                        data.avgConfidence >= 95 ? 'bg-blue-500/20 text-blue-400' :
                        data.avgConfidence >= 80 ? 'bg-green-500/20 text-green-400' :
                        data.avgConfidence >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }>
                        {data.avgConfidence >= 95 ? 'MATURE' :
                         data.avgConfidence >= 80 ? 'VALIDATED' :
                         data.avgConfidence >= 60 ? 'EMERGING' : 'HYPOTHESIS'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}