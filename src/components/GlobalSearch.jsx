import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, FileText, Briefcase, Brain, FolderOpen, Workflow } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const ENTITY_ICONS = {
  strategy: FileText,
  workspace: Briefcase,
  tsi_project: Brain,
  knowledge_item: FolderOpen,
  workflow: Workflow,
  analysis: BarChart3,
  company: Building2,
  conversation: MessageSquare,
  wiki_document: BookOpen
};

const ENTITY_LABELS = {
  strategy: 'Strategy',
  workspace: 'Workspace',
  tsi_project: 'TSI Project',
  knowledge_item: 'Knowledge',
  workflow: 'Workflow',
  analysis: 'Analysis',
  company: 'Company',
  conversation: 'Conversation',
  wiki_document: 'Document'
};

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('');

  const { data: results, isLoading } = useQuery({
    queryKey: ['global_search', query],
    queryFn: async () => {
      if (query.length < 3) return [];
      const { data } = await base44.functions.invoke('globalSearch', {
        query,
        limit: 20
      });
      return data.results || [];
    },
    enabled: query.length >= 3
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar em todas as entidades..."
              className="pl-10 bg-white/5 border-white/10 text-white"
              autoFocus
            />
          </div>

          {query.length > 0 && query.length < 3 && (
            <p className="text-sm text-slate-400 text-center py-8">
              Digite pelo menos 3 caracteres para buscar
            </p>
          )}

          {isLoading && (
            <p className="text-sm text-slate-400 text-center py-8">
              Buscando...
            </p>
          )}

          {results && results.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, idx) => {
                const Icon = ENTITY_ICONS[result.entity_type] || FileText;
                return (
                  <Link
                    key={idx}
                    to={getEntityUrl(result.entity_type, result.entity_id)}
                    onClick={onClose}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                  >
                    <Icon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-sm text-slate-400 truncate">{result.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                          {ENTITY_LABELS[result.entity_type] || result.entity_type}
                        </Badge>
                        {result.tags?.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="border-white/20 text-slate-300 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {results && results.length === 0 && query.length >= 3 && !isLoading && (
            <p className="text-sm text-slate-400 text-center py-8">
              Nenhum resultado encontrado
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getEntityUrl(entityType, entityId) {
  const urlMap = {
    strategy: 'Strategies',
    workspace: 'Workspaces',
    tsi_project: 'TSIProject',
    knowledge_item: 'KnowledgeManagement',
    workflow: 'WorkflowDesigner',
    analysis: 'AnalysesDashboard',
    company: 'CompanyIntelligenceHub',
    conversation: 'Chat',
    wiki_document: 'VersionWiki'
  };
  return createPageUrl(urlMap[entityType] || 'Dashboard');
}