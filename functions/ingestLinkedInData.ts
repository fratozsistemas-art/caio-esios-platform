import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get LinkedIn data source
    const sources = await base44.asServiceRole.entities.DataSource.filter({
      type: 'linkedin',
      created_by: user.email,
      status: 'active'
    });

    if (sources.length === 0) {
      return Response.json({ 
        error: 'No active LinkedIn connection found' 
      }, { status: 404 });
    }

    const source = sources[0];
    const accessToken = source.credentials.access_token;

    // Fetch connections
    const connectionsResponse = await fetch(
      'https://api.linkedin.com/v2/connections?q=viewer&start=0&count=500',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'LinkedIn-Version': '202401'
        }
      }
    );

    const connectionsData = await connectionsResponse.json();
    const connections = connectionsData.elements || [];

    // Fetch detailed profile data for each connection
    const enrichedConnections = [];
    for (const conn of connections.slice(0, 100)) { // Limit to avoid rate limits
      try {
        const profileResponse = await fetch(
          `https://api.linkedin.com/v2/people/${conn.to}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          enrichedConnections.push({
            id: conn.to,
            firstName: profileData.localizedFirstName,
            lastName: profileData.localizedLastName,
            headline: profileData.headline,
            profileUrl: `https://www.linkedin.com/in/${profileData.vanityName || conn.to}`,
            connectedAt: conn.createdAt
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }

    // Update sync stats
    await base44.asServiceRole.entities.DataSource.update(source.id, {
      last_sync_at: new Date().toISOString(),
      sync_stats: {
        items_synced: enrichedConnections.length,
        last_sync_success: true
      }
    });

    return Response.json({
      success: true,
      connections: enrichedConnections,
      total: enrichedConnections.length
    });

  } catch (error) {
    console.error('LinkedIn ingest error:', error);
    return Response.json({ 
      error: 'Failed to ingest LinkedIn data',
      details: error.message
    }, { status: 500 });
  }
});