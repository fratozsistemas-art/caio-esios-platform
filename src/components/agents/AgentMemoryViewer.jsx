import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Brain, Search, TrendingUp, Lightbulb, Target, 
  AlertCircle, CheckCircle, Network, Trash2, Filter
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AgentMemoryViewer({ agentName = "caio_agent" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['agent_memories', agentName, typeFilter],
    queryFn: async () => {
      const filter = { agent_name: agentName };
      if (typeFilter !== 'all') {
        filter.memory_type = typeFilter;
      }
      return base44.entities.AgentMemory.filter(filter, '-created_date', 50);
    }
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: (memoryId) => base44.asServiceRole.entities.AgentMemory.delete(memoryId),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent_memories']);
      toast.success("Memory deleted");
    }
  });

  const filteredMemories = memories.filter(m => 
    !searchTerm || 
    m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTypeIcon = (type) => {
    const icons = {
      interaction: Brain,
      insight: Lightbulb,
      pattern: TrendingUp,
      preference: Target,
      strategy: Target,
      failure: AlertCircle,
      success: CheckCircle,
      entity_relationship: Network,
      behavioral_learning: Brain
    };
    return icons[type] || Brain;
  };

  const getTypeColor = (type) => {
    const colors = {
      interaction: 'bg-blue-500/20 text-blue-400',
      insight: 'bg-yellow-500/20 text-yellow-400',
      pattern: 'bg-purple-500/20 text-purple-400',
      preference: 'bg-green-500/20 text-green-400',
      strategy: 'bg-orange-500/20 text-orange-400',
      failure: 'bg-red-500/20 text-red-400',
      success: 'bg-green-500/20 text-green-400',
      entity_relationship: 'bg-cyan-500/20 text-cyan-400',
      behavioral_learning: 'bg-pink-500/20 text-pink-400'
    };
    return colors[type] || 'bg-slate-500/20 text-slate-400';
  };

  const memoryTypes = [...new Set(memories.map(m => m.memory_type))];

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Agent Memory System
        </CardTitle>
        <p className="text-sm text-slate-400">
          Long-term learnings and context retention for {agentName}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search memories..."
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {memoryTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-slate-400">Total Memories</p>
            <p className="text-2xl font-bold text-white">{memories.length}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-slate-400">Insights</p>
            <p className="text-2xl font-bold text-white">
              {memories.filter(m => m.memory_type === 'insight').length}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-slate-400">Patterns</p>
            <p className="text-2xl font-bold text-white">
              {memories.filter(m => m.memory_type === 'pattern').length}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-slate-400">Avg Relevance</p>
            <p className="text-2xl font-bold text-white">
              {memories.length > 0 
                ? Math.round(memories.reduce((acc, m) => acc + (m.relevance_score || 0), 0) / memories.length)
                : 0}
            </p>
          </div>
        </div>

        {/* Memories List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredMemories.map((memory, idx) => {
              const Icon = getTypeIcon(memory.memory_type);
              
              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeColor(memory.memory_type)}>
                          <Icon className="w-3 h-3 mr-1" />
                          {memory.memory_type}
                        </Badge>
                        <Badge variant="outline" className="border-white/20 text-slate-400 text-xs">
                          {memory.relevance_score}% relevant
                        </Badge>
                        {memory.confidence && (
                          <Badge variant="outline" className="border-white/20 text-slate-400 text-xs">
                            {memory.confidence}% confidence
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-white mb-2">{memory.content}</p>
                      
                      {memory.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {memory.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="border-white/10 text-slate-400 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{new Date(memory.created_date).toLocaleDateString()}</span>
                        {memory.access_count > 0 && (
                          <span>• Accessed {memory.access_count}x</span>
                        )}
                        {memory.context?.intent && (
                          <span>• {memory.context.intent}</span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMemoryMutation.mutate(memory.id)}
                      className="text-red-400 hover:text-red-300 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filteredMemories.length === 0 && !isLoading && (
            <div className="text-center py-8 text-slate-400">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No memories found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}