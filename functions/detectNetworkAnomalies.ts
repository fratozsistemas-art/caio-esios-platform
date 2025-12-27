import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { graph_data } = await req.json();
    const { nodes, relationships } = graph_data;

    // Calculate basic graph metrics for anomaly detection
    const nodeConnections = {};
    nodes.forEach(n => nodeConnections[n.id] = 0);
    
    relationships.forEach(rel => {
      nodeConnections[rel.from_node_id] = (nodeConnections[rel.from_node_id] || 0) + 1;
      nodeConnections[rel.to_node_id] = (nodeConnections[rel.to_node_id] || 0) + 1;
    });

    const connectionCounts = Object.values(nodeConnections);
    const avgConnections = connectionCounts.reduce((a, b) => a + b, 0) / connectionCounts.length;
    const stdDev = Math.sqrt(
      connectionCounts.reduce((sum, c) => sum + Math.pow(c - avgConnections, 2), 0) / connectionCounts.length
    );

    // Detect statistical anomalies
    const statisticalAnomalies = nodes
      .filter(node => {
        const connections = nodeConnections[node.id];
        return Math.abs(connections - avgConnections) > 2 * stdDev;
      })
      .map(node => ({
        node_id: node.id,
        node_label: node.label,
        type: 'connection_outlier',
        severity: Math.abs(nodeConnections[node.id] - avgConnections) > 3 * stdDev ? 'critical' : 'high',
        details: `Unusual connection count: ${nodeConnections[node.id]} (avg: ${avgConnections.toFixed(1)})`,
        detected_at: new Date().toISOString()
      }));

    // Detect relationship type anomalies
    const relTypesByNodeType = {};
    relationships.forEach(rel => {
      const sourceNode = nodes.find(n => n.id === rel.from_node_id);
      const targetNode = nodes.find(n => n.id === rel.to_node_id);
      if (sourceNode && targetNode) {
        const key = `${sourceNode.node_type}-${rel.relationship_type}-${targetNode.node_type}`;
        relTypesByNodeType[key] = (relTypesByNodeType[key] || 0) + 1;
      }
    });

    // Use AI to detect semantic anomalies
    const aiAnalysisPrompt = `Analyze this network graph data for anomalies:
    
Nodes: ${nodes.length}
Relationships: ${relationships.length}
Node Types: ${[...new Set(nodes.map(n => n.node_type))].join(', ')}
Relationship Types: ${[...new Set(relationships.map(r => r.relationship_type))].join(', ')}

Sample nodes: ${JSON.stringify(nodes.slice(0, 10).map(n => ({ label: n.label, type: n.node_type })))}
Sample relationships: ${JSON.stringify(relationships.slice(0, 10).map(r => ({ type: r.relationship_type, from: nodes.find(n => n.id === r.from_node_id)?.label, to: nodes.find(n => n.id === r.to_node_id)?.label })))}

Identify semantic anomalies, unexpected patterns, or suspicious connections. Return as JSON array with format:
[{ "node_id": "...", "type": "semantic_anomaly", "severity": "high|medium|low", "details": "explanation" }]`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: aiAnalysisPrompt }],
      response_format: { type: "json_object" }
    });

    let aiAnomalies = [];
    try {
      const parsed = JSON.parse(aiResponse.choices[0].message.content);
      aiAnomalies = parsed.anomalies || [];
    } catch (e) {
      console.error("Failed to parse AI response:", e);
    }

    // Combine all anomalies
    const allAnomalies = [
      ...statisticalAnomalies,
      ...aiAnomalies.map(a => ({
        ...a,
        detected_at: new Date().toISOString()
      }))
    ];

    // Store anomalies in database
    if (allAnomalies.length > 0) {
      await Promise.all(
        allAnomalies.slice(0, 20).map(anomaly =>
          base44.asServiceRole.entities.NetworkAnomaly.create({
            ...anomaly,
            detected_by: user.email
          }).catch(err => console.error("Failed to store anomaly:", err))
        )
      );
    }

    return Response.json({
      anomalies: allAnomalies,
      summary: {
        total: allAnomalies.length,
        critical: allAnomalies.filter(a => a.severity === 'critical').length,
        high: allAnomalies.filter(a => a.severity === 'high').length,
        medium: allAnomalies.filter(a => a.severity === 'medium').length,
        low: allAnomalies.filter(a => a.severity === 'low').length
      }
    });

  } catch (error) {
    console.error("Error detecting anomalies:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});