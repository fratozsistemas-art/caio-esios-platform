import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock, 
  GitBranch,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import moment from "moment";

export default function DeploymentStatusWidget() {
  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ['recent_deployments'],
    queryFn: () => base44.entities.DeploymentLog.list('-created_date', 5),
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  const getStatusConfig = (status) => {
    const configs = {
      success: {
        icon: CheckCircle2,
        color: 'text-green-400',
        bg: 'bg-green-500/20',
        border: 'border-green-500/30',
        label: 'Success'
      },
      failed: {
        icon: XCircle,
        color: 'text-red-400',
        bg: 'bg-red-500/20',
        border: 'border-red-500/30',
        label: 'Failed'
      },
      running: {
        icon: Loader2,
        color: 'text-blue-400',
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/30',
        label: 'Running',
        spin: true
      },
      pending: {
        icon: Clock,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/30',
        label: 'Pending'
      },
      cancelled: {
        icon: XCircle,
        color: 'text-slate-400',
        bg: 'bg-slate-500/20',
        border: 'border-slate-500/30',
        label: 'Cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  const getEnvironmentColor = (env) => {
    return env === 'production' 
      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
  };

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Deployment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            Deployment Status
          </CardTitle>
          <Link to={createPageUrl('DeploymentHistory')}>
            <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {deployments.length === 0 ? (
          <div className="text-center py-8">
            <GitBranch className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No deployments tracked yet</p>
            <p className="text-slate-500 text-xs mt-1">Configure GitLab webhooks to start tracking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deployments.map((deployment, idx) => {
              const statusConfig = getStatusConfig(deployment.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={deployment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg ${statusConfig.bg} border ${statusConfig.border} flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon className={`w-5 h-5 ${statusConfig.color} ${statusConfig.spin ? 'animate-spin' : ''}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getEnvironmentColor(deployment.environment)}>
                        {deployment.environment}
                      </Badge>
                      <span className="text-xs text-slate-500">#{deployment.pipeline_id}</span>
                    </div>
                    <p className="text-sm text-white truncate mb-1">{deployment.commit_message}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{deployment.branch}</span>
                      <span>•</span>
                      <span>{moment(deployment.started_at).fromNow()}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(deployment.logs_url, '_blank')}
                    className="flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}