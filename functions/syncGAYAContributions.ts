import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * GAYA Collective Intelligence Sync
 * Sync contributions and generate synthesis
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysisId, contribution, action } = await req.json();

    if (action === 'contribute') {
      // Store contribution
      await base44.asServiceRole.entities.GAYAContribution.create({
        analysis_id: analysisId,
        user_email: user.email,
        persona: contribution.persona,
        content: contribution.content,
        votes_up: 0,
        votes_down: 0
      });

      return Response.json({ success: true });
    }

    if (action === 'synthesize') {
      // Get all contributions
      const contributions = await base44.asServiceRole.entities.GAYAContribution.filter({
        analysis_id: analysisId
      });

      // Generate collective synthesis
      const synthesis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these multi-stakeholder contributions and generate collective intelligence synthesis:

**Contributions:**
${contributions.map(c => `[${c.persona}] ${c.content}`).join('\n\n')}

**Generate:**
1. Consensus points (where stakeholders agree)
2. Divergent views (where stakeholders disagree)
3. Emerging insights (cross-functional connections)

Return structured synthesis.`,
        response_json_schema: {
          type: "object",
          properties: {
            consensusPoints: { type: "array", items: { type: "string" } },
            divergentViews: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  perspectives: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        persona: { type: "string" },
                        view: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            emergingInsights: { type: "array", items: { type: "string" } }
          }
        }
      });

      return Response.json({
        success: true,
        synthesis
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error syncing GAYA contributions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});