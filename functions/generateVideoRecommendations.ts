import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's watch history
    const watchHistory = await base44.entities.VideoWatchHistory.filter({
      user_email: user.email
    });

    // Get all available videos (BlogPosts with YouTube)
    const allVideos = await base44.entities.BlogPost.filter({
      youtube_video_id: { $exists: true },
      status: 'published'
    });

    if (watchHistory.length === 0) {
      // New user - recommend popular videos
      return Response.json({
        recommendations: allVideos.slice(0, 6).map(v => ({
          id: v.id,
          title: v.title,
          category: v.category,
          reason: "Popular with other users"
        })),
        reason: "new_user"
      });
    }

    // Analyze user preferences
    const categoryPreferences = {};
    watchHistory.forEach(watch => {
      if (watch.video_category) {
        categoryPreferences[watch.video_category] = (categoryPreferences[watch.video_category] || 0) + 1;
      }
    });

    // Get most watched categories
    const sortedCategories = Object.entries(categoryPreferences)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    // Get watched video IDs
    const watchedIds = new Set(watchHistory.map(w => w.video_id));

    // Use AI to generate recommendations
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    let recommendations = [];

    if (OPENAI_API_KEY) {
      try {
        const prompt = `Based on a user's video watching history, recommend 6 videos from the following list.

User's top watched categories: ${sortedCategories.join(', ')}
Recently watched videos: ${watchHistory.slice(-5).map(w => w.video_title).join(', ')}

Available videos (JSON):
${JSON.stringify(allVideos.filter(v => !watchedIds.has(v.id)).map(v => ({
  id: v.id,
  title: v.title,
  category: v.category,
  excerpt: v.excerpt
})).slice(0, 20))}

Return ONLY a JSON array with format:
[{"video_id": "id", "reason": "why this video is recommended"}]

Prioritize videos in categories the user likes. Provide diverse recommendations.`;

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
            max_tokens: 500
          })
        });

        const data = await response.json();
        const aiRecommendations = JSON.parse(data.choices[0].message.content);

        recommendations = aiRecommendations.map(rec => {
          const video = allVideos.find(v => v.id === rec.video_id);
          return video ? {
            id: video.id,
            title: video.title,
            category: video.category,
            thumbnail: video.featured_image,
            embedUrl: video.video_embed_url,
            reason: rec.reason
          } : null;
        }).filter(Boolean);

      } catch (error) {
        console.error('AI recommendation error:', error);
        // Fallback to rule-based
      }
    }

    // Fallback: Rule-based recommendations
    if (recommendations.length === 0) {
      const unwatchedVideos = allVideos.filter(v => !watchedIds.has(v.id));
      
      // Prioritize by user's preferred categories
      recommendations = unwatchedVideos
        .sort((a, b) => {
          const aScore = sortedCategories.indexOf(a.category || '') !== -1 
            ? sortedCategories.indexOf(a.category) : 999;
          const bScore = sortedCategories.indexOf(b.category || '') !== -1 
            ? sortedCategories.indexOf(b.category) : 999;
          return aScore - bScore;
        })
        .slice(0, 6)
        .map(v => ({
          id: v.id,
          title: v.title,
          category: v.category,
          thumbnail: v.featured_image,
          embedUrl: v.video_embed_url,
          reason: `Based on your interest in ${sortedCategories[0] || 'AI'} content`
        }));
    }

    return Response.json({
      recommendations,
      user_preferences: sortedCategories,
      watch_count: watchHistory.length
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    return Response.json({ 
      error: error.message,
      recommendations: []
    }, { status: 500 });
  }
});