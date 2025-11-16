import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { cache_key, cache_type, data, ttl_hours = 24 } = await req.json();

    const expiresAt = new Date(Date.now() + ttl_hours * 60 * 60 * 1000);

    const existing = await base44.asServiceRole.entities.CacheEntry.filter({ cache_key });

    if (existing.length > 0) {
      await base44.asServiceRole.entities.CacheEntry.update(existing[0].id, {
        cached_data: data,
        expires_at: expiresAt.toISOString(),
        last_accessed: new Date().toISOString()
      });
    } else {
      await base44.asServiceRole.entities.CacheEntry.create({
        cache_key,
        cache_type,
        cached_data: data,
        expires_at: expiresAt.toISOString(),
        last_accessed: new Date().toISOString()
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});