import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GitBranch, ArrowRight, Zap, Database, Brain, 
  CheckCircle, Clock, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

const AGENT_CONFIG = {
  research: { 
    color: 'from-blue-500 to-cyan-500',
    icon: Brain,
    inputs: ['topic', 'sources'],
    outputs: ['findings', 'sources', 'confidence']
  },
  analysis: { 
    color: 'from-purple-500 to-pink-500',
    icon: Database,
    inputs: ['data', 'context'],
    outputs: ['insights', 'metrics', 'recommendations']
  },
  synthesis: { 
    color: 'from-green-500 to-emerald-500',
    icon: Zap,
    inputs: ['previous_results'],
    outputs: ['summary', 'key_points']
  },
  extraction: { 
    color: 'from-orange-500 to-red-500',
    icon: Database,
    inputs: ['source_data'],
    outputs: ['extracted_data']
  },
  enrichment: { 
    color: 'from-yellow-500 to-orange-500',
    icon: Zap,
    inputs: ['entity_data'],
    outputs: ['enriched_data']
  },
  validation: { 
    color: 'from-indigo-500 to-purple-500',
    icon: CheckCircle,
    inputs: ['data_to_validate'],
    outputs: ['validated', 'score']
  }
};

export default function EnhancedWorkflowVisualizer({ workflow, execution }) {
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  if (!workflow) return null;

  const toggleStep = (stepId) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepStatus = (stepId) => {
    if (!execution) return 'pending';
    if (execution.completed_steps?.includes(stepId)) return 'completed';
    if (execution.current_step === stepId) return 'running';
    return 'pending';
  };

  const isParallel = workflow.execution_mode === 'parallel';

  // Identify dependencies
  const dependencyMap = new Map();
  workflow.steps?.forEach(step => {
    if (step.dependencies && step.dependencies.length > 0) {
      dependencyMap.set(step.id, step.dependencies);
    }
  });

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-400" />
          Workflow Flow Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Workflow Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
          <p className="text-sm text-slate-400 mt-1">{workflow.description}</p>
          <div className="flex gap-2 mt-3">
            <Badge className={`${
              workflow.execution_mode === 'parallel' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              workflow.execution_mode === 'sequential' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
              'bg-green-500/20 text-green-400 border-green-500/30'
            }`}>
              {workflow.execution_mode}
            </Badge>
            <Badge variant="outline" className="border-white/20 text-slate-300">
              {workflow.steps?.length || 0} steps
            </Badge>
            {execution && (
              <Badge className={`${
                execution.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                execution.status === 'running' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                execution.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}>
                {execution.status}
              </Badge>
            )}
          </div>
        </div>

        {/* Flow Diagram */}
        <div className="space-y-4">
          {workflow.steps?.map((step, index) => {
            const config = AGENT_CONFIG[step.agent_type] || AGENT_CONFIG.research;
            const Icon = config.icon;
            const status = getStepStatus(step.id);
            const isExpanded = expandedSteps.has(step.id);
            const hasDependencies = dependencyMap.has(step.id);

            return (
              <div key={step.id}>
                {/* Show dependencies */}
                {hasDependencies && (
                  <div className="ml-12 mb-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Depends on: {dependencyMap.get(step.id).join(', ')}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* Step Number/Status */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-bold flex-shrink-0 relative`}>
                      {status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : status === 'running' ? (
                        <Clock className="w-5 h-5 animate-pulse" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < workflow.steps.length - 1 && !isParallel && (
                      <div className="w-0.5 h-16 bg-gradient-to-b from-purple-500 to-transparent mt-2" />
                    )}
                  </div>

                  {/* Step Card */}
                  <div className="flex-1">
                    <div 
                      className={`bg-white/5 rounded-lg border transition-all cursor-pointer ${
                        status === 'completed' ? 'border-green-500/30 bg-green-500/5' :
                        status === 'running' ? 'border-blue-500/30 bg-blue-500/5' :
                        'border-white/10'
                      }`}
                      onClick={() => toggleStep(step.id)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-4 h-4 text-white" />
                              <p className="text-white font-medium">{step.name || `Step ${index + 1}`}</p>
                            </div>
                            <p className="text-xs text-slate-400 capitalize">{step.agent_type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${config.color}`} />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                            {/* Data Flow */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-slate-500 mb-2">Inputs:</p>
                                <div className="space-y-1">
                                  {config.inputs.map(input => (
                                    <div key={input} className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                                      <span className="text-xs text-slate-300">{input}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-2">Outputs:</p>
                                <div className="space-y-1">
                                  {config.outputs.map(output => (
                                    <div key={output} className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-green-400" />
                                      <span className="text-xs text-slate-300">{output}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Execution Results */}
                            {execution?.step_results?.[step.id] && (
                              <div className="bg-white/5 rounded p-3">
                                <p className="text-xs text-slate-400 mb-2">Result:</p>
                                <pre className="text-xs text-slate-300 whitespace-pre-wrap max-h-32 overflow-auto">
                                  {JSON.stringify(execution.step_results[step.id], null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Data Flow Arrow */}
                    {index < workflow.steps.length - 1 && (
                      <div className="flex items-center gap-2 my-2 ml-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-purple-500 to-transparent" />
                        <ArrowRight className="w-4 h-4 text-purple-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Data Flow Legend */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-slate-400 mb-3">Data Flow Legend:</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-xs text-slate-300">Input Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs text-slate-300">Output Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-gradient-to-r from-purple-500 to-transparent rounded" />
              <span className="text-xs text-slate-300">Data Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-xs text-slate-300">Completed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}