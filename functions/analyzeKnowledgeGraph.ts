import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch graph data
    const nodes = await base44.entities.KnowledgeGraphNode.list();
    const relationships = await base44.entities.KnowledgeGraphRelationship.list();

    if (nodes.length === 0) {
      return Response.json({ 
        error: 'No graph data available for analysis' 
      }, { status: 400 });
    }

    // Calculate graph statistics
    const nodesByType = nodes.reduce((acc, node) => {
      acc[node.node_type] = (acc[node.node_type] || 0) + 1;
      return acc;
    }, {});

    const relsByType = relationships.reduce((acc, rel) => {
      acc[rel.relationship_type] = (acc[rel.relationship_type] || 0) + 1;
      return acc;
    }, {});

    // Calculate node connectivity
    const nodeConnections = {};
    relationships.forEach(rel => {
      nodeConnections[rel.from_node_id] = (nodeConnections[rel.from_node_id] || 0) + 1;
      nodeConnections[rel.to_node_id] = (nodeConnections[rel.to_node_id] || 0) + 1;
    });

    // Find highly connected nodes (hubs)
    const hubs = nodes
      .map(node => ({
        ...node,
        connections: nodeConnections[node.id] || 0
      }))
      .filter(node => node.connections > 0)
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 10);

    // Find isolated nodes (potential anomalies)
    const isolatedNodes = nodes.filter(node => !nodeConnections[node.id]);

    // Find densely connected clusters
    const clusters = {};
    nodes.forEach(node => {
      const industry = node.properties?.industry || 'unknown';
      if (!clusters[industry]) clusters[industry] = [];
      clusters[industry].push(node);
    });

    // Prepare context for AI analysis
    const graphContext = {
      summary: {
        total_nodes: nodes.length,
        total_relationships: relationships.length,
        node_types: nodesByType,
        relationship_types: relsByType,
        avg_connections: relationships.length > 0 ? (relationships.length * 2 / nodes.length).toFixed(2) : 0
      },
      key_entities: hubs.map(h => ({
        label: h.label,
        type: h.node_type,
        connections: h.connections,
        properties: h.properties
      })),
      anomalies: {
        isolated_nodes: isolatedNodes.length,
        isolated_examples: isolatedNodes.slice(0, 5).map(n => n.label)
      },
      clusters: Object.entries(clusters)
        .map(([industry, nodes]) => ({
          industry,
          count: nodes.length,
          entities: nodes.slice(0, 3).map(n => n.label)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };

    // Call AI for deep analysis
    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a strategic intelligence analyst examining a knowledge graph representing business entities, industries, and relationships.

Graph Context:
${JSON.stringify(graphContext, null, 2)}

Analyze this knowledge graph and provide:

1. KEY TRENDS: Identify 3-5 major patterns or trends in the data (e.g., industry concentrations, relationship patterns, emerging clusters)

2. STRATEGIC CONNECTIONS: Highlight 3-5 most strategically important connections or entities that could be leverage points

3. ANOMALIES: Point out 2-3 anomalies, outliers, or gaps that deserve attention

4. FUTURE IMPLICATIONS: Based on current patterns, what are 3-4 potential strategic implications or opportunities?

5. EXECUTIVE SUMMARY: Provide a 2-3 sentence high-level summary of what this graph reveals

Be specific, actionable, and strategic. Reference actual entities and numbers from the data.`,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          key_trends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                impact: { type: "string", enum: ["high", "medium", "low"] },
                entities: { type: "array", items: { type: "string" } }
              }
            }
          },
          strategic_connections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                strategic_value: { type: "string" },
                key_entities: { type: "array", items: { type: "string" } }
              }
            }
          },
          anomalies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                recommendation: { type: "string" },
                severity: { type: "string", enum: ["high", "medium", "low"] }
              }
            }
          },
          future_implications: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                timeframe: { type: "string" },
                action_items: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    // Identify highlighted nodes (entities mentioned in insights)
    const mentionedEntities = new Set();
    const analysis = aiAnalysis;
    
    ['key_trends', 'strategic_connections'].forEach(section => {
      analysis[section]?.forEach(item => {
        item.entities?.forEach(e => mentionedEntities.add(e));
        item.key_entities?.forEach(e => mentionedEntities.add(e));
      });
    });

    const highlightedNodeIds = nodes
      .filter(node => 
        mentionedEntities.has(node.label) || 
        (node.connections && node.connections > 5)
      )
      .map(node => node.id);

    return Response.json({
      success: true,
      analysis: {
        ...analysis,
        graph_stats: graphContext.summary,
        hubs: hubs.slice(0, 5),
        highlighted_nodes: highlightedNodeIds,
        analyzed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Knowledge graph analysis error:', error);
    return Response.json({ 
      error: 'Failed to analyze knowledge graph',
      details: error.message
    }, { status: 500 });
  }
});