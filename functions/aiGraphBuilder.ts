import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await req.json();

    if (!items || items.length === 0) {
      return Response.json({ error: 'No items provided' }, { status: 400 });
    }

    // Get existing graph for context
    const existingNodes = await base44.entities.KnowledgeGraphNode.list();
    const existingEntities = existingNodes.map(n => ({ label: n.label, type: n.node_type }));

    // AI analysis to extract entities and relationships
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze data from multiple sources and extract structured knowledge for a business intelligence graph.

Data items (${items.length} total):
${JSON.stringify(items.slice(0, 30), null, 2)}

Existing graph entities (for reference): ${existingEntities.slice(0, 50).map(e => `${e.label} (${e.type})`).join(', ')}

Extract:
1. ENTITIES: Companies, people, technologies, projects, topics mentioned
2. RELATIONSHIPS: How entities connect (e.g., "Person WORKS_AT Company", "Project USES Technology")
3. KEY THEMES: Main topics/patterns emerging from the data
4. PRIORITY: Which entities are most important based on frequency/context

Rules:
- Only create entities if they appear significant (mentioned multiple times or in important context)
- Prefer matching existing entities over creating duplicates
- Relationships must be specific and meaningful
- Include confidence scores`,
      response_json_schema: {
        type: "object",
        properties: {
          entities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                node_type: { 
                  type: "string",
                  enum: ["company", "person", "technology", "project", "topic", "document"]
                },
                properties: { type: "object" },
                confidence: { type: "number" },
                source_references: { type: "array", items: { type: "string" } }
              }
            }
          },
          relationships: {
            type: "array",
            items: {
              type: "object",
              properties: {
                from_label: { type: "string" },
                to_label: { type: "string" },
                relationship_type: { 
                  type: "string",
                  enum: ["WORKS_AT", "MANAGES", "USES", "RELATED_TO", "PART_OF", "CREATES", "DISCUSSES"]
                },
                properties: { type: "object" },
                confidence: { type: "number" }
              }
            }
          },
          themes: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Create nodes
    const createdNodes = [];
    const nodeMap = {};

    for (const entity of analysis.entities || []) {
      if (entity.confidence < 0.6) continue;

      // Check if entity already exists
      const existing = existingNodes.find(n => 
        n.label.toLowerCase() === entity.label.toLowerCase() &&
        n.node_type === entity.node_type
      );

      if (existing) {
        nodeMap[entity.label] = existing.id;
        continue;
      }

      try {
        const newNode = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
          node_type: entity.node_type,
          label: entity.label,
          properties: {
            ...entity.properties,
            confidence: entity.confidence,
            auto_generated: true,
            created_from_sources: items[0]?.source_type
          },
          metadata: {
            source_references: entity.source_references
          }
        });

        createdNodes.push(newNode);
        nodeMap[entity.label] = newNode.id;
      } catch (error) {
        console.error('Error creating node:', error);
      }
    }

    // Create relationships
    const createdRelationships = [];

    for (const rel of analysis.relationships || []) {
      if (rel.confidence < 0.7) continue;

      const fromId = nodeMap[rel.from_label];
      const toId = nodeMap[rel.to_label];

      if (!fromId || !toId) continue;

      try {
        const newRel = await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
          from_node_id: fromId,
          to_node_id: toId,
          relationship_type: rel.relationship_type,
          properties: {
            ...rel.properties,
            confidence: rel.confidence,
            auto_generated: true
          }
        });

        createdRelationships.push(newRel);
      } catch (error) {
        console.error('Error creating relationship:', error);
      }
    }

    return Response.json({
      success: true,
      results: {
        nodes_created: createdNodes.length,
        relationships_created: createdRelationships.length,
        themes_identified: analysis.themes?.length || 0,
        nodes: createdNodes,
        relationships: createdRelationships,
        themes: analysis.themes
      }
    });

  } catch (error) {
    console.error('AI graph builder error:', error);
    return Response.json({ 
      error: 'Failed to build graph',
      details: error.message
    }, { status: 500 });
  }
});