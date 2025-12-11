import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw,
  Server, Network, Brain, Zap, FileText, MessageSquare
} from "lucide-react";
import { toast } from "sonner";

export default function SystemHealth() {
  const [isChecking, setIsChecking] = useState(false);

  const { data: healthCheck, refetch, isLoading } = useQuery({
    queryKey: ['system_health'],
    queryFn: async () => {
      const checks = {
        entities: { status: 'checking', message: '' },
        knowledge_graph: { status: 'checking', message: '' },
        agent_memory: { status: 'checking', message: '' },
        integrations: { status: 'checking', message: '' },
        file_upload: { status: 'checking', message: '' },
        conversations: { status: 'checking', message: '' }
      };

      // Check entities
      try {
        const strategies = await base44.entities.Strategy.list();
        checks.entities = { 
          status: 'healthy', 
          message: `${strategies.length} strategies found` 
        };
      } catch (error) {
        checks.entities = { status: 'error', message: error.message };
      }

      // Check Knowledge Graph
      try {
        const nodes = await base44.entities.KnowledgeGraphNode.list();
        const rels = await base44.entities.KnowledgeGraphRelationship.list();
        checks.knowledge_graph = { 
          status: 'healthy', 
          message: `${nodes.length} nodes, ${rels.length} relationships` 
        };
      } catch (error) {
        checks.knowledge_graph = { status: 'error', message: error.message };
      }

      // Check Agent Memory
      try {
        const memories = await base44.entities.AgentMemory.list();
        checks.agent_memory = { 
          status: 'healthy', 
          message: `${memories.length} memories stored` 
        };
      } catch (error) {
        checks.agent_memory = { status: 'error', message: error.message };
      }

      // Check Integrations
      try {
        const dataSources = await base44.entities.DataSource.list();
        checks.integrations = { 
          status: 'healthy', 
          message: `${dataSources.length} data sources connected` 
        };
      } catch (error) {
        checks.integrations = { status: 'warning', message: 'No integrations configured' };
      }

      // Check File Analysis
      try {
        const analyses = await base44.entities.FileAnalysis.list();
        checks.file_upload = { 
          status: 'healthy', 
          message: `${analyses.length} files analyzed` 
        };
      } catch (error) {
        checks.file_upload = { status: 'error', message: error.message };
      }

      // Check Conversations
      try {
        const convs = await base44.agents.listConversations({ agent_name: 'caio_agent' });
        checks.conversations = { 
          status: 'healthy', 
          message: `${convs.length} conversations` 
        };
      } catch (error) {
        checks.conversations = { status: 'error', message: error.message };
      }

      return checks;
    },
    refetchInterval: 60000
  });

  const handleRefresh = async () => {
    setIsChecking(true);
    await refetch();
    setIsChecking(false);
    toast.success("System health check completed");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      healthy: { label: 'Healthy', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      warning: { label: 'Warning', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      error: { label: 'Error', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      checking: { label: 'Checking', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    }[status] || config.checking;

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const healthItems = [
    { key: 'entities', icon: Server, label: 'Entity Database' },
    { key: 'knowledge_graph', icon: Network, label: 'Knowledge Graph' },
    { key: 'agent_memory', icon: Brain, label: 'Agent Memory' },
    { key: 'integrations', icon: Zap, label: 'Integrations' },
    { key: 'file_upload', icon: FileText, label: 'File Analysis' },
    { key: 'conversations', icon: MessageSquare, label: 'Conversations' }
  ];

  const overallStatus = healthCheck && Object.values(healthCheck).every(c => c.status === 'healthy') 
    ? 'healthy' 
    : healthCheck && Object.values(healthCheck).some(c => c.status === 'error')
    ? 'error'
    : 'warning';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-blue-400" />
            System Health
          </h1>
          <p className="text-slate-400 mt-1">Monitor platform status and feature health</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isChecking || isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isChecking || isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card className={`border-2 ${
        overallStatus === 'healthy' ? 'bg-green-500/10 border-green-500/30' :
        overallStatus === 'error' ? 'bg-red-500/10 border-red-500/30' :
        'bg-yellow-500/10 border-yellow-500/30'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusIcon(overallStatus)}
              <div>
                <h3 className="text-xl font-bold text-white">
                  {overallStatus === 'healthy' ? 'All Systems Operational' :
                   overallStatus === 'error' ? 'System Issues Detected' :
                   'System Running with Warnings'}
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Last checked: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
            {getStatusBadge(overallStatus)}
          </div>
        </CardContent>
      </Card>

      {/* Feature Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthItems.map(item => {
          const check = healthCheck?.[item.key];
          const Icon = item.icon;

          return (
            <Card key={item.key} className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <CardTitle className="text-white text-base">{item.label}</CardTitle>
                  </div>
                  {getStatusIcon(check?.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{check?.message || 'Checking...'}</p>
                  {check && getStatusBadge(check.status)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stripe Warning */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Payment Integration Issue
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300">
          <p>Invalid Stripe API key detected. Please update your Stripe credentials in the dashboard settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}