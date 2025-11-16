import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { industry, companies = [], competitors = [], analysis_type = 'comprehensive' } = await req.json();

        const intelligence = {
            industry,
            companies_analyzed: companies.length,
            competitors_analyzed: competitors.length,
            analysis_type,
            data: {},
            timestamp: new Date().toISOString()
        };

        // Market overview via LLM with internet context
        try {
            const marketOverviewPrompt = `Provide a comprehensive market intelligence report for the ${industry} industry:

1. Market size and growth rate
2. Key trends and drivers
3. Major players and market share
4. Regulatory environment
5. Technology disruptions
6. Investment trends
7. Future outlook

Focus on recent developments (last 6 months).`;

            const marketOverview = await base44.integrations.Core.InvokeLLM({
                prompt: marketOverviewPrompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        market_size: { type: "string" },
                        growth_rate: { type: "string" },
                        key_trends: { type: "array", items: { type: "string" } },
                        major_players: { type: "array", items: { type: "string" } },
                        regulatory_changes: { type: "array", items: { type: "string" } },
                        technology_disruptions: { type: "array", items: { type: "string" } },
                        investment_trends: { type: "string" },
                        future_outlook: { type: "string" }
                    }
                }
            });

            intelligence.data.market_overview = marketOverview;
        } catch (error) {
            intelligence.data.market_overview = { error: error.message };
        }

        // Competitive intelligence for each company
        const competitiveIntel = [];
        for (const company of [...companies, ...competitors].slice(0, 5)) {
            try {
                // Financial metrics
                if (Deno.env.get('ALPHA_VANTAGE_API_KEY')) {
                    const overviewRes = await fetch(
                        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${company}&apikey=${Deno.env.get('ALPHA_VANTAGE_API_KEY')}`
                    );
                    const overview = await overviewRes.json();

                    competitiveIntel.push({
                        company,
                        market_cap: overview.MarketCapitalization,
                        pe_ratio: overview.PERatio,
                        profit_margin: overview.ProfitMargin,
                        revenue_growth: overview.QuarterlyRevenueGrowthYOY,
                        sector: overview.Sector,
                        industry: overview.Industry
                    });
                }

                // News sentiment
                if (Deno.env.get('NEWS_API_KEY')) {
                    const newsRes = await fetch(
                        `https://newsapi.org/v2/everything?q=${encodeURIComponent(company)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${Deno.env.get('NEWS_API_KEY')}`
                    );
                    const newsData = await newsRes.json();

                    const articles = newsData.articles || [];
                    const sentiment = await base44.integrations.Core.InvokeLLM({
                        prompt: `Analyze sentiment for ${company} based on these headlines: ${articles.map(a => a.title).join(', ')}. Rate from -1 (very negative) to 1 (very positive).`,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                sentiment_score: { type: "number" },
                                sentiment_label: { type: "string" }
                            }
                        }
                    });

                    const companyData = competitiveIntel.find(c => c.company === company);
                    if (companyData) {
                        companyData.sentiment = sentiment;
                        companyData.recent_news_count = articles.length;
                    }
                }
            } catch (error) {
                console.error(`Error analyzing ${company}:`, error);
            }
        }

        intelligence.data.competitive_intelligence = competitiveIntel;

        // SWOT Analysis using LLM
        if (companies.length > 0) {
            try {
                const swotPrompt = `Conduct a SWOT analysis for ${companies.join(', ')} in the ${industry} industry:

Strengths:
Weaknesses:
Opportunities:
Threats:

Use recent market data and competitive landscape.`;

                const swot = await base44.integrations.Core.InvokeLLM({
                    prompt: swotPrompt,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            strengths: { type: "array", items: { type: "string" } },
                            weaknesses: { type: "array", items: { type: "string" } },
                            opportunities: { type: "array", items: { type: "string" } },
                            threats: { type: "array", items: { type: "string" } }
                        }
                    }
                });

                intelligence.data.swot_analysis = swot;
            } catch (error) {
                intelligence.data.swot_analysis = { error: error.message };
            }
        }

        // Technology landscape
        try {
            const techPrompt = `Analyze the technology landscape in ${industry}:

1. Emerging technologies
2. Key technology providers
3. Technology adoption trends
4. Innovation leaders
5. Technology gaps`;

            const techLandscape = await base44.integrations.Core.InvokeLLM({
                prompt: techPrompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        emerging_technologies: { type: "array", items: { type: "string" } },
                        key_providers: { type: "array", items: { type: "string" } },
                        adoption_trends: { type: "array", items: { type: "string" } },
                        innovation_leaders: { type: "array", items: { type: "string" } },
                        technology_gaps: { type: "array", items: { type: "string" } }
                    }
                }
            });

            intelligence.data.technology_landscape = techLandscape;
        } catch (error) {
            intelligence.data.technology_landscape = { error: error.message };
        }

        return Response.json({
            success: true,
            intelligence: intelligence,
            insights_generated: Object.keys(intelligence.data).length
        });

    } catch (error) {
        console.error('Market intelligence aggregator error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});