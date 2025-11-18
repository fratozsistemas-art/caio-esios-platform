import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile_id, profile_data } = await req.json();

    if (!profile_id) {
      return Response.json({ error: 'profile_id is required' }, { status: 400 });
    }

    // Get the profile
    const profiles = await base44.asServiceRole.entities.BehavioralProfile.filter({ id: profile_id });
    const profile = profiles[0];

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if profile has minimum data for matching
    const hasMinimumData = profile.total_engagements >= 1 || 
                          (profile.communication_patterns && Object.keys(profile.communication_patterns).length > 0) ||
                          (profile.decision_making_patterns && Object.keys(profile.decision_making_patterns).length > 0);

    if (!hasMinimumData) {
      console.log('Profile has insufficient data for archetype matching');
      return Response.json({
        success: false,
        message: 'Insufficient data for archetype matching',
        profile_id
      });
    }

    // Call enhanced archetype matching
    const matchingResponse = await base44.asServiceRole.functions.invoke('enhancedArchetypeMatching', {
      profile_id
    });

    if (!matchingResponse.data || !matchingResponse.data.primary_match) {
      return Response.json({
        success: false,
        message: 'No matching results returned',
        profile_id
      });
    }

    const { primary_match, match_quality } = matchingResponse.data;

    // Determine validation status based on score
    let validationStatus = 'HYPOTHESIS';
    if (primary_match.score >= 80) {
      validationStatus = 'VALIDATED';
    } else if (primary_match.score >= 65) {
      validationStatus = 'EMERGING';
    }

    // Update the profile with matched archetype
    await base44.asServiceRole.entities.BehavioralProfile.update(profile_id, {
      primary_archetype_id: primary_match.archetype_identifier,
      archetype_confidence: Math.round(primary_match.score),
      archetype_validation_status: validationStatus,
      last_archetype_analysis_date: new Date().toISOString(),
      archetype_matching_metadata: {
        match_quality: match_quality?.level,
        confidence: match_quality?.confidence,
        last_auto_assigned: new Date().toISOString(),
        matched_behaviors: primary_match.matched_behaviors?.map(b => b.behavior_id),
        breakdown: primary_match.breakdown
      }
    });

    return Response.json({
      success: true,
      profile_id,
      assigned_archetype: primary_match.archetype_name,
      archetype_id: primary_match.archetype_identifier,
      confidence: Math.round(primary_match.score),
      validation_status: validationStatus,
      match_quality: match_quality?.level
    });

  } catch (error) {
    console.error('Auto-assign archetype error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});