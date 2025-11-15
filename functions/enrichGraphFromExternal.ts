import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entity_id, data_source_ids } = await req.json();

    // Get the entity to enrich
    const graphNodes = await base44.entities.KnowledgeGraphNode.filter({ id: entity_id });
    
    if (!graphNodes || graphNodes.length === 0) {
      return Response.json({ error: 'Entity not found' }, { status: 404 });
    }

    const entity = graphNodes[0];

    // Get all active data sources or specified ones
    const dataSources = data_source_ids 
      ? await base44.asServiceRole.entities.DataSource.filter({ id: { $in: data_source_ids } })
      : await base44.entities.DataSource.filter({ status: 'active' });

    const enrichments = [];

    // Search across data sources for related information
    for (const source of dataSources) {
      try {
        let sourceData = null;

        switch (source.type) {
          case 'slack':
            sourceData = await searchSlack(entity.label, source.credentials.bot_token);
            break;
          case 'google_drive':
            sourceData = await searchGoogleDrive(entity.label, source.credentials.access_token);
            break;
          case 'jira':
            sourceData = await searchJira(entity.label, source.credentials);
            break;
        }

        if (sourceData && sourceData.results.length > 0) {
          enrichments.push({
            source: source.type,
            data: sourceData.results,
            count: sourceData.results.length
          });
        }
      } catch (error) {
        console.error(`Error searching ${source.type}:`, error);
      }
    }

    // Use AI to analyze and structure the enrichment data
    const aiEnrichment = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze external data to enrich knowledge about: ${entity.label} (${entity.node_type})

External data found:
${JSON.stringify(enrichments, null, 2)}

Provide:
1. KEY INSIGHTS: Important information discovered
2. RELATIONSHIPS: New connections or relationships to map
3. UPDATED PROPERTIES: New attributes to add to the entity
4. STRATEGIC CONTEXT: How this data impacts strategic analysis`,
      response_json_schema: {
        type: "object",
        properties: {
          key_insights: {
            type: "array",
            items: { type: "string" }
          },
          suggested_relationships: {
            type: "array",
            items: {
              type: "object",
              properties: {
                target_entity: { type: "string" },
                relationship_type: { type: "string" },
                context: { type: "string" }
              }
            }
          },
          property_updates: {
            type: "object",
            description: "New properties to add to entity"
          },
          strategic_context: { type: "string" },
          confidence_score: { type: "number" }
        }
      }
    });

    // Update entity with enriched data
    const updatedProperties = {
      ...entity.properties,
      ...aiEnrichment.property_updates,
      enriched_at: new Date().toISOString(),
      enrichment_sources: enrichments.map(e => e.source)
    };

    await base44.asServiceRole.entities.KnowledgeGraphNode.update(entity.id, {
      properties: updatedProperties,
      metadata: {
        ...entity.metadata,
        enrichments: aiEnrichment.key_insights
      }
    });

    return Response.json({
      success: true,
      enrichment: {
        entity_id: entity.id,
        sources_checked: dataSources.length,
        data_found: enrichments.length,
        insights: aiEnrichment.key_insights,
        suggested_relationships: aiEnrichment.suggested_relationships,
        enriched_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Enrich graph error:', error);
    return Response.json({ 
      error: 'Failed to enrich entity',
      details: error.message
    }, { status: 500 });
  }
});

async function searchSlack(query, token) {
  const response = await fetch(`https://slack.com/api/search.messages?query=${encodeURIComponent(query)}&count=10`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  return {
    results: data.messages?.matches?.map(m => ({
      text: m.text,
      user: m.username,
      channel: m.channel?.name,
      timestamp: m.ts
    })) || []
  };
}

async function searchGoogleDrive(query, token) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=fullText contains '${query}'&pageSize=10&fields=files(id,name,webViewLink)`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  const data = await response.json();
  
  return {
    results: data.files?.map(f => ({
      name: f.name,
      link: f.webViewLink,
      id: f.id
    })) || []
  };
}

async function searchJira(query, credentials) {
  const auth = btoa(`${credentials.email}:${credentials.api_token}`);
  const response = await fetch(
    `https://${credentials.domain}.atlassian.net/rest/api/3/search?jql=text~"${query}"&maxResults=10`,
    {
      headers: { 'Authorization': `Basic ${auth}` }
    }
  );
  const data = await response.json();
  
  return {
    results: data.issues?.map(i => ({
      key: i.key,
      summary: i.fields.summary,
      status: i.fields.status.name,
      type: i.fields.issuetype.name
    })) || []
  };
}