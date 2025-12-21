import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all content to index
    const [feedback, strategies, conversations, workspaces] = await Promise.all([
      base44.asServiceRole.entities.Feedback.list('-created_date', 100),
      base44.asServiceRole.entities.Strategy.list('-created_date', 100),
      base44.agents.listConversations({ agent_name: 'caio_agent' }),
      base44.asServiceRole.entities.Workspace.list('-created_date', 100)
    ]);

    let indexed = 0;
    let failed = 0;

    // Index feedback
    for (const item of feedback.slice(0, 50)) {
      try {
        const content = `${item.feedback_type}: ${item.comment || ''} Rating: ${item.rating || 'N/A'}`;
        await base44.functions.invoke('autoTagContent', {
          content,
          title: `Feedback: ${item.feedback_type}`,
          sourceType: 'feedback',
          sourceId: item.id
        });
        indexed++;
      } catch (error) {
        failed++;
      }
    }

    // Index strategies
    for (const item of strategies.slice(0, 50)) {
      try {
        const content = `${item.title}\n${item.description || ''}\n${JSON.stringify(item.action_items || [])}`;
        await base44.functions.invoke('autoTagContent', {
          content,
          title: item.title,
          sourceType: 'strategy',
          sourceId: item.id
        });
        indexed++;
      } catch (error) {
        failed++;
      }
    }

    // Index recent conversations
    for (const item of conversations.slice(0, 30)) {
      try {
        const content = item.messages?.map(m => m.content).join('\n') || '';
        await base44.functions.invoke('autoTagContent', {
          content,
          title: item.metadata?.title || 'Conversation',
          sourceType: 'conversation',
          sourceId: item.id
        });
        indexed++;
      } catch (error) {
        failed++;
      }
    }

    // Index workspaces
    for (const item of workspaces.slice(0, 50)) {
      try {
        const content = `${item.name}\n${item.description || ''}\n${JSON.stringify(item.phases || [])}`;
        await base44.functions.invoke('autoTagContent', {
          content,
          title: item.name,
          sourceType: 'workspace',
          sourceId: item.id
        });
        indexed++;
      } catch (error) {
        failed++;
      }
    }

    return Response.json({
      success: true,
      indexed,
      failed,
      message: `Successfully indexed ${indexed} items, ${failed} failed`
    });

  } catch (error) {
    console.error('Bulk indexing error:', error);
    return Response.json({ 
      error: 'Bulk indexing failed',
      details: error.message 
    }, { status: 500 });
  }
});