import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query, entity_types, limit = 20 } = await req.json();

    const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 2);
    
    const allResults = await base44.entities.GlobalSearchIndex.list();
    
    const filtered = allResults.filter(item => {
      if (entity_types && !entity_types.includes(item.entity_type)) return false;
      
      const searchText = (item.searchable_text || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      
      return searchTerms.some(term => searchText.includes(term) || title.includes(term));
    });

    const scored = filtered.map(item => {
      const titleMatches = searchTerms.filter(term => item.title.toLowerCase().includes(term)).length;
      const textMatches = searchTerms.filter(term => item.searchable_text.toLowerCase().includes(term)).length;
      return {
        ...item,
        relevance_score: titleMatches * 10 + textMatches
      };
    });

    scored.sort((a, b) => b.relevance_score - a.relevance_score);

    return Response.json({ 
      success: true, 
      results: scored.slice(0, limit),
      total: scored.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});