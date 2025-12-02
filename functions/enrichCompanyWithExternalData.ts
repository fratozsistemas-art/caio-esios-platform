import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const NEWS_API_KEY = Deno.env.get("NEWS_API_KEY");
const ALPHA_VANTAGE_KEY = Deno.env.get("ALPHA_VANTAGE_API_KEY");
const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { company_data } = await req.json();

        if (!company_data) {
            return Response.json({ error: 'company_data is required' }, { status: 400 });
        }

        const companyName = company_data.company_name || company_data.legal_name || company_data.razao_social || company_data.nome_fantasia;
        const ticker = company_data.ticker;

        const enrichmentResults = {
            news: [],
            financial_data: null,
            market_trends: [],
            regulatory_filings: [],
            sentiment_analysis: null,
            competitors_mentioned: [],
            errors: []
        };

        // 1. Fetch News from multiple sources
        if (NEWS_API_KEY && companyName) {
            try {
                const newsResponse = await fetch(
                    `https://newsapi.org/v2/everything?q=${encodeURIComponent(companyName)}&language=pt&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`
                );
                
                if (newsResponse.ok) {
                    const newsData = await newsResponse.json();
                    enrichmentResults.news = (newsData.articles || []).map(article => ({
                        title: article.title,
                        description: article.description,
                        source: article.source?.name,
                        url: article.url,
                        published_at: article.publishedAt,
                        sentiment: null // Will be analyzed below
                    }));
                }
            } catch (error) {
                enrichmentResults.errors.push(`News API error: ${error.message}`);
            }
        }

        // 2. Fetch Financial Data if ticker is available
        if (ALPHA_VANTAGE_KEY && ticker) {
            try {
                // Company Overview
                const overviewResponse = await fetch(
                    `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`
                );
                
                if (overviewResponse.ok) {
                    const overview = await overviewResponse.json();
                    if (!overview.Note) { // Note means API limit reached
                        enrichmentResults.financial_data = {
                            market_cap: overview.MarketCapitalization,
                            pe_ratio: overview.PERatio,
                            eps: overview.EPS,
                            dividend_yield: overview.DividendYield,
                            revenue_ttm: overview.RevenueTTM,
                            profit_margin: overview.ProfitMargin,
                            operating_margin: overview.OperatingMarginTTM,
                            beta: overview.Beta,
                            sector: overview.Sector,
                            industry: overview.Industry,
                            description: overview.Description
                        };
                    }
                }
            } catch (error) {
                enrichmentResults.errors.push(`Alpha Vantage error: ${error.message}`);
            }
        }

        // 3. Fetch Market News and Sentiment from Finnhub
        if (FINNHUB_API_KEY && (ticker || companyName)) {
            try {
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                const fromDate = weekAgo.toISOString().split('T')[0];
                const toDate = today.toISOString().split('T')[0];

                if (ticker) {
                    // Company News
                    const finnhubNews = await fetch(
                        `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${fromDate}&to=${toDate}&token=${FINNHUB_API_KEY}`
                    );
                    
                    if (finnhubNews.ok) {
                        const newsData = await finnhubNews.json();
                        enrichmentResults.market_trends = (newsData || []).slice(0, 5).map(item => ({
                            headline: item.headline,
                            summary: item.summary,
                            source: item.source,
                            url: item.url,
                            datetime: new Date(item.datetime * 1000).toISOString(),
                            category: item.category
                        }));
                    }

                    // Sentiment
                    const sentimentResponse = await fetch(
                        `https://finnhub.io/api/v1/news-sentiment?symbol=${ticker}&token=${FINNHUB_API_KEY}`
                    );
                    
                    if (sentimentResponse.ok) {
                        const sentimentData = await sentimentResponse.json();
                        enrichmentResults.sentiment_analysis = {
                            company_news_score: sentimentData.companyNewsScore,
                            sector_average_bullish: sentimentData.sectorAverageBullishPercent,
                            sector_average_news_score: sentimentData.sectorAverageNewsScore,
                            buzz: sentimentData.buzz,
                            sentiment: sentimentData.sentiment
                        };
                    }
                }
            } catch (error) {
                enrichmentResults.errors.push(`Finnhub error: ${error.message}`);
            }
        }

        // 4. Use LLM to analyze and extract insights
        try {
            const analysisResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `Analise os seguintes dados de empresa e extraia insights estratégicos:

EMPRESA: ${companyName}
TICKER: ${ticker || 'N/A'}

DADOS ORIGINAIS:
${JSON.stringify(company_data, null, 2)}

NOTÍCIAS RECENTES (${enrichmentResults.news.length}):
${enrichmentResults.news.slice(0, 5).map(n => `- ${n.title}`).join('\n')}

DADOS FINANCEIROS:
${enrichmentResults.financial_data ? JSON.stringify(enrichmentResults.financial_data) : 'N/A'}

TENDÊNCIAS DE MERCADO:
${enrichmentResults.market_trends.map(t => `- ${t.headline}`).join('\n')}

Forneça uma análise estruturada incluindo:
1. Resumo executivo da empresa
2. Principais insights das notícias
3. Posicionamento competitivo
4. Riscos identificados
5. Oportunidades potenciais
6. Competidores mencionados nas notícias`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        summary: { type: "string", description: "Resumo executivo em 2-3 frases" },
                        key_insights: { 
                            type: "array", 
                            items: { 
                                type: "object",
                                properties: {
                                    text: { type: "string" },
                                    category: { type: "string", enum: ["financial", "market", "operational", "strategic"] },
                                    importance: { type: "string", enum: ["high", "medium", "low"] }
                                }
                            }
                        },
                        competitive_position: { type: "string" },
                        risks: { type: "array", items: { type: "string" } },
                        opportunities: { type: "array", items: { type: "string" } },
                        competitors: { type: "array", items: { type: "string" } },
                        sentiment_summary: { type: "string" },
                        recommendation: { type: "string" }
                    }
                }
            });

            enrichmentResults.ai_analysis = analysisResponse;
            enrichmentResults.competitors_mentioned = analysisResponse.competitors || [];
        } catch (error) {
            enrichmentResults.errors.push(`LLM analysis error: ${error.message}`);
        }

        // 5. Analyze news sentiment if we have news
        if (enrichmentResults.news.length > 0 && !enrichmentResults.sentiment_analysis) {
            try {
                const sentimentResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: `Analise o sentimento das seguintes manchetes sobre a empresa ${companyName}:

${enrichmentResults.news.map(n => n.title).join('\n')}

Classifique o sentimento geral e de cada notícia.`,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            overall_sentiment: { type: "string", enum: ["very_positive", "positive", "neutral", "negative", "very_negative"] },
                            overall_score: { type: "number", description: "-1 to 1" },
                            news_sentiments: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        headline: { type: "string" },
                                        sentiment: { type: "string" },
                                        score: { type: "number" }
                                    }
                                }
                            }
                        }
                    }
                });

                enrichmentResults.sentiment_analysis = sentimentResponse;
            } catch (error) {
                enrichmentResults.errors.push(`Sentiment analysis error: ${error.message}`);
            }
        }

        return Response.json({
            success: true,
            company_name: companyName,
            enrichment: enrichmentResults,
            sources_used: {
                news_api: NEWS_API_KEY ? true : false,
                alpha_vantage: ALPHA_VANTAGE_KEY && ticker ? true : false,
                finnhub: FINNHUB_API_KEY && ticker ? true : false,
                llm_analysis: true
            }
        });

    } catch (error) {
        console.error('Enrichment error:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});