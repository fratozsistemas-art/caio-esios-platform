import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('slack');

    if (!accessToken) {
      return Response.json({ 
        error: 'Slack not connected',
        needsAuth: true 
      }, { status: 401 });
    }

    switch (action) {
      case 'list_channels': {
        const response = await fetch(
          'https://slack.com/api/conversations.list?types=public_channel,private_channel',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const result = await response.json();
        return Response.json({ channels: result.channels || [] });
      }

      case 'post_message': {
        const { channel, text, blocks } = data;
        
        const response = await fetch(
          'https://slack.com/api/chat.postMessage',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              channel,
              text,
              blocks
            })
          }
        );

        const result = await response.json();
        return Response.json({ success: result.ok, message: result });
      }

      case 'share_strategy': {
        const { strategyId, channel } = data;
        const strategies = await base44.entities.Strategy.filter({ id: strategyId });
        
        if (strategies.length === 0) {
          return Response.json({ error: 'Strategy not found' }, { status: 404 });
        }

        const strategy = strategies[0];
        const blocks = [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `📊 New Strategy: ${strategy.title}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Category:* ${strategy.category}\n*Priority:* ${strategy.priority}\n*ROI Estimate:* ${strategy.roi_estimate}%`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: strategy.description
            }
          }
        ];

        const response = await fetch(
          'https://slack.com/api/chat.postMessage',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              channel,
              text: `New strategy created: ${strategy.title}`,
              blocks
            })
          }
        );

        const result = await response.json();
        return Response.json({ success: result.ok });
      }

      case 'share_analysis': {
        const { analysisId, channel } = data;
        const analyses = await base44.entities.Analysis.filter({ id: analysisId });
        
        if (analyses.length === 0) {
          return Response.json({ error: 'Analysis not found' }, { status: 404 });
        }

        const analysis = analyses[0];
        const response = await fetch(
          'https://slack.com/api/chat.postMessage',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              channel,
              text: `📈 Analysis Complete: ${analysis.title}`,
              blocks: [
                {
                  type: 'header',
                  text: {
                    type: 'plain_text',
                    text: `📈 ${analysis.title}`
                  }
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `*Type:* ${analysis.type}\n*Confidence:* ${analysis.confidence_score}%`
                  }
                }
              ]
            })
          }
        );

        const result = await response.json();
        return Response.json({ success: result.ok });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Slack sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});