import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { narrative_id } = await req.json();

    if (!narrative_id) {
      return Response.json({ 
        error: 'narrative_id is required' 
      }, { status: 400 });
    }

    // Get narrative
    const narratives = await base44.entities.Narrative.filter({ id: narrative_id });
    if (!narratives || narratives.length === 0) {
      return Response.json({ error: 'Narrative not found' }, { status: 404 });
    }

    const narrative = narratives[0];
    const deprecatedFacts = [];
    const needsReview = [];

    // Check each referenced fact
    for (const factId of narrative.fact_ids || []) {
      const facts = await base44.entities.StrategicFact.filter({ id: factId });
      
      if (facts && facts.length > 0) {
        const fact = facts[0];
        
        if (fact.status === 'deprecated') {
          deprecatedFacts.push({
            fact_id: factId,
            detected_at: new Date().toISOString(),
            current_status: fact.status,
            topic: fact.topic_label,
            summary: fact.summary
          });
        } else if (fact.status === 'needs_review') {
          needsReview.push({
            fact_id: factId,
            topic: fact.topic_label,
            summary: fact.summary
          });
        }
      }
    }

    // Update narrative validation status
    const validationStatus = deprecatedFacts.length > 0 
      ? 'has_deprecated_facts' 
      : needsReview.length > 0 
        ? 'needs_update' 
        : 'valid';

    await base44.entities.Narrative.update(narrative_id, {
      deprecated_facts_detected: deprecatedFacts,
      validation_status: validationStatus
    });

    return Response.json({
      success: true,
      narrative_id,
      validation_status: validationStatus,
      deprecated_count: deprecatedFacts.length,
      needs_review_count: needsReview.length,
      deprecated_facts: deprecatedFacts,
      needs_review_facts: needsReview
    });

  } catch (error) {
    console.error('Error validating narrative:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});