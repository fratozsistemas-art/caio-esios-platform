import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query, entity_types, limit = 20 } = await req.json();

    const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 2);
    
    // Fetch from search index
    const indexResults = await base44.entities.GlobalSearchIndex.list();
    
    // Also search directly in key entities for more coverage
    const [strategies, analyses, knowledgeItems, companies, conversations] = await Promise.all([
      base44.entities.Strategy.list('-updated_date', 50).catch(() => []),
      base44.entities.Analysis.list('-updated_date', 50).catch(() => []),
      base44.entities.KnowledgeItem.list('-updated_date', 50).catch(() => []),
      base44.entities.Company.list('-updated_date', 30).catch(() => []),
      base44.asServiceRole.agents.listConversations({ agent_name: 'caio_agent' }).catch(() => [])
    ]);

    // Combine all sources
    const allSources = [
      ...indexResults,
      ...strategies.map(s => ({
        entity_type: 'strategy',
        entity_id: s.id,
        title: s.title,
        description: s.description,
        searchable_text: `${s.title} ${s.description || ''} ${s.category || ''}`,
        tags: [s.category, s.status]
      })),
      ...analyses.map(a => ({
        entity_type: 'analysis',
        entity_id: a.id,
        title: a.title,
        description: `${a.type} analysis`,
        searchable_text: `${a.title} ${a.category || ''} ${a.type}`,
        tags: [a.type, a.category]
      })),
      ...knowledgeItems.map(k => ({
        entity_type: 'knowledge_item',
        entity_id: k.id,
        title: k.title,
        description: k.summary,
        searchable_text: `${k.title} ${k.summary || ''} ${k.framework || ''}`,
        tags: k.tags || []
      })),
      ...companies.map(c => ({
        entity_type: 'company',
        entity_id: c.id,
        title: c.name,
        description: c.description,
        searchable_text: `${c.name} ${c.description || ''} ${c.industry || ''}`,
        tags: [c.industry]
      })),
      ...conversations.slice(0, 20).map(c => ({
        entity_type: 'conversation',
        entity_id: c.id,
        title: c.metadata?.name || 'Conversation',
        description: 'AI conversation',
        searchable_text: c.metadata?.name || '',
        tags: ['chat']
      }))
    ];
    
    const filtered = allSources.filter(item => {
      if (entity_types && !entity_types.includes(item.entity_type)) return false;
      
      const searchText = (item.searchable_text || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      const description = (item.description || '').toLowerCase();
      
      return searchTerms.some(term => 
        searchText.includes(term) || 
        title.includes(term) || 
        description.includes(term)
      );
    });

    // Remove duplicates by entity_type + entity_id
    const uniqueMap = new Map();
    filtered.forEach(item => {
      const key = `${item.entity_type}_${item.entity_id}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    const scored = Array.from(uniqueMap.values()).map(item => {
      const titleMatches = searchTerms.filter(term => 
        (item.title || '').toLowerCase().includes(term)
      ).length;
      const descMatches = searchTerms.filter(term => 
        (item.description || '').toLowerCase().includes(term)
      ).length;
      const textMatches = searchTerms.filter(term => 
        (item.searchable_text || '').toLowerCase().includes(term)
      ).length;
      
      return {
        ...item,
        relevance_score: titleMatches * 15 + descMatches * 10 + textMatches * 3
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