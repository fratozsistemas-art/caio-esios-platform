import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * AUTO-SYNC STRATEGY → KNOWLEDGE GRAPH
 * Automatically extracts entities and relationships from validated strategies
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { strategy_id } = await req.json();

    if (!strategy_id) {
      return Response.json({ error: 'strategy_id required' }, { status: 400 });
    }

    const strategy = await base44.asServiceRole.entities.Strategy.filter({ id: strategy_id });
    
    if (!strategy || strategy.length === 0) {
      return Response.json({ error: 'Strategy not found' }, { status: 404 });
    }

    const strategyData = strategy[0];

    console.log(`🔄 [Graph Sync] Processing strategy: ${strategyData.title}`);

    // Extract entities using LLM
    const extractionPrompt = `Extract entities and relationships from this strategic analysis for Knowledge Graph.

**STRATEGY:**
**Title:** ${strategyData.title}
**Description:** ${strategyData.description}
**Category:** ${strategyData.category}
**Key Insights:** ${JSON.stringify(strategyData.key_insights)}
**Context:** ${strategyData.context || 'N/A'}

**EXTRACT:**
1. **Companies** mentioned (name, industry)
2. **Technologies** discussed (name, category)
3. **Markets** analyzed (name, size estimate)
4. **Executives/People** mentioned (name, role)
5. **Frameworks** used (name)
6. **Relationships** between entities

**OUTPUT JSON:**
{
  "companies": [
    {"name": "Company Name", "industry": "Industry", "context": "Why mentioned"}
  ],
  "technologies": [
    {"name": "Tech Name", "category": "AI|SaaS|etc", "context": "Usage"}
  ],
  "markets": [
    {"name": "Market Name", "size_estimate": "approx USD", "context": "Analysis"}
  ],
  "executives": [
    {"name": "Person Name", "role": "CEO|CTO|etc", "company": "Company"}
  ],
  "frameworks": [
    {"name": "Framework Name", "application": "How used"}
  ],
  "relationships": [
    {"from": "EntityA", "to": "EntityB", "type": "COMPETES_WITH|USES|OPERATES_IN|etc", "context": "Why"}
  ]
}`;

    const extraction = await base44.integrations.Core.InvokeLLM({
      prompt: extractionPrompt,
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
                context: { type: "string" }
              }
            }
          },
          technologies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                category: { type: "string" },
                context: { type: "string" }
              }
            }
          },
          markets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                size_estimate: { type: "string" },
                context: { type: "string" }
              }
            }
          },
          executives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                role: { type: "string" },
                company: { type: "string" }
              }
            }
          },
          frameworks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                application: { type: "string" }
              }
            }
          },
          relationships: {
            type: "array",
            items: {
              type: "object",
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                type: { type: "string" },
                context: { type: "string" }
              }
            }
          }
        }
      }
    });

    const syncResults = {
      nodes_created: 0,
      relationships_created: 0,
      nodes_updated: 0,
      errors: []
    };

    // Create/update companies
    for (const company of extraction.companies || []) {
      try {
        // Check if exists
        const existing = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
          node_type: 'company',
          label: company.name
        });

        if (existing.length === 0) {
          await base44.asServiceRole.entities.KnowledgeGraphNode.create({
            node_type: 'company',
            label: company.name,
            properties: {
              industry: company.industry,
              source: 'strategy_auto_sync',
              strategy_id: strategy_id
            },
            metadata: {
              extracted_from: strategyData.title,
              context: company.context
            }
          });
          syncResults.nodes_created++;
        } else {
          syncResults.nodes_updated++;
        }
      } catch (error) {
        syncResults.errors.push({ type: 'company', name: company.name, error: error.message });
      }
    }

    // Create/update technologies
    for (const tech of extraction.technologies || []) {
      try {
        const existing = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
          node_type: 'technology',
          label: tech.name
        });

        if (existing.length === 0) {
          await base44.asServiceRole.entities.KnowledgeGraphNode.create({
            node_type: 'technology',
            label: tech.name,
            properties: {
              category: tech.category,
              source: 'strategy_auto_sync'
            },
            metadata: {
              extracted_from: strategyData.title,
              context: tech.context
            }
          });
          syncResults.nodes_created++;
        } else {
          syncResults.nodes_updated++;
        }
      } catch (error) {
        syncResults.errors.push({ type: 'technology', name: tech.name, error: error.message });
      }
    }

    // Create/update markets
    for (const market of extraction.markets || []) {
      try {
        const existing = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
          node_type: 'industry',
          label: market.name
        });

        if (existing.length === 0) {
          await base44.asServiceRole.entities.KnowledgeGraphNode.create({
            node_type: 'industry',
            label: market.name,
            properties: {
              size_estimate: market.size_estimate,
              source: 'strategy_auto_sync'
            },
            metadata: {
              extracted_from: strategyData.title,
              context: market.context
            }
          });
          syncResults.nodes_created++;
        } else {
          syncResults.nodes_updated++;
        }
      } catch (error) {
        syncResults.errors.push({ type: 'market', name: market.name, error: error.message });
      }
    }

    // Create relationships
    for (const rel of extraction.relationships || []) {
      try {
        // Find source and target nodes
        const fromNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
          label: rel.from
        });
        const toNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
          label: rel.to
        });

        if (fromNodes.length > 0 && toNodes.length > 0) {
          // Check if relationship exists
          const existing = await base44.asServiceRole.entities.KnowledgeGraphRelationship.filter({
            from_node_id: fromNodes[0].id,
            to_node_id: toNodes[0].id,
            relationship_type: rel.type
          });

          if (existing.length === 0) {
            await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
              from_node_id: fromNodes[0].id,
              to_node_id: toNodes[0].id,
              relationship_type: rel.type,
              properties: {
                weight: 1.0,
                confidence: 85,
                source: 'strategy_auto_sync',
                context: rel.context
              },
              metadata: {
                extracted_from: strategyData.title,
                strategy_id: strategy_id
              }
            });
            syncResults.relationships_created++;
          }
        }
      } catch (error) {
        syncResults.errors.push({ 
          type: 'relationship', 
          from: rel.from, 
          to: rel.to, 
          error: error.message 
        });
      }
    }

    console.log(`✅ [Graph Sync] Complete: ${syncResults.nodes_created} nodes, ${syncResults.relationships_created} relationships`);

    return Response.json({
      success: true,
      strategy_id,
      sync_results: syncResults,
      extraction_summary: {
        companies: extraction.companies?.length || 0,
        technologies: extraction.technologies?.length || 0,
        markets: extraction.markets?.length || 0,
        executives: extraction.executives?.length || 0,
        frameworks: extraction.frameworks?.length || 0,
        relationships: extraction.relationships?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ [Graph Sync] Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});