import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { anomaly_id, status, resolution_notes } = await req.json();

    if (!anomaly_id || !status) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updated = await base44.entities.NetworkAnomaly.update(anomaly_id, {
      status,
      resolution_notes,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      resolved_by: status === 'resolved' ? user.email : null
    });

    return Response.json({ success: true, anomaly: updated });

  } catch (error) {
    console.error("Error updating anomaly status:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});