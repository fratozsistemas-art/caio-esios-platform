import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ThumbsUp, ThumbsDown, Edit, MessageSquare, Star, Send, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AgentFeedbackWidget({ 
  agentId, 
  output, 
  inputContext,
  collaborationId,
  compact = false 
}) {
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userEdits, setUserEdits] = useState('');
  const queryClient = useQueryClient();

  const feedbackMutation = useMutation({
    mutationFn: async (feedbackData) => {
      return await base44.entities.AgentFeedback.create({
        agent_id: agentId,
        feedback_type: feedbackData.type,
        rating: feedbackData.rating,
        input_context: inputContext,
        agent_output: output,
        user_edits: feedbackData.edits ? JSON.parse(feedbackData.edits) : null,
        comment: feedbackData.comment,
        quality_metrics: feedbackData.metrics,
        related_collaboration_id: collaborationId,
        used_in_training: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-feedback']);
      toast.success('Feedback submitted! Will be used for agent training.');
      setShowDetailedFeedback(false);
      setComment('');
      setUserEdits('');
      setRating(0);
    }
  });

  const handleQuickFeedback = (type) => {
    feedbackMutation.mutate({
      type,
      rating: type === 'thumbs_up' ? 5 : 1
    });
  };

  const handleDetailedFeedback = () => {
    if (!rating) {
      toast.error('Please provide a rating');
      return;
    }

    feedbackMutation.mutate({
      type: 'rating',
      rating,
      comment,
      edits: userEdits || null,
      metrics: {
        accuracy: rating >= 4 ? 90 : rating >= 3 ? 70 : 50,
        relevance: rating >= 4 ? 85 : rating >= 3 ? 65 : 45,
        completeness: rating >= 4 ? 88 : rating >= 3 ? 68 : 48,
        actionability: rating >= 4 ? 92 : rating >= 3 ? 72 : 52
      }
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleQuickFeedback('thumbs_up')}
          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
        >
          <ThumbsUp className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleQuickFeedback('thumbs_down')}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <ThumbsDown className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowDetailedFeedback(true)}
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Rate this output:</p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickFeedback('thumbs_up')}
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Good
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickFeedback('thumbs_down')}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                Needs Work
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDetailedFeedback(true)}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <Edit className="w-4 h-4 mr-1" />
                Detailed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailedFeedback} onOpenChange={setShowDetailedFeedback}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Detailed Feedback for Agent Training
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">Overall Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-2 rounded ${rating >= star ? 'text-yellow-400' : 'text-slate-600'}`}
                  >
                    <Star className={`w-6 h-6 ${rating >= star ? 'fill-yellow-400' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">Your Improvements (Optional)</label>
              <Textarea
                value={userEdits}
                onChange={(e) => setUserEdits(e.target.value)}
                placeholder="Paste your corrected/improved version here..."
                className="bg-white/5 border-white/10 text-white h-24"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">Comments (Optional)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What could be better? Any specific feedback..."
                className="bg-white/5 border-white/10 text-white h-20"
              />
            </div>

            <Button
              onClick={handleDetailedFeedback}
              disabled={feedbackMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {feedbackMutation.isPending ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Training Feedback
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}