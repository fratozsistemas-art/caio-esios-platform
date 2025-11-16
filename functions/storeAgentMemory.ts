import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Store agent memory for long-term learning and context retention
 * 
 * Extracts key learnings from interactions and stores them for future retrieval
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
            conversation_id,
            user_message,
            agent_response,
            intent_analysis,
            knowledge_context,
            outcome_quality,
            extract_learnings = true
        } = await req.json();

        if (!agent_name || !agent_response) {
            return Response.json({ 
                error: 'agent_name and agent_response are required' 
            }, { status: 400 });
        }

        const memories = [];

        // 1. Store interaction memory
        const interactionMemory = await base44.asServiceRole.entities.AgentMemory.create({
            agent_name,
            memory_type: 'interaction',
            content: `User: ${user_message}\nAgent: ${agent_response.substring(0, 500)}`,
            context: {
                user_email: user.email,
                intent: intent_analysis?.primary_intent,
                entities_involved: knowledge_context?.entities?.map(e => e.label) || [],
                frameworks_used: intent_analysis?.frameworks_needed || [],
                outcome: outcome_quality || 'unknown'
            },
            relevance_score: 100,
            linked_conversation_id: conversation_id,
            tags: [
                intent_analysis?.primary_intent,
                intent_analysis?.complexity,
                ...(intent_analysis?.frameworks_needed || [])
            ].filter(Boolean),
            confidence: 85
        });

        memories.push(interactionMemory);

        // 2. Extract and store insights/patterns using AI
        if (extract_learnings) {
            const learnings = await extractLearnings(
                agent_name,
                user_message,
                agent_response,
                intent_analysis,
                knowledge_context,
                base44
            );

            for (const learning of learnings) {
                const learningMemory = await base44.asServiceRole.entities.AgentMemory.create({
                    agent_name,
                    memory_type: learning.type,
                    content: learning.content,
                    context: {
                        user_email: user.email,
                        intent: intent_analysis?.primary_intent,
                        entities_involved: learning.entities || [],
                        frameworks_used: intent_analysis?.frameworks_needed || []
                    },
                    relevance_score: learning.importance || 90,
                    linked_conversation_id: conversation_id,
                    tags: learning.tags || [],
                    confidence: learning.confidence || 75
                });

                memories.push(learningMemory);
            }
        }

        // 3. Store entity relationships discovered
        if (knowledge_context?.relationships?.length > 0) {
            const relationshipInsights = knowledge_context.relationships
                .slice(0, 3)
                .map(rel => `${rel.from} → ${rel.type} → ${rel.to}`);

            if (relationshipInsights.length > 0) {
                const relMemory = await base44.asServiceRole.entities.AgentMemory.create({
                    agent_name,
                    memory_type: 'entity_relationship',
                    content: `Discovered relationships: ${relationshipInsights.join('; ')}`,
                    context: {
                        user_email: user.email,
                        entities_involved: [
                            ...knowledge_context.relationships.map(r => r.from),
                            ...knowledge_context.relationships.map(r => r.to)
                        ]
                    },
                    relevance_score: 85,
                    linked_conversation_id: conversation_id,
                    tags: ['relationship_mapping', 'knowledge_graph'],
                    confidence: 80
                });

                memories.push(relMemory);
            }
        }

        // 4. Decay old memories (reduce relevance over time)
        await decayOldMemories(agent_name, base44);

        return Response.json({
            success: true,
            memories_stored: memories.length,
            memory_ids: memories.map(m => m.id)
        });

    } catch (error) {
        console.error('Memory storage error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

// Extract learnings using AI
async function extractLearnings(agentName, userMessage, agentResponse, intentAnalysis, knowledgeContext, base44) {
    const prompt = `Extract key learnings from this agent interaction for long-term memory storage.

AGENT: ${agentName}
USER MESSAGE: ${userMessage}
AGENT RESPONSE: ${agentResponse.substring(0, 1000)}
INTENT: ${intentAnalysis?.primary_intent}
COMPLEXITY: ${intentAnalysis?.complexity}

Identify:
1. Strategic insights worth remembering
2. User preference patterns
3. Successful approaches/frameworks
4. Failed attempts (if any)
5. Entity/domain-specific knowledge

Return JSON array of learnings:
[
  {
    "type": "insight" | "pattern" | "preference" | "strategy" | "failure" | "success",
    "content": "The specific learning",
    "importance": 80,
    "confidence": 85,
    "tags": ["tag1", "tag2"],
    "entities": ["entity1", "entity2"]
  }
]`;

    try {
        const learnings = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: false,
            response_json_schema: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        type: { type: "string" },
                        content: { type: "string" },
                        importance: { type: "number" },
                        confidence: { type: "number" },
                        tags: { type: "array", items: { type: "string" } },
                        entities: { type: "array", items: { type: "string" } }
                    }
                }
            }
        });

        return learnings || [];
    } catch (error) {
        console.error('Learning extraction error:', error);
        return [];
    }
}

// Decay old memories
async function decayOldMemories(agentName, base44) {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const oldMemories = await base44.asServiceRole.entities.AgentMemory.filter({
            agent_name: agentName,
            relevance_score: { $gt: 0 }
        });

        for (const memory of oldMemories) {
            const createdDate = new Date(memory.created_date);
            const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceCreation > 30) {
                const decayFactor = Math.max(0, 100 - (daysSinceCreation - 30) * 2);
                const newRelevance = Math.max(0, Math.min(memory.relevance_score, decayFactor));

                if (newRelevance !== memory.relevance_score) {
                    await base44.asServiceRole.entities.AgentMemory.update(memory.id, {
                        relevance_score: newRelevance
                    });
                }
            }
        }
    } catch (error) {
        console.error('Memory decay error:', error);
    }
}