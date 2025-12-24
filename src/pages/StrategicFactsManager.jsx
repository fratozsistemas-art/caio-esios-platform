import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Upload, FileText, CheckCircle, AlertTriangle, Search, Filter, Plus, Sparkles, TrendingUp, Lightbulb, Network } from 'lucide-react';
import { toast } from 'sonner';
import StrategicFactsGraph from '../components/facts/StrategicFactsGraph';

const statusColors = {
  confirmed_external: 'bg-green-500/20 text-green-400 border-green-500/30',
  confirmed_internal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  hypothesis: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  needs_review: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  deprecated: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function StrategicFactsManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [importData, setImportData] = useState('');

  const { data: facts = [], isLoading, refetch } = useQuery({
    queryKey: ['strategic-facts'],
    queryFn: () => base44.entities.StrategicFact.list('-created_date')
  });

  const { data: narratives = [] } = useQuery({
    queryKey: ['narratives'],
    queryFn: () => base44.entities.Narrative.list('-created_date')
  });

  const { data: suggestions } = useQuery({
    queryKey: ['narrative-suggestions'],
    queryFn: async () => {
      const response = await base44.functions.invoke('suggestNarrativeAngles', {});
      return response.data;
    },
    staleTime: 30 * 60 * 1000 // 30 minutes
  });

  const filteredFacts = facts.filter(fact => {
    const matchesSearch = 
      fact.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fact.topic_label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fact.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || fact.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleImport = async () => {
    try {
      const parsed = JSON.parse(importData);
      const response = await base44.functions.invoke('importStrategicFacts', parsed);
      
      if (response.data.success) {
        toast.success(`Imported ${response.data.imported_count} facts`);
        refetch();
        setImportData('');
      } else {
        toast.error('Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Invalid JSON format');
    }
  };

  const handleValidateNarrative = async (narrativeId) => {
    try {
      const response = await base44.functions.invoke('validateNarrativeAgainstFacts', {
        narrative_id: narrativeId
      });
      
      if (response.data.success) {
        toast.success(`Validation complete: ${response.data.validation_status}`);
      }
    } catch (error) {
      toast.error('Validation failed');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Database className="w-8 h-8 text-cyan-400" />
            Strategic Facts Manager
          </h1>
          <p className="text-slate-400">Source of Truth for Troyjo Digital Twin</p>
        </div>
      </div>

      <Tabs defaultValue="facts">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="facts">Facts Database</TabsTrigger>
          <TabsTrigger value="graph">Knowledge Graph</TabsTrigger>
          <TabsTrigger value="narratives">Narratives</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
        </TabsList>

        <TabsContent value="facts" className="space-y-4 mt-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search facts by topic, summary, or tags..."
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white rounded px-3"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed_external">Confirmed External</option>
                  <option value="confirmed_internal">Confirmed Internal</option>
                  <option value="hypothesis">Hypothesis</option>
                  <option value="needs_review">Needs Review</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>

              <div className="grid gap-4">
                {filteredFacts.map(fact => (
                  <Card key={fact.id} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg">
                            {fact.topic_label}
                          </CardTitle>
                          <p className="text-sm text-slate-400 mt-1">{fact.dimension}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[fact.status]}>
                            {fact.status}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-400">
                            v{fact.version}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-white text-sm">{fact.summary}</p>
                      <div className="text-xs text-slate-400 space-y-1">
                        <div>Confidence: {(fact.confidence * 100).toFixed(0)}%</div>
                        <div>Source: {fact.source_type}</div>
                        {fact.start_date && <div>Date: {fact.start_date}</div>}
                      </div>
                      {fact.tags && fact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {fact.tags.map((tag, idx) => (
                            <Badge key={idx} className="bg-purple-500/20 text-purple-400 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graph" className="space-y-4 mt-4">
          <StrategicFactsGraph facts={facts} />
        </TabsContent>

        <TabsContent value="narratives" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {narratives.map(narrative => (
              <Card key={narrative.id} className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white">{narrative.title}</CardTitle>
                      <p className="text-sm text-slate-400 mt-1">
                        by {narrative.author} • {narrative.publish_date}
                      </p>
                    </div>
                    <Badge className={
                      narrative.validation_status === 'valid' 
                        ? 'bg-green-500/20 text-green-400'
                        : narrative.validation_status === 'has_deprecated_facts'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }>
                      {narrative.validation_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-slate-300">
                    References {narrative.fact_ids?.length || 0} facts
                  </div>
                  {narrative.deprecated_facts_detected?.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                      <p className="text-red-400 text-sm font-semibold mb-2">
                        Deprecated Facts Detected:
                      </p>
                      {narrative.deprecated_facts_detected.map((df, idx) => (
                        <div key={idx} className="text-xs text-red-300">
                          • {df.topic} ({df.detected_at})
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleValidateNarrative(narrative.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Validate Against Current Facts
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4 mt-4">
          {suggestions && (
            <>
              <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Emerging Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Trending Topics</p>
                      <div className="space-y-1">
                        {suggestions.trending_topics?.slice(0, 5).map((t, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-white">{t.topic}</span>
                            <Badge className="bg-blue-500/20 text-blue-400">{t.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Trending Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestions.trending_tags?.slice(0, 8).map((t, idx) => (
                          <Badge key={idx} className="bg-purple-500/20 text-purple-400 text-xs">
                            {t.tag} ({t.count})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-purple-500/20">
                    <p className="text-sm text-slate-400 mb-2">Recent Updates</p>
                    <p className="text-white text-2xl font-bold">{suggestions.recent_updates_count}</p>
                    <p className="text-xs text-slate-400">facts updated in last 3 months</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    AI-Suggested Narrative Angles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestions.narrative_suggestions?.map((sug, idx) => (
                    <Card key={idx} className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg">{sug.title}</CardTitle>
                            <p className="text-sm text-slate-400 mt-1">{sug.narrative_type}</p>
                          </div>
                          <Badge className={
                            sug.urgency_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                            sug.urgency_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            sug.urgency_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }>
                            {sug.urgency_level}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-slate-300">{sug.rationale}</p>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-slate-400 mb-1">Target Audience:</p>
                            <p className="text-white">{sug.target_audience}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 mb-1">Research Time:</p>
                            <p className="text-white">{sug.estimated_research_time}</p>
                          </div>
                        </div>

                        {sug.key_topics && sug.key_topics.length > 0 && (
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Key Topics:</p>
                            <div className="flex flex-wrap gap-1">
                              {sug.key_topics.map((topic, i) => (
                                <Badge key={i} className="bg-cyan-500/20 text-cyan-400 text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                          <p className="text-xs text-green-400 font-semibold mb-1">Expected Impact:</p>
                          <p className="text-xs text-green-300">{sug.expected_impact}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {suggestions.emerging_themes && suggestions.emerging_themes.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      Emerging Themes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {suggestions.emerging_themes.map((theme, idx) => (
                      <div key={idx} className="bg-slate-800 border border-slate-700 rounded p-3">
                        <h4 className="text-white font-semibold mb-1">{theme.theme}</h4>
                        <p className="text-sm text-slate-400 mb-2">{theme.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {theme.related_topics?.map((topic, i) => (
                            <Badge key={i} className="bg-purple-500/20 text-purple-400 text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-4 mt-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Import Strategic Facts (JSON)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder='Paste JSON: { "facts": [...] }'
                className="h-96 bg-slate-800 border-slate-700 text-white font-mono text-sm"
              />
              <Button
                onClick={handleImport}
                disabled={!importData}
                className="bg-green-600 hover:bg-green-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Facts
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}