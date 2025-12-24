import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { facts } = await req.json();

    if (!facts || !Array.isArray(facts)) {
      return Response.json({ 
        error: 'Invalid payload. Expected { facts: [...] }' 
      }, { status: 400 });
    }

    // Import facts in bulk
    const results = {
      imported: [],
      errors: [],
      duplicates: []
    };

    for (const fact of facts) {
      try {
        // Check if fact already exists by topic_id + dimension
        const existing = await base44.entities.StrategicFact.filter({
          topic_id: fact.topic_id,
          dimension: fact.dimension
        });

        if (existing && existing.length > 0) {
          // Create new version instead
          const currentFact = existing[0];
          const newVersion = parseFloat(currentFact.version || "1.0") + 0.1;
          
          const updated = await base44.entities.StrategicFact.create({
            ...fact,
            version: newVersion.toFixed(1),
            previous_version_id: currentFact.id,
            created_by: user.email
          });

          // Mark old version as deprecated if status changed
          if (fact.status !== currentFact.status) {
            await base44.entities.StrategicFact.update(currentFact.id, {
              status: 'deprecated',
              end_date: fact.start_date
            });
          }

          results.imported.push(updated);
        } else {
          // Create new fact
          const created = await base44.entities.StrategicFact.create({
            ...fact,
            version: "1.0",
            created_by: user.email
          });
          results.imported.push(created);
        }
      } catch (error) {
        results.errors.push({
          fact: fact.topic_id,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      imported_count: results.imported.length,
      error_count: results.errors.length,
      results
    });

  } catch (error) {
    console.error('Error importing strategic facts:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});