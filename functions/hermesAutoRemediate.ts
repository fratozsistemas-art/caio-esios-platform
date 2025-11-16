import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { analysis_id, entity_type, entity_id, issue_type, severity } = await req.json();

    let remediation_action = 'notify';
    const notified_users = [user.email];

    if (severity === 'critical') {
      if (entity_type === 'workflow_execution') {
        remediation_action = 'pause_workflow';
        const execution = await base44.entities.WorkflowExecution.filter({ id: entity_id });
        if (execution[0] && execution[0].status === 'running') {
          await base44.asServiceRole.entities.WorkflowExecution.update(entity_id, {
            status: 'paused',
            error_message: `Paused by Hermes due to critical issue: ${issue_type}`
          });
        }
      } else {
        remediation_action = 'escalate';
        const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
        notified_users.push(...admins.map(a => a.email));
      }
    }

    for (const email of notified_users) {
      await base44.integrations.Core.SendEmail({
        to: email,
        from_name: 'Hermes Trust-Broker',
        subject: `[${severity.toUpperCase()}] Cognitive Issue Detected`,
        body: `Hermes detected a ${severity} issue in ${entity_type} (${entity_id}).\n\nIssue: ${issue_type}\nAction Taken: ${remediation_action}\n\nView details at: ${Deno.env.get('BASE_URL') || 'https://app.base44.com'}/HermesTrustBroker`
      });
    }

    await base44.entities.HermesRemediation.create({
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

    return Response.json({ success: true, action: remediation_action });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});