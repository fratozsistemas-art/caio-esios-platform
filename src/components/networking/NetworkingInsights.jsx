import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Loader2, TrendingUp, Target, AlertCircle, 
  Building2, Award, Zap, Network, UserPlus
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";

const VALUE_COLORS = {
  high: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
};

const COVERAGE_COLORS = {
  strong: 'bg-green-500/20 text-green-400 border-green-500/30',
  moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  weak: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function NetworkingInsights() {
  const [scope, setScope] = useState('personal');
  const [analysis, setAnalysis] = useState(null);

  const { data: linkedInSource } = useQuery({
    queryKey: ['linkedInSource'],
    queryFn: async () => {
      const sources = await base44.entities.DataSource.filter({ type: 'linkedin' });
      return sources.find(s => s.status === 'active');
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: (analysisScope) => 
      base44.functions.invoke('analyzeNetworkingStrength', { scope: analysisScope }),
    onSuccess: (response) => {
      setAnalysis(response.data.analysis);
      toast.success('Network analysis complete!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.details || 'Analysis failed');
    }
  });

  const connectLinkedInMutation = useMutation({
    mutationFn: () => {
      // Redirect to LinkedIn OAuth
      const clientId = 'YOUR_LINKEDIN_CLIENT_ID';
      const redirectUri = `${window.location.origin}/integrations`;
      const scope = 'openid profile email w_member_social r_basicprofile r_network';
      const state = Math.random().toString(36).substring(7);
      
      window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    }
  });

  if (!linkedInSource) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardContent className="p-8 text-center">
          <Network className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Connect LinkedIn</h3>
          <p className="text-slate-300 mb-6">
            Connect your LinkedIn account to analyze your professional network strength
          </p>
          <Button
            onClick={() => connectLinkedInMutation.mutate()}
            className="bg-[#0077B5] hover:bg-[#006399]"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            Connect LinkedIn
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-400" />
            Professional Network Intelligence
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={scope} onValueChange={setScope} className="w-auto">
              <TabsList className="bg-white/5">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              onClick={() => analyzeMutation.mutate(scope)}
              disabled={analyzeMutation.isPending}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Network
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!analysis && !analyzeMutation.isPending && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="text-slate-300 mb-2">
              Analyze your {scope === 'company' ? 'company\'s collective' : 'professional'} network strength
            </p>
            <p className="text-xs text-slate-500">
              Get insights about strategic connections, industry coverage, and untapped opportunities
            </p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-300">Network Strength</span>
                  <Award className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {analysis.network_strength_score}
                  <span className="text-lg text-slate-400">/100</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${analysis.network_strength_score}%` }}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-300">JPYP Score</span>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {analysis.jpyp_score}
                  <span className="text-lg text-slate-400">/100</span>
                </div>
                <p className="text-xs text-slate-400">Hidden network value</p>
              </div>
            </div>

            <Tabs defaultValue="connections" className="mt-4">
              <TabsList className="grid w-full grid-cols-4 bg-white/5">
                <TabsTrigger value="connections">Strategic</TabsTrigger>
                <TabsTrigger value="coverage">Coverage</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="gaps">Gaps</TabsTrigger>
              </TabsList>

              <TabsContent value="connections" className="space-y-3 mt-4">
                {analysis.strategic_connections?.map((conn, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-medium">{conn.name}</h4>
                        <p className="text-sm text-slate-400">{conn.title}</p>
                      </div>
                      <Badge className={VALUE_COLORS[conn.strategic_value]}>
                        {conn.strategic_value}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-400">{conn.company}</span>
                    </div>
                    <p className="text-xs text-slate-300">{conn.reason}</p>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="coverage" className="space-y-3 mt-4">
                {analysis.industry_coverage?.map((industry, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{industry.industry}</h4>
                      <Badge className={COVERAGE_COLORS[industry.coverage_strength]}>
                        {industry.coverage_strength}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">
                        {industry.connection_count} connections
                      </span>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-3 mt-4">
                {analysis.untapped_opportunities?.map((opp, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-green-500/10 rounded-lg p-4 border border-green-500/30"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Target className="w-4 h-4 text-green-400 mt-0.5" />
                      <h4 className="text-white font-medium">{opp.opportunity}</h4>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{opp.potential_value}</p>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Next Action:</div>
                      <p className="text-sm text-white">{opp.next_action}</p>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="gaps" className="space-y-3 mt-4">
                {analysis.network_gaps?.map((gap, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-red-500/10 rounded-lg p-4 border border-red-500/30"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                      <h4 className="text-white font-medium">{gap.gap_area}</h4>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{gap.impact}</p>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Recommendation:</div>
                      <p className="text-sm text-white">{gap.recommendation}</p>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>

            {/* Key Insights */}
            {analysis.key_insights && analysis.key_insights.length > 0 && (
              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Key Insights
                </h4>
                <ul className="space-y-2">
                  {analysis.key_insights.map((insight, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}