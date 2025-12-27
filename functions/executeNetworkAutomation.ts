import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { automation_id } = await req.json();

    // Get automation config
    const automation = await base44.asServiceRole.entities.NetworkAutomation.filter({
      id: automation_id
    });

    if (!automation || automation.length === 0) {
      return Response.json({ error: 'Automation not found' }, { status: 404 });
    }

    const config = automation[0];

    if (!config.is_active) {
      return Response.json({ error: 'Automation is not active' }, { status: 400 });
    }

    const startTime = Date.now();
    const executionResults = [];
    let overallStatus = 'success';

    // Execute workflow steps
    for (const step of config.workflow_steps || []) {
      try {
        const stepResult = await executeStep(step, config, base44);
        executionResults.push({
          step_order: step.step_order,
          action_type: step.action_type,
          status: 'success',
          result: stepResult
        });
      } catch (error) {
        executionResults.push({
          step_order: step.step_order,
          action_type: step.action_type,
          status: 'failed',
          error: error.message
        });
        overallStatus = 'failed';
        
        // Apply retry policy if available
        if (step.retry_policy && step.retry_policy.max_attempts > 1) {
          for (let attempt = 1; attempt < step.retry_policy.max_attempts; attempt++) {
            await new Promise(resolve => setTimeout(resolve, step.retry_policy.retry_delay_seconds * 1000));
            try {
              const retryResult = await executeStep(step, config, base44);
              executionResults[executionResults.length - 1] = {
                step_order: step.step_order,
                action_type: step.action_type,
                status: 'success',
                result: retryResult,
                retries: attempt
              };
              overallStatus = 'success';
              break;
            } catch (retryError) {
              // Continue to next retry
            }
          }
        }
        
        if (overallStatus === 'failed') break;
      }
    }

    const duration = (Date.now() - startTime) / 1000;

    // Update automation stats
    const newSuccessCount = overallStatus === 'success' ? (config.success_count || 0) + 1 : config.success_count || 0;
    const newFailureCount = overallStatus === 'failed' ? (config.failure_count || 0) + 1 : config.failure_count || 0;
    const newExecutionCount = (config.execution_count || 0) + 1;
    const newAvgDuration = ((config.average_duration_seconds || 0) * (config.execution_count || 0) + duration) / newExecutionCount;

    await base44.asServiceRole.entities.NetworkAutomation.update(automation_id, {
      last_execution_at: new Date().toISOString(),
      last_execution_status: overallStatus,
      execution_count: newExecutionCount,
      success_count: newSuccessCount,
      failure_count: newFailureCount,
      average_duration_seconds: newAvgDuration
    });

    // Send notifications if configured
    if (config.notifications) {
      if ((overallStatus === 'success' && config.notifications.on_success) ||
          (overallStatus === 'failed' && config.notifications.on_failure)) {
        if (config.notifications.email_recipients && config.notifications.email_recipients.length > 0) {
          for (const recipient of config.notifications.email_recipients) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: recipient,
              subject: `Network Automation ${overallStatus.toUpperCase()}: ${config.name}`,
              body: `
                <h2>Automation Execution Report</h2>
                <p><strong>Automation:</strong> ${config.name}</p>
                <p><strong>Status:</strong> ${overallStatus}</p>
                <p><strong>Duration:</strong> ${duration.toFixed(2)}s</p>
                <p><strong>Steps Executed:</strong> ${executionResults.length}</p>
                <h3>Results:</h3>
                <pre>${JSON.stringify(executionResults, null, 2)}</pre>
              `
            });
          }
        }
      }
    }

    return Response.json({
      status: overallStatus,
      duration_seconds: duration,
      steps_executed: executionResults.length,
      results: executionResults,
      automation_stats: {
        total_executions: newExecutionCount,
        success_rate: (newSuccessCount / newExecutionCount) * 100
      }
    });

  } catch (error) {
    console.error('Automation execution error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});

async function executeStep(step, automation, base44) {
  const { action_type, parameters } = step;

  switch (action_type) {
    case 'provision_node':
      return await provisionNode(parameters, base44);
    
    case 'deprovision_node':
      return await deprovisionNode(parameters, base44);
    
    case 'create_relationship':
      return await createRelationship(parameters, base44);
    
    case 'update_node_status':
      return await updateNodeStatus(parameters, base44);
    
    case 'send_alert':
      return await sendAlert(parameters, base44);
    
    case 'scale_resources':
      return await scaleResources(parameters, base44);
    
    case 'backup_configuration':
      return await backupConfiguration(parameters, base44);
    
    case 'run_diagnostic':
      return await runDiagnostic(parameters, base44);
    
    default:
      throw new Error(`Unknown action type: ${action_type}`);
  }
}

async function provisionNode(params, base44) {
  const node = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
    label: params.label,
    node_type: params.node_type,
    properties: {
      ...params.properties,
      provisioned_by: 'automation',
      provisioned_at: new Date().toISOString()
    },
    status: 'active'
  });
  return { node_id: node.id, action: 'provisioned' };
}

async function deprovisionNode(params, base44) {
  await base44.asServiceRole.entities.KnowledgeGraphNode.update(params.node_id, {
    status: 'deprovisioned',
    properties: {
      deprovisioned_at: new Date().toISOString(),
      deprovisioned_reason: params.reason
    }
  });
  return { node_id: params.node_id, action: 'deprovisioned' };
}

async function createRelationship(params, base44) {
  const rel = await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
    from_node_id: params.from_node_id,
    to_node_id: params.to_node_id,
    relationship_type: params.relationship_type,
    properties: params.properties || {}
  });
  return { relationship_id: rel.id, action: 'created' };
}

async function updateNodeStatus(params, base44) {
  await base44.asServiceRole.entities.KnowledgeGraphNode.update(params.node_id, {
    status: params.new_status,
    properties: {
      status_updated_at: new Date().toISOString(),
      status_reason: params.reason
    }
  });
  return { node_id: params.node_id, new_status: params.new_status };
}

async function sendAlert(params, base44) {
  await base44.asServiceRole.entities.Alert.create({
    title: params.title,
    message: params.message,
    severity: params.severity || 'medium',
    source: 'network_automation',
    status: 'active'
  });
  return { alert_sent: true };
}

async function scaleResources(params, base44) {
  // Simulate resource scaling
  return { 
    action: 'scaled',
    resource_type: params.resource_type,
    scale_factor: params.scale_factor
  };
}

async function backupConfiguration(params, base44) {
  // Simulate backup
  return {
    action: 'backed_up',
    nodes_backed_up: params.node_ids?.length || 0,
    backup_timestamp: new Date().toISOString()
  };
}

async function runDiagnostic(params, base44) {
  // Simulate diagnostic
  return {
    action: 'diagnostic_complete',
    checks_performed: params.checks || [],
    status: 'healthy'
  };
}