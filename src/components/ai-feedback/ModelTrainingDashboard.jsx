import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Loader2, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ModelTrainingDashboard({ datasets, trainingJobs, onJobCreated }) {
  const [selectedDataset, setSelectedDataset] = useState('');
  const [modelType, setModelType] = useState('anomaly_detection');
  const queryClient = useQueryClient();

  const startTrainingMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('initiateModelTraining', {
        dataset_id: selectedDataset,
        model_type: modelType,
        hyperparameters: {
          learning_rate: 0.001,
          batch_size: 32,
          epochs: 50
        }
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      onJobCreated();
      setSelectedDataset('');
    },
    onError: (error) => {
      toast.error(`Failed to start training: ${error.message}`);
    }
  });

  const readyDatasets = datasets.filter(d => d.status === 'ready');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'queued': return Clock;
      case 'running': return Loader2;
      case 'completed': return CheckCircle;
      case 'failed': return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'queued': return 'text-yellow-400';
      case 'running': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Training Initiator */}
      <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            Start Model Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Select Dataset</label>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Choose a ready dataset..." />
              </SelectTrigger>
              <SelectContent>
                {readyDatasets.map(dataset => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    {dataset.name} ({dataset.sample_count} samples, {dataset.quality_score}% quality)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Model Type</label>
            <Select value={modelType} onValueChange={setModelType}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anomaly_detection">Anomaly Detection</SelectItem>
                <SelectItem value="prediction">Network Prediction</SelectItem>
                <SelectItem value="influencer_analysis">Influencer Analysis</SelectItem>
                <SelectItem value="relationship_classification">Relationship Classification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => startTrainingMutation.mutate()}
            disabled={startTrainingMutation.isPending || !selectedDataset}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {startTrainingMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Training...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Training Job
              </>
            )}
          </Button>

          {readyDatasets.length === 0 && (
            <p className="text-xs text-slate-500 text-center">
              No ready datasets available. Create a dataset first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Training Jobs */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Training Jobs</h3>
        <div className="space-y-3">
          {trainingJobs.map((job, idx) => {
            const StatusIcon = getStatusIcon(job.status);
            const statusColor = getStatusColor(job.status);

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <StatusIcon className={`w-5 h-5 ${statusColor} flex-shrink-0 mt-0.5 ${job.status === 'running' ? 'animate-spin' : ''}`} />
                        
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{job.job_name}</h4>
                          <p className="text-xs text-slate-400 mb-2">{job.model_type}</p>

                          {job.status === 'running' && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                <span>Progress</span>
                                <span>{job.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${job.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {job.status === 'completed' && job.metrics && (
                            <div className="grid grid-cols-4 gap-2 mt-2">
                              <div className="bg-white/5 rounded p-2">
                                <p className="text-xs text-slate-400">Accuracy</p>
                                <p className="text-sm text-green-400 font-semibold">
                                  {(job.metrics.accuracy * 100).toFixed(1)}%
                                </p>
                              </div>
                              <div className="bg-white/5 rounded p-2">
                                <p className="text-xs text-slate-400">Precision</p>
                                <p className="text-sm text-blue-400 font-semibold">
                                  {(job.metrics.precision * 100).toFixed(1)}%
                                </p>
                              </div>
                              <div className="bg-white/5 rounded p-2">
                                <p className="text-xs text-slate-400">Recall</p>
                                <p className="text-sm text-purple-400 font-semibold">
                                  {(job.metrics.recall * 100).toFixed(1)}%
                                </p>
                              </div>
                              <div className="bg-white/5 rounded p-2">
                                <p className="text-xs text-slate-400">F1 Score</p>
                                <p className="text-sm text-yellow-400 font-semibold">
                                  {(job.metrics.f1_score * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Badge className={`${statusColor.replace('text-', 'bg-').replace('400', '500/20')} ${statusColor}`}>
                        {job.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-white/10">
                      <span>Started {new Date(job.started_at).toLocaleString()}</span>
                      {job.model_version && (
                        <span>Version: {job.model_version}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {trainingJobs.length === 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">No training jobs yet</p>
                <p className="text-xs text-slate-500 mt-1">Start a training job to fine-tune AI models</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}