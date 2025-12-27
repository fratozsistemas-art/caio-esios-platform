import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return Response.json({ error: 'Only admins can initiate model training' }, { status: 403 });
    }

    const { dataset_id, model_type, hyperparameters } = await req.json();

    if (!dataset_id || !model_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch dataset
    const datasets = await base44.asServiceRole.entities.AITrainingDataset.filter({ id: dataset_id });
    const dataset = datasets[0];

    if (!dataset) {
      return Response.json({ error: 'Dataset not found' }, { status: 404 });
    }

    if (dataset.status !== 'ready') {
      return Response.json({ 
        error: 'Dataset must be in ready status. Current status: ' + dataset.status 
      }, { status: 400 });
    }

    // Create training job
    const trainingJob = await base44.entities.ModelTrainingJob.create({
      job_name: `${model_type}_${new Date().toISOString().split('T')[0]}`,
      model_type,
      dataset_id,
      status: 'queued',
      progress: 0,
      hyperparameters: hyperparameters || {
        learning_rate: 0.001,
        batch_size: 32,
        epochs: 50
      },
      started_at: new Date().toISOString(),
      initiated_by: user.email
    });

    // In a real implementation, this would trigger an actual ML training pipeline
    // For now, we'll simulate the training process
    setTimeout(async () => {
      try {
        // Update to running
        await base44.asServiceRole.entities.ModelTrainingJob.update(trainingJob.id, {
          status: 'running',
          progress: 25
        });

        // Simulate training completion
        setTimeout(async () => {
          const simulatedMetrics = {
            accuracy: 0.85 + Math.random() * 0.1,
            precision: 0.82 + Math.random() * 0.1,
            recall: 0.80 + Math.random() * 0.1,
            f1_score: 0.83 + Math.random() * 0.1
          };

          await base44.asServiceRole.entities.ModelTrainingJob.update(trainingJob.id, {
            status: 'completed',
            progress: 100,
            metrics: simulatedMetrics,
            completed_at: new Date().toISOString(),
            model_version: `v${Date.now()}`
          });
        }, 10000); // 10 seconds
      } catch (error) {
        console.error('Training simulation error:', error);
      }
    }, 2000);

    return Response.json({ 
      success: true, 
      training_job: trainingJob,
      message: 'Training job initiated successfully. This may take several minutes.'
    });

  } catch (error) {
    console.error("Error initiating training:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});