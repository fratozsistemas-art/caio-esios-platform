import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel_url, max_results = 10 } = await req.json();
    
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    // Extract channel ID from URL
    const channelId = await extractChannelId(channel_url, YOUTUBE_API_KEY);
    
    // Get channel details
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      return Response.json({ error: 'Channel not found' }, { status: 404 });
    }

    const channel = channelData.items[0];
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

    // Get videos from uploads playlist
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=${max_results}&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
    );
    const videosData = await videosResponse.json();

    if (!videosData.items) {
      return Response.json({ error: 'No videos found' }, { status: 404 });
    }

    const results = {
      created: 0,
      skipped: 0,
      updated: 0,
      errors: 0
    };

    // Process each video
    for (const item of videosData.items) {
      try {
        const videoId = item.contentDetails.videoId;
        
        // Check if already exists
        const existingPosts = await base44.asServiceRole.entities.BlogPost.filter({
          youtube_video_id: videoId
        });

        if (existingPosts && existingPosts.length > 0) {
          results.skipped++;
          continue;
        }

        // Get detailed video info
        const videoDetailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );
        const videoDetails = await videoDetailsResponse.json();
        const video = videoDetails.items[0];

        // Generate blog post content
        const content = generateBlogContent(video);
        
        // Create blog post
        await base44.asServiceRole.entities.BlogPost.create({
          title: video.snippet.title,
          content: content,
          excerpt: video.snippet.description.substring(0, 200) + '...',
          featured_image: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
          author: channel.snippet.title,
          category: 'AI',
          tags: video.snippet.tags || ['AI', 'YouTube'],
          status: 'published',
          published_at: video.snippet.publishedAt,
          youtube_video_id: videoId,
          youtube_channel: channel.snippet.title,
          video_embed_url: `https://www.youtube.com/embed/${videoId}`,
          view_count: parseInt(video.statistics.viewCount) || 0
        });

        results.created++;
      } catch (error) {
        console.error(`Error processing video:`, error);
        results.errors++;
      }
    }

    return Response.json({
      success: true,
      channel: channel.snippet.title,
      results,
      message: `Synced ${results.created} new posts, skipped ${results.skipped} existing, ${results.errors} errors`
    });

  } catch (error) {
    console.error('YouTube sync error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});

async function extractChannelId(url, apiKey) {
  // Handle @username format - need to convert to channel ID
  if (url.includes('@')) {
    const username = url.split('@')[1].split('/')[0].split('?')[0];
    
    // Use forUsername API to get channel ID
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${username}&key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].id;
    }
    
    throw new Error(`Channel not found for @${username}`);
  }
  
  // Handle /channel/ format
  if (url.includes('/channel/')) {
    return url.split('/channel/')[1].split('/')[0].split('?')[0];
  }
  
  // Assume it's already a channel ID
  return url;
}

function generateBlogContent(video) {
  const { snippet, statistics } = video;
  
  let content = `# ${snippet.title}\n\n`;
  
  content += `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 2rem 0;">\n`;
  content += `  <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" `;
  content += `src="https://www.youtube.com/embed/${video.id}" `;
  content += `frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n`;
  content += `</div>\n\n`;
  
  content += `## Sobre este vídeo\n\n`;
  content += `${snippet.description}\n\n`;
  
  content += `---\n\n`;
  content += `**Publicado em:** ${new Date(snippet.publishedAt).toLocaleDateString('pt-BR')}\n\n`;
  content += `**Visualizações:** ${parseInt(statistics.viewCount).toLocaleString('pt-BR')}\n\n`;
  
  if (snippet.tags && snippet.tags.length > 0) {
    content += `**Tags:** ${snippet.tags.join(', ')}\n\n`;
  }
  
  content += `---\n\n`;
  content += `*Este conteúdo foi importado automaticamente do canal [${snippet.channelTitle}](https://www.youtube.com/channel/${snippet.channelId}) no YouTube.*\n`;
  
  return content;
}