import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  History, GitBranch, CheckCircle, RotateCcw, Eye, Save, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function VersionHistory({ workflow, onRevert, onCompare }) {
  const [changeSummary, setChangeSummary] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['workflow_versions', workflow?.id],
    queryFn: async () => {
      if (!workflow?.id) return [];
      return await base44.entities.WorkflowVersion.filter(
        { workflow_id: workflow.id },
        '-version_number'
      );
    },
    enabled: !!workflow?.id
  });

  const saveVersionMutation = useMutation({
    mutationFn: async () => {
      const latestVersion = versions[0]?.version_number || 0;
      
      return await base44.entities.WorkflowVersion.create({
        workflow_id: workflow.id,
        version_number: latestVersion + 1,
        workflow_snapshot: workflow,
        hierarchical_config_snapshot: workflow.hierarchical_config || {},
        change_summary: changeSummary || 'Version saved',
        saved_by: (await base44.auth.me()).email,
        is_current: true
      });
    },
    onSuccess: async () => {
      await base44.entities.WorkflowVersion.update(
        { workflow_id: workflow.id, is_current: true },
        { is_current: false }
      );
      queryClient.invalidateQueries(['workflow_versions']);
      setShowSaveDialog(false);
      setChangeSummary('');
      toast.success('Version saved successfully');
    },
    onError: (error) => {
      toast.error(`Failed to save version: ${error.message}`);
    }
  });

  const revertMutation = useMutation({
    mutationFn: async (versionId) => {
      const version = versions.find(v => v.id === versionId);
      if (!version) throw new Error('Version not found');
      
      await base44.entities.AgentWorkflow.update(workflow.id, {
        ...version.workflow_snapshot,
        hierarchical_config: version.hierarchical_config_snapshot
      });

      await base44.entities.WorkflowVersion.update(
        { workflow_id: workflow.id, is_current: true },
        { is_current: false }
      );
      
      await base44.entities.WorkflowVersion.update(versionId, { is_current: true });
      
      return version;
    },
    onSuccess: (version) => {
      queryClient.invalidateQueries(['agent_workflows']);
      queryClient.invalidateQueries(['workflow_versions']);
      onRevert?.(version.workflow_snapshot);
      toast.success(`Reverted to version ${version.version_number}`);
    },
    onError: (error) => {
      toast.error(`Failed to revert: ${error.message}`);
    }
  });

  if (!workflow) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 text-center">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Select a workflow to view version history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            Version History
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowSaveDialog(!showSaveDialog)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Version
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save Version Dialog */}
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3"
          >
            <div>
              <label className="text-xs text-slate-400 block mb-1">Change Summary</label>
              <Textarea
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="Describe what changed in this version..."
                className="bg-white/5 border-white/10 text-white h-20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => saveVersionMutation.mutate()}
                disabled={saveVersionMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {saveVersionMutation.isPending ? 'Saving...' : 'Save Version'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowSaveDialog(false);
                  setChangeSummary('');
                }}
                className="bg-white/5 border-white/10"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Version List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-spin" />
              <p className="text-slate-400 text-sm">Loading versions...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8">
              <GitBranch className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No versions saved yet</p>
              <p className="text-slate-500 text-xs mt-1">Click "Save Version" to create the first version</p>
            </div>
          ) : (
            versions.map((version, idx) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-3 rounded-lg border transition-all ${
                  version.is_current
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      version.is_current ? 'bg-green-500/20' : 'bg-blue-500/20'
                    }`}>
                      <span className="text-xs font-bold text-white">
                        v{version.version_number}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Version {version.version_number}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(version.created_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {version.is_current && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Current
                    </Badge>
                  )}
                </div>

                {version.change_summary && (
                  <p className="text-xs text-slate-300 mb-3 pl-10">
                    {version.change_summary}
                  </p>
                )}

                <div className="flex gap-2 pl-10">
                  {!version.is_current && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => revertMutation.mutate(version.id)}
                      disabled={revertMutation.isPending}
                      className="h-7 text-xs bg-white/5 border-white/10 hover:bg-green-500/10 hover:border-green-500/30"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Revert
                    </Button>
                  )}
                  {idx < versions.length - 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCompare?.(version, versions[idx + 1])}
                      className="h-7 text-xs bg-white/5 border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Compare
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 pl-10">
                  <span>by {version.saved_by}</span>
                  <span>•</span>
                  <span>{version.workflow_snapshot.steps?.length || 0} steps</span>
                  <span>•</span>
                  <span>{version.hierarchical_config_snapshot?.agents?.length || 0} agents</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}