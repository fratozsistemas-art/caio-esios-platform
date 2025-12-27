import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { graph_data } = await req.json();
    const { nodes, relationships } = graph_data;

    // Calculate multiple centrality metrics
    const metrics = {};
    nodes.forEach(node => {
      metrics[node.id] = {
        node_id: node.id,
        label: node.label,
        node_type: node.node_type,
        degree: 0,
        in_degree: 0,
        out_degree: 0,
        betweenness: 0,
        closeness: 0,
        eigenvector: 0
      };
    });

    // Degree centrality
    relationships.forEach(rel => {
      if (metrics[rel.from_node_id]) {
        metrics[rel.from_node_id].degree++;
        metrics[rel.from_node_id].out_degree++;
      }
      if (metrics[rel.to_node_id]) {
        metrics[rel.to_node_id].degree++;
        metrics[rel.to_node_id].in_degree++;
      }
    });

    // Betweenness centrality (simplified - shortest paths)
    const adjacencyList = {};
    nodes.forEach(n => adjacencyList[n.id] = []);
    relationships.forEach(rel => {
      adjacencyList[rel.from_node_id]?.push(rel.to_node_id);
      adjacencyList[rel.to_node_id]?.push(rel.from_node_id); // Treat as undirected for betweenness
    });

    // Calculate betweenness using BFS
    nodes.forEach(source => {
      const distances = {};
      const paths = {};
      const queue = [source.id];
      distances[source.id] = 0;
      paths[source.id] = 1;

      while (queue.length > 0) {
        const current = queue.shift();
        const neighbors = adjacencyList[current] || [];

        neighbors.forEach(neighbor => {
          if (distances[neighbor] === undefined) {
            distances[neighbor] = distances[current] + 1;
            paths[neighbor] = paths[current];
            queue.push(neighbor);
          } else if (distances[neighbor] === distances[current] + 1) {
            paths[neighbor] += paths[current];
          }
        });
      }

      // Update betweenness scores
      Object.keys(distances).forEach(target => {
        if (target !== source.id) {
          const path = distances[target];
          if (path > 0 && path < Infinity) {
            Object.keys(distances).forEach(intermediate => {
              if (intermediate !== source.id && intermediate !== target) {
                if (distances[intermediate] < distances[target] && 
                    adjacencyList[intermediate]?.includes(target)) {
                  metrics[intermediate].betweenness += 1;
                }
              }
            });
          }
        }
      });
    });

    // Closeness centrality
    nodes.forEach(node => {
      const distances = {};
      const queue = [node.id];
      distances[node.id] = 0;

      while (queue.length > 0) {
        const current = queue.shift();
        const neighbors = adjacencyList[current] || [];

        neighbors.forEach(neighbor => {
          if (distances[neighbor] === undefined) {
            distances[neighbor] = distances[current] + 1;
            queue.push(neighbor);
          }
        });
      }

      const totalDistance = Object.values(distances).reduce((sum, d) => sum + d, 0);
      const reachableNodes = Object.keys(distances).length - 1;
      metrics[node.id].closeness = reachableNodes > 0 ? reachableNodes / totalDistance : 0;
    });

    // Eigenvector centrality (power iteration)
    const eigenScores = {};
    nodes.forEach(n => eigenScores[n.id] = 1.0);

    for (let iter = 0; iter < 20; iter++) {
      const newScores = {};
      nodes.forEach(n => newScores[n.id] = 0);

      relationships.forEach(rel => {
        newScores[rel.to_node_id] += eigenScores[rel.from_node_id] || 0;
        newScores[rel.from_node_id] += eigenScores[rel.to_node_id] || 0;
      });

      // Normalize
      const norm = Math.sqrt(Object.values(newScores).reduce((sum, v) => sum + v * v, 0));
      nodes.forEach(n => {
        eigenScores[n.id] = norm > 0 ? newScores[n.id] / norm : 0;
      });
    }

    nodes.forEach(n => {
      metrics[n.id].eigenvector = eigenScores[n.id];
    });

    // Calculate composite influence score
    const metricsArray = Object.values(metrics);
    const maxDegree = Math.max(...metricsArray.map(m => m.degree), 1);
    const maxBetweenness = Math.max(...metricsArray.map(m => m.betweenness), 1);
    const maxCloseness = Math.max(...metricsArray.map(m => m.closeness), 1);
    const maxEigenvector = Math.max(...metricsArray.map(m => m.eigenvector), 1);

    const influencers = metricsArray.map(m => ({
      ...m,
      degree_normalized: m.degree / maxDegree,
      betweenness_normalized: m.betweenness / maxBetweenness,
      closeness_normalized: m.closeness / maxCloseness,
      eigenvector_normalized: m.eigenvector / maxEigenvector,
      influence_score: (
        (m.degree / maxDegree) * 0.3 +
        (m.betweenness / maxBetweenness) * 0.3 +
        (m.closeness / maxCloseness) * 0.2 +
        (m.eigenvector / maxEigenvector) * 0.2
      ) * 100
    }))
    .sort((a, b) => b.influence_score - a.influence_score);

    // Store top influencers
    const topInfluencers = influencers.slice(0, 20);
    await Promise.all(
      topInfluencers.map(influencer =>
        base44.asServiceRole.entities.KeyInfluencer.create({
          ...influencer,
          identified_at: new Date().toISOString(),
          identified_by: user.email
        }).catch(err => console.error("Failed to store influencer:", err))
      )
    );

    return Response.json({
      influencers: topInfluencers,
      summary: {
        total_nodes: nodes.length,
        top_influencer: topInfluencers[0],
        avg_influence_score: influencers.reduce((sum, i) => sum + i.influence_score, 0) / influencers.length
      }
    });

  } catch (error) {
    console.error("Error identifying influencers:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});