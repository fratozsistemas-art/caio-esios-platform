import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Palette,
  Save,
  Filter,
  Settings,
  Eye,
  Trash2,
  Star,
  Download
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const DEFAULT_NODE_COLORS = {
  company: '#3b82f6',
  executive: '#f59e0b',
  technology: '#8b5cf6',
  framework: '#10b981',
  market: '#ec4899',
  investor: '#06b6d4'
};

const DEFAULT_GRADIENT = {
  min_color: '#10b981',
  max_color: '#ef4444'
};

export default function GraphCustomizationPanel({ 
  onApplyCustomization, 
  currentConfig,
  availableNodeTypes = [],
  availableMetrics = []
}) {
  const [localConfig, setLocalConfig] = useState(currentConfig || {
    filters: { node_types: [], statuses: [], search_term: '' },
    color_scheme: {
      mode: 'type',
      node_colors: DEFAULT_NODE_COLORS,
      edge_colors: {},
      gradient_range: DEFAULT_GRADIENT
    },
    view_config: {
      node_size_mode: 'fixed',
      show_labels: true,
      edge_thickness_mode: 'fixed'
    }
  });

  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const queryClient = useQueryClient();

  const { data: savedViews = [] } = useQuery({
    queryKey: ['saved_graph_views'],
    queryFn: async () => {
      const views = await base44.entities.SavedGraphView.filter({
        graph_type: 'network'
      });
      return views;
    }
  });

  const saveViewMutation = useMutation({
    mutationFn: async (viewData) => {
      return await base44.entities.SavedGraphView.create(viewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saved_graph_views']);
      toast.success('View saved successfully');
      setSaveName('');
      setSaveDescription('');
    }
  });

  const deleteViewMutation = useMutation({
    mutationFn: async (viewId) => {
      return await base44.entities.SavedGraphView.delete(viewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saved_graph_views']);
      toast.success('View deleted');
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ viewId, isFavorite }) => {
      return await base44.entities.SavedGraphView.update(viewId, {
        is_favorite: !isFavorite
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saved_graph_views']);
    }
  });

  const handleApply = () => {
    onApplyCustomization(localConfig);
    toast.success('Customization applied');
  };

  const handleSaveView = () => {
    if (!saveName.trim()) {
      toast.error('Please enter a view name');
      return;
    }

    saveViewMutation.mutate({
      name: saveName,
      description: saveDescription,
      graph_type: 'network',
      filters: localConfig.filters,
      color_scheme: localConfig.color_scheme,
      view_config: localConfig.view_config
    });
  };

  const handleLoadView = (view) => {
    setLocalConfig({
      filters: view.filters || localConfig.filters,
      color_scheme: view.color_scheme || localConfig.color_scheme,
      view_config: view.view_config || localConfig.view_config
    });
    toast.success(`Loaded view: ${view.name}`);
  };

  const updateConfig = (section, key, value) => {
    setLocalConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateNodeColor = (nodeType, color) => {
    setLocalConfig(prev => ({
      ...prev,
      color_scheme: {
        ...prev.color_scheme,
        node_colors: {
          ...prev.color_scheme.node_colors,
          [nodeType]: color
        }
      }
    }));
  };

  const toggleNodeTypeFilter = (nodeType) => {
    setLocalConfig(prev => {
      const current = prev.filters.node_types || [];
      const updated = current.includes(nodeType)
        ? current.filter(t => t !== nodeType)
        : [...current, nodeType];
      
      return {
        ...prev,
        filters: {
          ...prev.filters,
          node_types: updated
        }
      };
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Palette className="w-4 h-4 mr-2" />
          Customize View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            Customize Network Visualization
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="saved">Saved Views</TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-white">Color Scheme Mode</Label>
                <Select
                  value={localConfig.color_scheme.mode}
                  onValueChange={(value) => updateConfig('color_scheme', 'mode', value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type">By Node Type</SelectItem>
                    <SelectItem value="metric">By Metric</SelectItem>
                    <SelectItem value="status">By Status</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {localConfig.color_scheme.mode === 'metric' && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-white">Metric</Label>
                    <Select
                      value={localConfig.color_scheme.metric_key}
                      onValueChange={(value) => updateConfig('color_scheme', 'metric_key', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMetrics.map(metric => (
                          <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white">Min Color</Label>
                      <Input
                        type="color"
                        value={localConfig.color_scheme.gradient_range?.min_color || DEFAULT_GRADIENT.min_color}
                        onChange={(e) => updateConfig('color_scheme', 'gradient_range', {
                          ...localConfig.color_scheme.gradient_range,
                          min_color: e.target.value
                        })}
                        className="h-10 bg-white/5 border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Max Color</Label>
                      <Input
                        type="color"
                        value={localConfig.color_scheme.gradient_range?.max_color || DEFAULT_GRADIENT.max_color}
                        onChange={(e) => updateConfig('color_scheme', 'gradient_range', {
                          ...localConfig.color_scheme.gradient_range,
                          max_color: e.target.value
                        })}
                        className="h-10 bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {localConfig.color_scheme.mode === 'type' && (
                <div className="space-y-3">
                  <Label className="text-white">Node Colors by Type</Label>
                  {availableNodeTypes.map(nodeType => (
                    <div key={nodeType} className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={localConfig.color_scheme.node_colors[nodeType] || DEFAULT_NODE_COLORS[nodeType] || '#3b82f6'}
                        onChange={(e) => updateNodeColor(nodeType, e.target.value)}
                        className="w-16 h-10 bg-white/5 border-white/10"
                      />
                      <Badge className="bg-white/10 text-white capitalize flex-1">
                        {nodeType}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Filters Tab */}
          <TabsContent value="filters" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">Filter by Node Type</Label>
                <div className="flex flex-wrap gap-2">
                  {availableNodeTypes.map(nodeType => {
                    const isSelected = localConfig.filters.node_types?.includes(nodeType);
                    return (
                      <Badge
                        key={nodeType}
                        onClick={() => toggleNodeTypeFilter(nodeType)}
                        className={`cursor-pointer capitalize ${
                          isSelected
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {nodeType}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-white">Search Filter</Label>
                <Input
                  value={localConfig.filters.search_term || ''}
                  onChange={(e) => updateConfig('filters', 'search_term', e.target.value)}
                  placeholder="Search nodes..."
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-white">Node Size Mode</Label>
                <Select
                  value={localConfig.view_config.node_size_mode}
                  onValueChange={(value) => updateConfig('view_config', 'node_size_mode', value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Size</SelectItem>
                    <SelectItem value="degree">By Degree (Connections)</SelectItem>
                    <SelectItem value="metric">By Metric</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Edge Thickness Mode</Label>
                <Select
                  value={localConfig.view_config.edge_thickness_mode}
                  onValueChange={(value) => updateConfig('view_config', 'edge_thickness_mode', value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Thickness</SelectItem>
                    <SelectItem value="weight">By Weight</SelectItem>
                    <SelectItem value="metric">By Metric</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-white">Show Labels</Label>
                <Switch
                  checked={localConfig.view_config.show_labels}
                  onCheckedChange={(checked) => updateConfig('view_config', 'show_labels', checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Saved Views Tab */}
          <TabsContent value="saved" className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Save Current View</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="View name..."
                  className="bg-white/5 border-white/10 text-white"
                />
                <Input
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Description (optional)..."
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button
                  onClick={handleSaveView}
                  disabled={saveViewMutation.isPending}
                  className="w-full bg-cyan-500 hover:bg-cyan-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save View
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label className="text-white">Saved Views</Label>
              {savedViews.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No saved views yet</p>
              ) : (
                <div className="space-y-2">
                  {savedViews.map(view => (
                    <motion.div
                      key={view.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{view.name}</p>
                            {view.is_favorite && (
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            )}
                          </div>
                          {view.description && (
                            <p className="text-slate-400 text-xs mt-1">{view.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFavoriteMutation.mutate({
                              viewId: view.id,
                              isFavorite: view.is_favorite
                            })}
                            className="text-slate-400 hover:text-yellow-400"
                          >
                            <Star className={`w-4 h-4 ${view.is_favorite ? 'fill-yellow-400' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleLoadView(view)}
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteViewMutation.mutate(view.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="bg-white/10" />

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setLocalConfig(currentConfig)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            Apply Customization
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}