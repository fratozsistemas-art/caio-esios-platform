import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { level } = await req.json();

    // Simulate aggregating data from multiple sources
    const marketData = await fetchMarketMetrics();
    const newsData = await fetchNewsSentiment();
    const internalData = await fetchInternalMetrics();

    // Calculate risk score based on level
    const baseRisk = level === "Institutional Brain" ? 15 : 8;
    
    const marketImpact = marketData.volatility * 0.4;
    const newsImpact = newsData.negativeScore * 0.3;
    const internalImpact = internalData.systemLoad * 0.3;

    const totalRiskScore = Math.min(
      Math.max(baseRisk + marketImpact + newsImpact + internalImpact, 0),
      100
    );

    const riskFactors = [
      {
        name: 'Market Volatility',
        impact: marketData.volatility.toFixed(1),
        type: marketData.volatility > 30 ? 'warning' : 'success',
        details: marketData.details
      },
      {
        name: 'News Sentiment',
        impact: newsData.negativeScore.toFixed(1),
        type: newsData.negativeScore > 20 ? 'warning' : 'success',
        details: newsData.headlines
      },
      {
        name: 'Internal Metrics',
        impact: internalData.systemLoad.toFixed(1),
        type: internalData.systemLoad > 15 ? 'warning' : 'success',
        details: internalData.metrics
      }
    ];

    const trend = totalRiskScore > 50 ? 'increasing' : 
                  totalRiskScore < 30 ? 'decreasing' : 'stable';

    return Response.json({
      score: totalRiskScore.toFixed(1),
      trend,
      factors: riskFactors,
      recommendations: generateRecommendations(totalRiskScore, riskFactors),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function fetchMarketMetrics() {
  // Simulate fetching real market data
  // In production: integrate with Yahoo Finance, Alpha Vantage, etc.
  return {
    volatility: Math.random() * 40 + 10, // 10-50
    details: {
      sp500: Math.random() * 5 - 2.5,
      vix: Math.random() * 30 + 10,
      sectorPerformance: 'Mixed'
    }
  };
}

async function fetchNewsSentiment() {
  // Simulate news sentiment analysis
  // In production: integrate with News API, analyze with LLM
  return {
    negativeScore: Math.random() * 30 + 5, // 5-35
    headlines: [
      'Market uncertainty increases',
      'Tech sector shows resilience',
      'Economic indicators mixed'
    ]
  };
}

async function fetchInternalMetrics() {
  // Simulate internal system metrics
  return {
    systemLoad: Math.random() * 20 + 10, // 10-30
    metrics: {
      apiLatency: Math.random() * 200 + 50,
      errorRate: Math.random() * 2,
      activeUsers: Math.floor(Math.random() * 1000) + 500
    }
  };
}

function generateRecommendations(score, factors) {
  const recommendations = [];
  
  if (score > 60) {
    recommendations.push('Consider defensive positioning');
    recommendations.push('Review portfolio diversification');
  } else if (score < 30) {
    recommendations.push('Favorable conditions for strategic moves');
    recommendations.push('Monitor for emerging opportunities');
  }

  factors.forEach(factor => {
    if (factor.type === 'warning') {
      recommendations.push(`Monitor ${factor.name} closely`);
    }
  });

  return recommendations;
}