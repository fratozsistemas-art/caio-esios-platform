import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { workspace_id } = await req.json();

        if (!workspace_id) {
            return Response.json({ error: 'workspace_id is required' }, { status: 400 });
        }

        const workspace = await base44.entities.Workspace.filter({ id: workspace_id });
        
        if (!workspace || workspace.length === 0) {
            return Response.json({ error: 'Workspace not found' }, { status: 404 });
        }

        const versions = workspace[0].metadata?.versions || [];

        // Calcular diff entre versões
        const versionsWithDiff = versions.map((version, idx) => {
            if (idx === 0) {
                return { ...version, diff: null };
            }

            const prev = versions[idx - 1];
            const diff = {
                progress_changed: version.snapshot.progress_percentage !== prev.snapshot.progress_percentage,
                phase_changed: version.snapshot.current_phase !== prev.snapshot.current_phase,
                deliverables_added: version.snapshot.deliverables?.length - (prev.snapshot.deliverables?.length || 0),
                data_sources_added: version.snapshot.data_sources?.length - (prev.snapshot.data_sources?.length || 0)
            };

            return { ...version, diff };
        });

        return Response.json({
            success: true,
            versions: versionsWithDiff.reverse() // Mais recente primeiro
        });

    } catch (error) {
        console.error('Get workspace versions error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});