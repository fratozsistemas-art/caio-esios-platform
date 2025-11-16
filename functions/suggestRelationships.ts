import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * AI-powered relationship suggestion between companies and people
 * Analyzes existing data to discover non-obvious connections
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            entity_id, 
            entity_type = 'company',
            max_suggestions = 10,
            confidence_threshold = 60
        } = await req.json();

        if (!entity_id) {
            return Response.json({ error: 'entity_id is required' }, { status: 400 });
        }

        // Get the target entity
        let targetEntity;
        if (entity_type === 'company') {
            const companies = await base44.entities.GraphCompany.filter({ id: entity_id });
            targetEntity = companies[0];
        } else {
            const executives = await base44.entities.GraphExecutive.filter({ id: entity_id });
            targetEntity = executives[0];
        }

        if (!targetEntity) {
            return Response.json({ error: 'Entity not found' }, { status: 404 });
        }

        // Get existing relationships
        const existingRelationships = await base44.entities.KnowledgeGraphRelationship.filter({
            $or: [
                { from_node_id: entity_id },
                { to_node_id: entity_id }
            ]
        });

        const existingConnectionIds = new Set(
            existingRelationships.map(r => 
                r.from_node_id === entity_id ? r.to_node_id : r.from_node_id
            )
        );

        // Get all potential candidates
        let candidates = [];
        if (entity_type === 'company') {
            candidates = await base44.entities.GraphCompany.list();
        } else {
            candidates = await base44.entities.GraphExecutive.list();
        }

        // Filter out self and existing connections
        candidates = candidates.filter(c => 
            c.id !== entity_id && !existingConnectionIds.has(c.id)
        );

        // Use AI to analyze and suggest relationships
        const suggestions = await analyzeRelationships(
            targetEntity,
            candidates.slice(0, 50), // Limit for performance
            entity_type,
            base44
        );

        // Filter by confidence threshold
        const qualifiedSuggestions = suggestions
            .filter(s => s.confidence >= confidence_threshold)
            .slice(0, max_suggestions);

        return Response.json({
            success: true,
            target_entity: {
                id: targetEntity.id,
                name: targetEntity.name || targetEntity.current_company,
                type: entity_type
            },
            suggestions: qualifiedSuggestions,
            total_analyzed: candidates.length
        });

    } catch (error) {
        console.error('Relationship suggestion error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

async function analyzeRelationships(target, candidates, entityType, base44) {
    const prompt = `Analyze potential relationships for network intelligence.

TARGET ${entityType.toUpperCase()}: ${JSON.stringify(target, null, 2)}

CANDIDATES (${candidates.length}):
${candidates.map((c, i) => `${i + 1}. ${JSON.stringify(c, null, 2)}`).join('\n')}

Identify likely relationships based on:
- Industry overlap
- Geographic proximity
- Executive connections
- Business model similarities
- Supply chain indicators
- Investment patterns
- Board interlocks

Return top suggestions with confidence scores:
[
  {
    "candidate_id": "entity_id",
    "candidate_name": "Name",
    "relationship_type": "COMPETITOR" | "SUPPLIER" | "CUSTOMER" | "PARTNER" | "INVESTOR" | "BOARD_INTERLOCK" | "EXECUTIVE_CONNECTION",
    "confidence": 85,
    "reasoning": "Brief explanation of the connection",
    "evidence": ["evidence point 1", "evidence point 2"],
    "strength": "weak" | "moderate" | "strong"
  }
]

Focus on high-confidence, actionable relationships.`;

    try {
        const suggestions = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: false,
            response_json_schema: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        candidate_id: { type: "string" },
                        candidate_name: { type: "string" },
                        relationship_type: { type: "string" },
                        confidence: { type: "number" },
                        reasoning: { type: "string" },
                        evidence: { type: "array", items: { type: "string" } },
                        strength: { type: "string" }
                    }
                }
            }
        });

        return suggestions || [];
    } catch (error) {
        console.error('AI analysis error:', error);
        return [];
    }
}