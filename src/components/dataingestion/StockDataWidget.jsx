import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Search } from "lucide-react";

export default function StockDataWidget() {
  const [symbol, setSymbol] = useState("AAPL");
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('fetchStockData', { 
        symbol: symbol.toUpperCase(),
        metric: 'quote'
      });
      setStockData(data.data['Global Quote']);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-yellow-400" />
          Stock Market Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Stock symbol (e.g., AAPL)"
            className="bg-white/5 border-white/10 text-white uppercase"
            onKeyDown={(e) => e.key === 'Enter' && fetchStock()}
          />
          <Button 
            onClick={fetchStock} 
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {loading && (
          <div className="text-center py-6">
            <TrendingUp className="w-8 h-8 text-yellow-400 animate-pulse mx-auto mb-2" />
            <p className="text-slate-400">Fetching stock data...</p>
          </div>
        )}

        {stockData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Symbol</span>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {stockData['01. symbol']}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Price</span>
              <span className="text-white font-bold text-lg">
                ${parseFloat(stockData['05. price']).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Change</span>
              <div className="flex items-center gap-1">
                {parseFloat(stockData['09. change']) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={parseFloat(stockData['09. change']) >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {stockData['09. change']} ({stockData['10. change percent']})
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div>
                <p className="text-xs text-slate-500">Open</p>
                <p className="text-white font-medium">${parseFloat(stockData['02. open']).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Volume</p>
                <p className="text-white font-medium">{parseInt(stockData['06. volume']).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}