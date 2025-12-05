import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Database, CheckCircle, XCircle, Eye, FileText, Brain, Filter,
  Search, Star, Trash2, RefreshCw, Sparkles, Plus, GitBranch,
  History, Download, Upload, ThumbsUp, ThumbsDown, Edit, Check
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const AGENTS = {
  market_monitor: { name: 'Market Monitor', icon: Eye, color: '#3b82f6' },
  strategy_doc_generator: { name: 'Strategy Doc', icon: FileText, color: '#a855f7' },
  knowledge_curator: { name: 'Knowledge Curator', icon: Brain, color: '#10b981' }
};

export default function TrainingDataManager() {
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showAugmentDialog, setShowAugmentDialog] = useState(false);
  const [augmentPrompt, setAugmentPrompt] = useState('');
  const [isAugmenting, setIsAugmenting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch feedback data
  const { data: allFeedback = [], isLoading } = useQuery({
    queryKey: ['training-feedback'],
    queryFn: () => base44.entities.AgentFeedback.list('-created_date', 200)
  });

  // Fetch training sessions for lineage
  const { data: trainingSessions = [] } = useQuery({
    queryKey: ['training-sessions-lineage'],
    queryFn: () => base44.entities.AgentTrainingSession.list('-created_date', 50)
  });

  // Filter feedback
  const filteredFeedback = allFeedback.filter(fb => {
    if (selectedAgent !== 'all' && fb.agent_id !== selectedAgent) return false;
    if (statusFilter === 'approved' && fb.used_in_training !== true) return false;
    if (statusFilter === 'pending' && fb.used_in_training === true) return false;
    if (statusFilter === 'rejected' && fb.used_in_training !== false) return false;
    if (searchQuery && !fb.comment?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Stats
  const stats = {
    total: allFeedback.length,
    approved: allFeedback.filter(f => f.used_in_training === true).length,
    pending: allFeedback.filter(f => f.used_in_training !== true && f.used_in_training !== false).length,
    rejected: allFeedback.filter(f => f.used_in_training === false).length,
    avgRating: allFeedback.length > 0 
      ? (allFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / allFeedback.length).toFixed(1) 
      : 0
  };

  // Approve feedback
  const approveMutation = useMutation({
    mutationFn: async (ids) => {
      for (const id of ids) {
        await base44.entities.AgentFeedback.update(id, { used_in_training: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['training-feedback']);
      setSelectedItems([]);
      toast.success('Feedback approved for training');
    }
  });

  // Reject feedback
  const rejectMutation = useMutation({
    mutationFn: async (ids) => {
      for (const id of ids) {
        await base44.entities.AgentFeedback.update(id, { used_in_training: false });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['training-feedback']);
      setSelectedItems([]);
      toast.success('Feedback rejected');
    }
  });

  // Delete feedback
  const deleteMutation = useMutation({
    mutationFn: async (ids) => {
      for (const id of ids) {
        await base44.entities.AgentFeedback.delete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['training-feedback']);
      setSelectedItems([]);
      toast.success('Feedback deleted');
    }
  });

  // Augment data
  const augmentData = async () => {
    if (!augmentPrompt.trim()) {
      toast.error('Please provide augmentation instructions');
      return;
    }
    
    setIsAugmenting(true);
    try {
      const sampleData = filteredFeedback.slice(0, 10).map(f => ({
        agent_id: f.agent_id,
        feedback_type: f.feedback_type,
        rating: f.rating,
        comment: f.comment,
        agent_output: f.agent_output
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Training Data Augmentation System.

Based on these existing training samples:
${JSON.stringify(sampleData, null, 2)}

User's augmentation request: "${augmentPrompt}"

Generate 5 new synthetic training samples that:
1. Follow the same format as existing data
2. Address the augmentation request
3. Are realistic and diverse
4. Would help improve agent performance

Return JSON:
{
  "synthetic_samples": [
    {
      "agent_id": "market_monitor|strategy_doc_generator|knowledge_curator",
      "feedback_type": "thumbs_up|thumbs_down|rating",
      "rating": 1-5,
      "comment": "synthetic feedback comment",
      "input_context": { "scenario": "description" },
      "agent_output": { "response": "ideal response" }
    }
  ],
  "augmentation_notes": "explanation of what was generated"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            synthetic_samples: { type: "array", items: { type: "object" } },
            augmentation_notes: { type: "string" }
          }
        }
      });

      // Create synthetic feedback entries
      for (const sample of result.synthetic_samples || []) {
        await base44.entities.AgentFeedback.create({
          agent_id: sample.agent_id,
          feedback_type: sample.feedback_type,
          rating: sample.rating,
          comment: `[SYNTHETIC] ${sample.comment}`,
          input_context: sample.input_context,
          agent_output: sample.agent_output,
          used_in_training: false
        });
      }

      queryClient.invalidateQueries(['training-feedback']);
      setShowAugmentDialog(false);
      setAugmentPrompt('');
      toast.success(`Generated ${result.synthetic_samples?.length || 0} synthetic samples`);
    } catch (error) {
      toast.error('Augmentation failed');
    } finally {
      setIsAugmenting(false);
    }
  };

  // Toggle selection
  const toggleSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredFeedback.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredFeedback.map(f => f.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl">Training Data Manager</span>
              <p className="text-sm text-slate-400 font-normal">
                Review, curate & augment agent training data
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <Button size="sm" onClick={() => setShowAugmentDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="w-4 h-4 mr-1" />
                Augment Data
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total Samples', value: stats.total, icon: Database, color: 'blue' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'green' },
          { label: 'Pending Review', value: stats.pending, icon: RefreshCw, color: 'yellow' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red' },
          { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'purple' }
        ].map((stat, i) => (
          <Card key={i} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400 opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="review">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="review" className="data-[state=active]:bg-blue-500/20">
            <Eye className="w-4 h-4 mr-2" />
            Review Data
          </TabsTrigger>
          <TabsTrigger value="lineage" className="data-[state=active]:bg-purple-500/20">
            <GitBranch className="w-4 h-4 mr-2" />
            Data Lineage
          </TabsTrigger>
        </TabsList>

        {/* Review Tab */}
        <TabsContent value="review" className="mt-6 space-y-4">
          {/* Filters */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search feedback..."
                    className="pl-10 bg-white/5 border-white/10 text-white"
                  />
                </div>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="All Agents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {Object.entries(AGENTS).map(([id, agent]) => (
                      <SelectItem key={id} value={id}>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-white text-sm">{selectedItems.length} items selected</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveMutation.mutate(selectedItems)} className="bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" onClick={() => rejectMutation.mutate(selectedItems)} className="bg-red-600 hover:bg-red-700">
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => deleteMutation.mutate(selectedItems)} variant="outline" className="border-red-500/30 text-red-400">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback List */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-0">
              <div className="border-b border-white/10 p-3 flex items-center gap-3">
                <Checkbox
                  checked={selectedItems.length === filteredFeedback.length && filteredFeedback.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-xs text-slate-400">Select All ({filteredFeedback.length})</span>
              </div>
              <div className="max-h-[500px] overflow-y-auto divide-y divide-white/5">
                <AnimatePresence>
                  {filteredFeedback.map((fb) => {
                    const agent = AGENTS[fb.agent_id];
                    const AgentIcon = agent?.icon || Database;
                    return (
                      <motion.div
                        key={fb.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`p-4 hover:bg-white/5 transition-colors ${selectedItems.includes(fb.id) ? 'bg-blue-500/10' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedItems.includes(fb.id)}
                            onCheckedChange={() => toggleSelection(fb.id)}
                          />
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${agent?.color}20` }}>
                            <AgentIcon className="w-5 h-5" style={{ color: agent?.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={
                                fb.feedback_type === 'thumbs_up' ? 'bg-green-500/20 text-green-400' :
                                fb.feedback_type === 'thumbs_down' ? 'bg-red-500/20 text-red-400' :
                                'bg-blue-500/20 text-blue-400'
                              }>
                                {fb.feedback_type === 'thumbs_up' && <ThumbsUp className="w-3 h-3 mr-1" />}
                                {fb.feedback_type === 'thumbs_down' && <ThumbsDown className="w-3 h-3 mr-1" />}
                                {fb.feedback_type}
                              </Badge>
                              {fb.rating && (
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                                  ))}
                                </div>
                              )}
                              <Badge className={
                                fb.used_in_training === true ? 'bg-green-500/20 text-green-400' :
                                fb.used_in_training === false ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }>
                                {fb.used_in_training === true ? 'Approved' : fb.used_in_training === false ? 'Rejected' : 'Pending'}
                              </Badge>
                              {fb.comment?.startsWith('[SYNTHETIC]') && (
                                <Badge className="bg-purple-500/20 text-purple-400">Synthetic</Badge>
                              )}
                            </div>
                            {fb.comment && (
                              <p className="text-sm text-slate-300 line-clamp-2">{fb.comment}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-1">{new Date(fb.created_date).toLocaleString()}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => approveMutation.mutate([fb.id])} className="w-8 h-8 text-green-400 hover:bg-green-500/10">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => rejectMutation.mutate([fb.id])} className="w-8 h-8 text-red-400 hover:bg-red-500/10">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lineage Tab */}
        <TabsContent value="lineage" className="mt-6 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                Training Data Lineage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingSessions.map((session, idx) => (
                  <div key={session.id} className="relative pl-8 pb-4 border-l-2 border-purple-500/30 last:border-l-0">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-purple-500 border-2 border-slate-900" />
                    <Card className="bg-purple-500/10 border-purple-500/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge className="bg-purple-500/20 text-purple-400 mb-1">{session.training_type}</Badge>
                            <p className="text-white font-medium">{AGENTS[session.agent_id]?.name || session.agent_id}</p>
                          </div>
                          <Badge className={session.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                            {session.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div className="text-center p-2 bg-white/5 rounded">
                            <p className="text-xs text-slate-400">Samples Used</p>
                            <p className="text-lg font-bold text-white">{session.feedback_samples_count}</p>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <p className="text-xs text-slate-400">Before Score</p>
                            <p className="text-lg font-bold text-red-400">{session.performance_before?.avg_rating?.toFixed(1) || 'N/A'}</p>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <p className="text-xs text-slate-400">After Score</p>
                            <p className="text-lg font-bold text-green-400">{session.performance_after?.avg_rating?.toFixed(1) || 'N/A'}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">{new Date(session.completed_at || session.created_date).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
                {trainingSessions.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No training sessions yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Augment Dialog */}
      <Dialog open={showAugmentDialog} onOpenChange={setShowAugmentDialog}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Augment Training Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-slate-400">
              Generate synthetic training samples based on existing data. Describe what kind of samples you need.
            </p>
            <Textarea
              value={augmentPrompt}
              onChange={(e) => setAugmentPrompt(e.target.value)}
              placeholder="e.g., Generate more examples of negative feedback for market analysis errors, or Create samples for handling ambiguous user requests..."
              className="bg-white/5 border-white/10 text-white h-32"
            />
            <Button
              onClick={augmentData}
              disabled={isAugmenting}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isAugmenting ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Generate Synthetic Samples</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}