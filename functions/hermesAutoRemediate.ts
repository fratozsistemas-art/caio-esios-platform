import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { analysis_id, entity_type, entity_id, issue_type, severity, issue_description, recommendation } = await req.json();

    let remediation_action = 'notify';
    const notified_users = [];

    // Get admin users
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    const adminEmails = admins.map(a => a.email);

    // Determine remediation action based on severity and entity type
    if (severity === 'critical') {
      if (entity_type === 'workflow_execution') {
        remediation_action = 'pause_workflow';
        
        const execution = await base44.asServiceRole.entities.WorkflowExecution.filter({ id: entity_id });
        if (execution[0] && execution[0].status === 'running') {
          await base44.asServiceRole.entities.WorkflowExecution.update(entity_id, {
            status: 'paused',
            error_message: `⚠️ Paused by Hermes due to critical issue: ${issue_type}`
          });
        }
      } else {
        remediation_action = 'escalate';
      }
      notified_users.push(...adminEmails);
    } else if (severity === 'high') {
      remediation_action = 'require_approval';
      notified_users.push(...adminEmails);
    }

    // Create support ticket
    const assignedTeam = determineAssignedTeam(issue_type, entity_type);
    
    const ticket = await base44.asServiceRole.entities.SupportTicket.create({
      title: `[Hermes ${severity.toUpperCase()}] ${issue_type} in ${entity_type}`,
      description: `${issue_description}\n\nRecommendation: ${recommendation}\n\nEntity: ${entity_type} (${entity_id})`,
      ticket_type: `hermes_${severity}`,
      priority: severity,
      assigned_team: assignedTeam,
      related_entity_type: entity_type,
      related_entity_id: entity_id,
      hermes_analysis_id: analysis_id,
      status: 'open'
    });

    // Generate configuration suggestions
    const configSuggestions = await generateConfigSuggestions(entity_type, entity_id, issue_type, recommendation, base44);

    // Send notifications
    for (const email of notified_users) {
      await base44.integrations.Core.SendEmail({
        to: email,
        from_name: 'Hermes Trust-Broker',
        subject: `[${severity.toUpperCase()}] Hermes Alert: ${issue_type}`,
        body: `Hermes detectou um problema ${severity} em ${entity_type}.\n\nProblema: ${issue_type}\n\nDescrição: ${issue_description}\n\nRecomendação: ${recommendation}\n\nAção Tomada: ${remediation_action}\n\nTicket Criado: #${ticket.id}\nTime Responsável: ${assignedTeam}\n\nSugestões de Configuração:\n${configSuggestions.map(s => `• ${s}`).join('\n')}\n\nAcesse: ${Deno.env.get('BASE_URL') || 'https://app.base44.com'}/HermesTrustBroker`
      });
    }

    // Create remediation record
    const remediation = await base44.asServiceRole.entities.HermesRemediation.create({
      analysis_id,
      entity_type,
      entity_id,
      issue_type,
      severity,
      remediation_action,
      action_taken_at: new Date().toISOString(),
      notified_users,
      auto_applied: severity === 'critical'
    });

    // Create notification in system
    await base44.asServiceRole.entities.Notification.create({
      title: `🛡️ Hermes: ${issue_type}`,
      message: `${issue_description}\n\nTicket #${ticket.id} criado para ${assignedTeam}`,
      type: 'alert',
      severity: severity,
      data_snapshot: {
        entity_type,
        entity_id,
        ticket_id: ticket.id,
        remediation_id: remediation.id,
        config_suggestions: configSuggestions
      },
      action_required: true,
      action_url: `/HermesTrustBroker`
    });

    return Response.json({ 
      success: true, 
      action: remediation_action,
      ticket_id: ticket.id,
      remediation_id: remediation.id,
      config_suggestions: configSuggestions
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function determineAssignedTeam(issueType, entityType) {
  const teamMapping = {
    'data_quality': ['data_contradiction', 'missing_context', 'silo_detected'],
    'ai_ops': ['llm_hallucination', 'agent_error', 'workflow_failure'],
    'governance': ['board_management_gap', 'compliance_issue', 'policy_violation'],
    'engineering': ['technical_debt', 'performance_issue', 'integration_error']
  };

  for (const [team, types] of Object.entries(teamMapping)) {
    if (types.some(t => issueType.toLowerCase().includes(t))) {
      return team;
    }
  }

  return 'unassigned';
}

async function generateConfigSuggestions(entityType, entityId, issueType, recommendation, base44) {
  const suggestions = [];

  if (entityType === 'workflow_execution') {
    suggestions.push('Consider adding validation step before critical operations');
    suggestions.push('Increase timeout threshold for complex operations');
    suggestions.push('Enable fallback strategies for this workflow');
  }

  if (entityType === 'workflow' || entityType === 'agent_workflow') {
    suggestions.push('Add Hermes auto-trigger rule for this workflow');
    suggestions.push('Configure pre-execution validation checks');
    suggestions.push('Implement circuit breaker pattern for failing steps');
  }

  if (issueType.includes('data') || issueType.includes('silo')) {
    suggestions.push('Enable cross-source data validation');
    suggestions.push('Implement data lineage tracking');
  }

  if (issueType.includes('sentiment') || issueType.includes('conversation')) {
    suggestions.push('Add sentiment monitoring alerts');
    suggestions.push('Configure automatic escalation on negative sentiment');
  }

  suggestions.push(recommendation);

  return suggestions;
}