import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { cache_key, cache_type, fetch_fn } = await req.json();

    const existing = await base44.asServiceRole.entities.CacheEntry.filter({ cache_key });

    if (existing.length > 0) {
      const entry = existing[0];
      const now = new Date();
      const expiresAt = new Date(entry.expires_at);

      if (now < expiresAt) {
        await base44.asServiceRole.entities.CacheEntry.update(entry.id, {
          hit_count: (entry.hit_count || 0) + 1,
          last_accessed: now.toISOString()
        });
        return Response.json({ success: true, data: entry.cached_data, cached: true });
      }
    }

    return Response.json({ success: false, cached: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});