import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Plus, TrendingUp, CheckCircle, Clock, Share2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePermission } from "@/components/utils/usePermission";
import PermissionGuard, { PermissionButton } from "@/components/ui/PermissionGuard";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Strategies() {
  const queryClient = useQueryClient();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareAccessLevel, setShareAccessLevel] = useState("view");

  // Check permissions
  const { hasPermission: canCreate } = usePermission('strategies', 'create');
  const { hasPermission: canDelete } = usePermission('strategies', 'delete');

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: async () => {
      const user = await base44.auth.me();
      
      // Get strategies owned by user
      const ownedStrategies = await base44.entities.Strategy.list('-created_date');
      
      // Get strategies shared with user
      const sharedAccess = await base44.entities.EntityAccess.filter({
        entity_type: 'Strategy',
        shared_with_email: user.email,
        is_active: true
      });
      
      // Fetch shared strategies
      const sharedStrategyIds = sharedAccess.map(access => access.entity_id);
      const sharedStrategies = [];
      
      for (const id of sharedStrategyIds) {
        const strats = await base44.entities.Strategy.filter({ id });
        if (strats && strats.length > 0) {
          sharedStrategies.push({
            ...strats[0],
            shared: true,
            access_level: sharedAccess.find(a => a.entity_id === id)?.access_level
          });
        }
      }
      
      return [...ownedStrategies, ...sharedStrategies];
    },
    initialData: [],
  });

  const deleteStrategyMutation = useMutation({
    mutationFn: (id) => base44.entities.Strategy.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      toast.success('✅ Strategy deleted successfully!');
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`);
    }
  });

  const shareStrategyMutation = useMutation({
    mutationFn: async ({ strategyId, email, accessLevel }) => {
      const { data } = await base44.functions.invoke('shareEntity', {
        entity_type: 'Strategy',
        entity_id: strategyId,
        share_with_email: email,
        access_level: accessLevel
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      toast.success('✅ Strategy shared successfully!');
      setShowShareDialog(false);
      setShareEmail("");
      setSelectedStrategy(null);
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`);
    }
  });

  const handleShare = (strategy) => {
    setSelectedStrategy(strategy);
    setShowShareDialog(true);
  };

  const handleDelete = async (strategy) => {
    if (window.confirm(`Delete strategy "${strategy.title}"?`)) {
      deleteStrategyMutation.mutate(strategy.id);
    }
  };

  const statusConfig = {
    draft: { icon: Clock, color: "text-gray-400", bg: "bg-gray-500/20", text: "Draft" },
    analyzing: { icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/20", text: "Analyzing" },
    validated: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20", text: "Validated" },
    implemented: { icon: CheckCircle, color: "text-purple-400", bg: "bg-purple-500/20", text: "Implemented" }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Target className="w-10 h-10 text-blue-400" />
            Strategies
          </h1>
          <p className="text-slate-400">
            Strategic initiatives and validated plans
          </p>
        </div>
        
        <PermissionGuard resource="strategies" action="create" showMessage={false}>
          <Button
            onClick={() => window.location.href = '/chat'}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Strategy
          </Button>
        </PermissionGuard>
      </div>

      {/* Strategies List */}
      {strategies.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No strategies yet
            </h3>
            <p className="text-slate-400 mb-6">
              Start by creating your first strategic initiative
            </p>
            {canCreate && (
              <Button
                onClick={() => window.location.href = '/chat'}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Create First Strategy
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {strategies.map((strategy, idx) => {
              const status = statusConfig[strategy.status] || statusConfig.draft;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                    <CardHeader className="border-b border-white/10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-white text-xl">
                              {strategy.title}
                            </CardTitle>
                            {strategy.shared && (
                              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                                Shared ({strategy.access_level})
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-purple-500/20 text-purple-400">
                              {strategy.category}
                            </Badge>
                            <Badge className={`${status.bg} ${status.color} flex items-center gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.text}
                            </Badge>
                            {strategy.target_audience && (
                              <Badge variant="outline" className="border-white/20 text-slate-300">
                                {strategy.target_audience}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <PermissionButton resource="strategies" action="share" entityId={strategy.id}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleShare(strategy)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </PermissionButton>

                          {!strategy.shared && (
                            <PermissionButton resource="strategies" action="delete" entityId={strategy.id}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(strategy)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </PermissionButton>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      {strategy.description && (
                        <p className="text-slate-300 mb-4">{strategy.description}</p>
                      )}

                      {strategy.roi_estimate && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span>Estimated ROI: <strong className="text-green-400">{strategy.roi_estimate}%</strong></span>
                        </div>
                      )}

                      {strategy.created_date && (
                        <div className="text-xs text-slate-500 mt-3">
                          Created {format(new Date(strategy.created_date), 'MMM d, yyyy')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Share Strategy</DialogTitle>
          </DialogHeader>
          {selectedStrategy && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Strategy</p>
                <p className="text-white font-medium">{selectedStrategy.title}</p>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">User Email</label>
                <Input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Access Level</label>
                <Select value={shareAccessLevel} onValueChange={setShareAccessLevel}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="comment">Can Comment</SelectItem>
                    <SelectItem value="edit">Can Edit</SelectItem>
                    <SelectItem value="admin">Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowShareDialog(false)}
                  className="border-white/20 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => shareStrategyMutation.mutate({
                    strategyId: selectedStrategy.id,
                    email: shareEmail,
                    accessLevel: shareAccessLevel
                  })}
                  disabled={!shareEmail || shareStrategyMutation.isPending}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {shareStrategyMutation.isPending ? 'Sharing...' : 'Share'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}