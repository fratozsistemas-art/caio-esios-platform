import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Search knowledge sources based on a query
 * Returns relevant sources with context and citations
 */
Deno.serve(async (req) => {
  console.log('🔍 [Search Knowledge] Function started');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      query, 
      categories = [], 
      tags = [],
      limit = 5 
    } = await req.json();

    if (!query) {
      return Response.json({ 
        error: 'query is required' 
      }, { status: 400 });
    }

    console.log('🔍 Searching for:', query);

    // Get all indexed knowledge sources
    let knowledgeSources = await base44.entities.KnowledgeSource.filter({
      indexing_status: 'indexed',
      is_active: true
    });

    // Filter by user access
    knowledgeSources = knowledgeSources.filter(source => {
      if (source.access_level === 'private') {
        return source.created_by === user.email;
      }
      // For team/organization, all authenticated users can access
      return true;
    });

    // Filter by categories if specified
    if (categories.length > 0) {
      knowledgeSources = knowledgeSources.filter(source => 
        categories.includes(source.category)
      );
    }

    // Filter by tags if specified
    if (tags.length > 0) {
      knowledgeSources = knowledgeSources.filter(source => 
        source.tags?.some(tag => tags.includes(tag))
      );
    }

    console.log(`📚 Found ${knowledgeSources.length} knowledge sources to search`);

    if (knowledgeSources.length === 0) {
      return Response.json({
        success: true,
        results: [],
        message: 'No knowledge sources available'
      });
    }

    // Use LLM to find most relevant sources
    const searchPrompt = `You are a knowledge retrieval expert.

**USER QUERY:**
"${query}"

**AVAILABLE KNOWLEDGE SOURCES:**
${knowledgeSources.map((source, idx) => `
[${idx + 1}] ${source.title}
Category: ${source.category}
Summary: ${source.content_summary || 'No summary available'}
Topics: ${source.key_topics?.join(', ') || 'None'}
File: ${source.file_name}
`).join('\n')}

**YOUR TASK:**
Analyze which sources are most relevant to answer the user's query.
Return the top ${limit} most relevant sources with relevance scores and explain why each is relevant.

**OUTPUT FORMAT (JSON):**
{
  "relevant_sources": [
    {
      "source_index": 1,
      "relevance_score": 95,
      "relevance_reason": "This document directly addresses...",
      "relevant_excerpts": ["excerpt 1", "excerpt 2"],
      "how_to_use": "Use this to answer X aspect of the query"
    }
  ],
  "search_strategy": "Brief explanation of search approach"
}

Return sources in order of relevance (highest first).`;

    const searchResult = await base44.integrations.Core.InvokeLLM({
      prompt: searchPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          relevant_sources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                source_index: { type: "number" },
                relevance_score: { type: "number" },
                relevance_reason: { type: "string" },
                relevant_excerpts: { 
                  type: "array", 
                  items: { type: "string" } 
                },
                how_to_use: { type: "string" }
              }
            }
          },
          search_strategy: { type: "string" }
        }
      }
    });

    // Map back to actual sources with full details
    const results = searchResult.relevant_sources
      .slice(0, limit)
      .map(match => {
        const sourceIndex = match.source_index - 1; // Convert to 0-based
        const source = knowledgeSources[sourceIndex];
        
        if (!source) return null;

        return {
          id: source.id,
          title: source.title,
          category: source.category,
          file_name: source.file_name,
          file_url: source.file_url,
          content_summary: source.content_summary,
          key_topics: source.key_topics,
          relevance_score: match.relevance_score,
          relevance_reason: match.relevance_reason,
          relevant_excerpts: match.relevant_excerpts || [],
          how_to_use: match.how_to_use,
          citation: {
            title: source.title,
            author: source.author || 'Unknown',
            publication_date: source.publication_date || source.created_date,
            source_type: source.category
          }
        };
      })
      .filter(Boolean);

    // Update usage stats
    for (const result of results) {
      await base44.entities.KnowledgeSource.update(result.id, {
        usage_count: (knowledgeSources.find(s => s.id === result.id)?.usage_count || 0) + 1,
        last_accessed_at: new Date().toISOString()
      });
    }

    console.log(`✅ Found ${results.length} relevant sources`);

    return Response.json({
      success: true,
      query,
      results,
      search_strategy: searchResult.search_strategy,
      total_sources_searched: knowledgeSources.length
    });

  } catch (error) {
    console.error('❌ Error in searchKnowledge:', error);
    return Response.json({ 
      error: 'Search failed',
      details: error.message
    }, { status: 500 });
  }
});