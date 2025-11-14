import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🇧🇷 Starting Ibovespa Knowledge Graph seed...');

    const companies = [
      // Financeiro (10)
      { ticker: "ITUB4", name: "Itaú Unibanco", sector: "Banking", revenue: "$25B", employees: "95000" },
      { ticker: "BBDC4", name: "Bradesco", sector: "Banking", revenue: "$22B", employees: "85000" },
      { ticker: "BBAS3", name: "Banco do Brasil", sector: "Banking", revenue: "$28B", employees: "90000" },
      { ticker: "SANB11", name: "Santander Brasil", sector: "Banking", revenue: "$15B", employees: "45000" },
      { ticker: "BPAC11", name: "BTG Pactual", sector: "Investment Banking", revenue: "$8B", employees: "5000" },
      { ticker: "B3SA3", name: "B3", sector: "Financial Services", revenue: "$4B", employees: "2000" },
      { ticker: "CIEL3", name: "Cielo", sector: "Payment Processing", revenue: "$3B", employees: "3500" },
      { ticker: "PSSA3", name: "Porto Seguro", sector: "Insurance", revenue: "$12B", employees: "14000" },
      { ticker: "BBSE3", name: "BB Seguridade", sector: "Insurance", revenue: "$5B", employees: "800" },
      { ticker: "IRBR3", name: "IRB Brasil RE", sector: "Insurance", revenue: "$6B", employees: "1200" },
      
      // Commodities (8)
      { ticker: "VALE3", name: "Vale", sector: "Mining", revenue: "$45B", employees: "70000" },
      { ticker: "PETR4", name: "Petrobras", sector: "Oil & Gas", revenue: "$95B", employees: "45000" },
      { ticker: "PRIO3", name: "PRIO", sector: "Oil & Gas", revenue: "$4B", employees: "800" },
      { ticker: "SUZB3", name: "Suzano", sector: "Paper & Pulp", revenue: "$8B", employees: "15000" },
      { ticker: "KLBN11", name: "Klabin", sector: "Paper & Pulp", revenue: "$4B", employees: "24000" },
      { ticker: "GGBR4", name: "Gerdau", sector: "Steel", revenue: "$15B", employees: "30000" },
      { ticker: "USIM5", name: "Usiminas", sector: "Steel", revenue: "$5B", employees: "9000" },
      { ticker: "CSNA3", name: "CSN", sector: "Steel", revenue: "$7B", employees: "28000" },
      
      // Varejo (10)
      { ticker: "MGLU3", name: "Magazine Luiza", sector: "E-commerce", revenue: "$8B", employees: "40000" },
      { ticker: "LREN3", name: "Lojas Renner", sector: "Retail", revenue: "$7B", employees: "19000" },
      { ticker: "ARZZ3", name: "Arezzo", sector: "Fashion Retail", revenue: "$2.5B", employees: "5000" },
      { ticker: "SOMA3", name: "Soma", sector: "Fashion Retail", revenue: "$3B", employees: "12000" },
      { ticker: "PCAR3", name: "Grupo Pão de Açúcar", sector: "Supermarkets", revenue: "$18B", employees: "105000" },
      { ticker: "ASAI3", name: "Assaí Atacadista", sector: "Wholesale", revenue: "$42B", employees: "60000" },
      { ticker: "CRFB3", name: "Carrefour Brasil", sector: "Supermarkets", revenue: "$62B", employees: "120000" },
      { ticker: "VIIA3", name: "Via", sector: "E-commerce", revenue: "$18B", employees: "12000" },
      { ticker: "AMER3", name: "Americanas", sector: "Retail", revenue: "$16B", employees: "40000" },
      { ticker: "BHIA3", name: "Casas Bahia", sector: "Retail", revenue: "$22B", employees: "30000" },
      
      // Alimentos (5)
      { ticker: "ABEV3", name: "Ambev", sector: "Beverages", revenue: "$14B", employees: "30000" },
      { ticker: "JBSS3", name: "JBS", sector: "Food Processing", revenue: "$62B", employees: "250000" },
      { ticker: "MRFG3", name: "Marfrig", sector: "Food Processing", revenue: "$18B", employees: "30000" },
      { ticker: "BRFS3", name: "BRF", sector: "Food Processing", revenue: "$9B", employees: "90000" },
      { ticker: "BEEF3", name: "Minerva", sector: "Food Processing", revenue: "$7B", employees: "15000" },
      
      // Energia (7)
      { ticker: "ELET3", name: "Eletrobras", sector: "Utilities", revenue: "$8B", employees: "12000" },
      { ticker: "EGIE3", name: "Engie Brasil", sector: "Utilities", revenue: "$4B", employees: "1000" },
      { ticker: "CMIG4", name: "Cemig", sector: "Utilities", revenue: "$4.5B", employees: "7000" },
      { ticker: "CPFE3", name: "CPFL Energia", sector: "Utilities", revenue: "$6B", employees: "6000" },
      { ticker: "EQTL3", name: "Equatorial", sector: "Utilities", revenue: "$10B", employees: "10000" },
      { ticker: "TAEE11", name: "Taesa", sector: "Energy Transmission", revenue: "$2B", employees: "800" },
      { ticker: "NEOE3", name: "Neoenergia", sector: "Utilities", revenue: "$20B", employees: "14000" },
      
      // Telecom (2)
      { ticker: "VIVT3", name: "Vivo", sector: "Telecom", revenue: "$43B", employees: "33000" },
      { ticker: "TIMS3", name: "Tim Brasil", sector: "Telecom", revenue: "$18B", employees: "9500" },
      
      // Construção (5)
      { ticker: "MRVE3", name: "MRV", sector: "Real Estate", revenue: "$4B", employees: "5000" },
      { ticker: "CYRE3", name: "Cyrela", sector: "Real Estate", revenue: "$5B", employees: "1800" },
      { ticker: "MULT3", name: "Multiplan", sector: "Shopping Malls", revenue: "$1.2B", employees: "500" },
      { ticker: "IGTI11", name: "Iguatemi", sector: "Shopping Malls", revenue: "$800M", employees: "400" },
      { ticker: "BRML3", name: "BR Malls", sector: "Shopping Malls", revenue: "$1.5B", employees: "600" },
      
      // Indústria (3)
      { ticker: "WEGE3", name: "WEG", sector: "Electrical Equipment", revenue: "$5B", employees: "35000" },
      { ticker: "EMBR3", name: "Embraer", sector: "Aerospace", revenue: "$5.5B", employees: "18000" },
      { ticker: "RAIL3", name: "Rumo", sector: "Logistics", revenue: "$6B", employees: "12000" }
    ];

    console.log(`📊 Processing ${companies.length} companies...`);

    let createdNodes = 0;
    let createdRelationships = 0;
    let errors = 0;

    // Process in batches of 5
    for (let i = 0; i < companies.length; i += 5) {
      const batch = companies.slice(i, i + 5);
      
      await Promise.all(batch.map(async (company) => {
        try {
          // Check if company node already exists
          const existing = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
            label: company.name
          });

          if (existing.length > 0) {
            console.log(`⏭️  Skip: ${company.name} already exists`);
            return;
          }

          // Create company node
          const companyNode = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
            node_type: "company",
            label: company.name,
            properties: {
              industry: company.sector,
              ticker: company.ticker,
              revenue_range: company.revenue,
              employee_count_range: company.employees,
              geography: "Brasil",
              stage: "Public",
              business_model: "B2C"
            },
            metadata: {
              source: "Ibovespa",
              data_quality: "verified",
              last_updated: new Date().toISOString()
            }
          });

          createdNodes++;
          console.log(`✅ Created: ${company.name}`);

          // Create or link to industry node
          let industryNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
            node_type: "industry",
            label: company.sector
          });

          let industryNode;
          if (industryNodes.length === 0) {
            industryNode = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
              node_type: "industry",
              label: company.sector,
              properties: {
                geography: "Brasil"
              }
            });
            createdNodes++;
          } else {
            industryNode = industryNodes[0];
          }

          // Create relationship
          await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
            from_node_id: companyNode.id,
            to_node_id: industryNode.id,
            relationship_type: "OPERATES_IN",
            properties: {
              weight: 1.0,
              confidence: 100
            }
          });

          createdRelationships++;

        } catch (error) {
          console.error(`❌ Error processing ${company.name}:`, error.message);
          errors++;
        }
      }));

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Ibovespa seed completed!');

    return Response.json({
      success: true,
      stats: {
        companies_processed: companies.length,
        nodes_created: createdNodes,
        relationships_created: createdRelationships,
        errors
      }
    });

  } catch (error) {
    console.error('❌ Seed failed:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});