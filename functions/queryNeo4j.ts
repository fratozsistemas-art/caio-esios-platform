import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import neo4j from 'npm:neo4j-driver@5.15.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, params = {} } = await req.json();

    if (!query) {
      return Response.json({ error: 'Query required' }, { status: 400 });
    }

    const uri = Deno.env.get('NEO4J_URI');
    const username = Deno.env.get('NEO4J_USER');
    const password = Deno.env.get('NEO4J_PASSWORD');

    if (!uri || !username || !password) {
      return Response.json({ 
        error: 'Neo4j not configured',
        message: 'Please set NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD in environment variables'
      }, { status: 500 });
    }

    const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    
    try {
      const session = driver.session();
      
      try {
        const result = await session.run(query, params);
        
        const records = result.records.map(record => {
          const obj = {};
          record.keys.forEach(key => {
            const value = record.get(key);
            
            // Handle Neo4j types
            if (value?.constructor?.name === 'Node') {
              obj[key] = {
                id: value.identity.toString(),
                labels: value.labels,
                properties: value.properties
              };
            } else if (value?.constructor?.name === 'Relationship') {
              obj[key] = {
                id: value.identity.toString(),
                type: value.type,
                properties: value.properties,
                start: value.start.toString(),
                end: value.end.toString()
              };
            } else if (value?.constructor?.name === 'Integer') {
              obj[key] = value.toNumber();
            } else {
              obj[key] = value;
            }
          });
          return obj;
        });

        return Response.json({ 
          records,
          summary: {
            counters: result.summary.counters._stats,
            resultAvailableAfter: result.summary.resultAvailableAfter?.toNumber() || 0,
            resultConsumedAfter: result.summary.resultConsumedAfter?.toNumber() || 0
          }
        });
      } finally {
        await session.close();
      }
    } finally {
      await driver.close();
    }
  } catch (error) {
    console.error('Neo4j query error:', error);
    return Response.json({ 
      error: error.message || 'Neo4j query failed'
    }, { status: 500 });
  }
});