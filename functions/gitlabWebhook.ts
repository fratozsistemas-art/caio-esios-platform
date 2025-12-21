import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Validate webhook token
    const webhookToken = req.headers.get('X-Gitlab-Token');
    const expectedToken = Deno.env.get('GITLAB_WEBHOOK_TOKEN');
    
    if (!expectedToken) {
      return Response.json({ 
        error: 'Webhook not configured',
        message: 'Set GITLAB_WEBHOOK_TOKEN in environment variables'
      }, { status: 500 });
    }
    
    if (webhookToken !== expectedToken) {
      return Response.json({ error: 'Invalid webhook token' }, { status: 401 });
    }

    const payload = await req.json();
    
    // Handle Pipeline Hook
    if (payload.object_kind === 'pipeline') {
      const pipeline = payload.object_attributes;
      const commit = payload.commit;
      const user = payload.user;
      
      // Determine environment from ref/branch
      let environment = null;
      if (pipeline.ref === 'main' || pipeline.ref === 'master') {
        environment = 'production';
      } else if (pipeline.ref === 'develop' || pipeline.ref === 'staging') {
        environment = 'staging';
      }
      
      // Only track deployment stages
      if (!environment) {
        return Response.json({ message: 'Not a deployment pipeline' });
      }
      
      // Map GitLab status to our status
      const statusMap = {
        'created': 'pending',
        'pending': 'pending',
        'running': 'running',
        'success': 'success',
        'failed': 'failed',
        'canceled': 'cancelled',
        'skipped': 'cancelled'
      };
      
      const status = statusMap[pipeline.status] || 'pending';
      
      // Calculate duration
      let durationSeconds = null;
      if (pipeline.duration) {
        durationSeconds = pipeline.duration;
      }
      
      // Check if deployment log already exists
      const existingLogs = await base44.asServiceRole.entities.DeploymentLog.filter({
        pipeline_id: String(pipeline.id)
      });
      
      const deploymentData = {
        pipeline_id: String(pipeline.id),
        commit_sha: commit?.id || pipeline.sha,
        commit_message: commit?.message || 'No message',
        branch: pipeline.ref,
        environment,
        status,
        deployed_by: user?.name || user?.username || 'Unknown',
        started_at: pipeline.created_at,
        finished_at: pipeline.finished_at || null,
        duration_seconds: durationSeconds,
        logs_url: `${payload.project.web_url}/-/pipelines/${pipeline.id}`,
        error_message: status === 'failed' ? 'Pipeline failed - check logs' : null
      };
      
      if (existingLogs.length > 0) {
        // Update existing
        await base44.asServiceRole.entities.DeploymentLog.update(
          existingLogs[0].id,
          deploymentData
        );
      } else {
        // Create new
        await base44.asServiceRole.entities.DeploymentLog.create(deploymentData);
      }
      
      return Response.json({ 
        message: 'Deployment logged successfully',
        environment,
        status
      });
    }
    
    // Handle Deployment Hook
    if (payload.object_kind === 'deployment') {
      const deployment = payload;
      const statusMap = {
        'created': 'pending',
        'running': 'running',
        'success': 'success',
        'failed': 'failed',
        'canceled': 'cancelled'
      };
      
      const status = statusMap[deployment.status] || 'pending';
      const environment = deployment.environment === 'production' ? 'production' : 'staging';
      
      const deploymentData = {
        pipeline_id: String(deployment.deployable_id || deployment.id),
        commit_sha: deployment.sha,
        commit_message: 'Deployment',
        branch: deployment.ref,
        environment,
        status,
        deployed_by: deployment.user?.name || 'System',
        started_at: deployment.created_at,
        finished_at: deployment.updated_at,
        logs_url: deployment.deployable_url || '#',
        error_message: null
      };
      
      await base44.asServiceRole.entities.DeploymentLog.create(deploymentData);
      
      return Response.json({ 
        message: 'Deployment logged successfully',
        environment,
        status
      });
    }
    
    return Response.json({ message: 'Webhook received but not processed' });
    
  } catch (error) {
    console.error('GitLab webhook error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});