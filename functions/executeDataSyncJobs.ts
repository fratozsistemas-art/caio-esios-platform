import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Service role for scheduled execution
    const jobs = await base44.asServiceRole.entities.DataSyncJob.filter({
      is_active: true
    });

    if (jobs.length === 0) {
      return Response.json({ 
        message: 'No active sync jobs found',
        executed: 0 
      });
    }

    const now = new Date();
    const results = [];

    for (const job of jobs) {
      // Check if job should run
      const shouldRun = !job.next_run_at || new Date(job.next_run_at) <= now;
      
      if (!shouldRun) {
        continue;
      }

      const startTime = Date.now();
      let status = 'success';
      let errorMessage = null;
      let syncResult = null;

      // Update job status to running
      await base44.asServiceRole.entities.DataSyncJob.update(job.id, {
        last_status: 'running'
      });

      try {
        // Execute sync
        syncResult = await base44.asServiceRole.functions.invoke('syncExternalDataToGraph', {
          sourceId: job.data_source_id
        });

        if (syncResult.data.error) {
          throw new Error(syncResult.data.error);
        }

        status = 'success';
      } catch (error) {
        status = 'failed';
        errorMessage = error.message;

        // Send notification if configured
        if (job.config?.notify_on_failure && job.config?.notification_emails?.length > 0) {
          for (const email of job.config.notification_emails) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: email,
              subject: `Data Sync Job Failed: ${job.name}`,
              body: `Job: ${job.name}\nError: ${errorMessage}\nTime: ${new Date().toISOString()}`
            });
          }
        }
      }

      const duration = Date.now() - startTime;

      // Calculate next run time
      const nextRun = calculateNextRun(now, job.schedule_frequency, job.schedule_time);

      // Update execution logs (keep last 50)
      const existingLogs = job.execution_logs || [];
      const newLog = {
        timestamp: now.toISOString(),
        status,
        duration_ms: duration,
        nodes_created: syncResult?.data?.nodes_created || 0,
        relationships_created: syncResult?.data?.relationships_created || 0,
        error_message: errorMessage
      };
      const updatedLogs = [newLog, ...existingLogs].slice(0, 50);

      // Update job
      await base44.asServiceRole.entities.DataSyncJob.update(job.id, {
        last_run_at: now.toISOString(),
        next_run_at: nextRun.toISOString(),
        last_status: status,
        last_error: errorMessage,
        execution_count: (job.execution_count || 0) + 1,
        success_count: (job.success_count || 0) + (status === 'success' ? 1 : 0),
        failure_count: (job.failure_count || 0) + (status === 'failed' ? 1 : 0),
        execution_logs: updatedLogs
      });

      results.push({
        job_id: job.id,
        job_name: job.name,
        status,
        duration_ms: duration,
        error: errorMessage,
        next_run: nextRun.toISOString()
      });
    }

    return Response.json({
      success: true,
      executed: results.length,
      results,
      timestamp: now.toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateNextRun(currentDate, frequency, scheduleTime) {
  const next = new Date(currentDate);
  
  // Parse schedule time if provided (HH:MM format)
  let targetHour = 0;
  let targetMinute = 0;
  if (scheduleTime) {
    const [hour, minute] = scheduleTime.split(':').map(Number);
    targetHour = hour;
    targetMinute = minute;
  }

  switch (frequency) {
    case 'hourly':
      next.setHours(next.getHours() + 1);
      break;
    case 'daily':
      next.setDate(next.getDate() + 1);
      next.setHours(targetHour, targetMinute, 0, 0);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      next.setHours(targetHour, targetMinute, 0, 0);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      next.setHours(targetHour, targetMinute, 0, 0);
      break;
    default:
      next.setDate(next.getDate() + 1);
      next.setHours(targetHour, targetMinute, 0, 0);
  }

  return next;
}