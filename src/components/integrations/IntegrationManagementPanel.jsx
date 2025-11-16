import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, CheckCircle, XCircle, Clock, AlertCircle,
  RefreshCw, Trash2, Settings
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const STATUS_CONFIG = {
  active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  inactive: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle },
  syncing: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: RefreshCw },
  error: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle }
};

const LOG_STATUS_CONFIG = {
  success: { color: 'text-green-400', icon: CheckCircle },
  failed: { color: 'text-red-400', icon: XCircle },
  in_progress: { color: 'text-blue-400', icon: Clock }
};

export default function IntegrationManagementPanel() {
  const queryClient = useQueryClient();
  const [selectedSource, setSelectedSource] = useState(null);

  const { data: dataSources = [] } = useQuery({
    queryKey: ['dataSources'],
    queryFn: () => base44.entities.DataSource.list('-created_date')
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['integrationLogs', selectedSource?.id],
    queryFn: () => {
      if (!selectedSource) return [];
      return base44.entities.IntegrationLog.filter(
        { data_source_id: selectedSource.id },
        '-created_date',
        50
      );
    },
    enabled: !!selectedSource
  });

  const syncMutation = useMutation({
    mutationFn: (sourceId) => base44.functions.invoke('syncDataSource', { data_source_id: sourceId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['dataSources']);
      queryClient.invalidateQueries(['integrationLogs']);
      toast.success('Sincronização iniciada');
    },
    onError: () => toast.error('Erro ao sincronizar')
  });

  const deleteMutation = useMutation({
    mutationFn: (sourceId) => base44.entities.DataSource.delete(sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries(['dataSources']);
      setSelectedSource(null);
      toast.success('Integração removida');
    },
    onError: () => toast.error('Erro ao remover')
  });

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Gestão de Integrações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-3">
            {dataSources.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Nenhuma integração configurada
              </div>
            ) : (
              dataSources.map((source, idx) => {
                const statusConfig = STATUS_CONFIG[source.status];
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-white font-semibold">{source.name}</h4>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {source.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                              <div>
                                <span className="text-slate-400">Tipo:</span>
                                <span className="text-white ml-2 capitalize">{source.type}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Frequência:</span>
                                <span className="text-white ml-2">{source.config?.sync_frequency || 'manual'}</span>
                              </div>
                              {source.last_sync_at && (
                                <div className="col-span-2">
                                  <span className="text-slate-400">Última sync:</span>
                                  <span className="text-white ml-2">
                                    {new Date(source.last_sync_at).toLocaleString('pt-BR')}
                                  </span>
                                </div>
                              )}
                            </div>

                            {source.sync_stats && (
                              <div className="flex gap-3 text-xs">
                                <Badge variant="outline" className="border-white/10 text-slate-300">
                                  {source.sync_stats.items_synced || 0} itens
                                </Badge>
                                {source.sync_stats.errors > 0 && (
                                  <Badge className="bg-red-500/20 text-red-400">
                                    {source.sync_stats.errors} erros
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSource(source)}
                              className="border-white/10 text-white hover:bg-white/10"
                            >
                              <Activity className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => syncMutation.mutate(source.id)}
                              disabled={syncMutation.isPending || source.status === 'syncing'}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <RefreshCw className={`w-4 h-4 ${source.status === 'syncing' ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteMutation.mutate(source.id)}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            {!selectedSource ? (
              <div className="text-center py-8 text-slate-400">
                Selecione uma integração para ver os logs
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-1">{selectedSource.name}</h4>
                  <p className="text-sm text-slate-400">{logs.length} registros de log</p>
                </div>

                {logs.map((log, idx) => {
                  const logConfig = LOG_STATUS_CONFIG[log.status];
                  const LogIcon = logConfig.icon;
                  
                  return (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <LogIcon className={`w-4 h-4 ${logConfig.color}`} />
                          <span className="text-white capitalize">{log.operation}</span>
                          <Badge className={LOG_STATUS_CONFIG[log.status].color === 'text-green-400' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {log.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(log.created_date).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {log.items_processed > 0 && (
                          <div>
                            <span className="text-slate-400">Processados:</span>
                            <span className="text-white ml-1">{log.items_processed}</span>
                          </div>
                        )}
                        {log.errors_count > 0 && (
                          <div>
                            <span className="text-slate-400">Erros:</span>
                            <span className="text-red-400 ml-1">{log.errors_count}</span>
                          </div>
                        )}
                        {log.duration_ms && (
                          <div>
                            <span className="text-slate-400">Duração:</span>
                            <span className="text-white ml-1">{(log.duration_ms / 1000).toFixed(2)}s</span>
                          </div>
                        )}
                      </div>
                      
                      {log.error_details && (
                        <div className="mt-2 p-2 bg-red-500/10 rounded text-xs text-red-400">
                          {log.error_details}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-400 mb-1">Total de Integrações</p>
                  <p className="text-3xl font-bold text-white">{dataSources.length}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-400 mb-1">Ativas</p>
                  <p className="text-3xl font-bold text-green-400">
                    {dataSources.filter(s => s.status === 'active').length}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-400 mb-1">Com Erros</p>
                  <p className="text-3xl font-bold text-red-400">
                    {dataSources.filter(s => s.status === 'error').length}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-400 mb-1">Total Sincronizado</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {dataSources.reduce((sum, s) => sum + (s.sync_stats?.items_synced || 0), 0)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}