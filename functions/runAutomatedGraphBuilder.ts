import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 1: Auto-ingest data from all sources
    const ingestResponse = await base44.functions.invoke('autoIngestDataSources', {
      limit: 50
    });

    if (!ingestResponse.data?.success || !ingestResponse.data?.items?.length) {
      return Response.json({
        success: true,
        message: 'No new data to process',
        stats: { items_ingested: 0, nodes_created: 0, relationships_created: 0 }
      });
    }

    const items = ingestResponse.data.items;

    // Step 2: Build graph using AI
    const buildResponse = await base44.functions.invoke('aiGraphBuilder', {
      items: items
    });

    if (!buildResponse.data?.success) {
      throw new Error('Graph building failed');
    }

    const results = buildResponse.data.results;

    // Step 3: Create notification for user
    await base44.asServiceRole.entities.Notification.create({
      user_email: user.email,
      title: '🤖 Knowledge Graph Auto-Updated',
      message: `AI agent processed ${items.length} items from connected sources and created ${results.nodes_created} new entities and ${results.relationships_created} relationships.`,
      type: 'info',
      severity: 'medium',
      data_snapshot: {
        themes: results.themes,
        sources_processed: ingestResponse.data.sources_processed
      }
    });

    return Response.json({
      success: true,
      stats: {
        items_ingested: items.length,
        sources_processed: ingestResponse.data.sources_processed,
        nodes_created: results.nodes_created,
        relationships_created: results.relationships_created,
        themes_identified: results.themes?.length || 0
      },
      themes: results.themes,
      executed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Automated graph builder error:', error);
    return Response.json({ 
      error: 'Failed to run automated graph builder',
      details: error.message
    }, { status: 500 });
  }
});