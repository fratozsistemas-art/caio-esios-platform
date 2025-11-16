import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Filter, X, Layers, Focus, Grid, Circle, 
  Network, Building2, Users, Code 
} from 'lucide-react';

const NODE_TYPE_CONFIG = {
  company: { icon: Building2, color: 'bg-blue-500', label: 'Companies' },
  executive: { icon: Users, color: 'bg-purple-500', label: 'Executives' },
  technology: { icon: Code, color: 'bg-green-500', label: 'Technologies' },
  framework: { icon: Layers, color: 'bg-orange-500', label: 'Frameworks' },
  metric: { icon: Grid, color: 'bg-pink-500', label: 'Metrics' },
  default: { icon: Circle, color: 'bg-slate-500', label: 'Other' }
};

export default function AdvancedGraphControls({ 
  filters, 
  onFilterChange,
  clustering,
  onClusteringChange,
  focusMode,
  onFocusModeChange,
  availableNodeTypes = [],
  availableRelationshipTypes = []
}) {
  const toggleNodeType = (type) => {
    const current = filters.nodeTypes || [];
    const updated = current.includes(type) 
      ? current.filter(t => t !== type)
      : [...current, type];
    onFilterChange({ ...filters, nodeTypes: updated });
  };

  const toggleRelationshipType = (type) => {
    const current = filters.relationshipTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onFilterChange({ ...filters, relationshipTypes: updated });
  };

  const clearFilters = () => {
    onFilterChange({ nodeTypes: [], relationshipTypes: [] });
  };

  const hasFilters = (filters.nodeTypes?.length > 0) || (filters.relationshipTypes?.length > 0);

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            Graph Controls
          </h4>
          {hasFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearFilters}
              className="h-6 text-xs text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Focus Mode */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <Focus className="w-4 h-4 text-purple-400" />
            <Label htmlFor="focus-mode" className="text-sm text-white cursor-pointer">
              Focus Mode
            </Label>
          </div>
          <Switch
            id="focus-mode"
            checked={focusMode}
            onCheckedChange={onFocusModeChange}
          />
        </div>

        {/* Clustering */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <Label htmlFor="clustering" className="text-sm text-white cursor-pointer">
              Auto-Cluster
            </Label>
          </div>
          <Switch
            id="clustering"
            checked={clustering}
            onCheckedChange={onClusteringChange}
          />
        </div>

        {/* Node Type Filters */}
        {availableNodeTypes.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2">Filter by Entity Type</p>
            <div className="flex flex-wrap gap-2">
              {availableNodeTypes.map(type => {
                const config = NODE_TYPE_CONFIG[type] || NODE_TYPE_CONFIG.default;
                const Icon = config.icon;
                const isSelected = filters.nodeTypes?.includes(type) || filters.nodeTypes?.length === 0;
                
                return (
                  <Badge
                    key={type}
                    onClick={() => toggleNodeType(type)}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? `${config.color} text-white border-transparent` 
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Relationship Type Filters */}
        {availableRelationshipTypes.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2">Filter by Relationship</p>
            <div className="flex flex-wrap gap-2">
              {availableRelationshipTypes.slice(0, 8).map(type => {
                const isSelected = filters.relationshipTypes?.includes(type) || filters.relationshipTypes?.length === 0;
                
                return (
                  <Badge
                    key={type}
                    onClick={() => toggleRelationshipType(type)}
                    variant="outline"
                    className={`cursor-pointer transition-all text-xs ${
                      isSelected 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {type.replace(/_/g, ' ')}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasFilters && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-slate-400 mb-2">Active Filters:</p>
            <div className="space-y-1">
              {filters.nodeTypes?.length > 0 && (
                <p className="text-xs text-white">
                  <span className="text-slate-500">Node Types:</span> {filters.nodeTypes.join(', ')}
                </p>
              )}
              {filters.relationshipTypes?.length > 0 && (
                <p className="text-xs text-white">
                  <span className="text-slate-500">Relationships:</span> {filters.relationshipTypes.length}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}