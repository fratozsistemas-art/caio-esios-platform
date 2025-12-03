import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * HERMES AUTO-TRIGGER FUNCTION
 * 
 * Executes HERMES analysis based on trigger rules
 * Can be called manually or by scheduled checks
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rule_id, manual = false, entity_data } = await req.json();

    // Get the trigger rule
    let rule = null;
    if (rule_id) {
      const rules = await base44.entities.HermesTriggerRule.filter({ id: rule_id });
      rule = rules[0];
    }

    if (!rule && !manual) {
      return Response.json({ error: 'Rule not found' }, { status: 404 });
    }

    // Determine which HERMES modules to run
    const modulesToRun = rule?.hermes_modules_to_trigger || ['FULL'];

    // Build HERMES analysis prompt based on modules
    let analysisPrompt = `You are HERMES, the Cognitive Intermediation and Strategic Translation framework.

Perform a governance analysis on the following context:
${entity_data ? JSON.stringify(entity_data) : 'General system health check'}

Trigger reason: ${manual ? 'Manual trigger by user' : `Rule: ${rule?.name} - ${rule?.description}`}
Modules requested: ${modulesToRun.join(', ')}

`;

    if (modulesToRun.includes('H1') || modulesToRun.includes('FULL')) {
      analysisPrompt += `
H1 - VECTORIAL TRANSLATION: Translate high-level vision into actionable vectors and tasks.`;
    }

    if (modulesToRun.includes('H2') || modulesToRun.includes('FULL')) {
      analysisPrompt += `
H2 - COGNITIVE CLARITY: Rewrite complex concepts for operational execution.`;
    }

    if (modulesToRun.includes('H3') || modulesToRun.includes('FULL')) {
      analysisPrompt += `
H3 - EMOTIONAL BUFFER: Identify friction points and political risks.`;
    }

    if (modulesToRun.includes('H4') || modulesToRun.includes('FULL')) {
      analysisPrompt += `
H4 - COHERENCE AUDIT: Check vision-execution alignment and detect deviations.`;
    }

    analysisPrompt += `

Return JSON:
{
  "trigger_analysis": {
    "trigger_valid": true,
    "severity": "info|warning|critical",
    "findings": ["finding1", "finding2"]
  },
  "h1_vectors": {
    "primary_vector": "main direction",
    "operational_tasks": ["task1", "task2"]
  },
  "h2_clarification": {
    "simplified_message": "clear message",
    "execution_readiness": 0-100
  },
  "h3_buffer": {
    "friction_points": ["point1"],
    "recommended_tone": "description"
  },
  "h4_audit": {
    "alignment_score": 0-100,
    "deviations": ["deviation1"],
    "checkpoints": ["checkpoint1"]
  },
  "immediate_actions": ["action1", "action2"],
  "escalation_needed": false,
  "escalation_reason": "if needed"
}`;

    // Call LLM for analysis
    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          trigger_analysis: { type: "object" },
          h1_vectors: { type: "object" },
          h2_clarification: { type: "object" },
          h3_buffer: { type: "object" },
          h4_audit: { type: "object" },
          immediate_actions: { type: "array", items: { type: "string" } },
          escalation_needed: { type: "boolean" },
          escalation_reason: { type: "string" }
        }
      }
    });

    // Create HERMES analysis record
    const analysisRecord = await base44.entities.HermesAnalysis.create({
      entity_type: rule?.target_entity_types?.[0] || 'system',
      entity_id: entity_data?.id || 'system_check',
      trigger_type: manual ? 'manual' : 'auto_rule',
      trigger_rule_id: rule?.id,
      analysis_result: analysisResult,
      severity: analysisResult.trigger_analysis?.severity || 'info',
      status: 'completed'
    });

    // Update trigger rule stats
    if (rule) {
      await base44.entities.HermesTriggerRule.update(rule.id, {
        trigger_count: (rule.trigger_count || 0) + 1,
        last_triggered_at: new Date().toISOString()
      });
    }

    // Create notification if critical
    if (analysisResult.trigger_analysis?.severity === 'critical' || analysisResult.escalation_needed) {
      await base44.entities.Notification.create({
        type: 'hermes_alert',
        title: 'HERMES Critical Alert',
        message: analysisResult.escalation_reason || 'Critical issue detected requiring attention',
        severity: 'critical',
        target_email: user.email,
        is_read: false,
        metadata: {
          analysis_id: analysisRecord.id,
          rule_id: rule?.id,
          findings: analysisResult.trigger_analysis?.findings
        }
      });
    }

    return Response.json({
      success: true,
      analysis_id: analysisRecord.id,
      result: analysisResult,
      severity: analysisResult.trigger_analysis?.severity,
      escalation_needed: analysisResult.escalation_needed
    });

  } catch (error) {
    console.error('HERMES Auto-Trigger error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});