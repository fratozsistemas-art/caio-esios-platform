import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { industry, symbols, keywords, depth = 'strategic' } = await req.json();

    // Step 1: Fetch real-time market data
    const stockPromises = symbols?.map(symbol => 
      base44.functions.invoke('fetchStockData', { symbol, metric: 'quote' })
    ) || [];

    const newsPromises = keywords?.map(keyword =>
      base44.functions.invoke('fetchMarketNews', { query: keyword, pageSize: 10 })
    ) || [];

    const economicPromises = [
      base44.functions.invoke('fetchBCBData', { seriesCode: '433' }), // IPCA
      base44.functions.invoke('fetchBCBData', { seriesCode: '4390' }), // CDI
      base44.functions.invoke('fetchBCBData', { seriesCode: '1' }) // USD/BRL
    ];

    const [stockResults, newsResults, economicResults] = await Promise.all([
      Promise.allSettled(stockPromises),
      Promise.allSettled(newsPromises),
      Promise.allSettled(economicPromises)
    ]);

    // Process results
    const stockData = stockResults
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    const newsData = newsResults
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value.articles);

    const economicData = economicResults
      .filter(r => r.status === 'fulfilled')
      .map(r => {
        const data = r.value.data;
        const latest = data[data.length - 1];
        return {
          code: r.value.seriesCode,
          value: parseFloat(latest.valor),
          date: latest.data
        };
      });

    // Step 2: Prepare context for AI analysis
    const marketContext = {
      stocks: stockData.map(s => {
        const quote = s.data['Global Quote'];
        return {
          symbol: s.symbol,
          price: quote['05. price'],
          change: quote['09. change'],
          changePercent: quote['10. change percent']
        };
      }),
      news: newsData.map(n => ({
        title: n.title,
        description: n.description,
        source: n.source,
        publishedAt: n.publishedAt
      })),
      economic: economicData,
      industry,
      analysisDate: new Date().toISOString()
    };

    // Step 3: Use AI to analyze trends and identify opportunities
    const prompt = `You are the M1 (Market Intelligence) module of CAIO·AI's TSI v9.3 methodology. 

Analyze the following real-time market data and provide strategic insights:

MARKET DATA:
${JSON.stringify(marketContext, null, 2)}

ANALYSIS DEPTH: ${depth}

Provide a comprehensive M1 analysis including:
1. Market Trend Analysis - Identify emerging trends from stock movements and news
2. Opportunity Identification - Specific opportunities based on market signals
3. Risk Assessment - Potential risks and market volatility indicators
4. Strategic Recommendations - Actionable insights for ${industry || 'the target industry'}
5. Key Metrics - Important KPIs to monitor
6. Competitive Dynamics - Market forces and competitive landscape insights

Focus on actionable, data-driven insights that executives can use for decision-making.`;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          trend_analysis: {
            type: 'object',
            properties: {
              overall_sentiment: { type: 'string' },
              key_trends: { type: 'array', items: { type: 'string' } },
              market_momentum: { type: 'string' }
            }
          },
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                potential_roi: { type: 'string' },
                timeframe: { type: 'string' },
                confidence: { type: 'number' }
              }
            }
          },
          risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                severity: { type: 'string' },
                mitigation: { type: 'string' }
              }
            }
          },
          strategic_recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action: { type: 'string' },
                rationale: { type: 'string' },
                priority: { type: 'string' }
              }
            }
          },
          key_metrics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                metric: { type: 'string' },
                current_value: { type: 'string' },
                trend: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Step 4: Save analysis as StrategicFacts
    const facts = [];
    
    // Save opportunities as facts
    for (const opp of aiAnalysis.opportunities || []) {
      facts.push({
        topic_id: `m1_opportunity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        topic_label: opp.title,
        dimension: 'opportunity',
        fact_type: 'interpretation',
        summary: opp.title,
        detail: opp.description,
        status: 'confirmed_internal',
        confidence: opp.confidence || 0.7,
        source_type: 'model_inference',
        source_ref: 'M1 Enhanced Analysis',
        tags: ['m1', 'opportunity', industry].filter(Boolean)
      });
    }

    // Save risks as facts
    for (const risk of aiAnalysis.risks || []) {
      facts.push({
        topic_id: `m1_risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        topic_label: risk.title,
        dimension: 'risk',
        fact_type: 'interpretation',
        summary: risk.title,
        detail: risk.description,
        status: 'confirmed_internal',
        confidence: 0.8,
        source_type: 'model_inference',
        source_ref: 'M1 Enhanced Analysis',
        tags: ['m1', 'risk', industry].filter(Boolean)
      });
    }

    // Bulk create facts
    if (facts.length > 0) {
      await base44.asServiceRole.entities.StrategicFact.bulkCreate(facts);
    }

    // Step 5: Create Analysis record
    const analysisRecord = await base44.entities.Analysis.create({
      title: `M1 Market Intelligence Analysis - ${new Date().toLocaleDateString()}`,
      type: 'market',
      status: 'completed',
      framework_used: 'M1 - Market Intelligence',
      results: {
        ...aiAnalysis,
        market_context: marketContext
      },
      confidence_score: 85,
      completed_at: new Date().toISOString(),
      tags: ['m1', 'real-time', industry].filter(Boolean)
    });

    return Response.json({
      success: true,
      analysis: aiAnalysis,
      analysisId: analysisRecord.id,
      factsCreated: facts.length,
      marketData: {
        stocks: stockData.length,
        news: newsData.length,
        economic: economicData.length
      }
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});