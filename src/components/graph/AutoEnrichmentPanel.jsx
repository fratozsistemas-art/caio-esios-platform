import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, CheckCircle, X, ExternalLink, Loader2, 
  TrendingUp, AlertCircle, Plus, RefreshCw, Eye
} from 'lucide-react';
import { toast } from 'sonner';

const SOURCE_ICONS = {
  news_api: { icon: TrendingUp, color: 'text-blue-400', label: 'News' },
  finnhub: { icon: TrendingUp, color: 'text-green-400', label: 'Financial' },
  alpha_vantage: { icon: TrendingUp, color: 'text-purple-400', label: 'Market Data' },
  web_search: { icon: Sparkles, color: 'text-cyan-400', label: 'Web Search' },
  llm_analysis: { icon: AlertCircle, color: 'text-orange-400', label: 'AI Analysis' },
  linkedin: { icon: Plus, color: 'text-blue-500', label: 'LinkedIn' }
};

export default function AutoEnrichmentPanel({ selectedNodeId, onRefresh }) {
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['enrichment_suggestions', selectedNodeId],
    queryFn: async () => {
      const data = await base44.entities.EnrichmentSuggestion.filter({
        entity_id: selectedNodeId,
        status: 'pending'
      });
      return data.sort((a, b) => b.confidence_score - a.confidence_score);
    },
    enabled: !!selectedNodeId
  });

  const enrichMutation = useMutation({
    mutationFn: async (depth) => {
      const { data } = await base44.functions.invoke('autoEnrichEntity', {
        entity_id: selectedNodeId,
        enrichment_depth: depth
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['enrichment_suggestions']);
      queryClient.invalidateQueries(['knowledge_graph_nodes']);
      toast.success(`Generated ${data.suggestions.length} enrichment suggestions`);
      if (data.auto_applied > 0) {
        toast.info(`Auto-applied ${data.auto_applied} high-confidence updates`);
      }
      onRefresh?.();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (suggestion) => {
      const user = await base44.auth.me();
      
      // Aplicar a sugestão
      if (suggestion.suggestion_type === 'property_update' || suggestion.suggestion_type === 'new_property') {
        const node = await base44.entities.KnowledgeGraphNode.filter({ id: suggestion.entity_id });
        if (node && node.length > 0) {
          await base44.entities.KnowledgeGraphNode.update(suggestion.entity_id, {
            properties: {
              ...node[0].properties,
              ...suggestion.suggested_data
            }
          });
        }
      } else if (suggestion.suggestion_type === 'new_relationship') {
        // Criar relacionamento
        const nodes = await base44.entities.KnowledgeGraphNode.list();
        const targetNode = nodes.find(n => 
          n.label.toLowerCase().includes(suggestion.suggested_data.target_entity.toLowerCase())
        );
        
        if (targetNode) {
          await base44.entities.KnowledgeGraphRelationship.create({
            from_node_id: suggestion.entity_id,
            to_node_id: targetNode.id,
            relationship_type: suggestion.suggested_data.relationship_type,
            properties: {
              enrichment_source: suggestion.data_source,
              evidence: suggestion.suggested_data.evidence
            }
          });
        }
      }

      // Atualizar status
      await base44.entities.EnrichmentSuggestion.update(suggestion.id, {
        status: 'applied',
        reviewed_by: user.email,
        reviewed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrichment_suggestions']);
      queryClient.invalidateQueries(['knowledge_graph_nodes']);
      queryClient.invalidateQueries(['knowledge_graph_relationships']);
      toast.success('Suggestion applied');
      onRefresh?.();
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (suggestionId) => {
      const user = await base44.auth.me();
      await base44.entities.EnrichmentSuggestion.update(suggestionId, {
        status: 'rejected',
        reviewed_by: user.email,
        reviewed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrichment_suggestions']);
      toast.success('Suggestion rejected');
    }
  });

  if (!selectedNodeId) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 text-center">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Select an entity to view enrichment suggestions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-400" />
            AI Enrichment
          </div>
          {suggestions.length > 0 && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {suggestions.length} suggestions
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Enrichment Triggers */}
        <div className="flex gap-2">
          <Button
            onClick={() => enrichMutation.mutate('standard')}
            disabled={enrichMutation.isPending}
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {enrichMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2">Quick Enrich</span>
          </Button>
          <Button
            onClick={() => enrichMutation.mutate('deep')}
            disabled={enrichMutation.isPending}
            size="sm"
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Deep Search
          </Button>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 text-green-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading suggestions...</p>
          </div>
        )}

        {!isLoading && suggestions.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No pending suggestions</p>
          </div>
        )}

        {/* Suggestions List */}
        <div className="space-y-2">
          {suggestions.map((suggestion) => {
            const source = SOURCE_ICONS[suggestion.data_source];
            const SourceIcon = source?.icon || Sparkles;
            const isExpanded = expandedSuggestion === suggestion.id;

            return (
              <div 
                key={suggestion.id}
                className="bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <SourceIcon className={`w-3 h-3 ${source?.color}`} />
                        <span className="text-xs text-slate-400">{source?.label}</span>
                        <Badge className={`${
                          suggestion.confidence_score >= 90 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          suggestion.confidence_score >= 75 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        }`}>
                          {suggestion.confidence_score}%
                        </Badge>
                      </div>
                      <p className="text-sm text-white font-medium capitalize">
                        {suggestion.suggestion_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{suggestion.reasoning}</p>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-xs text-slate-400 mb-1">Suggested Data:</p>
                        <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                          {JSON.stringify(suggestion.suggested_data, null, 2)}
                        </pre>
                      </div>

                      {suggestion.supporting_evidence?.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Evidence:</p>
                          <ul className="text-xs text-slate-300 space-y-1">
                            {suggestion.supporting_evidence.map((evidence, i) => (
                              <li key={i}>• {evidence}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {suggestion.source_urls?.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Sources:</p>
                          {suggestion.source_urls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {url.substring(0, 50)}...
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedSuggestion(isExpanded ? null : suggestion.id)}
                      className="flex-1 text-slate-400 hover:text-white"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {isExpanded ? 'Hide' : 'View'} Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(suggestion)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectMutation.mutate(suggestion.id)}
                      disabled={rejectMutation.isPending}
                      className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}