import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Upload, Zap, TrendingUp, Database, Cpu, CheckCircle, AlertCircle, Activity } from "lucide-react";
import AgentTrainingHub from "../components/orchestration/AgentTrainingHub";

export default function AgentTraining() {
  const [showTrainingHub, setShowTrainingHub] = useState(true);

  const { data: datasets = [] } = useQuery({
    queryKey: ['training_datasets'],
    queryFn: () => base44.entities.AgentTrainingDataset.list('-created_date', 50)
  });

  const { data: fineTunedAgents = [] } = useQuery({
    queryKey: ['fine_tuned_agents'],
    queryFn: () => base44.entities.FineTunedAgent.list('-created_date', 50)
  });

  const { data: performanceMetrics = [] } = useQuery({
    queryKey: ['agent_performance_metrics'],
    queryFn: () => base44.entities.AgentPerformanceMetric.list('-created_date', 200)
  });

  const activeModels = fineTunedAgents.filter(a => a.is_active).length;
  const trainingModels = fineTunedAgents.filter(a => a.status === 'training').length;
  const completedModels = fineTunedAgents.filter(a => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Agent Training & Fine-Tuning
          </h1>
          <p className="text-slate-400 mt-1">
            Train and fine-tune AI agents with custom datasets for specialized tasks
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Training Datasets</p>
                <p className="text-2xl font-bold text-white">{datasets.length}</p>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Ready
                </Badge>
              </div>
              <Database className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Active Models</p>
                <p className="text-2xl font-bold text-white">{activeModels}</p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Deployed
                </Badge>
              </div>
              <Cpu className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Training</p>
                <p className="text-2xl font-bold text-white">{trainingModels}</p>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  In Progress
                </Badge>
              </div>
              <Activity className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-white">{completedModels}</p>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  Available
                </Badge>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Features Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">Upload Custom Datasets</h3>
                <p className="text-xs text-slate-400">
                  Train agents with your domain-specific data in JSONL, CSV, or JSON format
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">Fine-Tune Models</h3>
                <p className="text-xs text-slate-400">
                  Configure hyperparameters and train specialized models for your use cases
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">Evaluate & Deploy</h3>
                <p className="text-xs text-slate-400">
                  Monitor performance benchmarks and deploy models to production
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Hub */}
      {showTrainingHub && (
        <AgentTrainingHub onClose={() => setShowTrainingHub(false)} />
      )}

      {/* Quick Guide */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-400">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Upload Training Dataset</p>
              <p className="text-xs text-slate-400 mt-1">
                Prepare your data in JSONL format with input/output pairs. Each line should contain a training example.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-purple-400">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Configure Fine-Tuning</p>
              <p className="text-xs text-slate-400 mt-1">
                Select base model, agent type, and training parameters. Monitor validation metrics during training.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-green-400">3</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Evaluate & Deploy</p>
              <p className="text-xs text-slate-400 mt-1">
                Run performance evaluations, compare with baseline, and deploy to Chat with CAIO or workflows.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-cyan-400">4</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Monitor Performance</p>
              <p className="text-xs text-slate-400 mt-1">
                Track accuracy, response quality, and cost metrics. Fine-tune further based on real-world usage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}