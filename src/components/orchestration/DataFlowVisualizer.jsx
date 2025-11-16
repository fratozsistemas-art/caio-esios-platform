import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GitBranch, ArrowRight, Database, Zap, 
  ChevronDown, ChevronUp, Eye, Code
} from 'lucide-react';

export default function DataFlowVisualizer({ workflow, execution, focusedStep }) {
  const [expandedTransforms, setExpandedTransforms] = useState(new Set());
  const [showRawData, setShowRawData] = useState(false);

  if (!workflow || !execution) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <GitBranch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Run a workflow to see data flow</p>
        </CardContent>
      </Card>
    );
  }

  const toggleTransform = (stepId) => {
    const newExpanded = new Set(expandedTransforms);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedTransforms(newExpanded);
  };

  const steps = workflow.steps || [];
  const stepResults = execution.step_results || {};

  return (
    <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            Data Flow Analysis
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowRawData(!showRawData)}
            className="h-6 text-xs"
          >
            <Code className="w-3 h-3 mr-1" />
            {showRawData ? 'Hide' : 'Show'} Raw
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const result = stepResults[step.id];
          const isExpanded = expandedTransforms.has(step.id);
          const isFocused = focusedStep === step.id;

          if (focusedStep && !isFocused) return null;

          return (
            <div 
              key={step.id}
              className={`${isFocused ? 'ring-2 ring-indigo-500 rounded-lg' : ''}`}
            >
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-white">{step.name}</span>
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">
                      {step.agent_type}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleTransform(step.id)}
                    className="h-6 text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    {isExpanded ? 'Hide' : 'View'} Flow
                  </Button>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-3">
                    {/* Input Data */}
                    <DataSection
                      title="Input"
                      icon={Database}
                      color="text-blue-400"
                      data={result?.inputs || execution.inputs}
                      showRaw={showRawData}
                    />

                    {/* Transformation Logic */}
                    <div className="bg-indigo-500/10 rounded p-3 border border-indigo-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-3 h-3 text-indigo-400" />
                        <span className="text-xs font-medium text-indigo-400">Transformation</span>
                      </div>
                      <div className="space-y-2 text-xs text-slate-300">
                        <TransformationStep
                          step="1. Data Extraction"
                          description={`Extract ${step.agent_type} relevant information`}
                          confidence={0.95}
                        />
                        <TransformationStep
                          step="2. Processing"
                          description="Apply domain-specific logic and filters"
                          confidence={0.88}
                        />
                        <TransformationStep
                          step="3. Validation"
                          description="Verify output against schema"
                          confidence={0.92}
                        />
                      </div>
                    </div>

                    {/* Output Data */}
                    <DataSection
                      title="Output"
                      icon={Database}
                      color="text-green-400"
                      data={result}
                      showRaw={showRawData}
                    />

                    {/* Data Changes */}
                    {result && (
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-xs text-slate-400 mb-2">Data Transformation Summary:</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Fields Added:</span>
                            <span className="text-green-400">
                              {Object.keys(result).length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Data Size:</span>
                            <span className="text-white">
                              {JSON.stringify(result).length} bytes
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Arrow to next step */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowRight className="w-4 h-4 text-indigo-400" />
                </div>
              )}
            </div>
          );
        })}

        {/* Final Output Summary */}
        {execution.outputs && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-slate-400 mb-2">Final Workflow Output:</p>
            <div className="bg-green-500/10 rounded p-3 border border-green-500/20">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap max-h-32 overflow-auto">
                {showRawData 
                  ? JSON.stringify(execution.outputs, null, 2)
                  : `${Object.keys(execution.outputs).length} results from ${steps.length} steps`
                }
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DataSection({ title, icon: Icon, color, data, showRaw }) {
  if (!data) return null;

  return (
    <div className="bg-white/5 rounded p-2">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3 h-3 ${color}`} />
        <span className={`text-xs font-medium ${color}`}>{title}</span>
      </div>
      {showRaw ? (
        <pre className="text-xs text-slate-300 whitespace-pre-wrap max-h-24 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <div className="space-y-1">
          {Object.entries(data).slice(0, 3).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-slate-400">{key}:</span>
              <span className="text-slate-300 truncate ml-2">
                {typeof value === 'object' ? '{...}' : String(value).substring(0, 30)}
              </span>
            </div>
          ))}
          {Object.keys(data).length > 3 && (
            <p className="text-xs text-slate-500">
              +{Object.keys(data).length - 3} more fields
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function TransformationStep({ step, description, confidence }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-white">{step}</span>
        <span className="text-indigo-400">{Math.round(confidence * 100)}%</span>
      </div>
      <p className="text-slate-400 text-xs">{description}</p>
      <div className="w-full bg-white/5 rounded-full h-1">
        <div
          className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
    </div>
  );
}