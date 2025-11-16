import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platform, access_token, config } = await req.json();
    
    if (!platform || !access_token) {
      return Response.json({ error: 'Platform and access_token required' }, { status: 400 });
    }

    const validPlatforms = ['facebook', 'instagram', 'whatsapp'];
    if (!validPlatforms.includes(platform)) {
      return Response.json({ error: 'Invalid platform' }, { status: 400 });
    }

    const startTime = Date.now();

    // Create DataSource
    const dataSource = await base44.entities.DataSource.create({
      name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} - ${user.email}`,
      type: platform,
      status: 'active',
      credentials: {
        access_token: access_token,
        connected_at: new Date().toISOString()
      },
      config: {
        sync_frequency: config?.sync_frequency || 'daily',
        data_types: config?.data_types || ['connections', 'messages', 'posts']
      },
      last_sync_at: new Date().toISOString()
    });

    // Log success
    await base44.entities.IntegrationLog.create({
      data_source_id: dataSource.id,
      operation: 'connect',
      status: 'success',
      duration_ms: Date.now() - startTime,
      metadata: {
        platform,
        user_email: user.email
      }
    });

    return Response.json({ 
      success: true,
      data_source: dataSource,
      message: `${platform} conectado com sucesso!`
    });

  } catch (error) {
    console.error('Error connecting social media:', error);
    return Response.json({ 
      error: error.message || 'Failed to connect social media' 
    }, { status: 500 });
  }
});