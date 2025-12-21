import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflowId } = await req.json();

    if (!workflowId) {
      return Response.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    // Fetch workflow
    const workflows = await base44.entities.AgentWorkflow.filter({ id: workflowId });
    if (!workflows || workflows.length === 0) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const workflow = workflows[0];

    // Analyze and optimize using AI
    const optimization = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this workflow and provide optimization recommendations.

Current Workflow:
${JSON.stringify(workflow, null, 2)}

Provide:
1. Efficiency improvements (reduce steps, parallelize operations)
2. Resource optimization (reduce API calls, cache data)
3. Error handling improvements
4. Performance bottlenecks
5. Suggested step reordering or combination
6. Estimated time savings

Return JSON:
{
  "current_efficiency_score": number (0-100),
  "optimized_efficiency_score": number (0-100),
  "improvements": [
    {
      "type": "efficiency/resource/error_handling/performance",
      "current_issue": "description",
      "recommendation": "how to fix",
      "impact": "high/medium/low",
      "estimated_time_saved": "percentage or minutes"
    }
  ],
  "optimized_steps": [optimized step array in same format as original],
  "summary": "overall optimization summary",
  "estimated_performance_gain": "percentage improvement"
}`,
      response_json_schema: {
        type: "object",
        properties: {
          current_efficiency_score: { type: "number" },
          optimized_efficiency_score: { type: "number" },
          improvements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                current_issue: { type: "string" },
                recommendation: { type: "string" },
                impact: { type: "string" },
                estimated_time_saved: { type: "string" }
              }
            }
          },
          optimized_steps: { type: "array" },
          summary: { type: "string" },
          estimated_performance_gain: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      workflow_id: workflowId,
      ...optimization
    });

  } catch (error) {
    console.error('Workflow optimization error:', error);
    return Response.json({ 
      error: 'Failed to optimize workflow',
      details: error.message 
    }, { status: 500 });
  }
});