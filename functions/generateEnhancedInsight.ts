import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, includeFinancialData = false } = await req.json();

    if (!symbol) {
      return Response.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // Base insight usando apenas dados públicos
    const publicInsightPrompt = `Analise a empresa ${symbol} usando apenas informação pública disponível. 
    Forneça uma análise estratégica básica cobrindo:
    - Posicionamento de mercado
    - Principais produtos/serviços
    - Tendências da indústria
    - Riscos visíveis
    
    Seja objetivo e estruturado.`;

    const publicInsight = await base44.integrations.Core.InvokeLLM({
      prompt: publicInsightPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          market_position: { type: "string" },
          key_products: { type: "array", items: { type: "string" } },
          industry_trends: { type: "array", items: { type: "string" } },
          visible_risks: { type: "array", items: { type: "string" } },
          confidence_score: { type: "number" }
        }
      }
    });

    let enhancedInsight = null;

    // Enhanced insight com dados financeiros premium
    if (includeFinancialData) {
      // Buscar dados financeiros premium
      const financialResponse = await base44.functions.invoke('fetchPremiumFinancialData', {
        symbol: symbol,
        dataType: 'overview'
      });

      const financialData = financialResponse.data?.data;

      if (financialData && !financialData.error) {
        const enhancedPrompt = `Analise a empresa ${symbol} combinando dados financeiros premium com contexto de mercado.
        
        Dados Financeiros Premium:
        - Market Cap: ${financialData.MarketCapitalization}
        - P/E Ratio: ${financialData.PERatio}
        - EPS: ${financialData.EPS}
        - Dividend Yield: ${financialData.DividendYield}
        - 52 Week High: ${financialData['52WeekHigh']}
        - 52 Week Low: ${financialData['52WeekLow']}
        - Profit Margin: ${financialData.ProfitMargin}
        - Return on Equity: ${financialData.ReturnOnEquityTTM}
        - Revenue Per Share: ${financialData.RevenuePerShareTTM}
        - Beta: ${financialData.Beta}
        
        Com estes dados premium, forneça:
        - Análise de valuação (se está sobrevalorizada/subvalorizada)
        - Saúde financeira detalhada
        - Comparação com benchmarks da indústria
        - Riscos financeiros específicos identificados
        - Oportunidades de investimento
        - Recomendação estratégica (Buy/Hold/Sell com justificativa)
        
        Seja profundo e quantitativo.`;

        enhancedInsight = await base44.integrations.Core.InvokeLLM({
          prompt: enhancedPrompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              valuation_analysis: { type: "string" },
              financial_health: { type: "string" },
              industry_benchmarks: { type: "string" },
              financial_risks: { type: "array", items: { type: "string" } },
              investment_opportunities: { type: "array", items: { type: "string" } },
              strategic_recommendation: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  rationale: { type: "string" },
                  confidence: { type: "number" }
                }
              },
              premium_insights_used: { type: "array", items: { type: "string" } },
              confidence_score: { type: "number" }
            }
          }
        });
      }
    }

    return Response.json({
      symbol: symbol,
      public_insight: publicInsight,
      enhanced_insight: enhancedInsight,
      comparison: {
        public_data_only: {
          depth: "basic",
          confidence: publicInsight.confidence_score || 60,
          sources: "internet search + general knowledge"
        },
        with_premium_data: enhancedInsight ? {
          depth: "advanced",
          confidence: enhancedInsight.confidence_score || 90,
          sources: "financial APIs + market data + internet context",
          premium_features: [
            "Real-time financial metrics",
            "Valuation analysis",
            "Industry benchmarks",
            "Quantitative risk assessment",
            "Investment recommendations"
          ]
        } : null
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});