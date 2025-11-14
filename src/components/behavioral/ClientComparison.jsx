import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitCompare, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ClientComparison({ profiles, archetypes }) {
  if (profiles.length < 2) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <GitCompare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Need at least 2 profiles for comparison</p>
        </CardContent>
      </Card>
    );
  }

  // Select top 3 profiles for comparison (highest confidence)
  const topProfiles = [...profiles]
    .sort((a, b) => (b.overall_confidence || 0) - (a.overall_confidence || 0))
    .slice(0, 3);

  const getArchetypeName = (archetypeId) => {
    const archetype = archetypes.find(a => a.archetype_id === archetypeId);
    return archetype?.archetype_name || 'Unknown';
  };

  const metrics = [
    { key: 'overall_confidence', label: 'Overall Confidence', format: (v) => `${v || 50}%` },
    { key: 'total_engagements', label: 'Total Engagements', format: (v) => v || 0 },
    { key: 'behavioral_consistency', label: 'Behavioral Consistency', format: (v) => `${v || 100}%` },
    { key: 'archetype_validation_status', label: 'Validation Status', format: (v) => v || 'HYPOTHESIS' },
    { key: 'evolution_trajectory', label: 'Evolution Trajectory', format: (v) => v || 'stable' }
  ];

  // Calculate similarities
  const similarities = [];
  const differences = [];

  // Compare archetypes
  const archetypeSet = new Set(topProfiles.map(p => p.primary_archetype_id).filter(Boolean));
  if (archetypeSet.size === 1) {
    similarities.push('All clients share the same archetype');
  } else {
    differences.push('Different client archetypes detected');
  }

  // Compare validation status
  const statusSet = new Set(topProfiles.map(p => p.archetype_validation_status));
  if (statusSet.size === 1) {
    similarities.push('Similar pattern maturity levels');
  } else {
    differences.push('Varying pattern maturity across clients');
  }

  // Compare company stages
  const stageSet = new Set(topProfiles.map(p => p.company_stage));
  if (stageSet.size === 1) {
    similarities.push('All clients at same company stage');
  } else {
    differences.push('Different company maturity stages');
  }

  // Compare industries
  const industrySet = new Set(topProfiles.map(p => p.industry));
  if (industrySet.size === 1) {
    similarities.push('Operating in same industry');
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-purple-400" />
          Client Comparison: Top 3 Profiles
        </CardTitle>
        <p className="text-sm text-slate-400">
          Comparative analysis of behavioral patterns
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Metric</th>
                {topProfiles.map((profile) => (
                  <th key={profile.id} className="text-center py-3 px-2 text-white font-medium">
                    <div className="truncate max-w-[150px]" title={profile.client_name}>
                      {profile.client_name}
                    </div>
                    <div className="text-xs text-slate-400 font-normal mt-1">
                      {profile.organization_name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="py-3 px-2 text-slate-300">Archetype</td>
                {topProfiles.map((profile) => (
                  <td key={profile.id} className="text-center py-3 px-2">
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                      {getArchetypeName(profile.primary_archetype_id)}
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-2 text-slate-300">Industry</td>
                {topProfiles.map((profile) => (
                  <td key={profile.id} className="text-center py-3 px-2 text-white">
                    {profile.industry}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-2 text-slate-300">Company Stage</td>
                {topProfiles.map((profile) => (
                  <td key={profile.id} className="text-center py-3 px-2 text-white">
                    {profile.company_stage}
                  </td>
                ))}
              </tr>
              {metrics.map((metric) => (
                <tr key={metric.key} className="border-b border-white/10">
                  <td className="py-3 px-2 text-slate-300">{metric.label}</td>
                  {topProfiles.map((profile) => (
                    <td key={profile.id} className="text-center py-3 px-2 text-white">
                      {metric.format(profile[metric.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Insights */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Similarities */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h4 className="text-white font-semibold">Similarities</h4>
            </div>
            {similarities.length > 0 ? (
              <ul className="space-y-2">
                {similarities.map((item, idx) => (
                  <li key={idx} className="text-sm text-green-300 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No significant similarities detected</p>
            )}
          </div>

          {/* Differences */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h4 className="text-white font-semibold">Key Differences</h4>
            </div>
            {differences.length > 0 ? (
              <ul className="space-y-2">
                {differences.map((item, idx) => (
                  <li key={idx} className="text-sm text-orange-300 flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Highly similar profiles</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}