import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { company_id } = await req.json();

        // Buscar empresa
        const companies = company_id 
            ? await base44.asServiceRole.entities.Company.filter({ id: company_id })
            : await base44.asServiceRole.entities.Company.list();

        if (!companies || companies.length === 0) {
            return Response.json({ error: 'No companies found' }, { status: 404 });
        }

        const results = {
            processed: 0,
            executives_found: 0,
            partnerships_found: 0,
            linkedin_profiles_linked: 0,
            errors: []
        };

        for (const company of companies) {
            try {
                // 1. EXTRAIR EXECUTIVOS DE DOCUMENTOS CVM
                const executivesPrompt = `
Busque informações sobre a empresa ${company.legal_name} (CNPJ: ${company.cnpj || 'N/A'}) em documentos da CVM, press releases e filings públicos.

Extraia:
- Nome completo dos principais executivos (CEO, CFO, CTO, Diretores, Conselheiros)
- Cargo/função atual
- Informações de background (se disponíveis)

Retorne apenas executivos confirmados em fontes oficiais.
`;

                const executivesResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: executivesPrompt,
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
                                        background: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                });

                // Criar/atualizar entidades Person
                if (executivesResponse.executives && executivesResponse.executives.length > 0) {
                    for (const exec of executivesResponse.executives) {
                        // Verificar se já existe
                        const existing = await base44.asServiceRole.entities.Person.filter({
                            company_id: company.id,
                            full_name: exec.full_name
                        });

                        if (existing.length === 0) {
                            await base44.asServiceRole.entities.Person.create({
                                full_name: exec.full_name,
                                role: exec.role,
                                company_id: company.id,
                                background: exec.background ? {
                                    notes: exec.background
                                } : undefined
                            });
                            results.executives_found++;
                        }
                    }
                }

                // 2. IDENTIFICAR PARCERIAS ESTRATÉGICAS
                const partnershipsPrompt = `
Busque notícias recentes (últimos 12 meses) sobre ${company.legal_name}.

Identifique:
- Parcerias estratégicas anunciadas
- Nome da empresa parceira
- Tipo de parceria (fornecedor, cliente, investidor, joint venture, etc.)
- Descrição breve da parceria

Apenas parcerias confirmadas em fontes confiáveis.
`;

                const partnershipsResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: partnershipsPrompt,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            partnerships: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        partner_name: { type: "string" },
                                        relationship_type: { 
                                            type: "string",
                                            enum: ["partner", "supplier", "customer", "investor", "acquirer"]
                                        },
                                        description: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                });

                // Criar relationships
                if (partnershipsResponse.partnerships && partnershipsResponse.partnerships.length > 0) {
                    for (const partnership of partnershipsResponse.partnerships) {
                        // Buscar ou criar empresa parceira
                        let partnerCompanies = await base44.asServiceRole.entities.Company.filter({
                            legal_name: partnership.partner_name
                        });

                        let partnerId;
                        if (partnerCompanies.length === 0) {
                            // Criar stub da empresa parceira
                            const newPartner = await base44.asServiceRole.entities.Company.create({
                                legal_name: partnership.partner_name,
                                status: 'active'
                            });
                            partnerId = newPartner.id;
                        } else {
                            partnerId = partnerCompanies[0].id;
                        }

                        // Verificar se relacionamento já existe
                        const existingRel = await base44.asServiceRole.entities.CompanyRelationship.filter({
                            source_company_id: company.id,
                            target_company_id: partnerId
                        });

                        if (existingRel.length === 0) {
                            await base44.asServiceRole.entities.CompanyRelationship.create({
                                source_company_id: company.id,
                                target_company_id: partnerId,
                                relationship_type: partnership.relationship_type,
                                description: partnership.description,
                                strength: 70,
                                validated: true,
                                source: 'ai_news_extraction'
                            });
                            results.partnerships_found++;
                        }
                    }
                }

                // 3. VINCULAR A PERFIS DO LINKEDIN
                if (company.website) {
                    const linkedinPrompt = `
Encontre o perfil oficial do LinkedIn da empresa ${company.legal_name}.
Website oficial: ${company.website}

Retorne apenas se tiver certeza que é o perfil correto.
`;

                    const linkedinResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
                        prompt: linkedinPrompt,
                        add_context_from_internet: true,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                linkedin_url: { type: "string" },
                                found: { type: "boolean" }
                            }
                        }
                    });

                    if (linkedinResponse.found && linkedinResponse.linkedin_url && !company.linkedin_url) {
                        await base44.asServiceRole.entities.Company.update(company.id, {
                            linkedin_url: linkedinResponse.linkedin_url
                        });
                        results.linkedin_profiles_linked++;
                    }
                }

                results.processed++;

            } catch (error) {
                results.errors.push({
                    company_name: company.legal_name,
                    error: error.message
                });
            }
        }

        return Response.json({
            success: true,
            results
        });

    } catch (error) {
        return Response.json({ 
            error: error.message,
            details: 'Failed to enrich company data'
        }, { status: 500 });
    }
});