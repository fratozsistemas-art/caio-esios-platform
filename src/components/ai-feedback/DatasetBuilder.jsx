import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DatasetBuilder({ selectedFeedback, onDatasetCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [datasetType, setDatasetType] = useState('mixed');

  const createDatasetMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('prepareTrainingDataset', {
        feedback_ids: selectedFeedback,
        dataset_type: datasetType,
        name,
        description,
        manual_labels: []
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      onDatasetCreated();
      setName('');
      setDescription('');
    },
    onError: (error) => {
      toast.error(`Failed to create dataset: ${error.message}`);
    }
  });

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            Create Training Dataset
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-sm text-white mb-1">
              {selectedFeedback.length} feedback items selected
            </p>
            <p className="text-xs text-slate-400">
              Minimum 10 items recommended for quality training data
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Dataset Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Anomaly Detection Q1 2025"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this dataset..."
              className="bg-white/5 border-white/10 text-white min-h-20"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Dataset Type</label>
            <Select value={datasetType} onValueChange={setDatasetType}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anomaly_detection">Anomaly Detection</SelectItem>
                <SelectItem value="prediction">Prediction Models</SelectItem>
                <SelectItem value="influencer_analysis">Influencer Analysis</SelectItem>
                <SelectItem value="relationship_classification">Relationship Classification</SelectItem>
                <SelectItem value="mixed">Mixed (All Types)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => createDatasetMutation.mutate()}
            disabled={createDatasetMutation.isPending || selectedFeedback.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {createDatasetMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Dataset...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Dataset
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}