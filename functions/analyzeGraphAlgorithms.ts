import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { algorithm_type } = await req.json();

    // Fetch graph data
    const nodes = await base44.entities.KnowledgeGraphNode.list();
    const relationships = await base44.entities.KnowledgeGraphRelationship.list();

    if (nodes.length === 0) {
      return Response.json({
        success: false,
        error: 'No graph data available'
      }, { status: 400 });
    }

    // Build adjacency map
    const adjacencyMap = {};
    const nodeMap = {};
    
    nodes.forEach(node => {
      nodeMap[node.id] = node;
      adjacencyMap[node.id] = [];
    });

    relationships.forEach(rel => {
      if (adjacencyMap[rel.from_node_id]) {
        adjacencyMap[rel.from_node_id].push({
          to: rel.to_node_id,
          type: rel.relationship_type,
          weight: rel.properties?.weight || 1
        });
      }
    });

    let algorithmResults = {};

    // Centrality Analysis
    if (!algorithm_type || algorithm_type === 'centrality') {
      const degreeCentrality = {};
      const betweennessCentrality = {};

      // Degree centrality (simple connection count)
      Object.keys(adjacencyMap).forEach(nodeId => {
        const outDegree = adjacencyMap[nodeId].length;
        const inDegree = relationships.filter(r => r.to_node_id === nodeId).length;
        degreeCentrality[nodeId] = {
          degree: outDegree + inDegree,
          in_degree: inDegree,
          out_degree: outDegree
        };
      });

      // Sort by degree
      const topCentral = Object.entries(degreeCentrality)
        .sort((a, b) => b[1].degree - a[1].degree)
        .slice(0, 10)
        .map(([nodeId, stats]) => ({
          node: nodeMap[nodeId],
          ...stats,
          influence_score: stats.degree / nodes.length * 100
        }));

      algorithmResults.centrality = {
        top_influential_nodes: topCentral,
        avg_degree: Object.values(degreeCentrality).reduce((sum, s) => sum + s.degree, 0) / nodes.length,
        max_degree: Math.max(...Object.values(degreeCentrality).map(s => s.degree))
      };
    }

    // Community Detection (simple clustering)
    if (!algorithm_type || algorithm_type === 'communities') {
      const visited = new Set();
      const communities = [];

      const dfs = (nodeId, community) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        community.push(nodeId);

        adjacencyMap[nodeId].forEach(neighbor => {
          dfs(neighbor.to, community);
        });

        // Also check reverse edges
        relationships
          .filter(r => r.to_node_id === nodeId && !visited.has(r.from_node_id))
          .forEach(r => dfs(r.from_node_id, community));
      };

      nodes.forEach(node => {
        if (!visited.has(node.id)) {
          const community = [];
          dfs(node.id, community);
          if (community.length > 1) {
            communities.push(community);
          }
        }
      });

      algorithmResults.communities = {
        total_communities: communities.length,
        communities: communities.map((comm, idx) => ({
          id: `community_${idx}`,
          size: comm.length,
          nodes: comm.map(nodeId => nodeMap[nodeId]).filter(Boolean),
          density: comm.length > 1 ? 
            relationships.filter(r => comm.includes(r.from_node_id) && comm.includes(r.to_node_id)).length / 
            (comm.length * (comm.length - 1)) : 0
        })).sort((a, b) => b.size - a.size)
      };
    }

    // Path Analysis
    if (!algorithm_type || algorithm_type === 'paths') {
      // Find shortest paths between important nodes
      const topNodes = Object.entries(adjacencyMap)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 5)
        .map(([id]) => id);

      const shortestPaths = [];

      // Simple BFS for shortest path
      const findPath = (start, end) => {
        const queue = [[start]];
        const visited = new Set([start]);

        while (queue.length > 0) {
          const path = queue.shift();
          const node = path[path.length - 1];

          if (node === end) return path;

          adjacencyMap[node].forEach(neighbor => {
            if (!visited.has(neighbor.to)) {
              visited.add(neighbor.to);
              queue.push([...path, neighbor.to]);
            }
          });
        }
        return null;
      };

      for (let i = 0; i < topNodes.length; i++) {
        for (let j = i + 1; j < topNodes.length; j++) {
          const path = findPath(topNodes[i], topNodes[j]);
          if (path && path.length > 1) {
            shortestPaths.push({
              from: nodeMap[topNodes[i]],
              to: nodeMap[topNodes[j]],
              path_length: path.length - 1,
              nodes_in_path: path.map(id => nodeMap[id]).filter(Boolean)
            });
          }
        }
      }

      algorithmResults.paths = {
        shortest_paths: shortestPaths.slice(0, 10),
        avg_path_length: shortestPaths.length > 0 ?
          shortestPaths.reduce((sum, p) => sum + p.path_length, 0) / shortestPaths.length : 0
      };
    }

    return Response.json({
      success: true,
      algorithm_results: algorithmResults,
      graph_stats: {
        total_nodes: nodes.length,
        total_relationships: relationships.length,
        analyzed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Graph algorithm error:', error);
    return Response.json({ 
      error: 'Failed to analyze graph',
      details: error.message
    }, { status: 500 });
  }
});