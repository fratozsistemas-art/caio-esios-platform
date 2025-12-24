import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic_ids, dimension_filter } = await req.json();

    if (!topic_ids || topic_ids.length < 2) {
      return Response.json({ 
        error: 'At least 2 topic_ids required for comparison' 
      }, { status: 400 });
    }

    // Get facts for specified topics
    const factsToCompare = await base44.entities.StrategicFact.filter({
      topic_id: { $in: topic_ids }
    });

    // Filter by dimension if specified
    const filteredFacts = dimension_filter 
      ? factsToCompare.filter(f => f.dimension === dimension_filter)
      : factsToCompare;

    // Group by topic
    const factsByTopic = {};
    filteredFacts.forEach(fact => {
      if (!factsByTopic[fact.topic_id]) {
        factsByTopic[fact.topic_id] = [];
      }
      factsByTopic[fact.topic_id].push(fact);
    });

    const comparisonPrompt = `
    Perform a comprehensive comparative analysis of these strategic topics.
    
    Topics Being Compared:
    ${Object.entries(factsByTopic).map(([topicId, facts]) => `
    Topic: ${facts[0]?.topic_label || topicId}
    Facts:
    ${facts.map(f => `  - ${f.dimension}: ${f.summary} (confidence: ${f.confidence}, status: ${f.status})`).join('\n')}
    `).join('\n')}
    
    Provide detailed comparative analysis including:
    1. Similarities and common patterns across topics
    2. Key differences and divergences
    3. Complementary vs competitive dynamics
    4. Cross-topic dependencies and influences
    5. Confidence differential analysis
    6. Timeline synchronicities or divergences
    7. Strategic implications of the comparison
    `;

    const startTime = Date.now();
    
    const comparison = await base44.integrations.Core.InvokeLLM({
      prompt: comparisonPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          similarities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern: { type: "string" },
                description: { type: "string" },
                topics_involved: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          differences: {
            type: "array",
            items: {
              type: "object",
              properties: {
                dimension: { type: "string" },
                comparison: { type: "string" },
                significance: { type: "string" }
              }
            }
          },
          dependencies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                from_topic: { type: "string" },
                to_topic: { type: "string" },
                dependency_type: { type: "string" },
                strength: { type: "string" }
              }
            }
          },
          confidence_analysis: {
            type: "object",
            properties: {
              highest_confidence_topic: { type: "string" },
              lowest_confidence_topic: { type: "string" },
              average_confidence_by_topic: { type: "object" }
            }
          },
          strategic_implications: {
            type: "array",
            items: { type: "string" }
          },
          recommended_actions: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    const executionTime = Date.now() - startTime;
    const now = new Date().toISOString();

    // Record performance metrics
    await base44.asServiceRole.entities.AnalysisPerformanceMetric.create({
      analysis_type: 'comparative_analysis',
      metric_name: 'success_rate',
      value: comparison.executive_summary ? 100 : 0,
      period_start: now,
      period_end: now,
      facts_processed: filteredFacts.length,
      metadata: { topics_compared: topic_ids.length }
    });

    await base44.asServiceRole.entities.AnalysisPerformanceMetric.create({
      analysis_type: 'comparative_analysis',
      metric_name: 'avg_speed_ms',
      value: executionTime,
      period_start: now,
      period_end: now,
      facts_processed: filteredFacts.length
    });

    return Response.json({
      success: true,
      topics_compared: topic_ids,
      comparison_analysis: comparison,
      facts_analyzed: filteredFacts.length,
      execution_time_ms: executionTime,
      generated_at: now
    });

  } catch (error) {
    console.error('Error comparing fact topics:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});