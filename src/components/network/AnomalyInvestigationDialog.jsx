import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, X, Search, ExternalLink } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const severityConfig = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
  low: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' }
};

const statusConfig = {
  new: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  investigating: { label: 'Investigating', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  resolved: { label: 'Resolved', color: 'text-green-400', bg: 'bg-green-500/20' },
  false_positive: { label: 'False Positive', color: 'text-slate-400', bg: 'bg-slate-500/20' }
};

export default function AnomalyInvestigationDialog({ anomaly, open, onClose, relatedNodes, predictions }) {
  const [status, setStatus] = useState(anomaly?.status || 'new');
  const [notes, setNotes] = useState(anomaly?.resolution_notes || '');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('updateAnomalyStatus', {
        anomaly_id: anomaly.id,
        status,
        resolution_notes: notes
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['network_anomalies']);
      toast.success('Anomaly status updated');
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    }
  });

  if (!anomaly) return null;

  const config = severityConfig[anomaly.severity] || severityConfig.low;
  const statusCfg = statusConfig[status] || statusConfig.new;

  // Check if anomaly is related to predictions
  const relatedPredictions = predictions?.predicted_relationships?.filter(pred => 
    pred.from_node_id === anomaly.node_id || pred.to_node_id === anomaly.node_id
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${config.color}`} />
            Anomaly Investigation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Anomaly Details */}
          <div className={`p-4 rounded-lg border ${config.bg} ${config.border}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{anomaly.node_label || 'Unknown Node'}</h3>
                <Badge className={`${config.bg} ${config.color} border-none`}>
                  {anomaly.severity} severity
                </Badge>
              </div>
              <Badge className={`${statusCfg.bg} ${statusCfg.color}`}>
                {statusCfg.label}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-400">Type: </span>
                <span className="text-white">{anomaly.type.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400">Details: </span>
                <p className="text-white mt-1">{anomaly.details}</p>
              </div>
              <div>
                <span className="text-slate-400">Detected: </span>
                <span className="text-white">{new Date(anomaly.detected_at).toLocaleString()}</span>
              </div>
              {anomaly.detected_by && (
                <div>
                  <span className="text-slate-400">Detected by: </span>
                  <span className="text-white">{anomaly.detected_by}</span>
                </div>
              )}
            </div>
          </div>

          {/* Related Nodes */}
          {relatedNodes && relatedNodes.length > 0 && (
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Related Nodes ({relatedNodes.length})
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {relatedNodes.map((node, idx) => (
                  <div key={idx} className="text-xs bg-white/5 px-2 py-1.5 rounded flex items-center justify-between">
                    <span className="text-slate-300">{node.label}</span>
                    <Badge variant="outline" className="border-white/20 text-slate-500 text-xs">
                      {node.node_type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Predictions */}
          {relatedPredictions.length > 0 && (
            <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
              <h4 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Linked to Predictions ({relatedPredictions.length})
              </h4>
              <p className="text-xs text-slate-400 mb-2">
                This anomaly is related to predicted future relationships
              </p>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {relatedPredictions.map((pred, idx) => (
                  <div key={idx} className="text-xs bg-white/5 px-2 py-1.5 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">{pred.relationship_type}</span>
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                        {Math.round(pred.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    {pred.reasoning && (
                      <p className="text-slate-500 mt-1 line-clamp-1">{pred.reasoning}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investigation Controls */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Investigation Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="false_positive">False Positive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Investigation Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your investigation findings, actions taken, or resolution details..."
                className="bg-white/5 border-white/10 text-white min-h-24"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-white/10 text-white hover:bg-white/10"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}