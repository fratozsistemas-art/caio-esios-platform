import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather context: feedback, existing workflows, user patterns
    const [feedback, workflows, conversations] = await Promise.all([
      base44.entities.Feedback.list('-created_date', 50).catch(() => []),
      base44.asServiceRole.entities.AgentWorkflow.list('-created_date', 30).catch(() => []),
      base44.agents.listConversations({ agent_name: 'caio_agent' })
    ]);

    const feedbackSummary = feedback.map(f => ({
      type: f.feedback_type,
      comment: f.comment,
      rating: f.rating
    }));

    const workflowPatterns = workflows.map(w => ({
      name: w.workflow_name,
      category: w.category,
      steps: w.workflow_steps?.length || 0
    }));

    // Generate suggestions using AI
    const suggestions = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on user feedback and existing workflows, suggest 5-8 new workflow templates that would be valuable.

User Feedback Summary:
${JSON.stringify(feedbackSummary.slice(0, 20), null, 2)}

Existing Workflow Patterns:
${JSON.stringify(workflowPatterns, null, 2)}

Consider:
1. Common business processes (reporting, data sync, notifications)
2. Pain points mentioned in feedback
3. Integration opportunities
4. Automation potential

Return JSON:
{
  "templates": [
    {
      "name": "template name",
      "description": "what it does",
      "category": "data_processing/analysis/reporting/integration/communication/automation",
      "use_case": "when to use this",
      "estimated_value": "time saved or benefit",
      "complexity": "simple/moderate/complex",
      "required_integrations": ["integration1", "integration2"],
      "sample_steps": ["step 1", "step 2", "step 3"],
      "priority": "high/medium/low based on user needs"
    }
  ],
  "insights": "why these templates were suggested"
}`,
      response_json_schema: {
        type: "object",
        properties: {
          templates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                category: { type: "string" },
                use_case: { type: "string" },
                estimated_value: { type: "string" },
                complexity: { type: "string" },
                required_integrations: { type: "array", items: { type: "string" } },
                sample_steps: { type: "array", items: { type: "string" } },
                priority: { type: "string" }
              }
            }
          },
          insights: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      ...suggestions,
      based_on: {
        feedback_analyzed: feedbackSummary.length,
        workflows_analyzed: workflowPatterns.length
      }
    });

  } catch (error) {
    console.error('Template suggestion error:', error);
    return Response.json({ 
      error: 'Failed to suggest templates',
      details: error.message 
    }, { status: 500 });
  }
});