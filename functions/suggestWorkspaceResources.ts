import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * AI-powered resource suggestion for workspaces
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id } = await req.json();

    // Get workspace
    const workspace = await base44.entities.Workspace.get(workspace_id);
    
    if (!workspace) {
      return Response.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Get already linked resources
    const linkedResources = await base44.entities.WorkspaceResource.filter({
      workspace_id
    });
    const linkedIds = linkedResources.map(r => r.resource_id);

    // Fetch all available resources
    const [strategies, analyses, knowledgeItems] = await Promise.all([
      base44.entities.Strategy.list('-created_date', 50),
      base44.entities.Analysis.list('-created_date', 50),
      base44.entities.KnowledgeItem.list('-created_date', 50)
    ]);

    // Filter out already linked
    const availableStrategies = strategies.filter(s => !linkedIds.includes(s.id));
    const availableAnalyses = analyses.filter(a => !linkedIds.includes(a.id));
    const availableKnowledge = knowledgeItems.filter(k => !linkedIds.includes(k.id));

    // Build context for AI
    const workspaceContext = `
Workspace: ${workspace.name}
Description: ${workspace.description || 'N/A'}
Template Type: ${workspace.template_type}
Current Phase: ${workspace.current_phase}
Phases: ${workspace.phases?.map(p => p.name).join(', ') || 'N/A'}
Tags: ${workspace.tags?.join(', ') || 'N/A'}

Available Strategies (${availableStrategies.length}):
${availableStrategies.map(s => `- ${s.title} (${s.category}, Priority: ${s.priority})`).join('\n')}

Available Analyses (${availableAnalyses.length}):
${availableAnalyses.map(a => `- ${a.title} (${a.type}, Framework: ${a.framework_used})`).join('\n')}

Available Knowledge Items (${availableKnowledge.length}):
${availableKnowledge.map(k => `- ${k.title} (${k.type}, Framework: ${k.framework})`).join('\n')}
    `.trim();

    // Use AI to suggest relevant resources
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this workspace and suggest the TOP 5-10 most relevant resources to link.

${workspaceContext}

Return ONLY resources that are highly relevant to the workspace's goals, current phase, and template type.
For each suggestion, provide:
1. resource_id (the exact ID from the list above)
2. resource_type (strategy, analysis, or knowledge_item)
3. resource_title (exact title)
4. relevance_score (0-100)
5. relevance_reason (brief explanation why it's relevant)

Prioritize resources that:
- Match the workspace template and current phase
- Are high priority or recently created
- Use relevant frameworks
- Have tags that align with workspace needs`,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                resource_id: { type: "string" },
                resource_type: { 
                  type: "string",
                  enum: ["strategy", "analysis", "knowledge_item"]
                },
                resource_title: { type: "string" },
                relevance_score: { type: "number" },
                relevance_reason: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      suggestions: aiResponse.suggestions || [],
      workspace_context: {
        name: workspace.name,
        template_type: workspace.template_type,
        current_phase: workspace.current_phase
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});