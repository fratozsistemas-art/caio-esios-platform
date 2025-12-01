import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, MessageSquare, CheckSquare, Share2, Edit, 
  ThumbsUp, FileText, Lightbulb, Bell, Check 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const eventConfig = {
  comment_added: { icon: MessageSquare, color: 'text-blue-400', label: 'commented on' },
  comment_resolved: { icon: Check, color: 'text-green-400', label: 'resolved a comment on' },
  task_created: { icon: CheckSquare, color: 'text-purple-400', label: 'created a task in' },
  task_assigned: { icon: CheckSquare, color: 'text-orange-400', label: 'assigned a task to' },
  task_completed: { icon: Check, color: 'text-green-400', label: 'completed a task in' },
  entity_shared: { icon: Share2, color: 'text-cyan-400', label: 'shared' },
  entity_updated: { icon: Edit, color: 'text-yellow-400', label: 'updated' },
  mention: { icon: Bell, color: 'text-pink-400', label: 'mentioned you in' },
  reaction_added: { icon: ThumbsUp, color: 'text-red-400', label: 'reacted to' },
  report_exported: { icon: FileText, color: 'text-emerald-400', label: 'exported' },
  insight_shared: { icon: Lightbulb, color: 'text-amber-400', label: 'shared an insight from' }
};

export default function ActivityFeedPanel({ entityType, entityId, showAll = false }) {
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', entityType, entityId, showAll],
    queryFn: async () => {
      if (showAll) {
        return base44.entities.ActivityEvent.list('-created_date', 50);
      }
      if (entityType && entityId) {
        return base44.entities.ActivityEvent.filter({
          entity_type: entityType,
          entity_id: entityId
        });
      }
      // Get activities for current user
      const all = await base44.entities.ActivityEvent.list('-created_date', 100);
      return all.filter(a => 
        a.target_users?.includes(currentUser?.email) || 
        a.actor_email === currentUser?.email
      );
    },
    enabled: !!currentUser,
    refetchInterval: 15000
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (activityId) => {
      const activity = activities.find(a => a.id === activityId);
      const isReadBy = activity.is_read_by || [];
      if (!isReadBy.includes(currentUser.email)) {
        return base44.entities.ActivityEvent.update(activityId, {
          is_read_by: [...isReadBy, currentUser.email]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
    }
  });

  const unreadCount = activities.filter(a => 
    !a.is_read_by?.includes(currentUser?.email) && 
    a.actor_email !== currentUser?.email
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#00D4FF]" />
          <h3 className="text-lg font-semibold text-white">Activity</h3>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white text-xs">{unreadCount} new</Badge>
          )}
        </div>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <AnimatePresence>
          <div className="space-y-3">
            {activities.map((activity, idx) => {
              const config = eventConfig[activity.event_type] || { 
                icon: Activity, 
                color: 'text-slate-400', 
                label: 'performed action on' 
              };
              const Icon = config.icon;
              const isUnread = !activity.is_read_by?.includes(currentUser?.email) && 
                              activity.actor_email !== currentUser?.email;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => isUnread && markAsReadMutation.mutate(activity.id)}
                  className={`cursor-pointer ${isUnread ? 'bg-[#00D4FF]/5' : ''}`}
                >
                  <Card className={`bg-slate-800/50 border-slate-700 transition-all hover:bg-slate-800/70 ${isUnread ? 'border-l-2 border-l-[#00D4FF]' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#FFB800] text-[#0A1628] text-xs font-bold">
                            {activity.actor_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-white text-sm">{activity.actor_name}</span>
                            <span className="text-slate-400 text-sm">{config.label}</span>
                            {activity.entity_title && (
                              <span className="text-[#00D4FF] text-sm font-medium truncate">
                                {activity.entity_title}
                              </span>
                            )}
                          </div>
                          {activity.metadata?.task_title && (
                            <p className="text-xs text-slate-400 mt-1">
                              Task: {activity.metadata.task_title}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Icon className={`w-3 h-3 ${config.color}`} />
                            <span className="text-xs text-slate-500">
                              {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#00D4FF]" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {activities.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No activity yet</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}