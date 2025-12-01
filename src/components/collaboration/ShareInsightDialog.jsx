import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Share2, Send, Users, Globe, Lock, X, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareInsightDialog({ 
  sourceEntityType, 
  sourceEntityId, 
  initialContent = '',
  trigger 
}) {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [insight, setInsight] = useState({
    title: '',
    content: initialContent,
    visibility: 'team',
    shared_with: [],
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  useEffect(() => {
    setInsight(prev => ({ ...prev, content: initialContent }));
  }, [initialContent]);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const shareMutation = useMutation({
    mutationFn: async (insightData) => {
      const sharedInsight = await base44.entities.SharedInsight.create({
        ...insightData,
        source_entity_type: sourceEntityType,
        source_entity_id: sourceEntityId,
        shared_by_email: currentUser.email,
        shared_by_name: currentUser.full_name
      });

      // Create activity event
      await base44.entities.ActivityEvent.create({
        event_type: 'insight_shared',
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        entity_type: 'shared_insight',
        entity_id: sharedInsight.id,
        entity_title: insightData.title,
        target_users: insightData.shared_with
      });

      // Notify users
      if (insightData.shared_with?.length > 0) {
        for (const email of insightData.shared_with) {
          await base44.entities.Notification.create({
            title: 'New Insight Shared',
            message: `${currentUser.full_name} shared an insight: "${insightData.title}"`,
            type: 'info',
            action_url: `/insights/${sharedInsight.id}`
          });
        }
      }

      return sharedInsight;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shared-insights']);
      toast.success('Insight shared successfully!');
      setOpen(false);
      setInsight({ title: '', content: '', visibility: 'team', shared_with: [], tags: [] });
    }
  });

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!insight.tags.includes(tagInput.trim())) {
        setInsight({ ...insight, tags: [...insight.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setInsight({ ...insight, tags: insight.tags.filter(t => t !== tag) });
  };

  const toggleUser = (email) => {
    const isSelected = insight.shared_with.includes(email);
    setInsight({
      ...insight,
      shared_with: isSelected 
        ? insight.shared_with.filter(e => e !== email)
        : [...insight.shared_with, email]
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/10">
            <Share2 className="w-4 h-4 mr-2" />
            Share Insight
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#FFB800]" />
            Share Insight
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <Input
            placeholder="Insight title"
            value={insight.title}
            onChange={(e) => setInsight({ ...insight, title: e.target.value })}
            className="bg-slate-800 border-slate-700 text-white"
          />

          <Textarea
            placeholder="Share your insight..."
            value={insight.content}
            onChange={(e) => setInsight({ ...insight, content: e.target.value })}
            className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
          />

          {/* Tags */}
          <div>
            <Input
              placeholder="Add tags (press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="bg-slate-800 border-slate-700 text-white"
            />
            {insight.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {insight.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    className="bg-[#00D4FF]/20 text-[#00D4FF] cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Visibility</label>
            <Select
              value={insight.visibility}
              onValueChange={(value) => setInsight({ ...insight, visibility: value })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Private - Only selected users
                  </div>
                </SelectItem>
                <SelectItem value="team">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team - All team members
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Public - Everyone in organization
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Share with specific users */}
          {insight.visibility === 'private' && (
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Share with</label>
              <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-800/50 rounded-lg p-2">
                {users.filter(u => u.email !== currentUser?.email).map(user => (
                  <button
                    key={user.email}
                    onClick={() => toggleUser(user.email)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      insight.shared_with.includes(user.email) 
                        ? 'bg-[#00D4FF]/20 border border-[#00D4FF]/40' 
                        : 'hover:bg-slate-700'
                    }`}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-[#00D4FF] text-[#0A1628] text-xs">
                        {user.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white">{user.full_name}</span>
                    <span className="text-xs text-slate-500 ml-auto">{user.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => shareMutation.mutate(insight)}
            disabled={!insight.title || !insight.content || shareMutation.isPending}
            className="w-full bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold"
          >
            <Send className="w-4 h-4 mr-2" />
            Share Insight
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}