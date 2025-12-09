import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RealTimeRiskAnalysis({ level }) {
  const [riskData, setRiskData] = useState({
    score: 0,
    trend: 'stable',
    factors: [],
    lastUpdate: null,
    loading: true
  });

  useEffect(() => {
    fetchRiskData();
    const interval = setInterval(fetchRiskData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [level]);

  const fetchRiskData = async () => {
    try {
      // Simulate real-time risk calculation
      const marketVolatility = Math.random() * 40 + 10; // 10-50
      const newsImpact = Math.random() * 30 + 5; // 5-35
      const internalMetrics = Math.random() * 20 + 10; // 10-30
      
      const baseScore = level === "Institutional Brain" ? 15 : 8;
      const rawScore = baseScore + (marketVolatility * 0.4) + (newsImpact * 0.3) + (internalMetrics * 0.3);
      const score = Math.min(Math.max(rawScore, 0), 100);
      
      const trend = score > 50 ? 'increasing' : score < 30 ? 'decreasing' : 'stable';
      
      const factors = [
        { name: 'Market Volatility', impact: marketVolatility.toFixed(1), type: marketVolatility > 30 ? 'warning' : 'success' },
        { name: 'News Sentiment', impact: newsImpact.toFixed(1), type: newsImpact > 20 ? 'warning' : 'success' },
        { name: 'Internal Metrics', impact: internalMetrics.toFixed(1), type: internalMetrics > 15 ? 'warning' : 'success' }
      ];
      
      setRiskData({
        score: score.toFixed(1),
        trend,
        factors,
        lastUpdate: new Date(),
        loading: false
      });
    } catch (error) {
      console.error('Risk analysis error:', error);
      setRiskData(prev => ({ ...prev, loading: false }));
    }
  };

  const getRiskColor = (score) => {
    if (score < 30) return '#10B981'; // Success Green
    if (score < 60) return '#F59E0B'; // Warning Amber
    return '#EF4444'; // Error Red
  };

  const getRiskLabel = (score) => {
    if (score < 30) return 'Low Risk';
    if (score < 60) return 'Moderate Risk';
    return 'High Risk';
  };

  const TrendIcon = riskData.trend === 'increasing' ? TrendingUp : 
                    riskData.trend === 'decreasing' ? TrendingDown : Activity;

  if (riskData.loading) {
    return (
      <div className="mt-4 p-3 rounded-lg bg-[#0A2540]/30 backdrop-blur-sm border border-[#00D4FF]/20">
        <div className="flex items-center justify-center gap-2 text-sm text-[#94A3B8]">
          <Activity className="w-4 h-4 animate-spin" />
          <span>Analyzing risk...</span>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 space-y-3"
      >
        {/* Risk Score Display */}
        <div 
          className="p-4 rounded-lg backdrop-blur-sm border transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, rgba(10, 37, 64, 0.6) 0%, rgba(10, 37, 64, 0.3) 100%)`,
            borderColor: getRiskColor(riskData.score),
            boxShadow: `0 0 20px ${getRiskColor(riskData.score)}40`
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: getRiskColor(riskData.score) }} />
              <span className="text-sm font-semibold text-[#F1F5F9]">Risk Analysis</span>
            </div>
            <TrendIcon 
              className="w-4 h-4" 
              style={{ color: getRiskColor(riskData.score) }}
            />
          </div>

          {/* Score Visualization */}
          <div className="flex items-end gap-3 mb-3">
            <div 
              className="text-4xl font-bold"
              style={{ color: getRiskColor(riskData.score) }}
            >
              {riskData.score}
            </div>
            <div className="pb-1">
              <div className="text-xs text-[#94A3B8]">Risk Score</div>
              <div 
                className="text-sm font-semibold"
                style={{ color: getRiskColor(riskData.score) }}
              >
                {getRiskLabel(riskData.score)}
              </div>
            </div>
          </div>

          {/* Risk Bar */}
          <div className="relative h-2 bg-[#1A1D29] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${riskData.score}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${getRiskColor(riskData.score)}80, ${getRiskColor(riskData.score)})`,
                boxShadow: `0 0 10px ${getRiskColor(riskData.score)}60`
              }}
            />
          </div>
        </div>

        {/* Risk Factors */}
        <div className="space-y-2">
          {riskData.factors.map((factor, index) => (
            <motion.div
              key={factor.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-2 rounded-md bg-[#1A1D29]/40 border border-[#00D4FF]/10"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: factor.type === 'warning' ? '#F59E0B' : '#10B981' }}
                />
                <span className="text-xs text-[#94A3B8]">{factor.name}</span>
              </div>
              <span className="text-xs font-semibold text-[#00D4FF]">{factor.impact}%</span>
            </motion.div>
          ))}
        </div>

        {/* Last Update */}
        {riskData.lastUpdate && (
          <div className="text-[10px] text-[#475569] text-center">
            Last updated: {riskData.lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}