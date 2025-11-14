import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🔨 Building Knowledge Graph from structured entities...');

        // ✅ Check if graph already has data
        const existingNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.list();
        
        if (existingNodes.length > 20) {
            console.log(`ℹ️ Graph already has ${existingNodes.length} nodes. Returning existing structure.`);
            
            const relationships = await base44.asServiceRole.entities.KnowledgeGraphRelationship.list();
            
            return Response.json({
                success: true,
                message: 'Knowledge Graph already populated',
                stats: {
                    total_nodes: existingNodes.length,
                    total_relationships: relationships.length,
                    node_types: {
                        company: existingNodes.filter(n => n.node_type === 'company').length,
                        strategy: existingNodes.filter(n => n.node_type === 'strategy').length,
                        analysis: existingNodes.filter(n => n.node_type === 'analysis').length,
                        industry: existingNodes.filter(n => n.node_type === 'industry').length,
                        framework: existingNodes.filter(n => n.node_type === 'framework').length,
                        metric: existingNodes.filter(n => n.node_type === 'metric').length,
                    }
                },
                sample_nodes: existingNodes.slice(0, 10).map(n => ({
                    type: n.node_type,
                    label: n.label,
                    id: n.id
                }))
            });
        }

        // ✅ Get all structured entities
        const companies = await base44.asServiceRole.entities.GraphCompany.list();
        const executives = await base44.asServiceRole.entities.GraphExecutive.list();
        const technologies = await base44.asServiceRole.entities.GraphTechnology.list();
        const frameworks = await base44.asServiceRole.entities.GraphFramework.list();
        const metrics = await base44.asServiceRole.entities.GraphMetric.list();
        const investors = await base44.asServiceRole.entities.GraphInvestor.list();
        const markets = await base44.asServiceRole.entities.GraphMarket.list();

        console.log('📊 Entities found:', {
            companies: companies.length,
            executives: executives.length,
            technologies: technologies.length,
            frameworks: frameworks.length,
            metrics: metrics.length,
            investors: investors.length,
            markets: markets.length
        });

        // ✅ If no entities, create sample data
        if (companies.length === 0 && markets.length === 0 && frameworks.length === 0) {
            console.log('📝 No entities found. Creating sample data...');
            
            // Create sample markets
            const fintech = await base44.asServiceRole.entities.GraphMarket.create({
                name: "FinTech Brasil",
                size_usd: 50000000000,
                growth_rate_cagr: 18.5,
                maturity: "Growing",
                geography: "Brasil",
                key_players: ["Nubank", "Stone", "PagSeguro"],
                trends: ["Open Banking", "PIX adoption", "Digital wallets"]
            });

            const saas = await base44.asServiceRole.entities.GraphMarket.create({
                name: "B2B SaaS",
                size_usd: 300000000000,
                growth_rate_cagr: 12.3,
                maturity: "Mature",
                geography: "Global",
                key_players: ["Salesforce", "Microsoft", "ServiceNow"],
                trends: ["AI integration", "Vertical SaaS", "Usage-based pricing"]
            });

            // Create sample companies
            const nubank = await base44.asServiceRole.entities.GraphCompany.create({
                name: "Nubank",
                industry: "FinTech",
                founded_year: 2013,
                headquarters: "São Paulo, Brasil",
                revenue_range: "$500M+",
                employee_count_range: "1000+",
                stage: "Public",
                business_model: "B2C",
                description: "Leading digital bank in Latin America"
            });

            const stripe = await base44.asServiceRole.entities.GraphCompany.create({
                name: "Stripe",
                industry: "FinTech",
                founded_year: 2010,
                headquarters: "San Francisco, USA",
                revenue_range: "$500M+",
                employee_count_range: "1000+",
                stage: "Growth",
                business_model: "B2B",
                description: "Payment infrastructure for the internet"
            });

            const shopify = await base44.asServiceRole.entities.GraphCompany.create({
                name: "Shopify",
                industry: "E-commerce",
                founded_year: 2006,
                headquarters: "Ottawa, Canada",
                revenue_range: "$500M+",
                employee_count_range: "1000+",
                stage: "Public",
                business_model: "B2B2C",
                description: "E-commerce platform for online stores"
            });

            // Create sample frameworks
            const abra = await base44.asServiceRole.entities.GraphFramework.create({
                name: "ABRA (Assumption-Based Reasoning & Analysis)",
                category: "Strategy",
                complexity: "High",
                use_cases: ["Strategic decisions", "Risk assessment", "Scenario planning"],
                description: "Framework for testing assumptions in strategic decisions"
            });

            const nia = await base44.asServiceRole.entities.GraphFramework.create({
                name: "NIA (Network Intelligence Architecture)",
                category: "Strategy",
                complexity: "Medium",
                use_cases: ["Network analysis", "Partnership strategy", "Ecosystem mapping"],
                description: "Framework for analyzing network effects and partnerships"
            });

            // Create sample metrics
            const cac = await base44.asServiceRole.entities.GraphMetric.create({
                name: "CAC (Customer Acquisition Cost)",
                category: "Marketing",
                formula: "Total Marketing & Sales Spend / New Customers Acquired",
                benchmark_range: "$50-$500 for B2B SaaS",
                unit: "$",
                description: "Cost to acquire a new customer"
            });

            const ltv = await base44.asServiceRole.entities.GraphMetric.create({
                name: "LTV (Lifetime Value)",
                category: "Customer",
                formula: "ARPU × Avg Customer Lifetime",
                benchmark_range: "3x-5x CAC",
                unit: "$",
                description: "Total revenue expected from a customer"
            });

            console.log('✅ Sample data created');
        }

        const nodesCreated = [];
        const relationshipsCreated = [];

        // Create Company Nodes + Relationships
        for (const company of companies) {
            const companyNode = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
                node_type: "company",
                entity_id: company.id,
                label: company.name,
                properties: {
                    industry: company.industry,
                    stage: company.stage,
                    revenue_range: company.revenue_range,
                    business_model: company.business_model,
                    geography: company.headquarters
                }
            });
            nodesCreated.push(companyNode);

            // Link to Market
            const companyMarket = markets.find(m => m.name.includes(company.industry));
            if (companyMarket) {
                const marketNode = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
                    node_type: "industry",
                    entity_id: companyMarket.id,
                    label: companyMarket.name,
                    properties: {
                        size_usd: companyMarket.size_usd,
                        growth_rate: companyMarket.growth_rate_cagr,
                        maturity: companyMarket.maturity
                    }
                });
                
                await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
                    from_node_id: companyNode.id,
                    to_node_id: marketNode.id,
                    relationship_type: "OPERATES_IN",
                    properties: { weight: 1.0, confidence: 100 }
                });
                relationshipsCreated.push({ from: company.name, to: companyMarket.name, type: "OPERATES_IN" });
            }
        }

        // Create Executive Nodes + Relationships
        for (const exec of executives) {
            const execNode = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
                node_type: "executive",
                entity_id: exec.id,
                label: exec.name,
                properties: {
                    title: exec.title,
                    current_company: exec.current_company,
                    years_of_experience: exec.years_of_experience
                }
            });
            nodesCreated.push(execNode);

            // Link to Company
            const company = companies.find(c => c.name === exec.current_company);
            if (company) {
                const companyNode = nodesCreated.find(n => n.entity_id === company.id);
                if (companyNode) {
                    await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
                        from_node_id: execNode.id,
                        to_node_id: companyNode.id,
                        relationship_type: "WORKS_AT",
                        properties: { weight: 1.0, confidence: 100 }
                    });
                    relationshipsCreated.push({ from: exec.name, to: company.name, type: "WORKS_AT" });
                }
            }
        }

        // Calculate Company Similarities (same industry + same stage)
        for (let i = 0; i < companies.length; i++) {
            for (let j = i + 1; j < companies.length; j++) {
                const c1 = companies[i];
                const c2 = companies[j];

                const sameIndustry = c1.industry === c2.industry;
                const sameStage = c1.stage === c2.stage;
                const sameBusinessModel = c1.business_model === c2.business_model;

                if (sameIndustry || sameStage) {
                    const weight = (sameIndustry ? 0.5 : 0) + (sameStage ? 0.3 : 0) + (sameBusinessModel ? 0.2 : 0);
                    
                    const node1 = nodesCreated.find(n => n.entity_id === c1.id);
                    const node2 = nodesCreated.find(n => n.entity_id === c2.id);

                    if (node1 && node2) {
                        await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
                            from_node_id: node1.id,
                            to_node_id: node2.id,
                            relationship_type: "SIMILAR_TO",
                            properties: {
                                weight,
                                confidence: Math.round(weight * 100),
                                context: `Same ${sameIndustry ? 'industry' : ''} ${sameStage ? 'stage' : ''}`.trim()
                            }
                        });
                        relationshipsCreated.push({ from: c1.name, to: c2.name, type: "SIMILAR_TO", weight });
                    }
                }
            }
        }

        console.log('✅ Knowledge Graph Built Successfully!');
        console.log(`📊 Entities processed:`);
        console.log(`   - Companies: ${companies.length}`);
        console.log(`   - Executives: ${executives.length}`);
        console.log(`   - Technologies: ${technologies.length}`);
        console.log(`   - Frameworks: ${frameworks.length}`);
        console.log(`   - Metrics: ${metrics.length}`);
        console.log(`   - Investors: ${investors.length}`);
        console.log(`   - Markets: ${markets.length}`);
        console.log(`📊 Nodes created: ${nodesCreated.length}`);
        console.log(`🔗 Relationships created: ${relationshipsCreated.length}`);

        // ✅ Return structured summary
        return Response.json({
            success: true,
            message: 'Knowledge Graph built successfully',
            entities_processed: {
                companies: companies.length,
                executives: executives.length,
                technologies: technologies.length,
                frameworks: frameworks.length,
                metrics: metrics.length,
                investors: investors.length,
                markets: markets.length
            },
            graph_stats: {
                nodes_created: nodesCreated.length,
                relationships_created: relationshipsCreated.length
            },
            sample_nodes: nodesCreated.slice(0, 5).map(n => ({
                type: n.node_type,
                label: n.label,
                properties: n.properties
            })),
            sample_relationships: relationshipsCreated.slice(0, 5)
        });

    } catch (error) {
        console.error('Error building knowledge graph:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});