import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather workflow execution patterns, feedback, and user activities
    const [workflows, executions, feedback, conversations, strategies] = await Promise.all([
      base44.asServiceRole.entities.AgentWorkflow.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.WorkflowExecution.list('-created_date', 200).catch(() => []),
      base44.entities.Feedback.list('-created_date', 100).catch(() => []),
      base44.agents.listConversations({ agent_name: 'caio_agent' }),
      base44.entities.Strategy.list('-created_date', 50).catch(() => [])
    ]);

    // Analyze patterns
    const patterns = {
      repetitive_tasks: executions.filter(e => {
        const duplicates = executions.filter(ex => 
          ex.workflow_name === e.workflow_name && 
          new Date(ex.created_date).toDateString() === new Date(e.created_date).toDateString()
        );
        return duplicates.length > 3;
      }),
      manual_workflows: workflows.filter(w => w.triggers?.includes('manual')),
      failed_executions: executions.filter(e => e.status === 'failed'),
      user_pain_points: feedback.filter(f => 
        f.feedback_type === 'feature_request' || 
        f.sentiment === 'negative'
      )
    };

    // Generate AI suggestions
    const opportunities = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze these workflow patterns and identify automation opportunities.

Workflow Patterns:
- ${patterns.repetitive_tasks.length} repetitive tasks detected
- ${patterns.manual_workflows.length} manual workflows
- ${patterns.failed_executions.length} failed executions
- ${patterns.user_pain_points.length} user pain points

Recent Feedback:
${patterns.user_pain_points.slice(0, 10).map(f => `- ${f.comment}`).join('\n')}

Workflow Execution Patterns:
${executions.slice(0, 20).map(e => `${e.workflow_name}: ${e.status} (${e.duration_ms}ms)`).join('\n')}

Identify:
1. Repetitive manual tasks that could be automated
2. Workflow steps that frequently fail (need optimization)
3. Missing integrations based on user requests
4. Scheduling opportunities for recurring tasks
5. Data sync opportunities between systems
6. Report generation that could be automated

Return JSON:
{
  "opportunities": [
    {
      "title": "opportunity name",
      "description": "what can be automated",
      "category": "task_automation/scheduling/integration/reporting/data_sync/error_reduction",
      "priority": "high/medium/low",
      "estimated_impact": "time saved or efficiency gain",
      "current_pain_point": "what problem it solves",
      "implementation_complexity": "simple/moderate/complex",
      "suggested_workflow": {
        "name": "proposed workflow name",
        "steps": ["step 1", "step 2", "step 3"],
        "triggers": ["when to run"],
        "estimated_setup_time": "time to implement"
      },
      "evidence": "data supporting this opportunity",
      "confidence_score": number (0-100)
    }
  ],
  "summary": "overall automation potential summary",
  "total_estimated_time_savings": "hours per week/month"
}`,
      response_json_schema: {
        type: "object",
        properties: {
          opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                category: { type: "string" },
                priority: { type: "string" },
                estimated_impact: { type: "string" },
                current_pain_point: { type: "string" },
                implementation_complexity: { type: "string" },
                suggested_workflow: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    steps: { type: "array", items: { type: "string" } },
                    triggers: { type: "array", items: { type: "string" } },
                    estimated_setup_time: { type: "string" }
                  }
                },
                evidence: { type: "string" },
                confidence_score: { type: "number" }
              }
            }
          },
          summary: { type: "string" },
          total_estimated_time_savings: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      ...opportunities,
      analyzed_data: {
        workflows: workflows.length,
        executions: executions.length,
        feedback_items: feedback.length,
        patterns_detected: Object.keys(patterns).length
      }
    });

  } catch (error) {
    console.error('Automation opportunity detection error:', error);
    return Response.json({ 
      error: 'Failed to identify opportunities',
      details: error.message 
    }, { status: 500 });
  }
});