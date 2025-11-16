import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Fetch Social Media Trends
 * Sources: Twitter API, AI-powered trend analysis
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            query,
            hashtags = [],
            accounts = [],
            max_results = 50,
            analyze_sentiment = true
        } = await req.json();

        if (!query && hashtags.length === 0 && accounts.length === 0) {
            return Response.json({ 
                error: 'At least one of query, hashtags, or accounts is required' 
            }, { status: 400 });
        }

        const twitterToken = Deno.env.get("TWITTER_BEARER_TOKEN");
        
        let tweets = [];
        let trends = null;

        // Fetch from Twitter API
        if (twitterToken) {
            // Build search query
            let searchQuery = query || '';
            if (hashtags.length > 0) {
                searchQuery += (searchQuery ? ' ' : '') + hashtags.map(h => `#${h}`).join(' OR ');
            }
            if (accounts.length > 0) {
                searchQuery += (searchQuery ? ' ' : '') + accounts.map(a => `from:${a}`).join(' OR ');
            }

            // Twitter API v2 - Recent search
            const searchParams = new URLSearchParams({
                query: searchQuery,
                max_results: Math.min(max_results, 100).toString(),
                'tweet.fields': 'created_at,public_metrics,author_id,entities',
                'user.fields': 'username,verified,public_metrics',
                'expansions': 'author_id'
            });

            const response = await fetch(
                `https://api.twitter.com/2/tweets/search/recent?${searchParams.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${twitterToken}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                
                // Map users for easy lookup
                const usersMap = {};
                if (data.includes?.users) {
                    data.includes.users.forEach(user => {
                        usersMap[user.id] = user;
                    });
                }

                tweets = (data.data || []).map(tweet => {
                    const author = usersMap[tweet.author_id] || {};
                    return {
                        id: tweet.id,
                        text: tweet.text,
                        created_at: tweet.created_at,
                        author: {
                            username: author.username,
                            verified: author.verified,
                            followers: author.public_metrics?.followers_count
                        },
                        metrics: {
                            retweets: tweet.public_metrics?.retweet_count || 0,
                            replies: tweet.public_metrics?.reply_count || 0,
                            likes: tweet.public_metrics?.like_count || 0,
                            quotes: tweet.public_metrics?.quote_count || 0
                        },
                        entities: tweet.entities,
                        engagement_score: calculateEngagement(tweet.public_metrics)
                    };
                });

                // Sort by engagement
                tweets.sort((a, b) => b.engagement_score - a.engagement_score);
            }
        }

        // AI-powered trend analysis
        if (analyze_sentiment && tweets.length > 0) {
            const topTweets = tweets.slice(0, 20).map((t, i) => 
                `${i + 1}. @${t.author.username} (${t.metrics.likes} likes, ${t.metrics.retweets} RTs): ${t.text}`
            ).join('\n\n');

            const trendPrompt = `Analyze these social media posts about "${query || hashtags.join(', ')}":

${topTweets}

Provide strategic trend analysis as JSON:
{
  "overall_sentiment": "positive" | "negative" | "mixed",
  "sentiment_score": -100 to 100,
  "engagement_level": "low" | "moderate" | "high" | "viral",
  "key_themes": ["theme1", "theme2"],
  "influencer_mentions": [{"username": "user1", "impact": "high"}],
  "trending_topics": ["topic1"],
  "potential_opportunities": ["opportunity1"],
  "risks_concerns": ["concern1"],
  "market_implications": "brief analysis",
  "confidence": 85
}`;

            trends = await base44.integrations.Core.InvokeLLM({
                prompt: trendPrompt,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_sentiment: { type: "string" },
                        sentiment_score: { type: "number" },
                        engagement_level: { type: "string" },
                        key_themes: { type: "array", items: { type: "string" } },
                        influencer_mentions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    username: { type: "string" },
                                    impact: { type: "string" }
                                }
                            }
                        },
                        trending_topics: { type: "array", items: { type: "string" } },
                        potential_opportunities: { type: "array", items: { type: "string" } },
                        risks_concerns: { type: "array", items: { type: "string" } },
                        market_implications: { type: "string" },
                        confidence: { type: "number" }
                    }
                }
            });

            trends.analyzed_posts = tweets.length;
            trends.total_engagement = tweets.reduce((sum, t) => 
                sum + t.metrics.likes + t.metrics.retweets + t.metrics.replies, 0
            );
        }

        // Extract hashtag frequency
        const hashtagFrequency = {};
        tweets.forEach(tweet => {
            tweet.entities?.hashtags?.forEach(tag => {
                const hashtag = tag.tag.toLowerCase();
                hashtagFrequency[hashtag] = (hashtagFrequency[hashtag] || 0) + 1;
            });
        });

        const topHashtags = Object.entries(hashtagFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([tag, count]) => ({ hashtag: tag, count }));

        return Response.json({
            success: true,
            posts: tweets,
            total_results: tweets.length,
            trends,
            top_hashtags: topHashtags,
            query: query || hashtags.join(', '),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Social trends error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

function calculateEngagement(metrics) {
    if (!metrics) return 0;
    
    const likes = metrics.like_count || 0;
    const retweets = metrics.retweet_count || 0;
    const replies = metrics.reply_count || 0;
    const quotes = metrics.quote_count || 0;
    
    // Weighted engagement score
    return (likes * 1) + (retweets * 3) + (replies * 2) + (quotes * 4);
}