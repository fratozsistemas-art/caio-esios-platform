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
    
    if (!uri) {
      return Response.json({ 
        error: 'Neo4j not configured',
        message: 'Please set NEO4J_URI in environment variables'
      }, { status: 500 });
    }

    // Try API Key authentication first, fallback to basic auth
    const apiKey = Deno.env.get('NEO4J_CLIENT_SECRET');
    const username = Deno.env.get('NEO4J_USER');
    const password = Deno.env.get('NEO4J_PASSWORD');

    let authToken;
    let authMethod;

    if (apiKey) {
      // Use Bearer Token authentication (API Key)
      authToken = neo4j.auth.bearer(apiKey);
      authMethod = 'API Key (Bearer Token)';
      console.log('[Neo4j Import] Using API Key authentication');
    } else if (username && password) {
      // Fallback to basic authentication
      authToken = neo4j.auth.basic(username, password);
      authMethod = 'Basic Auth';
      console.log('[Neo4j Import] Using Basic authentication');
    } else {
      return Response.json({ 
        error: 'Neo4j authentication not configured',
        message: 'Please set either NEO4J_CLIENT_SECRET (for API Key) or NEO4J_USER + NEO4J_PASSWORD (for Basic Auth)'
      }, { status: 500 });
    }

    console.log(`[Neo4j Import] Connecting to: ${uri} using ${authMethod}`);
    const driver = neo4j.driver(uri, authToken);
    
    try {
      // Verify connection
      await driver.verifyConnectivity();
      console.log('[Neo4j Import] Connection verified successfully');

      const session = driver.session();
      
      try {
        console.log('[Neo4j Import] Starting data import...');

        // Load nodes
        console.log('[Neo4j Import] Loading nodes from CSV...');
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
        console.log('[Neo4j Import] Nodes loaded successfully');

        // Load edges
        console.log('[Neo4j Import] Loading relationships from CSV...');
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
        console.log('[Neo4j Import] Relationships loaded successfully');

        // Create indexes
        console.log('[Neo4j Import] Creating indexes...');
        await session.run('CREATE INDEX company_id IF NOT EXISTS FOR (n:Company) ON (n.id)');
        await session.run('CREATE INDEX company_name IF NOT EXISTS FOR (n:Company) ON (n.name)');
        console.log('[Neo4j Import] Indexes created successfully');

        // Get statistics
        const stats = await session.run(`
          MATCH (n) RETURN count(n) as nodeCount
        `);

        const relationshipStats = await session.run(`
          MATCH ()-[r]->() RETURN count(r) as relCount
        `);

        const nodeCount = stats.records[0].get('nodeCount').toNumber();
        const relCount = relationshipStats.records[0].get('relCount').toNumber();

        console.log(`[Neo4j Import] Import completed: ${nodeCount} nodes, ${relCount} relationships`);

        return Response.json({ 
          success: true,
          nodeCount,
          relationshipCount: relCount,
          metadata: {
            authMethod,
            timestamp: new Date().toISOString()
          }
        });
      } finally {
        await session.close();
      }
    } catch (connectionError) {
      console.error('[Neo4j Import] Connection/Import error:', connectionError);
      
      return Response.json({ 
        error: 'Neo4j import failed',
        message: connectionError.message,
        code: connectionError.code,
        details: {
          authMethod,
          uri: uri.replace(/\/\/.*@/, '//***@'),
          suggestion: connectionError.code === 'Neo.ClientError.Security.Unauthorized' 
            ? 'Check your authentication credentials (API Key or Username/Password)'
            : connectionError.code?.includes('Procedure')
            ? 'Ensure APOC plugin is installed in your Neo4j instance'
            : 'Verify CSV files are accessible and Neo4j instance is running'
        }
      }, { status: 500 });
    } finally {
      await driver.close();
    }
  } catch (error) {
    console.error('[Neo4j Import] Handler error:', error);
    return Response.json({ 
      error: 'Import operation failed',
      message: error.message
    }, { status: 500 });
  }
});