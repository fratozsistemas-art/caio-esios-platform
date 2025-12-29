import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    // Get all videos without AI summaries
    const videos = await base44.asServiceRole.entities.BlogPost.filter({
      youtube_video_id: { $exists: true },
      status: 'published'
    });

    const videosNeedingSummary = videos.filter(v => !v.ai_summary);

    if (videosNeedingSummary.length === 0) {
      return Response.json({ 
        message: 'All videos already have summaries',
        processed: 0
      });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    let processed = 0;
    const results = [];

    // Process in batches to avoid rate limits
    for (const video of videosNeedingSummary.slice(0, 10)) {
      try {
        const prompt = `Based on the following video information, generate:
1. A concise 1-2 sentence summary (max 150 characters)
2. 5 relevant tags/keywords

Video Title: ${video.title}
Category: ${video.category || 'N/A'}
Description: ${video.excerpt || video.content?.substring(0, 500) || 'N/A'}

Return ONLY a JSON object with this exact format:
{"summary": "...", "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 200
          })
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        await base44.asServiceRole.entities.BlogPost.update(video.id, {
          ai_summary: result.summary,
          ai_tags: result.tags
        });

        processed++;
        results.push({ id: video.id, title: video.title, success: true });

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing video ${video.id}:`, error);
        results.push({ id: video.id, title: video.title, success: false, error: error.message });
      }
    }

    return Response.json({
      message: `Processed ${processed} videos`,
      total_videos: videosNeedingSummary.length,
      processed,
      results
    });

  } catch (error) {
    console.error('Batch summary generation error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});