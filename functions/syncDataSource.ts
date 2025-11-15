import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data_source_id } = await req.json();

    const dataSource = await base44.asServiceRole.entities.DataSource.filter({ id: data_source_id });
    
    if (!dataSource || dataSource.length === 0) {
      return Response.json({ error: 'Data source not found' }, { status: 404 });
    }

    const source = dataSource[0];

    // Update status to syncing
    await base44.asServiceRole.entities.DataSource.update(source.id, { status: 'syncing' });

    let syncResult = { items: [], entities_created: 0, relationships_created: 0 };

    try {
      switch (source.type) {
        case 'slack':
          syncResult = await syncSlackData(source, base44);
          break;
        case 'google_drive':
          syncResult = await syncGoogleDriveData(source, base44);
          break;
        case 'jira':
          syncResult = await syncJiraData(source, base44);
          break;
        default:
          throw new Error(`Unsupported data source type: ${source.type}`);
      }

      // Update sync stats
      await base44.asServiceRole.entities.DataSource.update(source.id, {
        status: 'active',
        last_sync_at: new Date().toISOString(),
        sync_stats: {
          items_synced: (source.sync_stats?.items_synced || 0) + syncResult.items.length,
          entities_created: (source.sync_stats?.entities_created || 0) + syncResult.entities_created,
          relationships_created: (source.sync_stats?.relationships_created || 0) + syncResult.relationships_created,
          errors: source.sync_stats?.errors || 0
        }
      });

      return Response.json({
        success: true,
        sync_result: {
          items_synced: syncResult.items.length,
          entities_created: syncResult.entities_created,
          relationships_created: syncResult.relationships_created,
          synced_at: new Date().toISOString()
        }
      });

    } catch (error) {
      await base44.asServiceRole.entities.DataSource.update(source.id, { 
        status: 'error',
        sync_stats: {
          ...source.sync_stats,
          errors: (source.sync_stats?.errors || 0) + 1
        }
      });
      throw error;
    }

  } catch (error) {
    console.error('Sync data source error:', error);
    return Response.json({ 
      error: 'Failed to sync data source',
      details: error.message
    }, { status: 500 });
  }
});

async function syncSlackData(source, base44) {
  const items = [];
  let entities_created = 0;
  let relationships_created = 0;

  // Fetch conversations list
  const conversationsResponse = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel', {
    headers: { 'Authorization': `Bearer ${source.credentials.bot_token}` }
  });
  const conversationsData = await conversationsResponse.json();

  if (!conversationsData.ok) {
    throw new Error(`Slack API error: ${conversationsData.error}`);
  }

  // Process each channel
  for (const channel of conversationsData.channels.slice(0, 10)) {
    items.push({ type: 'channel', name: channel.name, id: channel.id });

    // Create or update channel node in graph
    const existingNode = await base44.entities.KnowledgeGraphNode.filter({
      label: channel.name,
      node_type: 'channel'
    });

    if (existingNode.length === 0) {
      await base44.asServiceRole.entities.KnowledgeGraphNode.create({
        node_type: 'channel',
        label: channel.name,
        properties: {
          platform: 'slack',
          channel_id: channel.id,
          topic: channel.topic?.value,
          purpose: channel.purpose?.value,
          members_count: channel.num_members
        },
        metadata: { data_source_id: source.id }
      });
      entities_created++;
    }
  }

  return { items, entities_created, relationships_created };
}

async function syncGoogleDriveData(source, base44) {
  const items = [];
  let entities_created = 0;
  let relationships_created = 0;

  // Fetch recent files
  const filesResponse = await fetch(
    'https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType,createdTime,modifiedTime,owners,webViewLink)', 
    {
      headers: { 'Authorization': `Bearer ${source.credentials.access_token}` }
    }
  );
  const filesData = await filesResponse.json();

  if (filesData.error) {
    throw new Error(`Google Drive API error: ${filesData.error.message}`);
  }

  for (const file of filesData.files || []) {
    items.push({ type: 'document', name: file.name, id: file.id });

    // Create document node in graph
    const existingNode = await base44.entities.KnowledgeGraphNode.filter({
      label: file.name,
      node_type: 'document'
    });

    if (existingNode.length === 0) {
      await base44.asServiceRole.entities.KnowledgeGraphNode.create({
        node_type: 'document',
        label: file.name,
        properties: {
          platform: 'google_drive',
          file_id: file.id,
          mime_type: file.mimeType,
          link: file.webViewLink,
          created: file.createdTime,
          modified: file.modifiedTime
        },
        metadata: { data_source_id: source.id }
      });
      entities_created++;
    }
  }

  return { items, entities_created, relationships_created };
}

async function syncJiraData(source, base44) {
  const items = [];
  let entities_created = 0;
  let relationships_created = 0;

  const auth = btoa(`${source.credentials.email}:${source.credentials.api_token}`);

  // Fetch projects
  const projectsResponse = await fetch(
    `https://${source.credentials.domain}.atlassian.net/rest/api/3/project/search?maxResults=20`,
    {
      headers: { 'Authorization': `Basic ${auth}` }
    }
  );
  const projectsData = await projectsResponse.json();

  if (projectsData.errorMessages) {
    throw new Error(`Jira API error: ${projectsData.errorMessages[0]}`);
  }

  for (const project of projectsData.values || []) {
    items.push({ type: 'project', name: project.name, key: project.key });

    // Create project node in graph
    const existingNode = await base44.entities.KnowledgeGraphNode.filter({
      label: project.name,
      node_type: 'project'
    });

    if (existingNode.length === 0) {
      await base44.asServiceRole.entities.KnowledgeGraphNode.create({
        node_type: 'project',
        label: project.name,
        properties: {
          platform: 'jira',
          project_key: project.key,
          project_type: project.projectTypeKey,
          lead: project.lead?.displayName
        },
        metadata: { data_source_id: source.id }
      });
      entities_created++;
    }
  }

  return { items, entities_created, relationships_created };
}