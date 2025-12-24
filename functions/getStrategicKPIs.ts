import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { period_start, period_end, analysis_type } = await req.json();

    // Build filter query
    const filter = {};
    if (period_start) {
      filter.period_start = { $gte: period_start };
    }
    if (period_end) {
      filter.period_end = { $lte: period_end };
    }
    if (analysis_type && analysis_type !== 'all') {
      filter.analysis_type = analysis_type;
    }

    // Fetch metrics
    const metrics = await base44.entities.AnalysisPerformanceMetric.filter(filter, '-created_date', 1000);

    // Aggregate KPIs
    const kpis = {
      conflict_detection: {
        detection_rate: 0,
        avg_confidence: 0,
        total_conflicts: 0,
        avg_speed: 0,
        count: 0
      },
      trend_prediction: {
        accuracy: 0,
        avg_confidence: 0,
        predictions_made: 0,
        avg_speed: 0,
        count: 0
      },
      comparative_analysis: {
        avg_speed: 0,
        success_rate: 0,
        comparisons_made: 0,
        count: 0
      },
      narrative_validation: {
        success_rate: 0,
        avg_confidence: 0,
        validations_made: 0,
        count: 0
      },
      overall: {
        total_analyses: metrics.length,
        avg_speed: 0,
        facts_processed: 0,
        timeRange: { start: period_start, end: period_end }
      }
    };

    // Process metrics
    metrics.forEach(metric => {
      const type = metric.analysis_type;
      
      if (!kpis[type]) return;

      kpis[type].count += 1;

      switch (metric.metric_name) {
        case 'detection_rate':
          kpis[type].detection_rate += metric.value;
          break;
        case 'accuracy':
          kpis[type].accuracy += metric.value;
          break;
        case 'confidence_score':
          kpis[type].avg_confidence += metric.value;
          break;
        case 'avg_speed_ms':
          kpis[type].avg_speed += metric.value;
          kpis.overall.avg_speed += metric.value;
          break;
        case 'success_rate':
          kpis[type].success_rate += metric.value;
          break;
      }

      if (metric.facts_processed) {
        kpis.overall.facts_processed += metric.facts_processed;
      }
    });

    // Calculate averages
    Object.keys(kpis).forEach(type => {
      if (type === 'overall') return;
      const data = kpis[type];
      if (data.count > 0) {
        Object.keys(data).forEach(key => {
          if (key !== 'count' && key.includes('avg_') || key.includes('rate') || key === 'accuracy') {
            data[key] = Math.round((data[key] / data.count) * 100) / 100;
          }
        });
      }
    });

    if (metrics.length > 0) {
      kpis.overall.avg_speed = Math.round(kpis.overall.avg_speed / metrics.length);
    }

    // Get trend data (last 30 days grouped by day)
    const trendsFilter = { ...filter };
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    trendsFilter.period_start = { $gte: thirtyDaysAgo.toISOString() };

    const trendMetrics = await base44.entities.AnalysisPerformanceMetric.filter(trendsFilter, '-period_start', 1000);
    
    const dailyData = {};
    trendMetrics.forEach(metric => {
      const date = new Date(metric.period_start).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, analyses: 0, avg_speed: 0, conflicts: 0, predictions: 0 };
      }
      dailyData[date].analyses += 1;
      if (metric.metric_name === 'avg_speed_ms') {
        dailyData[date].avg_speed += metric.value;
      }
      if (metric.analysis_type === 'conflict_detection') {
        dailyData[date].conflicts += 1;
      }
      if (metric.analysis_type === 'trend_prediction') {
        dailyData[date].predictions += 1;
      }
    });

    const trends = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

    return Response.json({
      success: true,
      kpis,
      trends,
      total_metrics: metrics.length
    });

  } catch (error) {
    console.error('Error fetching strategic KPIs:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});