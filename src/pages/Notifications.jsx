import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, CheckCircle, AlertCircle, Info, Zap, Trash2, 
  Check, Filter, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 50)
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success("Marked as read");
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => 
        base44.entities.Notification.update(n.id, { is_read: true })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success("All notifications marked as read");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success("Notification deleted");
    }
  });

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    if (filter === 'alert') return n.type === 'alert';
    if (filter === 'opportunity') return n.type === 'opportunity';
    return true;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'opportunity': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityBadge = (severity) => {
    const config = {
      critical: { label: 'Critical', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      high: { label: 'High', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
      medium: { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      low: { label: 'Low', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    }[severity] || config.low;

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-400" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </h1>
          <p className="text-slate-400 mt-1">Stay updated with system alerts and insights</p>
        </div>
        <Button
          onClick={() => markAllAsReadMutation.mutate()}
          disabled={unreadCount === 0}
          variant="outline"
          className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700"
        >
          <Check className="w-4 h-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
          <TabsTrigger value="alert">Alerts</TabsTrigger>
          <TabsTrigger value="opportunity">Opportunities</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
              <p className="text-slate-400">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`bg-white/5 border-white/10 hover:bg-white/10 transition-all ${
                !notification.is_read ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-slate-400 text-sm mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(notification.created_date), 'MMM d, HH:mm')}
                          </span>
                          {notification.severity && getSeverityBadge(notification.severity)}
                          {!notification.is_read && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(notification.id)}
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}