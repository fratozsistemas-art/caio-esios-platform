import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Fetch News & Sentiment Analysis
 * Sources: NewsAPI, Finnhub news sentiment
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            query, 
            symbol, // For company-specific news
            category, // business, technology, finance
            language = 'en',
            from_date,
            to_date,
            sentiment_analysis = true,
            max_results = 20
        } = await req.json();

        const newsApiKey = Deno.env.get("NEWS_API_KEY");
        const finnhubKey = Deno.env.get("FINNHUB_API_KEY");

        let articles = [];
        let sentiment = null;

        // Fetch news from NewsAPI
        if (newsApiKey && (query || category)) {
            const params = new URLSearchParams({
                apiKey: newsApiKey,
                language,
                pageSize: max_results.toString(),
                sortBy: 'publishedAt'
            });

            if (query) params.append('q', query);
            if (category) params.append('category', category);
            if (from_date) params.append('from', from_date);
            if (to_date) params.append('to', to_date);

            const endpoint = query ? 'everything' : 'top-headlines';
            const response = await fetch(
                `https://newsapi.org/v2/${endpoint}?${params.toString()}`
            );
            const data = await response.json();

            if (data.articles) {
                articles = data.articles.map(article => ({
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    source: article.source.name,
                    author: article.author,
                    published_at: article.publishedAt,
                    image_url: article.urlToImage,
                    content: article.content
                }));
            }
        }

        // Fetch company-specific news and sentiment from Finnhub
        if (finnhubKey && symbol) {
            const today = new Date().toISOString().split('T')[0];
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const [companyNews, sentimentData] = await Promise.all([
                fetch(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from_date || weekAgo}&to=${to_date || today}&token=${finnhubKey}`).then(r => r.json()),
                fetch(`https://finnhub.io/api/v1/news-sentiment?symbol=${symbol}&token=${finnhubKey}`).then(r => r.json())
            ]);

            // Add company news
            const companyArticles = companyNews.slice(0, max_results).map(article => ({
                title: article.headline,
                description: article.summary,
                url: article.url,
                source: article.source,
                published_at: new Date(article.datetime * 1000).toISOString(),
                image_url: article.image,
                category: article.category,
                sentiment_score: article.sentiment // Finnhub provides sentiment
            }));

            articles.push(...companyArticles);

            // Set sentiment data
            if (sentimentData && sentimentData.sentiment) {
                sentiment = {
                    symbol,
                    buzz: sentimentData.buzz,
                    company_news_score: sentimentData.companyNewsScore,
                    sector_average_bullish: sentimentData.sectorAverageBullishPercent,
                    sector_average_news_score: sentimentData.sectorAverageNewsScore,
                    sentiment: sentimentData.sentiment,
                    source: 'Finnhub'
                };
            }
        }

        // AI-powered sentiment analysis using LLM
        if (sentiment_analysis && articles.length > 0 && !sentiment) {
            const articlesText = articles.slice(0, 10).map((a, i) => 
                `${i + 1}. ${a.title}\n${a.description || ''}`
            ).join('\n\n');

            const sentimentPrompt = `Analyze the sentiment of these news articles${symbol ? ` about ${symbol}` : ''}:

${articlesText}

Return sentiment analysis as JSON:
{
  "overall_sentiment": "bullish" | "bearish" | "neutral",
  "sentiment_score": -100 to 100,
  "confidence": 0-100,
  "key_themes": ["theme1", "theme2"],
  "positive_signals": ["signal1"],
  "negative_signals": ["signal1"],
  "market_implications": "brief analysis"
}`;

            const sentimentResult = await base44.integrations.Core.InvokeLLM({
                prompt: sentimentPrompt,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_sentiment: { type: "string" },
                        sentiment_score: { type: "number" },
                        confidence: { type: "number" },
                        key_themes: { type: "array", items: { type: "string" } },
                        positive_signals: { type: "array", items: { type: "string" } },
                        negative_signals: { type: "array", items: { type: "string" } },
                        market_implications: { type: "string" }
                    }
                }
            });

            sentiment = {
                ...sentimentResult,
                analyzed_articles: articles.length,
                source: 'AI Analysis'
            };
        }

        // Remove duplicates based on URL
        const uniqueArticles = Array.from(
            new Map(articles.map(a => [a.url, a])).values()
        ).slice(0, max_results);

        return Response.json({
            success: true,
            articles: uniqueArticles,
            total_results: uniqueArticles.length,
            sentiment,
            query: query || symbol || category,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('News sentiment error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});