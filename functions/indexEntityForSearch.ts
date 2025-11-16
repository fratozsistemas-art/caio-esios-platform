import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { entity_type, entity_id, entity_data } = await req.json();

    const title = entity_data.title || entity_data.name || entity_id;
    const description = entity_data.description || '';
    const searchableText = JSON.stringify(entity_data).toLowerCase();

    const tags = [];
    if (entity_data.status) tags.push(entity_data.status);
    if (entity_data.category) tags.push(entity_data.category);
    if (entity_data.framework) tags.push(entity_data.framework);

    const existing = await base44.asServiceRole.entities.GlobalSearchIndex.filter({
      entity_type,
      entity_id
    });

    if (existing.length > 0) {
      await base44.asServiceRole.entities.GlobalSearchIndex.update(existing[0].id, {
        title,
        description,
        searchable_text: searchableText,
        tags,
        metadata: entity_data,
        last_indexed: new Date().toISOString()
      });
    } else {
      await base44.asServiceRole.entities.GlobalSearchIndex.create({
        entity_type,
        entity_id,
        title,
        description,
        searchable_text: searchableText,
        tags,
        metadata: entity_data,
        last_indexed: new Date().toISOString()
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});