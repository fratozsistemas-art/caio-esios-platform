import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, redirect_uri } = await req.json();

    if (!code) {
      return Response.json({ error: 'Authorization code required' }, { status: 400 });
    }

    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri || `${Deno.env.get('BASE44_APP_URL')}/integrations`,
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return Response.json({ 
        error: 'Failed to get access token',
        details: tokenData
      }, { status: 400 });
    }

    // Get user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const profile = await profileResponse.json();

    // Create or update data source
    const existingSources = await base44.asServiceRole.entities.DataSource.filter({
      type: 'linkedin',
      created_by: user.email
    });

    let dataSource;
    if (existingSources.length > 0) {
      dataSource = await base44.asServiceRole.entities.DataSource.update(
        existingSources[0].id,
        {
          status: 'active',
          credentials: {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Date.now() + (tokenData.expires_in * 1000)
          },
          config: {
            profile_id: profile.id,
            profile_name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
            sync_frequency: 'daily',
            data_types: ['connections', 'profile', 'companies']
          }
        }
      );
    } else {
      dataSource = await base44.asServiceRole.entities.DataSource.create({
        name: `LinkedIn - ${profile.localizedFirstName} ${profile.localizedLastName}`,
        type: 'linkedin',
        status: 'active',
        credentials: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: Date.now() + (tokenData.expires_in * 1000)
        },
        config: {
          profile_id: profile.id,
          profile_name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
          sync_frequency: 'daily',
          data_types: ['connections', 'profile', 'companies']
        },
        created_by: user.email
      });
    }

    return Response.json({
      success: true,
      data_source: dataSource,
      profile: profile
    });

  } catch (error) {
    console.error('LinkedIn connection error:', error);
    return Response.json({ 
      error: 'Failed to connect LinkedIn',
      details: error.message
    }, { status: 500 });
  }
});