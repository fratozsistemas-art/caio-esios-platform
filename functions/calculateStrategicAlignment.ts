import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch relevant data
    const [strategies, knowledgeItems, analyses] = await Promise.all([
      base44.entities.Strategy.list(),
      base44.entities.KnowledgeItem?.list() || Promise.resolve([]),
      base44.entities.Analysis.list()
    ]);

    // Calculate alignment scores across dimensions
    const totalStrategies = strategies.length;
    const validatedStrategies = strategies.filter(s => s.status === 'validated' || s.status === 'implemented').length;
    const executionAlignment = totalStrategies > 0 ? (validatedStrategies / totalStrategies) * 100 : 0;

    // Knowledge utilization
    const strategiesWithKnowledge = strategies.filter(s => 
      s.data_sources && s.data_sources.length > 0
    ).length;
    const knowledgeAlignment = totalStrategies > 0 ? (strategiesWithKnowledge / totalStrategies) * 100 : 0;

    // Analysis backing
    const strategiesWithAnalysis = strategies.filter(s => 
      s.key_insights && s.key_insights.length > 0
    ).length;
    const analysisAlignment = totalStrategies > 0 ? (strategiesWithAnalysis / totalStrategies) * 100 : 0;

    // Calculate overall score
    const overallScore = Math.round((executionAlignment + knowledgeAlignment + analysisAlignment) / 3);

    // Determine trend (simplified - compare with last calculation if available)
    const trend = overallScore > 70 ? 5 : overallScore > 50 ? 0 : -3;

    // Generate interpretation
    let interpretation = '';
    if (overallScore >= 80) {
      interpretation = 'Excellent strategic alignment - strategies are well-executed and data-driven';
    } else if (overallScore >= 60) {
      interpretation = 'Good alignment with room for improvement in execution and knowledge utilization';
    } else if (overallScore >= 40) {
      interpretation = 'Moderate alignment - focus on completing strategies and integrating more data sources';
    } else {
      interpretation = 'Low alignment - significant gaps between strategy and execution';
    }

    return Response.json({
      overall_score: overallScore,
      trend,
      interpretation,
      dimensions: {
        execution: Math.round(executionAlignment),
        knowledge: Math.round(knowledgeAlignment),
        analysis: Math.round(analysisAlignment)
      },
      metrics: {
        total_strategies: totalStrategies,
        validated_strategies: validatedStrategies,
        strategies_with_data: strategiesWithKnowledge
      }
    });

  } catch (error) {
    console.error('Error calculating strategic alignment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});