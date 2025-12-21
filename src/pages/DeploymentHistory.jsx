import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  GitBranch, 
  User, 
  ExternalLink,
  Calendar,
  Timer
} from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";

export default function DeploymentHistory() {
  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => base44.entities.DeploymentLog.list('-created_date', 50),
    refetchInterval: 30000 // Refresh every 30 seconds
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

  const stats = React.useMemo(() => {
    const total = deployments.length;
    const success = deployments.filter(d => d.status === 'success').length;
    const failed = deployments.filter(d => d.status === 'failed').length;
    const running = deployments.filter(d => d.status === 'running').length;
    const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : 0;
    
    return { total, success, failed, running, successRate };
  }, [deployments]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Deployment History</h1>
          <p className="text-slate-400">GitLab CI/CD deployment tracking</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
              <div className="text-sm text-slate-400">Total Deploys</div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-400 mb-1">{stats.success}</div>
              <div className="text-sm text-green-300">Successful</div>
            </CardContent>
          </Card>

          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-red-400 mb-1">{stats.failed}</div>
              <div className="text-sm text-red-300">Failed</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-400 mb-1">{stats.running}</div>
              <div className="text-sm text-blue-300">Running</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-500/10 border-purple-500/20">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-400 mb-1">{stats.successRate}%</div>
              <div className="text-sm text-purple-300">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Deployment List */}
        <div className="space-y-4">
          {deployments.map((deployment, idx) => {
            const statusConfig = getStatusConfig(deployment.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={deployment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Status & Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl ${statusConfig.bg} border ${statusConfig.border} flex items-center justify-center`}>
                          <StatusIcon className={`w-6 h-6 ${statusConfig.color} ${statusConfig.spin ? 'animate-spin' : ''}`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={getEnvironmentColor(deployment.environment)}>
                              {deployment.environment}
                            </Badge>
                            <Badge className={`${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                              {statusConfig.label}
                            </Badge>
                            <span className="text-xs text-slate-500">#{deployment.pipeline_id}</span>
                          </div>

                          <p className="text-white font-medium mb-3">{deployment.commit_message}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-400">
                              <GitBranch className="w-4 h-4" />
                              <span>{deployment.branch}</span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-400">
                              <User className="w-4 h-4" />
                              <span>{deployment.deployed_by}</span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-400">
                              <Calendar className="w-4 h-4" />
                              <span>{moment(deployment.started_at).format('MMM D, HH:mm')}</span>
                            </div>

                            {deployment.duration_seconds && (
                              <div className="flex items-center gap-2 text-slate-400">
                                <Timer className="w-4 h-4" />
                                <span>{deployment.duration_seconds}s</span>
                              </div>
                            )}
                          </div>

                          {deployment.error_message && (
                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <p className="text-sm text-red-400">{deployment.error_message}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(deployment.logs_url, '_blank')}
                          className="border-white/20 text-slate-300 hover:bg-white/10"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Logs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {deployments.length === 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <GitBranch className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Deployments Yet</h3>
                <p className="text-slate-400 mb-6">
                  Configure GitLab webhooks to start tracking deployments
                </p>
                <div className="text-sm text-slate-500 max-w-md mx-auto text-left bg-slate-800/50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Go to GitLab → Settings → Webhooks</li>
                    <li>Add webhook URL: <code className="text-cyan-400">[your-app-url]/api/functions/gitlabWebhook</code></li>
                    <li>Set secret token in env: GITLAB_WEBHOOK_TOKEN</li>
                    <li>Enable "Pipeline events" trigger</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}