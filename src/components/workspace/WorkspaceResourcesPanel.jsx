import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, Brain, Network, MessageSquare, Folder, 
  Plus, Pin, Trash2, ExternalLink, Search, Filter, Sparkles, 
  Loader2, TrendingUp, Check, X
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['workspace_resources', workspaceId],
    queryFn: () => base44.entities.WorkspaceResource.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId
  });

  const { data: suggestions = [], isLoading: loadingSuggestions, refetch: refetchSuggestions } = useQuery({
    queryKey: ['workspace_resource_suggestions', workspaceId],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('suggestWorkspaceResources', {
        workspace_id: workspaceId
      });
      return data.suggestions || [];
    },
    enabled: showSuggestions && !!workspaceId
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

  const linkSuggestedResourceMutation = useMutation({
    mutationFn: async (suggestion) => {
      const { data } = await base44.functions.invoke('linkResourceToWorkspace', {
        workspace_id: workspaceId,
        resource_type: suggestion.resource_type,
        resource_id: suggestion.resource_id,
        resource_title: suggestion.resource_title
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workspace_resources', workspaceId]);
      refetchSuggestions();
      toast.success('Resource linked and auto-tagged!');
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
    <div className="space-y-6">
      {/* AI Suggestions */}
      {canEdit && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI-Suggested Resources
              </CardTitle>
              <Button
                onClick={() => {
                  setShowSuggestions(!showSuggestions);
                  if (!showSuggestions) refetchSuggestions();
                }}
                variant="outline"
                size="sm"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              >
                {loadingSuggestions ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {showSuggestions ? 'Hide' : 'Get AI Suggestions'}
              </Button>
            </div>
          </CardHeader>
          <AnimatePresence>
            {showSuggestions && (
              <CardContent className="space-y-2">
                {loadingSuggestions ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Analyzing workspace and finding relevant resources...</p>
                  </div>
                ) : suggestions.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No suggestions available</p>
                ) : (
                  suggestions.map((suggestion, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-purple-500/20"
                    >
                      <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">{suggestion.resource_title}</p>
                        <p className="text-xs text-slate-400 mt-1">{suggestion.relevance_reason}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            {suggestion.resource_type}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                            {suggestion.relevance_score}% match
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          onClick={() => linkSuggestedResourceMutation.mutate(suggestion)}
                          disabled={linkSuggestedResourceMutation.isPending}
                          className="h-8 w-8 bg-green-500 hover:bg-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            )}
          </AnimatePresence>
        </Card>
      )}

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
    </div>
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