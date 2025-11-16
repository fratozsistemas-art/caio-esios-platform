import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, GitBranch } from 'lucide-react';

const AGENT_COLORS = {
  research: 'from-blue-500 to-cyan-500',
  analysis: 'from-purple-500 to-pink-500',
  synthesis: 'from-green-500 to-emerald-500',
  extraction: 'from-orange-500 to-red-500',
  enrichment: 'from-yellow-500 to-orange-500',
  validation: 'from-indigo-500 to-purple-500'
};

export default function WorkflowFlowVisualizer({ workflow }) {
  if (!workflow) {
    return null;
  }

  const isParallel = workflow.execution_mode === 'parallel';

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-400" />
          Workflow Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
          <p className="text-sm text-slate-400 mt-1">{workflow.description}</p>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {workflow.execution_mode}
            </Badge>
            <Badge variant="outline" className="border-white/20 text-slate-300">
              {workflow.steps?.length || 0} steps
            </Badge>
          </div>
        </div>

        {/* Flow Diagram */}
        <div className={`space-y-${isParallel ? '4' : '2'} mt-6`}>
          {workflow.steps?.map((step, index) => (
            <div key={step.id}>
              <div className="flex items-center gap-3">
                {/* Step Number */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {index + 1}
                </div>

                {/* Step Card */}
                <div className="flex-1 bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{step.name || `Step ${index + 1}`}</p>
                      <p className="text-xs text-slate-400 mt-1 capitalize">{step.agent_type}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${AGENT_COLORS[step.agent_type]}`} />
                  </div>
                </div>
              </div>

              {/* Arrow */}
              {index < workflow.steps.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowRight className="w-5 h-5 text-purple-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-slate-400 mb-2">Agent Types:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(AGENT_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${color}`} />
                <span className="text-xs text-slate-300 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}