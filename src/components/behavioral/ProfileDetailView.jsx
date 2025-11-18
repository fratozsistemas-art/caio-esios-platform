import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Building2, Briefcase, TrendingUp, Brain, MessageSquare, 
  Target, CheckCircle, Clock, X, Calendar, Mail, Phone, Globe,
  FileText, BarChart3, Activity, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import ArchetypeMatchingResults from './ArchetypeMatchingResults';

export default function ProfileDetailView({ 
  profile, 
  archetype, 
  matchingData,
  engagements = [],
  onClose,
  onApplyMatch
}) {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status) => {
    const colors = {
      HYPOTHESIS: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      EMERGING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      VALIDATED: 'bg-green-500/20 text-green-400 border-green-500/30',
      MATURE: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[status] || colors.HYPOTHESIS;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-6 flex items-start justify-center">
        <div className="w-full max-w-6xl bg-slate-900 rounded-xl border border-white/10 shadow-2xl my-8">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{profile.client_name}</h2>
                <p className="text-slate-400">{profile.organization_name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(profile.archetype_validation_status)}>
                    {profile.archetype_validation_status}
                  </Badge>
                  {archetype && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {archetype.archetype_name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-white/10 px-6">
              <TabsList className="bg-transparent border-0 h-auto p-0">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-3"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="archetype"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-3"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Archetype Analysis
                </TabsTrigger>
                <TabsTrigger 
                  value="patterns"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-3"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Behavioral Patterns
                </TabsTrigger>
                <TabsTrigger 
                  value="engagements"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-3"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Engagements
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-400" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Client Name</p>
                        <p className="text-white font-medium">{profile.client_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Organization</p>
                        <p className="text-white font-medium">{profile.organization_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Industry</p>
                        <p className="text-white font-medium">{profile.industry || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Company Stage</p>
                        <p className="text-white font-medium capitalize">{profile.company_stage || 'N/A'}</p>
                      </div>
                      {profile.revenue_range && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Revenue Range</p>
                          <p className="text-white font-medium">{profile.revenue_range}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Mail className="w-5 h-5 text-purple-400" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {profile.primary_contact_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <p className="text-white text-sm">{profile.primary_contact_email}</p>
                        </div>
                      )}
                      {profile.primary_contact_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <p className="text-white text-sm">{profile.primary_contact_phone}</p>
                        </div>
                      )}
                      {profile.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline">
                            {profile.website}
                          </a>
                        </div>
                      )}
                      {!profile.primary_contact_email && !profile.primary_contact_phone && !profile.website && (
                        <p className="text-slate-500 text-sm italic">No contact information available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Engagement Metrics */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-orange-400" />
                        Engagement Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Total Engagements</span>
                        <span className="text-white font-bold text-lg">{profile.total_engagements || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Overall Confidence</span>
                        <span className="text-green-400 font-bold text-lg">{profile.overall_confidence || 50}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Behavioral Consistency</span>
                        <span className="text-blue-400 font-bold text-lg">{profile.behavioral_consistency || 100}%</span>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-slate-500 mb-1">Last Engagement</p>
                        <p className="text-white text-sm">{formatDate(profile.last_engagement_date)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dates */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Profile Created</p>
                        <p className="text-white text-sm">{formatDate(profile.created_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Last Updated</p>
                        <p className="text-white text-sm">{formatDate(profile.updated_date)}</p>
                      </div>
                      {profile.last_archetype_analysis_date && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Last Archetype Analysis</p>
                          <p className="text-white text-sm">{formatDate(profile.last_archetype_analysis_date)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Notes */}
                {profile.notes && (
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{profile.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Archetype Analysis Tab */}
              <TabsContent value="archetype" className="space-y-6 mt-0">
                {archetype && (
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-400" />
                        {archetype.archetype_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-2">Description</p>
                        <p className="text-white">{archetype.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500/20 text-purple-400">
                          {archetype.category}
                        </Badge>
                        {archetype.typical_stages?.map((stage, idx) => (
                          <Badge key={idx} variant="outline" className="border-white/20 text-slate-300">
                            {stage}
                          </Badge>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-sm text-slate-400 mb-2">Confidence Score</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                              style={{ width: `${profile.archetype_confidence || 0}%` }}
                            />
                          </div>
                          <span className="text-white font-bold text-lg">{profile.archetype_confidence || 0}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {matchingData && (
                  <ArchetypeMatchingResults 
                    matchingData={matchingData}
                    onApplyMatch={onApplyMatch}
                  />
                )}

                {!matchingData && (
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-8 text-center">
                      <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">
                        Click the <Brain className="w-4 h-4 inline mx-1" /> button to run enhanced archetype matching
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Behavioral Patterns Tab */}
              <TabsContent value="patterns" className="space-y-6 mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Communication Patterns */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                        Communication Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile.communication_patterns && Object.keys(profile.communication_patterns).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(profile.communication_patterns).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                              <span className="text-slate-400 text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="text-white font-medium">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm italic">No communication patterns recorded</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Decision Making Patterns */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-400" />
                        Decision Making Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile.decision_making_patterns && Object.keys(profile.decision_making_patterns).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(profile.decision_making_patterns).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                              <span className="text-slate-400 text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="text-white font-medium">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm italic">No decision making patterns recorded</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Validated Patterns */}
                {profile.validated_patterns && profile.validated_patterns.length > 0 && (
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Validated Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.validated_patterns.map((pattern, idx) => (
                          <Badge key={idx} className="bg-green-500/20 text-green-400 border-green-500/30">
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Engagements Tab */}
              <TabsContent value="engagements" className="space-y-4 mt-0">
                {engagements.length > 0 ? (
                  engagements.map((engagement, idx) => (
                    <Card key={idx} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-medium">{engagement.engagement_type}</p>
                            <p className="text-slate-400 text-sm">{formatDate(engagement.created_date)}</p>
                          </div>
                          {engagement.interaction_quality && (
                            <Badge className="bg-blue-500/20 text-blue-400">
                              Quality: {engagement.interaction_quality}%
                            </Badge>
                          )}
                        </div>
                        {engagement.notes && (
                          <p className="text-slate-300 text-sm">{engagement.notes}</p>
                        )}
                        {engagement.observed_behaviors && engagement.observed_behaviors.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {engagement.observed_behaviors.map((behavior, bidx) => (
                              <Badge key={bidx} variant="outline" className="border-white/20 text-slate-300 text-xs">
                                {behavior}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-8 text-center">
                      <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No engagement records found</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}