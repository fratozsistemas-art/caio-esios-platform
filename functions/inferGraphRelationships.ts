import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { source_node_id, inference_depth = 'standard', use_external_data = true } = await req.json();

        // Carregar contexto do grafo
        const [nodes, relationships] = await Promise.all([
            base44.entities.KnowledgeGraphNode.list(),
            base44.entities.KnowledgeGraphRelationship.list()
        ]);

        const sourceNode = nodes.find(n => n.id === source_node_id);
        if (!sourceNode) {
            return Response.json({ error: 'Source node not found' }, { status: 404 });
        }

        // Encontrar nós relacionados diretamente
        const directRelationships = relationships.filter(
            r => r.from_node_id === source_node_id || r.to_node_id === source_node_id
        );

        const directlyConnectedIds = new Set();
        directRelationships.forEach(r => {
            directlyConnectedIds.add(r.from_node_id);
            directlyConnectedIds.add(r.to_node_id);
        });

        const directlyConnected = nodes.filter(n => directlyConnectedIds.has(n.id) && n.id !== source_node_id);

        // Encontrar nós de segundo grau (amigos de amigos)
        const secondDegreeIds = new Set();
        directlyConnectedIds.forEach(id => {
            relationships.forEach(r => {
                if (r.from_node_id === id) secondDegreeIds.add(r.to_node_id);
                if (r.to_node_id === id) secondDegreeIds.add(r.from_node_id);
            });
        });

        // Remover nós já conectados
        directlyConnectedIds.forEach(id => secondDegreeIds.delete(id));
        secondDegreeIds.delete(source_node_id);

        const secondDegreeNodes = nodes.filter(n => secondDegreeIds.has(n.id));

        // Construir prompt para inferência
        const prompt = `You are a Knowledge Graph relationship inference expert. Analyze the following entity and its network to identify missing relationships.

SOURCE ENTITY:
- Label: ${sourceNode.label}
- Type: ${sourceNode.node_type}
- Properties: ${JSON.stringify(sourceNode.properties)}

DIRECTLY CONNECTED ENTITIES (${directlyConnected.length}):
${directlyConnected.slice(0, 10).map(n => `- ${n.label} (${n.node_type})`).join('\n')}

SECOND-DEGREE ENTITIES (potential indirect connections - ${secondDegreeNodes.length}):
${secondDegreeNodes.slice(0, 15).map(n => `- ${n.label} (${n.node_type})`).join('\n')}

EXISTING RELATIONSHIPS:
${directRelationships.slice(0, 10).map(r => {
    const from = nodes.find(n => n.id === r.from_node_id);
    const to = nodes.find(n => n.id === r.to_node_id);
    return `- ${from?.label} → ${r.relationship_type} → ${to?.label}`;
}).join('\n')}

Task: Identify MISSING relationships that should logically exist based on:
1. Contextual patterns (e.g., if A works at B and B invested in C, A might be connected to C)
2. Industry patterns and common business relationships
3. Temporal patterns (entities created around same time might be related)
4. Property similarities suggesting connections
5. External knowledge about these entities

Focus on HIGH-CONFIDENCE inferences that are likely to be correct.
Provide reasoning for each inference.`;

        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: use_external_data,
            response_json_schema: {
                type: "object",
                properties: {
                    inferred_relationships: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                from_node_label: { type: "string" },
                                to_node_label: { type: "string" },
                                relationship_type: { type: "string" },
                                confidence: { type: "number" },
                                reasoning: { type: "string" },
                                inference_method: { 
                                    type: "string",
                                    enum: ["contextual", "industry_pattern", "temporal", "property_similarity", "external_knowledge", "transitive"]
                                },
                                supporting_evidence: {
                                    type: "array",
                                    items: { type: "string" }
                                }
                            }
                        }
                    },
                    indirect_patterns: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                pattern_type: { type: "string" },
                                description: { type: "string" },
                                entities_involved: {
                                    type: "array",
                                    items: { type: "string" }
                                }
                            }
                        }
                    },
                    network_insights: {
                        type: "object",
                        properties: {
                            centrality_analysis: { type: "string" },
                            clustering_coefficient: { type: "number" },
                            recommended_expansions: {
                                type: "array",
                                items: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        // Enriquecer com IDs reais dos nós
        const enrichedRelationships = llmResponse.inferred_relationships.map(rel => {
            const fromNode = nodes.find(n => 
                n.label.toLowerCase().includes(rel.from_node_label.toLowerCase()) ||
                rel.from_node_label.toLowerCase().includes(n.label.toLowerCase())
            );
            const toNode = nodes.find(n => 
                n.label.toLowerCase().includes(rel.to_node_label.toLowerCase()) ||
                rel.to_node_label.toLowerCase().includes(n.label.toLowerCase())
            );

            return {
                ...rel,
                from_node_id: fromNode?.id,
                to_node_id: toNode?.id,
                can_create: !!(fromNode && toNode)
            };
        });

        return Response.json({
            success: true,
            source_node: {
                id: sourceNode.id,
                label: sourceNode.label,
                type: sourceNode.node_type
            },
            inferred_relationships: enrichedRelationships,
            indirect_patterns: llmResponse.indirect_patterns,
            network_insights: llmResponse.network_insights,
            metadata: {
                total_nodes_analyzed: nodes.length,
                direct_connections: directlyConnected.length,
                second_degree_connections: secondDegreeNodes.length,
                inference_depth: inference_depth,
                used_external_data: use_external_data
            }
        });

    } catch (error) {
        console.error('Infer graph relationships error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});