import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { force_all = false, min_engagements = 1 } = await req.json();

    // Get all behavioral profiles that need archetype assignment
    const allProfiles = await base44.asServiceRole.entities.BehavioralProfile.list('-updated_date');

    const profilesToProcess = allProfiles.filter(profile => {
      // Skip if already has validated archetype and not forcing
      if (!force_all && profile.archetype_validation_status === 'VALIDATED' && profile.primary_archetype_id) {
        return false;
      }

      // Only process profiles with minimum engagement or data
      const hasMinimumData = profile.total_engagements >= min_engagements || 
                            (profile.communication_patterns && Object.keys(profile.communication_patterns).length > 0) ||
                            (profile.decision_making_patterns && Object.keys(profile.decision_making_patterns).length > 0);

      return hasMinimumData;
    });

    console.log(`Processing ${profilesToProcess.length} profiles for archetype assignment`);

    const results = [];
    const errors = [];

    for (const profile of profilesToProcess) {
      try {
        const response = await base44.asServiceRole.functions.invoke('autoAssignArchetype', {
          profile_id: profile.id
        });

        if (response.data.success) {
          results.push({
            profile_id: profile.id,
            client_name: profile.client_name,
            assigned_archetype: response.data.assigned_archetype,
            confidence: response.data.confidence,
            validation_status: response.data.validation_status
          });
        } else {
          errors.push({
            profile_id: profile.id,
            client_name: profile.client_name,
            error: response.data.message
          });
        }
      } catch (error) {
        errors.push({
          profile_id: profile.id,
          client_name: profile.client_name,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      total_profiles: allProfiles.length,
      processed: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Batch auto-assign error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});