import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Plus, Loader2, CheckCircle, AlertCircle, 
  TrendingUp, Network, GitBranch 
} from 'lucide-react';
import { toast } from 'sonner';

const INFERENCE_METHODS = {
  contextual: { icon: Network, color: 'text-blue-400', label: 'Contextual' },
  industry_pattern: { icon: TrendingUp, color: 'text-green-400', label: 'Industry Pattern' },
  temporal: { icon: AlertCircle, color: 'text-yellow-400', label: 'Temporal' },
  property_similarity: { icon: CheckCircle, color: 'text-purple-400', label: 'Similarity' },
  external_knowledge: { icon: Brain, color: 'text-pink-400', label: 'External' },
  transitive: { icon: GitBranch, color: 'text-cyan-400', label: 'Transitive' }
};

export default function RelationshipInferencePanel({ selectedNodeId }) {
  const [inferenceDepth, setInferenceDepth] = useState('standard');
  const queryClient = useQueryClient();

  const { data: inference, isLoading, refetch } = useQuery({
    queryKey: ['relationship_inference', selectedNodeId, inferenceDepth],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('inferGraphRelationships', {
        source_node_id: selectedNodeId,
        inference_depth: inferenceDepth,
        use_external_data: true
      });
      return data;
    },
    enabled: !!selectedNodeId
  });

  const createRelationshipMutation = useMutation({
    mutationFn: async (rel) => {
      return await base44.entities.KnowledgeGraphRelationship.create({
        from_node_id: rel.from_node_id,
        to_node_id: rel.to_node_id,
        relationship_type: rel.relationship_type,
        properties: {
          ai_inferred: true,
          confidence: rel.confidence,
          reasoning: rel.reasoning,
          inference_method: rel.inference_method,
          supporting_evidence: rel.supporting_evidence
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge_graph_relationships']);
      toast.success('Relationship created');
      refetch();
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Inferring relationships...</p>
        </CardContent>
      </Card>
    );
  }

  if (!inference || !inference.inferred_relationships?.length) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            Relationship Inference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm text-center">
            No inferred relationships found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Relationship Inference
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {inference.inferred_relationships.length} found
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Insights */}
        {inference.network_insights && (
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <h4 className="text-xs font-medium text-slate-400 mb-2">Network Analysis</h4>
            <p className="text-xs text-slate-300">{inference.network_insights.centrality_analysis}</p>
            {inference.network_insights.recommended_expansions?.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-slate-400">Recommended expansions:</p>
                {inference.network_insights.recommended_expansions.map((exp, idx) => (
                  <p key={idx} className="text-xs text-blue-400">• {exp}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inferred Relationships */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-slate-400">Inferred Connections</h4>
          {inference.inferred_relationships
            .filter(rel => rel.can_create)
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 8)
            .map((rel, idx) => {
              const method = INFERENCE_METHODS[rel.inference_method];
              const MethodIcon = method?.icon || Brain;

              return (
                <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MethodIcon className={`w-3 h-3 ${method?.color}`} />
                        <span className="text-xs text-slate-400">{method?.label}</span>
                      </div>
                      <p className="text-sm text-white">
                        <span className="font-medium">{rel.from_node_label}</span>
                        {' → '}
                        <span className="text-purple-400">{rel.relationship_type}</span>
                        {' → '}
                        <span className="font-medium">{rel.to_node_label}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{rel.reasoning}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${
                        rel.confidence >= 0.8 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        rel.confidence >= 0.6 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      }`}>
                        {Math.round(rel.confidence * 100)}%
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => createRelationshipMutation.mutate(rel)}
                        disabled={createRelationshipMutation.isPending}
                        className="h-7 w-7 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {rel.supporting_evidence?.length > 0 && (
                    <div className="mt-2 pl-5 border-l-2 border-purple-500/30">
                      <p className="text-xs text-slate-500 mb-1">Evidence:</p>
                      {rel.supporting_evidence.slice(0, 2).map((evidence, i) => (
                        <p key={i} className="text-xs text-slate-400">• {evidence}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Patterns */}
        {inference.indirect_patterns?.length > 0 && (
          <div className="border-t border-white/10 pt-3">
            <h4 className="text-xs font-medium text-slate-400 mb-2">Detected Patterns</h4>
            <div className="space-y-2">
              {inference.indirect_patterns.slice(0, 3).map((pattern, idx) => (
                <div key={idx} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
                  <p className="text-xs font-medium text-blue-400">{pattern.pattern_type}</p>
                  <p className="text-xs text-slate-300 mt-1">{pattern.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <Brain className="w-4 h-4 mr-2" />
          Re-analyze
        </Button>
      </CardContent>
    </Card>
  );
}