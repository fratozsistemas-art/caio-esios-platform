import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Finnhub Webhook Handler
 * Receives real-time market data updates from Finnhub
 * Authentication via X-Finnhub-Secret header
 */

Deno.serve(async (req) => {
    // Acknowledge immediately with 200 to prevent timeouts
    const acknowledgeAndProcess = async () => {
        try {
            // Validate webhook secret
            const finnhubSecret = req.headers.get('X-Finnhub-Secret');
            const expectedSecret = 'd4ckgk9r01qudf6iojj0';

            if (finnhubSecret !== expectedSecret) {
                console.error('Invalid Finnhub webhook secret');
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const body = await req.json();
            
            // Quick acknowledgment
            setTimeout(async () => {
                const base44 = createClientFromRequest(req);
                
                // Process webhook data
                const { data, event, symbol, type } = body;

                if (type === 'trade') {
                    // Real-time trade data
                    await processTradeData(data, base44);
                } else if (type === 'news') {
                    // Real-time news
                    await processNewsData(data, base44);
                } else if (type === 'quote') {
                    // Real-time quote update
                    await processQuoteData(data, base44);
                }

                console.log('Finnhub webhook processed:', { type, symbol, timestamp: new Date().toISOString() });
            }, 0);

            return Response.json({ received: true }, { status: 200 });

        } catch (error) {
            console.error('Webhook processing error:', error);
            return Response.json({ received: true }, { status: 200 }); // Still acknowledge
        }
    };

    return await acknowledgeAndProcess();
});

async function processTradeData(trades, base44) {
    // Store or update real-time trade data
    for (const trade of trades) {
        try {
            // Could store in a RealTimeMarketData entity
            await base44.asServiceRole.entities.DataSource.filter({ 
                type: 'finnhub_realtime',
                config: { symbol: trade.s }
            }).then(async sources => {
                if (sources.length > 0) {
                    const source = sources[0];
                    await base44.asServiceRole.entities.DataSource.update(source.id, {
                        sync_stats: {
                            last_price: trade.p,
                            last_volume: trade.v,
                            last_update: new Date(trade.t).toISOString()
                        },
                        last_sync_at: new Date().toISOString()
                    });
                }
            });
        } catch (error) {
            console.error('Trade data processing error:', error);
        }
    }
}

async function processNewsData(newsItems, base44) {
    // Store real-time news
    for (const news of newsItems) {
        try {
            // Could create Analysis or KnowledgeSource entries
            const existingNews = await base44.asServiceRole.entities.KnowledgeSource.filter({
                source_url: news.url
            });

            if (existingNews.length === 0) {
                await base44.asServiceRole.entities.KnowledgeSource.create({
                    title: news.headline,
                    source_type: 'news',
                    source_url: news.url,
                    content: news.summary,
                    metadata: {
                        category: news.category,
                        source: news.source,
                        sentiment: news.sentiment,
                        related_symbols: news.related || []
                    },
                    indexed: false
                });
            }
        } catch (error) {
            console.error('News data processing error:', error);
        }
    }
}

async function processQuoteData(quotes, base44) {
    // Update quote data
    for (const quote of quotes) {
        try {
            const companies = await base44.asServiceRole.entities.Company.filter({
                'metadata.ticker': quote.s
            });

            if (companies.length > 0) {
                const company = companies[0];
                const currentMetadata = company.metadata || {};
                
                await base44.asServiceRole.entities.Company.update(company.id, {
                    metadata: {
                        ...currentMetadata,
                        latest_quote: {
                            price: quote.p,
                            timestamp: new Date(quote.t).toISOString(),
                            volume: quote.v
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Quote data processing error:', error);
        }
    }
}