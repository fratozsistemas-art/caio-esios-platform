import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { source_type, credentials, config, name } = await req.json();

    if (!source_type || !credentials) {
      return Response.json({ 
        error: 'source_type and credentials are required' 
      }, { status: 400 });
    }

    // Validate credentials by testing connection
    let validationResult = { valid: false, message: '' };

    switch (source_type) {
      case 'slack':
        if (!credentials.bot_token) {
          return Response.json({ error: 'Slack bot_token required' }, { status: 400 });
        }
        // Test Slack connection
        try {
          const slackResponse = await fetch('https://slack.com/api/auth.test', {
            headers: { 'Authorization': `Bearer ${credentials.bot_token}` }
          });
          const slackData = await slackResponse.json();
          validationResult = { 
            valid: slackData.ok, 
            message: slackData.ok ? `Connected to ${slackData.team}` : slackData.error,
            metadata: { team_id: slackData.team_id, team: slackData.team }
          };
        } catch (error) {
          validationResult = { valid: false, message: error.message };
        }
        break;

      case 'google_drive':
        if (!credentials.access_token) {
          return Response.json({ error: 'Google access_token required' }, { status: 400 });
        }
        // Test Google Drive connection
        try {
          const driveResponse = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
            headers: { 'Authorization': `Bearer ${credentials.access_token}` }
          });
          const driveData = await driveResponse.json();
          validationResult = { 
            valid: !driveData.error, 
            message: driveData.error ? driveData.error.message : 'Connected successfully',
            metadata: { user_email: driveData.user?.emailAddress }
          };
        } catch (error) {
          validationResult = { valid: false, message: error.message };
        }
        break;

      case 'jira':
        if (!credentials.api_token || !credentials.email || !credentials.domain) {
          return Response.json({ 
            error: 'Jira requires api_token, email, and domain' 
          }, { status: 400 });
        }
        // Test Jira connection
        try {
          const auth = btoa(`${credentials.email}:${credentials.api_token}`);
          const jiraResponse = await fetch(`https://${credentials.domain}.atlassian.net/rest/api/3/myself`, {
            headers: { 'Authorization': `Basic ${auth}` }
          });
          const jiraData = await jiraResponse.json();
          validationResult = { 
            valid: !jiraData.errorMessages, 
            message: jiraData.errorMessages ? jiraData.errorMessages[0] : 'Connected successfully',
            metadata: { display_name: jiraData.displayName }
          };
        } catch (error) {
          validationResult = { valid: false, message: error.message };
        }
        break;

      default:
        validationResult = { valid: true, message: 'Connection type not validated' };
    }

    if (!validationResult.valid) {
      return Response.json({ 
        error: 'Connection validation failed',
        details: validationResult.message 
      }, { status: 400 });
    }

    // Create data source record
    const dataSource = await base44.asServiceRole.entities.DataSource.create({
      name: name || `${source_type} - ${user.email}`,
      type: source_type,
      status: 'active',
      credentials: credentials,
      config: {
        sync_frequency: config?.sync_frequency || 'daily',
        data_types: config?.data_types || [],
        filters: config?.filters || {},
        ...config
      },
      last_sync_at: new Date().toISOString(),
      sync_stats: {
        items_synced: 0,
        entities_created: 0,
        relationships_created: 0,
        errors: 0
      },
      created_by: user.email
    });

    return Response.json({
      success: true,
      data_source: {
        id: dataSource.id,
        name: dataSource.name,
        type: dataSource.type,
        status: dataSource.status,
        validation: validationResult
      }
    });

  } catch (error) {
    console.error('Connect data source error:', error);
    return Response.json({ 
      error: 'Failed to connect data source',
      details: error.message
    }, { status: 500 });
  }
});