import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell, Eye, FileText, Brain, AlertTriangle, CheckCircle, Info,
  X, ExternalLink, Trash2, Check, Clock
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const AGENT_ICONS = {
  market_monitor: { icon: Eye, color: '#3b82f6' },
  strategy_doc_generator: { icon: FileText, color: '#a855f7' },
  knowledge_curator: { icon: Brain, color: '#10b981' },
  system: { icon: Bell, color: '#6366f1' }
};

const TYPE_STYLES = {
  critical: { bg: 'bg-red-500/20', border: 'border-red-500/50', icon: AlertTriangle, iconColor: 'text-red-400' },
  warning: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', icon: AlertTriangle, iconColor: 'text-yellow-400' },
  success: { bg: 'bg-green-500/20', border: 'border-green-500/50', icon: CheckCircle, iconColor: 'text-green-400' },
  info: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', icon: Info, iconColor: 'text-blue-400' }
};

export default function AgentNotificationCenter() {
  const [open, setOpen] = useState(false);
  const [newNotification, setNewNotification] = useState(null);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['agent-notifications'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.AgentNotification.filter(
        { target_user_email: user.email },
        '-created_date',
        50
      );
    },
    refetchInterval: 10000
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Mark as read
  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.AgentNotification.update(id, { is_read: true });
    },
    onSuccess: () => queryClient.invalidateQueries(['agent-notifications'])
  });

  // Mark all read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      for (const n of unread) {
        await base44.entities.AgentNotification.update(n.id, { is_read: true });
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['agent-notifications'])
  });

  // Delete notification
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AgentNotification.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['agent-notifications'])
  });

  // Show toast for new critical notifications
  useEffect(() => {
    const critical = notifications.find(n => !n.is_read && n.type === 'critical' && n.id !== newNotification);
    if (critical) {
      setNewNotification(critical.id);
      toast.error(
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold">{critical.title}</p>
            <p className="text-sm text-slate-300">{critical.message}</p>
          </div>
        </div>,
        { duration: 10000 }
      );
    }
  }, [notifications]);

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-slate-900 border-white/10" align="end">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            Agent Notifications
          </h3>
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" onClick={() => markAllReadMutation.mutate()} className="text-xs text-slate-400">
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {notifications.map(notification => {
                  const agentConfig = AGENT_ICONS[notification.source_agent];
                  const AgentIcon = agentConfig?.icon || Bell;
                  const typeStyle = TYPE_STYLES[notification.type] || TYPE_STYLES.info;
                  const TypeIcon = typeStyle.icon;

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-3 hover:bg-white/5 transition-colors ${!notification.is_read ? 'bg-white/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeStyle.bg} ${typeStyle.border} border`}>
                          <TypeIcon className={`w-5 h-5 ${typeStyle.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`text-sm font-medium ${!notification.is_read ? 'text-white' : 'text-slate-300'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.is_read && (
                                <Button size="icon" variant="ghost" onClick={() => markReadMutation.mutate(notification.id)} className="w-6 h-6 text-slate-500 hover:text-white">
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(notification.id)} className="w-6 h-6 text-slate-500 hover:text-red-400">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="text-[10px] py-0" style={{ backgroundColor: `${agentConfig?.color}20`, color: agentConfig?.color }}>
                              <AgentIcon className="w-2.5 h-2.5 mr-1" />
                              {notification.source_agent?.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {getTimeAgo(notification.created_date)}
                            </span>
                          </div>

                          {notification.action_url && (
                            <Link
                              to={notification.action_url}
                              onClick={() => { markReadMutation.mutate(notification.id); setOpen(false); }}
                              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-2"
                            >
                              {notification.action_label || 'View Details'}
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t border-white/10">
          <Link to={createPageUrl('Notifications')} onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full text-slate-400 text-xs">
              View All Notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Utility function to push notifications from agents
export async function pushAgentNotification({ 
  title, 
  message, 
  type = 'info', 
  source_agent, 
  priority = 'medium',
  action_url,
  action_label,
  context,
  target_user_email
}) {
  try {
    if (!target_user_email) {
      const user = await base44.auth.me();
      target_user_email = user.email;
    }
    
    await base44.entities.AgentNotification.create({
      title,
      message,
      type,
      source_agent,
      priority,
      target_user_email,
      action_url,
      action_label,
      context,
      is_read: false
    });
  } catch (error) {
    console.error('Failed to push notification:', error);
  }
}