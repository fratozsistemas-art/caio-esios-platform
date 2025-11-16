import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Upload, Database, TrendingUp, Play, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AGENT_TYPES = [
  { value: 'data_analyst', label: 'Data Analyst' },
  { value: 'code_generation', label: 'Code Generation' },
  { value: 'security', label: 'Security' },
  { value: 'research', label: 'Research' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'synthesis', label: 'Synthesis' }
];

export default function AgentTrainingHub({ onClose }) {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const queryClient = useQueryClient();

  const { data: datasets = [] } = useQuery({
    queryKey: ['training_datasets'],
    queryFn: () => base44.entities.AgentTrainingDataset.list('-created_date')
  });

  const { data: fineTunedAgents = [] } = useQuery({
    queryKey: ['fine_tuned_agents'],
    queryFn: () => base44.entities.FineTunedAgent.list('-created_date')
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, agentType, name }) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Validate dataset
      const validation = await base44.functions.invoke('validateTrainingDataset', {
        file_url,
        agent_type: agentType
      });

      return await base44.entities.AgentTrainingDataset.create({
        name,
        agent_type: agentType,
        file_url,
        format: file.name.endsWith('.jsonl') ? 'jsonl' : file.name.endsWith('.csv') ? 'csv' : 'json',
        records_count: validation.data.records_count,
        status: 'ready',
        validation_results: validation.data.validation_results
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['training_datasets']);
      toast.success('Dataset uploaded and validated');
      setUploadingFile(false);
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
      setUploadingFile(false);
    }
  });

  const startFineTuningMutation = useMutation({
    mutationFn: async (datasetId) => {
      const dataset = datasets.find(d => d.id === datasetId);
      
      const { data } = await base44.functions.invoke('startFineTuning', {
        dataset_id: datasetId,
        agent_type: dataset.agent_type,
        base_model: 'gpt-4o-mini'
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['fine_tuned_agents']);
      toast.success('Fine-tuning job started');
    },
    onError: (error) => {
      toast.error(`Failed to start fine-tuning: ${error.message}`);
    }
  });

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Agent Training Hub
          </CardTitle>
          {onClose && (
            <Button variant="ghost" onClick={onClose} className="text-slate-400">
              ✕
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="datasets">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="datasets">
              <Database className="w-4 h-4 mr-2" />
              Datasets
            </TabsTrigger>
            <TabsTrigger value="models">
              <Brain className="w-4 h-4 mr-2" />
              Fine-tuned Models
            </TabsTrigger>
            <TabsTrigger value="benchmarks">
              <TrendingUp className="w-4 h-4 mr-2" />
              Benchmarks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="datasets" className="space-y-4 mt-4">
            <DatasetUpload 
              onUpload={(data) => {
                setUploadingFile(true);
                uploadMutation.mutate(data);
              }}
              isUploading={uploadMutation.isPending}
            />

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-white">Available Datasets</h3>
              {datasets.map(dataset => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  onSelect={setSelectedDataset}
                  onStartTraining={(id) => startFineTuningMutation.mutate(id)}
                  isTraining={startFineTuningMutation.isPending}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-2 mt-4">
            {fineTunedAgents.map(model => (
              <FineTunedModelCard key={model.id} model={model} />
            ))}
            {fineTunedAgents.length === 0 && (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No fine-tuned models yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="benchmarks" className="mt-4">
            <BenchmarkComparison fineTunedAgents={fineTunedAgents} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function DatasetUpload({ onUpload, isUploading }) {
  const [file, setFile] = useState(null);
  const [agentType, setAgentType] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (!file || !agentType || !name) {
      toast.error('Please fill all fields');
      return;
    }
    onUpload({ file, agentType, name });
  };

  return (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-medium text-blue-400">Upload Training Dataset</h3>
      
      <div>
        <Label className="text-slate-400 text-xs">Dataset Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Security Analysis Examples"
          className="bg-white/5 border-white/10 text-white mt-1"
        />
      </div>

      <div>
        <Label className="text-slate-400 text-xs">Agent Type</Label>
        <Select value={agentType} onValueChange={setAgentType}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
            <SelectValue placeholder="Select agent type" />
          </SelectTrigger>
          <SelectContent>
            {AGENT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-slate-400 text-xs">Training Data File (JSONL, CSV, JSON)</Label>
        <Input
          type="file"
          accept=".jsonl,.csv,.json"
          onChange={(e) => setFile(e.target.files[0])}
          className="bg-white/5 border-white/10 text-white mt-1"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isUploading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Dataset
          </>
        )}
      </Button>
    </div>
  );
}

function DatasetCard({ dataset, onSelect, onStartTraining, isTraining }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{dataset.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
              {dataset.agent_type}
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
              {dataset.records_count} examples
            </Badge>
            <Badge className={`text-xs ${
              dataset.status === 'ready' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}>
              {dataset.status}
            </Badge>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => onStartTraining(dataset.id)}
          disabled={isTraining || dataset.status !== 'ready'}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Play className="w-3 h-3 mr-1" />
          Train
        </Button>
      </div>
    </div>
  );
}

function FineTunedModelCard({ model }) {
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-white">{model.model_name}</p>
          <p className="text-xs text-slate-400">{model.base_agent_type} • {model.base_model}</p>
        </div>
        <Badge className={`${
          model.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
          model.status === 'training' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
          model.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        }`}>
          {model.status}
        </Badge>
      </div>

      {model.training_metrics && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          {Object.entries(model.training_metrics).slice(0, 3).map(([key, value]) => (
            <div key={key} className="bg-black/20 rounded p-2">
              <p className="text-slate-500 capitalize">{key}</p>
              <p className="text-white font-medium">{typeof value === 'number' ? value.toFixed(4) : value}</p>
            </div>
          ))}
        </div>
      )}

      {model.is_active && (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-2">
          <CheckCircle className="w-3 h-3 mr-1" />
          Deployed
        </Badge>
      )}
    </div>
  );
}

function BenchmarkComparison({ fineTunedAgents }) {
  const completedModels = fineTunedAgents.filter(m => m.status === 'completed');

  if (completedModels.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">No completed models to compare</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {completedModels.map(model => (
        <div key={model.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-sm font-medium text-white mb-2">{model.model_name}</p>
          {model.performance_benchmarks && (
            <div className="space-y-2">
              {Object.entries(model.performance_benchmarks).map(([metric, value]) => (
                <div key={metric}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 capitalize">{metric}</span>
                    <span className="text-white font-medium">{value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}