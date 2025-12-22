import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      suggestion_id, 
      suggestion_type, 
      feedback_type, 
      rating, 
      comment,
      metadata 
    } = await req.json();

    if (!suggestion_id || !feedback_type) {
      return Response.json({ 
        error: 'suggestion_id and feedback_type are required' 
      }, { status: 400 });
    }

    // Store feedback
    const feedbackRecord = await base44.entities.AgentFeedback.create({
      agent_name: 'workflow_ai',
      feedback_type: feedback_type, // 'workflow_suggestion', 'optimization', 'template'
      context: {
        suggestion_id,
        suggestion_type,
        user_email: user.email
      },
      rating: rating || null,
      comment: comment || null,
      metadata: metadata || {},
      sentiment: rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral'
    });

    // Analyze feedback patterns to improve future suggestions
    const allFeedback = await base44.entities.AgentFeedback.filter({
      agent_name: 'workflow_ai',
      feedback_type: suggestion_type
    });

    const learnings = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze user feedback on AI workflow suggestions to improve future recommendations.

Recent Feedback:
${allFeedback.slice(0, 50).map(f => `
Rating: ${f.rating}/5
Type: ${f.context?.suggestion_type}
Comment: ${f.comment}
Sentiment: ${f.sentiment}
`).join('\n')}

Identify:
1. What types of suggestions users like most
2. Common reasons for rejection
3. Patterns in successful vs unsuccessful suggestions
4. How to improve suggestion quality
5. Specific preferences by category

Return JSON:
{
  "positive_patterns": ["pattern 1", "pattern 2"],
  "negative_patterns": ["pattern 1", "pattern 2"],
  "preference_insights": {
    "preferred_categories": ["category 1", "category 2"],
    "preferred_complexity": "simple/moderate/complex",
    "valued_features": ["feature 1", "feature 2"]
  },
  "improvement_recommendations": ["recommendation 1", "recommendation 2"],
  "confidence_adjustments": {
    "increase_confidence_for": ["pattern type 1"],
    "decrease_confidence_for": ["pattern type 2"]
  }
}`,
      response_json_schema: {
        type: "object",
        properties: {
          positive_patterns: { type: "array", items: { type: "string" } },
          negative_patterns: { type: "array", items: { type: "string" } },
          preference_insights: {
            type: "object",
            properties: {
              preferred_categories: { type: "array", items: { type: "string" } },
              preferred_complexity: { type: "string" },
              valued_features: { type: "array", items: { type: "string" } }
            }
          },
          improvement_recommendations: { type: "array", items: { type: "string" } },
          confidence_adjustments: {
            type: "object",
            properties: {
              increase_confidence_for: { type: "array", items: { type: "string" } },
              decrease_confidence_for: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    });

    // Store learning insights for future use
    await base44.asServiceRole.entities.AgentMemory.create({
      agent_name: 'workflow_ai',
      memory_type: 'learning',
      content: JSON.stringify(learnings),
      metadata: {
        feedback_analyzed: allFeedback.length,
        generated_at: new Date().toISOString()
      }
    });

    return Response.json({
      success: true,
      feedback_id: feedbackRecord.id,
      learnings,
      message: 'Feedback recorded and analyzed'
    });

  } catch (error) {
    console.error('Feedback learning error:', error);
    return Response.json({ 
      error: 'Failed to process feedback',
      details: error.message 
    }, { status: 500 });
  }
});