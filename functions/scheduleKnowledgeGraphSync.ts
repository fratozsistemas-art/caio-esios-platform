import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Scheduled function to run automated graph building
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all users with active data sources
    const dataSources = await base44.asServiceRole.entities.DataSource.filter({ 
      status: 'active' 
    });

    if (dataSources.length === 0) {
      return Response.json({
        success: true,
        message: 'No active data sources to sync'
      });
    }

    // Group by user
    const userSources = {};
    for (const source of dataSources) {
      const userId = source.created_by;
      if (!userSources[userId]) {
        userSources[userId] = [];
      }
      userSources[userId].push(source);
    }

    const results = [];

    // Run sync for each user with active sources
    for (const [userId, sources] of Object.entries(userSources)) {
      try {
        // Call the automated graph builder
        const response = await base44.asServiceRole.functions.invoke('runAutomatedGraphBuilder', {});

        results.push({
          user: userId,
          success: true,
          stats: response.data?.stats
        });
      } catch (error) {
        console.error(`Error syncing for user ${userId}:`, error);
        results.push({
          user: userId,
          success: false,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: 'Knowledge graph sync completed',
      results: results,
      users_processed: Object.keys(userSources).length,
      executed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Schedule sync error:', error);
    return Response.json({ 
      error: 'Failed to run scheduled sync',
      details: error.message
    }, { status: 500 });
  }
});