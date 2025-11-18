import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, TrendingUp, Target, AlertCircle, CheckCircle, 
  ArrowRight, Sparkles, Activity, GitBranch
} from 'lucide-react';

export default function ArchetypeMatchingResults({ matchingData, onApplyMatch }) {
  if (!matchingData) return null;

  const { 
    primary_match, 
    secondary_match, 
    tertiary_match,
    match_quality, 
    nurturing_insights,
    recommendations 
  } = matchingData;

  const getQualityColor = (level) => {
    const colors = {
      excellent: 'text-green-400 bg-green-500/20 border-green-500/30',
      good: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      moderate: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      weak: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
      poor: 'text-red-400 bg-red-500/20 border-red-500/30'
    };
    return colors[level] || colors.moderate;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-400 bg-red-500/10',
      medium: 'text-yellow-400 bg-yellow-500/10',
      low: 'text-blue-400 bg-blue-500/10'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* Match Quality Overview */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Enhanced Archetype Matching Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg border ${getQualityColor(match_quality?.level)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Match Quality: {match_quality?.level?.toUpperCase()}</span>
              <Badge className={getQualityColor(match_quality?.level)}>
                {match_quality?.confidence?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm opacity-90">{match_quality?.message}</p>
          </div>

          {/* Primary Match */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Primary: {primary_match?.archetype_name}</h3>
                </div>
                <p className="text-sm text-slate-400">Match Score: {primary_match?.score}%</p>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400">{primary_match?.category}</Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Communication</span>
                <span className="text-white font-medium">{primary_match?.breakdown?.communication}%</span>
              </div>
              <Progress value={primary_match?.breakdown?.communication} className="h-2" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Decision Making</span>
                <span className="text-white font-medium">{primary_match?.breakdown?.decision_making}%</span>
              </div>
              <Progress value={primary_match?.breakdown?.decision_making} className="h-2" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Behavioral Patterns</span>
                <span className="text-white font-medium">{primary_match?.breakdown?.behavioral_patterns}%</span>
              </div>
              <Progress value={primary_match?.breakdown?.behavioral_patterns} className="h-2" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Context Alignment</span>
                <span className="text-white font-medium">{primary_match?.breakdown?.context_alignment}%</span>
              </div>
              <Progress value={primary_match?.breakdown?.context_alignment} className="h-2" />
            </div>

            <div className="flex gap-2">
              {primary_match?.matched_behaviors?.slice(0, 3).map((behavior, idx) => (
                <Badge key={idx} variant="outline" className="border-green-500/30 text-green-400 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {behavior.behavior_id?.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>

            {recommendations?.update_primary && (
              <Button 
                onClick={() => onApplyMatch(primary_match)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Apply This Match to Profile
              </Button>
            )}
          </div>

          {/* Secondary & Tertiary Matches */}
          <div className="grid md:grid-cols-2 gap-4">
            {secondary_match && (
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Secondary: {secondary_match.archetype_name}</span>
                </div>
                <Progress value={secondary_match.score} className="h-2 mb-2" />
                <p className="text-xs text-slate-400">Score: {secondary_match.score}%</p>
              </div>
            )}
            
            {tertiary_match && (
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-white">Tertiary: {tertiary_match.archetype_name}</span>
                </div>
                <Progress value={tertiary_match.score} className="h-2 mb-2" />
                <p className="text-xs text-slate-400">Score: {tertiary_match.score}%</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Nurturing Insights */}
      {nurturing_insights && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Nurturing Pathway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current State */}
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Current State</h4>
              <p className="text-sm text-white">{nurturing_insights.current_state}</p>
            </div>

            {/* Pathway to Primary */}
            {nurturing_insights.pathway_to_primary?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Strengthen Primary Archetype
                </h4>
                <div className="space-y-2">
                  {nurturing_insights.pathway_to_primary.slice(0, 4).map((step, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm text-white flex-1">{step.action}</span>
                        <Badge className={getPriorityColor(step.priority)}>
                          {step.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>Weight: {Math.round((step.weight || 0) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pathway to Secondary */}
            {nurturing_insights.pathway_to_secondary?.length > 0 && (
              <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Alternative Path: {nurturing_insights.pathway_to_secondary[0].archetype}
                </h4>
                <p className="text-sm text-white mb-2">
                  Score gap: {nurturing_insights.pathway_to_secondary[0].score_gap} points • 
                  Potential: {nurturing_insights.pathway_to_secondary[0].potential}
                </p>
                <div className="flex flex-wrap gap-2">
                  {nurturing_insights.pathway_to_secondary[0].key_differences?.map((diff, idx) => (
                    <Badge key={idx} variant="outline" className="border-orange-500/30 text-orange-400 text-xs">
                      {diff?.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Behavioral Gaps */}
            {nurturing_insights.behavioral_gaps?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  Key Behavioral Gaps
                </h4>
                <div className="space-y-2">
                  {nurturing_insights.behavioral_gaps.slice(0, 3).map((gap, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                      <span className="text-sm text-white">{gap.gap?.replace(/_/g, ' ')}</span>
                      <Badge className={getPriorityColor(gap.impact)}>
                        {gap.impact} impact
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {nurturing_insights.recommended_actions?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Recommended Actions
                </h4>
                <div className="space-y-3">
                  {nurturing_insights.recommended_actions.map((action, idx) => (
                    <div key={idx} className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-green-400">{action.area}</span>
                      </div>
                      <p className="text-sm text-white mb-2">{action.suggestion}</p>
                      <p className="text-xs text-slate-400 italic">{action.expected_impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Engagement Strategies */}
            {nurturing_insights.engagement_strategies?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Engagement Strategies</h4>
                <div className="space-y-2">
                  {nurturing_insights.engagement_strategies.map((strategy, idx) => (
                    <div key={idx} className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <p className="text-sm font-medium text-blue-400 mb-1">{strategy.strategy}</p>
                      <p className="text-sm text-white mb-1">{strategy.description}</p>
                      <p className="text-xs text-slate-400">{strategy.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}