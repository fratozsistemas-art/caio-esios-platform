import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Newspaper, TrendingUp, Search, ExternalLink, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function MarketDataPanel() {
  const [query, setQuery] = useState("artificial intelligence");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('fetchMarketNews', { 
        query, 
        pageSize: 10 
      });
      setNews(data.articles || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToKnowledge = useMutation({
    mutationFn: async (article) => {
      return await base44.entities.KnowledgeItem.create({
        title: article.title,
        content: article.description,
        source: article.source,
        url: article.url,
        item_type: 'market_news',
        tags: ['market_data', 'external_source'],
        metadata: {
          publishedAt: article.publishedAt,
          imageUrl: article.imageUrl
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge_items'] });
    }
  });

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-400" />
          Market News & Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search market news..."
            className="bg-white/5 border-white/10 text-white"
            onKeyDown={(e) => e.key === 'Enter' && fetchNews()}
          />
          <Button 
            onClick={fetchNews} 
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <TrendingUp className="w-8 h-8 text-blue-400 animate-pulse mx-auto mb-2" />
            <p className="text-slate-400">Fetching latest market news...</p>
          </div>
        )}

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {news.map((article, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                        {article.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="border-white/20 text-slate-400">
                          {article.source}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(article.url, '_blank')}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => saveToKnowledge.mutate(article)}
                        className="text-green-400 hover:text-green-300"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}