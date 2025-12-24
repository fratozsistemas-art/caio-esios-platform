import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, inputs } = await req.json();

    if (!action || !action.title) {
      return Response.json({ error: 'Action title required' }, { status: 400 });
    }

    // Build prompt based on action type
    let systemPrompt = '';
    let userPrompt = '';

    switch (action.category) {
      case 'Strategy':
        systemPrompt = `You are a strategic business intelligence analyst. Analyze market positioning, competitive landscape, and provide actionable strategic recommendations.`;
        userPrompt = `Generate a comprehensive strategic intelligence analysis for: ${action.title}
        
Theme: ${action.theme}
Context: ${inputs?.context || 'General business strategy analysis'}

Provide:
1. Análise competitiva (competitive landscape, key players, market dynamics)
2. Mapeamento de mercado (market trends, opportunities, threats)
3. Plano de ação estratégico (3-5 prioritized strategic actions with timelines)

Format as structured JSON with these exact keys: analise_competitiva, mapeamento_mercado, plano_acao`;
        break;

      case 'Security':
        systemPrompt = `You are a cybersecurity expert specializing in threat modeling and security posture assessments.`;
        userPrompt = `Perform a security posture review for: ${action.title}
        
Theme: ${action.theme}
Context: ${inputs?.context || 'Enterprise security assessment'}

Provide:
1. Inventário de riscos (identify top 5-7 security risks with severity levels)
2. Checklist de compliance (LGPD, ISO 27001, SOC 2 key controls)
3. Plano de mitigação (prioritized remediation steps with estimated effort)

Format as structured JSON with these exact keys: inventario_riscos, checklist_compliance, plano_mitigacao`;
        break;

      case 'Operations':
        systemPrompt = `You are a Site Reliability Engineering expert focused on observability, monitoring, and system reliability.`;
        userPrompt = `Generate observability insights for: ${action.title}
        
Theme: ${action.theme}
Context: ${inputs?.context || 'Production system monitoring'}

Provide:
1. Health scorecard (overall system health metrics and SLIs)
2. Ajustes de alertas (recommended alert thresholds and notification rules)
3. Recomendações de automação (automation opportunities to improve reliability)

Format as structured JSON with these exact keys: health_scorecard, ajustes_alertas, recomendacoes_automacao`;
        break;

      default:
        return Response.json({ error: 'Unknown action category' }, { status: 400 });
    }

    // Call LLM for analysis
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: userPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          analise_competitiva: { type: "string" },
          mapeamento_mercado: { type: "string" },
          plano_acao: { type: "array", items: { type: "string" } },
          inventario_riscos: { type: "array", items: { type: "object" } },
          checklist_compliance: { type: "array", items: { type: "object" } },
          plano_mitigacao: { type: "array", items: { type: "string" } },
          health_scorecard: { type: "object" },
          ajustes_alertas: { type: "array", items: { type: "object" } },
          recomendacoes_automacao: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Store execution in Analysis entity for tracking
    const analysisRecord = await base44.entities.Analysis.create({
      title: `${action.title} - ${new Date().toLocaleDateString()}`,
      analysis_type: 'quick_action',
      status: 'completed',
      results: analysis,
      metadata: {
        action_category: action.category,
        action_theme: action.theme,
        executed_by: user.email,
        estimated_time: action.estimated_time
      }
    });

    return Response.json({
      success: true,
      action: action.title,
      category: action.category,
      results: analysis,
      analysis_id: analysisRecord.id,
      executed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quick action execution error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to execute quick action'
    }, { status: 500 });
  }
});