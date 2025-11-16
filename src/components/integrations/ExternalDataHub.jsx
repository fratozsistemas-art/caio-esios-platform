import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { 
  TrendingUp, Newspaper, Twitter, DollarSign, BarChart3, 
  Search, Loader2, ArrowUp, ArrowDown, ExternalLink,
  TrendingDown, AlertCircle, CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ExternalDataHub() {
  const [activeTab, setActiveTab] = useState("financial");
  
  // Financial Data State
  const [stockSymbol, setStockSymbol] = useState("AAPL");
  const [financialType, setFinancialType] = useState("stock_quote");
  const [financialData, setFinancialData] = useState(null);

  // News State
  const [newsQuery, setNewsQuery] = useState("");
  const [newsCategory, setNewsCategory] = useState("business");
  const [newsData, setNewsData] = useState(null);

  // Social State
  const [socialQuery, setSocialQuery] = useState("");
  const [socialData, setSocialData] = useState(null);

  // Mutations
  const financialMutation = useMutation({
    mutationFn: (params) => base44.functions.invoke('fetchFinancialData', params),
    onSuccess: ({ data }) => {
      setFinancialData(data);
      toast.success("Financial data fetched successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to fetch financial data");
    }
  });

  const newsMutation = useMutation({
    mutationFn: (params) => base44.functions.invoke('fetchNewsSentiment', params),
    onSuccess: ({ data }) => {
      setNewsData(data);
      toast.success(`Fetched ${data.articles?.length || 0} articles`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to fetch news");
    }
  });

  const socialMutation = useMutation({
    mutationFn: (params) => base44.functions.invoke('fetchSocialTrends', params),
    onSuccess: ({ data }) => {
      setSocialData(data);
      toast.success(`Analyzed ${data.posts?.length || 0} social posts`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to fetch social trends");
    }
  });

  const handleFetchFinancial = () => {
    financialMutation.mutate({
      data_type: financialType,
      symbol: stockSymbol,
      interval: 'daily'
    });
  };

  const handleFetchNews = () => {
    newsMutation.mutate({
      query: newsQuery || undefined,
      category: !newsQuery ? newsCategory : undefined,
      sentiment_analysis: true,
      max_results: 20
    });
  };

  const handleFetchSocial = () => {
    socialMutation.mutate({
      query: socialQuery,
      analyze_sentiment: true,
      max_results: 50
    });
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          External Data Intelligence Hub
        </CardTitle>
        <p className="text-sm text-slate-400">
          Real-time financial data, news sentiment, and social media trends for strategic analysis
        </p>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border-white/10 w-full">
            <TabsTrigger value="financial" className="flex-1">
              <DollarSign className="w-4 h-4 mr-2" />
              Financial Data
            </TabsTrigger>
            <TabsTrigger value="news" className="flex-1">
              <Newspaper className="w-4 h-4 mr-2" />
              News & Sentiment
            </TabsTrigger>
            <TabsTrigger value="social" className="flex-1">
              <Twitter className="w-4 h-4 mr-2" />
              Social Trends
            </TabsTrigger>
          </TabsList>

          {/* Financial Data Tab */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Select value={financialType} onValueChange={setFinancialType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock_quote">Stock Quote</SelectItem>
                  <SelectItem value="stock_fundamentals">Fundamentals</SelectItem>
                  <SelectItem value="economic_indicators">Economic Data</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Symbol (e.g., AAPL)"
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                className="bg-white/5 border-white/10 text-white"
              />

              <Button
                onClick={handleFetchFinancial}
                disabled={financialMutation.isPending || !stockSymbol}
                className="bg-green-600 hover:bg-green-700"
              >
                {financialMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Fetch
                  </>
                )}
              </Button>
            </div>

            {financialData?.data && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg p-6 border border-green-500/30"
              >
                {financialData.data.symbol && (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{financialData.data.symbol}</h3>
                        <p className="text-slate-400 text-sm">{financialData.data.company || 'Stock Quote'}</p>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {financialData.data.source}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Price</p>
                        <p className="text-2xl font-bold text-white">
                          ${financialData.data.price?.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Change</p>
                        <div className="flex items-center gap-2">
                          {financialData.data.change >= 0 ? (
                            <ArrowUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-red-400" />
                          )}
                          <span className={`text-lg font-bold ${financialData.data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {financialData.data.percent_change?.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">High</p>
                        <p className="text-lg font-bold text-white">
                          ${financialData.data.high?.toFixed(2)}
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Low</p>
                        <p className="text-lg font-bold text-white">
                          ${financialData.data.low?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {financialData.data.metrics && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h4 className="text-white font-semibold mb-3">Key Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {Object.entries(financialData.data.metrics)
                            .filter(([_, value]) => value != null)
                            .slice(0, 8)
                            .map(([key, value]) => (
                              <div key={key}>
                                <span className="text-slate-400">{key.replace(/_/g, ' ')}:</span>
                                <span className="text-white ml-2 font-medium">
                                  {typeof value === 'number' ? value.toFixed(2) : value}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </TabsContent>

          {/* News & Sentiment Tab */}
          <TabsContent value="news" className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Search news (leave empty for category)"
                value={newsQuery}
                onChange={(e) => setNewsQuery(e.target.value)}
                className="flex-1 bg-white/5 border-white/10 text-white"
              />

              {!newsQuery && (
                <Select value={newsCategory} onValueChange={setNewsCategory}>
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Button
                onClick={handleFetchNews}
                disabled={newsMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {newsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {newsData?.sentiment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/30"
              >
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Sentiment Analysis
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded p-3">
                    <p className="text-xs text-slate-400 mb-1">Overall</p>
                    <Badge className={
                      newsData.sentiment.overall_sentiment === 'bullish' || newsData.sentiment.overall_sentiment === 'positive'
                        ? 'bg-green-500/20 text-green-400'
                        : newsData.sentiment.overall_sentiment === 'bearish' || newsData.sentiment.overall_sentiment === 'negative'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }>
                      {newsData.sentiment.overall_sentiment}
                    </Badge>
                  </div>
                  <div className="bg-white/5 rounded p-3">
                    <p className="text-xs text-slate-400 mb-1">Score</p>
                    <p className="text-lg font-bold text-white">
                      {newsData.sentiment.sentiment_score || 0}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded p-3">
                    <p className="text-xs text-slate-400 mb-1">Confidence</p>
                    <p className="text-lg font-bold text-white">
                      {newsData.sentiment.confidence}%
                    </p>
                  </div>
                </div>
                {newsData.sentiment.market_implications && (
                  <p className="text-sm text-slate-300 mt-3">
                    {newsData.sentiment.market_implications}
                  </p>
                )}
              </motion.div>
            )}

            {newsData?.articles && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {newsData.articles.map((article, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-white font-medium hover:text-blue-400 transition-colors"
                        >
                          {article.title}
                        </a>
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                          {article.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <span>{article.source}</span>
                          <span>•</span>
                          <span>{new Date(article.published_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Social Trends Tab */}
          <TabsContent value="social" className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Search topic or #hashtag"
                value={socialQuery}
                onChange={(e) => setSocialQuery(e.target.value)}
                className="flex-1 bg-white/5 border-white/10 text-white"
              />

              <Button
                onClick={handleFetchSocial}
                disabled={socialMutation.isPending || !socialQuery}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {socialMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            {socialData?.trends && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/30"
              >
                <h4 className="text-white font-semibold mb-3">Trend Analysis</h4>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/5 rounded p-2 text-center">
                    <p className="text-xs text-slate-400">Sentiment</p>
                    <Badge className={
                      socialData.trends.overall_sentiment === 'positive' ? 'bg-green-500/20 text-green-400' : 
                      socialData.trends.overall_sentiment === 'negative' ? 'bg-red-500/20 text-red-400' : 
                      'bg-slate-500/20 text-slate-400'
                    }>
                      {socialData.trends.overall_sentiment}
                    </Badge>
                  </div>
                  <div className="bg-white/5 rounded p-2 text-center">
                    <p className="text-xs text-slate-400">Engagement</p>
                    <p className="text-sm font-bold text-white">{socialData.trends.engagement_level}</p>
                  </div>
                  <div className="bg-white/5 rounded p-2 text-center">
                    <p className="text-xs text-slate-400">Score</p>
                    <p className="text-sm font-bold text-white">{socialData.trends.sentiment_score}</p>
                  </div>
                  <div className="bg-white/5 rounded p-2 text-center">
                    <p className="text-xs text-slate-400">Posts</p>
                    <p className="text-sm font-bold text-white">{socialData.total_results}</p>
                  </div>
                </div>

                {socialData.trends.market_implications && (
                  <div className="bg-white/5 rounded p-3 mb-3">
                    <p className="text-xs text-slate-400 mb-1">Market Implications</p>
                    <p className="text-sm text-white">{socialData.trends.market_implications}</p>
                  </div>
                )}

                {socialData.trends.key_themes?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {socialData.trends.key_themes.map((theme, idx) => (
                      <Badge key={idx} variant="outline" className="border-white/20 text-slate-300">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {socialData?.top_hashtags && socialData.top_hashtags.length > 0 && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-semibold mb-3">Trending Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {socialData.top_hashtags.map((tag, idx) => (
                    <Badge key={idx} className="bg-blue-500/20 text-blue-400">
                      #{tag.hashtag} ({tag.count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}