import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or has playlists
    const isAdmin = user.role === 'admin';
    const userPlaylists = await base44.entities.VideoPlaylist.filter({ user_email: user.email });
    const hasPlaylists = userPlaylists.length > 0;

    if (!isAdmin && !hasPlaylists) {
      return Response.json({ 
        error: 'Access denied. Create a playlist or contact an admin for access.' 
      }, { status: 403 });
    }

    // Get all watch history
    const allWatchHistory = await base44.asServiceRole.entities.VideoWatchHistory.list();
    
    // Get all playlists
    const allPlaylists = await base44.asServiceRole.entities.VideoPlaylist.list();
    
    // Get all videos
    const allVideos = await base44.entities.BlogPost.filter({
      youtube_video_id: { $exists: true },
      status: 'published'
    });

    // Calculate total views
    const totalViews = allWatchHistory.length;

    // Calculate average watch duration
    const totalDuration = allWatchHistory.reduce((sum, watch) => 
      sum + (watch.watch_duration_seconds || 0), 0
    );
    const avgWatchDuration = totalViews > 0 ? Math.round(totalDuration / totalViews) : 0;

    // Calculate completion rate
    const completedWatches = allWatchHistory.filter(w => w.completed).length;
    const completionRate = totalViews > 0 ? Math.round((completedWatches / totalViews) * 100) : 0;

    // Most popular videos
    const videoViewCounts = {};
    allWatchHistory.forEach(watch => {
      const videoId = watch.video_id;
      if (!videoViewCounts[videoId]) {
        videoViewCounts[videoId] = {
          id: videoId,
          title: watch.video_title,
          category: watch.video_category,
          views: 0,
          uniqueViewers: new Set()
        };
      }
      videoViewCounts[videoId].views++;
      videoViewCounts[videoId].uniqueViewers.add(watch.user_email);
    });

    const popularVideos = Object.values(videoViewCounts)
      .map(v => ({
        ...v,
        uniqueViewers: v.uniqueViewers.size
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Category breakdown
    const categoryViews = {};
    allWatchHistory.forEach(watch => {
      const category = watch.video_category || 'Uncategorized';
      categoryViews[category] = (categoryViews[category] || 0) + 1;
    });

    const categoryBreakdown = Object.entries(categoryViews)
      .map(([category, views]) => ({ category, views }))
      .sort((a, b) => b.views - a.views);

    // Views over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const viewsOverTime = {};
    allWatchHistory.forEach(watch => {
      const watchDate = new Date(watch.last_watched_at || watch.created_date);
      if (watchDate >= thirtyDaysAgo) {
        const dateKey = watchDate.toISOString().split('T')[0];
        viewsOverTime[dateKey] = (viewsOverTime[dateKey] || 0) + 1;
      }
    });

    const viewsTrend = Object.entries(viewsOverTime)
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Playlist engagement
    const playlistEngagement = allPlaylists.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      owner: playlist.user_email,
      videoCount: playlist.video_ids?.length || 0,
      isPublic: playlist.is_public
    }))
    .sort((a, b) => b.videoCount - a.videoCount);

    // Unique viewers
    const uniqueViewers = new Set(allWatchHistory.map(w => w.user_email)).size;

    // Active users (watched in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = new Set(
      allWatchHistory
        .filter(w => new Date(w.last_watched_at || w.created_date) >= sevenDaysAgo)
        .map(w => w.user_email)
    ).size;

    return Response.json({
      overview: {
        totalViews,
        uniqueViewers,
        activeUsers,
        avgWatchDuration,
        completionRate,
        totalVideos: allVideos.length,
        totalPlaylists: allPlaylists.length
      },
      popularVideos,
      categoryBreakdown,
      viewsTrend,
      playlistEngagement
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});