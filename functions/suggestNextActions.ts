import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather user activity data
    const recentAnalyses = await base44.entities.Analysis.filter(
      { created_by: user.email },
      '-created_date',
      10
    );

    const recentConversations = await base44.agents.listConversations({
      agent_name: 'caio_agent'
    });

    const userStrategies = await base44.entities.Strategy.filter(
      { created_by: user.email },
      '-created_date',
      5
    );

    const recentWorkspaces = await base44.entities.Workspace.filter(
      { owner_email: user.email },
      '-created_date',
      3
    );

    // Build context for AI
    const analysisCategories = recentAnalyses.map(a => a.analysis_type || 'general');
    const strategyStatuses = userStrategies.map(s => s.status);
    const workspaceTypes = recentWorkspaces.map(w => w.template_type);

    const contextPrompt = `
    Analyze user behavior and suggest the next 3-5 best quick actions:
    
    User Activity:
    - Recent analyses: ${analysisCategories.join(', ')}
    - Strategy statuses: ${strategyStatuses.join(', ')}
    - Workspace types: ${workspaceTypes.join(', ')}
    - Recent conversation count: ${recentConversations.length}
    - Total analyses: ${recentAnalyses.length}
    
    Consider:
    - What logical next steps follow from recent analyses
    - Gaps in their workflow
    - Underutilized features
    - Strategic opportunities based on their focus areas
    
    Suggest actions that are:
    - Immediately actionable
    - High-value based on their patterns
    - Complementary to recent work
    - Not repetitive
    `;

    const suggestions = await base44.integrations.Core.InvokeLLM({
      prompt: contextPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          suggested_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                category: { type: "string" },
                reason: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] },
                estimated_impact: { type: "string" }
              }
            }
          },
          user_insights: {
            type: "object",
            properties: {
              focus_area: { type: "string" },
              workflow_stage: { type: "string" },
              recommendations: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      suggestions: suggestions.suggested_actions || [],
      insights: suggestions.user_insights || {},
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error suggesting next actions:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to generate action suggestions'
    }, { status: 500 });
  }
});