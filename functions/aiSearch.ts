import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, limit = 10 } = await req.json();

    if (!query) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Search across multiple data sources
    const [feedback, strategies, conversations, insights, workspaces, knowledgeItems] = await Promise.all([
      base44.entities.Feedback.list('-created_date', 50),
      base44.entities.Strategy.list('-created_date', 50),
      base44.agents.listConversations({ agent_name: 'caio_agent' }),
      base44.entities.KnowledgeItem.list('-created_date', 50).catch(() => []),
      base44.entities.Workspace.list('-created_date', 50).catch(() => []),
      base44.entities.SearchIndex.list('-relevance_score', 100).catch(() => [])
    ]);

    // Prepare search context
    const searchContext = {
      feedback: feedback.map(f => ({
        id: f.id,
        type: 'feedback',
        content: `${f.feedback_type}: ${f.comment || ''} (Rating: ${f.rating || 'N/A'})`,
        date: f.created_date
      })),
      strategies: strategies.map(s => ({
        id: s.id,
        type: 'strategy',
        content: `${s.title}: ${s.description || ''}`,
        date: s.created_date
      })),
      conversations: conversations.slice(0, 30).map(c => ({
        id: c.id,
        type: 'conversation',
        content: `${c.metadata?.title || 'Untitled'}: ${c.messages?.slice(-3).map(m => m.content).join(' ') || ''}`,
        date: c.created_date
      })),
      workspaces: workspaces.map(w => ({
        id: w.id,
        type: 'workspace',
        content: `${w.name}: ${w.description || ''}`,
        date: w.created_date
      })),
      indexed: knowledgeItems.map(k => ({
        id: k.id,
        type: 'knowledge',
        content: `${k.title || ''}: ${k.summary || k.content || ''}`,
        date: k.created_date
      }))
    };

    // Use AI to search and summarize
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an intelligent search assistant. The user asked: "${query}"

Search through this data and provide relevant results:
${JSON.stringify(searchContext, null, 2)}

Return the top ${limit} most relevant items with:
1. Match score (0-100) based on relevance to the query
2. Brief explanation of why it matches
3. Key excerpts from the content
4. Suggested follow-up questions

Respond in JSON format:
{
  "results": [
    {
      "id": "item_id",
      "type": "source_type",
      "title": "brief title",
      "relevance_score": number,
      "explanation": "why this matches",
      "excerpt": "relevant excerpt",
      "date": "date"
    }
  ],
  "summary": "overall summary of findings",
  "suggested_questions": ["question 1", "question 2", "question 3"],
  "total_matches": number
}`,
      response_json_schema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string" },
                title: { type: "string" },
                relevance_score: { type: "number" },
                explanation: { type: "string" },
                excerpt: { type: "string" },
                date: { type: "string" }
              }
            }
          },
          summary: { type: "string" },
          suggested_questions: {
            type: "array",
            items: { type: "string" }
          },
          total_matches: { type: "number" }
        }
      }
    });

    return Response.json({
      query,
      ...aiResponse,
      searched_sources: Object.keys(searchContext).length
    });

  } catch (error) {
    console.error('AI Search error:', error);
    return Response.json({ 
      error: 'Search failed',
      details: error.message 
    }, { status: 500 });
  }
});