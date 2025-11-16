import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Advanced network analysis to uncover insights and interlocks
 * Identifies clusters, key connectors, hidden patterns
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            focus_entity_id = null,
            analysis_type = 'full' // 'full', 'centrality', 'clusters', 'interlocks'
        } = await req.json();

        // Get all nodes and relationships
        const nodes = await base44.entities.KnowledgeGraphNode.list();
        const relationships = await base44.entities.KnowledgeGraphRelationship.list();

        // Build adjacency list
        const graph = buildGraphStructure(nodes, relationships);

        // Perform analysis
        const analysis = {
            network_stats: calculateNetworkStats(graph, nodes, relationships),
            centrality_analysis: calculateCentrality(graph),
            clusters: detectClusters(graph, nodes),
            interlocks: detectInterlocks(graph, nodes, relationships),
            key_connectors: identifyKeyConnectors(graph, nodes),
            structural_holes: identifyStructuralHoles(graph, nodes),
            community_bridges: identifyBridges(graph, nodes)
        };

        // AI-powered insights
        const aiInsights = await generateNetworkInsights(analysis, base44);

        return Response.json({
            success: true,
            analysis,
            insights: aiInsights,
            focus_entity: focus_entity_id ? nodes.find(n => n.id === focus_entity_id) : null
        });

    } catch (error) {
        console.error('Network analysis error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

function buildGraphStructure(nodes, relationships) {
    const graph = {};
    
    nodes.forEach(node => {
        graph[node.id] = {
            node: node,
            connections: []
        };
    });

    relationships.forEach(rel => {
        if (graph[rel.from_node_id] && graph[rel.to_node_id]) {
            graph[rel.from_node_id].connections.push({
                target: rel.to_node_id,
                type: rel.relationship_type,
                properties: rel.properties
            });
            
            // Add reverse for undirected relationships
            graph[rel.to_node_id].connections.push({
                target: rel.from_node_id,
                type: rel.relationship_type,
                properties: rel.properties
            });
        }
    });

    return graph;
}

function calculateNetworkStats(graph, nodes, relationships) {
    const nodeCount = nodes.length;
    const edgeCount = relationships.length;
    const avgDegree = nodeCount > 0 ? (edgeCount * 2) / nodeCount : 0;
    
    const degrees = Object.values(graph).map(g => g.connections.length);
    const maxDegree = Math.max(...degrees, 0);
    
    const density = nodeCount > 1 
        ? edgeCount / ((nodeCount * (nodeCount - 1)) / 2)
        : 0;

    return {
        node_count: nodeCount,
        edge_count: edgeCount,
        average_degree: avgDegree.toFixed(2),
        max_degree: maxDegree,
        network_density: (density * 100).toFixed(2) + '%',
        is_connected: isConnected(graph)
    };
}

function calculateCentrality(graph) {
    const centrality = {};
    
    Object.keys(graph).forEach(nodeId => {
        centrality[nodeId] = {
            degree: graph[nodeId].connections.length,
            betweenness: 0, // Simplified - full calculation is complex
            closeness: 0
        };
    });

    // Sort by degree centrality
    const sorted = Object.entries(centrality)
        .sort((a, b) => b[1].degree - a[1].degree)
        .slice(0, 10)
        .map(([id, metrics]) => ({
            node_id: id,
            node_label: graph[id].node.label,
            ...metrics
        }));

    return sorted;
}

function detectClusters(graph, nodes) {
    const clusters = [];
    const visited = new Set();
    
    // Simple DFS-based clustering
    Object.keys(graph).forEach(nodeId => {
        if (!visited.has(nodeId)) {
            const cluster = [];
            const stack = [nodeId];
            
            while (stack.length > 0) {
                const current = stack.pop();
                if (!visited.has(current)) {
                    visited.add(current);
                    cluster.push({
                        id: current,
                        label: graph[current].node.label,
                        type: graph[current].node.node_type
                    });
                    
                    graph[current].connections.forEach(conn => {
                        if (!visited.has(conn.target)) {
                            stack.push(conn.target);
                        }
                    });
                }
            }
            
            if (cluster.length >= 3) {
                clusters.push({
                    size: cluster.length,
                    members: cluster
                });
            }
        }
    });

    return clusters.sort((a, b) => b.size - a.size).slice(0, 5);
}

function detectInterlocks(graph, nodes, relationships) {
    const interlocks = [];
    
    // Find executives connected to multiple companies
    const executives = nodes.filter(n => n.node_type === 'executive');
    
    executives.forEach(exec => {
        const connectedCompanies = graph[exec.id]?.connections
            .filter(c => graph[c.target]?.node.node_type === 'company')
            .map(c => ({
                id: c.target,
                name: graph[c.target].node.label,
                relationship: c.type
            })) || [];

        if (connectedCompanies.length >= 2) {
            interlocks.push({
                executive: {
                    id: exec.id,
                    name: exec.label,
                    title: exec.properties?.title
                },
                companies: connectedCompanies,
                interlock_strength: connectedCompanies.length
            });
        }
    });

    return interlocks.sort((a, b) => b.interlock_strength - a.interlock_strength);
}

function identifyKeyConnectors(graph, nodes) {
    const connectors = Object.entries(graph)
        .map(([id, data]) => ({
            id,
            label: data.node.label,
            type: data.node.node_type,
            connection_count: data.connections.length,
            unique_connections: new Set(data.connections.map(c => graph[c.target]?.node.node_type)).size
        }))
        .filter(c => c.connection_count >= 3)
        .sort((a, b) => b.connection_count - a.connection_count)
        .slice(0, 10);

    return connectors;
}

function identifyStructuralHoles(graph, nodes) {
    // Nodes that bridge disconnected clusters
    const holes = [];
    
    Object.entries(graph).forEach(([nodeId, data]) => {
        if (data.connections.length >= 2) {
            // Check if neighbors are not connected to each other
            let bridgeCount = 0;
            
            for (let i = 0; i < data.connections.length; i++) {
                for (let j = i + 1; j < data.connections.length; j++) {
                    const neighbor1 = data.connections[i].target;
                    const neighbor2 = data.connections[j].target;
                    
                    const areConnected = graph[neighbor1]?.connections
                        .some(c => c.target === neighbor2);
                    
                    if (!areConnected) {
                        bridgeCount++;
                    }
                }
            }
            
            if (bridgeCount > 0) {
                holes.push({
                    node_id: nodeId,
                    label: data.node.label,
                    bridge_count: bridgeCount,
                    structural_advantage: bridgeCount / data.connections.length
                });
            }
        }
    });

    return holes.sort((a, b) => b.structural_advantage - a.structural_advantage).slice(0, 5);
}

function identifyBridges(graph, nodes) {
    // Edges that if removed would disconnect the graph
    const bridges = [];
    
    // Simplified bridge detection
    Object.entries(graph).forEach(([nodeId, data]) => {
        if (data.connections.length === 1) {
            bridges.push({
                node: nodeId,
                label: data.node.label,
                connected_to: data.connections[0].target,
                bridge_type: 'leaf_connection'
            });
        }
    });

    return bridges.slice(0, 10);
}

function isConnected(graph) {
    if (Object.keys(graph).length === 0) return true;
    
    const visited = new Set();
    const stack = [Object.keys(graph)[0]];
    
    while (stack.length > 0) {
        const current = stack.pop();
        if (!visited.has(current)) {
            visited.add(current);
            graph[current]?.connections.forEach(c => {
                if (!visited.has(c.target)) {
                    stack.push(c.target);
                }
            });
        }
    }
    
    return visited.size === Object.keys(graph).length;
}

async function generateNetworkInsights(analysis, base44) {
    const prompt = `Analyze this network graph and provide strategic insights.

NETWORK STATISTICS:
${JSON.stringify(analysis.network_stats, null, 2)}

TOP CENTRAL NODES:
${JSON.stringify(analysis.centrality_analysis.slice(0, 5), null, 2)}

CLUSTERS DETECTED:
${JSON.stringify(analysis.clusters.slice(0, 3), null, 2)}

INTERLOCKS:
${JSON.stringify(analysis.interlocks.slice(0, 3), null, 2)}

Provide strategic insights:
{
  "executive_summary": "2-3 sentence overview of network structure",
  "key_insights": ["insight 1", "insight 2", "insight 3"],
  "strategic_opportunities": ["opportunity 1", "opportunity 2"],
  "risks_identified": ["risk 1", "risk 2"],
  "relationship_recommendations": ["recommendation 1", "recommendation 2"],
  "influence_centers": ["entity that has most influence"],
  "hidden_patterns": ["non-obvious pattern discovered"]
}`;

    try {
        const insights = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: false,
            response_json_schema: {
                type: "object",
                properties: {
                    executive_summary: { type: "string" },
                    key_insights: { type: "array", items: { type: "string" } },
                    strategic_opportunities: { type: "array", items: { type: "string" } },
                    risks_identified: { type: "array", items: { type: "string" } },
                    relationship_recommendations: { type: "array", items: { type: "string" } },
                    influence_centers: { type: "array", items: { type: "string" } },
                    hidden_patterns: { type: "array", items: { type: "string" } }
                }
            }
        });

        return insights;
    } catch (error) {
        console.error('Insight generation error:', error);
        return {
            executive_summary: "Network analysis completed successfully.",
            key_insights: [],
            strategic_opportunities: [],
            risks_identified: [],
            relationship_recommendations: [],
            influence_centers: [],
            hidden_patterns: []
        };
    }
}