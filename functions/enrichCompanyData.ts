import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { company_id } = await req.json();

        if (!company_id) {
            return Response.json({ error: 'company_id is required' }, { status: 400 });
        }

        // Get company data
        const companies = await base44.entities.Company.filter({ id: company_id });
        if (!companies || companies.length === 0) {
            return Response.json({ error: 'Company not found' }, { status: 404 });
        }

        const company = companies[0];
        const enrichmentResults = {
            executives_found: 0,
            partnerships_found: 0,
            linkedin_updated: false,
            errors: []
        };

        // Step 1: Extract key personnel from CVM documents
        try {
            const personnelPrompt = `
                Analyze the following company information and extract key personnel:
                Company: ${company.legal_name} (${company.trade_name || 'N/A'})
                CNPJ: ${company.cnpj || 'N/A'}
                Industry: ${company.industry || 'N/A'}
                Partners from QSA: ${JSON.stringify(company.partners || [])}

                Based on this information, identify key executives (CEO, CFO, CTO, Directors, etc.).
                For each executive found, return their full name, role, and any other details.

                IMPORTANT: Return ONLY a JSON array, no markdown, no explanation.
                Format: [{"full_name": "Name", "role": "Position", "source": "QSA" or "Public filings"}]
            `;

            const personnelResponse = await base44.integrations.Core.InvokeLLM({
                prompt: personnelPrompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        executives: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    full_name: { type: "string" },
                                    role: { type: "string" },
                                    source: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            const executives = personnelResponse.executives || [];
            
            // Create or update Person entities
            for (const exec of executives) {
                try {
                    // Check if person already exists
                    const existingPersons = await base44.entities.Person.filter({
                        full_name: exec.full_name,
                        company_id: company.id
                    });

                    if (existingPersons.length === 0) {
                        await base44.entities.Person.create({
                            full_name: exec.full_name,
                            role: exec.role,
                            company_id: company.id,
                            background: {
                                source: exec.source
                            }
                        });
                        enrichmentResults.executives_found++;
                    }
                } catch (error) {
                    enrichmentResults.errors.push(`Failed to create person ${exec.full_name}: ${error.message}`);
                }
            }
        } catch (error) {
            enrichmentResults.errors.push(`Personnel extraction failed: ${error.message}`);
        }

        // Step 2: Identify strategic partnerships from news
        try {
            const partnershipPrompt = `
                Search for recent news and press releases about strategic partnerships involving the company:
                ${company.legal_name} (${company.trade_name || ''})
                CNPJ: ${company.cnpj}
                Industry: ${company.industry}

                Find partnerships, acquisitions, joint ventures, strategic alliances, supplier/customer relationships.
                
                IMPORTANT: Return ONLY a JSON object, no markdown, no explanation.
                Format: {
                    "partnerships": [
                        {
                            "partner_company_name": "Company Name",
                            "relationship_type": "partner|supplier|customer|investor|subsidiary",
                            "description": "Brief description",
                            "source": "News URL or source"
                        }
                    ]
                }
            `;

            const partnershipResponse = await base44.integrations.Core.InvokeLLM({
                prompt: partnershipPrompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        partnerships: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    partner_company_name: { type: "string" },
                                    relationship_type: { type: "string" },
                                    description: { type: "string" },
                                    source: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            const partnerships = partnershipResponse.partnerships || [];

            // Create CompanyRelationship entities
            for (const partnership of partnerships) {
                try {
                    // Try to find or create target company
                    let targetCompanies = await base44.entities.Company.filter({
                        legal_name: partnership.partner_company_name
                    });

                    let targetCompanyId;
                    if (targetCompanies.length === 0) {
                        // Create minimal company record
                        const newCompany = await base44.entities.Company.create({
                            legal_name: partnership.partner_company_name,
                            data_sources: ['news_extraction']
                        });
                        targetCompanyId = newCompany.id;
                    } else {
                        targetCompanyId = targetCompanies[0].id;
                    }

                    // Check if relationship already exists
                    const existingRels = await base44.entities.CompanyRelationship.filter({
                        source_company_id: company.id,
                        target_company_id: targetCompanyId
                    });

                    if (existingRels.length === 0) {
                        await base44.entities.CompanyRelationship.create({
                            source_company_id: company.id,
                            target_company_id: targetCompanyId,
                            relationship_type: partnership.relationship_type,
                            description: partnership.description,
                            source: partnership.source,
                            validated: false,
                            strength: 50
                        });
                        enrichmentResults.partnerships_found++;
                    }
                } catch (error) {
                    enrichmentResults.errors.push(`Failed to create partnership with ${partnership.partner_company_name}: ${error.message}`);
                }
            }
        } catch (error) {
            enrichmentResults.errors.push(`Partnership extraction failed: ${error.message}`);
        }

        // Step 3: Link company website to LinkedIn profile
        try {
            if (company.website) {
                const linkedinPrompt = `
                    Find the official LinkedIn company profile URL for:
                    Company: ${company.legal_name}
                    Website: ${company.website}
                    Industry: ${company.industry || 'N/A'}

                    IMPORTANT: Return ONLY a JSON object with the LinkedIn URL, no markdown, no explanation.
                    Format: {"linkedin_url": "https://linkedin.com/company/..." or null if not found}
                `;

                const linkedinResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: linkedinPrompt,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            linkedin_url: { type: "string" }
                        }
                    }
                });

                if (linkedinResponse.linkedin_url && linkedinResponse.linkedin_url !== company.linkedin_url) {
                    await base44.entities.Company.update(company.id, {
                        linkedin_url: linkedinResponse.linkedin_url
                    });
                    enrichmentResults.linkedin_updated = true;
                }
            }
        } catch (error) {
            enrichmentResults.errors.push(`LinkedIn linking failed: ${error.message}`);
        }

        return Response.json({
            success: true,
            company_name: company.legal_name,
            enrichment_results: enrichmentResults,
            message: `Enrichment complete: ${enrichmentResults.executives_found} executives, ${enrichmentResults.partnerships_found} partnerships found`
        });

    } catch (error) {
        console.error('Enrichment error:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});