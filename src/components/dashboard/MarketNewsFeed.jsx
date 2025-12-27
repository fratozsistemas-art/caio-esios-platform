import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, ExternalLink, RefreshCw, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function MarketNewsFeed() {
  const [query, setQuery] = useState('market trends finance');

  const { data: newsData, isLoading, refetch } = useQuery({
    queryKey: ['market-news', query],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchMarketNews', {
        query,
        pageSize: 5
      });
      return response.articles;
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 240000
  });

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffMs = now - published;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return `${diffMins}m ago`;
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-400" />
          Market News Feed
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading}
          className="text-white hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && !newsData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {newsData?.map((article, idx) => (
              <motion.a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10"
              >
                <div className="flex items-start gap-3">
                  {article.imageUrl && (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm mb-1 line-clamp-2 hover:text-blue-400 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                        {article.source}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {getTimeAgo(article.publishedAt)}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-500 ml-auto" />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
        <div className="text-xs text-slate-500 text-center pt-2 border-t border-white/10">
          Powered by News API • Updates every 5 minutes
        </div>
      </CardContent>
    </Card>
  );
}