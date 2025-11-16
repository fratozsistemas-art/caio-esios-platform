import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, AlertTriangle, FileText, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function RemediationTracker({ remediations, tickets }) {
  const [expandedId, setExpandedId] = useState(null);
  const queryClient = useQueryClient();

  const updateRemediationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HermesRemediation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hermes_remediations']);
      toast.success('Remediation updated');
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportTicket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['support_tickets']);
      toast.success('Ticket updated');
    }
  });

  const pendingRemediations = remediations.filter(r => r.resolution_status === 'pending');
  const resolvedRemediations = remediations.filter(r => r.resolution_status === 'resolved');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-white">{pendingRemediations.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Resolved</p>
                <p className="text-2xl font-bold text-white">{resolvedRemediations.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Auto-Applied</p>
                <p className="text-2xl font-bold text-white">
                  {remediations.filter(r => r.auto_applied).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Active Remediations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingRemediations.map(remediation => {
            const ticket = tickets.find(t => t.remediation_id === remediation.id);
            const isExpanded = expandedId === remediation.id;

            return (
              <div key={remediation.id} className="bg-white/5 rounded-lg border border-white/10">
                <div 
                  className="p-4 cursor-pointer hover:bg-white/10 transition-all"
                  onClick={() => setExpandedId(isExpanded ? null : remediation.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${
                          remediation.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          remediation.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {remediation.severity}
                        </Badge>
                        <span className="text-sm font-medium text-white">{remediation.issue_type}</span>
                        {remediation.auto_applied && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            Auto-applied
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {remediation.entity_type} • {new Date(remediation.action_taken_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {remediation.remediation_action}
                    </Badge>
                  </div>

                  {ticket && (
                    <div className="flex items-center gap-2 mt-2">
                      <FileText className="w-3 h-3 text-cyan-400" />
                      <span className="text-xs text-slate-400">
                        Ticket #{ticket.id.slice(0, 8)} • {ticket.assigned_team}
                      </span>
                      <Badge className={`text-xs ${
                        ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                        ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {ticket.status}
                      </Badge>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="p-4 pt-0 space-y-4 border-t border-white/10 mt-2">
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-2">Resolution Status</p>
                      <Select
                        value={remediation.resolution_status}
                        onValueChange={(value) => {
                          updateRemediationMutation.mutate({
                            id: remediation.id,
                            data: { 
                              resolution_status: value,
                              ...(value === 'resolved' && { resolved_at: new Date().toISOString() })
                            }
                          });
                        }}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-2">Resolution Notes</p>
                      <Textarea
                        placeholder="Add resolution notes..."
                        className="bg-white/5 border-white/10 text-white h-20"
                        defaultValue={remediation.resolution_notes || ''}
                        onBlur={(e) => {
                          if (e.target.value !== remediation.resolution_notes) {
                            updateRemediationMutation.mutate({
                              id: remediation.id,
                              data: { resolution_notes: e.target.value }
                            });
                          }
                        }}
                      />
                    </div>

                    {ticket?.data_snapshot?.config_suggestions && (
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-blue-400" />
                          <p className="text-xs font-medium text-blue-400">Configuration Suggestions</p>
                        </div>
                        <ul className="space-y-1">
                          {ticket.data_snapshot.config_suggestions.slice(0, 3).map((suggestion, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-blue-400">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {pendingRemediations.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-50" />
              <p className="text-slate-400 text-sm">No pending remediations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}