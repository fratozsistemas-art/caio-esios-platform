import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await req.json();
    
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    // Try to get channel by forUsername
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id,snippet&forUsername=${username}&key=${YOUTUBE_API_KEY}`
    );
    
    let data = await response.json();
    
    // If not found, try custom URL search
    if (!data.items || data.items.length === 0) {
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${username}&key=${YOUTUBE_API_KEY}`
      );
      data = await searchResponse.json();
    }

    if (!data.items || data.items.length === 0) {
      return Response.json({ error: 'Channel not found' }, { status: 404 });
    }

    const channel = data.items[0];
    
    return Response.json({
      channel_id: channel.id.channelId || channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.high.url
    });

  } catch (error) {
    console.error('Get channel ID error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});