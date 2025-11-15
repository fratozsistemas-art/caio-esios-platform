import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { limit = 50 } = await req.json().catch(() => ({}));

    // Get all active data sources
    const dataSources = await base44.asServiceRole.entities.DataSource.filter({ status: 'active' });

    if (dataSources.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No active data sources to ingest',
        items: []
      });
    }

    const allItems = [];

    // Ingest from each source
    for (const source of dataSources) {
      try {
        let items = [];

        switch (source.type) {
          case 'slack':
            items = await ingestSlackData(source, limit);
            break;
          case 'google_drive':
            items = await ingestGoogleDriveData(source, limit);
            break;
          case 'jira':
            items = await ingestJiraData(source, limit);
            break;
        }

        allItems.push(...items.map(item => ({ ...item, source_id: source.id, source_type: source.type })));

      } catch (error) {
        console.error(`Error ingesting from ${source.type}:`, error);
      }
    }

    return Response.json({
      success: true,
      items: allItems,
      sources_processed: dataSources.length,
      total_items: allItems.length
    });

  } catch (error) {
    console.error('Auto ingest error:', error);
    return Response.json({ 
      error: 'Failed to auto ingest data',
      details: error.message
    }, { status: 500 });
  }
});

async function ingestSlackData(source, limit) {
  const items = [];
  
  // Get recent messages from channels
  const channelsResponse = await fetch(
    'https://slack.com/api/conversations.list?types=public_channel&limit=10',
    { headers: { 'Authorization': `Bearer ${source.credentials.bot_token}` }}
  );
  const channelsData = await channelsResponse.json();

  for (const channel of (channelsData.channels || []).slice(0, 5)) {
    const historyResponse = await fetch(
      `https://slack.com/api/conversations.history?channel=${channel.id}&limit=${Math.min(limit, 20)}`,
      { headers: { 'Authorization': `Bearer ${source.credentials.bot_token}` }}
    );
    const historyData = await historyResponse.json();

    for (const message of historyData.messages || []) {
      if (message.text && message.text.length > 20) {
        items.push({
          type: 'message',
          content: message.text,
          channel: channel.name,
          timestamp: message.ts,
          user: message.user
        });
      }
    }
  }

  return items;
}

async function ingestGoogleDriveData(source, limit) {
  const items = [];
  
  const filesResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?pageSize=${limit}&fields=files(id,name,mimeType,description,webViewLink)&orderBy=modifiedTime desc`,
    { headers: { 'Authorization': `Bearer ${source.credentials.access_token}` }}
  );
  const filesData = await filesResponse.json();

  for (const file of filesData.files || []) {
    items.push({
      type: 'document',
      name: file.name,
      mime_type: file.mimeType,
      description: file.description,
      link: file.webViewLink,
      file_id: file.id
    });
  }

  return items;
}

async function ingestJiraData(source, limit) {
  const items = [];
  const auth = btoa(`${source.credentials.email}:${source.credentials.api_token}`);
  
  const issuesResponse = await fetch(
    `https://${source.credentials.domain}.atlassian.net/rest/api/3/search?maxResults=${limit}&fields=summary,description,status,issuetype,assignee,project`,
    { headers: { 'Authorization': `Basic ${auth}` }}
  );
  const issuesData = await issuesResponse.json();

  for (const issue of issuesData.issues || []) {
    items.push({
      type: 'issue',
      key: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description,
      status: issue.fields.status.name,
      issue_type: issue.fields.issuetype.name,
      project: issue.fields.project.name,
      assignee: issue.fields.assignee?.displayName
    });
  }

  return items;
}