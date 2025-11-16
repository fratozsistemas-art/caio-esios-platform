import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Retrieve relevant agent memories for context-aware responses
 * 
 * Uses semantic search, recency, and relevance scoring
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            agent_name,
            query,
            intent,
            user_email,
            entities = [],
            frameworks = [],
            memory_types = [],
            max_results = 10,
            min_relevance = 40
        } = await req.json();

        if (!agent_name) {
            return Response.json({ 
                error: 'agent_name is required' 
            }, { status: 400 });
        }

        // Build filter
        const filter = { agent_name };

        if (user_email) {
            filter['context.user_email'] = user_email;
        }

        if (memory_types.length > 0) {
            filter.memory_type = { $in: memory_types };
        }

        // Retrieve memories
        const allMemories = await base44.entities.AgentMemory.filter(
            filter,
            '-created_date',
            100
        );

        // Filter by minimum relevance
        let relevantMemories = allMemories.filter(m => 
            (m.relevance_score || 0) >= min_relevance
        );

        // Score memories based on context
        const scoredMemories = relevantMemories.map(memory => {
            let score = memory.relevance_score || 50;

            // Boost if intent matches
            if (intent && memory.context?.intent === intent) {
                score += 20;
            }

            // Boost if entities overlap
            const memoryEntities = memory.context?.entities_involved || [];
            const entityOverlap = entities.filter(e => 
                memoryEntities.some(me => me.toLowerCase().includes(e.toLowerCase()))
            ).length;
            score += entityOverlap * 10;

            // Boost if frameworks match
            const memoryFrameworks = memory.context?.frameworks_used || [];
            const frameworkOverlap = frameworks.filter(f => 
                memoryFrameworks.includes(f)
            ).length;
            score += frameworkOverlap * 15;

            // Boost recent memories
            const daysSinceCreation = Math.floor(
                (Date.now() - new Date(memory.created_date).getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceCreation < 7) {
                score += 10;
            }

            // Boost frequently accessed
            if (memory.access_count > 5) {
                score += 5;
            }

            // Semantic similarity (basic keyword matching)
            if (query) {
                const queryLower = query.toLowerCase();
                const contentLower = memory.content.toLowerCase();
                const keywords = queryLower.split(' ').filter(w => w.length > 3);
                const matches = keywords.filter(kw => contentLower.includes(kw)).length;
                score += matches * 5;
            }

            return { ...memory, computed_score: Math.min(score, 100) };
        });

        // Sort by computed score
        scoredMemories.sort((a, b) => b.computed_score - a.computed_score);

        // Take top results
        const topMemories = scoredMemories.slice(0, max_results);

        // Update access counts and timestamps
        for (const memory of topMemories) {
            await base44.asServiceRole.entities.AgentMemory.update(memory.id, {
                access_count: (memory.access_count || 0) + 1,
                last_accessed_at: new Date().toISOString()
            });
        }

        // Group by type for structured context
        const groupedMemories = topMemories.reduce((acc, mem) => {
            const type = mem.memory_type;
            if (!acc[type]) acc[type] = [];
            acc[type].push(mem);
            return acc;
        }, {});

        // Generate memory summary
        const summary = await generateMemorySummary(topMemories, intent, base44);

        return Response.json({
            success: true,
            total_memories: allMemories.length,
            relevant_memories: topMemories.length,
            memories: topMemories,
            grouped_by_type: groupedMemories,
            summary
        });

    } catch (error) {
        console.error('Memory retrieval error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

// Generate a concise summary of retrieved memories
async function generateMemorySummary(memories, intent, base44) {
    if (memories.length === 0) {
        return "No relevant memories found.";
    }

    if (memories.length <= 3) {
        return memories.map(m => m.content).join('; ');
    }

    const prompt = `Summarize these agent memories into a concise context for the current interaction.

CURRENT INTENT: ${intent}

MEMORIES:
${memories.map((m, i) => `${i + 1}. [${m.memory_type}] ${m.content.substring(0, 200)}`).join('\n')}

Create a 2-3 sentence summary highlighting the most relevant context.`;

    try {
        const summary = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: false
        });

        return summary;
    } catch (error) {
        console.error('Summary generation error:', error);
        return `Retrieved ${memories.length} relevant memories from past interactions.`;
    }
}