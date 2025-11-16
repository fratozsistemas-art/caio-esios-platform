import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, X, Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function RelationshipSuggestions({ selectedNode, onClose, onRelationshipCreated }) {
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['relationship_suggestions', selectedNode.id],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('suggestRelationships', {
        entity_id: selectedNode.id,
        entity_type: selectedNode.node_type,
        max_suggestions: 10,
        confidence_threshold: 60
      });
      return data;
    }
  });

  const createRelationshipMutation = useMutation({
    mutationFn: async (suggestion) => {
      await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
        from_node_id: selectedNode.id,
        to_node_id: suggestion.candidate_id,
        relationship_type: suggestion.relationship_type,
        properties: {
          confidence: suggestion.confidence,
          reasoning: suggestion.reasoning,
          strength: suggestion.strength,
          ai_suggested: true,
          created_at: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge_graph_relationships']);
      onRelationshipCreated();
      toast.success("Relationship created");
    }
  });

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'bg-green-500/20 text-green-400';
    if (confidence >= 60) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-orange-500/20 text-orange-400';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
      >
        <Card className="bg-slate-900 border-purple-500/30">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Relationship Suggestions
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              For: <span className="text-white font-medium">{selectedNode.label}</span>
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            ) : suggestions?.suggestions?.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {suggestions.suggestions.map((suggestion, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-white font-medium">{suggestion.candidate_name}</p>
                          <Badge className={getConfidenceColor(suggestion.confidence)}>
                            {suggestion.confidence}% confident
                          </Badge>
                          <Badge variant="outline" className="border-white/20 text-slate-300">
                            {suggestion.relationship_type}
                          </Badge>
                        </div>

                        <p className="text-sm text-slate-300 mb-2">{suggestion.reasoning}</p>

                        {suggestion.evidence?.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400">Evidence:</p>
                            {suggestion.evidence.map((evidence, i) => (
                              <p key={i} className="text-xs text-slate-500">• {evidence}</p>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <TrendingUp className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400">
                            Strength: {suggestion.strength}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => createRelationshipMutation.mutate(suggestion)}
                        disabled={createRelationshipMutation.isPending}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {createRelationshipMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No relationship suggestions found</p>
                <p className="text-sm text-slate-500 mt-1">
                  Try adding more entities to the network
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}