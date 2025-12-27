import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function InsightFeedbackDialog({ 
  open, 
  onClose, 
  insight, 
  insightType 
}) {
  const [accuracyRating, setAccuracyRating] = useState(0);
  const [usefulnessRating, setUsefulnessRating] = useState(0);
  const [comment, setComment] = useState('');
  const [falsePositive, setFalsePositive] = useState(false);
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('submitInsightFeedback', {
        insight_type: insightType,
        insight_id: insight.id,
        accuracy_rating: accuracyRating,
        usefulness_rating: usefulnessRating,
        comment,
        was_helpful: accuracyRating >= 3 && usefulnessRating >= 3,
        false_positive: falsePositive,
        insight_data: insight,
        context_metadata: {
          submitted_at: new Date().toISOString()
        }
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['ai_insight_feedback']);
      toast.success(data.message || 'Feedback submitted successfully');
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to submit feedback: ${error.message}`);
    }
  });

  const resetForm = () => {
    setAccuracyRating(0);
    setUsefulnessRating(0);
    setComment('');
    setFalsePositive(false);
  };

  const renderStars = (rating, setRating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-slate-600'
            } hover:text-yellow-400`}
          >
            <Star className="w-5 h-5" fill={star <= rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    );
  };

  if (!insight) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-blue-400" />
            Rate this {insightType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Insight Preview */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-sm text-slate-300 mb-1">
              {insight.node_label || insight.label || 'Insight'}
            </p>
            <p className="text-xs text-slate-500">
              {insight.details || insight.type || insightType}
            </p>
          </div>

          {/* Accuracy Rating */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Accuracy - How accurate was this insight?
            </label>
            {renderStars(accuracyRating, setAccuracyRating)}
          </div>

          {/* Usefulness Rating */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Usefulness - How useful was this to you?
            </label>
            {renderStars(usefulnessRating, setUsefulnessRating)}
          </div>

          {/* False Positive Toggle */}
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <button
              onClick={() => setFalsePositive(!falsePositive)}
              className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                falsePositive 
                  ? 'bg-red-500 border-red-500' 
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              {falsePositive && <CheckCircle className="w-4 h-4 text-white" />}
            </button>
            <div className="flex-1">
              <p className="text-sm text-white">Mark as false positive</p>
              <p className="text-xs text-slate-500">This insight was incorrect</p>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Additional Comments (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts on this insight..."
              className="bg-white/5 border-white/10 text-white min-h-20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || (accuracyRating === 0 && usefulnessRating === 0)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-center text-slate-500 pt-2">
            Your feedback helps improve our AI models
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}