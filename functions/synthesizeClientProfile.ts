import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Pattern Synthesis Engine - Core algorithm from Max/ESIOS
 * Aggregates behavioral observations across multiple engagements
 * to calculate longitudinal confidence and synthesize client intelligence
 */
Deno.serve(async (req) => {
  console.log('🧠 [Pattern Synthesis] Function started');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { behavioral_profile_id } = await req.json();

    if (!behavioral_profile_id) {
      return Response.json({ 
        error: 'behavioral_profile_id is required' 
      }, { status: 400 });
    }

    console.log('📊 [Synthesis] Loading profile:', behavioral_profile_id);

    // Load behavioral profile
    const profile = await base44.entities.BehavioralProfile.get(behavioral_profile_id);
    
    if (!profile) {
      return Response.json({ 
        error: 'Profile not found' 
      }, { status: 404 });
    }

    // Load all engagement records for this profile
    const engagements = await base44.entities.EngagementRecord.filter({
      behavioral_profile_id
    });

    console.log(`✅ [Synthesis] Loaded ${engagements.length} engagement(s)`);

    if (engagements.length === 0) {
      return Response.json({ 
        error: 'No engagements found for this profile' 
      }, { status: 404 });
    }

    // ALGORITHM 1: Calculate Pattern Confidence
    const calculatePatternConfidence = (observations, engagementCount, daysSinceLastEngagement) => {
      if (observations.length === 0) return 0;

      // Base confidence: Average of individual observations
      const baseConfidence = observations.reduce(
        (sum, obs) => sum + obs.confidence, 0
      ) / observations.length;

      // Confirmation rate: % of engagements where pattern observed
      const confirmationRate = observations.filter(
        obs => obs.observed
      ).length / engagementCount;

      let adjustedConfidence = baseConfidence;

      // Positive adjustments (Max's algorithm)
      if (engagementCount >= 3) adjustedConfidence += 10;
      if (engagementCount >= 5) adjustedConfidence += 15;
      if (engagementCount >= 10) adjustedConfidence += 20;
      if (confirmationRate >= 0.8) adjustedConfidence += 15;
      if (confirmationRate >= 0.9) adjustedConfidence += 20;

      // Negative adjustments (pattern drift)
      if (daysSinceLastEngagement > 180) adjustedConfidence -= 10;
      if (daysSinceLastEngagement > 365) adjustedConfidence -= 20;

      return Math.max(0, Math.min(100, adjustedConfidence));
    };

    // ALGORITHM 2: Calculate Behavioral Consistency
    const calculateBehavioralConsistency = (engagementRecords) => {
      if (engagementRecords.length < 2) return 100;

      let totalConsistencyScore = 0;
      let comparisons = 0;

      for (let i = 0; i < engagementRecords.length - 1; i++) {
        const current = engagementRecords[i];
        const next = engagementRecords[i + 1];

        let pairScore = 0;

        // Compare archetype (40 points)
        if (current.predicted_archetype === next.predicted_archetype) {
          pairScore += 40;
        }

        // Compare satisfaction (20 points - within 1 point)
        if (current.client_satisfaction && next.client_satisfaction) {
          if (Math.abs(current.client_satisfaction - next.client_satisfaction) <= 1) {
            pairScore += 20;
          }
        }

        // Compare objectives achieved (20 points)
        if (current.objectives_achieved === next.objectives_achieved) {
          pairScore += 20;
        }

        // Compare confirmation rate (20 points - within 10%)
        if (current.confirmation_rate && next.confirmation_rate) {
          if (Math.abs(current.confirmation_rate - next.confirmation_rate) <= 10) {
            pairScore += 20;
          }
        }

        totalConsistencyScore += pairScore;
        comparisons++;
      }

      return comparisons > 0 ? totalConsistencyScore / comparisons : 100;
    };

    // ALGORITHM 3: Determine Evolution Trajectory
    const determineEvolutionTrajectory = (behavioralConsistency, patternStability, emergingCount, decliningCount) => {
      if (behavioralConsistency >= 80 && patternStability >= 80 &&
          emergingCount + decliningCount <= 2) {
        return 'stable';
      }
      if (behavioralConsistency < 60 || patternStability < 60 ||
          emergingCount + decliningCount > 5) {
        return 'transforming';
      }
      return 'evolving';
    };

    // ALGORITHM 4: Determine Validation Status
    const determineValidationStatus = (engagementCount, confirmationRate, confidence) => {
      if (engagementCount >= 20 && confirmationRate >= 0.7 && confidence >= 95) {
        return 'MATURE';
      }
      if (engagementCount >= 10 && confirmationRate >= 0.7 && confidence >= 80) {
        return 'VALIDATED';
      }
      if (engagementCount >= 3 && confirmationRate >= 0.6 && confidence >= 60) {
        return 'EMERGING';
      }
      return 'HYPOTHESIS';
    };

    // Execute synthesis
    const sortedEngagements = engagements.sort(
      (a, b) => new Date(a.created_date) - new Date(b.created_date)
    );

    const lastEngagement = sortedEngagements[sortedEngagements.length - 1];
    const daysSinceLastEngagement = Math.floor(
      (Date.now() - new Date(lastEngagement.created_date)) / (1000 * 60 * 60 * 24)
    );

    // Aggregate all observed behaviors
    const allObservedBehaviors = sortedEngagements.flatMap(
      eng => eng.observed_behaviors || []
    );

    // Group by behavior_id
    const behaviorsByIds = {};
    allObservedBehaviors.forEach(obs => {
      if (!behaviorsByIds[obs.behavior_id]) {
        behaviorsByIds[obs.behavior_id] = [];
      }
      behaviorsByIds[obs.behavior_id].push(obs);
    });

    // Calculate confidence for each behavior
    const behaviorConfidences = {};
    Object.entries(behaviorsByIds).forEach(([behaviorId, observations]) => {
      behaviorConfidences[behaviorId] = calculatePatternConfidence(
        observations,
        engagements.length,
        daysSinceLastEngagement
      );
    });

    // Calculate overall archetype confidence
    const overallConfidence = Object.values(behaviorConfidences).length > 0
      ? Object.values(behaviorConfidences).reduce((sum, conf) => sum + conf, 0) / Object.values(behaviorConfidences).length
      : 50;

    // Calculate behavioral consistency
    const behavioralConsistency = calculateBehavioralConsistency(sortedEngagements);

    // Determine validation status
    const avgConfirmationRate = sortedEngagements.reduce(
      (sum, eng) => sum + (eng.confirmation_rate || 0), 0
    ) / sortedEngagements.length;

    const validationStatus = determineValidationStatus(
      engagements.length,
      avgConfirmationRate / 100,
      overallConfidence
    );

    // Determine evolution trajectory
    const patternStability = behavioralConsistency; // Simplified for MVP
    const emergingPatterns = sortedEngagements.flatMap(e => e.new_patterns_observed || []);
    const decliningPatterns = sortedEngagements.flatMap(e => e.patterns_rejected || []);

    const evolutionTrajectory = determineEvolutionTrajectory(
      behavioralConsistency,
      patternStability,
      emergingPatterns.length,
      decliningPatterns.length
    );

    // Generate next engagement recommendations
    const recommendations = [];
    
    if (validationStatus === 'HYPOTHESIS' && engagements.length < 3) {
      recommendations.push('Need 2-3 more engagements to validate archetype');
    }
    
    if (daysSinceLastEngagement > 180) {
      recommendations.push('⚠️ Pattern drift risk - Re-validate behaviors in next engagement');
    }
    
    if (behavioralConsistency >= 80) {
      recommendations.push('✅ High consistency - Apply validated patterns confidently');
    } else if (behavioralConsistency < 60) {
      recommendations.push('⚠️ Low consistency - Client behavior evolving, observe closely');
    }
    
    if (overallConfidence >= 85) {
      recommendations.push('🎯 Ready for proactive recommendations based on validated patterns');
    }

    // Update behavioral profile with synthesis results
    const updatedProfile = await base44.asServiceRole.entities.BehavioralProfile.update(
      behavioral_profile_id,
      {
        total_engagements: engagements.length,
        last_engagement_date: lastEngagement.created_date,
        archetype_confidence: Math.round(overallConfidence),
        archetype_validation_status: validationStatus,
        behavioral_consistency: Math.round(behavioralConsistency),
        evolution_trajectory: evolutionTrajectory,
        overall_confidence: Math.round(overallConfidence),
        validated_patterns: Object.entries(behaviorConfidences)
          .filter(([_, conf]) => conf >= 80)
          .map(([behaviorId, confidence]) => ({
            pattern_name: behaviorId,
            confidence: Math.round(confidence),
            observation_count: behaviorsByIds[behaviorId].length,
            last_observed: lastEngagement.created_date
          }))
      }
    );

    console.log('✅ [Synthesis] Profile updated with synthesis results');

    // Return synthesis results
    return Response.json({
      success: true,
      synthesis: {
        profile_id: behavioral_profile_id,
        client_name: profile.client_name,
        synthesis_date: new Date().toISOString(),
        
        // Confidence metrics
        overall_confidence: Math.round(overallConfidence),
        behavioral_consistency: Math.round(behavioralConsistency),
        validation_status: validationStatus,
        evolution_trajectory: evolutionTrajectory,
        
        // Engagement metrics
        total_engagements: engagements.length,
        days_since_last_engagement: daysSinceLastEngagement,
        avg_confirmation_rate: Math.round(avgConfirmationRate),
        avg_satisfaction: Math.round(
          sortedEngagements.reduce((sum, e) => sum + (e.client_satisfaction || 0), 0) / engagements.length * 10
        ) / 10,
        
        // Pattern intelligence
        validated_behaviors: Object.entries(behaviorConfidences)
          .filter(([_, conf]) => conf >= 80)
          .map(([behaviorId, confidence]) => ({
            behavior_id: behaviorId,
            confidence: Math.round(confidence),
            observations: behaviorsByIds[behaviorId].length
          })),
        
        emerging_behaviors: Object.entries(behaviorConfidences)
          .filter(([_, conf]) => conf >= 60 && conf < 80)
          .map(([behaviorId, confidence]) => ({
            behavior_id: behaviorId,
            confidence: Math.round(confidence),
            observations: behaviorsByIds[behaviorId].length
          })),
        
        // Recommendations
        recommendations,
        
        // Next engagement preparation
        next_engagement_preparation: {
          predicted_archetype: profile.primary_archetype_id,
          confidence_in_prediction: Math.round(overallConfidence),
          suggested_frameworks: updatedProfile.predictive_intelligence?.recommended_frameworks || [],
          anticipated_needs: updatedProfile.predictive_intelligence?.anticipated_needs || [],
          cautionary_notes: updatedProfile.predictive_intelligence?.cautionary_notes || []
        }
      },
      updated_profile: updatedProfile
    });

  } catch (error) {
    console.error('❌ [Synthesis] Error:', error);
    return Response.json({ 
      error: 'Pattern synthesis failed',
      details: error.message
    }, { status: 500 });
  }
});