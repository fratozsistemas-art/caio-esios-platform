import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, AlertTriangle, Link as LinkIcon, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AIGraphSuggestionsPanel({ selectedNodeId, onSuggestionApplied }) {
  const [expandedSections, setExpandedSections] = useState({});
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading, refetch } = useQuery({
    queryKey: ['graph_suggestions', selectedNodeId],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('aiGraphSuggestions', {
        node_id: selectedNodeId
      });
      return data.suggestions;
    },
    enabled: !!selectedNodeId
  });

  const applyRelationshipMutation = useMutation({
    mutationFn: async (suggestion) => {
      // Criar novo relacionamento
      return await base44.entities.KnowledgeGraphRelationship.create({
        from_node_id: suggestion.from_node_id,
        to_node_id: suggestion.to_node_id,
        relationship_type: suggestion.relationship_type,
        properties: {
          ai_suggested: true,
          confidence: suggestion.confidence,
          reasoning: suggestion.reasoning
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge_graph_relationships']);
      toast.success('Relationship created');
      onSuggestionApplied?.();
    }
  });

  const applyNodeMutation = useMutation({
    mutationFn: async (suggestion) => {
      return await base44.entities.KnowledgeGraphNode.create({
        node_type: suggestion.node_type,
        label: suggestion.label,
        properties: {
          ...suggestion.suggested_properties,
          ai_suggested: true,
          importance: suggestion.importance
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge_graph_nodes']);
      toast.success('Node created');
      onSuggestionApplied?.();
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Analyzing graph patterns...</p>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          AI-Powered Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Missing Relationships */}
        {suggestions.missing_relationships?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-blue-400" />
              Missing Relationships ({suggestions.missing_relationships.length})
            </h4>
            <div className="space-y-2">
              {suggestions.missing_relationships.slice(0, 5).map((rel, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        <span className="font-medium">{rel.from_node_label}</span>
                        {' → '}
                        <span className="text-blue-400">{rel.relationship_type}</span>
                        {' → '}
                        <span className="font-medium">{rel.to_node_label}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{rel.reasoning}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {Math.round(rel.confidence * 100)}%
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => applyRelationshipMutation.mutate(rel)}
                        disabled={applyRelationshipMutation.isPending}
                        className="h-7 w-7 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Nodes */}
        {suggestions.new_nodes?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-400" />
              Suggested New Nodes ({suggestions.new_nodes.length})
            </h4>
            <div className="space-y-2">
              {suggestions.new_nodes.slice(0, 5).map((node, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-white">{node.label}</p>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                          {node.node_type}
                        </Badge>
                        <Badge className={`text-xs ${
                          node.importance === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          node.importance === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-green-500/20 text-green-400 border-green-500/30'
                        }`}>
                          {node.importance}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{node.reasoning}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => applyNodeMutation.mutate(node)}
                      disabled={applyNodeMutation.isPending}
                      className="h-7 w-7 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Quality Issues */}
        {suggestions.data_quality_issues?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Data Quality Issues ({suggestions.data_quality_issues.length})
            </h4>
            <div className="space-y-2">
              {suggestions.data_quality_issues.slice(0, 3).map((issue, idx) => (
                <div key={idx} className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{issue.issue_type}</p>
                      <p className="text-xs text-slate-400 mt-1">{issue.description}</p>
                      <Badge className={`mt-2 text-xs ${
                        issue.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                        issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {issue.severity} severity
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={() => refetch()}
          variant="outline"
          className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Refresh Suggestions
        </Button>
      </CardContent>
    </Card>
  );
}