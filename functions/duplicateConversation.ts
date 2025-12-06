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

        // Get original conversation
        const originalConv = await base44.agents.getConversation(conversation_id);

        // Create duplicate
        const newConv = await base44.asServiceRole.agents.createConversation({
            agent_name: originalConv.agent_name,
            metadata: {
                ...originalConv.metadata,
                name: `${originalConv.metadata?.name || 'Conversa'} (cópia)`,
                duplicated_from: conversation_id,
                duplicated_at: new Date().toISOString(),
                duplicated_by: user.email
            }
        });

        // Copy messages
        if (originalConv.messages && originalConv.messages.length > 0) {
            for (const message of originalConv.messages) {
                await base44.asServiceRole.agents.addMessage(newConv, {
                    role: message.role,
                    content: message.content,
                    file_urls: message.file_urls
                });
            }
        }

        return Response.json({
            success: true,
            original_id: conversation_id,
            new_conversation: newConv
        });

    } catch (error) {
        console.error('Duplicate conversation error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});