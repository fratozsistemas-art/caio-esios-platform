
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GitMerge, Plus, Play, Eye, Settings, TrendingUp,
  Activity, Clock, CheckCircle, Workflow, Zap, Network, History, Brain // Added History icon and Brain icon
} from "lucide-react";
import WorkflowBuilder from "../components/orchestration/WorkflowBuilder";
import WorkflowExecutionMonitor from "../components/orchestration/WorkflowExecutionMonitor";
import EnhancedWorkflowVisualizer from "../components/orchestration/EnhancedWorkflowVisualizer";
import DataFlowVisualizer from "../components/orchestration/DataFlowVisualizer";
import HierarchicalAgentBuilder from "../components/orchestration/HierarchicalAgentBuilder";
import AgentHierarchyVisualizer from "../components/orchestration/AgentHierarchyVisualizer";
import AgentCommunicationLog from "../components/orchestration/AgentCommunicationLog";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast"; // Assuming react-hot-toast is installed and configured
import RealtimeExecutionGraph from "../components/orchestration/RealtimeExecutionGraph";
import DebugPanel from "../components/orchestration/DebugPanel";
import VersionHistory from "../components/orchestration/VersionHistory"; // New import
import VersionCompare from "../components/orchestration/VersionCompare"; // New import
import AgentTrainingHub from "../components/orchestration/AgentTrainingHub"; // New import

export default function AgentOrchestration() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [showExecutionMonitor, setShowExecutionMonitor] = useState(false);
  const [showHierarchyBuilder, setShowHierarchyBuilder] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [agentConfig, setAgentConfig] = useState({ agents: [] });
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [showDebugMode, setShowDebugMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState(null); // New state
  const [showVersionHistory, setShowVersionHistory] = useState(false); // New state
  const [showTrainingHub, setShowTrainingHub] = useState(false); // New state

  const queryClient = useQueryClient();

  const { data: workflows = [], refetch: refetchWorkflows } = useQuery({
    queryKey: ['agent_workflows'],
    queryFn: () => base44.entities.AgentWorkflow.list()
  });

  const { data: executions = [] } = useQuery({
    queryKey: ['workflow_executions'],
    queryFn: () => base44.entities.WorkflowExecution.list('-created_date', 10)
  });

  const { data: graphStats } = useQuery({
    queryKey: ['graph_stats_orchestration'],
    queryFn: async () => {
      const nodes = await base44.entities.KnowledgeGraphNode.list();
      const relationships = await base44.entities.KnowledgeGraphRelationship.list();
      return {
        total_nodes: nodes.length,
        total_relationships: relationships.length
      };
    }
  });

  const activeWorkflows = workflows.filter(w => w.status === 'active'); // Keep for potential future use or dashboard consistency
  const runningExecutions = executions.filter(e => e.status === 'running'); // Keep for potential future use or dashboard consistency

  const successRate = workflows.length > 0
    ? workflows.reduce((sum, w) => sum + (w.success_rate || 0), 0) / workflows.length
    : 0;

  const handleControlAction = (action, agentId) => {
    console.log(`Control action: ${action} for agent ${agentId}`);
    toast.success(`${action} action triggered for ${agentId}`);
  };

  const handleVersionRevert = (workflowSnapshot) => { // New function
    setSelectedWorkflow(workflowSnapshot);
    setAgentConfig(workflowSnapshot.hierarchical_config || { agents: [] });
    queryClient.invalidateQueries(['agent_workflows']);
    toast.success(`Workflow reverted to version ${workflowSnapshot.version_number || workflowSnapshot.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GitMerge className="w-8 h-8 text-purple-400" />
            Agent Orchestration
          </h1>
          <p className="text-slate-400 mt-1">
            Design and execute hierarchical multi-agent workflows with inter-agent communication
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowTrainingHub(!showTrainingHub)}
            className={showTrainingHub
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
            }
          >
            <Brain className="w-4 h-4 mr-2" />
            {showTrainingHub ? 'Hide' : 'AI Training'}
          </Button>
          {selectedWorkflow && ( // New button for version history
            <Button
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className={showVersionHistory
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              }
            >
              <History className="w-4 h-4 mr-2" />
              {showVersionHistory ? 'Hide' : 'Show'} Versions
            </Button>
          )}
          <Button
            onClick={() => setShowHierarchyBuilder(!showHierarchyBuilder)}
            className={showHierarchyBuilder
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
            }
          >
            <GitMerge className="w-4 h-4 mr-2" />
            {showHierarchyBuilder ? 'Hide' : 'Configure'} Hierarchy
          </Button>
          <Button
            onClick={() => setShowBuilder(!showBuilder)}
            className={showBuilder
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
            }
          >
            <Workflow className="w-4 h-4 mr-2" />
            {showBuilder ? 'Hide' : 'Create'} Workflow
          </Button>
          <Button
            onClick={() => setShowExecutionMonitor(!showExecutionMonitor)}
            variant="outline"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <Activity className="w-4 h-4 mr-2" />
            Monitor
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Active Workflows</p>
                <p className="text-2xl font-bold text-white">{workflows.length}</p>
              </div>
              <Workflow className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Running Executions</p>
                <p className="text-2xl font-bold text-white">
                  {executions.filter(e => e.status === 'running').length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-white">{Math.round(successRate)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Graph Entities</p>
                <p className="text-2xl font-bold text-white">{graphStats?.total_nodes || 0}</p>
              </div>
              <Network className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Hub */}
      {showTrainingHub && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <AgentTrainingHub onClose={() => setShowTrainingHub(false)} />
        </motion.div>
      )}

      {/* Hierarchy Builder */}
      {showHierarchyBuilder && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Hierarchical Agent Configuration</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowHierarchyBuilder(false)}
                  className="text-slate-400"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <HierarchicalAgentBuilder
                agentConfig={agentConfig}
                onChange={setAgentConfig}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Workflow Builder */}
      {showBuilder && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <WorkflowBuilder onSave={() => {
            setShowBuilder(false);
            refetchWorkflows();
            setSelectedWorkflow(null); // Clear selected workflow if a new one is saved
          }}
          onClose={() => {
            setShowBuilder(false);
            setSelectedWorkflow(null);
          }}
          workflow={selectedWorkflow} // Pass selected workflow for editing
          />
        </motion.div>
      )}

      {/* Execution Monitor */}
      {showExecutionMonitor && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <WorkflowExecutionMonitor
            executions={executions}
            onClose={() => setShowExecutionMonitor(false)}
            onSelectExecution={setSelectedExecution}
          />
        </motion.div>
      )}

      {/* Workflows List */}
      {!showBuilder && !showHierarchyBuilder && !showExecutionMonitor && !showTrainingHub && (
        <div className="grid grid-cols-1 gap-4">
          <h2 className="text-xl font-bold text-white">Configured Workflows</h2>
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
          {workflows.map(workflow => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onSelect={(w) => {
                setSelectedWorkflow(w);
                setSelectedExecution(null);
              }}
              onEdit={(w) => {
                setSelectedWorkflow(w);
                setShowBuilder(true);
              }}
              onConfigureHierarchy={(w) => {
                setSelectedWorkflow(w);
                setShowHierarchyBuilder(true);
                if (w.hierarchical_config) {
                  setAgentConfig(w.hierarchical_config);
                } else {
                  setAgentConfig({ agents: [] });
                }
              }}
              selected={selectedWorkflow?.id === workflow.id}
            />
          ))}
        </div>
      )}

      {/* Enhanced Workflow Visualization with Debug Mode & Version Control */}
      {selectedWorkflow && !showBuilder && !showHierarchyBuilder && !showExecutionMonitor && !showTrainingHub && (
        <>
          {/* Compare Versions Dialog */}
          {compareVersions && (
            <VersionCompare
              version1={compareVersions[0]}
              version2={compareVersions[1]}
              onClose={() => setCompareVersions(null)}
            />
          )}

          <div className="flex items-center justify-end gap-2">
            <Badge className={showDebugMode ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}>
              {showDebugMode ? 'Debug Mode Active' : 'Debug Mode Off'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDebugMode(!showDebugMode)}
              className={`${showDebugMode ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 'bg-white/5 border-white/10 text-white'} hover:bg-orange-500/30`}
            >
              <Activity className="w-4 h-4 mr-2" />
              {showDebugMode ? 'Exit Debug' : 'Enter Debug'}
            </Button>
          </div>

          <div className={showVersionHistory ? "grid grid-cols-3 gap-6" : (showDebugMode ? "grid grid-cols-2 gap-6" : "grid grid-cols-3 gap-6")}>
            {/* Version History Panel */}
            {showVersionHistory && (
              <div className="space-y-4">
                <VersionHistory
                  workflow={selectedWorkflow}
                  onRevert={handleVersionRevert}
                  onCompare={(v1, v2) => setCompareVersions([v1, v2])}
                />
              </div>
            )}

            {/* Main Execution Graph */}
            <div className={showVersionHistory ? "col-span-1 space-y-4" : (showDebugMode ? "col-span-1 space-y-4" : "col-span-2 space-y-4")}>
              {selectedExecution ? (
                <RealtimeExecutionGraph
                  execution={selectedExecution}
                  workflow={selectedWorkflow}
                  onAgentSelect={setSelectedAgentId}
                  onControlAction={handleControlAction}
                />
              ) : (
                <EnhancedWorkflowVisualizer
                  workflow={selectedWorkflow}
                  execution={selectedExecution}
                  onStepFocus={() => { }}
                />
              )}
              {selectedWorkflow.hierarchical_config?.agents && selectedWorkflow.hierarchical_config.agents.length > 0 && (
                <AgentHierarchyVisualizer
                  agentConfig={selectedWorkflow.hierarchical_config}
                  execution={selectedExecution}
                />
              )}
            </div>

            {/* Side Panel - Debug or Standard View */}
            <div className={showVersionHistory ? "col-span-1 space-y-4" : (showDebugMode ? "col-span-1 space-y-4" : "space-y-4")}>
              {showDebugMode && selectedExecution ? (
                <DebugPanel
                  execution={selectedExecution}
                  selectedAgentId={selectedAgentId}
                />
              ) : (
                <>
                  <DataFlowVisualizer
                    workflow={selectedWorkflow}
                    execution={selectedExecution}
                    focusedStep={null}
                  />
                  {selectedExecution?.communication_log && (
                    <AgentCommunicationLog
                      communicationLog={selectedExecution.communication_log}
                      agentStates={selectedExecution.agent_states}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function WorkflowCard({ workflow, onSelect, onEdit, onConfigureHierarchy, selected }) {
  const queryClient = useQueryClient();

  const executeMutation = useMutation({
    mutationFn: async (workflowId) => {
      const { data } = await base44.functions.invoke('executeHierarchicalWorkflow', {
        workflow_id: workflowId,
        inputs: { test: true } // Example input
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workflow_executions']);
      toast.success('Workflow execution started');
    },
    onError: (error) => {
      toast.error(`Error starting workflow: ${error.message}`);
    }
  });

  return (
    <Card
      className={`bg-white/5 border ${selected ? 'border-purple-500' : 'border-white/10'} hover:bg-white/10 transition-all cursor-pointer`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={() => onSelect(workflow)}>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-white">{workflow.name}</h3>
              <Badge className={`${
                workflow.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  workflow.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}>
                {workflow.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mb-3">{workflow.description}</p>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-slate-500">Executions</p>
                <p className="text-sm font-bold text-white">{workflow.execution_count || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Success Rate</p>
                <p className="text-sm font-bold text-white">{Math.round(workflow.success_rate || 0)}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Avg Duration</p>
                <p className="text-sm font-bold text-white">
                  {workflow.avg_duration_seconds ? `${workflow.avg_duration_seconds.toFixed(1)}s` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onConfigureHierarchy(workflow);
              }}
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <GitMerge className="w-4 h-4 mr-1" />
              Agents
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(workflow);
              }}
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              <Settings className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                executeMutation.mutate(workflow.id);
              }}
              disabled={executeMutation.isPending || workflow.status !== 'active'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-1" />
              Run
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
