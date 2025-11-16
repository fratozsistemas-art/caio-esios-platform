import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entity_type, entity_id, event_type, entity_data } = await req.json();

    // Fetch active trigger rules for this entity type and event
    const triggerRules = await base44.asServiceRole.entities.HermesTriggerRule.filter({
      entity_type,
      trigger_event: event_type,
      is_active: true
    });

    const triggeredAnalyses = [];

    for (const rule of triggerRules) {
      // Check if conditions are met
      if (!checkTriggerConditions(rule.trigger_conditions, entity_data)) {
        continue;
      }

      // Execute Hermes analysis
      const analysisResult = await base44.functions.invoke('hermesAnalyzeIntegrity', {
        target_entity_type: entity_type,
        target_entity_id: entity_id,
        analysis_types: rule.analysis_types
      });

      triggeredAnalyses.push({
        rule_id: rule.id,
        rule_name: rule.name,
        analysis_result: analysisResult.data
      });

      // Update trigger rule stats
      await base44.asServiceRole.entities.HermesTriggerRule.update(rule.id, {
        triggered_count: (rule.triggered_count || 0) + 1,
        last_triggered_at: new Date().toISOString()
      });

      // Check for critical issues and send notifications
      if (rule.notification_config?.notify_on_critical) {
        const hasCritical = analysisResult.data?.analyses?.some(a =>
          (a.inconsistencies_detected || []).some(i => i.severity === 'critical')
        );

        if (hasCritical) {
          await sendCriticalNotification(rule, entity_type, entity_id, analysisResult.data, base44);
        }
      }

      // Update entity with Hermes results
      await updateEntityWithHermesResults(entity_type, entity_id, analysisResult.data, base44);
    }

    return Response.json({
      success: true,
      triggered_rules: triggeredAnalyses.length,
      analyses: triggeredAnalyses
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function checkTriggerConditions(conditions, entityData) {
  if (!conditions) return true;

  if (conditions.status_equals && entityData.status !== conditions.status_equals) {
    return false;
  }

  if (conditions.error_count_exceeds && (entityData.errors_count || 0) <= conditions.error_count_exceeds) {
    return false;
  }

  if (conditions.duration_exceeds && (entityData.duration_seconds || 0) <= conditions.duration_exceeds) {
    return false;
  }

  if (conditions.confidence_below && (entityData.confidence_score || 100) >= conditions.confidence_below) {
    return false;
  }

  if (conditions.custom_field && conditions.custom_value) {
    if (entityData[conditions.custom_field] !== conditions.custom_value) {
      return false;
    }
  }

  return true;
}

async function sendCriticalNotification(rule, entityType, entityId, analysisData, base44) {
  const criticalIssues = [];
  
  analysisData.analyses?.forEach(analysis => {
    (analysis.inconsistencies_detected || [])
      .filter(i => i.severity === 'critical')
      .forEach(issue => criticalIssues.push(issue));
  });

  const notificationMessage = `Hermes detectou ${criticalIssues.length} questão(ões) crítica(s) em ${entityType} (${entityId}):\n\n${
    criticalIssues.map(i => `• ${i.type}: ${i.description}`).join('\n')
  }`;

  await base44.asServiceRole.entities.Notification.create({
    title: `🛡️ Hermes: Questões Críticas Detectadas`,
    message: notificationMessage,
    type: 'alert',
    severity: 'critical',
    data_snapshot: {
      entity_type: entityType,
      entity_id: entityId,
      critical_issues: criticalIssues,
      cognitive_health_score: analysisData.cognitive_health_score
    },
    action_required: true,
    action_url: `/HermesTrustBroker`
  });

  // Send emails if configured
  if (rule.notification_config?.notify_users?.length > 0) {
    for (const userEmail of rule.notification_config.notify_users) {
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        from_name: 'Hermes Trust-Broker',
        subject: 'Alerta Crítico: Questões de Integridade Detectadas',
        body: notificationMessage
      });
    }
  }
}

async function updateEntityWithHermesResults(entityType, entityId, analysisData, base44) {
  const entityMap = {
    'strategy': 'Strategy',
    'analysis': 'Analysis',
    'workspace': 'Workspace',
    'tsi_project': 'TSIProject',
    'workflow': 'AgentWorkflow',
    'workflow_execution': 'WorkflowExecution',
    'enrichment_suggestion': 'EnrichmentSuggestion',
    'knowledge_item': 'KnowledgeItem'
  };

  const entityName = entityMap[entityType];
  if (!entityName) return;

  const hermesMetadata = {
    last_hermes_analysis: new Date().toISOString(),
    hermes_integrity_score: analysisData.cognitive_health_score,
    hermes_critical_issues: analysisData.analyses?.reduce((sum, a) => 
      sum + (a.inconsistencies_detected || []).filter(i => i.severity === 'critical').length, 0
    ),
    hermes_status: analysisData.cognitive_health_score >= 80 ? 'healthy' : 
                   analysisData.cognitive_health_score >= 60 ? 'warning' : 'critical'
  };

  await base44.asServiceRole.entities[entityName].update(entityId, hermesMetadata);
}