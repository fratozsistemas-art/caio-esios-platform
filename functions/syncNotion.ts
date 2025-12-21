import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('notion');

    if (!accessToken) {
      return Response.json({ 
        error: 'Notion not connected',
        needsAuth: true 
      }, { status: 401 });
    }

    const notionHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    };

    switch (action) {
      case 'list_databases': {
        const response = await fetch(
          'https://api.notion.com/v1/search',
          {
            method: 'POST',
            headers: notionHeaders,
            body: JSON.stringify({
              filter: { property: 'object', value: 'database' }
            })
          }
        );

        const result = await response.json();
        return Response.json({ databases: result.results || [] });
      }

      case 'create_page': {
        const { databaseId, properties, content } = data;
        
        const response = await fetch(
          'https://api.notion.com/v1/pages',
          {
            method: 'POST',
            headers: notionHeaders,
            body: JSON.stringify({
              parent: { database_id: databaseId },
              properties,
              children: content || []
            })
          }
        );

        const result = await response.json();
        return Response.json({ page: result });
      }

      case 'export_strategy': {
        const { strategyId, databaseId } = data;
        const strategies = await base44.entities.Strategy.filter({ id: strategyId });
        
        if (strategies.length === 0) {
          return Response.json({ error: 'Strategy not found' }, { status: 404 });
        }

        const strategy = strategies[0];
        
        const properties = {
          Name: {
            title: [
              {
                text: { content: strategy.title }
              }
            ]
          },
          Category: {
            select: { name: strategy.category }
          },
          Priority: {
            select: { name: strategy.priority }
          },
          Status: {
            select: { name: strategy.status }
          },
          'ROI Estimate': {
            number: strategy.roi_estimate
          }
        };

        const content = [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ text: { content: 'Description' } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: strategy.description || '' } }]
            }
          }
        ];

        if (strategy.key_insights && strategy.key_insights.length > 0) {
          content.push({
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ text: { content: 'Key Insights' } }]
            }
          });

          strategy.key_insights.forEach(insight => {
            content.push({
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: {
                rich_text: [{ text: { content: insight } }]
              }
            });
          });
        }

        const response = await fetch(
          'https://api.notion.com/v1/pages',
          {
            method: 'POST',
            headers: notionHeaders,
            body: JSON.stringify({
              parent: { database_id: databaseId },
              properties,
              children: content
            })
          }
        );

        const result = await response.json();
        return Response.json({ success: true, pageId: result.id });
      }

      case 'export_analysis': {
        const { analysisId, databaseId } = data;
        const analyses = await base44.entities.Analysis.filter({ id: analysisId });
        
        if (analyses.length === 0) {
          return Response.json({ error: 'Analysis not found' }, { status: 404 });
        }

        const analysis = analyses[0];
        
        const properties = {
          Name: {
            title: [
              {
                text: { content: analysis.title }
              }
            ]
          },
          Type: {
            select: { name: analysis.type }
          },
          Status: {
            select: { name: analysis.status }
          },
          'Confidence Score': {
            number: analysis.confidence_score
          }
        };

        const response = await fetch(
          'https://api.notion.com/v1/pages',
          {
            method: 'POST',
            headers: notionHeaders,
            body: JSON.stringify({
              parent: { database_id: databaseId },
              properties
            })
          }
        );

        const result = await response.json();
        return Response.json({ success: true, pageId: result.id });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Notion sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});