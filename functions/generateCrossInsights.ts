import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mode = 'auto' } = await req.json();

    // Buscar dados de diferentes fontes
    const [strategies, analyses, companies, workspaces] = await Promise.all([
      base44.entities.Strategy.list('-created_date', 20),
      base44.entities.Analysis.list('-created_date', 20),
      base44.entities.GraphCompany.list('-created_date', 20),
      base44.entities.Workspace.list('-created_date', 20)
    ]);

    const insights = [];

    // Correlação entre análises de diferentes empresas
    for (let i = 0; i < analyses.length - 1; i++) {
      for (let j = i + 1; j < Math.min(analyses.length, i + 5); j++) {
        const analysis1 = analyses[i];
        const analysis2 = analyses[j];

        // Simular correlação baseada em análise de conteúdo
        const prompt = `Analise estas duas análises estratégicas e identifique insights cruzados:

Análise 1 (${analysis1.title}):
${JSON.stringify(analysis1.results || {}).substring(0, 500)}

Análise 2 (${analysis2.title}):
${JSON.stringify(analysis2.results || {}).substring(0, 500)}

Identifique:
1. Padrões compartilhados
2. Oportunidades de aprendizado cruzado
3. Correlações de mercado/competitivas
4. Recomendações transferíveis`;

        const correlationAnalysis = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          response_json_schema: {
            type: "object",
            properties: {
              has_correlation: { type: "boolean" },
              correlation_strength: { type: "number" },
              insight_type: { type: "string" },
              summary: { type: "string" },
              shared_patterns: { type: "array", items: { type: "string" } },
              transferable_learnings: { type: "array", items: { type: "string" } },
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    action: { type: "string" },
                    priority: { type: "string" },
                    estimated_impact: { type: "string" }
                  }
                }
              }
            }
          }
        });

        if (correlationAnalysis.has_correlation && correlationAnalysis.correlation_strength > 50) {
          const insight = await base44.asServiceRole.entities.CrossInsight.create({
            title: `Cross-insight: ${analysis1.title} ↔ ${analysis2.title}`,
            source_project: {
              type: 'analysis',
              id: analysis1.id,
              name: analysis1.title
            },
            target_project: {
              type: 'analysis',
              id: analysis2.id,
              name: analysis2.title
            },
            insight_type: correlationAnalysis.insight_type || 'market_trend',
            correlation_strength: correlationAnalysis.correlation_strength,
            insight_summary: correlationAnalysis.summary,
            detailed_analysis: `Correlação identificada entre análises: ${correlationAnalysis.summary}`,
            shared_patterns: correlationAnalysis.shared_patterns || [],
            transferable_learnings: correlationAnalysis.transferable_learnings || [],
            actionable_recommendations: correlationAnalysis.recommendations || [],
            confidence_score: correlationAnalysis.correlation_strength,
            status: 'identified',
            metadata: {
              generated_by: 'auto',
              generated_at: new Date().toISOString()
            }
          });

          insights.push(insight);
        }
      }
    }

    // Correlação entre estratégias e empresas
    for (const strategy of strategies.slice(0, 5)) {
      for (const company of companies.slice(0, 5)) {
        if (strategy.metadata?.company_id !== company.id) {
          const prompt = `Analise como esta estratégia pode ser aplicada a outra empresa:

Estratégia: ${strategy.title}
Contexto: ${strategy.executive_summary || ''}

Empresa Alvo: ${company.name}
Setor: ${company.sector}
Indústria: ${company.industry}

Identifique:
1. Aplicabilidade da estratégia
2. Adaptações necessárias
3. Riscos e oportunidades
4. Valor potencial`;

          const transferAnalysis = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
              type: "object",
              properties: {
                is_applicable: { type: "boolean" },
                applicability_score: { type: "number" },
                adaptations_needed: { type: "array", items: { type: "string" } },
                potential_value: { type: "string" },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      priority: { type: "string" },
                      estimated_impact: { type: "string" }
                    }
                  }
                }
              }
            }
          });

          if (transferAnalysis.is_applicable && transferAnalysis.applicability_score > 60) {
            const insight = await base44.asServiceRole.entities.CrossInsight.create({
              title: `Estratégia transferível: ${strategy.title} → ${company.name}`,
              source_project: {
                type: 'strategy',
                id: strategy.id,
                name: strategy.title
              },
              target_project: {
                type: 'company',
                id: company.id,
                name: company.name
              },
              insight_type: 'strategy_replication',
              correlation_strength: transferAnalysis.applicability_score,
              insight_summary: `Estratégia "${strategy.title}" pode ser adaptada para ${company.name}`,
              detailed_analysis: transferAnalysis.potential_value,
              transferable_learnings: transferAnalysis.adaptations_needed || [],
              actionable_recommendations: transferAnalysis.recommendations || [],
              confidence_score: transferAnalysis.applicability_score,
              status: 'identified'
            });

            insights.push(insight);
          }
        }
      }
    }

    // Correlação entre workspaces
    for (let i = 0; i < workspaces.length - 1; i++) {
      for (let j = i + 1; j < Math.min(workspaces.length, i + 3); j++) {
        const ws1 = workspaces[i];
        const ws2 = workspaces[j];

        if (ws1.template_type === ws2.template_type) {
          const insight = await base44.asServiceRole.entities.CrossInsight.create({
            title: `Padrões similares: ${ws1.name} & ${ws2.name}`,
            source_project: {
              type: 'workspace',
              id: ws1.id,
              name: ws1.name
            },
            target_project: {
              type: 'workspace',
              id: ws2.id,
              name: ws2.name
            },
            insight_type: 'behavioral_pattern',
            correlation_strength: 75,
            insight_summary: `Ambos workspaces seguem template ${ws1.template_type} - oportunidades de compartilhar best practices`,
            shared_patterns: [`Template: ${ws1.template_type}`, 'Fases similares', 'Processos comparáveis'],
            transferable_learnings: [
              'Metodologias aplicadas em ambos',
              'Recursos reutilizáveis',
              'Lições aprendidas transferíveis'
            ],
            actionable_recommendations: [
              {
                action: 'Sincronizar metodologias entre workspaces',
                priority: 'medium',
                estimated_impact: 'Redução de 30% no tempo de execução'
              }
            ],
            confidence_score: 75,
            status: 'identified'
          });

          insights.push(insight);
        }
      }
    }

    return Response.json({
      success: true,
      insights_generated: insights.length,
      insights: insights,
      summary: {
        total_correlations: insights.length,
        by_type: insights.reduce((acc, i) => {
          acc[i.insight_type] = (acc[i.insight_type] || 0) + 1;
          return acc;
        }, {}),
        average_confidence: insights.reduce((sum, i) => sum + i.confidence_score, 0) / insights.length
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});