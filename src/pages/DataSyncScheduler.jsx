import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Play, Pause, Clock, TrendingUp, AlertCircle, Calendar, Activity, Trash2 } from 'lucide-react';
import { CheckCircleIcon } from '@/components/utils/icons';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function DataSyncScheduler() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: jobs = [] } = useQuery({
    queryKey: ['data_sync_jobs'],
    queryFn: () => base44.entities.DataSyncJob.list('-created_date')
  });

  const { data: dataSources = [] } = useQuery({
    queryKey: ['external_data_sources'],
    queryFn: () => base44.entities.ExternalDataSource.list()
  });

  const createJobMutation = useMutation({
    mutationFn: (data) => base44.entities.DataSyncJob.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['data_sync_jobs']);
      setShowCreateDialog(false);
      toast.success('Sync job created successfully');
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DataSyncJob.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['data_sync_jobs']);
      toast.success('Job updated successfully');
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id) => base44.entities.DataSyncJob.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['data_sync_jobs']);
      toast.success('Job deleted successfully');
    }
  });

  const executeJobsMutation = useMutation({
    mutationFn: () => base44.functions.invoke('executeDataSyncJobs', {}),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['data_sync_jobs']);
      const { executed, results } = response.data;
      const successCount = results.filter(r => r.status === 'success').length;
      toast.success(`Executed ${executed} job(s): ${successCount} successful`);
    }
  });

  const activeJobs = jobs.filter(j => j.is_active);
  const totalExecutions = jobs.reduce((sum, j) => sum + (j.execution_count || 0), 0);
  const successRate = totalExecutions > 0
    ? ((jobs.reduce((sum, j) => sum + (j.success_count || 0), 0) / totalExecutions) * 100).toFixed(1)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Data Sync Scheduler</h1>
          <p className="text-slate-400">Automate external data synchronization to Knowledge Graph</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => executeJobsMutation.mutate()}
            disabled={executeJobsMutation.isPending}
            className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
          >
            <Play className="w-4 h-4 mr-2" />
            {executeJobsMutation.isPending ? 'Running...' : 'Run Now'}
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                <Plus className="w-4 h-4 mr-2" />
                Create Sync Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">Create Sync Job</DialogTitle>
              </DialogHeader>
              <CreateJobForm 
                dataSources={dataSources}
                onSubmit={(data) => createJobMutation.mutate(data)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Jobs</p>
                <p className="text-2xl font-bold text-white">{jobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/20">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Jobs</p>
                <p className="text-2xl font-bold text-white">{activeJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-cyan-500/20">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Executions</p>
                <p className="text-2xl font-bold text-white">{totalExecutions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <CheckCircleIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-white">{successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="active">Active Only</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {jobs.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No sync jobs configured. Create one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                dataSource={dataSources.find(ds => ds.id === job.data_source_id)}
                onToggle={() => updateJobMutation.mutate({ 
                  id: job.id, 
                  data: { is_active: !job.is_active } 
                })}
                onDelete={() => deleteJobMutation.mutate(job.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              dataSource={dataSources.find(ds => ds.id === job.data_source_id)}
              onToggle={() => updateJobMutation.mutate({ 
                id: job.id, 
                data: { is_active: !job.is_active } 
              })}
              onDelete={() => deleteJobMutation.mutate(job.id)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function JobCard({ job, dataSource, onToggle, onDelete }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not scheduled';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-white/5 border-white/10 hover:border-cyan-500/30 transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-white">{job.name}</h3>
                <Badge className={getStatusColor(job.last_status)}>
                  {job.last_status || 'pending'}
                </Badge>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  {job.schedule_frequency}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Data Source: {dataSource?.source_name || 'Unknown'} ({dataSource?.provider})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={job.is_active}
                onCheckedChange={onToggle}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Last Run</p>
              <p className="text-sm text-white">{formatDate(job.last_run_at)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Next Run</p>
              <p className="text-sm text-white">{formatDate(job.next_run_at)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Executions</p>
              <p className="text-sm text-white">{job.execution_count || 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Success Rate</p>
              <p className="text-sm text-white">
                {job.execution_count > 0 
                  ? `${((job.success_count / job.execution_count) * 100).toFixed(1)}%`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {job.last_error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-red-400 font-semibold mb-1">Last Error:</p>
                <p className="text-xs text-slate-300">{job.last_error}</p>
              </div>
            </div>
          )}

          {job.execution_logs?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">Recent Executions:</p>
              <div className="space-y-1">
                {job.execution_logs.slice(0, 3).map((log, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                    <Badge className={getStatusColor(log.status)} style={{ fontSize: '10px', padding: '2px 6px' }}>
                      {log.status}
                    </Badge>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span>{log.duration_ms}ms</span>
                    {log.nodes_created > 0 && (
                      <>
                        <span>•</span>
                        <span>{log.nodes_created} nodes</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreateJobForm({ dataSources, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    data_source_id: '',
    schedule_frequency: 'daily',
    schedule_time: '00:00',
    is_active: true,
    config: {
      auto_retry: true,
      max_retries: 3,
      notify_on_failure: false,
      notification_emails: []
    }
  });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white">Job Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-slate-800 border-slate-700 text-white"
          placeholder="e.g., Daily Stock Data Sync"
        />
      </div>

      <div>
        <Label className="text-white">Data Source</Label>
        <Select
          value={formData.data_source_id}
          onValueChange={(value) => setFormData({ ...formData, data_source_id: value })}
        >
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Select data source" />
          </SelectTrigger>
          <SelectContent>
            {dataSources.map((ds) => (
              <SelectItem key={ds.id} value={ds.id}>
                {ds.source_name} ({ds.provider})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Frequency</Label>
          <Select
            value={formData.schedule_frequency}
            onValueChange={(value) => setFormData({ ...formData, schedule_frequency: value })}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white">Time (HH:MM)</Label>
          <Input
            type="time"
            value={formData.schedule_time}
            onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label className="text-white">Start active</Label>
      </div>

      <Button
        onClick={() => onSubmit(formData)}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
      >
        Create Job
      </Button>
    </div>
  );
}