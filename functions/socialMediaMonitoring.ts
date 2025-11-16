import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { keywords, entities = [], time_range = '24h' } = await req.json();

        const monitoringResults = {
            keywords,
            entities,
            time_range,
            platforms: [],
            insights: {},
            timestamp: new Date().toISOString()
        };

        // Twitter Monitoring
        if (Deno.env.get('TWITTER_BEARER_TOKEN')) {
            try {
                monitoringResults.platforms.push('twitter');

                const query = keywords.join(' OR ');
                const twitterRes = await fetch(
                    `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=100&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username,verified`,
                    {
                        headers: {
                            'Authorization': `Bearer ${Deno.env.get('TWITTER_BEARER_TOKEN')}`
                        }
                    }
                );
                const twitterData = await twitterRes.json();

                const tweets = twitterData.data || [];
                const users = twitterData.includes?.users || [];

                // Analyze trends
                const hourlyDistribution = {};
                tweets.forEach(tweet => {
                    const hour = new Date(tweet.created_at).getHours();
                    hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
                });

                // Top influencers
                const influencers = users
                    .map(u => {
                        const userTweets = tweets.filter(t => t.author_id === u.id);
                        const totalEngagement = userTweets.reduce((sum, t) => 
                            sum + (t.public_metrics?.like_count || 0) + 
                            (t.public_metrics?.retweet_count || 0), 0
                        );
                        return { ...u, tweet_count: userTweets.length, engagement: totalEngagement };
                    })
                    .sort((a, b) => b.engagement - a.engagement)
                    .slice(0, 10);

                monitoringResults.insights.twitter = {
                    total_tweets: tweets.length,
                    hourly_distribution: hourlyDistribution,
                    top_influencers: influencers,
                    avg_engagement: tweets.length > 0 ? 
                        tweets.reduce((sum, t) => sum + (t.public_metrics?.like_count || 0), 0) / tweets.length : 0
                };

                // Use LLM to extract key themes
                const themesPrompt = `Analyze these ${tweets.length} tweets about "${keywords.join(', ')}" and identify:
1. Key themes and topics
2. Sentiment trends
3. Emerging narratives
4. Notable discussions

Tweets sample: ${tweets.slice(0, 20).map(t => t.text).join('\n---\n')}`;

                const themes = await base44.integrations.Core.InvokeLLM({
                    prompt: themesPrompt,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            key_themes: { type: "array", items: { type: "string" } },
                            sentiment_trend: { type: "string" },
                            emerging_narratives: { type: "array", items: { type: "string" } },
                            notable_discussions: { type: "array", items: { type: "string" } }
                        }
                    }
                });

                monitoringResults.insights.twitter.themes = themes;

            } catch (error) {
                monitoringResults.insights.twitter = { error: error.message };
            }
        }

        // LinkedIn Insights (if configured)
        if (Deno.env.get('LINKEDIN_CLIENT_ID') && Deno.env.get('LINKEDIN_CLIENT_SECRET')) {
            monitoringResults.platforms.push('linkedin');
            monitoringResults.insights.linkedin = {
                status: 'configured',
                note: 'Requires OAuth flow for data access'
            };
        }

        // Web mentions via LLM
        try {
            const webMentionsPrompt = `Search the web for recent mentions of: ${keywords.join(', ')}

Provide:
1. Number of recent mentions
2. Sentiment of mentions (positive/negative/neutral)
3. Key sources mentioning these topics
4. Notable quotes or headlines`;

            const webMentions = await base44.integrations.Core.InvokeLLM({
                prompt: webMentionsPrompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        mention_count: { type: "number" },
                        sentiment: { type: "string" },
                        key_sources: { type: "array", items: { type: "string" } },
                        notable_quotes: { type: "array", items: { type: "string" } }
                    }
                }
            });

            monitoringResults.insights.web_mentions = webMentions;
        } catch (error) {
            monitoringResults.insights.web_mentions = { error: error.message };
        }

        // Save monitoring results as entities
        for (const entity of entities) {
            await base44.asServiceRole.entities.KnowledgeGraphNode.update(entity.id, {
                properties: {
                    last_monitored: new Date().toISOString(),
                    social_monitoring: monitoringResults.insights
                }
            });
        }

        return Response.json({
            success: true,
            monitoring: monitoringResults,
            platforms_monitored: monitoringResults.platforms.length
        });

    } catch (error) {
        console.error('Social media monitoring error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});