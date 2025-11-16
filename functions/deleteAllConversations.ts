import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Delete all conversations for the current user
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { agent_name = 'caio_agent' } = await req.json();

        // Get all conversations for this user
        const conversations = await base44.agents.listConversations({
            agent_name
        });

        let deletedCount = 0;

        // Mark all as deleted (soft delete)
        for (const conv of conversations) {
            try {
                await base44.asServiceRole.agents.updateConversation(conv.id, {
                    metadata: {
                        ...conv.metadata,
                        deleted: true,
                        deleted_at: new Date().toISOString(),
                        deleted_by: user.email
                    }
                });
                deletedCount++;
            } catch (error) {
                console.error(`Failed to delete conversation ${conv.id}:`, error);
            }
        }

        return Response.json({
            success: true,
            deleted_count: deletedCount,
            total_conversations: conversations.length
        });

    } catch (error) {
        console.error('Delete conversations error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});