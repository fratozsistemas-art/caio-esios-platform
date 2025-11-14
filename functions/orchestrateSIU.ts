import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { analysis_id } = await req.json();
    
    console.log(`🚀 Starting SIU analysis: ${analysis_id}`);
    
    const analysis = await base44.asServiceRole.entities.SIUAnalysis.get(analysis_id);
    
    if (!analysis) {
      console.error(`❌ Analysis not found: ${analysis_id}`);
      return Response.json({ error: 'Analysis not found' }, { status: 404 });
    }
    
    const companyName = analysis.target?.company_name || 'Company';
    const objective = analysis.mission?.primary_objective || 'Strategic analysis';
    const industry = analysis.target?.industry || 'General';
    const primaryUrl = analysis.target?.primary_url || '';
    
    console.log(`📊 Company: ${companyName}`);
    console.log(`🎯 Objective: ${objective}`);
    
    await base44.asServiceRole.entities.SIUAnalysis.update(analysis_id, {
      status: 'analyzing'
    });
    
    const results = {};
    
    console.log('\n📍 PHASE 1: Market Context');
    const phase1Start = Date.now();
    
    try {
      const marketContext = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the market context for ${companyName} (${industry}).

**Company:** ${companyName}
**Website:** ${primaryUrl}
**Industry:** ${industry}
**Objective:** ${objective}

Provide a comprehensive market analysis covering:

1. Market Size & Growth
2. Competitive Landscape
3. Industry Trends
4. Strategic Implications

Format as structured JSON.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            market_size: {
              type: "object",
              properties: {
                tam_usd: { type: "number" },
                sam_usd: { type: "number" },
                growth_rate: { type: "number" }
              }
            },
            competitors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  market_share: { type: "number" }
                }
              }
            },
            trends: { type: "array", items: { type: "string" } },
            strategic_implications: { type: "array", items: { type: "string" } },
            confidence_score: { type: "number" }
          }
        }
      });
      
      results.market_context = marketContext;
      console.log(`✅ Phase 1 completed in ${((Date.now() - phase1Start) / 1000).toFixed(1)}s`);
    } catch (error) {
      console.error('❌ Phase 1 failed:', error.message);
      results.market_context = { error: error.message, confidence_score: 0 };
    }
    
    console.log('\n📍 PHASE 2: Financial Analysis');
    const phase2Start = Date.now();
    
    try {
      const financialAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform a financial analysis for ${companyName}.

**Company:** ${companyName}
**Industry:** ${industry}
**Objective:** ${objective}

**Market Context:**
${JSON.stringify(results.market_context, null, 2)}

Provide financial analysis covering:
1. Revenue Model
2. Financial Projections (3-year)
3. Investment Requirements
4. Financial Risks

Format as structured JSON.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            revenue_model: {
              type: "object",
              properties: {
                primary_streams: { type: "array", items: { type: "string" } },
                pricing_strategy: { type: "string" }
              }
            },
            projections: {
              type: "object",
              properties: {
                year_1_revenue: { type: "number" },
                year_2_revenue: { type: "number" },
                year_3_revenue: { type: "number" }
              }
            },
            investment_required: { type: "number" },
            expected_roi: { type: "number" },
            risks: { type: "array", items: { type: "string" } },
            confidence_score: { type: "number" }
          }
        }
      });
      
      results.financial_analysis = financialAnalysis;
      console.log(`✅ Phase 2 completed in ${((Date.now() - phase2Start) / 1000).toFixed(1)}s`);
    } catch (error) {
      console.error('❌ Phase 2 failed:', error.message);
      results.financial_analysis = { error: error.message, confidence_score: 0 };
    }
    
    console.log('\n📍 PHASE 3: Strategic Synthesis');
    const phase3Start = Date.now();
    
    try {
      const synthesis = await base44.integrations.Core.InvokeLLM({
        prompt: `Create an executive strategic synthesis for ${companyName}.

**All Analysis Results:**
${JSON.stringify({ market_context: results.market_context, financial_analysis: results.financial_analysis }, null, 2)}

**Original Objective:** ${objective}

Provide a comprehensive strategic synthesis with:
1. Executive Summary
2. GO/NO-GO Recommendation
3. Top 3 Strategic Priorities
4. Critical Risks
5. Next Steps

Format as structured JSON.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            recommendation: {
              type: "object",
              properties: {
                decision: { type: "string", enum: ["GO", "CONDITIONAL_GO", "NO_GO"] },
                rationale: { type: "string" },
                confidence: { type: "number" }
              }
            },
            top_priorities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "string" },
                  expected_impact: { type: "string" }
                }
              },
              maxItems: 3
            },
            critical_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  mitigation: { type: "string" }
                }
              },
              maxItems: 3
            },
            next_steps: {
              type: "object",
              properties: {
                immediate: { type: "array", items: { type: "string" } },
                short_term: { type: "array", items: { type: "string" } }
              }
            },
            confidence_score: { type: "number" }
          }
        }
      });
      
      results.strategic_synthesis = synthesis;
      console.log(`✅ Phase 3 completed in ${((Date.now() - phase3Start) / 1000).toFixed(1)}s`);
    } catch (error) {
      console.error('❌ Phase 3 failed:', error.message);
      results.strategic_synthesis = { error: error.message, confidence_score: 0 };
    }
    
    const confidenceScores = [
      results.market_context?.confidence_score || 0,
      results.financial_analysis?.confidence_score || 0,
      results.strategic_synthesis?.confidence_score || 0
    ];
    const avgConfidence = Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length);
    
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    await base44.asServiceRole.entities.SIUAnalysis.update(analysis_id, {
      status: 'completed',
      analysis_results: {
        methodology: 'SIU v6.0 SIMPLIFIED',
        module_outputs: results,
        master_synthesis: results.strategic_synthesis?.executive_summary || 'Analysis completed',
        execution_time_seconds: parseFloat(totalDuration)
      },
      confidence_score: avgConfidence
    });
    
    console.log(`\n🎉 SIU Analysis Complete!`);
    console.log(`⏱️  Total time: ${totalDuration}s`);
    console.log(`🎯 Confidence: ${avgConfidence}%`);
    
    return Response.json({
      success: true,
      analysis_id,
      methodology: 'SIU v6.0 SIMPLIFIED',
      execution_time_seconds: parseFloat(totalDuration),
      confidence_score: avgConfidence,
      results
    });
    
  } catch (error) {
    console.error(`💥 Fatal error:`, error);
    
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return Response.json({ 
      success: false,
      error: error.message,
      execution_time_seconds: parseFloat(totalDuration)
    }, { status: 500 });
  }
});