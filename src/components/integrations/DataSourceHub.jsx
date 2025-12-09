import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  HardDrive, TrendingUp, Globe, Twitter, Linkedin, 
  Newspaper, DollarSign, BarChart3, Loader2, CheckCircle,
  AlertCircle, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const DATA_SOURCES = [
  {
    id: 'finnhub',
    name: 'Finnhub',
    icon: DollarSign,
    color: 'text-green-400',
    description: 'Real-time stock data and company financials',
    capabilities: ['Stock quotes', 'Company profiles', 'Financial news'],
    envVar: 'FINNHUB_API_KEY'
  },
  {
    id: 'alpha_vantage',
    name: 'Alpha Vantage',
    icon: BarChart3,
    color: 'text-blue-400',
    description: 'Market data and technical indicators',
    capabilities: ['Market quotes', 'Company overview', 'Technical analysis'],
    envVar: 'ALPHA_VANTAGE_API_KEY'
  },
  {
    id: 'news_api',
    name: 'News API',
    icon: Newspaper,
    color: 'text-orange-400',
    description: 'Global news and sentiment analysis',
    capabilities: ['News articles', 'Sentiment analysis', 'Trending topics'],
    envVar: 'NEWS_API_KEY'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: 'text-sky-400',
    description: 'Social media monitoring and trends',
    capabilities: ['Tweet monitoring', 'Engagement metrics', 'Influencer tracking'],
    envVar: 'TWITTER_BEARER_TOKEN'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-600',
    description: 'Professional network insights',
    capabilities: ['Company data', 'Employee insights', 'Job postings'],
    envVar: 'LINKEDIN_CLIENT_ID'
  },
  {
    id: 'web_intelligence',
    name: 'Web Intelligence',
    icon: Globe,
    color: 'text-purple-400',
    description: 'AI-powered web scraping and analysis',
    capabilities: ['Company research', 'Market analysis', 'Competitive intelligence'],
    envVar: null // Uses LLM with internet context
  }
];

export default function DataSourceHub({ selectedEntity }) {
  const [enriching, setEnriching] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState(false);
  const [selectedSources, setSelectedSources] = useState(['all']);
  const queryClient = useQueryClient();

  const enrichMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('multiSourceEnrichment', {
        entity_id: selectedEntity?.id,
        entity_name: selectedEntity?.label,
        entity_type: selectedEntity?.node_type,
        sources: selectedSources
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Enriched from ${data.sources_available} sources`);
      queryClient.invalidateQueries(['knowledge_graph_nodes']);
      setEnriching(false);
    },
    onError: () => {
      setEnriching(false);
    }
  });

  const monitorMutation = useMutation({
    mutationFn: async (keywords) => {
      const { data } = await base44.functions.invoke('socialMediaMonitoring', {
        keywords: keywords,
        entities: selectedEntity ? [selectedEntity] : [],
        time_range: '24h'
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Monitored ${data.platforms_monitored} platforms`);
      setMonitoring(false);
    },
    onError: () => {
      setMonitoring(false);
    }
  });

  const marketIntelMutation = useMutation({
    mutationFn: async (params) => {
      const { data } = await base44.functions.invoke('marketIntelligenceAggregator', params);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Generated ${data.insights_generated} intelligence reports`);
      setMarketAnalysis(false);
    },
    onError: () => {
      setMarketAnalysis(false);
    }
  });

  const toggleSource = (sourceId) => {
    if (sourceId === 'all') {
      setSelectedSources(['all']);
    } else {
      const current = selectedSources.filter(s => s !== 'all');
      if (current.includes(sourceId)) {
        const updated = current.filter(s => s !== sourceId);
        setSelectedSources(updated.length > 0 ? updated : ['all']);
      } else {
        setSelectedSources([...current, sourceId]);
      }
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-400" />
          External Data Sources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Sources Grid */}
        <div className="grid grid-cols-2 gap-3">
          {DATA_SOURCES.map((source) => {
            const Icon = source.icon;
            const isSelected = selectedSources.includes('all') || selectedSources.includes(source.id);
            
            return (
              <div
                key={source.id}
                onClick={() => toggleSource(source.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-white/10 border-blue-500/30' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-4 h-4 ${source.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{source.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{source.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        {selectedEntity && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <p className="text-xs text-slate-400">Quick Actions for: {selectedEntity.label}</p>
            
            <Button
              onClick={() => {
                setEnriching(true);
                enrichMutation.mutate();
              }}
              disabled={enriching}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {enriching ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Enrich from Selected Sources
            </Button>

            <Button
              onClick={() => {
                setMonitoring(true);
                monitorMutation.mutate([selectedEntity.label]);
              }}
              disabled={monitoring}
              variant="outline"
              className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              {monitoring ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Twitter className="w-4 h-4 mr-2" />
              )}
              Monitor Social Media
            </Button>
          </div>
        )}

        {/* Market Intelligence */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-slate-400 mb-3">Market Intelligence</p>
          <Button
            onClick={() => {
              setMarketAnalysis(true);
              marketIntelMutation.mutate({
                industry: selectedEntity?.properties?.industry || 'Technology',
                companies: [selectedEntity?.label],
                analysis_type: 'comprehensive'
              });
            }}
            disabled={marketAnalysis || !selectedEntity}
            variant="outline"
            className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            {marketAnalysis ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4 mr-2" />
            )}
            Generate Market Report
          </Button>
        </div>

        {/* Status */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-slate-400 mb-2">Available Sources:</p>
          <div className="flex flex-wrap gap-2">
            {DATA_SOURCES.map(source => (
              <Badge
                key={source.id}
                variant="outline"
                className="border-white/20 text-slate-300 text-xs"
              >
                {source.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}