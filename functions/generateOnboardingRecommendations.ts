import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, goals } = await req.json();

    // Role-based module recommendations
    const roleModules = {
      ceo: ['M5', 'M6', 'M1', 'M11'],
      strategy: ['M5', 'M2', 'M7', 'M6'],
      analyst: ['M1', 'M2', 'M4', 'M5'],
      pm: ['M6', 'M7', 'M3', 'M5'],
      consultant: ['M5', 'M1', 'M2', 'M11']
    };

    // Goal-based workflow recommendations
    const goalWorkflows = {
      market_intelligence: ['Market Analysis Sprint', 'Competitive Monitoring', 'Trend Analysis'],
      competitive_analysis: ['Competitor Deep Dive', 'Market Positioning', 'Tech Stack Analysis'],
      strategy_development: ['Strategic Planning', 'Scenario Modeling', 'Opportunity Matrix'],
      knowledge_management: ['Knowledge Graph Building', 'Document Analysis', 'Insight Synthesis'],
      ai_automation: ['Agent Creation', 'Workflow Automation', 'Custom Agent Training'],
      network_insights: ['Network Mapping', 'Relationship Analysis', 'Influence Mapping']
    };

    // Generate AI-powered recommendations using LLM
    const llmPrompt = `You are an AI advisor for CAIO·AI platform. Generate personalized recommendations for a user with the following profile:

Role: ${role}
Goals: ${goals.join(', ')}

Recommend:
1. Top 4 TSI modules (M1-M11) with priority ranking and brief reason why each is relevant
2. Top 3 suggested workflows based on their goals

Format the response as JSON with:
{
  "modules": [
    {"id": "M5", "name": "Strategic Synthesis", "priority": 1, "reason": "..."},
    ...
  ],
  "workflows": ["workflow name 1", "workflow name 2", "workflow name 3"]
}`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: llmPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          modules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                priority: { type: 'number' },
                reason: { type: 'string' }
              }
            }
          },
          workflows: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    // Fallback recommendations if LLM fails
    const fallbackModules = (roleModules[role] || roleModules.analyst).slice(0, 4).map((id, idx) => ({
      id,
      name: `Module ${id}`,
      priority: idx + 1,
      reason: 'Recommended for your role'
    }));

    const fallbackWorkflows = goals.flatMap(goal => goalWorkflows[goal] || []).slice(0, 3);

    return Response.json({
      modules: llmResponse.modules || fallbackModules,
      workflows: llmResponse.workflows || fallbackWorkflows,
      personalized: !!llmResponse.modules
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return Response.json({ 
      error: error.message,
      modules: [],
      workflows: []
    }, { status: 500 });
  }
});