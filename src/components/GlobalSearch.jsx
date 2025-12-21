import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, FileText, Briefcase, Brain, FolderOpen, Workflow, BarChart3, Building2, MessageSquare, BookOpen, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';

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
  const [useAI, setUseAI] = useState(false);

  const { data: results, isLoading } = useQuery({
    queryKey: ['global_search', query, useAI],
    queryFn: async () => {
      if (query.length < 3) return [];
      
      if (useAI) {
        const aiResults = await base44.functions.invoke('aiSearch', {
          query,
          limit: 15
        });
        return aiResults;
      }
      
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
      <DialogContent className="bg-gradient-to-br from-[#0A2540] to-[#0A1628] border-[#00D4FF]/30 max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#00D4FF]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything... (e.g., 'What strategies mention AI?' or 'Show me recent feedback')"
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              autoFocus
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant={useAI ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUseAI(!useAI)}
              className={useAI ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'border-white/20 text-slate-400'}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Search {useAI && '✓'}
            </Button>
            {useAI && query.length >= 3 && (
              <span className="text-xs text-slate-400">
                Natural language understanding enabled
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1">
          {query.length > 0 && query.length < 3 && (
            <p className="text-sm text-slate-400 text-center py-8">
              Type at least 3 characters to search
            </p>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" />
            </div>
          )}

          {/* AI Search Results */}
          {!isLoading && useAI && results?.results && (
            <AnimatePresence>
              <div className="space-y-4">
                {/* Summary */}
                {results.summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300">{results.summary}</p>
                    </div>
                    {results.total_matches > 0 && (
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                        {results.total_matches} relevant items found
                      </Badge>
                    )}
                  </motion.div>
                )}

                {/* Results */}
                {results.results.map((result, idx) => {
                  const Icon = ENTITY_ICONS[result.type] || FileText;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        to={getEntityUrl(result.type, result.id)}
                        onClick={onClose}
                        className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00D4FF]/30 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 text-[#00D4FF] flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-sm font-semibold text-white">
                                {result.title}
                              </h3>
                              <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
                                {result.relevance_score}% match
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">
                              {result.explanation}
                            </p>
                            {result.excerpt && (
                              <p className="text-xs text-slate-500 italic border-l-2 border-[#00D4FF]/30 pl-2">
                                "{result.excerpt}"
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Suggested Questions */}
                {results.suggested_questions?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      Suggested follow-up questions:
                    </p>
                    <div className="space-y-1">
                      {results.suggested_questions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => setQuery(q)}
                          className="block w-full text-left text-xs text-[#00D4FF] hover:text-[#00E5FF] transition-colors"
                        >
                          • {q}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </AnimatePresence>
          )}

          {/* Standard Search Results */}
          {!isLoading && !useAI && results?.length > 0 && (
            <div className="space-y-2">
              {results.map((result, idx) => {
                const Icon = ENTITY_ICONS[result.entity_type] || FileText;
                return (
                  <Link
                    key={idx}
                    to={getEntityUrl(result.entity_type, result.entity_id)}
                    onClick={onClose}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-[#00D4FF]/30"
                  >
                    <Icon className="w-5 h-5 text-[#00D4FF] flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-sm text-slate-400 truncate">{result.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
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

          {!isLoading && query.length >= 3 && (!results || (Array.isArray(results) ? results.length === 0 : !results.results?.length)) && (
            <p className="text-sm text-slate-400 text-center py-8">
              No results found
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