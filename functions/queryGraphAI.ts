import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query, conversation_history = [] } = await req.json();

        if (!query) {
            return Response.json({ error: 'query is required' }, { status: 400 });
        }

        // Carregar todo o contexto do grafo
        const [nodes, relationships, companies, executives] = await Promise.all([
            base44.entities.KnowledgeGraphNode.list(),
            base44.entities.KnowledgeGraphRelationship.list(),
            base44.entities.GraphCompany.list(),
            base44.entities.GraphExecutive.list()
        ]);

        // Construir contexto estruturado do grafo
        const graphContext = {
            total_nodes: nodes.length,
            total_relationships: relationships.length,
            node_types: [...new Set(nodes.map(n => n.node_type))],
            relationship_types: [...new Set(relationships.map(r => r.relationship_type))],
            sample_nodes: nodes.slice(0, 20).map(n => ({
                label: n.label,
                type: n.node_type,
                properties: n.properties
            })),
            sample_relationships: relationships.slice(0, 20).map(r => {
                const from = nodes.find(n => n.id === r.from_node_id);
                const to = nodes.find(n => n.id === r.to_node_id);
                return {
                    from: from?.label,
                    type: r.relationship_type,
                    to: to?.label,
                    properties: r.properties
                };
            }),
            companies_summary: {
                total: companies.length,
                by_industry: companies.reduce((acc, c) => {
                    acc[c.industry] = (acc[c.industry] || 0) + 1;
                    return acc;
                }, {})
            },
            executives_summary: {
                total: executives.length,
                top_roles: executives.slice(0, 10).map(e => ({ name: e.name, title: e.title }))
            }
        };

        // Histórico de conversação para contexto
        const conversationContext = conversation_history.length > 0
            ? `\n\nPrevious conversation:\n${conversation_history.map(m => `${m.role}: ${m.content}`).join('\n')}`
            : '';

        // Prompt para o assistente
        const prompt = `You are an expert Knowledge Graph AI Assistant. You have access to a comprehensive knowledge graph containing entities, relationships, companies, and executives.

KNOWLEDGE GRAPH CONTEXT:
${JSON.stringify(graphContext, null, 2)}
${conversationContext}

USER QUERY: ${query}

Instructions:
1. Analyze the query to understand what information the user needs
2. Use the knowledge graph data to provide accurate, insightful answers
3. If the query asks about relationships, explain the connections
4. If the query asks about patterns, identify and explain them
5. Provide specific examples from the graph when relevant
6. If information is not available in the graph, clearly state that
7. Suggest related queries or explorations when appropriate

Provide a comprehensive, structured response.`;

        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: false, // Usar apenas dados do grafo
            response_json_schema: {
                type: "object",
                properties: {
                    answer: { type: "string" },
                    relevant_entities: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                label: { type: "string" },
                                type: { type: "string" },
                                relevance: { type: "string" }
                            }
                        }
                    },
                    relevant_relationships: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                from: { type: "string" },
                                type: { type: "string" },
                                to: { type: "string" }
                            }
                        }
                    },
                    insights: {
                        type: "array",
                        items: { type: "string" }
                    },
                    suggested_queries: {
                        type: "array",
                        items: { type: "string" }
                    },
                    confidence: { type: "number" }
                }
            }
        });

        // Enriquecer entidades relevantes com IDs
        const enrichedEntities = llmResponse.relevant_entities?.map(entity => {
            const node = nodes.find(n => 
                n.label.toLowerCase().includes(entity.label.toLowerCase()) ||
                entity.label.toLowerCase().includes(n.label.toLowerCase())
            );
            return {
                ...entity,
                node_id: node?.id,
                full_data: node
            };
        }) || [];

        return Response.json({
            success: true,
            query: query,
            response: llmResponse.answer,
            relevant_entities: enrichedEntities,
            relevant_relationships: llmResponse.relevant_relationships || [],
            insights: llmResponse.insights || [],
            suggested_queries: llmResponse.suggested_queries || [],
            confidence: llmResponse.confidence || 0.8,
            metadata: {
                graph_size: nodes.length,
                query_timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Query graph AI error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});