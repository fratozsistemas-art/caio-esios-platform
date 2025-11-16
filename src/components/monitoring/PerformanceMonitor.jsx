import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null
  });

  useEffect(() => {
    // Observar Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({ ...prev, lcp: lastEntry.renderTime || lastEntry.loadTime }));
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        setMetrics(prev => ({ ...prev, cls: clsValue }));
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Time to First Byte & First Contentful Paint
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.responseStart) {
            setMetrics(prev => ({ ...prev, ttfb: entry.responseStart - entry.requestStart }));
          }
        });
      });
      navigationObserver.observe({ type: 'navigation', buffered: true });

      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        });
      });
      fcpObserver.observe({ type: 'paint', buffered: true });

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
        navigationObserver.disconnect();
        fcpObserver.disconnect();
      };
    }
  }, []);

  const getScoreColor = (value, thresholds) => {
    if (!value) return 'bg-slate-500/20 text-slate-400';
    if (value <= thresholds.good) return 'bg-green-500/20 text-green-400';
    if (value <= thresholds.needs_improvement) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  const vitalsConfig = [
    { 
      key: 'lcp', 
      label: 'LCP', 
      icon: Clock,
      description: 'Largest Contentful Paint',
      thresholds: { good: 2500, needs_improvement: 4000 },
      format: (v) => `${(v / 1000).toFixed(2)}s`
    },
    { 
      key: 'fid', 
      label: 'FID', 
      icon: Zap,
      description: 'First Input Delay',
      thresholds: { good: 100, needs_improvement: 300 },
      format: (v) => `${v.toFixed(0)}ms`
    },
    { 
      key: 'cls', 
      label: 'CLS', 
      icon: Activity,
      description: 'Cumulative Layout Shift',
      thresholds: { good: 0.1, needs_improvement: 0.25 },
      format: (v) => v.toFixed(3)
    },
    { 
      key: 'ttfb', 
      label: 'TTFB', 
      icon: TrendingUp,
      description: 'Time to First Byte',
      thresholds: { good: 800, needs_improvement: 1800 },
      format: (v) => `${v.toFixed(0)}ms`
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-slate-900/95 border-white/10 backdrop-blur-xl w-64">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {vitalsConfig.map((vital) => {
            const Icon = vital.icon;
            const value = metrics[vital.key];
            return (
              <div key={vital.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{vital.label}</span>
                </div>
                <Badge className={getScoreColor(value, vital.thresholds)}>
                  {value ? vital.format(value) : '...'}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}