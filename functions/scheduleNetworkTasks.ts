import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function should be called periodically (e.g., every hour via cron)
    // Check for scheduled automations
    const scheduledAutomations = await base44.asServiceRole.entities.NetworkAutomation.filter({
      trigger_type: 'scheduled',
      is_active: true
    });

    const results = [];

    for (const automation of scheduledAutomations) {
      // Parse cron expression and check if it's time to run
      if (shouldRunNow(automation.schedule_cron)) {
        try {
          const result = await base44.asServiceRole.functions.invoke('executeNetworkAutomation', {
            automation_id: automation.id
          });
          results.push({
            automation_id: automation.id,
            automation_name: automation.name,
            status: 'executed',
            result
          });
        } catch (error) {
          results.push({
            automation_id: automation.id,
            automation_name: automation.name,
            status: 'failed',
            error: error.message
          });
        }
      }
    }

    // Run scheduled health checks
    const lastHealthCheck = await base44.asServiceRole.entities.NetworkHealthCheck.list('-checked_at', 1);
    const shouldRunHealthCheck = !lastHealthCheck[0] || 
      (new Date() - new Date(lastHealthCheck[0].checked_at)) > 3600000; // 1 hour

    if (shouldRunHealthCheck) {
      try {
        const healthCheckResult = await base44.asServiceRole.functions.invoke('runNetworkHealthCheck', {
          check_type: 'comprehensive'
        });
        results.push({
          task: 'health_check',
          status: 'executed',
          result: healthCheckResult
        });
      } catch (error) {
        results.push({
          task: 'health_check',
          status: 'failed',
          error: error.message
        });
      }
    }

    // Check for threshold-based automations
    const thresholdAutomations = await base44.asServiceRole.entities.NetworkAutomation.filter({
      trigger_type: 'threshold',
      is_active: true
    });

    for (const automation of thresholdAutomations) {
      if (await checkThresholds(automation, base44)) {
        try {
          const result = await base44.asServiceRole.functions.invoke('executeNetworkAutomation', {
            automation_id: automation.id
          });
          results.push({
            automation_id: automation.id,
            automation_name: automation.name,
            trigger: 'threshold_exceeded',
            status: 'executed',
            result
          });
        } catch (error) {
          results.push({
            automation_id: automation.id,
            automation_name: automation.name,
            trigger: 'threshold_exceeded',
            status: 'failed',
            error: error.message
          });
        }
      }
    }

    // Check for anomaly-based automations
    const anomalyAutomations = await base44.asServiceRole.entities.NetworkAutomation.filter({
      trigger_type: 'anomaly_detected',
      is_active: true
    });

    const recentAnomalies = await base44.asServiceRole.entities.NetworkAnomaly.filter({
      status: 'new',
      detected_at: { $gte: new Date(Date.now() - 3600000).toISOString() }
    });

    if (recentAnomalies.length > 0) {
      for (const automation of anomalyAutomations) {
        try {
          const result = await base44.asServiceRole.functions.invoke('executeNetworkAutomation', {
            automation_id: automation.id
          });
          results.push({
            automation_id: automation.id,
            automation_name: automation.name,
            trigger: 'anomaly_detected',
            anomalies_count: recentAnomalies.length,
            status: 'executed',
            result
          });
        } catch (error) {
          results.push({
            automation_id: automation.id,
            automation_name: automation.name,
            trigger: 'anomaly_detected',
            status: 'failed',
            error: error.message
          });
        }
      }
    }

    return Response.json({
      scheduled_at: new Date().toISOString(),
      tasks_executed: results.length,
      results
    });

  } catch (error) {
    console.error('Schedule execution error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});

function shouldRunNow(cronExpression) {
  if (!cronExpression) return false;
  
  // Simple cron parsing for common patterns
  // Format: "minute hour day month dayOfWeek"
  const now = new Date();
  const parts = cronExpression.split(' ');
  
  if (parts.length !== 5) return false;
  
  const [minute, hour, day, month, dayOfWeek] = parts;
  
  const matches = (cronPart, value) => {
    if (cronPart === '*') return true;
    if (cronPart.includes('/')) {
      const [, step] = cronPart.split('/');
      return value % parseInt(step) === 0;
    }
    return parseInt(cronPart) === value;
  };
  
  return matches(minute, now.getMinutes()) &&
         matches(hour, now.getHours()) &&
         matches(day, now.getDate()) &&
         matches(month, now.getMonth() + 1) &&
         (dayOfWeek === '*' || parseInt(dayOfWeek) === now.getDay());
}

async function checkThresholds(automation, base44) {
  const conditions = automation.trigger_conditions;
  if (!conditions) return false;

  // Get recent health checks
  const recentChecks = await base44.asServiceRole.entities.NetworkHealthCheck.list('-checked_at', 1);
  if (!recentChecks || recentChecks.length === 0) return false;

  const lastCheck = recentChecks[0];

  // Check various thresholds
  if (conditions.health_score_threshold && lastCheck.health_score < conditions.health_score_threshold) {
    return true;
  }

  if (conditions.error_rate_threshold && lastCheck.metrics?.error_rate > conditions.error_rate_threshold) {
    return true;
  }

  if (conditions.latency_threshold && lastCheck.metrics?.latency_ms > conditions.latency_threshold) {
    return true;
  }

  return false;
}