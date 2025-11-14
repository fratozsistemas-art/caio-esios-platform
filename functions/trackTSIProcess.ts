import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Track TSI Process Events
 * Emit real-time events for TSI process visualization
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, event } = await req.json();

    // Event types: phase_start, phase_progress, phase_complete
    // phase IDs: eva, caio, csi, vte, ia_plus

    // Store event for conversation
    const existingEvents = await base44.asServiceRole.entities.TSIProcessEvent.filter({
      conversation_id: conversationId
    });

    await base44.asServiceRole.entities.TSIProcessEvent.create({
      conversation_id: conversationId,
      event_type: event.type,
      phase_id: event.phaseId,
      progress: event.progress,
      metadata: event.metadata,
      timestamp: new Date().toISOString()
    });

    return Response.json({
      success: true,
      event
    });

  } catch (error) {
    console.error('Error tracking TSI process:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});