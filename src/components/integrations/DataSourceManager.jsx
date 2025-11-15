import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Database, Plus, RefreshCw, Loader2, CheckCircle, XCircle,
  AlertCircle, ExternalLink, Trash2, Settings
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const SOURCE_ICONS = {
  slack: '💬',
  google_drive: '📁',
  jira: '🎯',
  github: '⚡',
  notion: '📝',
  salesforce: '☁️',
  hubspot: '🔶',
  database: '💾'
};

const STATUS_COLORS = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  syncing: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};

export default function DataSourceManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({});

  const { data: dataSources = [], isLoading } = useQuery({
    queryKey: ['dataSources'],
    queryFn: () => base44.entities.DataSource.list()
  });

  const connectMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('connectDataSource', data),
    onSuccess: () => {
      toast.success('Data source connected!');
      queryClient.invalidateQueries(['dataSources']);
      setIsDialogOpen(false);
      setFormData({});
    },
    onError: (error) => {
      toast.error(error.response?.data?.details || 'Connection failed');
    }
  });

  const syncMutation = useMutation({
    mutationFn: (id) => base44.functions.invoke('syncDataSource', { data_source_id: id }),
    onSuccess: (response) => {
      toast.success(`Synced ${response.data.sync_result.items_synced} items!`);
      queryClient.invalidateQueries(['dataSources']);
    },
    onError: () => {
      toast.error('Sync failed');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DataSource.delete(id),
    onSuccess: () => {
      toast.success('Data source removed');
      queryClient.invalidateQueries(['dataSources']);
    }
  });

  const handleConnect = () => {
    let credentials = {};
    let config = {
      sync_frequency: formData.sync_frequency || 'daily',
      data_types: formData.data_types || []
    };

    switch (selectedType) {
      case 'slack':
        credentials = { bot_token: formData.bot_token };
        break;
      case 'google_drive':
        credentials = { access_token: formData.access_token };
        break;
      case 'jira':
        credentials = {
          api_token: formData.api_token,
          email: formData.email,
          domain: formData.domain
        };
        break;
    }

    connectMutation.mutate({
      source_type: selectedType,
      name: formData.name,
      credentials,
      config
    });
  };

  const renderConnectionForm = () => {
    switch (selectedType) {
      case 'slack':
        return (
          <div className="space-y-4">
            <Input
              placeholder="Connection Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
            <Input
              placeholder="Bot Token (xoxb-...)"
              value={formData.bot_token || ''}
              onChange={(e) => setFormData({ ...formData, bot_token: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-slate-400">
              Get your bot token from{' '}
              <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Slack API
              </a>
            </p>
          </div>
        );

      case 'google_drive':
        return (
          <div className="space-y-4">
            <Input
              placeholder="Connection Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
            <Input
              placeholder="Access Token"
              value={formData.access_token || ''}
              onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-slate-400">
              Generate token from{' '}
              <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Google Cloud Console
              </a>
            </p>
          </div>
        );

      case 'jira':
        return (
          <div className="space-y-4">
            <Input
              placeholder="Connection Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
            <Input
              placeholder="Jira Domain (e.g., yourcompany)"
              value={formData.domain || ''}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
            <Input
              placeholder="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
            <Input
              placeholder="API Token"
              value={formData.api_token || ''}
              onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        );

      default:
        return <p className="text-slate-400">Select a data source type</p>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Data Sources</h2>
          <p className="text-slate-400 text-sm">Connect external platforms to enrich your knowledge graph</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Connect Source
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Connect Data Source</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select data source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slack">💬 Slack</SelectItem>
                  <SelectItem value="google_drive">📁 Google Drive</SelectItem>
                  <SelectItem value="jira">🎯 Jira</SelectItem>
                  <SelectItem value="github">⚡ GitHub (Coming Soon)</SelectItem>
                  <SelectItem value="notion">📝 Notion (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>

              {selectedType && renderConnectionForm()}

              {selectedType && (
                <>
                  <Select
                    value={formData.sync_frequency || 'daily'}
                    onValueChange={(v) => setFormData({ ...formData, sync_frequency: v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Only</SelectItem>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleConnect}
                    disabled={connectMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {connectMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataSources.map((source, idx) => (
          <motion.div
            key={source.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{SOURCE_ICONS[source.type]}</div>
                    <div>
                      <CardTitle className="text-white text-base">{source.name}</CardTitle>
                      <p className="text-xs text-slate-400 capitalize">{source.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <Badge className={STATUS_COLORS[source.status]}>
                    {source.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-slate-500 text-xs">Items Synced</div>
                    <div className="text-white font-medium">{source.sync_stats?.items_synced || 0}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Entities</div>
                    <div className="text-white font-medium">{source.sync_stats?.entities_created || 0}</div>
                  </div>
                </div>
                
                {source.last_sync_at && (
                  <div className="text-xs text-slate-400">
                    Last sync: {new Date(source.last_sync_at).toLocaleDateString()}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => syncMutation.mutate(source.id)}
                    disabled={syncMutation.isPending || source.status === 'syncing'}
                    className="flex-1 border-white/10 text-white hover:bg-white/10"
                  >
                    {syncMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(source.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {dataSources.length === 0 && !isLoading && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12 text-center">
            <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Data Sources Connected</h3>
            <p className="text-slate-400 text-sm mb-6">
              Connect external platforms to automatically enrich your knowledge graph
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Connect Your First Source
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}