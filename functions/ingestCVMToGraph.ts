import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { createHash } from 'node:crypto';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { companies, executives } = await req.json();

        if (!companies || companies.length === 0) {
            return Response.json({ error: 'No companies provided' }, { status: 400 });
        }

        const results = {
            companies_created: 0,
            people_created: 0,
            relationships_created: 0,
            board_interlocks_detected: 0,
            errors: []
        };

        // Step 1: Create Company nodes
        console.log(`Creating ${companies.length} company nodes...`);
        
        for (const company of companies) {
            try {
                // Check if company already exists
                const existing = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
                    node_type: 'company',
                    'properties.cnpj': company.cnpj
                });

                if (existing && existing.length > 0) {
                    console.log(`Company ${company.name} already exists, skipping...`);
                    continue;
                }

                await base44.asServiceRole.entities.KnowledgeGraphNode.create({
                    node_type: 'company',
                    label: company.name,
                    properties: {
                        cnpj: company.cnpj,
                        cvm_code: company.cvm_code,
                        trading_name: company.trading_name,
                        sector: company.sector,
                        status: company.status,
                        registration_date: company.registration_date,
                        data_source: 'CVM',
                        country: 'Brazil'
                    }
                });
                
                results.companies_created++;
            } catch (error) {
                console.error(`Error creating company ${company.name}:`, error);
                results.errors.push(`Company ${company.name}: ${error.message}`);
            }
        }

        // Step 2: Create Person nodes and relationships
        if (executives && executives.length > 0) {
            console.log(`Processing ${executives.length} executive records...`);
            
            const peopleMap = new Map(); // Deduplicate by CPF
            const relationshipsData = [];

            for (const exec of executives) {
                try {
                    // Hash CPF for privacy (Brazilian tax ID is sensitive)
                    const cpfHash = createHash('sha256').update(exec.cpf).digest('hex').substring(0, 16);
                    
                    // Store person in map
                    if (!peopleMap.has(cpfHash)) {
                        peopleMap.set(cpfHash, {
                            cpf_hash: cpfHash,
                            name: exec.name
                        });
                    }

                    // Store relationship data
                    relationshipsData.push({
                        person_cpf_hash: cpfHash,
                        person_name: exec.name,
                        company_cnpj: exec.company_cnpj,
                        role: exec.role,
                        start_date: exec.start_date,
                        end_date: exec.end_date,
                        is_current: exec.is_current
                    });
                } catch (error) {
                    console.error(`Error processing executive ${exec.name}:`, error);
                    results.errors.push(`Executive ${exec.name}: ${error.message}`);
                }
            }

            // Create person nodes
            console.log(`Creating ${peopleMap.size} person nodes...`);
            const personIdMap = new Map(); // Map cpf_hash to node_id

            for (const [cpfHash, person] of peopleMap.entries()) {
                try {
                    // Check if person already exists
                    const existing = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
                        node_type: 'executive',
                        'properties.cpf_hash': cpfHash
                    });

                    let personNode;
                    if (existing && existing.length > 0) {
                        personNode = existing[0];
                    } else {
                        personNode = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
                            node_type: 'executive',
                            label: person.name,
                            properties: {
                                cpf_hash: cpfHash,
                                data_source: 'CVM',
                                country: 'Brazil'
                            }
                        });
                        results.people_created++;
                    }

                    personIdMap.set(cpfHash, personNode.id);
                } catch (error) {
                    console.error(`Error creating person ${person.name}:`, error);
                    results.errors.push(`Person ${person.name}: ${error.message}`);
                }
            }

            // Create relationships
            console.log(`Creating ${relationshipsData.length} relationships...`);
            
            for (const rel of relationshipsData) {
                try {
                    // Find company node
                    const companyNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
                        node_type: 'company',
                        'properties.cnpj': rel.company_cnpj
                    });

                    if (!companyNodes || companyNodes.length === 0) {
                        console.warn(`Company not found for CNPJ ${rel.company_cnpj}`);
                        continue;
                    }

                    const personNodeId = personIdMap.get(rel.person_cpf_hash);
                    if (!personNodeId) {
                        console.warn(`Person node not found for hash ${rel.person_cpf_hash}`);
                        continue;
                    }

                    // Check if relationship already exists
                    const existingRel = await base44.asServiceRole.entities.KnowledgeGraphRelationship.filter({
                        from_node_id: personNodeId,
                        to_node_id: companyNodes[0].id,
                        relationship_type: 'WORKS_AT'
                    });

                    if (existingRel && existingRel.length > 0) {
                        console.log(`Relationship already exists, skipping...`);
                        continue;
                    }

                    await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
                        from_node_id: personNodeId,
                        to_node_id: companyNodes[0].id,
                        relationship_type: 'WORKS_AT',
                        properties: {
                            role: rel.role,
                            start_date: rel.start_date,
                            end_date: rel.end_date,
                            is_current: rel.is_current,
                            data_source: 'CVM'
                        }
                    });

                    results.relationships_created++;
                } catch (error) {
                    console.error(`Error creating relationship:`, error);
                    results.errors.push(`Relationship: ${error.message}`);
                }
            }

            // Step 3: Detect board interlocks
            console.log('Detecting board interlocks...');
            
            const boardRelationships = relationshipsData.filter(r => 
                r.is_current && r.role.toUpperCase().includes('CONSELHO')
            );

            const personCompanyCount = new Map();
            for (const rel of boardRelationships) {
                const count = personCompanyCount.get(rel.person_cpf_hash) || 0;
                personCompanyCount.set(rel.person_cpf_hash, count + 1);
            }

            for (const [cpfHash, count] of personCompanyCount.entries()) {
                if (count >= 2) {
                    results.board_interlocks_detected++;
                }
            }
        }

        console.log('CVM ingestion complete:', results);

        return Response.json({
            success: true,
            results: results,
            message: `Successfully ingested ${results.companies_created} companies, ${results.people_created} people, and ${results.relationships_created} relationships. Detected ${results.board_interlocks_detected} board interlocks.`
        });

    } catch (error) {
        console.error('CVM ingestion error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});