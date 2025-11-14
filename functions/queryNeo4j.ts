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
      console.log('[Neo4j] Using API Key authentication');
    } else if (username && password) {
      // Fallback to basic authentication
      authToken = neo4j.auth.basic(username, password);
      authMethod = 'Basic Auth';
      console.log('[Neo4j] Using Basic authentication');
    } else {
      return Response.json({ 
        error: 'Neo4j authentication not configured',
        message: 'Please set either NEO4J_CLIENT_SECRET (for API Key) or NEO4J_USER + NEO4J_PASSWORD (for Basic Auth)'
      }, { status: 500 });
    }

    console.log(`[Neo4j] Connecting to: ${uri} using ${authMethod}`);
    const driver = neo4j.driver(uri, authToken);
    
    try {
      // Verify connection
      await driver.verifyConnectivity();
      console.log('[Neo4j] Connection verified successfully');

      const session = driver.session();
      
      try {
        console.log(`[Neo4j] Executing query: ${query.substring(0, 100)}...`);
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

        console.log(`[Neo4j] Query successful, returned ${records.length} records`);

        return Response.json({ 
          records,
          summary: {
            counters: result.summary.counters._stats,
            resultAvailableAfter: result.summary.resultAvailableAfter?.toNumber() || 0,
            resultConsumedAfter: result.summary.resultConsumedAfter?.toNumber() || 0
          },
          metadata: {
            authMethod,
            recordCount: records.length
          }
        });
      } finally {
        await session.close();
      }
    } catch (connectionError) {
      console.error('[Neo4j] Connection/Query error:', connectionError);
      
      // Detailed error logging
      return Response.json({ 
        error: 'Neo4j operation failed',
        message: connectionError.message,
        code: connectionError.code,
        details: {
          authMethod,
          uri: uri.replace(/\/\/.*@/, '//***@'), // Mask credentials in URI
          suggestion: connectionError.code === 'Neo.ClientError.Security.Unauthorized' 
            ? 'Check your authentication credentials (API Key or Username/Password)'
            : 'Verify Neo4j instance is running and accessible'
        }
      }, { status: 500 });
    } finally {
      await driver.close();
    }
  } catch (error) {
    console.error('[Neo4j] Handler error:', error);
    return Response.json({ 
      error: 'Neo4j query failed',
      message: error.message
    }, { status: 500 });
  }
});