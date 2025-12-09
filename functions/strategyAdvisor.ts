import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, context, category } = await req.json();

    if (!query) {
      return Response.json({ error: 'query is required' }, { status: 400 });
    }

    // Fetch relevant knowledge base documents
    const [analyses, strategies, knowledgeItems, wikiDocs] = await Promise.all([
      base44.entities.Analysis.list('-created_date', 10),
      base44.entities.Strategy.list('-created_date', 10),
      base44.entities.KnowledgeItem.list('-created_date', 10),
      base44.entities.WikiDocument.list('-created_date', 5)
    ]);

    // Fetch recent document analyses
    const documentAnalyses = await base44.entities.DocumentAnalysis.list('-created_date', 5);

    // Build context from knowledge base
    const knowledgeContext = `
=== PLATFORM KNOWLEDGE BASE ===

Recent Analyses:
${analyses.slice(0, 3).map(a => `- ${a.title} (${a.type}): ${a.results?.summary || 'N/A'}`).join('\n')}

Strategic Documents:
${strategies.slice(0, 3).map(s => `- ${s.title} (${s.category}): ${s.description || 'N/A'}`).join('\n')}

Knowledge Items:
${knowledgeItems.slice(0, 3).map(k => `- ${k.title} (${k.type}, Framework: ${k.framework}): ${k.summary || 'N/A'}`).join('\n')}

Recent Document Analyses:
${documentAnalyses.map(d => `
- ${d.document_title} (${d.document_type})
  Summary: ${d.summary?.substring(0, 200)}...
  Hermes Integrity Score: ${d.hermes_validation?.integrity_score}/100
  Key Entities: ${d.extracted_entities?.map(e => e.value).join(', ')}
`).join('\n')}

Wiki Documents:
${wikiDocs.map(w => `- ${w.title} (${w.category}, Version: ${w.version})`).join('\n')}
`;

    // Generate strategic advice
    const advisorPrompt = `
You are the CAIO·AI Strategy Advisor, operating with full access to the platform's institutional knowledge.

User Query: "${query}"
${context ? `Additional Context: ${context}` : ''}
Category: ${category || 'general'}

${knowledgeContext}

Based on the platform's knowledge base and your strategic intelligence, provide:

1. **Strategic Recommendation**: Detailed, actionable advice (3-5 paragraphs)

2. **Referenced Documents**: List specific documents/analyses from the knowledge base that support your recommendation (with IDs if available)

3. **Confidence Score**: Your confidence in this recommendation (0-100)

4. **Risk Factors**: Identify 3-5 key risks associated with this strategy

5. **Opportunities**: Identify 3-5 opportunities this approach unlocks

6. **Action Items**: Provide 5-7 concrete next steps with:
   - Action description
   - Priority (low/medium/high/critical)
   - Timeframe (immediate/30-day/90-day/6-month)

Apply CAIO·AI's strategic frameworks:
- TSI v9.3 methodology (11 cognitive modules)
- CRV Scoring (Confidence/Risk/Value)
- Hermes Trust-Brokering validation
- Board-grade institutional intelligence

Return your response as JSON with this structure:
{
  "recommendation": "string (detailed markdown-formatted text)",
  "referenced_documents": ["string"],
  "confidence_score": 0-100,
  "risk_factors": ["string"],
  "opportunities": ["string"],
  "action_items": [
    {
      "action": "string",
      "priority": "low|medium|high|critical",
      "timeframe": "string"
    }
  ]
}
`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: advisorPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendation: { type: "string" },
          referenced_documents: {
            type: "array",
            items: { type: "string" }
          },
          confidence_score: { type: "number" },
          risk_factors: {
            type: "array",
            items: { type: "string" }
          },
          opportunities: {
            type: "array",
            items: { type: "string" }
          },
          action_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                timeframe: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Save query and response
    const strategyQuery = await base44.entities.StrategyQuery.create({
      query,
      category: category || 'other',
      context: context || '',
      ai_response: llmResponse,
      status: 'completed'
    });

    return Response.json({
      success: true,
      query_id: strategyQuery.id,
      response: llmResponse
    });

  } catch (error) {
    console.error('Strategy advisor error:', error);
    return Response.json({ 
      error: 'Strategy generation failed', 
      details: error.message 
    }, { status: 500 });
  }
});