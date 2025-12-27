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

    const { graph_data, timeframe_days = 30 } = await req.json();
    const { nodes, relationships } = graph_data;

    // Analyze temporal patterns
    const recentNodes = nodes
      .filter(n => n.created_date)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 20);

    const recentRelationships = relationships
      .filter(r => r.created_date)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 30);

    // Calculate growth rates
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentNodeCount = nodes.filter(n => new Date(n.created_date) > thirtyDaysAgo).length;
    const previousNodeCount = nodes.filter(n => {
      const date = new Date(n.created_date);
      return date > sixtyDaysAgo && date <= thirtyDaysAgo;
    }).length;

    const nodeGrowthRate = previousNodeCount > 0 
      ? ((recentNodeCount - previousNodeCount) / previousNodeCount) * 100 
      : 0;

    // Use AI for prediction
    const predictionPrompt = `Based on this network graph data, predict future trends for the next ${timeframe_days} days:

Current State:
- Total Nodes: ${nodes.length}
- Total Relationships: ${relationships.length}
- Node Growth Rate (last 30 days): ${nodeGrowthRate.toFixed(1)}%
- Node Types: ${[...new Set(nodes.map(n => n.node_type))].join(', ')}

Recent Activity:
- New Nodes: ${JSON.stringify(recentNodes.slice(0, 5).map(n => ({ label: n.label, type: n.node_type })))}
- New Relationships: ${JSON.stringify(recentRelationships.slice(0, 5).map(r => ({ type: r.relationship_type })))}

Predict:
1. Likely new relationships between existing nodes
2. Trends in node growth by type
3. Emerging patterns or clusters
4. Potential central nodes that will increase in importance

Return as JSON:
{
  "predicted_relationships": [{ "from_node_id": "...", "to_node_id": "...", "relationship_type": "...", "confidence": 0-1, "reasoning": "..." }],
  "growth_predictions": { "node_type": "count_estimate" },
  "emerging_patterns": ["pattern1", "pattern2"],
  "rising_influencers": [{ "node_id": "...", "reasoning": "..." }]
}`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: predictionPrompt }],
      response_format: { type: "json_object" }
    });

    const predictions = JSON.parse(aiResponse.choices[0].message.content);

    // Calculate confidence scores based on data quality
    const dataQuality = Math.min(
      1.0,
      (nodes.filter(n => n.created_date).length / nodes.length) * 
      (relationships.filter(r => r.created_date).length / relationships.length)
    );

    // Store prediction
    await base44.asServiceRole.entities.NetworkPrediction.create({
      predicted_at: new Date().toISOString(),
      target_date: new Date(now.getTime() + timeframe_days * 24 * 60 * 60 * 1000).toISOString(),
      predicted_changes: predictions,
      confidence_score: dataQuality * 100,
      timeframe_days,
      node_growth_rate: nodeGrowthRate,
      predicted_by: user.email
    }).catch(err => console.error("Failed to store prediction:", err));

    return Response.json({
      predictions,
      metadata: {
        confidence_score: dataQuality * 100,
        timeframe_days,
        current_node_count: nodes.length,
        current_relationship_count: relationships.length,
        node_growth_rate: nodeGrowthRate
      }
    });

  } catch (error) {
    console.error("Error predicting trends:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});