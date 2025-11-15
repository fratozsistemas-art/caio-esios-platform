import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  GitBranch, Users, TrendingUp, Loader2, Award, Network as NetworkIcon
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function GraphAlgorithmsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const algorithms = [
    {
      type: 'centrality',
      title: 'Centrality Analysis',
      description: 'Identify most influential nodes',
      icon: Award
    },
    {
      type: 'communities',
      title: 'Community Detection',
      description: 'Find clusters and groups',
      icon: Users
    },
    {
      type: 'paths',
      title: 'Path Analysis',
      description: 'Discover connections',
      icon: GitBranch
    }
  ];

  const handleAnalyze = async (algorithmType) => {
    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('analyzeGraphAlgorithms', {
        algorithm_type: algorithmType
      });

      if (response.data?.success) {
        setResults(response.data.algorithm_results);
        toast.success('Analysis complete!');
      }
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
          <NetworkIcon className="w-4 h-4 mr-2" />
          Graph Algorithms
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <NetworkIcon className="w-6 h-6 text-blue-400" />
            Advanced Graph Algorithms
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Algorithm Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {algorithms.map((algo) => {
              const Icon = algo.icon;
              return (
                <button
                  key={algo.type}
                  onClick={() => handleAnalyze(algo.type)}
                  disabled={isAnalyzing}
                  className="text-left bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium mb-1">{algo.title}</div>
                      <div className="text-xs text-slate-400">{algo.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Loading */}
          {isAnalyzing && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-slate-400">Running algorithms...</span>
            </div>
          )}

          {/* Results */}
          {results && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Centrality Results */}
              {results.centrality && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      Most Influential Nodes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {results.centrality.top_influential_nodes?.map((node, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                        <div>
                          <div className="text-white font-medium">{node.node?.label}</div>
                          <div className="text-xs text-slate-400">
                            {node.degree} connections • {node.influence_score.toFixed(1)}% influence
                          </div>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          #{idx + 1}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Community Results */}
              {results.communities && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-400" />
                      Communities Detected: {results.communities.total_communities}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.communities.communities?.slice(0, 5).map((community, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-white font-medium">Community {idx + 1}</div>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            {community.size} nodes
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400">
                          Density: {(community.density * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Path Results */}
              {results.paths && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-purple-400" />
                      Shortest Paths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {results.paths.shortest_paths?.slice(0, 5).map((path, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <span className="text-white">{path.from?.label}</span>
                          <span className="text-purple-400">→</span>
                          <span className="text-white">{path.to?.label}</span>
                          <Badge variant="outline" className="ml-auto border-purple-500/30 text-purple-400">
                            {path.path_length} steps
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}