import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const now = new Date();
    const schedules = await base44.asServiceRole.entities.WorkflowSchedule.filter({
      is_active: true
    });

    const dueSchedules = schedules.filter(s => new Date(s.next_run_at) <= now);

    const results = [];

    for (const schedule of dueSchedules) {
      try {
        const execution = await base44.functions.invoke('executeHierarchicalWorkflow', {
          workflow_id: schedule.workflow_id,
          inputs: schedule.inputs
        });

        await base44.asServiceRole.entities.WorkflowSchedule.update(schedule.id, {
          last_run_at: now.toISOString(),
          next_run_at: calculateNextRun(schedule.frequency).toISOString(),
          run_count: (schedule.run_count || 0) + 1,
          success_count: (schedule.success_count || 0) + 1
        });

        results.push({ schedule_id: schedule.id, status: 'success' });
      } catch (error) {
        await base44.asServiceRole.entities.WorkflowSchedule.update(schedule.id, {
          run_count: (schedule.run_count || 0) + 1
        });

        if (schedule.notification_on_failure) {
          for (const email of schedule.notification_emails || []) {
            await base44.integrations.Core.SendEmail({
              to: email,
              from_name: 'CAIO Scheduler',
              subject: `Workflow Schedule Failed: ${schedule.name}`,
              body: `The scheduled workflow "${schedule.name}" failed to execute.\n\nError: ${error.message}`
            });
          }
        }

        results.push({ schedule_id: schedule.id, status: 'failed', error: error.message });
      }
    }

    return Response.json({ success: true, executed: results.length, results });
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