import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HardDrive, Sparkles, Loader2, CheckCircle, 
  TrendingUp, Tag, Zap, RefreshCw 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function KnowledgeIndexManager() {
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexResult, setIndexResult] = useState(null);

  const { data: indexStats, refetch } = useQuery({
    queryKey: ['indexStats'],
    queryFn: async () => {
      const indexed = await base44.entities.SearchIndex.list('-indexed_at', 1000);
      
      const byType = indexed.reduce((acc, item) => {
        acc[item.source_type] = (acc[item.source_type] || 0) + 1;
        return acc;
      }, {});

      const avgRelevance = indexed.length > 0
        ? indexed.reduce((sum, item) => sum + (item.relevance_score || 0), 0) / indexed.length
        : 0;

      const allCategories = indexed.flatMap(item => item.categories || []);
      const uniqueCategories = [...new Set(allCategories)];

      const allTags = indexed.flatMap(item => item.tags || []);
      const topTags = Object.entries(
        allTags.reduce((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1]).slice(0, 10);

      return {
        total: indexed.length,
        byType,
        avgRelevance: avgRelevance.toFixed(1),
        categories: uniqueCategories.length,
        topTags,
        recentlyIndexed: indexed.slice(0, 5)
      };
    }
  });

  const handleBulkIndex = async () => {
    setIsIndexing(true);
    try {
      const result = await base44.functions.invoke('bulkIndexContent');
      setIndexResult(result);
      setTimeout(() => {
        refetch();
      }, 1000);
    } catch (error) {
      console.error('Indexing failed:', error);
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-[#00D4FF]" />
            Knowledge Index Manager
          </h1>
          <p className="text-slate-400">AI-powered content indexing and categorization</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleBulkIndex}
            disabled={isIndexing}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isIndexing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Indexing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Bulk Index All Content
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Index Result */}
      {indexResult && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-white font-semibold">{indexResult.message}</p>
              <p className="text-sm text-slate-400">
                Successfully indexed {indexResult.indexed} items
                {indexResult.failed > 0 && `, ${indexResult.failed} failed`}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      {indexStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Indexed', value: indexStats.total, icon: HardDrive, color: 'blue' },
              { label: 'Avg Relevance', value: `${indexStats.avgRelevance}%`, icon: TrendingUp, color: 'green' },
              { label: 'Categories', value: indexStats.categories, icon: Tag, color: 'purple' },
              { label: 'Active Tags', value: indexStats.topTags.length, icon: Zap, color: 'yellow' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                      </div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-slate-400">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Content Type Breakdown */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Indexed Content by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                {Object.entries(indexStats.byType).map(([type, count]) => (
                  <div key={type} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-2xl font-bold text-white mb-1">{count}</div>
                    <div className="text-sm text-slate-400 capitalize">
                      {type.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Tags */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Most Common Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {indexStats.topTags.map(([tag, count]) => (
                  <Badge key={tag} className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30">
                    {tag} ({count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recently Indexed */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recently Indexed Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {indexStats.recentlyIndexed.map((item) => (
                  <div key={item.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                      <Badge className="bg-purple-500/20 text-purple-400">
                        {item.relevance_score}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">{item.summary}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.categories?.slice(0, 3).map((cat, i) => (
                        <Badge key={i} className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}