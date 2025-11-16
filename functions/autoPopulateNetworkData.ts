import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Auto-populate network data using AI and web intelligence
 * Discovers companies, executives, and relationships automatically
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            seed_company_name,
            seed_industry,
            depth = 2,
            max_entities = 50
        } = await req.json();

        if (!seed_company_name && !seed_industry) {
            return Response.json({ 
                error: 'seed_company_name or seed_industry is required' 
            }, { status: 400 });
        }

        const results = {
            companies_created: 0,
            executives_created: 0,
            relationships_created: 0,
            nodes_created: 0,
            errors: []
        };

        // Step 1: Discover entities using AI + web context
        const discoveredEntities = await discoverNetworkEntities(
            seed_company_name,
            seed_industry,
            depth,
            max_entities,
            base44
        );

        // Step 2: Create companies
        for (const company of discoveredEntities.companies) {
            try {
                const existing = await base44.asServiceRole.entities.GraphCompany.filter({
                    name: company.name
                });

                if (existing.length === 0) {
                    const created = await base44.asServiceRole.entities.GraphCompany.create(company);
                    
                    // Also create KnowledgeGraphNode
                    await base44.asServiceRole.entities.KnowledgeGraphNode.create({
                        node_type: 'company',
                        entity_id: created.id,
                        label: company.name,
                        properties: {
                            industry: company.industry,
                            founded_year: company.founded_year,
                            headquarters: company.headquarters
                        }
                    });
                    
                    results.companies_created++;
                    results.nodes_created++;
                }
            } catch (error) {
                results.errors.push(`Company ${company.name}: ${error.message}`);
            }
        }

        // Step 3: Create executives
        for (const exec of discoveredEntities.executives) {
            try {
                const existing = await base44.asServiceRole.entities.GraphExecutive.filter({
                    name: exec.name
                });

                if (existing.length === 0) {
                    const created = await base44.asServiceRole.entities.GraphExecutive.create(exec);
                    
                    // Also create KnowledgeGraphNode
                    await base44.asServiceRole.entities.KnowledgeGraphNode.create({
                        node_type: 'executive',
                        entity_id: created.id,
                        label: exec.name,
                        properties: {
                            title: exec.title,
                            current_company: exec.current_company
                        }
                    });
                    
                    results.executives_created++;
                    results.nodes_created++;
                }
            } catch (error) {
                results.errors.push(`Executive ${exec.name}: ${error.message}`);
            }
        }

        // Step 4: Create relationships
        for (const rel of discoveredEntities.relationships) {
            try {
                // Get node IDs
                const fromNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
                    label: rel.from_entity
                });
                const toNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
                    label: rel.to_entity
                });

                if (fromNodes.length > 0 && toNodes.length > 0) {
                    await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
                        from_node_id: fromNodes[0].id,
                        to_node_id: toNodes[0].id,
                        relationship_type: rel.type,
                        properties: {
                            confidence: rel.confidence,
                            reasoning: rel.reasoning,
                            discovered_at: new Date().toISOString()
                        }
                    });
                    
                    results.relationships_created++;
                }
            } catch (error) {
                results.errors.push(`Relationship ${rel.from_entity} -> ${rel.to_entity}: ${error.message}`);
            }
        }

        return Response.json({
            success: true,
            results,
            discovered_entities: {
                companies: discoveredEntities.companies.length,
                executives: discoveredEntities.executives.length,
                relationships: discoveredEntities.relationships.length
            }
        });

    } catch (error) {
        console.error('Auto-populate error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

async function discoverNetworkEntities(seedCompany, seedIndustry, depth, maxEntities, base44) {
    const prompt = `Discover a business network ecosystem for intelligence mapping.

SEED: ${seedCompany ? `Company: ${seedCompany}` : `Industry: ${seedIndustry}`}
DEPTH: ${depth} degrees of connection
MAX ENTITIES: ${maxEntities}

Discover and return:
1. Key companies in the ecosystem (competitors, suppliers, customers, partners)
2. Notable executives and their connections
3. Relationships between entities

Return structured data:
{
  "companies": [
    {
      "name": "Company Name",
      "industry": "Industry",
      "founded_year": 2015,
      "headquarters": "City, Country",
      "revenue_range": "$10M-$50M",
      "employee_count_range": "51-200",
      "business_model": "B2B",
      "description": "Brief description"
    }
  ],
  "executives": [
    {
      "name": "Full Name",
      "title": "CEO",
      "current_company": "Company Name",
      "previous_companies": ["Company A", "Company B"],
      "specializations": ["Strategy", "Finance"],
      "years_of_experience": 15
    }
  ],
  "relationships": [
    {
      "from_entity": "Company/Person Name",
      "to_entity": "Company/Person Name",
      "type": "COMPETITOR" | "SUPPLIER" | "WORKS_FOR" | "BOARD_MEMBER" | "INVESTOR",
      "confidence": 85,
      "reasoning": "Why this relationship exists"
    }
  ]
}

Focus on real, verifiable entities in the Brazilian market when possible.`;

    try {
        const entities = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: true, // Use web context for real data
            response_json_schema: {
                type: "object",
                properties: {
                    companies: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                industry: { type: "string" },
                                founded_year: { type: "number" },
                                headquarters: { type: "string" },
                                revenue_range: { type: "string" },
                                employee_count_range: { type: "string" },
                                business_model: { type: "string" },
                                description: { type: "string" }
                            }
                        }
                    },
                    executives: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                title: { type: "string" },
                                current_company: { type: "string" },
                                previous_companies: { type: "array", items: { type: "string" } },
                                specializations: { type: "array", items: { type: "string" } },
                                years_of_experience: { type: "number" }
                            }
                        }
                    },
                    relationships: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                from_entity: { type: "string" },
                                to_entity: { type: "string" },
                                type: { type: "string" },
                                confidence: { type: "number" },
                                reasoning: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        return entities || { companies: [], executives: [], relationships: [] };
    } catch (error) {
        console.error('Discovery error:', error);
        return { companies: [], executives: [], relationships: [] };
    }
}