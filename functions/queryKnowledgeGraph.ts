import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { query_type, params } = body;

        console.log('🔍 Query received:', { query_type, params });

        if (!query_type) {
            return Response.json({ 
                error: 'query_type is required',
                received: body
            }, { status: 400 });
        }

        let results = [];

        switch (query_type) {
            case 'find_similar_companies': {
                const targetIndustry = params?.industry;
                const targetGeography = params?.geography;

                console.log('🔍 Searching companies in industry:', targetIndustry);

                const allCompanyNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
                    node_type: 'company'
                });

                console.log(`📊 Found ${allCompanyNodes.length} total companies`);

                if (allCompanyNodes.length === 0) {
                    return Response.json({
                        success: true,
                        results: [],
                        count: 0,
                        message: 'No companies in Knowledge Graph. Please run "Seed Ibovespa" first.',
                        debug: {
                            total_companies: 0,
                            query_params: { targetIndustry, targetGeography }
                        }
                    });
                }

                let matchingCompanies = allCompanyNodes;
                
                if (targetIndustry) {
                    matchingCompanies = matchingCompanies.filter(node => {
                        const nodeIndustry = node.properties?.industry?.toLowerCase() || '';
                        const searchIndustry = targetIndustry.toLowerCase();
                        return nodeIndustry.includes(searchIndustry) || searchIndustry.includes(nodeIndustry);
                    });
                }

                console.log(`📊 After industry filter: ${matchingCompanies.length} companies`);

                if (targetGeography) {
                    matchingCompanies = matchingCompanies.filter(node => {
                        const nodeGeo = node.properties?.geography?.toLowerCase() || '';
                        const searchGeo = targetGeography.toLowerCase();
                        return nodeGeo.includes(searchGeo) || searchGeo.includes(nodeGeo);
                    });
                }

                console.log(`📊 After geography filter: ${matchingCompanies.length} companies`);

                for (const company of matchingCompanies.slice(0, 20)) {
                    const relationships = await base44.asServiceRole.entities.KnowledgeGraphRelationship.filter({
                        from_node_id: company.id,
                        relationship_type: 'SIMILAR_TO'
                    });

                    results.push({
                        company: company.label,
                        industry: company.properties?.industry,
                        geography: company.properties?.geography,
                        ticker: company.properties?.ticker,
                        similar_companies_count: relationships.length,
                        similarity_score: 0.85,
                        reason: `Operates in ${company.properties?.industry}`
                    });
                }

                if (results.length === 0 && matchingCompanies.length > 0) {
                    results = matchingCompanies.slice(0, 10).map(company => ({
                        company: company.label,
                        industry: company.properties?.industry,
                        geography: company.properties?.geography,
                        ticker: company.properties?.ticker,
                        similarity_score: 0.7,
                        reason: `Found in ${company.properties?.industry} sector`
                    }));
                }

                break;
            }

            case 'identify_direct_competitors': {
                const companyName = params?.company_name;
                const productCategory = params?.product_category;
                const geography = params?.geography;

                console.log('🔍 Finding competitors for:', companyName);

                if (!companyName) {
                    return Response.json({
                        error: 'company_name parameter is required',
                        params_received: params
                    }, { status: 400 });
                }

                const allCompanyNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
                    node_type: 'company'
                });

                console.log(`📊 Searching among ${allCompanyNodes.length} companies`);

                const targetCompany = allCompanyNodes.find(c => 
                    c.label.toLowerCase().includes(companyName.toLowerCase()) ||
                    companyName.toLowerCase().includes(c.label.toLowerCase())
                );

                if (!targetCompany) {
                    const similarByIndustry = allCompanyNodes.filter(c => {
                        if (!productCategory) return true;
                        const industry = c.properties?.industry?.toLowerCase() || '';
                        return industry.includes(productCategory.toLowerCase());
                    }).slice(0, 10);

                    results = similarByIndustry.map(c => ({
                        company: c.label,
                        industry: c.properties?.industry,
                        geography: c.properties?.geography,
                        stage: c.properties?.stage,
                        competitive_overlap: "potential_competitor",
                        reason: "Similar industry"
                    }));

                    return Response.json({
                        success: true,
                        results,
                        count: results.length,
                        message: `Company "${companyName}" not found in graph. Showing similar companies in industry.`,
                        debug: { searched_for: companyName, total_companies: allCompanyNodes.length }
                    });
                }

                for (const competitor of allCompanyNodes) {
                    if (competitor.id === targetCompany.id) continue;
                    
                    const sameIndustry = !productCategory || 
                        competitor.properties?.industry?.toLowerCase().includes(productCategory?.toLowerCase()) ||
                        targetCompany.properties?.industry === competitor.properties?.industry;
                    
                    const sameGeography = !geography || 
                        competitor.properties?.geography?.toLowerCase().includes(geography?.toLowerCase());
                    
                    if (sameIndustry && sameGeography) {
                        results.push({
                            company: competitor.label,
                            industry: competitor.properties?.industry,
                            geography: competitor.properties?.geography,
                            stage: competitor.properties?.stage,
                            ticker: competitor.properties?.ticker,
                            competitive_overlap: "direct_competitor"
                        });
                    }
                }

                break;
            }

            case 'strategies_that_failed': {
                const industry = params?.industry;
                const objective = params?.similar_objective;

                console.log('📊 Finding failed strategies...');

                const allStrategies = await base44.asServiceRole.entities.Strategy.filter({
                    status: 'implemented'
                });

                // Filter by industry and low ROI (failures)
                results = allStrategies
                    .filter(s => {
                        const matchesIndustry = !industry || 
                            s.context?.toLowerCase().includes(industry.toLowerCase());
                        const isFailed = s.roi_estimate < 10; // Low ROI = failure
                        return matchesIndustry && isFailed;
                    })
                    .map(s => ({
                        strategy_title: s.title,
                        category: s.category,
                        roi_achieved: s.roi_estimate,
                        failure_reason: s.key_insights?.[0] || 'Unknown',
                        lessons_learned: s.action_items || []
                    }));

                break;
            }

            case 'custom_natural_language': {
                const naturalQuery = params?.natural_language_query;
                
                if (!naturalQuery) {
                    return Response.json({
                        error: 'natural_language_query parameter is required',
                        params_received: params
                    }, { status: 400 });
                }

                const nodes = await base44.asServiceRole.entities.KnowledgeGraphNode.list();
                const nodesSummary = nodes.slice(0, 20).map(n => `${n.node_type}: ${n.label}`).join(', ');

                const interpretationPrompt = `You are a Knowledge Graph Query Expert.

**User Query:** "${naturalQuery}"

**Available Data in Graph:**
${nodesSummary}
...and ${nodes.length - 20} more nodes

**Your Task:** Interpret this query and provide structured results based on available data.

**Output Format (JSON):**
{
  "interpretation": "What the user is asking for",
  "query_executed": "Description of analysis performed",
  "results": [
    {
      "item": "Result item name",
      "details": "Relevant details",
      "confidence": number (0-100)
    }
  ],
  "count": number
}`;

                try {
                    const interpretation = await base44.integrations.Core.InvokeLLM({
                        prompt: interpretationPrompt,
                        add_context_from_internet: true,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                interpretation: { type: "string" },
                                query_executed: { type: "string" },
                                results: { 
                                    type: "array",
                                    items: { type: "object" }
                                },
                                count: { type: "number" }
                            }
                        }
                    });

                    return Response.json({
                        success: true,
                        query_type,
                        ...interpretation
                    });
                } catch (llmError) {
                    console.error('LLM error:', llmError);
                    return Response.json({
                        error: 'Failed to process natural language query',
                        details: llmError.message
                    }, { status: 500 });
                }
            }

            default: {
                console.warn('Unknown query type:', query_type);
                return Response.json({ 
                    error: 'Unknown query type',
                    received_query_type: query_type,
                    supported_types: [
                        'find_similar_companies',
                        'identify_direct_competitors',
                        'strategies_that_failed',
                        'custom_natural_language'
                    ]
                }, { status: 400 });
            }
        }

        console.log(`✅ Query complete. Found ${results.length} results`);

        return Response.json({
            success: true,
            query_type,
            results,
            count: results.length,
            debug: {
                params_received: params,
                results_count: results.length
            }
        });

    } catch (error) {
        console.error('❌ Error querying knowledge graph:', error);
        return Response.json({ 
            error: 'Internal server error',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});