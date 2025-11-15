import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Play, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AutoGraphBuilder() {
  const queryClient = useQueryClient();
  const [lastRun, setLastRun] = useState(null);

  const runBuilderMutation = useMutation({
    mutationFn: () => base44.functions.invoke('runAutomatedGraphBuilder'),
    onSuccess: (response) => {
      const stats = response.data?.stats;
      setLastRun(stats);
      toast.success(`Graph updated! ${stats.nodes_created} nodes, ${stats.relationships_created} relationships created`);
      queryClient.invalidateQueries(['graphStats']);
      queryClient.invalidateQueries(['dataSources']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.details || 'Builder failed');
    }
  });

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI Graph Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-300">
          Automatically ingest data from connected sources and build knowledge graph with AI
        </p>

        <Button
          onClick={() => runBuilderMutation.mutate()}
          disabled={runBuilderMutation.isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {runBuilderMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Building Graph...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run AI Builder Now
            </>
          )}
        </Button>

        {lastRun && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-lg p-4 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Last Run Results</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-400">Items Processed</div>
                <div className="text-lg font-bold text-white">{lastRun.items_ingested}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Sources</div>
                <div className="text-lg font-bold text-white">{lastRun.sources_processed}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Nodes Created</div>
                <div className="text-lg font-bold text-purple-400">{lastRun.nodes_created}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Relationships</div>
                <div className="text-lg font-bold text-blue-400">{lastRun.relationships_created}</div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
          <p className="text-xs text-blue-300">
            💡 The AI agent analyzes content, extracts entities (companies, people, technologies), 
            and automatically creates graph nodes and relationships.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}