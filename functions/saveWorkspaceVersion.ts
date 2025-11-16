import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { workspace_id, changes, comment } = await req.json();

        if (!workspace_id) {
            return Response.json({ error: 'workspace_id is required' }, { status: 400 });
        }

        // Buscar workspace atual
        const workspace = await base44.entities.Workspace.filter({ id: workspace_id });
        
        if (!workspace || workspace.length === 0) {
            return Response.json({ error: 'Workspace not found' }, { status: 404 });
        }

        const currentWorkspace = workspace[0];

        // Criar snapshot da versão
        const version = {
            workspace_id: workspace_id,
            version_number: (currentWorkspace.metadata?.version_count || 0) + 1,
            snapshot: {
                name: currentWorkspace.name,
                current_phase: currentWorkspace.current_phase,
                progress_percentage: currentWorkspace.progress_percentage,
                data_sources: currentWorkspace.data_sources,
                deliverables: currentWorkspace.deliverables,
                phases: currentWorkspace.phases,
                metadata: currentWorkspace.metadata
            },
            changes: changes || [],
            comment: comment || '',
            created_by: user.email,
            created_at: new Date().toISOString()
        };

        // Salvar versão (usando metadata do workspace)
        const versions = currentWorkspace.metadata?.versions || [];
        versions.push(version);

        await base44.entities.Workspace.update(workspace_id, {
            metadata: {
                ...currentWorkspace.metadata,
                versions: versions,
                version_count: version.version_number,
                last_version_at: version.created_at
            }
        });

        return Response.json({
            success: true,
            version: version
        });

    } catch (error) {
        console.error('Save workspace version error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});