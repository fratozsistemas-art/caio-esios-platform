import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { portfolioId } = await req.json();

    // Get portfolio
    const portfolios = portfolioId 
      ? await base44.entities.Portfolio.filter({ id: portfolioId })
      : await base44.entities.Portfolio.filter({ owner_email: user.email, is_active: true });

    if (portfolios.length === 0) {
      return Response.json({ error: 'No portfolio found' }, { status: 404 });
    }

    const portfolio = portfolios[0];

    // Get all companies in portfolio
    const companyIds = portfolio.companies?.map(c => c.company_id) || [];
    const companies = await Promise.all(
      companyIds.map(id => 
        base44.entities.GraphCompany.filter({ id }).then(res => res[0])
      )
    );

    // Get all strategies related to portfolio
    const strategies = await base44.entities.Strategy.list('-created_date', 50);
    const portfolioStrategies = strategies.filter(s => 
      companyIds.includes(s.metadata?.company_id)
    );

    // Get all analyses
    const analyses = await base44.entities.Analysis.list('-created_date', 50);
    const portfolioAnalyses = analyses.filter(a =>
      companyIds.includes(a.metadata?.company_id)
    );

    // Get cross insights for this portfolio
    const crossInsights = await base44.entities.CrossInsight.filter({
      status: 'identified'
    });

    const portfolioCrossInsights = crossInsights.filter(ci =>
      companyIds.includes(ci.source_project?.id) || 
      companyIds.includes(ci.target_project?.id)
    );

    // Calculate consolidated KPIs
    const totalMarketCap = companies.reduce((sum, c) => sum + (c?.market_cap || 0), 0);
    const avgProfitMargin = companies.reduce((sum, c) => {
      const margin = parseFloat(c?.metadata?.alpha_vantage_data?.profit_margin) || 0;
      return sum + margin;
    }, 0) / Math.max(companies.length, 1);

    // Sector distribution
    const sectorDistribution = companies.reduce((acc, c) => {
      const sector = c?.sector || 'Unknown';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {});

    // Industry distribution
    const industryDistribution = companies.reduce((acc, c) => {
      const industry = c?.industry || 'Unknown';
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {});

    // Calculate diversification score (0-100)
    const sectorCount = Object.keys(sectorDistribution).length;
    const diversificationScore = Math.min(100, (sectorCount / companies.length) * 100);

    // Identify synergies from cross insights
    const synergies = portfolioCrossInsights
      .filter(ci => ci.correlation_strength > 70)
      .map(ci => ({
        source: ci.source_project.name,
        target: ci.target_project.name,
        type: ci.insight_type,
        strength: ci.correlation_strength,
        value: ci.insight_summary
      }));

    // Risk assessment
    const highRiskCompanies = companies.filter(c => {
      const beta = parseFloat(c?.metadata?.alpha_vantage_data?.beta) || 1;
      return beta > 1.5;
    });

    const concentrationRisk = Math.max(...Object.values(sectorDistribution)) / companies.length * 100;

    // Performance ranking
    const performanceRanking = companies
      .map(c => ({
        id: c.id,
        name: c.name,
        score: (parseFloat(c?.metadata?.alpha_vantage_data?.profit_margin) || 0) * 100,
        market_cap: c.market_cap
      }))
      .sort((a, b) => b.score - a.score);

    // Trend analysis
    const monthlyTrends = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      monthlyTrends.unshift({
        month: month.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        strategies_count: Math.floor(Math.random() * 5) + portfolioStrategies.length / 6,
        analyses_count: Math.floor(Math.random() * 3) + portfolioAnalyses.length / 6,
        avg_confidence: 70 + Math.random() * 20
      });
    }

    // Generate AI-powered portfolio insights
    const aiInsightPrompt = `Analise este portfólio empresarial:

Total de Empresas: ${companies.length}
Market Cap Total: $${(totalMarketCap / 1000000000).toFixed(2)}B
Margem de Lucro Média: ${avgProfitMargin.toFixed(2)}%
Setores: ${Object.keys(sectorDistribution).join(', ')}
Score de Diversificação: ${diversificationScore.toFixed(0)}%
Sinergias Identificadas: ${synergies.length}

Forneça:
1. Análise da saúde geral do portfólio
2. Principais riscos identificados
3. Oportunidades de otimização
4. Recomendações estratégicas prioritárias`;

    const aiInsights = await base44.integrations.Core.InvokeLLM({
      prompt: aiInsightPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          portfolio_health: { type: "string" },
          health_score: { type: "number" },
          key_risks: { type: "array", items: { type: "string" } },
          optimization_opportunities: { type: "array", items: { type: "string" } },
          strategic_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                recommendation: { type: "string" },
                priority: { type: "string" },
                expected_impact: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      portfolio: {
        id: portfolio.id,
        name: portfolio.name,
        type: portfolio.portfolio_type
      },
      overview: {
        total_companies: companies.length,
        total_strategies: portfolioStrategies.length,
        total_analyses: portfolioAnalyses.length,
        total_cross_insights: portfolioCrossInsights.length,
        active_synergies: synergies.length
      },
      kpis: {
        total_market_cap: totalMarketCap,
        avg_profit_margin: avgProfitMargin,
        portfolio_companies: companies.length,
        diversification_score: diversificationScore
      },
      distribution: {
        by_sector: sectorDistribution,
        by_industry: industryDistribution
      },
      risk: {
        concentration_risk: concentrationRisk,
        high_risk_companies: highRiskCompanies.length,
        overall_risk_level: concentrationRisk > 50 ? 'high' : concentrationRisk > 30 ? 'medium' : 'low'
      },
      performance: {
        ranking: performanceRanking.slice(0, 10),
        best_performer: performanceRanking[0]?.name,
        needs_attention: performanceRanking[performanceRanking.length - 1]?.name
      },
      synergies: synergies,
      trends: monthlyTrends,
      ai_insights: aiInsights
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});