import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch data for predictions
    const [strategies, workspaces, tsiProjects] = await Promise.all([
      base44.entities.Strategy.list(),
      base44.entities.Workspace.list(),
      base44.entities.TSIProject?.list() || Promise.resolve([])
    ]);

    // Use AI to generate predictive insights
    const llmPrompt = `Analyze the following data and provide predictive insights:

Total Strategies: ${strategies.length}
Completed: ${strategies.filter(s => s.status === 'validated').length}
In Progress: ${strategies.filter(s => s.status === 'analyzing').length}

Active Workspaces: ${workspaces.filter(w => w.status === 'active').length}
Paused Workspaces: ${workspaces.filter(w => w.status === 'paused').length}

TSI Projects: ${tsiProjects.length}

Provide:
1. 3-5 predictive insights about future trends
2. Project completion forecasts for top 3 active projects
3. Recommendations for optimization

Format as JSON:
{
  "insights": [
    {
      "title": "insight title",
      "description": "detailed description",
      "confidence": 85
    }
  ],
  "completion_forecast": [
    {
      "name": "project name",
      "progress": 65,
      "estimated_completion": "2 weeks",
      "risk": "low|medium|high"
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: llmPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                confidence: { type: 'number' }
              }
            }
          },
          completion_forecast: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                progress: { type: 'number' },
                estimated_completion: { type: 'string' },
                risk: { type: 'string' }
              }
            }
          },
          recommendations: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    // Fallback predictions
    const fallbackData = {
      insights: [
        {
          title: 'Increased Strategic Activity',
          description: 'Based on current trends, expect 20% increase in strategy creation next month',
          confidence: 75
        },
        {
          title: 'Workspace Optimization Opportunity',
          description: 'Several workspaces show low activity - consolidation recommended',
          confidence: 82
        }
      ],
      completion_forecast: workspaces.filter(w => w.status === 'active').slice(0, 3).map(w => ({
        name: w.name,
        progress: w.progress_percentage || 0,
        estimated_completion: '2-3 weeks',
        risk: w.progress_percentage > 70 ? 'low' : 'medium'
      })),
      recommendations: [
        'Focus on completing in-progress strategies before starting new ones',
        'Increase collaboration between team members',
        'Regular knowledge graph updates recommended'
      ]
    };

    return Response.json(llmResponse || fallbackData);

  } catch (error) {
    console.error('Error generating predictions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});