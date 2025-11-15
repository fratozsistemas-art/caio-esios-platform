import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function MessageFeedback({ conversationId, messageId, initialFeedback }) {
  const [feedback, setFeedback] = useState(initialFeedback || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState("");

  const handleFeedback = async (type) => {
    setIsSubmitting(true);
    try {
      const response = await base44.functions.invoke('submitFeedback', {
        conversation_id: conversationId,
        message_id: messageId,
        feedback_type: type,
        comment: comment || null
      });

      if (response.data?.success) {
        setFeedback(type);
        setShowCommentBox(false);
        setComment("");
        toast.success('Feedback submitted!');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback('positive')}
        disabled={isSubmitting}
        className={`h-7 px-2 ${
          feedback === 'positive' 
            ? 'text-green-400 bg-green-500/20' 
            : 'text-slate-400 hover:text-green-400 hover:bg-green-500/10'
        }`}
      >
        {feedback === 'positive' ? (
          <CheckCircle className="w-3.5 h-3.5" />
        ) : (
          <ThumbsUp className="w-3.5 h-3.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback('negative')}
        disabled={isSubmitting}
        className={`h-7 px-2 ${
          feedback === 'negative' 
            ? 'text-red-400 bg-red-500/20' 
            : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
        }`}
      >
        {feedback === 'negative' ? (
          <CheckCircle className="w-3.5 h-3.5" />
        ) : (
          <ThumbsDown className="w-3.5 h-3.5" />
        )}
      </Button>

      <Popover open={showCommentBox} onOpenChange={setShowCommentBox}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-slate-900 border-white/10">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-white font-medium">
                Add detailed feedback (optional)
              </label>
              <p className="text-xs text-slate-400 mt-1">
                Help us improve by sharing specific feedback
              </p>
            </div>
            <Textarea
              placeholder="What worked well? What could be better?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleFeedback('helpful')}
                disabled={isSubmitting || !comment.trim()}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                Submit Feedback
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowCommentBox(false);
                  setComment("");
                }}
                className="text-slate-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {feedback && (
        <span className="text-xs text-slate-500 ml-2">
          Thanks for your feedback!
        </span>
      )}
    </div>
  );
}