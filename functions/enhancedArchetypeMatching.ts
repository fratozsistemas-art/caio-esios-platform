import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile_id } = await req.json();

    if (!profile_id) {
      return Response.json({ error: 'profile_id is required' }, { status: 400 });
    }

    // Fetch profile and all active archetypes
    const [profile, archetypes] = await Promise.all([
      base44.entities.BehavioralProfile.filter({ id: profile_id }).then(p => p[0]),
      base44.entities.ClientArchetype.filter({ is_active: true })
    ]);

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Calculate scores for each archetype
    const archetypeScores = archetypes.map(archetype => {
      let totalScore = 0;
      let maxPossibleScore = 0;
      const matchedBehaviors = [];
      const unmatchedBehaviors = [];

      // 1. Communication Style Match (weight: 0.25)
      const commScore = calculateCommunicationScore(profile.communication_preferences, archetype.communication_style);
      totalScore += commScore * 0.25;
      maxPossibleScore += 0.25;

      // 2. Decision Making Match (weight: 0.25)
      const decisionScore = calculateDecisionMakingScore(profile.decision_making_pattern, archetype.decision_making_style);
      totalScore += decisionScore * 0.25;
      maxPossibleScore += 0.25;

      // 3. Behavioral Patterns Match (weight: 0.30)
      if (archetype.defining_behaviors && archetype.defining_behaviors.length > 0) {
        const behaviorResult = calculateBehaviorScore(profile, archetype.defining_behaviors);
        totalScore += behaviorResult.score * 0.30;
        maxPossibleScore += 0.30;
        matchedBehaviors.push(...behaviorResult.matched);
        unmatchedBehaviors.push(...behaviorResult.unmatched);
      }

      // 4. Industry & Stage Alignment (weight: 0.10)
      const contextScore = calculateContextScore(profile, archetype);
      totalScore += contextScore * 0.10;
      maxPossibleScore += 0.10;

      // 5. Validated Patterns Bonus (weight: 0.10)
      const validatedScore = calculateValidatedPatternsScore(profile.validated_patterns, archetype);
      totalScore += validatedScore * 0.10;
      maxPossibleScore += 0.10;

      const finalScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

      return {
        archetype_id: archetype.id,
        archetype_name: archetype.archetype_name,
        archetype_identifier: archetype.archetype_id,
        category: archetype.category,
        score: Math.round(finalScore * 100) / 100,
        breakdown: {
          communication: Math.round(commScore * 100),
          decision_making: Math.round(decisionScore * 100),
          behavioral_patterns: matchedBehaviors.length > 0 ? Math.round((matchedBehaviors.reduce((s, b) => s + b.weight, 0) / unmatchedBehaviors.concat(matchedBehaviors).reduce((s, b) => s + b.weight, 0)) * 100) : 0,
          context_alignment: Math.round(contextScore * 100),
          validated_patterns: Math.round(validatedScore * 100)
        },
        matched_behaviors: matchedBehaviors,
        unmatched_behaviors: unmatchedBehaviors,
        preferred_frameworks: archetype.preferred_frameworks || []
      };
    }).sort((a, b) => b.score - a.score);

    const primaryMatch = archetypeScores[0];
    const secondaryMatch = archetypeScores[1];
    const tertiaryMatch = archetypeScores[2];

    // Generate nurturing insights
    const nurturingInsights = generateNurturingInsights(
      profile,
      primaryMatch,
      secondaryMatch,
      archetypes.find(a => a.id === primaryMatch?.archetype_id),
      archetypes.find(a => a.id === secondaryMatch?.archetype_id)
    );

    // Calculate match quality
    const matchQuality = calculateMatchQuality(primaryMatch, secondaryMatch);

    return Response.json({
      success: true,
      profile_id,
      primary_match: primaryMatch,
      secondary_match: secondaryMatch,
      tertiary_match: tertiaryMatch,
      all_scores: archetypeScores,
      match_quality: matchQuality,
      nurturing_insights: nurturingInsights,
      recommendations: {
        update_primary: primaryMatch.score > (profile.archetype_confidence || 50) + 10,
        suggested_primary_archetype_id: primaryMatch.archetype_id,
        suggested_confidence: Math.round(primaryMatch.score)
      }
    });

  } catch (error) {
    console.error('Enhanced Archetype Matching Error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});

function calculateCommunicationScore(profileComm, archetypeComm) {
  if (!profileComm || !archetypeComm) return 0.5;
  
  let matches = 0;
  let total = 0;

  if (profileComm.verbosity && archetypeComm.verbosity) {
    total++;
    if (profileComm.verbosity === archetypeComm.verbosity) matches++;
  }

  if (profileComm.technical_depth && archetypeComm.technical_depth) {
    total++;
    if (profileComm.technical_depth === archetypeComm.technical_depth) matches++;
  }

  return total > 0 ? matches / total : 0.5;
}

function calculateDecisionMakingScore(profileDecision, archetypeDecision) {
  if (!profileDecision || !archetypeDecision) return 0.5;
  
  let matches = 0;
  let total = 0;

  if (profileDecision.speed && archetypeDecision.speed) {
    total++;
    if (profileDecision.speed === archetypeDecision.speed) matches++;
  }

  if (profileDecision.data_requirement && archetypeDecision.data_requirement) {
    total++;
    if (profileDecision.data_requirement === archetypeDecision.data_requirement) matches++;
  }

  if (profileDecision.risk_tolerance && archetypeDecision.risk_tolerance) {
    total++;
    if (profileDecision.risk_tolerance === archetypeDecision.risk_tolerance) matches++;
  }

  return total > 0 ? matches / total : 0.5;
}

function calculateBehaviorScore(profile, definingBehaviors) {
  const matched = [];
  const unmatched = [];

  definingBehaviors.forEach(behavior => {
    const behaviorId = behavior.behavior_id?.toLowerCase() || '';
    const weight = behavior.weight || 0.5;

    // Check if behavior is present in validated patterns
    const isValidated = profile.validated_patterns?.some(vp => 
      vp.pattern_name?.toLowerCase().includes(behaviorId.replace(/_/g, ' '))
    );

    // Check supervision, complexity, pace preferences
    const matchesPreferences = (
      (behaviorId.includes('supervision') && profile.supervision_preference) ||
      (behaviorId.includes('complexity') && profile.complexity_tolerance) ||
      (behaviorId.includes('pace') && profile.pace_preference) ||
      isValidated
    );

    if (matchesPreferences || isValidated) {
      matched.push({ ...behavior, weight });
    } else {
      unmatched.push({ ...behavior, weight });
    }
  });

  const totalWeight = [...matched, ...unmatched].reduce((sum, b) => sum + b.weight, 0);
  const matchedWeight = matched.reduce((sum, b) => sum + b.weight, 0);
  
  const score = totalWeight > 0 ? matchedWeight / totalWeight : 0.5;

  return { score, matched, unmatched };
}

function calculateContextScore(profile, archetype) {
  let score = 0;
  let factors = 0;

  // Industry match
  if (archetype.typical_industries && archetype.typical_industries.length > 0) {
    factors++;
    if (archetype.typical_industries.some(ind => 
      profile.industry?.toLowerCase().includes(ind.toLowerCase())
    )) {
      score += 1;
    }
  }

  // Stage match
  if (archetype.typical_stages && archetype.typical_stages.length > 0) {
    factors++;
    if (archetype.typical_stages.includes(profile.company_stage)) {
      score += 1;
    }
  }

  return factors > 0 ? score / factors : 0.5;
}

function calculateValidatedPatternsScore(validatedPatterns, archetype) {
  if (!validatedPatterns || validatedPatterns.length === 0) return 0.3;
  
  // Higher score if more patterns are validated with high confidence
  const highConfidencePatterns = validatedPatterns.filter(vp => (vp.confidence || 0) >= 70);
  const avgObservations = validatedPatterns.reduce((sum, vp) => sum + (vp.observation_count || 0), 0) / validatedPatterns.length;

  let score = 0;
  if (highConfidencePatterns.length >= 3) score += 0.4;
  else if (highConfidencePatterns.length >= 2) score += 0.3;
  else if (highConfidencePatterns.length >= 1) score += 0.2;

  if (avgObservations >= 5) score += 0.3;
  else if (avgObservations >= 3) score += 0.2;
  else if (avgObservations >= 1) score += 0.1;

  return Math.min(score, 1);
}

function calculateMatchQuality(primaryMatch, secondaryMatch) {
  if (!primaryMatch) return { level: 'unknown', message: 'No matches found' };

  const primaryScore = primaryMatch.score;
  const gap = secondaryMatch ? primaryMatch.score - secondaryMatch.score : 100;

  if (primaryScore >= 85 && gap >= 15) {
    return {
      level: 'excellent',
      message: 'Strong definitive match with clear archetype alignment',
      confidence: 'very_high'
    };
  } else if (primaryScore >= 75 && gap >= 10) {
    return {
      level: 'good',
      message: 'Solid match with distinguishable primary archetype',
      confidence: 'high'
    };
  } else if (primaryScore >= 65) {
    return {
      level: 'moderate',
      message: 'Reasonable match but client may exhibit hybrid characteristics',
      confidence: 'moderate'
    };
  } else if (primaryScore >= 50) {
    return {
      level: 'weak',
      message: 'Weak match - client is evolving or exhibits mixed archetype traits',
      confidence: 'low'
    };
  } else {
    return {
      level: 'poor',
      message: 'No clear archetype match - needs more engagement data or represents novel pattern',
      confidence: 'very_low'
    };
  }
}

function generateNurturingInsights(profile, primaryMatch, secondaryMatch, primaryArchetype, secondaryArchetype) {
  const insights = {
    current_state: '',
    pathway_to_primary: [],
    pathway_to_secondary: [],
    behavioral_gaps: [],
    recommended_actions: [],
    engagement_strategies: []
  };

  if (!primaryMatch || !primaryArchetype) return insights;

  const primaryScore = primaryMatch.score;
  const gap = secondaryMatch ? primaryMatch.score - secondaryMatch.score : 100;

  // Current state assessment
  if (primaryScore >= 80) {
    insights.current_state = `Client strongly aligns with ${primaryMatch.archetype_name} archetype. Focus on reinforcing this pathway.`;
  } else if (primaryScore >= 65 && gap < 15 && secondaryMatch) {
    insights.current_state = `Client exhibits hybrid characteristics between ${primaryMatch.archetype_name} and ${secondaryMatch.archetype_name}. Can be nurtured toward either archetype.`;
  } else {
    insights.current_state = `Client shows partial alignment with ${primaryMatch.archetype_name}. Significant nurturing opportunity exists.`;
  }

  // Pathway to strengthen primary archetype
  if (primaryMatch.unmatched_behaviors && primaryMatch.unmatched_behaviors.length > 0) {
    const topGaps = primaryMatch.unmatched_behaviors
      .sort((a, b) => (b.weight || 0) - (a.weight || 0))
      .slice(0, 5);

    topGaps.forEach(behavior => {
      insights.pathway_to_primary.push({
        behavior: behavior.description || behavior.behavior_id,
        weight: behavior.weight,
        action: `Introduce engagements that naturally develop ${behavior.behavior_id?.replace(/_/g, ' ') || 'this behavior'}`,
        priority: behavior.weight >= 0.7 ? 'high' : behavior.weight >= 0.5 ? 'medium' : 'low'
      });
    });

    insights.behavioral_gaps = topGaps.map(b => ({
      gap: b.behavior_id || b.description,
      impact: b.weight >= 0.7 ? 'high' : b.weight >= 0.5 ? 'medium' : 'low',
      description: b.description
    }));
  }

  // Pathway to secondary archetype (if close)
  if (secondaryMatch && secondaryArchetype && gap < 20) {
    insights.pathway_to_secondary.push({
      archetype: secondaryMatch.archetype_name,
      score_gap: Math.round(gap * 10) / 10,
      potential: gap < 10 ? 'high' : gap < 15 ? 'moderate' : 'low',
      key_differences: secondaryMatch.unmatched_behaviors?.slice(0, 3).map(b => b.behavior_id) || []
    });
  }

  // Recommended actions based on breakdown
  const breakdown = primaryMatch.breakdown;
  
  if (breakdown.communication < 70) {
    insights.recommended_actions.push({
      area: 'Communication Alignment',
      suggestion: `Adapt communication style to match ${primaryArchetype.communication_style?.verbosity || 'preferred'} verbosity and ${primaryArchetype.communication_style?.technical_depth || 'appropriate'} technical depth`,
      expected_impact: 'Increase archetype alignment by 5-10 points'
    });
  }

  if (breakdown.decision_making < 70) {
    insights.recommended_actions.push({
      area: 'Decision Process',
      suggestion: `Align with client's ${primaryArchetype.decision_making_style?.speed || 'preferred'} decision speed and ${primaryArchetype.decision_making_style?.data_requirement || 'appropriate'} data requirements`,
      expected_impact: 'Strengthen trust and decision confidence'
    });
  }

  if (breakdown.behavioral_patterns < 60) {
    insights.recommended_actions.push({
      area: 'Behavioral Patterns',
      suggestion: 'Focus next 2-3 engagements on activities that develop missing high-weight behaviors',
      expected_impact: 'Move from hypothesis to validated archetype status'
    });
  }

  // Engagement strategies
  if (primaryArchetype.preferred_frameworks && primaryArchetype.preferred_frameworks.length > 0) {
    insights.engagement_strategies.push({
      strategy: 'Framework Alignment',
      description: `Leverage ${primaryArchetype.preferred_frameworks.slice(0, 2).join(' and ')} frameworks in upcoming engagements`,
      rationale: `These frameworks resonate strongly with ${primaryMatch.archetype_name} archetype`
    });
  }

  if (profile.total_engagements < 3) {
    insights.engagement_strategies.push({
      strategy: 'Pattern Validation',
      description: 'Schedule 2-3 structured engagements to validate emerging patterns',
      rationale: 'Insufficient data points to confirm archetype - more observations needed'
    });
  }

  if ((profile.overall_confidence || 50) < 70) {
    insights.engagement_strategies.push({
      strategy: 'Behavioral Consistency Testing',
      description: 'Introduce varied engagement types to test behavioral consistency across contexts',
      rationale: 'Build confidence in archetype classification through diverse observations'
    });
  }

  return insights;
}