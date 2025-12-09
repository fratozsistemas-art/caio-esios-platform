import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, Clock, Eye, 
  ChevronRight, Filter, TrendingDown, Activity, Zap, FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ComplianceMonitoring() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const highlightedIssueId = urlParams.get('issue');

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['compliance-issues'],
    queryFn: () => base44.entities.ComplianceIssue.list('-created_date', 100),
    refetchInterval: 30000
  });

  React.useEffect(() => {
    if (highlightedIssueId && issues.length > 0) {
      const issue = issues.find(i => i.id === highlightedIssueId);
      if (issue) setSelectedIssue(issue);
    }
  }, [highlightedIssueId, issues]);

  const updateIssueMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ComplianceIssue.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['compliance-issues']);
      toast.success('Issue updated');
      setSelectedIssue(null);
    }
  });

  const getSeverityColor = (severity) => {
    const colors = {
      low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
      high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
      critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
    };
    return colors[severity] || colors.medium;
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: <AlertTriangle className="w-4 h-4 text-red-400" />,
      investigating: <Clock className="w-4 h-4 text-yellow-400" />,
      remediated: <CheckCircle className="w-4 h-4 text-green-400" />,
      false_positive: <XCircle className="w-4 h-4 text-slate-400" />,
      acknowledged: <Eye className="w-4 h-4 text-blue-400" />
    };
    return icons[status] || icons.open;
  };

  const filteredIssues = activeTab === 'all' 
    ? issues 
    : issues.filter(i => i.severity === activeTab || i.status === activeTab);

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    critical: issues.filter(i => i.severity === 'critical').length,
    remediated: issues.filter(i => i.status === 'remediated').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            Compliance Monitoring
          </h1>
          <p className="text-slate-400 mt-1">AI-Driven Policy & Brand Guideline Enforcement</p>
        </div>
        <Button
          onClick={async () => {
            const recent = await base44.entities.DocumentAnalysis.list('-created_date', 5);
            for (const doc of recent) {
              await base44.functions.invoke('monitorCompliance', {
                entity_type: 'DocumentAnalysis',
                entity_id: doc.id,
                content: doc,
                metadata: { document_title: doc.document_title }
              });
            }
            queryClient.invalidateQueries(['compliance-issues']);
            toast.success('Compliance scan initiated');
          }}
          className="bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628]"
        >
          <Zap className="w-4 h-4 mr-2" />
          Scan Latest Documents
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs mb-1">Total Issues</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs mb-1">Open</p>
            <p className="text-2xl font-bold text-red-400">{stats.open}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs mb-1">Critical</p>
            <p className="text-2xl font-bold text-orange-400">{stats.critical}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs mb-1">Remediated</p>
            <p className="text-2xl font-bold text-green-400">{stats.remediated}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="all">All Issues ({issues.length})</TabsTrigger>
          <TabsTrigger value="critical">Critical ({issues.filter(i => i.severity === 'critical').length})</TabsTrigger>
          <TabsTrigger value="high">High ({issues.filter(i => i.severity === 'high').length})</TabsTrigger>
          <TabsTrigger value="open">Open ({stats.open})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading compliance issues...</div>
          ) : filteredIssues.length === 0 ? (
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-white font-semibold mb-2">No Compliance Issues</p>
                <p className="text-slate-400 text-sm">All documents and queries are compliant with policies</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredIssues.map((issue) => {
                const colors = getSeverityColor(issue.severity);
                const isHighlighted = issue.id === highlightedIssueId;
                
                return (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={isHighlighted ? 'ring-2 ring-[#FFB800] rounded-lg' : ''}
                  >
                    <Card className={`${colors.bg} border ${colors.border} cursor-pointer hover:border-white/30 transition-all`}
                      onClick={() => setSelectedIssue(issue)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(issue.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
                                  {issue.severity.toUpperCase()}
                                </Badge>
                                <Badge className="bg-white/10 text-white text-xs">
                                  {issue.issue_type.replace(/_/g, ' ').toUpperCase()}
                                </Badge>
                                <Badge className="bg-white/5 text-slate-400 text-xs">
                                  {issue.source_entity_type}
                                </Badge>
                              </div>
                              <p className="text-white font-medium mb-1">{issue.violation_description}</p>
                              <p className="text-slate-300 text-sm mb-2">
                                {issue.specific_violations?.length || 0} specific violations • 
                                Confidence: {issue.confidence_score}%
                              </p>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                {new Date(issue.created_date).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIssue(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0A1628] border border-white/20 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {getStatusIcon(selectedIssue.status)}
                <div>
                  <h2 className="text-white font-bold text-xl">Compliance Issue Details</h2>
                  <p className="text-slate-400 text-sm">ID: {selectedIssue.id}</p>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedIssue(null)} className="text-slate-400">
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              {/* Severity & Type */}
              <div className="flex items-center gap-3">
                <Badge className={`${getSeverityColor(selectedIssue.severity).bg} ${getSeverityColor(selectedIssue.severity).text} text-base px-3 py-1`}>
                  {selectedIssue.severity.toUpperCase()} SEVERITY
                </Badge>
                <Badge className="bg-white/10 text-white">
                  {selectedIssue.issue_type.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>

              {/* Description */}
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-white">{selectedIssue.violation_description}</p>
              </div>

              {/* Specific Violations */}
              {selectedIssue.specific_violations?.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Specific Violations</h3>
                  <div className="space-y-2">
                    {selectedIssue.specific_violations.map((violation, idx) => (
                      <Card key={idx} className="bg-red-500/10 border-red-500/20">
                        <CardContent className="p-3">
                          <p className="text-red-400 font-medium text-sm mb-1">{violation.guideline}</p>
                          <p className="text-slate-300 text-xs mb-2">{violation.explanation}</p>
                          {violation.violated_content && (
                            <div className="p-2 bg-black/20 rounded text-xs text-slate-400 font-mono">
                              {violation.violated_content}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Remediation Steps */}
              {selectedIssue.remediation_steps?.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Remediation Steps</h3>
                  <div className="space-y-2">
                    {selectedIssue.remediation_steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <Badge className="bg-white/10 text-white">{idx + 1}</Badge>
                        <div className="flex-1">
                          <p className="text-white text-sm mb-1">{step.step}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              step.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                              step.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-blue-500/20 text-blue-400'
                            }>
                              {step.priority}
                            </Badge>
                            {step.estimated_effort && (
                              <span className="text-slate-400 text-xs">{step.estimated_effort}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Policy References */}
              {selectedIssue.policy_references?.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Policy References</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedIssue.policy_references.map((ref, idx) => (
                      <Badge key={idx} className="bg-[#00D4FF]/20 text-[#00D4FF]">
                        {ref}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button
                  onClick={() => updateIssueMutation.mutate({
                    id: selectedIssue.id,
                    data: { status: 'investigating' }
                  })}
                  className="bg-yellow-600 hover:bg-yellow-700"
                  disabled={selectedIssue.status === 'investigating'}
                >
                  Mark as Investigating
                </Button>
                <Button
                  onClick={() => updateIssueMutation.mutate({
                    id: selectedIssue.id,
                    data: { 
                      status: 'remediated',
                      resolved_at: new Date().toISOString()
                    }
                  })}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={selectedIssue.status === 'remediated'}
                >
                  Mark as Remediated
                </Button>
                <Button
                  onClick={() => updateIssueMutation.mutate({
                    id: selectedIssue.id,
                    data: { status: 'false_positive' }
                  })}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  False Positive
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}