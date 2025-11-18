import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticker, data_type = 'quote', period = '1mo', interval = '1d' } = await req.json();

    if (!ticker) {
      return Response.json({ error: 'Ticker is required' }, { status: 400 });
    }

    // Normalizar ticker brasileiro (adicionar .SA se necessário)
    const normalizedTicker = ticker.includes('.SA') ? ticker : `${ticker}.SA`;

    let data;

    if (data_type === 'quote') {
      // Dados em tempo real da ação
      const quoteResponse = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${normalizedTicker}?interval=1d&range=1d`
      );
      const quoteData = await quoteResponse.json();
      
      if (quoteData.chart.error) {
        throw new Error(quoteData.chart.error.description);
      }

      const result = quoteData.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];

      data = {
        ticker: normalizedTicker,
        price: meta.regularMarketPrice,
        currency: meta.currency,
        exchange: meta.exchangeName,
        marketState: meta.marketState,
        previousClose: meta.previousClose,
        change: meta.regularMarketPrice - meta.previousClose,
        changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
        volume: quote.volume[quote.volume.length - 1],
        marketCap: meta.marketCap || null,
        timestamp: new Date(meta.regularMarketTime * 1000).toISOString()
      };
    } else if (data_type === 'historical') {
      // Dados históricos
      const histResponse = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${normalizedTicker}?interval=${interval}&range=${period}`
      );
      const histData = await histResponse.json();
      
      if (histData.chart.error) {
        throw new Error(histData.chart.error.description);
      }

      const result = histData.chart.result[0];
      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];

      data = {
        ticker: normalizedTicker,
        period,
        interval,
        data: timestamps.map((ts, i) => ({
          date: new Date(ts * 1000).toISOString(),
          open: quote.open[i],
          high: quote.high[i],
          low: quote.low[i],
          close: quote.close[i],
          volume: quote.volume[i]
        })).filter(d => d.close !== null)
      };
    } else if (data_type === 'profile') {
      // Perfil da empresa
      const profileResponse = await fetch(
        `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${normalizedTicker}?modules=assetProfile,summaryProfile,financialData,defaultKeyStatistics`
      );
      const profileData = await profileResponse.json();
      
      if (profileData.quoteSummary.error) {
        throw new Error(profileData.quoteSummary.error.description);
      }

      const result = profileData.quoteSummary.result[0];
      const profile = result.assetProfile || {};
      const financials = result.financialData || {};
      const stats = result.defaultKeyStatistics || {};

      data = {
        ticker: normalizedTicker,
        companyName: profile.longBusinessSummary ? profile.companyOfficers?.[0]?.name : null,
        sector: profile.sector,
        industry: profile.industry,
        description: profile.longBusinessSummary,
        website: profile.website,
        employees: profile.fullTimeEmployees,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        financials: {
          revenueGrowth: financials.revenueGrowth?.raw,
          profitMargins: financials.profitMargins?.raw,
          operatingMargins: financials.operatingMargins?.raw,
          ebitda: financials.ebitda?.raw,
          debtToEquity: financials.debtToEquity?.raw,
          currentRatio: financials.currentRatio?.raw,
          returnOnEquity: financials.returnOnEquity?.raw
        },
        keyStats: {
          marketCap: stats.marketCap?.raw,
          enterpriseValue: stats.enterpriseValue?.raw,
          trailingPE: stats.trailingPE?.raw,
          forwardPE: stats.forwardPE?.raw,
          priceToBook: stats.priceToBook?.raw,
          dividendYield: stats.dividendYield?.raw,
          beta: stats.beta?.raw,
          fiftyTwoWeekHigh: stats.fiftyTwoWeekHigh?.raw,
          fiftyTwoWeekLow: stats.fiftyTwoWeekLow?.raw
        }
      };
    } else if (data_type === 'comparison') {
      // Comparação múltiplos tickers
      const tickers = ticker.split(',').map(t => 
        t.trim().includes('.SA') ? t.trim() : `${t.trim()}.SA`
      );

      const promises = tickers.map(async (t) => {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${t}?interval=1d&range=1d`
        );
        const data = await response.json();
        
        if (data.chart.error) return null;

        const result = data.chart.result[0];
        const meta = result.meta;
        
        return {
          ticker: t,
          price: meta.regularMarketPrice,
          change: meta.regularMarketPrice - meta.previousClose,
          changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
          volume: result.indicators.quote[0].volume.slice(-1)[0],
          marketCap: meta.marketCap
        };
      });

      const results = await Promise.all(promises);
      data = {
        tickers,
        comparison: results.filter(r => r !== null),
        timestamp: new Date().toISOString()
      };
    }

    return Response.json({
      success: true,
      data,
      source: 'Yahoo Finance',
      data_type
    });

  } catch (error) {
    console.error('Yahoo Finance Error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});