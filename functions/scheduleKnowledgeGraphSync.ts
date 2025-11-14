import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 [Scheduled] Starting Knowledge Graph sync...');

    const syncResults = {
      strategies_synced: 0,
      analyses_synced: 0,
      siu_analyses_synced: 0,
      companies_enriched: 0,
      relationships_inferred: 0,
      errors: []
    };

    // Sync strategies
    try {
      const strategies = await base44.asServiceRole.entities.Strategy.filter({ 
        status: 'validated' 
      });

      for (const strategy of strategies) {
        const existingNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
          entity_id: strategy.id,
          node_type: 'strategy'
        });

        if (existingNodes.length === 0) {
          await base44.asServiceRole.entities.KnowledgeGraphNode.create({
            node_type: 'strategy',
            entity_id: strategy.id,
            label: strategy.title,
            properties: {
              category: strategy.category,
              roi_estimate: strategy.roi_estimate,
              target_audience: strategy.target_audience,
              priority: strategy.priority,
              status: strategy.status
            }
          });
          syncResults.strategies_synced++;
        }
      }
    } catch (error) {
      console.error('Error syncing strategies:', error);
      syncResults.errors.push({ phase: 'strategies', error: error.message });
    }

    // Sync analyses
    try {
      const analyses = await base44.asServiceRole.entities.Analysis.filter({ 
        status: 'completed' 
      });

      for (const analysis of analyses) {
        const existingNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
          entity_id: analysis.id,
          node_type: 'analysis'
        });

        if (existingNodes.length === 0) {
          await base44.asServiceRole.entities.KnowledgeGraphNode.create({
            node_type: 'analysis',
            entity_id: analysis.id,
            label: analysis.title,
            properties: {
              type: analysis.type,
              confidence_score: analysis.confidence_score,
              framework_used: analysis.framework_used
            }
          });
          syncResults.analyses_synced++;
        }
      }
    } catch (error) {
      console.error('Error syncing analyses:', error);
      syncResults.errors.push({ phase: 'analyses', error: error.message });
    }

    // Sync SIU analyses
    try {
      const siuAnalyses = await base44.asServiceRole.entities.SIUAnalysis.filter({ 
        status: 'completed' 
      });

      for (const analysis of siuAnalyses) {
        const existingNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
          entity_id: analysis.id,
          node_type: 'siu_analysis'
        });

        if (existingNodes.length === 0) {
          await base44.asServiceRole.entities.KnowledgeGraphNode.create({
            node_type: 'siu_analysis',
            entity_id: analysis.id,
            label: `SIU: ${analysis.target?.company_name || 'Unknown'}`,
            properties: {
              mission_type: analysis.mission?.type,
              confidence_score: analysis.confidence_score,
              industry: analysis.target?.industry,
              geography: analysis.target?.geography
            }
          });
          syncResults.siu_analyses_synced++;
        }
      }
    } catch (error) {
      console.error('Error syncing SIU analyses:', error);
      syncResults.errors.push({ phase: 'siu_analyses', error: error.message });
    }

    // Enrich companies
    try {
      const companyNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter({
        node_type: 'company'
      });

      for (const company of companyNodes.slice(0, 3)) {
        if (!company.properties?.enriched) {
          const enrichmentPrompt = `Provide structured data about company: ${company.label}

Return ONLY JSON:
{
  "founded_year": number or null,
  "employee_count_range": "1-10|11-50|51-200|201-500|500+",
  "revenue_range": "$0-$1M|$1M-$10M|$10M-$50M|$50M-$100M|$100M+",
  "funding_stage": "Bootstrap|Seed|Series A|Series B|Series C|IPO",
  "key_products": [string],
  "competitors": [string]
}`;

          try {
            const enrichment = await base44.integrations.Core.InvokeLLM({
              prompt: enrichmentPrompt,
              add_context_from_internet: true,
              response_json_schema: {
                type: "object",
                properties: {
                  founded_year: { type: ["number", "null"] },
                  employee_count_range: { type: ["string", "null"] },
                  revenue_range: { type: ["string", "null"] },
                  funding_stage: { type: ["string", "null"] },
                  key_products: { type: "array", items: { type: "string" } },
                  competitors: { type: "array", items: { type: "string" } }
                }
              }
            });

            await base44.asServiceRole.entities.KnowledgeGraphNode.update(company.id, {
              properties: {
                ...company.properties,
                ...enrichment,
                enriched: true,
                enriched_at: new Date().toISOString()
              }
            });

            syncResults.companies_enriched++;
          } catch (enrichError) {
            console.error(`Error enriching company ${company.label}:`, enrichError);
          }
        }
      }
    } catch (error) {
      console.error('Error enriching companies:', error);
      syncResults.errors.push({ phase: 'enrichment', error: error.message });
    }

    console.log('✅ Knowledge Graph sync complete:', syncResults);

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: syncResults
    });

  } catch (error) {
    console.error('Scheduled sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});