import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Scheduled Monitoring Check - PRODUCTION VERSION
 * Runs daily via Deno Cron, sends email alerts
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('📅 [BSI] Starting daily monitoring run...');

    // Get all active monitoring configs
    const configs = await base44.asServiceRole.entities.MonitoringConfig.filter({
      subscription_status: 'active'
    });

    console.log(`📊 [BSI] Found ${configs.length} active configs`);

    const results = [];
    const alertsSummary = {
      total: 0,
      critical: 0,
      high: 0,
      companies: []
    };

    for (const config of configs) {
      try {
        console.log(`🔍 [BSI] Checking: ${config.company_name}`);

        const companyAlerts = [];

        // Check press releases
        if (config.enabled_sources?.press_releases) {
          const prResult = await checkPressReleases(base44, config);
          if (prResult.alerts?.length > 0) {
            companyAlerts.push(...prResult.alerts);
          }
        }

        // Update last check timestamp
        await base44.asServiceRole.entities.MonitoringConfig.update(config.id, {
          last_press_check: new Date().toISOString()
        });

        if (companyAlerts.length > 0) {
          alertsSummary.total += companyAlerts.length;
          alertsSummary.critical += companyAlerts.filter(a => a.severity === 'critical').length;
          alertsSummary.high += companyAlerts.filter(a => a.severity === 'high').length;
          alertsSummary.companies.push({
            name: config.company_name,
            alerts: companyAlerts.length
          });

          // Send email alert if configured
          if (config.notification_settings?.email_addresses?.length > 0) {
            await sendAlertEmail(base44, config, companyAlerts);
          }
        }

        results.push({
          config_id: config.id,
          company: config.company_name,
          status: 'checked',
          alerts_found: companyAlerts.length
        });

      } catch (error) {
        console.error(`❌ [BSI] Error checking ${config.company_name}:`, error);
        results.push({
          config_id: config.id,
          company: config.company_name,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log('✅ [BSI] Monitoring run complete');
    console.log(`📊 [BSI] Summary: ${alertsSummary.total} alerts (${alertsSummary.critical} critical, ${alertsSummary.high} high)`);

    return Response.json({
      success: true,
      checked: configs.length,
      results: results,
      alerts_summary: alertsSummary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [BSI] Fatal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

/**
 * Check press releases and analyze consistency
 */
async function checkPressReleases(base44, config) {
  try {
    console.log('🔍 [Press] Searching for recent communications...');
    
    const searchTerms = [
      config.company_name,
      config.company_ticker,
      `${config.company_name} comunicado`,
      `${config.company_name} press release`
    ].filter(Boolean).join(' OR ');

    const searchPrompt = `Search the web for the MOST RECENT press release or official communication from ${config.company_name} published in the LAST 7 DAYS.

**Search Terms:** ${searchTerms}

**Look for:**
- Official press releases from company website
- News from credible sources (Valor Econômico, InfoMoney, Reuters, Bloomberg)
- Recent announcements (last 7 days ONLY)
- Financial results, strategic announcements, M&A, partnerships, ESG initiatives

**Return JSON:**
{
  "found": boolean,
  "title": "Press release title",
  "date": "YYYY-MM-DD",
  "url": "Full URL to source",
  "summary": "200-word summary",
  "source": "Source name",
  "key_messages": ["message1", "message2"]
}

If nothing found in last 7 days, set found=false.`;

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
          source: { type: "string" },
          key_messages: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (!prData.found) {
      console.log('ℹ️ [Press] No new communications in last 7 days');
      return { status: 'no_new_content', alerts: [] };
    }

    console.log(`✅ [Press] Found: ${prData.title}`);

    // Analyze consistency
    const analysisPrompt = `Analyze this communication for consistency with strategic plan and identify potential issues.

**COMPANY:** ${config.company_name}

**STRATEGIC PLAN:**
${config.strategic_plan_summary}

**COMMUNICATION:**
**Title:** ${prData.title}
**Date:** ${prData.date}
**Source:** ${prData.source}
**Summary:** ${prData.summary}
**Key Messages:** ${prData.key_messages?.join(', ')}

**ANALYSIS:**
1. **Consistency Score (0-100):** How aligned is this with strategic plan?
2. **Brand Voice Score (0-100):** Tone consistency?
3. **Sentiment:** positive/neutral/negative
4. **Issues:** Any red flags? (contradictions, tone shifts, misalignment)

**OUTPUT JSON:**
{
  "consistency_score": number (0-100),
  "brand_voice_score": number (0-100),
  "sentiment": "positive|neutral|negative",
  "issues": [
    {
      "type": "strategic_misalignment|brand_voice_deviation|tone_shift|messaging_conflict",
      "severity": "critical|high|medium|low",
      "description": "Clear explanation",
      "evidence": "Quote showing the issue"
    }
  ],
  "recommendation": "What should company do?"
}`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          consistency_score: { type: "number" },
          brand_voice_score: { type: "number" },
          sentiment: { type: "string" },
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                severity: { type: "string" },
                description: { type: "string" },
                evidence: { type: "string" }
              }
            }
          },
          recommendation: { type: "string" }
        },
        required: ["consistency_score", "brand_voice_score", "sentiment"]
      }
    });

    // Save communication analysis
    const communicationAnalysis = await base44.asServiceRole.entities.CommunicationAnalysis.create({
      monitoring_config_id: config.id,
      communication_type: 'press_release',
      source_url: prData.url,
      content: prData.summary,
      content_summary: prData.summary,
      published_at: prData.date,
      consistency_score: analysis.consistency_score,
      brand_voice_score: analysis.brand_voice_score,
      sentiment_label: analysis.sentiment,
      key_topics: [],
      key_messages: prData.key_messages || [],
      inconsistencies: analysis.issues || [],
      ai_confidence: 85,
      analyzed_at: new Date().toISOString()
    });

    // Create alerts for significant issues
    const alerts = [];
    if (analysis.issues && analysis.issues.length > 0) {
      for (const issue of analysis.issues) {
        if (issue.severity === 'critical' || issue.severity === 'high') {
          const alert = await base44.asServiceRole.entities.Alert.create({
            monitoring_config_id: config.id,
            severity: issue.severity,
            category: issue.type,
            title: `${issue.severity.toUpperCase()}: ${issue.type.replace(/_/g, ' ')}`,
            description: issue.description,
            source_type: 'press_release',
            source_url: prData.url,
            detected_at: new Date().toISOString(),
            inconsistency_details: {
              type: issue.type,
              confidence_score: 85,
              evidence: issue.evidence,
              strategic_context: config.strategic_plan_summary,
              deviation: issue.description
            },
            recommendation: analysis.recommendation,
            status: 'new'
          });
          alerts.push(alert);
        }
      }
    }

    // Update consistency score
    await base44.asServiceRole.entities.ConsistencyScore.create({
      monitoring_config_id: config.id,
      period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString(),
      overall_consistency: analysis.consistency_score,
      strategic_alignment: analysis.consistency_score,
      brand_voice_adherence: analysis.brand_voice_score,
      message_consistency: (analysis.consistency_score + analysis.brand_voice_score) / 2,
      tone_consistency: analysis.brand_voice_score,
      by_channel: {
        press_releases: analysis.consistency_score
      },
      trend: 'stable',
      communications_analyzed: 1,
      issues_detected: analysis.issues?.length || 0,
      critical_issues: analysis.issues?.filter(i => i.severity === 'critical').length || 0
    });

    return {
      status: 'analyzed',
      analysis: communicationAnalysis,
      alerts: alerts
    };

  } catch (error) {
    console.error('❌ [Press] Error:', error);
    throw error;
  }
}

/**
 * Send email alert to configured recipients
 */
async function sendAlertEmail(base44, config, alerts) {
  try {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const highAlerts = alerts.filter(a => a.severity === 'high');

    const emailBody = `
<h2>🚨 Board Strategic Intelligence Alert - ${config.company_name}</h2>

<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

<p><strong>Summary:</strong> ${alerts.length} alert(s) detected (${criticalAlerts.length} critical, ${highAlerts.length} high priority)</p>

<hr/>

${alerts.map(alert => `
<div style="border-left: 4px solid ${alert.severity === 'critical' ? '#ef4444' : '#f59e0b'}; padding-left: 12px; margin-bottom: 20px;">
  <h3>${alert.severity.toUpperCase()}: ${alert.title}</h3>
  <p><strong>Category:</strong> ${alert.category.replace(/_/g, ' ')}</p>
  <p><strong>Description:</strong> ${alert.description}</p>
  ${alert.inconsistency_details?.evidence ? `<p><strong>Evidence:</strong> "${alert.inconsistency_details.evidence}"</p>` : ''}
  ${alert.recommendation ? `<p><strong>Recommendation:</strong> ${alert.recommendation}</p>` : ''}
  ${alert.source_url ? `<p><a href="${alert.source_url}">View Source</a></p>` : ''}
</div>
`).join('')}

<hr/>

<p><small>This is an automated alert from CAIO·AI Board Strategic Intelligence. <a href="https://your-app-url.com/monitoring">View Dashboard</a></small></p>
    `;

    for (const email of config.notification_settings.email_addresses) {
      await base44.integrations.Core.SendEmail({
        from_name: 'CAIO Board Intelligence',
        to: email,
        subject: `🚨 BSI Alert: ${config.company_name} - ${alerts.length} Issue(s) Detected`,
        body: emailBody
      });
    }

    console.log(`✅ [Email] Sent alerts to ${config.notification_settings.email_addresses.length} recipient(s)`);

  } catch (error) {
    console.error('❌ [Email] Failed to send:', error);
  }
}