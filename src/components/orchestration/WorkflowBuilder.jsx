import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Save, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const AGENT_TYPES = [
  { value: 'research', label: 'Research', description: 'Gather information from sources' },
  { value: 'analysis', label: 'Analysis', description: 'Analyze data and patterns' },
  { value: 'synthesis', label: 'Synthesis', description: 'Combine and summarize findings' },
  { value: 'extraction', label: 'Extraction', description: 'Extract specific data points' },
  { value: 'enrichment', label: 'Enrichment', description: 'Enhance entity data' },
  { value: 'validation', label: 'Validation', description: 'Verify and validate results' }
];

const WORKFLOW_TYPES = [
  { value: 'company_research', label: 'Company Research' },
  { value: 'competitor_mapping', label: 'Competitor Mapping' },
  { value: 'market_analysis', label: 'Market Analysis' },
  { value: 'trend_summarization', label: 'Trend Summarization' },
  { value: 'relationship_discovery', label: 'Relationship Discovery' },
  { value: 'custom', label: 'Custom Workflow' }
];

export default function WorkflowBuilder({ workflow, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
    workflow_type: workflow?.workflow_type || 'custom',
    execution_mode: workflow?.execution_mode || 'sequential',
    steps: workflow?.steps || [],
    status: workflow?.status || 'draft'
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (workflow?.id) {
        return await base44.entities.AgentWorkflow.update(workflow.id, formData);
      } else {
        return await base44.entities.AgentWorkflow.create(formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent_workflows']);
      toast.success(workflow ? 'Workflow updated' : 'Workflow created');
      onSave?.();
    }
  });

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, {
        id: `step_${Date.now()}`,
        name: '',
        agent_type: 'research',
        config: {},
        dependencies: []
      }]
    });
  };

  const removeStep = (stepId) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter(s => s.id !== stepId)
    });
  };

  const updateStep = (stepId, updates) => {
    setFormData({
      ...formData,
      steps: formData.steps.map(s => s.id === stepId ? { ...s, ...updates } : s)
    });
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">
            {workflow ? 'Edit Workflow' : 'Create New Workflow'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="E.g., Deep Company Research"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Workflow Type</label>
            <Select
              value={formData.workflow_type}
              onValueChange={(value) => setFormData({ ...formData, workflow_type: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORKFLOW_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-2 block">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this workflow does..."
            className="bg-white/5 border-white/10 text-white h-20"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-2 block">Execution Mode</label>
          <Select
            value={formData.execution_mode}
            onValueChange={(value) => setFormData({ ...formData, execution_mode: value })}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sequential">Sequential - Steps run one after another</SelectItem>
              <SelectItem value="parallel">Parallel - Independent steps run simultaneously</SelectItem>
              <SelectItem value="hybrid">Hybrid - Mixed sequential and parallel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-slate-400">Workflow Steps</label>
            <Button
              onClick={addStep}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Step
            </Button>
          </div>

          <div className="space-y-3">
            {formData.steps.map((step, index) => (
              <div key={step.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0 mt-2">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={step.name}
                        onChange={(e) => updateStep(step.id, { name: e.target.value })}
                        placeholder="Step name"
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Select
                        value={step.agent_type}
                        onValueChange={(value) => updateStep(step.id, { agent_type: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AGENT_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {AGENT_TYPES.find(t => t.value === step.agent_type) && (
                      <p className="text-xs text-slate-500">
                        {AGENT_TYPES.find(t => t.value === step.agent_type).description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(step.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {index < formData.steps.length - 1 && (
                  <div className="flex justify-center mt-2">
                    <ArrowRight className="w-5 h-5 text-purple-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!formData.name || formData.steps.length === 0 || saveMutation.isPending}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {workflow ? 'Update' : 'Create'} Workflow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}