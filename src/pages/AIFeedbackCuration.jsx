import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, Database, Star, ThumbsUp, ThumbsDown, Filter, 
  CheckSquare, Package, Play, Loader2, TrendingUp, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import FeedbackReviewPanel from '../components/ai-feedback/FeedbackReviewPanel';
import DatasetBuilder from '../components/ai-feedback/DatasetBuilder';
import ModelTrainingDashboard from '../components/ai-feedback/ModelTrainingDashboard';

export default function AIFeedbackCuration() {
  const [activeTab, setActiveTab] = useState('review');
  const [selectedFeedback, setSelectedFeedback] = useState([]);
  const queryClient = useQueryClient();

  const { data: allFeedback = [], isLoading } = useQuery({
    queryKey: ['ai_feedback_all'],
    queryFn: () => base44.entities.AIInsightFeedback.list('-created_date', 500)
  });

  const { data: datasets = [] } = useQuery({
    queryKey: ['training_datasets'],
    queryFn: () => base44.entities.AITrainingDataset.list('-created_date')
  });

  const { data: trainingJobs = [] } = useQuery({
    queryKey: ['training_jobs'],
    queryFn: () => base44.entities.ModelTrainingJob.list('-started_at'),
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const feedbackStats = {
    total: allFeedback.length,
    helpful: allFeedback.filter(f => f.was_helpful).length,
    falsePositives: allFeedback.filter(f => f.false_positive).length,
    avgAccuracy: allFeedback.length > 0
      ? (allFeedback.reduce((sum, f) => sum + (f.accuracy_rating || 0), 0) / allFeedback.length).toFixed(1)
      : 0,
    byType: {
      anomaly: allFeedback.filter(f => f.insight_type === 'anomaly').length,
      prediction: allFeedback.filter(f => f.insight_type === 'prediction').length,
      influencer: allFeedback.filter(f => f.insight_type === 'influencer').length
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            AI Feedback Curation
          </h1>
          <p className="text-slate-400 mt-1">
            Review feedback, curate training data, and fine-tune AI models
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Feedback</p>
                <p className="text-2xl font-bold text-white">{feedbackStats.total}</p>
              </div>
              <Database className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Helpful</p>
                <p className="text-2xl font-bold text-green-400">{feedbackStats.helpful}</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Avg Accuracy</p>
                <p className="text-2xl font-bold text-yellow-400">{feedbackStats.avgAccuracy}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Datasets Ready</p>
                <p className="text-2xl font-bold text-purple-400">
                  {datasets.filter(d => d.status === 'ready').length}
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="review" className="data-[state=active]:bg-white/10">
            <Filter className="w-4 h-4 mr-2" />
            Review Feedback
          </TabsTrigger>
          <TabsTrigger value="datasets" className="data-[state=active]:bg-white/10">
            <Package className="w-4 h-4 mr-2" />
            Datasets
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-white/10">
            <Play className="w-4 h-4 mr-2" />
            Model Training
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          <FeedbackReviewPanel
            feedback={allFeedback}
            selectedFeedback={selectedFeedback}
            onSelectFeedback={setSelectedFeedback}
            stats={feedbackStats}
          />
        </TabsContent>

        <TabsContent value="datasets" className="space-y-4">
          <DatasetBuilder
            selectedFeedback={selectedFeedback}
            onDatasetCreated={() => {
              queryClient.invalidateQueries(['training_datasets']);
              setSelectedFeedback([]);
              toast.success('Dataset created successfully');
            }}
          />
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <ModelTrainingDashboard
            datasets={datasets}
            trainingJobs={trainingJobs}
            onJobCreated={() => {
              queryClient.invalidateQueries(['training_jobs']);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}