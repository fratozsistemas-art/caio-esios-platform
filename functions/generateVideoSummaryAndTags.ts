import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { video_id } = await req.json();

    if (!video_id) {
      return Response.json({ error: 'video_id is required' }, { status: 400 });
    }

    // Get the video/blog post
    const video = await base44.entities.BlogPost.filter({ id: video_id });
    
    if (!video || video.length === 0) {
      return Response.json({ error: 'Video not found' }, { status: 404 });
    }

    const videoData = video[0];

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Generate summary and tags using AI
    const prompt = `Based on the following video information, generate:
1. A concise 1-2 sentence summary (max 150 characters)
2. 5 relevant tags/keywords

Video Title: ${videoData.title}
Category: ${videoData.category || 'N/A'}
Description: ${videoData.excerpt || videoData.content?.substring(0, 500) || 'N/A'}

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

    // Update the video with AI-generated summary and tags
    await base44.entities.BlogPost.update(video_id, {
      ai_summary: result.summary,
      ai_tags: result.tags
    });

    return Response.json({
      success: true,
      summary: result.summary,
      tags: result.tags
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});