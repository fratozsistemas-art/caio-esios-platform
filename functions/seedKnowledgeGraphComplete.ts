import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Complete Knowledge Graph Seeding
 * Populates with Ibovespa companies + sample strategies + relationships
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🌱 Starting complete Knowledge Graph seed...');

    const stats = {
      companies_created: 0,
      strategies_created: 0,
      relationships_created: 0,
      errors: []
    };

    // ✅ IBOVESPA COMPANIES (Top 50)
    const ibovespaCompanies = [
      { name: "Petrobras", ticker: "PETR4", sector: "Oil & Gas", revenue: "558B BRL" },
      { name: "Vale", ticker: "VALE3", sector: "Mining", revenue: "240B BRL" },
      { name: "Itaú Unibanco", ticker: "ITUB4", sector: "Banking", revenue: "180B BRL" },
      { name: "Bradesco", ticker: "BBDC4", sector: "Banking", revenue: "150B BRL" },
      { name: "Banco do Brasil", ticker: "BBAS3", sector: "Banking", revenue: "145B BRL" },
      { name: "Ambev", ticker: "ABEV3", sector: "Beverages", revenue: "60B BRL" },
      { name: "WEG", ticker: "WEGE3", sector: "Electrical Equipment", revenue: "30B BRL" },
      { name: "Magazine Luiza", ticker: "MGLU3", sector: "E-commerce", revenue: "40B BRL" },
      { name: "Suzano", ticker: "SUZB3", sector: "Paper & Pulp", revenue: "45B BRL" },
      { name: "JBS", ticker: "JBSS3", sector: "Food Processing", revenue: "340B BRL" },
      { name: "Eletrobras", ticker: "ELET3", sector: "Utilities", revenue: "50B BRL" },
      { name: "B3", ticker: "B3SA3", sector: "Financial Services", revenue: "8B BRL" },
      { name: "Vivo", ticker: "VIVT3", sector: "Telecom", revenue: "50B BRL" },
      { name: "Lojas Renner", ticker: "LREN3", sector: "Retail", revenue: "15B BRL" },
      { name: "Rede D'Or", ticker: "RDOR3", sector: "Healthcare", revenue: "20B BRL" },
      { name: "BTG Pactual", ticker: "BPAC11", sector: "Investment Banking", revenue: "25B BRL" },
      { name: "Santander Brasil", ticker: "SANB11", sector: "Banking", revenue: "85B BRL" },
      { name: "Gerdau", ticker: "GGBR4", sector: "Steel", revenue: "60B BRL" },
      { name: "Embraer", ticker: "EMBR3", sector: "Aerospace", revenue: "22B BRL" },
      { name: "Klabin", ticker: "KLBN11", sector: "Paper & Pulp", revenue: "18B BRL" },
      { name: "Equatorial", ticker: "EQTL3", sector: "Utilities", revenue: "28B BRL" },
      { name: "Rumo", ticker: "RAIL3", sector: "Logistics", revenue: "9B BRL" },
      { name: "Hapvida", ticker: "HAPV3", sector: "Healthcare", revenue: "15B BRL" },
      { name: "Marfrig", ticker: "MRFG3", sector: "Food Processing", revenue: "95B BRL" },
      { name: "BRF", ticker: "BRFS3", sector: "Food Processing", revenue: "52B BRL" },
      { name: "CPFL Energia", ticker: "CPFE3", sector: "Utilities", revenue: "32B BRL" },
      { name: "Engie Brasil", ticker: "EGIE3", sector: "Utilities", revenue: "10B BRL" },
      { name: "Cielo", ticker: "CIEL3", sector: "Payment Processing", revenue: "7B BRL" },
      { name: "Porto Seguro", ticker: "PSSA3", sector: "Insurance", revenue: "25B BRL" },
      { name: "MRV", ticker: "MRVE3", sector: "Real Estate", revenue: "8B BRL" },
      { name: "Multiplan", ticker: "MULT3", sector: "Shopping Malls", revenue: "2B BRL" },
      { name: "Fleury", ticker: "FLRY3", sector: "Healthcare", revenue: "3B BRL" },
      { name: "Arezzo", ticker: "ARZZ3", sector: "Fashion Retail", revenue: "5B BRL" },
      { name: "Natura", ticker: "NTCO3", sector: "Cosmetics", revenue: "35B BRL" },
      { name: "Locaweb", ticker: "LWSA3", sector: "SaaS/Tech", revenue: "2B BRL" }
    ];

    // Create company nodes
    for (const company of ibovespaCompanies) {
      try {
        // Check if already exists
        const existing = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
          label: company.name,
          node_type: 'company'
        });

        if (existing.length === 0) {
          await base44.asServiceRole.entities.KnowledgeGraphNode.create({
            node_type: 'company',
            label: company.name,
            properties: {
              ticker: company.ticker,
              sector: company.sector,
              revenue: company.revenue,
              country: 'Brazil',
              exchange: 'B3'
            },
            metadata: {
              source: 'ibovespa_seed',
              created_at: new Date().toISOString()
            }
          });
          stats.companies_created++;
        }
      } catch (error) {
        stats.errors.push(`Company ${company.name}: ${error.message}`);
      }
    }

    // ✅ CREATE SAMPLE STRATEGIES
    const sampleStrategies = [
      {
        title: "Digital Transformation - Petrobras",
        category: "HYBRID",
        company: "Petrobras",
        sector: "Oil & Gas"
      },
      {
        title: "E-commerce Expansion - Magazine Luiza",
        category: "ABRA",
        company: "Magazine Luiza",
        sector: "E-commerce"
      },
      {
        title: "Fintech Innovation - Itaú",
        category: "NIA",
        company: "Itaú Unibanco",
        sector: "Banking"
      },
      {
        title: "Sustainability Strategy - Vale",
        category: "EVA",
        company: "Vale",
        sector: "Mining"
      },
      {
        title: "Market Entry - WEG Industrial Automation",
        category: "M1",
        company: "WEG",
        sector: "Electrical Equipment"
      }
    ];

    for (const strategy of sampleStrategies) {
      try {
        const existing = await base44.asServiceRole.entities.Strategy.filter({
          title: strategy.title
        });

        if (existing.length === 0) {
          const strategyRecord = await base44.asServiceRole.entities.Strategy.create({
            title: strategy.title,
            description: `Strategic analysis for ${strategy.company} in ${strategy.sector} sector`,
            category: strategy.category,
            status: 'validated',
            priority: 'high',
            key_insights: [
              `Market leadership in ${strategy.sector}`,
              'Digital transformation opportunity',
              'Competitive advantage through innovation'
            ]
          });

          // Create strategy node
          const strategyNode = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
            node_type: 'strategy',
            entity_id: strategyRecord.id,
            label: strategy.title,
            properties: {
              category: strategy.category,
              company: strategy.company,
              sector: strategy.sector
            }
          });

          // Find company node
          const companyNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
            label: strategy.company,
            node_type: 'company'
          });

          if (companyNodes.length > 0) {
            // Create relationship
            await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
              from_node_id: strategyNode.id,
              to_node_id: companyNodes[0].id,
              relationship_type: 'IMPLEMENTED',
              properties: {
                confidence: 85,
                context: 'Strategic initiative'
              }
            });
            stats.relationships_created++;
          }

          stats.strategies_created++;
        }
      } catch (error) {
        stats.errors.push(`Strategy ${strategy.title}: ${error.message}`);
      }
    }

    console.log('✅ Knowledge Graph seeding complete!', stats);

    return Response.json({
      success: true,
      stats,
      message: `Created ${stats.companies_created} companies, ${stats.strategies_created} strategies, ${stats.relationships_created} relationships`
    });

  } catch (error) {
    console.error('❌ Seed error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});