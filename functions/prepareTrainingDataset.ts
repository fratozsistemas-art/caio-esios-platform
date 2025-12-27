import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedback_ids, manual_labels, dataset_type, name, description } = await req.json();

    if (!feedback_ids || feedback_ids.length === 0) {
      return Response.json({ error: 'No feedback data provided' }, { status: 400 });
    }

    // Fetch feedback data
    const feedbackData = await Promise.all(
      feedback_ids.map(id => base44.asServiceRole.entities.AIInsightFeedback.filter({ id }))
    );

    const flatFeedback = feedbackData.flat().filter(f => f);

    // Filter for quality - only include rated feedback
    const qualityFeedback = flatFeedback.filter(f => 
      (f.accuracy_rating && f.accuracy_rating > 0) || 
      (f.usefulness_rating && f.usefulness_rating > 0)
    );

    // Prepare training data based on type
    const trainingData = {
      samples: qualityFeedback.map(f => ({
        input: f.insight_data,
        labels: {
          accuracy: f.accuracy_rating || 0,
          usefulness: f.usefulness_rating || 0,
          is_helpful: f.was_helpful || false,
          is_false_positive: f.false_positive || false
        },
        metadata: f.context_metadata,
        comment: f.comment
      })),
      manual_labels: manual_labels || []
    };

    // Calculate quality score
    const avgAccuracy = qualityFeedback.reduce((sum, f) => sum + (f.accuracy_rating || 0), 0) / qualityFeedback.length;
    const qualityScore = Math.round((avgAccuracy / 5) * 100);

    // Create dataset
    const dataset = await base44.entities.AITrainingDataset.create({
      name: name || `Dataset ${new Date().toISOString().split('T')[0]}`,
      description: description || `Auto-generated from ${qualityFeedback.length} feedback items`,
      dataset_type,
      feedback_ids,
      manual_labels: manual_labels || [],
      training_data: trainingData,
      sample_count: qualityFeedback.length,
      quality_score: qualityScore,
      status: qualityFeedback.length >= 10 ? 'ready' : 'draft',
      created_by: user.email
    });

    return Response.json({ 
      success: true, 
      dataset,
      message: `Dataset created with ${qualityFeedback.length} samples (quality: ${qualityScore}%)`
    });

  } catch (error) {
    console.error("Error preparing dataset:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});