import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, Brain, Network, MessageSquare, Folder, 
  Plus, Pin, Trash2, ExternalLink, Search, Filter
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const RESOURCE_ICONS = {
  strategy: FileText,
  analysis: Brain,
  knowledge_item: Folder,
  graph_node: Network,
  conversation: MessageSquare,
  document: FileText,
  file: FileText
};

const RESOURCE_COLORS = {
  strategy: 'text-blue-400 bg-blue-500/20',
  analysis: 'text-purple-400 bg-purple-500/20',
  knowledge_item: 'text-green-400 bg-green-500/20',
  graph_node: 'text-cyan-400 bg-cyan-500/20',
  conversation: 'text-yellow-400 bg-yellow-500/20',
  document: 'text-slate-400 bg-slate-500/20',
  file: 'text-orange-400 bg-orange-500/20'
};

export default function WorkspaceResourcesPanel({ workspaceId, canEdit }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['workspace_resources', workspaceId],
    queryFn: () => base44.entities.WorkspaceResource.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId
  });

  const togglePinMutation = useMutation({
    mutationFn: ({ resourceId, isPinned }) =>
      base44.entities.WorkspaceResource.update(resourceId, { is_pinned: !isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspace_resources', workspaceId]);
    }
  });

  const removeResourceMutation = useMutation({
    mutationFn: (resourceId) => base44.entities.WorkspaceResource.delete(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspace_resources', workspaceId]);
      toast.success('Resource removed from workspace');
    }
  });

  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.resource_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || resource.resource_type === filterType;
    return matchesSearch && matchesType;
  });

  const pinnedResources = filteredResources.filter(r => r.is_pinned);
  const unpinnedResources = filteredResources.filter(r => !r.is_pinned);

  const getResourceUrl = (resource) => {
    const urlMap = {
      strategy: createPageUrl('Strategies'),
      analysis: createPageUrl('AnalysesDashboard'),
      knowledge_item: createPageUrl('KnowledgeManagement'),
      graph_node: createPageUrl('KnowledgeGraph'),
      conversation: createPageUrl('Chat')
    };
    return urlMap[resource.resource_type] || '#';
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Folder className="w-5 h-5 text-purple-400" />
          Workspace Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="border-white/10 text-slate-400 hover:bg-white/5"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Resource Type Filter */}
        <div className="flex gap-2 flex-wrap">
          <Badge
            onClick={() => setFilterType('all')}
            className={`cursor-pointer ${filterType === 'all' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-400'}`}
          >
            All ({resources.length})
          </Badge>
          {Object.keys(RESOURCE_ICONS).map(type => {
            const count = resources.filter(r => r.resource_type === type).length;
            if (count === 0) return null;
            return (
              <Badge
                key={type}
                onClick={() => setFilterType(type)}
                className={`cursor-pointer ${filterType === type ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-400'}`}
              >
                {type} ({count})
              </Badge>
            );
          })}
        </div>

        {/* Pinned Resources */}
        {pinnedResources.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <Pin className="w-3 h-3" />
              Pinned
            </p>
            <div className="space-y-2">
              {pinnedResources.map((resource) => (
                <ResourceItem
                  key={resource.id}
                  resource={resource}
                  canEdit={canEdit}
                  onTogglePin={() => togglePinMutation.mutate({ 
                    resourceId: resource.id, 
                    isPinned: resource.is_pinned 
                  })}
                  onRemove={() => removeResourceMutation.mutate(resource.id)}
                  getResourceUrl={getResourceUrl}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Resources */}
        {unpinnedResources.length > 0 && (
          <div>
            {pinnedResources.length > 0 && (
              <p className="text-xs text-slate-400 mb-2">All Resources</p>
            )}
            <div className="space-y-2">
              {unpinnedResources.map((resource) => (
                <ResourceItem
                  key={resource.id}
                  resource={resource}
                  canEdit={canEdit}
                  onTogglePin={() => togglePinMutation.mutate({ 
                    resourceId: resource.id, 
                    isPinned: resource.is_pinned 
                  })}
                  onRemove={() => removeResourceMutation.mutate(resource.id)}
                  getResourceUrl={getResourceUrl}
                />
              ))}
            </div>
          </div>
        )}

        {filteredResources.length === 0 && !isLoading && (
          <p className="text-slate-400 text-center py-8">
            {searchQuery || filterType !== 'all' 
              ? 'No matching resources found' 
              : 'No resources linked to this workspace yet'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ResourceItem({ resource, canEdit, onTogglePin, onRemove, getResourceUrl }) {
  const Icon = RESOURCE_ICONS[resource.resource_type] || FileText;
  const colorClass = RESOURCE_COLORS[resource.resource_type] || 'text-slate-400 bg-slate-500/20';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
      <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{resource.resource_title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge className="bg-white/10 text-slate-400 text-xs">
            {resource.resource_type}
          </Badge>
          {resource.tags?.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="border-white/20 text-slate-400 text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePin}
            className={`h-8 w-8 ${resource.is_pinned ? 'text-yellow-400' : 'text-slate-400'} hover:text-yellow-300`}
          >
            <Pin className="w-4 h-4" />
          </Button>
        )}
        
        <Link to={getResourceUrl(resource)} target="_blank">
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-400 hover:text-blue-300 h-8 w-8"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>

        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 h-8 w-8"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}