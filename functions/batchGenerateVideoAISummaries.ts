import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { action = 'missing', limit = 50 } = await req.json();

    // Fetch videos based on action type
    let videos;
    if (action === 'missing') {
      // Videos without AI summaries or tags
      videos = await base44.asServiceRole.entities.BlogPost.filter({
        youtube_video_id: { $exists: true },
        $or: [
          { ai_summary: { $exists: false } },
          { ai_summary: null },
          { ai_summary: '' },
          { ai_tags: { $exists: false } },
          { ai_tags: null },
          { ai_tags: [] }
        ]
      }, '-created_date', limit);
    } else if (action === 'all') {
      // All videos for regeneration
      videos = await base44.asServiceRole.entities.BlogPost.filter({
        youtube_video_id: { $exists: true }
      }, '-created_date', limit);
    } else {
      return Response.json({ error: 'Invalid action. Use "missing" or "all".' }, { status: 400 });
    }

    const results = {
      total: videos.length,
      processed: 0,
      failed: 0,
      errors: []
    };

    for (const video of videos) {
      try {
        // Generate AI summary and tags
        const prompt = `Analyze this video and provide:
1. A concise 2-3 sentence summary
2. 5 relevant tags (single words or short phrases)

Video Title: ${video.title}
Video Description: ${video.content || video.excerpt || 'No description available'}

Respond in JSON format:
{
  "summary": "your summary here",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are an AI assistant that analyzes video content and generates concise summaries and relevant tags." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        });

        const aiResponse = JSON.parse(response.choices[0].message.content);

        // Update video with AI-generated content
        await base44.asServiceRole.entities.BlogPost.update(video.id, {
          ai_summary: aiResponse.summary,
          ai_tags: aiResponse.tags
        });

        results.processed++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          video_id: video.id,
          video_title: video.title,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: `Batch processing complete. Processed: ${results.processed}, Failed: ${results.failed}, Total: ${results.total}`,
      results
    });

  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});