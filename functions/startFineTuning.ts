import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { dataset_id, agent_type, base_model = 'gpt-4o-mini' } = await req.json();

        // Get dataset
        const datasets = await base44.asServiceRole.entities.AgentTrainingDataset.filter({ id: dataset_id });
        if (!datasets || datasets.length === 0) {
            return Response.json({ error: 'Dataset not found' }, { status: 404 });
        }

        const dataset = datasets[0];

        // Create fine-tuned agent record
        const fineTunedAgent = await base44.asServiceRole.entities.FineTunedAgent.create({
            base_agent_type: agent_type,
            training_dataset_id: dataset_id,
            model_name: `${agent_type}-${Date.now()}`,
            base_model: base_model,
            status: 'queued',
            training_started_at: new Date().toISOString(),
            hyperparameters: {
                learning_rate: 0.0001,
                batch_size: 4,
                n_epochs: 3
            }
        });

        // Simulate fine-tuning process (in production, this would call OpenAI API)
        // For demo, we'll simulate with a delayed update
        setTimeout(async () => {
            try {
                await base44.asServiceRole.entities.FineTunedAgent.update(fineTunedAgent.id, {
                    status: 'training'
                });

                // Simulate training completion after 30 seconds
                setTimeout(async () => {
                    await base44.asServiceRole.entities.FineTunedAgent.update(fineTunedAgent.id, {
                        status: 'completed',
                        training_completed_at: new Date().toISOString(),
                        training_metrics: {
                            training_loss: 0.234,
                            validation_loss: 0.289,
                            accuracy: 0.94
                        },
                        performance_benchmarks: {
                            accuracy: 94,
                            precision: 92,
                            recall: 91,
                            f1_score: 91.5
                        }
                    });
                }, 30000);
            } catch (err) {
                console.error('Failed to update fine-tuning status:', err);
            }
        }, 1000);

        return Response.json({
            success: true,
            fine_tuned_agent_id: fineTunedAgent.id,
            message: 'Fine-tuning job started'
        });

    } catch (error) {
        console.error('Fine-tuning start error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});