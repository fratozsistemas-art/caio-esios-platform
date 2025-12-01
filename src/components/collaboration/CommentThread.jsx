import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Reply, Check, MoreHorizontal, Smile } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const REACTIONS = ['👍', '❤️', '🎉', '🚀', '💡', '👀'];

export default function CommentThread({ entityType, entityId, onCommentAdded }) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: () => base44.entities.CollaborationComment.filter({
      entity_type: entityType,
      entity_id: entityId
    }),
    refetchInterval: 10000
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentData) => {
      const comment = await base44.entities.CollaborationComment.create(commentData);
      
      // Create activity event
      await base44.entities.ActivityEvent.create({
        event_type: 'comment_added',
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        entity_type: entityType,
        entity_id: entityId,
        metadata: { comment_id: comment.id }
      });
      
      return comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', entityType, entityId]);
      setNewComment('');
      setReplyingTo(null);
      onCommentAdded?.();
    }
  });

  const resolveCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      return base44.entities.CollaborationComment.update(commentId, { is_resolved: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', entityType, entityId]);
    }
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ commentId, emoji }) => {
      const comment = comments.find(c => c.id === commentId);
      const reactions = comment.reactions || [];
      const existingIdx = reactions.findIndex(r => r.emoji === emoji && r.user_email === currentUser.email);
      
      if (existingIdx >= 0) {
        reactions.splice(existingIdx, 1);
      } else {
        reactions.push({ emoji, user_email: currentUser.email });
      }
      
      return base44.entities.CollaborationComment.update(commentId, { reactions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', entityType, entityId]);
    }
  });

  const handleSubmit = () => {
    if (!newComment.trim() || !currentUser) return;

    addCommentMutation.mutate({
      entity_type: entityType,
      entity_id: entityId,
      content: newComment,
      author_email: currentUser.email,
      author_name: currentUser.full_name,
      parent_comment_id: replyingTo
    });
  };

  const rootComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_comment_id === parentId);

  const renderComment = (comment, isReply = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={isReply ? 'ml-8 mt-2' : ''}
    >
      <Card className={`bg-slate-800/50 border-slate-700 ${comment.is_resolved ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FFB800] text-[#0A1628] text-xs font-bold">
                {comment.author_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-white text-sm">{comment.author_name}</span>
                <span className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                </span>
                {comment.is_resolved && (
                  <Badge className="bg-green-500/20 text-green-400 text-xs">Resolved</Badge>
                )}
              </div>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{comment.content}</p>
              
              {/* Reactions */}
              {comment.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(
                    comment.reactions.reduce((acc, r) => {
                      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => addReactionMutation.mutate({ commentId: comment.id, emoji })}
                      className="px-2 py-0.5 bg-slate-700/50 rounded-full text-xs hover:bg-slate-700"
                    >
                      {emoji} {count}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-slate-400 hover:text-white"
                  onClick={() => setReplyingTo(comment.id)}
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-white">
                      <Smile className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800 border-slate-700">
                    <div className="flex gap-1 p-1">
                      {REACTIONS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => addReactionMutation.mutate({ commentId: comment.id, emoji })}
                          className="p-1 hover:bg-slate-700 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {!comment.is_resolved && currentUser?.email === comment.author_email && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-slate-400 hover:text-green-400"
                    onClick={() => resolveCommentMutation.mutate(comment.id)}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      {getReplies(comment.id).map(reply => renderComment(reply, true))}

      {/* Reply input */}
      {replyingTo === comment.id && (
        <div className="ml-8 mt-2 flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a reply..."
            className="bg-slate-800/50 border-slate-700 text-white text-sm min-h-[60px]"
          />
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628]"
            >
              <Send className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setReplyingTo(null); setNewComment(''); }}
              className="text-slate-400"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-[#00D4FF]" />
        <h3 className="text-lg font-semibold text-white">Comments</h3>
        <Badge className="bg-slate-700 text-slate-300">{comments.length}</Badge>
      </div>

      {/* New comment input */}
      {!replyingTo && (
        <div className="flex gap-3 mb-4">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FFB800] text-[#0A1628] text-xs font-bold">
              {currentUser?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="bg-slate-800/50 border-slate-700 text-white text-sm min-h-[80px] mb-2"
            />
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || addCommentMutation.isPending}
              className="bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628]"
            >
              <Send className="w-4 h-4 mr-2" />
              Comment
            </Button>
          </div>
        </div>
      )}

      {/* Comments list */}
      <AnimatePresence>
        <div className="space-y-3">
          {rootComments.map(comment => renderComment(comment))}
        </div>
      </AnimatePresence>

      {comments.length === 0 && !isLoading && (
        <p className="text-center text-slate-500 py-8">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
}