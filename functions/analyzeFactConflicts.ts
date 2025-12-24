import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allFacts = await base44.entities.StrategicFact.list();

    // Group facts by topic for analysis
    const factsByTopic = {};
    allFacts.forEach(fact => {
      if (!factsByTopic[fact.topic_id]) {
        factsByTopic[fact.topic_id] = [];
      }
      factsByTopic[fact.topic_id].push(fact);
    });

    const conflictPrompt = `
    Analyze these strategic facts for contradictions, inconsistencies, or conflicts.
    
    Facts Database:
    ${allFacts.map(f => `
    [${f.id}] ${f.topic_label} - ${f.dimension}
    Summary: ${f.summary}
    Status: ${f.status}, Confidence: ${f.confidence}
    Date Range: ${f.start_date || 'N/A'} to ${f.end_date || 'ongoing'}
    `).join('\n')}
    
    Identify:
    1. Direct contradictions (facts that state opposite things)
    2. Timeline inconsistencies (overlapping dates that don't make sense)
    3. Confidence conflicts (high-confidence facts that contradict each other)
    4. Status mismatches (deprecated facts contradicting confirmed ones)
    5. Logical inconsistencies in dependencies or implications
    
    For each conflict, assess:
    - Severity (critical, high, medium, low)
    - Which facts are involved
    - Recommended resolution action
    `;

    const conflicts = await base44.integrations.Core.InvokeLLM({
      prompt: conflictPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          conflicts_detected: {
            type: "array",
            items: {
              type: "object",
              properties: {
                conflict_type: {
                  type: "string",
                  enum: ["direct_contradiction", "timeline_inconsistency", "confidence_conflict", "status_mismatch", "logical_inconsistency"]
                },
                severity: {
                  type: "string",
                  enum: ["critical", "high", "medium", "low"]
                },
                fact_ids: {
                  type: "array",
                  items: { type: "string" }
                },
                description: { type: "string" },
                recommended_action: { type: "string" }
              }
            }
          },
          overall_consistency_score: { type: "number" },
          summary: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      conflicts: conflicts.conflicts_detected || [],
      consistency_score: conflicts.overall_consistency_score || 0,
      summary: conflicts.summary || '',
      total_facts_analyzed: allFacts.length,
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing fact conflicts:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});