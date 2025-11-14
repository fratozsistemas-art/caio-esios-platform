import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import neo4j from 'npm:neo4j-driver@5.15.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uri = Deno.env.get('NEO4J_URI');
    const apiKey = Deno.env.get('NEO4J_API_KEY');
    const username = Deno.env.get('NEO4J_USER');
    const password = Deno.env.get('NEO4J_PASSWORD');

    if (!uri) {
      return Response.json({ 
        error: 'Neo4j not configured',
        message: 'Please set NEO4J_URI in environment variables'
      }, { status: 500 });
    }

    // Use Bearer token if available, otherwise fall back to basic auth
    let auth;
    if (apiKey) {
      auth = neo4j.auth.bearer(apiKey);
    } else if (username && password) {
      auth = neo4j.auth.basic(username, password);
    } else {
      return Response.json({ 
        error: 'Neo4j authentication not configured',
        message: 'Please set either NEO4J_API_KEY or (NEO4J_USER and NEO4J_PASSWORD)'
      }, { status: 500 });
    }

    const driver = neo4j.driver(uri, auth);
    
    try {
      const session = driver.session();
      
      try {
        // Load nodes
        await session.run(`
          LOAD CSV WITH HEADERS FROM 'file:///kg_nodes_neo4j.csv' AS row
          CALL {
            WITH row
            CALL apoc.create.node([row.label], {
              id: row.id,
              name: row.name,
              type: row.type,
              properties: row.properties
            }) YIELD node
            RETURN node
          }
          IN TRANSACTIONS OF 500 ROWS
        `);

        // Load edges
        await session.run(`
          LOAD CSV WITH HEADERS FROM 'file:///kg_edges_neo4j.csv' AS row
          CALL {
            WITH row
            MATCH (source {id: row.source})
            MATCH (target {id: row.target})
            CALL apoc.create.relationship(source, row.type, {
              properties: row.properties
            }, target) YIELD rel
            RETURN rel
          }
          IN TRANSACTIONS OF 500 ROWS
        `);

        // Create indexes
        await session.run('CREATE INDEX company_id IF NOT EXISTS FOR (n:Company) ON (n.id)');
        await session.run('CREATE INDEX company_name IF NOT EXISTS FOR (n:Company) ON (n.name)');

        const stats = await session.run(`
          MATCH (n) RETURN count(n) as nodeCount
        `);

        const relationshipStats = await session.run(`
          MATCH ()-[r]->() RETURN count(r) as relCount
        `);

        return Response.json({ 
          success: true,
          nodeCount: stats.records[0].get('nodeCount').toNumber(),
          relationshipCount: relationshipStats.records[0].get('relCount').toNumber()
        });
      } finally {
        await session.close();
      }
    } finally {
      await driver.close();
    }
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ 
      error: error.message || 'Import failed'
    }, { status: 500 });
  }
});