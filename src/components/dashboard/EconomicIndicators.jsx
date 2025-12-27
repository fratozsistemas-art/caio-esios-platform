import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function EconomicIndicators() {
  // BCB Indicator codes
  const indicators = [
    { code: '433', name: 'IPCA (Inflation)', unit: '%', icon: Activity },
    { code: '4390', name: 'CDI Rate', unit: '%', icon: TrendingUp },
    { code: '1', name: 'USD/BRL Rate', unit: 'R$', icon: Activity }
  ];

  const { data: indicatorsData, isLoading, refetch } = useQuery({
    queryKey: ['economic-indicators'],
    queryFn: async () => {
      const results = await Promise.all(
        indicators.map(async (indicator) => {
          try {
            const response = await base44.functions.invoke('fetchBCBData', {
              seriesCode: indicator.code
            });
            
            const data = response.data;
            const latest = data[data.length - 1];
            const previous = data[data.length - 2];
            
            const value = parseFloat(latest.valor);
            const previousValue = parseFloat(previous.valor);
            const change = value - previousValue;
            const changePercent = ((change / previousValue) * 100).toFixed(2);

            return {
              ...indicator,
              value,
              change,
              changePercent,
              date: latest.data
            };
          } catch (error) {
            return null;
          }
        })
      );
      return results.filter(r => r !== null);
    },
    refetchInterval: 3600000, // 1 hour
    staleTime: 3000000
  });

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          Economic Indicators
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
        {isLoading && !indicatorsData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="space-y-3">
            {indicatorsData?.map((indicator, idx) => {
              const Icon = indicator.icon;
              const isPositive = indicator.change >= 0;
              
              return (
                <motion.div
                  key={indicator.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">
                          {indicator.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(indicator.date.split('/').reverse().join('-')).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {indicator.value.toFixed(2)}{indicator.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        <div className="flex items-center gap-1">
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>
                            {isPositive ? '+' : ''}{indicator.changePercent}%
                          </span>
                        </div>
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        <div className="text-xs text-slate-500 text-center pt-2 border-t border-white/10">
          Data from Banco Central do Brasil • Updates hourly
        </div>
      </CardContent>
    </Card>
  );
}