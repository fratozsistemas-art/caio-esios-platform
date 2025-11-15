import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Brain, TrendingUp, AlertTriangle, Target, Loader2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ALERT_ICONS = {
  risk: AlertTriangle,
  opportunity: Target,
  trend: TrendingUp,
  anomaly: Brain
};

const SEVERITY_COLORS = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};

export default function ProactiveInsightsWidget() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const notifs = await base44.entities.Notification.filter({
        user_email: user.email,
        is_read: false
      });
      return notifs.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      ).slice(0, 5);
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const handleRunMonitoring = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('proactiveMonitoring');
      if (response.data?.success) {
        toast.success(`Generated ${response.data.monitoring_results.alerts_generated} alerts`);
        refetchNotifications();
      }
    } catch (error) {
      toast.error('Monitoring failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await base44.entities.Notification.update(notificationId, { is_read: true });
      refetchNotifications();
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            Proactive Insights
          </CardTitle>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                {notifications.length} new
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRunMonitoring}
              disabled={isAnalyzing}
              className="h-8 w-8 text-slate-400 hover:text-white"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-6">
            <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400 mb-3">No alerts. All systems monitored.</p>
            <Button
              onClick={handleRunMonitoring}
              disabled={isAnalyzing}
              size="sm"
              variant="outline"
              className="border-white/10 text-white"
            >
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif, idx) => {
              const Icon = ALERT_ICONS[notif.type] || Bell;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-sm text-white font-medium line-clamp-2">
                          {notif.title}
                        </div>
                        <Badge className={SEVERITY_COLORS[notif.severity]}>
                          {notif.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-2 mb-2">
                        {notif.message}
                      </div>
                      {notif.data_snapshot?.recommendation && (
                        <div className="text-xs text-blue-400 line-clamp-1">
                          → {notif.data_snapshot.recommendation}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}