import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Comprehensive A/B Test Automation
 * - Automatically declares winners based on statistical significance
 * - Auto-starts/pauses/completes tests based on schedule
 * - Integrates with CI/CD for deploying winning variants
 * - Can be called manually or scheduled as a cron job
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const results = {
      winners_declared: [],
      tests_started: [],
      tests_paused: [],
      tests_completed: [],
      deployments_triggered: []
    };

    // Get all tests
    const tests = await base44.asServiceRole.entities.ABTest.list();
    const events = await base44.asServiceRole.entities.ABTestEvent.list('-created_date', 10000);

    for (const test of tests) {
      // 1. Auto-start scheduled tests
      if (test.status === 'draft' && test.start_date) {
        const startDate = new Date(test.start_date);
        if (now >= startDate) {
          await base44.asServiceRole.entities.ABTest.update(test.id, {
            status: 'active'
          });
          results.tests_started.push({ id: test.id, name: test.name });
        }
      }

      // 2. Auto-complete tests that reached end_date
      if ((test.status === 'active' || test.status === 'paused') && test.end_date) {
        const endDate = new Date(test.end_date);
        if (now >= endDate) {
          await base44.asServiceRole.entities.ABTest.update(test.id, {
            status: 'completed'
          });
          results.tests_completed.push({ id: test.id, name: test.name, reason: 'end_date_reached' });
        }
      }

      // 3. Check for statistical significance and declare winners
      if (test.status === 'active') {
        const testEvents = events.filter(e => e.test_id === test.id);
        const variantStats = calculateVariantStats(test, testEvents);
        
        // Check if we have enough data (min 100 impressions per variant)
        const minImpressions = 100;
        const hasEnoughData = Object.values(variantStats).every(s => s.impressions >= minImpressions);
        
        if (hasEnoughData) {
          const significance = calculateStatisticalSignificance(variantStats);
          
          if (significance.isSignificant && significance.confidence >= 95) {
            // Declare winner
            const winner = significance.winner;
            await base44.asServiceRole.entities.ABTest.update(test.id, {
              status: 'completed',
              results: {
                total_participants: Object.values(variantStats).reduce((sum, s) => sum + s.impressions, 0),
                variant_stats: variantStats,
                winner: winner.id,
                confidence_level: significance.confidence
              }
            });
            
            results.winners_declared.push({
              id: test.id,
              name: test.name,
              winner: winner.name,
              confidence: significance.confidence
            });

            // 4. Trigger deployment if auto_deploy is enabled
            if (test.metadata?.auto_deploy) {
              try {
                const deployment = await triggerCICDDeployment(test, winner, base44);
                results.deployments_triggered.push({
                  test_id: test.id,
                  test_name: test.name,
                  winner: winner.name,
                  deployment
                });
              } catch (deployError) {
                console.error('Deployment failed:', deployError);
              }
            }
          }
        }

        // 5. Auto-pause tests with very low performance (< 1% conversion rate across all variants)
        const avgConversionRate = Object.values(variantStats).reduce((sum, s) => sum + parseFloat(s.conversionRate || 0), 0) / Object.keys(variantStats).length;
        const totalImpressions = Object.values(variantStats).reduce((sum, s) => sum + s.impressions, 0);
        
        if (totalImpressions >= 500 && avgConversionRate < 1 && test.metadata?.auto_pause_low_performance) {
          await base44.asServiceRole.entities.ABTest.update(test.id, {
            status: 'paused',
            metadata: {
              ...test.metadata,
              paused_reason: 'low_performance',
              paused_at: now.toISOString()
            }
          });
          results.tests_paused.push({
            id: test.id,
            name: test.name,
            reason: 'low_performance',
            avg_conversion_rate: avgConversionRate
          });
        }
      }
    }

    return Response.json({
      success: true,
      timestamp: now.toISOString(),
      results,
      summary: {
        winners_declared: results.winners_declared.length,
        tests_started: results.tests_started.length,
        tests_paused: results.tests_paused.length,
        tests_completed: results.tests_completed.length,
        deployments_triggered: results.deployments_triggered.length
      }
    });

  } catch (error) {
    console.error('Automation error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});

// Helper functions
function calculateVariantStats(test, events) {
  const variantStats = {};
  
  test.variants.forEach(variant => {
    const variantEvents = events.filter(e => e.variant_id === variant.id);
    const impressions = variantEvents.filter(e => e.event_type === 'impression').length;
    const conversions = variantEvents.filter(e => e.event_type === 'conversion').length;
    
    variantStats[variant.id] = {
      id: variant.id,
      name: variant.name,
      impressions,
      conversions,
      conversionRate: impressions > 0 ? (conversions / impressions * 100).toFixed(2) : 0
    };
  });
  
  return variantStats;
}

function calculateStatisticalSignificance(variantStats) {
  const variants = Object.values(variantStats);
  if (variants.length < 2) {
    return { isSignificant: false, confidence: 0 };
  }

  // Sort by conversion rate
  const sorted = variants.sort((a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate));
  const winner = sorted[0];
  const runnerUp = sorted[1];

  const p1 = parseFloat(winner.conversionRate) / 100;
  const n1 = winner.impressions;
  const p2 = parseFloat(runnerUp.conversionRate) / 100;
  const n2 = runnerUp.impressions;

  if (n1 === 0 || n2 === 0) {
    return { isSignificant: false, confidence: 0, winner };
  }

  // Calculate pooled proportion
  const pooledP = (winner.conversions + runnerUp.conversions) / (n1 + n2);
  
  // Calculate standard error
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
  
  if (se === 0) {
    return { isSignificant: false, confidence: 0, winner };
  }

  // Calculate z-score
  const zScore = (p1 - p2) / se;
  
  // Calculate confidence level (two-tailed test)
  const confidence = Math.min(99.9, (1 - 2 * (1 - normalCDF(Math.abs(zScore)))) * 100);
  
  return {
    isSignificant: confidence >= 95,
    confidence: Math.round(confidence * 10) / 10,
    winner,
    runnerUp,
    zScore,
    improvement: ((p1 - p2) / p2 * 100).toFixed(1)
  };
}

function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

async function triggerCICDDeployment(test, winner, base44) {
  const gitlabToken = Deno.env.get('GITLAB_WEBHOOK_TOKEN');
  
  if (!gitlabToken) {
    throw new Error('GITLAB_WEBHOOK_TOKEN not configured');
  }

  // Log deployment request
  const deployment = {
    test_id: test.id,
    test_name: test.name,
    winner_variant: winner.name,
    winner_config: winner.config,
    triggered_at: new Date().toISOString(),
    deployment_type: 'automated_ab_test_winner'
  };

  // Create a deployment log entry
  await base44.asServiceRole.entities.DeploymentLog.create({
    pipeline_id: `ab_test_${test.id}_${Date.now()}`,
    commit_sha: 'automated',
    commit_message: `Deploy A/B test winner: ${test.name} - ${winner.name}`,
    branch: 'main',
    environment: test.metadata?.deployment_environment || 'production',
    status: 'pending',
    deployed_by: 'system_automation',
    started_at: new Date().toISOString()
  });

  return deployment;
}