import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { source_node_id, target_node_id, max_depth = 5, analysis_type = 'shortest_path' } = await req.json();

        if (!source_node_id) {
            return Response.json({ error: 'source_node_id is required' }, { status: 400 });
        }

        // Carregar todos os nós e relacionamentos
        const [nodes, relationships] = await Promise.all([
            base44.entities.KnowledgeGraphNode.list(),
            base44.entities.KnowledgeGraphRelationship.list()
        ]);

        // Construir grafo como adjacency list
        const graph = new Map();
        nodes.forEach(node => {
            graph.set(node.id, { node, edges: [] });
        });

        relationships.forEach(rel => {
            if (graph.has(rel.from_node_id)) {
                graph.get(rel.from_node_id).edges.push({
                    to: rel.to_node_id,
                    relationship: rel
                });
            }
        });

        // BFS para shortest path
        const findShortestPath = (start, end) => {
            const queue = [[start]];
            const visited = new Set([start]);

            while (queue.length > 0) {
                const path = queue.shift();
                const current = path[path.length - 1];

                if (current === end) {
                    return path;
                }

                const node = graph.get(current);
                if (node) {
                    for (const edge of node.edges) {
                        if (!visited.has(edge.to) && path.length < max_depth) {
                            visited.add(edge.to);
                            queue.push([...path, edge.to]);
                        }
                    }
                }
            }
            return null;
        };

        // DFS para explorar vizinhança
        const exploreNeighborhood = (start, depth) => {
            const visited = new Set();
            const result = [];

            const dfs = (nodeId, currentDepth) => {
                if (currentDepth > depth || visited.has(nodeId)) return;
                visited.add(nodeId);

                const node = graph.get(nodeId);
                if (node) {
                    result.push({
                        node: node.node,
                        depth: currentDepth
                    });

                    node.edges.forEach(edge => {
                        dfs(edge.to, currentDepth + 1);
                    });
                }
            };

            dfs(start, 0);
            return result;
        };

        // Análise de centralidade
        const calculateCentrality = (nodeId) => {
            let inDegree = 0;
            let outDegree = 0;

            relationships.forEach(rel => {
                if (rel.to_node_id === nodeId) inDegree++;
                if (rel.from_node_id === nodeId) outDegree++;
            });

            return {
                in_degree: inDegree,
                out_degree: outDegree,
                total_degree: inDegree + outDegree
            };
        };

        let result = {};

        switch (analysis_type) {
            case 'shortest_path':
                if (!target_node_id) {
                    return Response.json({ error: 'target_node_id required for shortest_path' }, { status: 400 });
                }
                const path = findShortestPath(source_node_id, target_node_id);
                result = {
                    path: path ? path.map(id => nodes.find(n => n.id === id)) : null,
                    length: path ? path.length - 1 : null,
                    found: path !== null
                };
                break;

            case 'neighborhood':
                const neighborhood = exploreNeighborhood(source_node_id, max_depth);
                result = {
                    nodes: neighborhood,
                    total_nodes: neighborhood.length
                };
                break;

            case 'centrality':
                const centrality = calculateCentrality(source_node_id);
                result = {
                    node_id: source_node_id,
                    centrality: centrality
                };
                break;

            case 'influence':
                const influenced = exploreNeighborhood(source_node_id, max_depth);
                const influenceScore = influenced.reduce((acc, n) => acc + (1 / (n.depth + 1)), 0);
                result = {
                    influence_score: influenceScore,
                    nodes_influenced: influenced.length,
                    nodes: influenced
                };
                break;

            default:
                return Response.json({ error: 'Invalid analysis_type' }, { status: 400 });
        }

        return Response.json({
            success: true,
            analysis_type,
            result
        });

    } catch (error) {
        console.error('Graph traversal error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});