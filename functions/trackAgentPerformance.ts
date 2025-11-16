import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { agent_id, agent_name, agent_type, execution_id, execution_time_ms, tokens_used, success, error_message } = await req.json();

    const costPerToken = 0.00002;
    const cost_usd = tokens_used ? tokens_used * costPerToken : 0;

    await base44.entities.AgentPerformanceMetric.create({
      agent_id,
      agent_name,
      agent_type,
      execution_id,
      execution_time_ms,
      tokens_used,
      cost_usd,
      success,
      error_message,
      quality_score: success ? 85 : 0
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});