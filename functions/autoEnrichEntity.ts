import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { entity_id, enrichment_depth = 'standard' } = await req.json();

        // Carregar entidade
        const entity = await base44.entities.KnowledgeGraphNode.filter({ id: entity_id });
        if (!entity || entity.length === 0) {
            return Response.json({ error: 'Entity not found' }, { status: 404 });
        }

        const node = entity[0];
        const suggestions = [];

        // 1. Buscar notícias se for empresa
        if (node.node_type === 'company' && Deno.env.get('NEWS_API_KEY')) {
            try {
                const newsResponse = await fetch(
                    `https://newsapi.org/v2/everything?q=${encodeURIComponent(node.label)}&sortBy=publishedAt&pageSize=5&apiKey=${Deno.env.get('NEWS_API_KEY')}`
                );
                const newsData = await newsResponse.json();

                if (newsData.articles && newsData.articles.length > 0) {
                    const recentNews = newsData.articles.slice(0, 3);
                    
                    // Analisar sentimento e extrair insights
                    const newsAnalysis = await base44.integrations.Core.InvokeLLM({
                        prompt: `Analyze these recent news articles about ${node.label} and extract key business insights:

${recentNews.map((a, i) => `${i+1}. ${a.title}\n${a.description}\nSource: ${a.source.name}`).join('\n\n')}

Identify:
1. Recent developments or strategic changes
2. Financial performance indicators
3. Key partnerships or deals
4. Leadership changes
5. Market sentiment

Provide structured insights.`,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                recent_developments: { type: "array", items: { type: "string" } },
                                financial_indicators: { type: "string" },
                                partnerships: { type: "array", items: { type: "string" } },
                                market_sentiment: { type: "string" },
                                suggested_properties: {
                                    type: "object",
                                    properties: {
                                        latest_news_summary: { type: "string" },
                                        market_sentiment: { type: "string" },
                                        recent_activity: { type: "string" }
                                    }
                                }
                            }
                        }
                    });

                    suggestions.push({
                        entity_id: node.id,
                        entity_type: node.node_type,
                        entity_label: node.label,
                        suggestion_type: 'new_property',
                        data_source: 'news_api',
                        suggested_data: newsAnalysis.suggested_properties,
                        current_data: node.properties || {},
                        confidence_score: 85,
                        reasoning: `Recent news analysis reveals ${newsAnalysis.recent_developments?.length || 0} key developments`,
                        supporting_evidence: newsAnalysis.recent_developments?.slice(0, 3) || [],
                        source_urls: recentNews.map(a => a.url)
                    });
                }
            } catch (error) {
                console.error('News API error:', error);
            }
        }

        // 2. Buscar dados financeiros se for empresa
        if (node.node_type === 'company' && Deno.env.get('FINNHUB_API_KEY')) {
            try {
                // Tentar buscar profile da empresa
                const finnhubResponse = await fetch(
                    `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(node.label)}&token=${Deno.env.get('FINNHUB_API_KEY')}`
                );
                const finnhubData = await finnhubResponse.json();

                if (finnhubData && finnhubData.name) {
                    suggestions.push({
                        entity_id: node.id,
                        entity_type: node.node_type,
                        entity_label: node.label,
                        suggestion_type: 'property_update',
                        data_source: 'finnhub',
                        suggested_data: {
                            industry: finnhubData.finnhubIndustry,
                            market_cap: finnhubData.marketCapitalization,
                            website: finnhubData.weburl,
                            logo: finnhubData.logo,
                            country: finnhubData.country,
                            currency: finnhubData.currency,
                            exchange: finnhubData.exchange
                        },
                        current_data: node.properties || {},
                        confidence_score: 90,
                        reasoning: 'Official financial data from Finnhub',
                        supporting_evidence: [`Market cap: ${finnhubData.marketCapitalization}M`, `Industry: ${finnhubData.finnhubIndustry}`],
                        source_urls: [finnhubData.weburl]
                    });
                }
            } catch (error) {
                console.error('Finnhub API error:', error);
            }
        }

        // 3. Buscar informações via web search
        if (enrichment_depth === 'deep') {
            const webSearchPrompt = `Search the web for detailed information about ${node.label} (${node.node_type}).

Current data: ${JSON.stringify(node.properties)}

Find:
1. Missing key properties (founding year, location, size, etc)
2. Recent activities or changes
3. Key relationships with other entities
4. Verified facts that could enhance the profile

Provide structured, factual information with sources.`;

            try {
                const webEnrichment = await base44.integrations.Core.InvokeLLM({
                    prompt: webSearchPrompt,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            enhanced_properties: { type: "object" },
                            suggested_relationships: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        target_entity: { type: "string" },
                                        relationship_type: { type: "string" },
                                        confidence: { type: "number" },
                                        evidence: { type: "string" }
                                    }
                                }
                            },
                            data_quality_issues: {
                                type: "array",
                                items: { type: "string" }
                            }
                        }
                    }
                });

                if (webEnrichment.enhanced_properties && Object.keys(webEnrichment.enhanced_properties).length > 0) {
                    suggestions.push({
                        entity_id: node.id,
                        entity_type: node.node_type,
                        entity_label: node.label,
                        suggestion_type: 'property_update',
                        data_source: 'web_search',
                        suggested_data: webEnrichment.enhanced_properties,
                        current_data: node.properties || {},
                        confidence_score: 75,
                        reasoning: 'Web-sourced comprehensive data enrichment',
                        supporting_evidence: webEnrichment.data_quality_issues || [],
                        source_urls: []
                    });
                }

                // Sugerir novos relacionamentos
                if (webEnrichment.suggested_relationships?.length > 0) {
                    for (const rel of webEnrichment.suggested_relationships.slice(0, 3)) {
                        if (rel.confidence >= 0.7) {
                            suggestions.push({
                                entity_id: node.id,
                                entity_type: node.node_type,
                                entity_label: node.label,
                                suggestion_type: 'new_relationship',
                                data_source: 'web_search',
                                suggested_data: {
                                    target_entity: rel.target_entity,
                                    relationship_type: rel.relationship_type,
                                    evidence: rel.evidence
                                },
                                current_data: {},
                                confidence_score: Math.round(rel.confidence * 100),
                                reasoning: rel.evidence,
                                supporting_evidence: [rel.evidence],
                                source_urls: []
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Web search error:', error);
            }
        }

        // 4. Análise de qualidade dos dados atuais
        if (node.properties) {
            const missingFields = [];
            const expectedFields = {
                company: ['industry', 'founded_year', 'headquarters', 'website'],
                executive: ['title', 'current_company', 'linkedin_url'],
                technology: ['category', 'maturity', 'vendors']
            };

            const expected = expectedFields[node.node_type] || [];
            for (const field of expected) {
                if (!node.properties[field]) {
                    missingFields.push(field);
                }
            }

            if (missingFields.length > 0) {
                suggestions.push({
                    entity_id: node.id,
                    entity_type: node.node_type,
                    entity_label: node.label,
                    suggestion_type: 'data_correction',
                    data_source: 'llm_analysis',
                    suggested_data: {
                        missing_fields: missingFields,
                        recommendation: `Consider adding: ${missingFields.join(', ')}`
                    },
                    current_data: node.properties,
                    confidence_score: 95,
                    reasoning: `Entity profile is missing ${missingFields.length} standard fields`,
                    supporting_evidence: [`Missing fields: ${missingFields.join(', ')}`],
                    source_urls: []
                });
            }
        }

        // Salvar sugestões no banco
        const savedSuggestions = [];
        for (const suggestion of suggestions) {
            // Auto-aplicar sugestões de alta confiança (>90)
            if (suggestion.confidence_score >= 90 && suggestion.suggestion_type === 'property_update') {
                await base44.asServiceRole.entities.KnowledgeGraphNode.update(node.id, {
                    properties: {
                        ...node.properties,
                        ...suggestion.suggested_data,
                        last_enriched_at: new Date().toISOString()
                    }
                });
                suggestion.status = 'applied';
                suggestion.auto_applied = true;
            }

            const saved = await base44.asServiceRole.entities.EnrichmentSuggestion.create(suggestion);
            savedSuggestions.push(saved);
        }

        return Response.json({
            success: true,
            entity: {
                id: node.id,
                label: node.label,
                type: node.node_type
            },
            suggestions: savedSuggestions,
            auto_applied: savedSuggestions.filter(s => s.auto_applied).length,
            pending_review: savedSuggestions.filter(s => s.status === 'pending').length,
            enrichment_depth: enrichment_depth
        });

    } catch (error) {
        console.error('Auto enrich entity error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});