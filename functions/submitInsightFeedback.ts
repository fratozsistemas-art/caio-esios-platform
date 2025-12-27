import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      insight_type, 
      insight_id, 
      accuracy_rating, 
      usefulness_rating, 
      comment,
      was_helpful,
      false_positive,
      insight_data,
      context_metadata
    } = await req.json();

    if (!insight_type || !insight_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if feedback already exists
    const existingFeedback = await base44.entities.AIInsightFeedback.filter({
      insight_id,
      user_email: user.email
    });

    let feedback;
    if (existingFeedback && existingFeedback.length > 0) {
      // Update existing feedback
      feedback = await base44.entities.AIInsightFeedback.update(existingFeedback[0].id, {
        accuracy_rating,
        usefulness_rating,
        comment,
        was_helpful,
        false_positive,
        insight_data,
        context_metadata
      });
    } else {
      // Create new feedback
      feedback = await base44.entities.AIInsightFeedback.create({
        insight_type,
        insight_id,
        accuracy_rating,
        usefulness_rating,
        comment,
        was_helpful,
        false_positive,
        user_email: user.email,
        insight_data,
        context_metadata
      });
    }

    return Response.json({ 
      success: true, 
      feedback,
      message: 'Thank you for your feedback! This helps improve our AI models.'
    });

  } catch (error) {
    console.error("Error submitting feedback:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});