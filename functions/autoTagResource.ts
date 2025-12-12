import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * AI-powered auto-tagging for workspace resources
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id, resource_type, resource_id } = await req.json();

    // Get workspace
    const workspace = await base44.entities.Workspace.get(workspace_id);
    
    // Get resource
    let resource = null;
    try {
      if (resource_type === 'strategy') {
        resource = await base44.entities.Strategy.get(resource_id);
      } else if (resource_type === 'analysis') {
        resource = await base44.entities.Analysis.get(resource_id);
      } else if (resource_type === 'knowledge_item') {
        resource = await base44.entities.KnowledgeItem.get(resource_id);
      }
    } catch (e) {
      return Response.json({ error: 'Resource not found' }, { status: 404 });
    }

    if (!resource) {
      return Response.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Build context for AI
    const context = `
Workspace Context:
- Name: ${workspace.name}
- Description: ${workspace.description || 'N/A'}
- Template: ${workspace.template_type}
- Current Phase: ${workspace.current_phase}
- Workspace Tags: ${workspace.tags?.join(', ') || 'N/A'}

Resource to Tag:
- Type: ${resource_type}
- Title: ${resource.title || resource.name}
- Description: ${resource.description || resource.summary || 'N/A'}
${resource_type === 'strategy' ? `- Category: ${resource.category}` : ''}
${resource_type === 'analysis' ? `- Type: ${resource.type}` : ''}
${resource_type === 'knowledge_item' ? `- Framework: ${resource.framework}` : ''}
${resource.tags ? `- Existing Tags: ${resource.tags.join(', ')}` : ''}
    `.trim();

    // Use AI to generate tags
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this resource in the context of the workspace and generate 3-7 relevant tags.

${context}

Tags should be:
- Concise (1-2 words)
- Relevant to both the resource content and workspace context
- Useful for organization and search
- A mix of topics, frameworks, and functional areas
- Not duplicating existing tags unless highly relevant

Return tags as a JSON array of strings.`,
      response_json_schema: {
        type: "object",
        properties: {
          tags: {
            type: "array",
            items: { type: "string" }
          },
          reasoning: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      tags: aiResponse.tags || [],
      reasoning: aiResponse.reasoning
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});