import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversation_id } = await req.json();

        if (!conversation_id) {
            return Response.json({ error: 'conversation_id is required' }, { status: 400 });
        }

        // Get conversation to verify ownership
        const conversation = await base44.agents.getConversation(conversation_id);

        // Soft delete by updating metadata
        await base44.asServiceRole.agents.updateConversation(conversation_id, {
            metadata: {
                ...conversation.metadata,
                deleted: true,
                deleted_at: new Date().toISOString(),
                deleted_by: user.email
            }
        });

        return Response.json({
            success: true,
            conversation_id
        });

    } catch (error) {
        console.error('Delete conversation error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});