import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  X,
  Settings
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function RealTimeNotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const queryClient = useQueryClient();

  // Fetch initial notifications
  const { data: alerts = [] } = useQuery({
    queryKey: ['realtime_alerts'],
    queryFn: async () => {
      const data = await base44.entities.Alert.filter({ status: 'active' });
      return data;
    },
    refetchInterval: 10000 // Poll every 10 seconds
  });

  const { data: anomalies = [] } = useQuery({
    queryKey: ['realtime_anomalies'],
    queryFn: async () => {
      const data = await base44.entities.NetworkAnomaly.filter({
        status: 'new',
        detected_at: { $gte: new Date(Date.now() - 3600000).toISOString() }
      });
      return data;
    },
    refetchInterval: 10000
  });

  const { data: failedAutomations = [] } = useQuery({
    queryKey: ['realtime_failed_automations'],
    queryFn: async () => {
      const data = await base44.entities.NetworkAutomation.filter({
        last_execution_status: 'failed',
        last_execution_at: { $gte: new Date(Date.now() - 3600000).toISOString() }
      });
      return data;
    },
    refetchInterval: 10000
  });

  // Combine all notifications
  useEffect(() => {
    const combined = [
      ...alerts.map(a => ({
        id: a.id,
        type: 'alert',
        severity: a.severity,
        title: a.title,
        message: a.message,
        timestamp: a.created_date,
        icon: AlertTriangle
      })),
      ...anomalies.map(a => ({
        id: a.id,
        type: 'anomaly',
        severity: a.severity,
        title: `Network Anomaly: ${a.type}`,
        message: a.details,
        timestamp: a.detected_at,
        icon: XCircle
      })),
      ...failedAutomations.map(a => ({
        id: a.id,
        type: 'automation_failure',
        severity: 'high',
        title: `Automation Failed: ${a.name}`,
        message: `Last execution failed at ${new Date(a.last_execution_at).toLocaleString()}`,
        timestamp: a.last_execution_at,
        icon: XCircle
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Show toast for new critical notifications
    const existingIds = new Set(notifications.map(n => n.id));
    const newCritical = combined.filter(n => 
      !existingIds.has(n.id) && 
      (n.severity === 'critical' || n.severity === 'high')
    );

    if (newCritical.length > 0) {
      newCritical.forEach(n => {
        toast.error(n.title, {
          description: n.message,
          duration: 5000
        });
      });
    }

    setNotifications(combined);
  }, [alerts, anomalies, failedAutomations]);

  const dismissMutation = useMutation({
    mutationFn: async (notification) => {
      if (notification.type === 'alert') {
        await base44.entities.Alert.update(notification.id, { status: 'resolved' });
      } else if (notification.type === 'anomaly') {
        await base44.entities.NetworkAnomaly.update(notification.id, { status: 'resolved' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['realtime_alerts']);
      queryClient.invalidateQueries(['realtime_anomalies']);
    }
  });

  const unreadCount = notifications.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/10"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-slate-900 border-white/20" align="end">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Notifications</h3>
          <Badge className="bg-red-500/20 text-red-400">
            {unreadCount} new
          </Badge>
        </div>
        
        <ScrollArea className="h-96">
          <div className="p-2">
            <AnimatePresence>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">All caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-3 rounded-lg mb-2 border ${
                        notification.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                        notification.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                        notification.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-blue-500/10 border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          notification.severity === 'critical' ? 'text-red-400' :
                          notification.severity === 'high' ? 'text-orange-400' :
                          notification.severity === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-slate-400 text-xs line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-slate-500 text-xs mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-white"
                          onClick={() => dismissMutation.mutate(notification)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}