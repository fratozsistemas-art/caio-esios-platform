import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, TrendingUp, CheckCircle, AlertCircle, Clock, 
  Target, Brain, Search, Plus, Sparkles, BarChart3,
  LineChart, GitCompare, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PatternEvolutionChart from "@/components/behavioral/PatternEvolutionChart";
import ClientComparison from "@/components/behavioral/ClientComparison";
import ArchetypeAnalytics from "@/components/behavioral/ArchetypeAnalytics";

export default function BehavioralIntelligence() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Fetch behavioral profiles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['behavioralProfiles'],
    queryFn: () => base44.entities.BehavioralProfile.list('-updated_date'),
    initialData: [],
  });

  // Fetch client archetypes
  const { data: archetypes = [], isLoading: archetypesLoading } = useQuery({
    queryKey: ['clientArchetypes'],
    queryFn: () => base44.entities.ClientArchetype.filter({ is_active: true }),
    initialData: [],
  });

  // Fetch all engagement records
  const { data: allEngagements = [], isLoading: engagementsLoading } = useQuery({
    queryKey: ['engagementRecords'],
    queryFn: () => base44.entities.EngagementRecord.list('-created_date'),
    initialData: [],
  });

  // Filter profiles
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchQuery || 
      profile.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.organization_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || profile.archetype_validation_status === filterStatus;
    const matchesStage = filterStage === "all" || profile.company_stage === filterStage;

    return matchesSearch && matchesStatus && matchesStage;
  });

  // Calculate stats
  const stats = {
    total: profiles.length,
    validated: profiles.filter(p => p.archetype_validation_status === 'VALIDATED' || p.archetype_validation_status === 'MATURE').length,
    avgConfidence: profiles.length > 0 
      ? Math.round(profiles.reduce((sum, p) => sum + (p.overall_confidence || 50), 0) / profiles.length)
      : 0,
    totalEngagements: profiles.reduce((sum, p) => sum + (p.total_engagements || 0), 0)
  };

  // Status configuration
  const statusConfig = {
    HYPOTHESIS: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Hypothesis', icon: Clock },
    EMERGING: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Emerging', icon: TrendingUp },
    VALIDATED: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Validated', icon: CheckCircle },
    MATURE: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Mature', icon: Sparkles }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getArchetypeName = (archetypeId) => {
    const archetype = archetypes.find(a => a.archetype_id === archetypeId);
    return archetype?.archetype_name || 'Unknown';
  };

  const getDaysSince = (dateString) => {
    if (!dateString) return null;
    return Math.floor((Date.now() - new Date(dateString)) / (1000 * 60 * 60 * 24));
  };

  // Get engagements for selected profile
  const selectedProfileEngagements = selectedProfile 
    ? allEngagements.filter(e => e.behavioral_profile_id === selectedProfile.id)
    : [];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-blue-400" />
            Behavioral Intelligence
          </h1>
          <p className="text-slate-400">
            Client behavioral profiles with longitudinal confidence tracking
          </p>
        </div>
        <Link to={createPageUrl("Chat")}>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            New Client Profile
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Profiles</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Validated</p>
                <p className="text-3xl font-bold text-green-400">{stats.validated}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Avg Confidence</p>
                <p className={`text-3xl font-bold ${getConfidenceColor(stats.avgConfidence)}`}>
                  {stats.avgConfidence}%
                </p>
              </div>
              <Target className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Engagements</p>
                <p className="text-3xl font-bold text-orange-400">{stats.totalEngagements}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="bg-white/5 border-white/10 grid w-full grid-cols-4">
          <TabsTrigger value="profiles" className="data-[state=active]:bg-blue-500/20">
            <Users className="w-4 h-4 mr-2" />
            Profiles
          </TabsTrigger>
          <TabsTrigger value="evolution" className="data-[state=active]:bg-blue-500/20">
            <LineChart className="w-4 h-4 mr-2" />
            Evolution
          </TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-blue-500/20">
            <GitCompare className="w-4 h-4 mr-2" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-500/20">
            <Award className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Profiles Tab */}
        <TabsContent value="profiles" className="space-y-6">
          {/* Filters */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search clients..."
                    className="pl-10 bg-white/5 border-white/10 text-white"
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="HYPOTHESIS">Hypothesis</SelectItem>
                    <SelectItem value="EMERGING">Emerging</SelectItem>
                    <SelectItem value="VALIDATED">Validated</SelectItem>
                    <SelectItem value="MATURE">Mature</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStage} onValueChange={setFilterStage}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="All Stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="mature">Mature</SelectItem>
                    <SelectItem value="transformation">Transformation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Archetype Library */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Archetype Library</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {archetypes.map((archetype) => (
                <Card key={archetype.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-400" />
                      {archetype.archetype_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 mb-4 line-clamp-2">{archetype.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                        {archetype.category}
                      </Badge>
                      {archetype.typical_stages?.slice(0, 2).map((stage, idx) => (
                        <Badge key={idx} variant="outline" className="border-white/20 text-slate-300 text-xs">
                          {stage}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-slate-400">
                      {archetype.defining_behaviors?.length || 0} defining behaviors
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Client Profiles */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Client Behavioral Profiles</h2>
            
            {profilesLoading ? (
              <div className="text-center py-8">
                <p className="text-slate-400">Loading profiles...</p>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">
                    {searchQuery || filterStatus !== 'all' || filterStage !== 'all'
                      ? 'No profiles match your filters'
                      : 'No client profiles yet'}
                  </p>
                  <Link to={createPageUrl("Chat")}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence>
                  {filteredProfiles.map((profile, idx) => {
                    const status = statusConfig[profile.archetype_validation_status] || statusConfig.HYPOTHESIS;
                    const StatusIcon = status.icon;
                    const daysSinceLastEngagement = getDaysSince(profile.last_engagement_date);

                    return (
                      <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              {/* Left: Client Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                    <Users className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-white truncate">
                                      {profile.client_name}
                                    </h3>
                                    <p className="text-sm text-slate-400 truncate">
                                      {profile.organization_name}
                                    </p>
                                  </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                  <Badge className={status.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {status.label}
                                  </Badge>
                                  <Badge className="bg-purple-500/20 text-purple-400">
                                    {profile.industry}
                                  </Badge>
                                  <Badge variant="outline" className="border-white/20 text-slate-300">
                                    {profile.company_stage}
                                  </Badge>
                                  {profile.primary_archetype_id && (
                                    <Badge className="bg-blue-500/20 text-blue-400">
                                      {getArchetypeName(profile.primary_archetype_id)}
                                    </Badge>
                                  )}
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">Engagements</p>
                                    <p className="text-xl font-bold text-white">{profile.total_engagements || 0}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">Confidence</p>
                                    <p className={`text-xl font-bold ${getConfidenceColor(profile.overall_confidence || 50)}`}>
                                      {profile.overall_confidence || 50}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">Consistency</p>
                                    <p className="text-xl font-bold text-blue-400">
                                      {profile.behavioral_consistency || 100}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">Last Engagement</p>
                                    <p className="text-sm text-slate-400">
                                      {daysSinceLastEngagement !== null ? `${daysSinceLastEngagement}d ago` : 'Never'}
                                    </p>
                                  </div>
                                </div>

                                {/* Alerts */}
                                {daysSinceLastEngagement > 180 && (
                                  <div className="mt-4 flex items-center gap-2 text-xs text-yellow-400">
                                    <AlertCircle className="w-4 h-4" />
                                    Pattern drift risk - Re-validation recommended
                                  </div>
                                )}
                              </div>

                              {/* Right: Actions */}
                              <div className="flex flex-col gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedProfile(profile)}
                                  className="border-white/20 text-white hover:bg-white/5"
                                >
                                  View Evolution
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                >
                                  New Engagement
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Evolution Tab */}
        <TabsContent value="evolution" className="space-y-6">
          {selectedProfile && selectedProfileEngagements.length > 0 ? (
            <PatternEvolutionChart 
              profile={selectedProfile}
              engagements={selectedProfileEngagements}
            />
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center">
                <LineChart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">
                  {selectedProfile 
                    ? 'No engagement records found for this profile'
                    : 'Select a client profile to view pattern evolution'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Profile Selector */}
          {profiles.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Select Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3">
                  {profiles.slice(0, 6).map((profile) => (
                    <Button
                      key={profile.id}
                      variant={selectedProfile?.id === profile.id ? "default" : "outline"}
                      className={selectedProfile?.id === profile.id 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "border-white/20 hover:bg-white/5"}
                      onClick={() => setSelectedProfile(profile)}
                    >
                      {profile.client_name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <ClientComparison profiles={profiles} archetypes={archetypes} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <ArchetypeAnalytics 
            profiles={profiles}
            engagements={allEngagements}
            archetypes={archetypes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}