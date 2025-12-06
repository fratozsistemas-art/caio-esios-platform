import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversation_id, force_rename = false } = await req.json();

        if (!conversation_id) {
            return Response.json({ error: 'conversation_id is required' }, { status: 400 });
        }

        // Get conversation
        const conversation = await base44.agents.getConversation(conversation_id);

        // Skip if already has custom name and not forcing
        if (!force_rename && conversation.metadata?.custom_name) {
            return Response.json({
                success: true,
                skipped: true,
                reason: 'Already has custom name'
            });
        }

        // Extract last 6 messages for context
        const recentMessages = (conversation.messages || []).slice(-6);
        
        if (recentMessages.length === 0) {
            return Response.json({
                success: true,
                name: 'Nova Conversa',
                skipped: true
            });
        }

        // Build context string
        const messageContext = recentMessages.map(m => 
            `${m.role}: ${m.content?.substring(0, 150)}`
        ).join('\n');

        // Generate name using LLM
        const result = await base44.integrations.Core.InvokeLLM({
            prompt: `Based on this conversation excerpt, generate a short, descriptive title (max 60 characters, in Portuguese):

${messageContext}

Generate ONLY the title, nothing else. Make it specific and informative.`,
        });

        const generatedName = result.trim().replace(/^["']|["']$/g, '');

        // Update conversation
        await base44.asServiceRole.agents.updateConversation(conversation_id, {
            metadata: {
                ...conversation.metadata,
                name: generatedName,
                auto_named: true,
                last_named_at: new Date().toISOString()
            }
        });

        return Response.json({
            success: true,
            name: generatedName,
            conversation_id
        });

    } catch (error) {
        console.error('Auto name conversation error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});