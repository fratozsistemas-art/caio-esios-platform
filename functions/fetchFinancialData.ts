import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Fetch Financial Market Data
 * Sources: Alpha Vantage (stocks, forex, crypto), Finnhub (real-time data)
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            data_type, // 'stock_quote' | 'stock_fundamentals' | 'economic_indicators' | 'forex' | 'crypto'
            symbol, 
            market = 'US',
            interval = 'daily',
            indicators = []
        } = await req.json();

        if (!data_type) {
            return Response.json({ error: 'data_type is required' }, { status: 400 });
        }

        const alphaVantageKey = Deno.env.get("ALPHA_VANTAGE_API_KEY");
        const finnhubKey = Deno.env.get("FINNHUB_API_KEY");

        let result = {};

        // Stock Quote (Real-time)
        if (data_type === 'stock_quote' && symbol) {
            if (finnhubKey) {
                const response = await fetch(
                    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubKey}`
                );
                const data = await response.json();
                
                result = {
                    symbol,
                    price: data.c,
                    change: data.d,
                    percent_change: data.dp,
                    high: data.h,
                    low: data.l,
                    open: data.o,
                    previous_close: data.pc,
                    timestamp: new Date(data.t * 1000).toISOString(),
                    source: 'Finnhub'
                };
            } else if (alphaVantageKey) {
                const response = await fetch(
                    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaVantageKey}`
                );
                const data = await response.json();
                const quote = data['Global Quote'];
                
                result = {
                    symbol,
                    price: parseFloat(quote['05. price']),
                    change: parseFloat(quote['09. change']),
                    percent_change: parseFloat(quote['10. change percent']?.replace('%', '')),
                    high: parseFloat(quote['03. high']),
                    low: parseFloat(quote['04. low']),
                    open: parseFloat(quote['02. open']),
                    previous_close: parseFloat(quote['08. previous close']),
                    volume: parseInt(quote['06. volume']),
                    timestamp: quote['07. latest trading day'],
                    source: 'Alpha Vantage'
                };
            } else {
                return Response.json({ 
                    error: 'No API key configured. Please set ALPHA_VANTAGE_API_KEY or FINNHUB_API_KEY' 
                }, { status: 400 });
            }
        }

        // Stock Fundamentals
        else if (data_type === 'stock_fundamentals' && symbol && finnhubKey) {
            const [profile, metrics] = await Promise.all([
                fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${finnhubKey}`).then(r => r.json()),
                fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${finnhubKey}`).then(r => r.json())
            ]);

            result = {
                symbol,
                company: profile.name,
                industry: profile.finnhubIndustry,
                market_cap: profile.marketCapitalization,
                country: profile.country,
                currency: profile.currency,
                ipo: profile.ipo,
                metrics: {
                    pe_ratio: metrics.metric?.peBasicExclExtraTTM,
                    pb_ratio: metrics.metric?.pbQuarterly,
                    dividend_yield: metrics.metric?.dividendYieldIndicatedAnnual,
                    eps: metrics.metric?.epsBasicExclExtraItemsTTM,
                    revenue: metrics.metric?.revenuePerShareTTM,
                    profit_margin: metrics.metric?.netProfitMarginTTM,
                    roe: metrics.metric?.roeTTM,
                    roa: metrics.metric?.roaTTM,
                    beta: metrics.metric?.beta
                },
                source: 'Finnhub'
            };
        }

        // Economic Indicators
        else if (data_type === 'economic_indicators' && alphaVantageKey) {
            const indicatorMap = {
                'gdp': 'REAL_GDP',
                'inflation': 'INFLATION',
                'unemployment': 'UNEMPLOYMENT',
                'interest_rate': 'FEDERAL_FUNDS_RATE',
                'retail_sales': 'RETAIL_SALES'
            };

            const requestedIndicators = indicators.length > 0 ? indicators : ['gdp', 'inflation', 'unemployment'];
            
            const results = await Promise.all(
                requestedIndicators.map(async (indicator) => {
                    const func = indicatorMap[indicator];
                    if (!func) return null;

                    const response = await fetch(
                        `https://www.alphavantage.co/query?function=${func}&interval=annual&apikey=${alphaVantageKey}`
                    );
                    const data = await response.json();
                    return {
                        indicator,
                        data: data.data?.slice(0, 10) || [],
                        unit: data.unit,
                        source: 'Alpha Vantage'
                    };
                })
            );

            result = {
                indicators: results.filter(r => r !== null),
                market,
                source: 'Alpha Vantage'
            };
        }

        // Forex
        else if (data_type === 'forex' && symbol && alphaVantageKey) {
            const [from, to] = symbol.split('/');
            const response = await fetch(
                `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${alphaVantageKey}`
            );
            const data = await response.json();
            const rate = data['Realtime Currency Exchange Rate'];

            result = {
                from_currency: rate['1. From_Currency Code'],
                to_currency: rate['3. To_Currency Code'],
                exchange_rate: parseFloat(rate['5. Exchange Rate']),
                bid_price: parseFloat(rate['8. Bid Price']),
                ask_price: parseFloat(rate['9. Ask Price']),
                timestamp: rate['6. Last Refreshed'],
                source: 'Alpha Vantage'
            };
        }

        // Cryptocurrency
        else if (data_type === 'crypto' && symbol && alphaVantageKey) {
            const [crypto, market_currency] = symbol.split('/') || [symbol, 'USD'];
            const response = await fetch(
                `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${crypto}&to_currency=${market_currency}&apikey=${alphaVantageKey}`
            );
            const data = await response.json();
            const rate = data['Realtime Currency Exchange Rate'];

            result = {
                symbol: crypto,
                market_currency,
                price: parseFloat(rate['5. Exchange Rate']),
                bid_price: parseFloat(rate['8. Bid Price']),
                ask_price: parseFloat(rate['9. Ask Price']),
                timestamp: rate['6. Last Refreshed'],
                source: 'Alpha Vantage'
            };
        }

        else {
            return Response.json({ 
                error: `Unsupported data_type: ${data_type}. Supported: stock_quote, stock_fundamentals, economic_indicators, forex, crypto` 
            }, { status: 400 });
        }

        return Response.json({
            success: true,
            data: result,
            cached: false,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Financial data error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});