import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Automatically detect and mark test winners when statistical significance is achieved
 * Runs periodically or triggered manually
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active tests
    const activeTests = await base44.entities.ABTest.filter({ status: 'active' });
    const allEvents = await base44.entities.ABTestEvent.list();

    const results = [];

    for (const test of activeTests) {
      const testEvents = allEvents.filter(e => e.test_id === test.id);
      
      // Calculate stats for each variant
      const variantStats = {};
      for (const variant of test.variants) {
        const variantEvents = testEvents.filter(e => e.variant_id === variant.id);
        const impressions = variantEvents.filter(e => e.event_type === 'impression').length;
        const conversions = variantEvents.filter(e => e.event_type === 'conversion').length;
        
        variantStats[variant.id] = {
          impressions,
          conversions,
          conversionRate: impressions > 0 ? conversions / impressions : 0
        };
      }

      // Need at least 2 variants with sufficient data
      const variantsWithData = Object.entries(variantStats).filter(
        ([, stats]) => stats.impressions >= 30
      );

      if (variantsWithData.length < 2) {
        results.push({
          test_id: test.id,
          test_name: test.name,
          status: 'insufficient_data',
          message: 'Need 30+ impressions per variant'
        });
        continue;
      }

      // Calculate statistical significance (Z-test)
      const sorted = variantsWithData.sort((a, b) => b[1].conversionRate - a[1].conversionRate);
      const [winnerId, winnerStats] = sorted[0];
      const [runnerUpId, runnerUpStats] = sorted[1];

      const n1 = winnerStats.impressions;
      const n2 = runnerUpStats.impressions;
      const p1 = winnerStats.conversionRate;
      const p2 = runnerUpStats.conversionRate;

      const pooled = (winnerStats.conversions + runnerUpStats.conversions) / (n1 + n2);
      const se = Math.sqrt(pooled * (1 - pooled) * (1/n1 + 1/n2));
      const z = Math.abs(p1 - p2) / se;

      const isSignificant = z > 1.96; // 95% confidence
      const confidence = z > 2.576 ? 99 : z > 1.96 ? 95 : z > 1.645 ? 90 : Math.round((1 - 2 * (1 - 0.5 * (1 + Math.erf(z / Math.sqrt(2))))) * 100);

      if (isSignificant && confidence >= 95) {
        // Mark test as completed with winner
        await base44.entities.ABTest.update(test.id, {
          status: 'completed',
          end_date: new Date().toISOString(),
          results: {
            total_participants: testEvents.length,
            variant_stats: variantStats,
            winner: winnerId,
            confidence_level: confidence
          }
        });

        results.push({
          test_id: test.id,
          test_name: test.name,
          status: 'winner_declared',
          winner: test.variants.find(v => v.id === winnerId)?.name,
          confidence_level: confidence,
          improvement: ((p1 - p2) / p2 * 100).toFixed(1) + '%'
        });
      } else {
        results.push({
          test_id: test.id,
          test_name: test.name,
          status: 'in_progress',
          confidence_level: confidence,
          message: `${confidence}% confidence (need 95%+)`
        });
      }
    }

    return Response.json({ 
      success: true,
      processed: activeTests.length,
      results 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});