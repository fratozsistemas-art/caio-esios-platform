import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all facts for trend analysis
    const allFacts = await base44.entities.StrategicFact.list('-created_date', 200);
    const existingNarratives = await base44.entities.Narrative.list('-created_date', 50);

    // Analyze temporal patterns
    const recentFacts = allFacts.filter(f => {
      const lastUpdate = new Date(f.last_updated || f.created_date);
      const monthsAgo = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo <= 3; // Last 3 months
    });

    // Extract trend data
    const topicFrequency = {};
    const tagFrequency = {};
    const statusDistribution = {};

    allFacts.forEach(fact => {
      topicFrequency[fact.topic_label] = (topicFrequency[fact.topic_label] || 0) + 1;
      statusDistribution[fact.status] = (statusDistribution[fact.status] || 0) + 1;
      
      (fact.tags || []).forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    const trendingTopics = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    const trendingTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag, count]) => ({ tag, count }));

    // Identify gaps and opportunities
    const narrativeTopicsCovered = new Set(
      existingNarratives.flatMap(n => n.topics || [])
    );

    const uncoveredTopics = Object.keys(topicFrequency)
      .filter(topic => !narrativeTopicsCovered.has(topic));

    // Generate narrative suggestions with AI
    const suggestionPrompt = `
    As a strategic intelligence analyst, suggest compelling narrative angles and analysis opportunities.
    
    Current Knowledge Base:
    - Total facts: ${allFacts.length}
    - Recent updates (3 months): ${recentFacts.length}
    - Trending topics: ${trendingTopics.map(t => t.topic).join(', ')}
    - Trending tags: ${trendingTags.slice(0, 8).map(t => t.tag).join(', ')}
    - Topics with no narratives yet: ${uncoveredTopics.slice(0, 5).join(', ')}
    
    Recent high-confidence facts:
    ${recentFacts
      .filter(f => f.confidence >= 0.9)
      .slice(0, 10)
      .map(f => `- ${f.topic_label}: ${f.summary}`)
      .join('\n')}
    
    Facts needing review:
    ${allFacts.filter(f => f.status === 'needs_review').length} facts require validation
    
    Suggest 5-7 narrative angles that would:
    1. Connect multiple trending topics in novel ways
    2. Address uncovered important topics
    3. Provide timely geopolitical or strategic analysis
    4. Fill gaps in current narrative coverage
    5. Leverage high-confidence recent facts
    
    For each suggestion, provide title, rationale, key facts to include, and expected impact.
    `;

    const suggestions = await base44.integrations.Core.InvokeLLM({
      prompt: suggestionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          narrative_suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                narrative_type: { 
                  type: "string",
                  enum: ["article", "analysis", "report", "speech", "interview"]
                },
                rationale: { type: "string" },
                key_topics: {
                  type: "array",
                  items: { type: "string" }
                },
                recommended_facts: {
                  type: "array",
                  items: { type: "string" }
                },
                target_audience: { type: "string" },
                urgency_level: {
                  type: "string",
                  enum: ["low", "medium", "high", "critical"]
                },
                expected_impact: { type: "string" },
                estimated_research_time: { type: "string" }
              }
            }
          },
          emerging_themes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                theme: { type: "string" },
                description: { type: "string" },
                related_topics: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          cross_cutting_insights: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      success: true,
      trending_topics: trendingTopics,
      trending_tags: trendingTags,
      uncovered_topics: uncoveredTopics.slice(0, 10),
      recent_updates_count: recentFacts.length,
      status_distribution: statusDistribution,
      narrative_suggestions: suggestions.narrative_suggestions || [],
      emerging_themes: suggestions.emerging_themes || [],
      cross_cutting_insights: suggestions.cross_cutting_insights || [],
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error suggesting narrative angles:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});