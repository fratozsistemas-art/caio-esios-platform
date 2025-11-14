import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Quick Actions Overlap Audit v1.0
 * Identifies duplicates, overlaps, and consolidation opportunities
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Starting Quick Actions Audit...');

    // Get all Quick Actions
    const quickActions = await base44.asServiceRole.entities.QuickAction.list();
    console.log(`📊 Total Quick Actions: ${quickActions.length}`);

    const overlaps = [];
    const recommendations = [];

    // OVERLAP DETECTION

    // 1. EXACT DUPLICATES (same role + same category)
    const exactDuplicates = {};
    quickActions.forEach((qa, idx) => {
      const key = `${qa.role}__${qa.category}`;
      if (!exactDuplicates[key]) {
        exactDuplicates[key] = [];
      }
      exactDuplicates[key].push({ ...qa, index: idx });
    });

    Object.entries(exactDuplicates).forEach(([key, actions]) => {
      if (actions.length > 1) {
        overlaps.push({
          type: 'EXACT_DUPLICATE',
          severity: 'high',
          key,
          count: actions.length,
          actions: actions.map(a => ({
            id: a.id,
            title: a.title,
            role: a.role,
            category: a.category
          })),
          recommendation: `Consolidate ${actions.length} actions with same role (${actions[0].role}) and category (${actions[0].category})`
        });
      }
    });

    // 2. FRAMEWORK OVERLAP (same frameworks, different names)
    const frameworkGroups = {};
    quickActions.forEach((qa) => {
      if (qa.frameworks_used && qa.frameworks_used.length > 0) {
        const fwKey = qa.frameworks_used.sort().join('__');
        if (!frameworkGroups[fwKey]) {
          frameworkGroups[fwKey] = [];
        }
        frameworkGroups[fwKey].push(qa);
      }
    });

    Object.entries(frameworkGroups).forEach(([fwKey, actions]) => {
      if (actions.length > 1) {
        overlaps.push({
          type: 'FRAMEWORK_OVERLAP',
          severity: 'medium',
          frameworks: fwKey.split('__'),
          count: actions.length,
          actions: actions.map(a => ({
            id: a.id,
            title: a.title,
            role: a.role,
            category: a.category
          })),
          recommendation: `Consider consolidating ${actions.length} actions using same frameworks: ${fwKey.split('__').join(', ')}`
        });
      }
    });

    // 3. MODULE OVERLAP (same modules activated)
    const moduleGroups = {};
    quickActions.forEach((qa) => {
      if (qa.modules_activated && qa.modules_activated.length > 2) {
        const modKey = qa.modules_activated.sort().join('__');
        if (!moduleGroups[modKey]) {
          moduleGroups[modKey] = [];
        }
        moduleGroups[modKey].push(qa);
      }
    });

    Object.entries(moduleGroups).forEach(([modKey, actions]) => {
      if (actions.length > 1) {
        overlaps.push({
          type: 'MODULE_OVERLAP',
          severity: 'medium',
          modules: modKey.split('__'),
          count: actions.length,
          actions: actions.map(a => ({
            id: a.id,
            title: a.title,
            role: a.role,
            category: a.category
          })),
          recommendation: `${actions.length} actions use same module combination: ${modKey.split('__').join(', ')}`
        });
      }
    });

    // 4. THEME CLUSTERING (multiple roles, same theme)
    const themeGroups = {};
    quickActions.forEach((qa) => {
      const theme = qa.theme || 'no_theme';
      if (!themeGroups[theme]) {
        themeGroups[theme] = [];
      }
      themeGroups[theme].push(qa);
    });

    Object.entries(themeGroups).forEach(([theme, actions]) => {
      const roles = [...new Set(actions.map(a => a.role))];
      if (roles.length > 3 && actions.length > 5) {
        overlaps.push({
          type: 'THEME_CLUSTERING',
          severity: 'low',
          theme,
          roles_involved: roles,
          count: actions.length,
          recommendation: `Theme "${theme}" has ${actions.length} actions across ${roles.length} roles - good distribution`
        });
      }
    });

    // 5. SIMILAR TITLES (Levenshtein distance)
    const similarTitles = [];
    for (let i = 0; i < quickActions.length; i++) {
      for (let j = i + 1; j < quickActions.length; j++) {
        const similarity = calculateSimilarity(
          quickActions[i].title.toLowerCase(),
          quickActions[j].title.toLowerCase()
        );
        
        if (similarity > 0.7) {
          similarTitles.push({
            action1: {
              id: quickActions[i].id,
              title: quickActions[i].title,
              role: quickActions[i].role
            },
            action2: {
              id: quickActions[j].id,
              title: quickActions[j].title,
              role: quickActions[j].role
            },
            similarity: similarity
          });
        }
      }
    }

    if (similarTitles.length > 0) {
      overlaps.push({
        type: 'SIMILAR_TITLES',
        severity: 'medium',
        count: similarTitles.length,
        pairs: similarTitles,
        recommendation: `Review ${similarTitles.length} pairs of actions with similar titles`
      });
    }

    // RECOMMENDATIONS

    // Coverage by Role
    const roleDistribution = {};
    quickActions.forEach(qa => {
      roleDistribution[qa.role] = (roleDistribution[qa.role] || 0) + 1;
    });

    const avgActionsPerRole = quickActions.length / Object.keys(roleDistribution).length;
    Object.entries(roleDistribution).forEach(([role, count]) => {
      if (count < avgActionsPerRole * 0.5) {
        recommendations.push({
          type: 'UNDERREPRESENTED_ROLE',
          priority: 'medium',
          role,
          current_count: count,
          avg_count: Math.round(avgActionsPerRole),
          action: `Consider adding more Quick Actions for ${role} (currently ${count}, avg is ${Math.round(avgActionsPerRole)})`
        });
      }
    });

    // Theme Coverage
    const themeDistribution = {};
    quickActions.forEach(qa => {
      const theme = qa.theme || 'no_theme';
      themeDistribution[theme] = (themeDistribution[theme] || 0) + 1;
    });

    const themesWithLowCoverage = Object.entries(themeDistribution)
      .filter(([theme, count]) => count < 3 && theme !== 'no_theme')
      .map(([theme, count]) => ({ theme, count }));

    if (themesWithLowCoverage.length > 0) {
      recommendations.push({
        type: 'EXPAND_THEMES',
        priority: 'low',
        themes: themesWithLowCoverage,
        action: `Expand coverage for themes: ${themesWithLowCoverage.map(t => `${t.theme} (${t.count})`).join(', ')}`
      });
    }

    // Quality Score
    const qualityScore = calculateQualityScore(quickActions, overlaps);

    const auditReport = {
      timestamp: new Date().toISOString(),
      total_quick_actions: quickActions.length,
      overlaps_detected: overlaps.length,
      overlaps: overlaps.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      recommendations: recommendations,
      distribution: {
        by_role: roleDistribution,
        by_theme: themeDistribution,
        by_framework: Object.keys(frameworkGroups).length,
        by_modules: Object.keys(moduleGroups).length
      },
      quality_score: qualityScore,
      next_audit_recommended: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    console.log(`✅ Audit complete: ${overlaps.length} overlaps detected`);

    return Response.json({
      success: true,
      audit_report: auditReport
    });

  } catch (error) {
    console.error('Audit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Helper: Calculate similarity between two strings (Jaro-Winkler)
function calculateSimilarity(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  
  if (m === 0) return n === 0 ? 1.0 : 0.0;
  if (n === 0) return 0.0;

  const matchWindow = Math.floor(Math.max(m, n) / 2) - 1;
  const s1Matches = new Array(m).fill(false);
  const s2Matches = new Array(n).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < m; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, n);

    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < m; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro = (matches / m + matches / n + (matches - transpositions / 2) / matches) / 3.0;
  
  return jaro;
}

// Helper: Calculate overall quality score
function calculateQualityScore(quickActions, overlaps) {
  const highSeverityOverlaps = overlaps.filter(o => o.severity === 'high').length;
  const mediumSeverityOverlaps = overlaps.filter(o => o.severity === 'medium').length;
  
  const overlapPenalty = (highSeverityOverlaps * 10) + (mediumSeverityOverlaps * 5);
  
  const baseScore = 100;
  const finalScore = Math.max(0, baseScore - overlapPenalty);
  
  return {
    score: finalScore,
    grade: finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 70 ? 'C' : finalScore >= 60 ? 'D' : 'F',
    interpretation: finalScore >= 90 
      ? 'Excellent - Minimal overlaps' 
      : finalScore >= 70 
      ? 'Good - Some consolidation opportunities' 
      : 'Needs attention - Significant overlaps detected'
  };
}