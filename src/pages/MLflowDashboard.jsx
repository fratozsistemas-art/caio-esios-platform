import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FlaskConical,
  Plus,
  TrendingUp,
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
  Package,
  RefreshCw,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import RunComparisonChart from "../components/mlflow/RunComparisonChart";
import ModelVersionManager from "../components/mlflow/ModelVersionManager";
import ModelPerformanceTrends from "../components/mlflow/ModelPerformanceTrends";
import ArtifactExplorer from "../components/mlflow/ArtifactExplorer";

export default function MLflowDashboard() {
  const [newExpName, setNewExpName] = useState("");
  const [showNewExpDialog, setShowNewExpDialog] = useState(false);
  const [selectedExp, setSelectedExp] = useState(null);
  const [selectedRuns, setSelectedRuns] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedRunForArtifacts, setSelectedRunForArtifacts] = useState(null);
  const queryClient = useQueryClient();

  const { data: experiments = [], isLoading: loadingExps, refetch: refetchExps } = useQuery({
    queryKey: ['mlflow_experiments'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('mlflowClient', {
        action: 'listExperiments',
        data: {}
      });
      return data.experiments;
    }
  });

  const { data: runs = [] } = useQuery({
    queryKey: ['mlflow_runs', selectedExp?.experiment_id],
    queryFn: async () => {
      if (!selectedExp) return [];
      const { data } = await base44.functions.invoke('mlflowClient', {
        action: 'searchRuns',
        data: {
          experiment_ids: [selectedExp.experiment_id],
          max_results: 100
        }
      });
      return data.runs;
    },
    enabled: !!selectedExp
  });

  const { data: models = [] } = useQuery({
    queryKey: ['mlflow_models'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('mlflowClient', {
        action: 'listModels',
        data: {}
      });
      return data.models;
    }
  });

  const { data: modelVersions = [] } = useQuery({
    queryKey: ['mlflow_model_versions', selectedModel?.name],
    queryFn: async () => {
      if (!selectedModel) return [];
      const { data } = await base44.functions.invoke('mlflowClient', {
        action: 'getModelVersions',
        data: { model_name: selectedModel.name }
      });
      return data.versions;
    },
    enabled: !!selectedModel
  });

  const toggleRunSelection = (run) => {
    setSelectedRuns(prev => {
      const isSelected = prev.some(r => r.info.run_id === run.info.run_id);
      if (isSelected) {
        return prev.filter(r => r.info.run_id !== run.info.run_id);
      }
      return [...prev, run];
    });
  };

  const createExpMutation = useMutation({
    mutationFn: async (name) => {
      return base44.functions.invoke('mlflowClient', {
        action: 'createExperiment',
        data: { name, tags: { created_by: 'caio_ai' } }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlflow_experiments'] });
      setShowNewExpDialog(false);
      setNewExpName("");
    }
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'FINISHED': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'RUNNING': return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatMetrics = (run) => {
    if (!run?.data?.metrics) return [];
    return run.data.metrics.map(m => ({
      name: m.key,
      value: m.value,
      step: m.step
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-cyan-400" />
            MLflow Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Track experiments, runs, and models
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetchExps();
              queryClient.invalidateQueries({ queryKey: ['mlflow_runs'] });
              queryClient.invalidateQueries({ queryKey: ['mlflow_models'] });
            }}
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showNewExpDialog} onOpenChange={setShowNewExpDialog}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                New Experiment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0A1628] border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">Create Experiment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Experiment name"
                  value={newExpName}
                  onChange={(e) => setNewExpName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button
                  onClick={() => createExpMutation.mutate(newExpName)}
                  disabled={!newExpName || createExpMutation.isPending}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  {createExpMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Experiments</p>
                <p className="text-3xl font-bold text-white">{experiments.length}</p>
              </div>
              <FlaskConical className="w-10 h-10 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Runs</p>
                <p className="text-3xl font-bold text-white">
                  {experiments.reduce((sum, exp) => sum + (parseInt(exp.last_update_time) || 0), 0)}
                </p>
              </div>
              <PlayCircle className="w-10 h-10 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Registered Models</p>
                <p className="text-3xl font-bold text-white">{models.length}</p>
              </div>
              <Package className="w-10 h-10 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="experiments" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="runs">Runs</TabsTrigger>
          <TabsTrigger value="comparison">Run Comparison</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="registry">Model Registry</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
        </TabsList>

        {/* Experiments Tab */}
        <TabsContent value="experiments" className="space-y-4">
          {loadingExps ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                <p className="text-slate-400">Loading experiments...</p>
              </CardContent>
            </Card>
          ) : experiments.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <FlaskConical className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No experiments yet</p>
                <Button onClick={() => setShowNewExpDialog(true)} className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Experiment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {experiments.map((exp, idx) => (
                <motion.div
                  key={exp.experiment_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className={`bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-all ${
                      selectedExp?.experiment_id === exp.experiment_id ? 'border-cyan-500/50' : ''
                    }`}
                    onClick={() => setSelectedExp(exp)}
                  >
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FlaskConical className="w-5 h-5 text-cyan-400" />
                          {exp.name}
                        </span>
                        <Badge variant="outline" className="border-white/20 text-slate-300">
                          ID: {exp.experiment_id}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Lifecycle Stage</p>
                          <p className="text-white font-medium">{exp.lifecycle_stage}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Artifact Location</p>
                          <p className="text-white font-mono text-xs truncate">{exp.artifact_location}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Last Updated</p>
                          <p className="text-white">
                            {exp.last_update_time ? new Date(parseInt(exp.last_update_time)).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Runs Tab */}
        <TabsContent value="runs" className="space-y-4">
          {selectedRuns.length > 0 && (
            <Card className="bg-cyan-500/10 border-cyan-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">{selectedRuns.length} runs selected for comparison</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedRuns([])}
                    className="border-white/20 text-slate-300"
                  >
                    Clear Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!selectedExp ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <PlayCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Select an experiment to view runs</p>
              </CardContent>
            </Card>
          ) : runs.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <PlayCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No runs in this experiment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {runs.map((run, idx) => (
                <motion.div
                  key={run.info.run_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`bg-white/5 border-white/10 ${selectedRuns.some(r => r.info.run_id === run.info.run_id) ? 'border-cyan-500/50 bg-cyan-500/5' : ''}`}>
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <span className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedRuns.some(r => r.info.run_id === run.info.run_id)}
                            onCheckedChange={() => toggleRunSelection(run)}
                            className="border-white/20"
                          />
                          {getStatusIcon(run.info.status)}
                          Run {run.info.run_name || run.info.run_id.substring(0, 8)}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRunForArtifacts(run)}
                            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                          >
                            Artifacts
                          </Button>
                          <Badge className={`${
                            run.info.status === 'FINISHED' ? 'bg-green-500/20 text-green-400' :
                            run.info.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {run.info.status}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Metrics */}
                      {run.data?.metrics && run.data.metrics.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-400 mb-2">Metrics</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {run.data.metrics.slice(0, 4).map(metric => (
                              <div key={metric.key} className="bg-white/5 rounded p-2">
                                <p className="text-xs text-slate-400">{metric.key}</p>
                                <p className="text-white font-semibold">{metric.value.toFixed(4)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Params */}
                      {run.data?.params && run.data.params.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-400 mb-2">Parameters</p>
                          <div className="flex flex-wrap gap-2">
                            {run.data.params.map(param => (
                              <Badge key={param.key} variant="outline" className="border-white/20 text-slate-300">
                                {param.key}: {param.value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Timing */}
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Started: {new Date(run.info.start_time).toLocaleString()}</span>
                        {run.info.end_time && (
                          <span>Ended: {new Date(run.info.end_time).toLocaleString()}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Run Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <RunComparisonChart selectedRuns={selectedRuns} />
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4">
          {models.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No registered models</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {models.map((model, idx) => (
                <motion.div
                  key={model.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className={`bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-all ${
                      selectedModel?.name === model.name ? 'border-cyan-500/50' : ''
                    }`}
                    onClick={() => setSelectedModel(model)}
                  >
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-green-400" />
                        {model.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-400 mb-2">{model.description || 'No description'}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Created: {new Date(parseInt(model.creation_timestamp)).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Updated: {new Date(parseInt(model.last_updated_timestamp)).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Model Registry Tab */}
        <TabsContent value="registry" className="space-y-4">
          <ModelVersionManager model={selectedModel} />
        </TabsContent>

        {/* Performance Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <ModelPerformanceTrends model={selectedModel} versions={modelVersions} />
        </TabsContent>

        {/* Artifacts Tab */}
        <TabsContent value="artifacts" className="space-y-4">
          <ArtifactExplorer run={selectedRunForArtifacts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}