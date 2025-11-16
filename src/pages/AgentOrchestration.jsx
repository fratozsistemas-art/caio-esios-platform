import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GitMerge, Plus, Play, Eye, Settings, TrendingUp, 
  Activity, Clock, CheckCircle
} from "lucide-react";
import WorkflowBuilder from "../components/orchestration/WorkflowBuilder";
import WorkflowExecutionMonitor from "../components/orchestration/WorkflowExecutionMonitor";
import EnhancedWorkflowVisualizer from "../components/orchestration/EnhancedWorkflowVisualizer";
import DataFlowVisualizer from "../components/orchestration/DataFlowVisualizer";

export default function AgentOrchestration() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [focusedStep, setFocusedStep] = useState(null);
  const queryClient = useQueryClient();

  const { data: workflows = [] } = useQuery({
    queryKey: ['agent_workflows'],
    queryFn: () => base44.entities.AgentWorkflow.list()
  });

  const { data: executions = [] } = useQuery({
    queryKey: ['workflow_executions'],
    queryFn: async () => {
      const data = await base44.entities.WorkflowExecution.list('-created_date', 10);
      return data;
    }
  });

  const activeWorkflows = workflows.filter(w => w.status === 'active');
  const runningExecutions = executions.filter(e => e.status === 'running');

  const currentExecution = selectedExecution 
    ? executions.find(e => e.id === selectedExecution)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GitMerge className="w-8 h-8 text-purple-400" />
            Agent Orchestration Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Multi-step AI workflows with explainable data flow
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowMonitor(!showMonitor)}
            variant="outline"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <Activity className="w-4 h-4 mr-2" />
            Monitor Executions
          </Button>
          <Button
            onClick={() => setShowBuilder(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Active Workflows</p>
                <p className="text-2xl font-bold text-white">{activeWorkflows.length}</p>
              </div>
              <GitMerge className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Running Now</p>
                <p className="text-2xl font-bold text-white">{runningExecutions.length}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Executions</p>
                <p className="text-2xl font-bold text-white">{executions.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Avg Success Rate</p>
                <p className="text-2xl font-bold text-white">
                  {workflows.length > 0 
                    ? Math.round(workflows.reduce((acc, w) => acc + (w.success_rate || 0), 0) / workflows.length)
                    : 0}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {showMonitor ? (
        <WorkflowExecutionMonitor 
          executions={executions}
          onClose={() => setShowMonitor(false)}
        />
      ) : showBuilder ? (
        <WorkflowBuilder 
          workflow={selectedWorkflow}
          onClose={() => {
            setShowBuilder(false);
            setSelectedWorkflow(null);
          }}
          onSave={() => {
            queryClient.invalidateQueries(['agent_workflows']);
            setShowBuilder(false);
            setSelectedWorkflow(null);
          }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Configured Workflows</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workflows.map((workflow) => (
                  <WorkflowCard 
                    key={workflow.id}
                    workflow={workflow}
                    onView={(exec) => {
                      setSelectedWorkflow(workflow);
                      setSelectedExecution(exec);
                    }}
                    onEdit={() => {
                      setSelectedWorkflow(workflow);
                      setShowBuilder(true);
                    }}
                  />
                ))}
                {workflows.length === 0 && (
                  <div className="text-center py-12">
                    <GitMerge className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">No workflows configured yet</p>
                    <Button
                      onClick={() => setShowBuilder(true)}
                      size="sm"
                      className="mt-4 bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Workflow
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedWorkflow && currentExecution && (
              <DataFlowVisualizer 
                workflow={selectedWorkflow}
                execution={currentExecution}
                focusedStep={focusedStep}
              />
            )}
          </div>

          {selectedWorkflow && (
            <EnhancedWorkflowVisualizer 
              workflow={selectedWorkflow} 
              execution={currentExecution}
              onStepFocus={setFocusedStep}
            />
          )}
        </div>
      )}
    </div>
  );
}

function WorkflowCard({ workflow, onView, onEdit }) {
  const [executing, setExecuting] = useState(false);
  const queryClient = useQueryClient();

  const executeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('executeWorkflow', {
        workflow_id: workflow.id,
        inputs: {}
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['workflow_executions']);
      onView(data.execution_id);
      setExecuting(false);
    }
  });

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-medium">{workflow.name}</h3>
          <p className="text-xs text-slate-400 mt-1">{workflow.description}</p>
          <div className="flex gap-2 mt-2">
            <Badge className={
              workflow.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              'bg-slate-500/20 text-slate-400 border-slate-500/30'
            }>
              {workflow.status}
            </Badge>
            <Badge variant="outline" className="border-white/20 text-slate-300 text-xs">
              {workflow.steps?.length || 0} steps
            </Badge>
            <Badge variant="outline" className="border-white/20 text-slate-300 text-xs">
              {workflow.execution_mode}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {workflow.execution_count || 0} runs
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {Math.round(workflow.success_rate || 0)}% success
          </span>
          {workflow.avg_duration_seconds && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {workflow.avg_duration_seconds.toFixed(1)}s avg
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onView(null)}
          className="flex-1 text-slate-400 hover:text-white"
        >
          <Eye className="w-3 h-3 mr-1" />
          View
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onEdit}
          className="flex-1 text-slate-400 hover:text-white"
        >
          <Settings className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setExecuting(true);
            executeMutation.mutate();
          }}
          disabled={executing || workflow.status !== 'active'}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          <Play className="w-3 h-3 mr-1" />
          Run
        </Button>
      </div>
    </div>
  );
}