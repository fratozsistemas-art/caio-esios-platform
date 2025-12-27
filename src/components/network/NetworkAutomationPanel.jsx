import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Zap,
  Play,
  Pause,
  Plus,
  Trash2,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const AUTOMATION_TYPES = [
  { value: 'provisioning', label: 'Provisioning', icon: Plus },
  { value: 'deprovisioning', label: 'Deprovisioning', icon: Trash2 },
  { value: 'incident_response', label: 'Incident Response', icon: AlertTriangle },
  { value: 'health_check', label: 'Health Check', icon: Activity },
  { value: 'resource_scaling', label: 'Resource Scaling', icon: TrendingUp }
];

export default function NetworkAutomationPanel() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const queryClient = useQueryClient();

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ['network_automations'],
    queryFn: () => base44.entities.NetworkAutomation.list('-created_date')
  });

  const { data: healthChecks = [] } = useQuery({
    queryKey: ['network_health_checks'],
    queryFn: () => base44.entities.NetworkHealthCheck.list('-checked_at', 10)
  });

  const executeAutomationMutation = useMutation({
    mutationFn: async (automationId) => {
      const { data } = await base44.functions.invoke('executeNetworkAutomation', {
        automation_id: automationId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['network_automations']);
      toast.success('Automation executed successfully');
    },
    onError: (error) => {
      toast.error(`Execution failed: ${error.message}`);
    }
  });

  const runHealthCheckMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('runNetworkHealthCheck', {
        check_type: 'comprehensive'
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['network_health_checks']);
      toast.success('Health check completed');
    }
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      return await base44.entities.NetworkAutomation.update(id, {
        is_active: !isActive
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['network_automations']);
    }
  });

  const latestHealthCheck = healthChecks[0];

  return (
    <div className="space-y-6">
      {/* Health Status Overview */}
      {latestHealthCheck && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Network Health Status
              </CardTitle>
              <Button
                size="sm"
                onClick={() => runHealthCheckMutation.mutate()}
                disabled={runHealthCheckMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Activity className="w-4 h-4 mr-2" />
                Run Check
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Health Score</p>
                <p className="text-2xl font-bold text-white">{latestHealthCheck.health_score}/100</p>
              </div>
              <Badge className={`${
                latestHealthCheck.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                latestHealthCheck.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              } border-none`}>
                {latestHealthCheck.status}
              </Badge>
            </div>

            {latestHealthCheck.metrics && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 rounded p-2">
                  <p className="text-slate-400">Latency</p>
                  <p className="text-white font-medium">{latestHealthCheck.metrics.latency_ms?.toFixed(1)}ms</p>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <p className="text-slate-400">Uptime</p>
                  <p className="text-white font-medium">{latestHealthCheck.metrics.uptime_percent?.toFixed(1)}%</p>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <p className="text-slate-400">Error Rate</p>
                  <p className="text-white font-medium">{(latestHealthCheck.metrics.error_rate * 100)?.toFixed(2)}%</p>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <p className="text-slate-400">Throughput</p>
                  <p className="text-white font-medium">{latestHealthCheck.metrics.throughput_mbps?.toFixed(0)} Mbps</p>
                </div>
              </div>
            )}

            {latestHealthCheck.issues_found && latestHealthCheck.issues_found.length > 0 && (
              <div className="text-xs">
                <p className="text-slate-400 mb-1">Active Issues: {latestHealthCheck.issues_found.length}</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {latestHealthCheck.issues_found.slice(0, 3).map((issue, idx) => (
                    <div key={idx} className="bg-white/5 rounded p-2 flex items-start gap-2">
                      <AlertTriangle className={`w-3 h-3 flex-shrink-0 mt-0.5 ${
                        issue.severity === 'critical' ? 'text-red-400' :
                        issue.severity === 'high' ? 'text-orange-400' :
                        'text-yellow-400'
                      }`} />
                      <p className="text-slate-300">{issue.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Automations List */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Network Automations
            </CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Automation
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/20 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Network Automation</DialogTitle>
                </DialogHeader>
                <CreateAutomationForm onClose={() => setShowCreateDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-400 text-center py-4">Loading automations...</p>
          ) : automations.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No automations configured yet</p>
          ) : (
            <div className="space-y-2">
              {automations.map((automation) => (
                <motion.div
                  key={automation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-medium">{automation.name}</h4>
                        <Badge className="bg-white/10 text-white text-xs capitalize">
                          {automation.automation_type.replace('_', ' ')}
                        </Badge>
                        <Badge className={`text-xs ${
                          automation.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {automation.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <p className="text-slate-400">Trigger</p>
                          <p className="text-white capitalize">{automation.trigger_type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Executions</p>
                          <p className="text-white">{automation.execution_count || 0}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Success Rate</p>
                          <p className="text-white">
                            {automation.execution_count > 0 
                              ? `${((automation.success_count / automation.execution_count) * 100).toFixed(0)}%`
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Avg Duration</p>
                          <p className="text-white">
                            {automation.average_duration_seconds?.toFixed(1)}s
                          </p>
                        </div>
                      </div>

                      {automation.last_execution_at && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          {automation.last_execution_status === 'success' ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-400" />
                          )}
                          <span className="text-slate-400">
                            Last run: {new Date(automation.last_execution_at).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleAutomationMutation.mutate({
                          id: automation.id,
                          isActive: automation.is_active
                        })}
                        className="text-slate-400 hover:text-white"
                      >
                        {automation.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => executeAutomationMutation.mutate(automation.id)}
                        disabled={!automation.is_active || executeAutomationMutation.isPending}
                        className="bg-cyan-500 hover:bg-cyan-600"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateAutomationForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    automation_type: 'provisioning',
    trigger_type: 'manual',
    schedule_cron: '',
    is_active: true
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.NetworkAutomation.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['network_automations']);
      toast.success('Automation created');
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-white">Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Daily Health Check"
          className="bg-white/5 border-white/10 text-white"
          required
        />
      </div>

      <div>
        <Label className="text-white">Automation Type</Label>
        <Select
          value={formData.automation_type}
          onValueChange={(value) => setFormData({ ...formData, automation_type: value })}
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AUTOMATION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-white">Trigger Type</Label>
        <Select
          value={formData.trigger_type}
          onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="event_based">Event Based</SelectItem>
            <SelectItem value="threshold">Threshold</SelectItem>
            <SelectItem value="anomaly_detected">Anomaly Detected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.trigger_type === 'scheduled' && (
        <div>
          <Label className="text-white">Schedule (Cron Expression)</Label>
          <Input
            value={formData.schedule_cron}
            onChange={(e) => setFormData({ ...formData, schedule_cron: e.target.value })}
            placeholder="0 * * * * (every hour)"
            className="bg-white/5 border-white/10 text-white"
          />
          <p className="text-xs text-slate-400 mt-1">Format: minute hour day month dayOfWeek</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label className="text-white">Active</Label>
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </div>

      <Separator className="bg-white/10" />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending} className="bg-cyan-500 hover:bg-cyan-600">
          Create Automation
        </Button>
      </div>
    </form>
  );
}