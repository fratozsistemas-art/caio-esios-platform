import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, title, sourceType, sourceId } = await req.json();

    if (!content) {
      return Response.json({ error: 'Content is required' }, { status: 400 });
    }

    // Use AI to analyze and categorize content
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this content and provide:
1. A concise summary (2-3 sentences)
2. 5-10 relevant keywords
3. 3-5 categories (e.g., "strategy", "technology", "finance", "market_analysis", "competitive_intel")
4. 5-10 descriptive tags
5. Any entities mentioned (companies, people, technologies, frameworks)
6. A relevance score (0-100) indicating content quality and importance

Title: ${title || 'N/A'}
Content: ${content}

Respond in JSON format:
{
  "summary": "brief summary",
  "keywords": ["keyword1", "keyword2", ...],
  "categories": ["category1", "category2", ...],
  "tags": ["tag1", "tag2", ...],
  "entities_mentioned": ["entity1", "entity2", ...],
  "relevance_score": number,
  "sentiment": "positive/neutral/negative",
  "topics": ["topic1", "topic2", ...]
}`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          keywords: {
            type: "array",
            items: { type: "string" }
          },
          categories: {
            type: "array",
            items: { type: "string" }
          },
          tags: {
            type: "array",
            items: { type: "string" }
          },
          entities_mentioned: {
            type: "array",
            items: { type: "string" }
          },
          relevance_score: { type: "number" },
          sentiment: { type: "string" },
          topics: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Create or update search index entry
    if (sourceId) {
      const existing = await base44.asServiceRole.entities.SearchIndex.filter({
        source_type: sourceType,
        source_id: sourceId
      });

      if (existing.length > 0) {
        await base44.asServiceRole.entities.SearchIndex.update(existing[0].id, {
          title: title || 'Untitled',
          content,
          summary: analysis.summary,
          keywords: analysis.keywords,
          categories: analysis.categories,
          tags: analysis.tags,
          entities_mentioned: analysis.entities_mentioned,
          relevance_score: analysis.relevance_score,
          indexed_at: new Date().toISOString(),
          metadata: {
            sentiment: analysis.sentiment,
            topics: analysis.topics
          }
        });
      } else {
        await base44.asServiceRole.entities.SearchIndex.create({
          source_type: sourceType,
          source_id: sourceId,
          title: title || 'Untitled',
          content,
          summary: analysis.summary,
          keywords: analysis.keywords,
          categories: analysis.categories,
          tags: analysis.tags,
          entities_mentioned: analysis.entities_mentioned,
          relevance_score: analysis.relevance_score,
          indexed_at: new Date().toISOString(),
          metadata: {
            sentiment: analysis.sentiment,
            topics: analysis.topics
          }
        });
      }
    }

    return Response.json({
      success: true,
      ...analysis,
      indexed: !!sourceId
    });

  } catch (error) {
    console.error('Auto-tag error:', error);
    return Response.json({ 
      error: 'Tagging failed',
      details: error.message 
    }, { status: 500 });
  }
});