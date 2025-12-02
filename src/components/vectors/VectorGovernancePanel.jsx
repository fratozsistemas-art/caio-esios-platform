import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Shield, Users, CheckCircle, XCircle, Clock, AlertTriangle,
  Lock, Unlock, Eye, Edit, MessageSquare, Loader2, Vote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';

const APPROVAL_THRESHOLDS = {
  strategic_initiative: { required: 2, escalation: 'C-Level' },
  investment_decision: { required: 3, escalation: 'Board' },
  crisis_response: { required: 1, escalation: 'CEO' },
  restructuring: { required: 3, escalation: 'Board' }
};

const GOVERNANCE_RULES = [
  { id: 'intensity_change', label: 'Mudança de intensidade > 2', trigger: 'requires_approval' },
  { id: 'direction_change', label: 'Mudança de direção', trigger: 'requires_approval' },
  { id: 'abort_decision', label: 'Decisão de abortar', trigger: 'requires_escalation' },
  { id: 'budget_impact', label: 'Impacto orçamentário > 20%', trigger: 'requires_approval' },
  { id: 'timeline_extension', label: 'Extensão de prazo', trigger: 'notification' }
];

export default function VectorGovernancePanel({ decision, onApprovalChange }) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalDecision, setApprovalDecision] = useState('approve');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me()
  });

  const { data: approvers = [] } = useQuery({
    queryKey: ['approvers'],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      return users.filter(u => u.role === 'admin' || u.can_approve_vectors);
    }
  });

  const { data: approvalHistory = [] } = useQuery({
    queryKey: ['vector_approvals', decision?.id],
    queryFn: async () => {
      if (!decision?.id) return [];
      const activities = await base44.entities.ActivityEvent.filter({
        entity_type: 'vector_decision',
        entity_id: decision.id,
        event_type: 'approval_action'
      }, '-created_date', 20);
      return activities;
    },
    enabled: !!decision?.id
  });

  const submitApprovalMutation = useMutation({
    mutationFn: async ({ action, comment }) => {
      const user = await base44.auth.me();
      
      // Create approval event
      await base44.entities.ActivityEvent.create({
        event_type: 'approval_action',
        actor_email: user.email,
        actor_name: user.full_name,
        entity_type: 'vector_decision',
        entity_id: decision.id,
        entity_title: decision.title,
        metadata: {
          action,
          comment,
          timestamp: new Date().toISOString()
        }
      });

      // Update decision status based on approvals
      const threshold = APPROVAL_THRESHOLDS[decision.context_type]?.required || 2;
      const approvals = approvalHistory.filter(a => a.metadata?.action === 'approve').length + (action === 'approve' ? 1 : 0);
      
      if (action === 'reject') {
        await base44.entities.VectorDecision.update(decision.id, {
          status: 'draft',
          governance_status: 'rejected',
          governance_notes: comment
        });
      } else if (approvals >= threshold) {
        await base44.entities.VectorDecision.update(decision.id, {
          status: 'active',
          governance_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.email
        });
      }

      return { action, approvals, threshold };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(['vector_approvals']);
      queryClient.invalidateQueries(['vector_decisions']);
      toast.success(result.action === 'approve' ? 'Aprovação registrada' : 'Decisão rejeitada');
      setShowApprovalModal(false);
      onApprovalChange?.();
    }
  });

  const canApprove = currentUser?.role === 'admin' || currentUser?.can_approve_vectors;
  const hasApproved = approvalHistory.some(a => a.actor_email === currentUser?.email);
  const approvalsCount = approvalHistory.filter(a => a.metadata?.action === 'approve').length;
  const requiredApprovals = APPROVAL_THRESHOLDS[decision?.context_type]?.required || 2;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          Governança de Decisão
          <Badge className="bg-purple-500/20 text-purple-400">CAIO.VEC-04</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Approval Status */}
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400">Status de Aprovação</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-white">{approvalsCount}/{requiredApprovals}</span>
                <span className="text-slate-400">aprovações</span>
              </div>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              approvalsCount >= requiredApprovals ? 'bg-green-500/20' : 'bg-yellow-500/20'
            }`}>
              {approvalsCount >= requiredApprovals ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <Clock className="w-8 h-8 text-yellow-400" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, (approvalsCount / requiredApprovals) * 100)}%` }}
            />
          </div>
        </div>

        {/* Governance Rules */}
        <div>
          <h4 className="text-sm text-slate-400 mb-3">Regras de Governança Ativas</h4>
          <div className="space-y-2">
            {GOVERNANCE_RULES.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <span className="text-sm text-white">{rule.label}</span>
                <Badge className={
                  rule.trigger === 'requires_escalation' ? 'bg-red-500/20 text-red-400' :
                  rule.trigger === 'requires_approval' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }>
                  {rule.trigger === 'requires_escalation' ? 'Escalação' :
                   rule.trigger === 'requires_approval' ? 'Aprovação' : 'Notificação'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Approvers */}
        <div>
          <h4 className="text-sm text-slate-400 mb-3">Aprovadores</h4>
          <div className="flex flex-wrap gap-2">
            {approvers.slice(0, 6).map(approver => {
              const hasApprovedThis = approvalHistory.some(
                a => a.actor_email === approver.email && a.metadata?.action === 'approve'
              );
              return (
                <div 
                  key={approver.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                    hasApprovedThis 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-purple-500/20 text-purple-400 text-xs">
                      {approver.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-white">{approver.full_name}</span>
                  {hasApprovedThis && <CheckCircle className="w-3 h-3 text-green-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Approval History */}
        {approvalHistory.length > 0 && (
          <div>
            <h4 className="text-sm text-slate-400 mb-3">Histórico de Aprovações</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {approvalHistory.map(event => (
                <div key={event.id} className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    event.metadata?.action === 'approve' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {event.metadata?.action === 'approve' 
                      ? <CheckCircle className="w-3 h-3 text-green-400" />
                      : <XCircle className="w-3 h-3 text-red-400" />
                    }
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{event.actor_name}</p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(event.created_date), 'dd/MM/yyyy HH:mm')}
                    </p>
                    {event.metadata?.comment && (
                      <p className="text-xs text-slate-300 mt-1 italic">"{event.metadata.comment}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approval Actions */}
        {canApprove && !hasApproved && decision?.status !== 'active' && (
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setApprovalDecision('approve');
                setShowApprovalModal(true);
              }}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Aprovar
            </Button>
            <Button
              onClick={() => {
                setApprovalDecision('reject');
                setShowApprovalModal(true);
              }}
              variant="outline"
              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rejeitar
            </Button>
          </div>
        )}

        {hasApproved && (
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30 text-center">
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-sm text-green-400">Você já aprovou esta decisão</p>
          </div>
        )}

        {/* Approval Modal */}
        <AnimatePresence>
          {showApprovalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setShowApprovalModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  {approvalDecision === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Comentário (opcional)</Label>
                    <Textarea
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      placeholder="Adicione observações sobre sua decisão..."
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowApprovalModal(false)}
                      className="flex-1 bg-white/5 border-white/10 text-white"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => submitApprovalMutation.mutate({
                        action: approvalDecision,
                        comment: approvalComment
                      })}
                      disabled={submitApprovalMutation.isPending}
                      className={`flex-1 ${
                        approvalDecision === 'approve' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {submitApprovalMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : approvalDecision === 'approve' ? (
                        <>Confirmar Aprovação</>
                      ) : (
                        <>Confirmar Rejeição</>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}