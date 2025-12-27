import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function RealTimeStockTicker() {
  const [symbols] = useState(['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: stockData, isLoading, refetch } = useQuery({
    queryKey: ['realtime-stocks', symbols],
    queryFn: async () => {
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const response = await base44.functions.invoke('fetchStockData', {
              symbol,
              metric: 'quote'
            });
            
            const quote = response.data['Global Quote'];
            return {
              symbol,
              price: parseFloat(quote['05. price']),
              change: parseFloat(quote['09. change']),
              changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
              volume: parseInt(quote['06. volume']),
              timestamp: quote['07. latest trading day']
            };
          } catch (error) {
            return null;
          }
        })
      );
      return results.filter(r => r !== null);
    },
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 20000
  });

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Live Stock Ticker
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge 
            className={`${autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Live' : 'Paused'}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            className="text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && !stockData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : (
          <div className="space-y-2">
            {stockData?.map((stock, idx) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-500/20 text-blue-400 font-mono">
                    {stock.symbol}
                  </Badge>
                  <div>
                    <div className="text-white font-semibold">
                      ${stock.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400">
                      Vol: {(stock.volume / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.change >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="font-semibold">
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <div className="text-xs text-slate-500 text-center pt-2">
          Updates every 30 seconds • Data by Alpha Vantage
        </div>
      </CardContent>
    </Card>
  );
}