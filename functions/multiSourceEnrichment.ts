import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { entity_id, entity_type, entity_name, sources = ['all'] } = await req.json();

        const enrichmentResults = {
            entity_id,
            entity_name,
            sources_queried: [],
            data: {},
            timestamp: new Date().toISOString()
        };

        // Finnhub - Financial Data
        if ((sources.includes('all') || sources.includes('finnhub')) && Deno.env.get('FINNHUB_API_KEY')) {
            try {
                enrichmentResults.sources_queried.push('finnhub');
                
                // Company profile
                const profileRes = await fetch(
                    `https://finnhub.io/api/v1/stock/profile2?symbol=${entity_name}&token=${Deno.env.get('FINNHUB_API_KEY')}`
                );
                const profile = await profileRes.json();

                // Stock quote
                const quoteRes = await fetch(
                    `https://finnhub.io/api/v1/quote?symbol=${entity_name}&token=${Deno.env.get('FINNHUB_API_KEY')}`
                );
                const quote = await quoteRes.json();

                // News
                const newsRes = await fetch(
                    `https://finnhub.io/api/v1/company-news?symbol=${entity_name}&from=${new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]}&to=${new Date().toISOString().split('T')[0]}&token=${Deno.env.get('FINNHUB_API_KEY')}`
                );
                const news = await newsRes.json();

                enrichmentResults.data.finnhub = {
                    profile: profile,
                    quote: quote,
                    recent_news: news?.slice(0, 5) || []
                };
            } catch (error) {
                enrichmentResults.data.finnhub = { error: error.message };
            }
        }

        // Alpha Vantage - Market Data
        if ((sources.includes('all') || sources.includes('alpha_vantage')) && Deno.env.get('ALPHA_VANTAGE_API_KEY')) {
            try {
                enrichmentResults.sources_queried.push('alpha_vantage');

                // Company overview
                const overviewRes = await fetch(
                    `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${entity_name}&apikey=${Deno.env.get('ALPHA_VANTAGE_API_KEY')}`
                );
                const overview = await overviewRes.json();

                // Global quote
                const quoteRes = await fetch(
                    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${entity_name}&apikey=${Deno.env.get('ALPHA_VANTAGE_API_KEY')}`
                );
                const globalQuote = await quoteRes.json();

                enrichmentResults.data.alpha_vantage = {
                    overview: overview,
                    global_quote: globalQuote
                };
            } catch (error) {
                enrichmentResults.data.alpha_vantage = { error: error.message };
            }
        }

        // News API - News & Sentiment
        if ((sources.includes('all') || sources.includes('news_api')) && Deno.env.get('NEWS_API_KEY')) {
            try {
                enrichmentResults.sources_queried.push('news_api');

                const newsRes = await fetch(
                    `https://newsapi.org/v2/everything?q=${encodeURIComponent(entity_name)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${Deno.env.get('NEWS_API_KEY')}`
                );
                const newsData = await newsRes.json();

                // Analyze sentiment using LLM
                const articles = newsData.articles?.slice(0, 5) || [];
                const sentimentPrompt = `Analyze the sentiment of these news articles about ${entity_name}:

${articles.map((a, i) => `${i+1}. ${a.title}: ${a.description}`).join('\n')}

Provide a sentiment analysis with overall score (-1 to 1) and key themes.`;

                const sentiment = await base44.integrations.Core.InvokeLLM({
                    prompt: sentimentPrompt,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            overall_sentiment: { type: "number" },
                            sentiment_label: { type: "string" },
                            key_themes: { type: "array", items: { type: "string" } },
                            notable_events: { type: "array", items: { type: "string" } }
                        }
                    }
                });

                enrichmentResults.data.news_api = {
                    articles: articles,
                    sentiment_analysis: sentiment
                };
            } catch (error) {
                enrichmentResults.data.news_api = { error: error.message };
            }
        }

        // Twitter - Social Media Insights
        if ((sources.includes('all') || sources.includes('twitter')) && Deno.env.get('TWITTER_BEARER_TOKEN')) {
            try {
                enrichmentResults.sources_queried.push('twitter');

                const twitterRes = await fetch(
                    `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(entity_name)}&max_results=10&tweet.fields=created_at,public_metrics`,
                    {
                        headers: {
                            'Authorization': `Bearer ${Deno.env.get('TWITTER_BEARER_TOKEN')}`
                        }
                    }
                );
                const twitterData = await twitterRes.json();

                // Calculate engagement metrics
                const tweets = twitterData.data || [];
                const totalEngagement = tweets.reduce((sum, t) => 
                    sum + (t.public_metrics?.like_count || 0) + 
                    (t.public_metrics?.retweet_count || 0) + 
                    (t.public_metrics?.reply_count || 0), 0
                );

                enrichmentResults.data.twitter = {
                    tweet_count: tweets.length,
                    total_engagement: totalEngagement,
                    avg_engagement: tweets.length > 0 ? totalEngagement / tweets.length : 0,
                    recent_tweets: tweets.slice(0, 5)
                };
            } catch (error) {
                enrichmentResults.data.twitter = { error: error.message };
            }
        }

        // Crunchbase-style web scraping via LLM with internet context
        if (sources.includes('all') || sources.includes('web_intelligence')) {
            try {
                enrichmentResults.sources_queried.push('web_intelligence');

                const webIntelPrompt = `Research ${entity_name} and provide comprehensive intelligence:

1. Company/Entity overview
2. Recent funding rounds or financial news
3. Key partnerships and strategic moves
4. Technology stack and innovations
5. Market position and competitors
6. Leadership team changes

Provide structured, verified information.`;

                const webIntel = await base44.integrations.Core.InvokeLLM({
                    prompt: webIntelPrompt,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            overview: { type: "string" },
                            funding: { type: "array", items: { type: "string" } },
                            partnerships: { type: "array", items: { type: "string" } },
                            technology: { type: "array", items: { type: "string" } },
                            market_position: { type: "string" },
                            competitors: { type: "array", items: { type: "string" } },
                            leadership: { type: "array", items: { type: "string" } },
                            sources: { type: "array", items: { type: "string" } }
                        }
                    }
                });

                enrichmentResults.data.web_intelligence = webIntel;
            } catch (error) {
                enrichmentResults.data.web_intelligence = { error: error.message };
            }
        }

        // Store enrichment in knowledge graph
        if (entity_id) {
            await base44.asServiceRole.entities.KnowledgeGraphNode.update(entity_id, {
                properties: {
                    last_enriched: new Date().toISOString(),
                    enrichment_sources: enrichmentResults.sources_queried,
                    market_data: enrichmentResults.data.finnhub || enrichmentResults.data.alpha_vantage,
                    sentiment: enrichmentResults.data.news_api?.sentiment_analysis,
                    social_metrics: enrichmentResults.data.twitter
                }
            });
        }

        return Response.json({
            success: true,
            enrichment: enrichmentResults,
            sources_available: enrichmentResults.sources_queried.length,
            data_points: Object.keys(enrichmentResults.data).length
        });

    } catch (error) {
        console.error('Multi-source enrichment error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});