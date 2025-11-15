import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entity_type, entity_id, annotation, position } = await req.json();

    if (!entity_type || !entity_id || !annotation) {
      return Response.json({ 
        error: 'entity_type, entity_id, and annotation are required' 
      }, { status: 400 });
    }

    // Validate entity type
    const validTypes = ['Strategy', 'Analysis', 'TSIProject', 'FileAnalysis'];
    if (!validTypes.includes(entity_type)) {
      return Response.json({ 
        error: `Invalid entity_type. Must be one of: ${validTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Get entity to verify access
    let entity;
    try {
      const entities = await base44.entities[entity_type].filter({ id: entity_id });
      entity = entities && entities.length > 0 ? entities[0] : null;
    } catch (error) {
      return Response.json({ 
        error: 'Failed to fetch entity' 
      }, { status: 500 });
    }

    if (!entity) {
      return Response.json({ 
        error: 'Entity not found' 
      }, { status: 404 });
    }

    // Create annotation object
    const newAnnotation = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: annotation,
      author: user.email,
      author_name: user.full_name || user.email,
      created_at: new Date().toISOString(),
      position: position || null,
      resolved: false
    };

    // Get current annotations from metadata
    const currentAnnotations = entity.annotations || [];
    currentAnnotations.push(newAnnotation);

    // Update entity with new annotation using service role
    await base44.asServiceRole.entities[entity_type].update(entity_id, {
      annotations: currentAnnotations,
      last_annotation_at: new Date().toISOString()
    });

    // Notify collaborators if entity is shared
    if (entity.shared_with && entity.shared_with.length > 0) {
      const notificationPromises = entity.shared_with
        .filter(s => s.email !== user.email)
        .map(async (share) => {
          try {
            await base44.integrations.Core.SendEmail({
              to: share.email,
              subject: `New annotation on ${entity_type}`,
              body: `${user.full_name || user.email} added an annotation:\n\n"${annotation}"`
            });
          } catch (e) {
            console.error('Failed to send notification:', e);
          }
        });
      
      await Promise.allSettled(notificationPromises);
    }

    return Response.json({
      success: true,
      annotation: newAnnotation
    });

  } catch (error) {
    console.error('Add annotation error:', error);
    return Response.json({ 
      error: 'Failed to add annotation',
      details: error.message
    }, { status: 500 });
  }
});