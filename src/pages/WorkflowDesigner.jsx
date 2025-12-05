import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Workflow, Plus, Play, Pause, Trash2, Edit, Clock, CheckCircle, Eye
} from "lucide-react";
import { toast } from "sonner";
import VisualWorkflowBuilder from "@/components/agents/VisualWorkflowBuilder";

export default function WorkflowDesigner() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const queryClient = useQueryClient();

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflow-designs'],
    queryFn: () => base44.entities.AgentWorkflowDesign.list('-created_date', 50)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AgentWorkflowDesign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflow-designs']);
      toast.success('Workflow deleted');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.AgentWorkflowDesign.update(id, { 
        status: status === 'active' ? 'paused' : 'active' 
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['workflow-designs'])
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Workflow className="w-6 h-6 text-white" />
            </div>
            Visual Workflow Designer
          </h1>
          <p className="text-slate-400 mt-1">Design multi-agent collaborative workflows</p>
        </div>
        <Button onClick={() => { setEditingWorkflow(null); setShowBuilder(true); }} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {/* Workflow List */}
      <div className="grid grid-cols-3 gap-4">
        {workflows.map(workflow => (
          <Card key={workflow.id} className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">{workflow.name || 'Untitled'}</h3>
                  <p className="text-xs text-slate-400 mt-1">{workflow.nodes?.length || 0} nodes · {workflow.connections?.length || 0} connections</p>
                </div>
                <Badge className={
                  workflow.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  workflow.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-slate-500/20 text-slate-400'
                }>
                  {workflow.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                <Clock className="w-3 h-3" />
                <span>Trigger: {workflow.triggers?.[0]?.type || 'manual'}</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditingWorkflow(workflow.id); setShowBuilder(true); }} className="flex-1 border-white/10 text-white">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleStatusMutation.mutate({ id: workflow.id, status: workflow.status })}
                  className={workflow.status === 'active' ? 'border-yellow-500/30 text-yellow-400' : 'border-green-500/30 text-green-400'}
                >
                  {workflow.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(workflow.id)} className="border-red-500/30 text-red-400">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {workflows.length === 0 && !isLoading && (
          <Card className="col-span-3 bg-white/5 border-white/10 border-dashed">
            <CardContent className="p-8 text-center">
              <Workflow className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No workflows yet. Create your first one!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-[95vw] h-[90vh] bg-slate-900 border-white/10 p-4">
          <VisualWorkflowBuilder
            workflowId={editingWorkflow}
            onSave={() => setShowBuilder(false)}
            onClose={() => setShowBuilder(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}