import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { workflow_id, name, schedule_type, frequency, inputs, notification_emails } = await req.json();

    const nextRun = calculateNextRun(frequency);

    const schedule = await base44.entities.WorkflowSchedule.create({
      workflow_id,
      name,
      schedule_type,
      frequency,
      next_run_at: nextRun.toISOString(),
      inputs: inputs || {},
      notification_emails: notification_emails || [user.email],
      is_active: true
    });

    return Response.json({ success: true, schedule });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateNextRun(frequency) {
  const now = new Date();
  switch (frequency) {
    case 'hourly': return new Date(now.getTime() + 60 * 60 * 1000);
    case 'daily': return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly': return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}