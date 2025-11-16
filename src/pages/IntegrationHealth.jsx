import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, CheckCircle, XCircle, AlertTriangle, RefreshCw, 
  Database, Globe, Zap, Clock, TrendingUp, BarChart3 
} from 'lucide-react';

const INTEGRATION_CONFIGS = [
  { id: 'neo4j', name: 'Neo4j Graph Database', icon: Database, category: 'database' },
  { id: 'finnhub', name: 'Finnhub Financial Data', icon: TrendingUp, category: 'data' },
  { id: 'news_api', name: 'News API', icon: Globe, category: 'data' },
  { id: 'alpha_vantage', name: 'Alpha Vantage', icon: BarChart3, category: 'data' },
  { id: 'anthropic', name: 'Anthropic AI', icon: Zap, category: 'ai' }
];

export default function IntegrationHealth() {
  const [testingIntegration, setTestingIntegration] = useState(null);
  const queryClient = useQueryClient();

  const { data: healthData, isLoading } = useQuery({
    queryKey: ['integration_health'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('checkIntegrationHealth');
      return data;
    },
    refetchInterval: 60000 // Atualizar a cada minuto
  });

  const testIntegrationMutation = useMutation({
    mutationFn: async (integrationId) => {
      const { data } = await base44.functions.invoke('testIntegration', {
        integration_id: integrationId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['integration_health']);
      setTestingIntegration(null);
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'down': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'down': return XCircle;
      default: return Clock;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Degraded</Badge>;
      case 'down':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Down</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-400" />
            Integration Health Monitor
          </h1>
          <p className="text-slate-400 mt-1">Real-time status of external integrations</p>
        </div>
        <Button
          onClick={() => queryClient.invalidateQueries(['integration_health'])}
          variant="outline"
          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-400">
              {healthData?.summary?.healthy || 0}
            </p>
            <p className="text-sm text-slate-400 mt-1">Healthy</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-400">
              {healthData?.summary?.degraded || 0}
            </p>
            <p className="text-sm text-slate-400 mt-1">Degraded</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-6 text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-400">
              {healthData?.summary?.down || 0}
            </p>
            <p className="text-sm text-slate-400 mt-1">Down</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATION_CONFIGS.map((integration) => {
          const Icon = integration.icon;
          const status = healthData?.integrations?.[integration.id];
          const StatusIcon = getStatusIcon(status?.status);

          return (
            <Card key={integration.id} className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-blue-400" />
                    {integration.name}
                  </div>
                  {status && getStatusBadge(status.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {status && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Response Time:</span>
                      <span className="text-white font-medium">
                        {status.response_time ? `${status.response_time}ms` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Last Checked:</span>
                      <span className="text-white font-medium">
                        {status.last_checked ? new Date(status.last_checked).toLocaleTimeString() : 'Never'}
                      </span>
                    </div>
                    {status.error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <p className="text-xs text-red-400">{status.error}</p>
                      </div>
                    )}
                  </>
                )}
                <Button
                  onClick={() => {
                    setTestingIntegration(integration.id);
                    testIntegrationMutation.mutate(integration.id);
                  }}
                  disabled={testingIntegration === integration.id}
                  variant="outline"
                  size="sm"
                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  {testingIntegration === integration.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}