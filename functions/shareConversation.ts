import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversation_id, share_with_emails, message_ids = null } = await req.json();

        if (!conversation_id) {
            return Response.json({ error: 'conversation_id is required' }, { status: 400 });
        }

        // Get conversation
        const conversation = await base44.agents.getConversation(conversation_id);

        // Create share record
        const shareId = crypto.randomUUID();
        const shareUrl = `${Deno.env.get('BASE44_APP_URL')}/shared-conversation/${shareId}`;

        // Update conversation metadata with share info
        await base44.asServiceRole.agents.updateConversation(conversation_id, {
            metadata: {
                ...conversation.metadata,
                shared: true,
                share_id: shareId,
                shared_at: new Date().toISOString(),
                shared_by: user.email,
                shared_with: share_with_emails || [],
                shared_message_ids: message_ids, // null = all, array = specific messages
                share_url: shareUrl
            }
        });

        // Send notification emails (optional)
        if (share_with_emails && share_with_emails.length > 0) {
            for (const email of share_with_emails) {
                try {
                    await base44.integrations.Core.SendEmail({
                        to: email,
                        subject: `${user.full_name} compartilhou uma conversa com você`,
                        body: `${user.full_name} compartilhou uma conversa do CAIO·AI com você.\n\nAcesse: ${shareUrl}`
                    });
                } catch (emailError) {
                    console.error(`Failed to send email to ${email}:`, emailError);
                }
            }
        }

        return Response.json({
            success: true,
            share_id: shareId,
            share_url: shareUrl,
            conversation_id
        });

    } catch (error) {
        console.error('Share conversation error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});