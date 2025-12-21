import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description, context } = await req.json();

    if (!description) {
      return Response.json({ error: 'Description is required' }, { status: 400 });
    }

    // Generate workflow using AI
    const workflow = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a workflow automation expert. Based on this description, generate a complete workflow definition.

User Description: ${description}
${context ? `Additional Context: ${context}` : ''}

Create a workflow with:
1. Clear name and description
2. Sequential steps with specific actions
3. Input/output definitions for each step
4. Conditional logic where appropriate
5. Error handling steps
6. Estimated execution time

Return JSON format:
{
  "name": "workflow name",
  "description": "what this workflow does",
  "category": "one of: data_processing, analysis, reporting, integration, communication, automation",
  "estimated_duration_minutes": number,
  "steps": [
    {
      "step_number": 1,
      "name": "step name",
      "action_type": "one of: fetch_data, transform_data, analyze, send_notification, create_entity, update_entity, call_function",
      "description": "what this step does",
      "inputs": ["input1", "input2"],
      "outputs": ["output1", "output2"],
      "config": {
        "entity_name": "if applicable",
        "function_name": "if applicable",
        "parameters": {}
      },
      "on_error": "continue/stop/retry"
    }
  ],
  "triggers": ["manual", "scheduled", "webhook", "entity_change"],
  "recommended_schedule": "cron expression if applicable",
  "required_permissions": ["permission1", "permission2"],
  "tags": ["tag1", "tag2"]
}`,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          estimated_duration_minutes: { type: "number" },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step_number: { type: "number" },
                name: { type: "string" },
                action_type: { type: "string" },
                description: { type: "string" },
                inputs: { type: "array", items: { type: "string" } },
                outputs: { type: "array", items: { type: "string" } },
                config: { type: "object" },
                on_error: { type: "string" }
              }
            }
          },
          triggers: { type: "array", items: { type: "string" } },
          recommended_schedule: { type: "string" },
          required_permissions: { type: "array", items: { type: "string" } },
          tags: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({
      success: true,
      workflow,
      message: 'Workflow generated successfully'
    });

  } catch (error) {
    console.error('Workflow generation error:', error);
    return Response.json({ 
      error: 'Failed to generate workflow',
      details: error.message 
    }, { status: 500 });
  }
});