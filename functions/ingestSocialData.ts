import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data_source_id } = await req.json();
    
    const dataSources = await base44.entities.DataSource.filter({ id: data_source_id });
    if (!dataSources || dataSources.length === 0) {
      return Response.json({ error: 'Data source not found' }, { status: 404 });
    }

    const dataSource = dataSources[0];
    const startTime = Date.now();

    // Update status
    await base44.entities.DataSource.update(dataSource.id, { status: 'syncing' });

    let itemsProcessed = 0;
    let errors = 0;

    try {
      // Simulated ingestion (replace with actual API calls)
      const mockData = generateMockSocialData(dataSource.type);
      
      for (const connection of mockData.connections) {
        try {
          await base44.entities.LinkedInConnection.create({
            person_id: user.id,
            connection_linkedin_id: connection.id,
            connection_name: connection.name,
            connection_title: connection.title,
            connection_company: connection.company,
            strategic_value: connection.strategic_value,
            industries: connection.industries || [],
            mutual_connections: connection.mutual_connections || 0
          });
          itemsProcessed++;
        } catch (err) {
          errors++;
        }
      }

      // Update sync stats
      await base44.entities.DataSource.update(dataSource.id, {
        status: 'active',
        last_sync_at: new Date().toISOString(),
        sync_stats: {
          items_synced: itemsProcessed,
          errors: errors
        }
      });

      // Log success
      await base44.entities.IntegrationLog.create({
        data_source_id: dataSource.id,
        operation: 'sync',
        status: 'success',
        items_processed: itemsProcessed,
        errors_count: errors,
        duration_ms: Date.now() - startTime
      });

      return Response.json({ 
        success: true,
        items_processed: itemsProcessed,
        errors: errors
      });

    } catch (error) {
      await base44.entities.DataSource.update(dataSource.id, { status: 'error' });
      
      await base44.entities.IntegrationLog.create({
        data_source_id: dataSource.id,
        operation: 'sync',
        status: 'failed',
        error_details: error.message,
        duration_ms: Date.now() - startTime
      });

      throw error;
    }

  } catch (error) {
    console.error('Error ingesting social data:', error);
    return Response.json({ 
      error: error.message || 'Failed to ingest social data' 
    }, { status: 500 });
  }
});

function generateMockSocialData(platform) {
  // Mock data generator for demo purposes
  return {
    connections: [
      {
        id: `${platform}_${Math.random()}`,
        name: 'Example Connection',
        title: 'CEO',
        company: 'Tech Corp',
        strategic_value: 'high',
        industries: ['Technology'],
        mutual_connections: 5
      }
    ]
  };
}