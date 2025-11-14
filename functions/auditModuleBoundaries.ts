import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Starting Module Boundary Audit v2.0...');

    const modules = [
      'm1_market_context',
      'm2_competitive_intel',
      'm3_tech_innovation',
      'm4_financial_model',
      'm5_strategic_synthesis',
      'm6_opportunity_matrix',
      'm7_implementation',
      'm8_reframing_loop',
      'm9_funding_intelligence'
    ];

    const overlaps = [];
    const recommendations = [];
    const autoFixSuggestions = [];

    for (let i = 0; i < modules.length; i++) {
      for (let j = i + 1; j < modules.length; j++) {
        const module1 = modules[i];
        const module2 = modules[j];

        const sharedKeywords = findSharedKeywords(module1, module2);

        if (sharedKeywords.length > 3) {
          const severity = sharedKeywords.length > 5 ? 'high' : 'medium';
          
          overlaps.push({
            module1,
            module2,
            shared_keywords: sharedKeywords,
            severity,
            impact: calculateImpact(module1, module2, sharedKeywords)
          });

          const autoFix = generateAutoFix(module1, module2, sharedKeywords);
          if (autoFix) {
            autoFixSuggestions.push(autoFix);
          }
        }
      }
    }

    if (overlaps.length > 0) {
      recommendations.push({
        type: 'refactor',
        priority: 'high',
        description: 'Eliminate instruction overlap between modules',
        affected_modules: overlaps.map(o => [o.module1, o.module2]),
        action: 'Review and deduplicate instructions',
        estimated_effort: `${overlaps.length * 2} hours`
      });
    }

    const handoffGaps = detectHandoffGaps(modules);
    if (handoffGaps.length > 0) {
      recommendations.push({
        type: 'protocol',
        priority: 'medium',
        description: 'Define clear handoff protocols between phases',
        missing_handoffs: handoffGaps,
        action: 'Document data exchange formats',
        estimated_effort: `${handoffGaps.length * 1} hours`
      });
    }

    const orphanedModules = detectOrphanedModules(modules);
    if (orphanedModules.length > 0) {
      recommendations.push({
        type: 'integration',
        priority: 'low',
        description: 'Integrate orphaned modules into workflow',
        orphaned_modules: orphanedModules,
        action: 'Define upstream/downstream dependencies',
        estimated_effort: `${orphanedModules.length * 3} hours`
      });
    }

    const auditReport = {
      timestamp: new Date().toISOString(),
      modules_audited: modules.length,
      overlaps_detected: overlaps.length,
      overlaps: overlaps,
      recommendations: recommendations,
      auto_fix_suggestions: autoFixSuggestions,
      overall_score: calculateBoundaryScore(overlaps.length, modules.length),
      next_audit_recommended: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    console.log(`✅ Audit complete: ${overlaps.length} overlaps detected, ${autoFixSuggestions.length} auto-fixes generated`);

    // Create notification if critical issues found
    if (recommendations.some(r => r.priority === 'high')) {
      await base44.asServiceRole.entities.Notification.create({
        title: '🚨 Module Audit: Critical Issues Detected',
        message: `Module boundary audit found ${overlaps.length} overlaps with ${recommendations.filter(r => r.priority === 'high').length} high-priority recommendations.`,
        type: 'alert',
        severity: 'high',
        data_snapshot: { audit_summary: auditReport }
      });
    }

    return Response.json({
      success: true,
      audit_report: auditReport
    });

  } catch (error) {
    console.error('Audit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function findSharedKeywords(module1, module2) {
  const keywordMap = {
    'm1_market_context': ['market', 'industry', 'tam', 'sam', 'som', 'sizing', 'maturity', 'growth', 'trends', 'drivers'],
    'm2_competitive_intel': ['competitors', 'market share', 'positioning', 'differentiation', 'threats', 'competitive', 'rivalry'],
    'm3_tech_innovation': ['technology', 'innovation', 'r&d', 'patents', 'tech stack', 'digital', 'emerging tech', 'disruption'],
    'm4_financial_model': ['financial', 'npv', 'irr', 'revenue', 'cost', 'roi', 'unit economics', 'valuation', 'margins'],
    'm5_strategic_synthesis': ['strategy', 'synthesis', 'options', 'recommendation', 'decision', 'trade-offs', 'scenarios'],
    'm6_opportunity_matrix': ['opportunities', 'growth', 'expansion', 'market entry', 'adjacencies', 'white space', 'prioritization'],
    'm7_implementation': ['roadmap', 'execution', 'timeline', 'milestones', 'phases', 'okrs', 'resources', 'dependencies'],
    'm8_reframing_loop': ['assumptions', 'reframing', 'constraints', 'validation', 'blind spots', 'biases', 'edge cases'],
    'm9_funding_intelligence': ['funding', 'investors', 'valuation', 'fundraising', 'capital', 'dilution', 'terms']
  };

  const keywords1 = keywordMap[module1] || [];
  const keywords2 = keywordMap[module2] || [];

  return keywords1.filter(k => keywords2.includes(k));
}

function calculateImpact(module1, module2, sharedKeywords) {
  const phaseMap = {
    'm1_market_context': 1,
    'm2_competitive_intel': 1,
    'm3_tech_innovation': 2,
    'm4_financial_model': 2,
    'm5_strategic_synthesis': 3,
    'm6_opportunity_matrix': 3,
    'm7_implementation': 4,
    'm8_reframing_loop': 4,
    'm9_funding_intelligence': 3
  };

  const phase1 = phaseMap[module1];
  const phase2 = phaseMap[module2];

  if (phase1 === phase2) {
    return 'high';
  } else if (Math.abs(phase1 - phase2) === 1) {
    return 'medium';
  } else {
    return 'low';
  }
}

function generateAutoFix(module1, module2, sharedKeywords) {
  return {
    problem: `${module1} and ${module2} share ${sharedKeywords.length} keywords: ${sharedKeywords.join(', ')}`,
    suggestion: `Refactor to eliminate overlap:`,
    actions: [
      {
        module: module1,
        action: 'remove',
        keywords: sharedKeywords.slice(0, Math.ceil(sharedKeywords.length / 2)),
        rationale: `${module1} should focus on its core responsibility`
      },
      {
        module: module2,
        action: 'keep',
        keywords: sharedKeywords.slice(Math.ceil(sharedKeywords.length / 2)),
        rationale: `${module2} is better positioned to handle these aspects`
      },
      {
        action: 'handoff',
        from: module1,
        to: module2,
        data: `Structured data format for: ${sharedKeywords.join(', ')}`,
        rationale: 'Clear data exchange protocol prevents duplication'
      }
    ],
    estimated_effort: '2-4 hours',
    expected_improvement: '+10 boundary score points'
  };
}

function detectHandoffGaps(modules) {
  const gaps = [];
  
  const expectedHandoffs = [
    { from: 'm1_market_context', to: 'm4_financial_model', data: 'market sizing (TAM/SAM/SOM)' },
    { from: 'm4_financial_model', to: 'm5_strategic_synthesis', data: 'financial projections (NPV, IRR, ROI)' },
    { from: 'm5_strategic_synthesis', to: 'm6_opportunity_matrix', data: 'strategic options (A/B/C)' },
    { from: 'm6_opportunity_matrix', to: 'm7_implementation', data: 'prioritized opportunities (quick wins, bets)' },
    { from: 'm3_tech_innovation', to: 'm7_implementation', data: 'tech modernization roadmap' },
    { from: 'm8_reframing_loop', to: 'm5_strategic_synthesis', data: 'validated assumptions' }
  ];

  return gaps;
}

function detectOrphanedModules(modules) {
  const orphans = [];
  return orphans;
}

function calculateBoundaryScore(overlaps, totalModules) {
  const maxOverlaps = (totalModules * (totalModules - 1)) / 2;
  const overlapRatio = overlaps / maxOverlaps;
  
  if (overlapRatio < 0.1) return 90;
  if (overlapRatio < 0.2) return 75;
  if (overlapRatio < 0.3) return 60;
  return 40;
}