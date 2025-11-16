import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { node_id, suggestion_type = 'all' } = await req.json();

        // Carregar contexto do grafo
        const [nodes, relationships] = await Promise.all([
            base44.entities.KnowledgeGraphNode.list(),
            base44.entities.KnowledgeGraphRelationship.list()
        ]);

        let targetNode = null;
        if (node_id) {
            targetNode = nodes.find(n => n.id === node_id);
            if (!targetNode) {
                return Response.json({ error: 'Node not found' }, { status: 404 });
            }
        }

        // Construir contexto para LLM
        const graphContext = {
            total_nodes: nodes.length,
            total_relationships: relationships.length,
            node_types: [...new Set(nodes.map(n => n.node_type))],
            relationship_types: [...new Set(relationships.map(r => r.relationship_type))],
            selected_node: targetNode ? {
                id: targetNode.id,
                label: targetNode.label,
                type: targetNode.node_type,
                properties: targetNode.properties
            } : null
        };

        // Prompt para sugestões
        const prompt = targetNode
            ? `Analyze this Knowledge Graph node and suggest improvements:

Node: ${targetNode.label} (${targetNode.node_type})
Properties: ${JSON.stringify(targetNode.properties)}

Current graph has ${nodes.length} nodes and ${relationships.length} relationships.

Please suggest:
1. Missing relationships this node should have with other existing nodes
2. New nodes that should be created related to this node
3. Additional properties that would enrich this node's data
4. Potential data inconsistencies or duplicates

Provide structured suggestions with clear reasoning.`
            : `Analyze this Knowledge Graph and suggest improvements:

Graph Overview:
- Total Nodes: ${nodes.length}
- Total Relationships: ${relationships.length}
- Node Types: ${graphContext.node_types.join(', ')}
- Relationship Types: ${graphContext.relationship_types.join(', ')}

Please suggest:
1. Missing critical entities that should be added
2. Underutilized relationship types
3. Clusters or patterns that indicate missing connections
4. Data quality improvements

Provide actionable, prioritized suggestions.`;

        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    missing_relationships: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                from_node_label: { type: "string" },
                                to_node_label: { type: "string" },
                                relationship_type: { type: "string" },
                                confidence: { type: "number" },
                                reasoning: { type: "string" }
                            }
                        }
                    },
                    new_nodes: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                label: { type: "string" },
                                node_type: { type: "string" },
                                suggested_properties: { type: "object" },
                                importance: { type: "string" },
                                reasoning: { type: "string" }
                            }
                        }
                    },
                    property_enhancements: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                node_label: { type: "string" },
                                property_name: { type: "string" },
                                suggested_value: { type: "string" },
                                reasoning: { type: "string" }
                            }
                        }
                    },
                    data_quality_issues: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                issue_type: { type: "string" },
                                description: { type: "string" },
                                affected_nodes: { type: "array", items: { type: "string" } },
                                severity: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        return Response.json({
            success: true,
            suggestions: llmResponse,
            context: graphContext
        });

    } catch (error) {
        console.error('AI graph suggestions error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});