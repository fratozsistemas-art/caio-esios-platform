import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitCompare, ArrowRight, Plus, Minus, X } from 'lucide-react';

export default function VersionCompare({ version1, version2, onClose }) {
  const [activeTab, setActiveTab] = useState('workflow');

  if (!version1 || !version2) return null;

  const workflowDiff = compareWorkflows(
    version1.workflow_snapshot,
    version2.workflow_snapshot
  );

  const agentDiff = compareAgentConfigs(
    version1.hierarchical_config_snapshot,
    version2.hierarchical_config_snapshot
  );

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-400" />
            Compare Versions
          </CardTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            v{version1.version_number}
          </Badge>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            v{version2.version_number}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="workflow">Workflow Changes</TabsTrigger>
            <TabsTrigger value="agents">Agent Config Changes</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-3 mt-4">
            {workflowDiff.changes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">No workflow changes</p>
              </div>
            ) : (
              workflowDiff.changes.map((change, idx) => (
                <DiffItem key={idx} change={change} />
              ))
            )}
          </TabsContent>

          <TabsContent value="agents" className="space-y-3 mt-4">
            {agentDiff.changes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">No agent config changes</p>
              </div>
            ) : (
              agentDiff.changes.map((change, idx) => (
                <DiffItem key={idx} change={change} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function DiffItem({ change }) {
  const icon = change.type === 'added' ? Plus : change.type === 'removed' ? Minus : ArrowRight;
  const Icon = icon;
  const bgColor = 
    change.type === 'added' ? 'bg-green-500/10 border-green-500/30' :
    change.type === 'removed' ? 'bg-red-500/10 border-red-500/30' :
    'bg-blue-500/10 border-blue-500/30';
  const textColor = 
    change.type === 'added' ? 'text-green-400' :
    change.type === 'removed' ? 'text-red-400' :
    'text-blue-400';

  return (
    <div className={`rounded-lg border p-3 ${bgColor}`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 mt-0.5 ${textColor}`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {change.type === 'added' ? 'Added' : change.type === 'removed' ? 'Removed' : 'Modified'}: {change.path}
          </p>
          {change.oldValue !== undefined && (
            <div className="mt-2 bg-black/20 rounded p-2">
              <p className="text-xs text-slate-500 mb-1">Old:</p>
              <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                {JSON.stringify(change.oldValue, null, 2)}
              </pre>
            </div>
          )}
          {change.newValue !== undefined && (
            <div className="mt-2 bg-black/20 rounded p-2">
              <p className="text-xs text-slate-500 mb-1">New:</p>
              <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                {JSON.stringify(change.newValue, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function compareWorkflows(workflow1, workflow2) {
  const changes = [];

  // Compare basic properties
  ['name', 'description', 'workflow_type', 'execution_mode'].forEach(prop => {
    if (workflow1[prop] !== workflow2[prop]) {
      changes.push({
        type: 'modified',
        path: prop,
        oldValue: workflow1[prop],
        newValue: workflow2[prop]
      });
    }
  });

  // Compare steps
  const steps1 = workflow1.steps || [];
  const steps2 = workflow2.steps || [];

  if (steps1.length !== steps2.length) {
    changes.push({
      type: 'modified',
      path: 'steps.length',
      oldValue: steps1.length,
      newValue: steps2.length
    });
  }

  steps2.forEach((step, idx) => {
    if (!steps1[idx]) {
      changes.push({
        type: 'added',
        path: `steps[${idx}]`,
        newValue: step
      });
    } else if (JSON.stringify(step) !== JSON.stringify(steps1[idx])) {
      changes.push({
        type: 'modified',
        path: `steps[${idx}].${step.name || idx}`,
        oldValue: steps1[idx],
        newValue: step
      });
    }
  });

  steps1.forEach((step, idx) => {
    if (!steps2[idx]) {
      changes.push({
        type: 'removed',
        path: `steps[${idx}]`,
        oldValue: step
      });
    }
  });

  return { changes };
}

function compareAgentConfigs(config1, config2) {
  const changes = [];

  const agents1 = config1?.agents || [];
  const agents2 = config2?.agents || [];

  if (agents1.length !== agents2.length) {
    changes.push({
      type: 'modified',
      path: 'agents.length',
      oldValue: agents1.length,
      newValue: agents2.length
    });
  }

  agents2.forEach((agent, idx) => {
    if (!agents1[idx]) {
      changes.push({
        type: 'added',
        path: `agents[${idx}]`,
        newValue: agent
      });
    } else if (JSON.stringify(agent) !== JSON.stringify(agents1[idx])) {
      changes.push({
        type: 'modified',
        path: `agents[${idx}].${agent.name || idx}`,
        oldValue: agents1[idx],
        newValue: agent
      });
    }
  });

  agents1.forEach((agent, idx) => {
    if (!agents2[idx]) {
      changes.push({
        type: 'removed',
        path: `agents[${idx}]`,
        oldValue: agent
      });
    }
  });

  return { changes };
}