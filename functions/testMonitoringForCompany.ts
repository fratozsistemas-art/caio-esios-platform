import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Manual Test Function - Run monitoring for specific company
 * USE THIS TO DEBUG Suzano or any company
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyName, configId } = await req.json();

    console.log(`🧪 [TEST] Manual test for: ${companyName || configId}`);

    // Find monitoring config
    let config;
    if (configId) {
      config = await base44.asServiceRole.entities.MonitoringConfig.get(configId);
    } else if (companyName) {
      const configs = await base44.asServiceRole.entities.MonitoringConfig.filter({
        company_name: companyName
      });
      config = configs[0];
    }

    if (!config) {
      return Response.json({ 
        error: 'Config not found',
        hint: 'Create a monitoring config first in MonitoringHubV2'
      }, { status: 404 });
    }

    console.log(`✅ [TEST] Found config for ${config.company_name}`);

    // Run press release check
    const searchPrompt = `Search the web for the MOST RECENT press release or official communication from ${config.company_name} (${config.company_ticker || 'Brazilian company'}).

**Look for:**
- Official press releases from company website (${config.company_name}.com.br)
- News from Valor Econômico, InfoMoney, Reuters Brasil
- Recent announcements (last 60 days)
- Financial results, strategic announcements

**Return JSON:**
{
  "found": boolean,
  "title": "string",
  "date": "YYYY-MM-DD",
  "url": "string",
  "summary": "200 words",
  "source": "string"
}`;

    console.log('🔍 [TEST] Searching for press releases...');

    const prData = await base44.integrations.Core.InvokeLLM({
      prompt: searchPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          found: { type: "boolean" },
          title: { type: "string" },
          date: { type: "string" },
          url: { type: "string" },
          summary: { type: "string" },
          source: { type: "string" }
        }
      }
    });

    console.log('📊 [TEST] Search result:', prData);

    if (!prData.found) {
      return Response.json({
        success: false,
        config: {
          id: config.id,
          company: config.company_name,
          ticker: config.company_ticker
        },
        result: 'No press releases found',
        suggestion: 'Try updating strategic_plan_summary with more recent info, or check if company ticker is correct'
      });
    }

    // Analyze consistency
    const analysisPrompt = `Analyze this press release for consistency with the strategic plan:

**STRATEGIC PLAN:** ${config.strategic_plan_summary}

**PRESS RELEASE:**
Title: ${prData.title}
Summary: ${prData.summary}

Return JSON with consistency_score (0-100), issues_detected array, and recommendation.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          consistency_score: { type: "number" },
          brand_voice_score: { type: "number" },
          issues_detected: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                severity: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          recommendation: { type: "string" }
        }
      }
    });

    console.log('✅ [TEST] Analysis complete');

    // Store results
    const communicationAnalysis = await base44.asServiceRole.entities.CommunicationAnalysis.create({
      monitoring_config_id: config.id,
      communication_type: 'press_release',
      source_url: prData.url,
      content: prData.summary,
      content_summary: prData.summary.substring(0, 200),
      published_at: prData.date,
      consistency_score: analysis.consistency_score,
      brand_voice_score: analysis.brand_voice_score || 0,
      key_topics: [],
      key_messages: [],
      inconsistencies: analysis.issues_detected || [],
      analyzed_at: new Date().toISOString()
    });

    // Create alert if needed
    const threshold = config.alert_thresholds?.consistency_score_min || 70;
    let alert = null;

    if (analysis.consistency_score < threshold && analysis.issues_detected?.length > 0) {
      alert = await base44.asServiceRole.entities.Alert.create({
        monitoring_config_id: config.id,
        severity: 'high',
        category: 'consistency_issue',
        title: `Low consistency: ${analysis.consistency_score}%`,
        description: analysis.recommendation,
        source_type: 'press_release',
        source_url: prData.url,
        detected_at: new Date().toISOString(),
        status: 'new'
      });
    }

    return Response.json({
      success: true,
      config: {
        id: config.id,
        company: config.company_name,
        ticker: config.company_ticker
      },
      press_release: prData,
      analysis: {
        consistency_score: analysis.consistency_score,
        brand_voice_score: analysis.brand_voice_score,
        issues_count: analysis.issues_detected?.length || 0
      },
      communication_analysis_id: communicationAnalysis.id,
      alert_created: !!alert,
      alert_id: alert?.id,
      message: 'Test completed successfully! Check MonitoringHubV2 to see results.'
    });

  } catch (error) {
    console.error('❌ [TEST] Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});