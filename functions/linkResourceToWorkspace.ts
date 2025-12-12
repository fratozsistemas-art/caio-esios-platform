import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Links a resource (strategy, analysis, etc.) to a workspace
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id, resource_type, resource_id, resource_title, tags, notes } = await req.json();

    // Check workspace access
    const { data: accessCheck } = await base44.functions.invoke('checkWorkspaceAccess', {
      workspace_id,
      required_permission: 'can_create_strategies'
    });

    if (!accessCheck.has_access) {
      return Response.json({ 
        error: 'Insufficient permissions to link resources' 
      }, { status: 403 });
    }

    // Check if resource already linked
    const existing = await base44.entities.WorkspaceResource.filter({
      workspace_id,
      resource_id
    });

    if (existing.length > 0) {
      return Response.json({
        success: false,
        error: 'Resource already linked to this workspace',
        resource_link: existing[0]
      });
    }

    // Auto-tag if no tags provided
    let finalTags = tags || [];
    if (finalTags.length === 0) {
      try {
        const { data: tagResult } = await base44.functions.invoke('autoTagResource', {
          workspace_id,
          resource_type,
          resource_id
        });
        if (tagResult.success) {
          finalTags = tagResult.tags;
        }
      } catch (e) {
        // Continue without tags if AI fails
        console.error('Auto-tagging failed:', e);
      }
    }

    // Create resource link
    const resourceLink = await base44.entities.WorkspaceResource.create({
      workspace_id,
      resource_type,
      resource_id,
      resource_title,
      added_by: user.email,
      tags: finalTags,
      notes: notes || '',
      is_pinned: false
    });

    return Response.json({
      success: true,
      resource_link: resourceLink,
      auto_tagged: finalTags.length > 0 && (!tags || tags.length === 0)
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});