import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * AGENT ORCHESTRATION LAYER
 * 
 * Dynamically selects and sequences agents based on:
 * - User intent classification
 * - Conversation context
 * - Knowledge graph data
 * - User behavioral profile
 * - Task complexity assessment
 * 
 * Capabilities:
 * - Multi-agent collaboration with context passing
 * - Adaptive agent selection
 * - Parallel vs sequential execution
 * - Extensible for new agents/frameworks
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            user_message, 
            conversation_id, 
            conversation_history = [],
            user_profile_id = null,
            force_agent = null 
        } = await req.json();

        if (!user_message) {
            return Response.json({ error: 'user_message is required' }, { status: 400 });
        }

        // STEP 1: Classify user intent and assess task complexity
        const intentAnalysis = await classifyIntent(user_message, conversation_history, base44);

        // STEP 2: Get user context (behavioral profile, preferences, history)
        const userContext = await getUserContext(user, user_profile_id, base44);

        // STEP 3: Query knowledge graph for relevant entities
        const relevantEntities = await getRelevantEntities(intentAnalysis, base44);

        // STEP 4: Select agents and define execution plan
        const executionPlan = await createExecutionPlan(
            intentAnalysis,
            userContext,
            relevantEntities,
            force_agent
        );

        // STEP 5: Execute agent orchestration
        const results = await executeAgentPlan(executionPlan, user_message, conversation_id, base44);

        // STEP 6: Synthesize and return final response
        const finalResponse = await synthesizeResponse(results, intentAnalysis, base44);

        return Response.json({
            success: true,
            orchestration: {
                intent: intentAnalysis,
                agents_used: executionPlan.agents.map(a => a.agent_name),
                execution_mode: executionPlan.mode,
                total_steps: executionPlan.agents.length
            },
            response: finalResponse,
            metadata: {
                crv_scores: finalResponse.crv_scores,
                confidence: finalResponse.confidence,
                agents_executed: results.map(r => ({
                    agent: r.agent_name,
                    duration_ms: r.duration_ms,
                    success: r.success
                }))
            }
        });

    } catch (error) {
        console.error('Orchestration error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

// Classify user intent using AI
async function classifyIntent(userMessage, conversationHistory, base44) {
    const prompt = `Analyze this user message and classify the intent for strategic agent routing.

USER MESSAGE: "${userMessage}"

CONVERSATION CONTEXT (last 3 messages):
${conversationHistory.slice(-3).map((m, i) => `${i + 1}. ${m.role}: ${m.content?.substring(0, 200)}`).join('\n')}

---

Classify the intent across multiple dimensions for optimal agent routing.

Return ONLY valid JSON:
{
  "primary_intent": "market_analysis" | "competitive_intel" | "financial_modeling" | "tech_assessment" | "strategic_planning" | "risk_assessment" | "fundraising" | "behavioral_analysis" | "general_query",
  "complexity": "simple" | "moderate" | "complex" | "multi_phase",
  "time_horizon": "immediate" | "short_term" | "long_term" | "ongoing",
  "stakeholder_level": "tactical" | "managerial" | "executive" | "board",
  "requires_external_data": true | false,
  "frameworks_needed": ["ABRA", "NIA", "M1", "M4"],
  "modules_needed": ["M1", "M2"],
  "requires_collaboration": true | false,
  "execution_mode": "parallel" | "sequential" | "hybrid",
  "confidence": 85
}`;

    const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
            type: "object",
            properties: {
                primary_intent: { type: "string" },
                complexity: { type: "string" },
                time_horizon: { type: "string" },
                stakeholder_level: { type: "string" },
                requires_external_data: { type: "boolean" },
                frameworks_needed: { type: "array", items: { type: "string" } },
                modules_needed: { type: "array", items: { type: "string" } },
                requires_collaboration: { type: "boolean" },
                execution_mode: { type: "string" },
                confidence: { type: "number" }
            }
        }
    });

    return result;
}

// Get user context for personalization
async function getUserContext(user, profileId, base44) {
    const context = {
        user_email: user.email,
        user_role: user.role,
        behavioral_profile: null,
        preferences: {},
        engagement_history: []
    };

    // Try to get behavioral profile
    if (profileId) {
        const profiles = await base44.entities.BehavioralProfile.filter({ id: profileId });
        if (profiles.length > 0) {
            context.behavioral_profile = profiles[0];
            
            // Get engagement history
            const engagements = await base44.entities.EngagementRecord.filter({
                behavioral_profile_id: profileId
            });
            context.engagement_history = engagements.slice(0, 10);
        }
    } else {
        // Try to find by email
        const profiles = await base44.entities.BehavioralProfile.filter({
            client_name: user.full_name
        });
        if (profiles.length > 0) {
            context.behavioral_profile = profiles[0];
        }
    }

    return context;
}

// Query knowledge graph for relevant context
async function getRelevantEntities(intentAnalysis, base44) {
    try {
        const nodes = await base44.entities.KnowledgeGraphNode.list();
        
        // Filter relevant nodes based on intent
        const relevantNodes = nodes.filter(node => {
            if (intentAnalysis.primary_intent === 'market_analysis') {
                return node.node_type === 'market' || node.node_type === 'industry';
            }
            if (intentAnalysis.primary_intent === 'competitive_intel') {
                return node.node_type === 'company' || node.node_type === 'competitor';
            }
            if (intentAnalysis.primary_intent === 'tech_assessment') {
                return node.node_type === 'technology' || node.node_type === 'framework';
            }
            return true;
        }).slice(0, 20);

        return relevantNodes;
    } catch (error) {
        console.error('Entity retrieval error:', error);
        return [];
    }
}

// Create agent execution plan
async function createExecutionPlan(intentAnalysis, userContext, relevantEntities, forceAgent) {
    const plan = {
        mode: intentAnalysis.execution_mode || 'sequential',
        agents: [],
        context_flow: {}
    };

    // If forced to specific agent, use that
    if (forceAgent) {
        plan.agents = [{ agent_name: forceAgent, role: 'primary', input_sources: [] }];
        return plan;
    }

    // Map intent to agents
    const agentMapping = {
        market_analysis: ['m1_market_context', 'm2_competitive_intel'],
        competitive_intel: ['m2_competitive_intel', 'm5_strategic_synthesis'],
        financial_modeling: ['m4_financial_model', 'm9_funding_intelligence'],
        tech_assessment: ['m3_tech_innovation'],
        strategic_planning: ['m5_strategic_synthesis', 'm6_opportunity_matrix', 'm7_implementation'],
        risk_assessment: ['metamodel_abr'],
        fundraising: ['m9_funding_intelligence', 'm4_financial_model'],
        behavioral_analysis: ['caio_master'],
        general_query: ['caio_agent']
    };

    // Select primary agents based on intent
    const primaryAgents = agentMapping[intentAnalysis.primary_intent] || ['caio_agent'];

    // Add agents to plan
    primaryAgents.forEach((agentName, idx) => {
        plan.agents.push({
            agent_name: agentName,
            role: idx === 0 ? 'primary' : 'supporting',
            input_sources: idx === 0 ? ['user_message'] : ['previous_agent_output'],
            frameworks: intentAnalysis.frameworks_needed || [],
            modules: intentAnalysis.modules_needed || []
        });
    });

    // If complex, add synthesis agent
    if (intentAnalysis.complexity === 'complex' || intentAnalysis.complexity === 'multi_phase') {
        plan.agents.push({
            agent_name: 'm5_strategic_synthesis',
            role: 'synthesizer',
            input_sources: ['all_previous_outputs'],
            frameworks: ['HYBRID']
        });
    }

    // If requires behavioral adaptation, route through master
    if (userContext.behavioral_profile && intentAnalysis.stakeholder_level === 'board') {
        plan.agents.unshift({
            agent_name: 'caio_master',
            role: 'context_adapter',
            input_sources: ['user_message', 'behavioral_profile'],
            frameworks: []
        });
    }

    // Define context flow
    plan.context_flow = {
        knowledge_entities: relevantEntities.map(e => ({ id: e.id, type: e.node_type, label: e.label })),
        user_profile: userContext.behavioral_profile ? {
            archetype: userContext.behavioral_profile.primary_archetype_id,
            confidence: userContext.behavioral_profile.archetype_confidence,
            communication_style: userContext.behavioral_profile.communication_preferences
        } : null,
        frameworks: intentAnalysis.frameworks_needed || [],
        modules: intentAnalysis.modules_needed || []
    };

    return plan;
}

// Execute agent plan
async function executeAgentPlan(plan, userMessage, conversationId, base44) {
    const results = [];
    let contextAccumulator = {
        user_message: userMessage,
        knowledge_entities: plan.context_flow.knowledge_entities,
        user_profile: plan.context_flow.user_profile
    };

    if (plan.mode === 'parallel') {
        // Execute all agents in parallel
        const promises = plan.agents.map(agent => 
            executeAgent(agent, contextAccumulator, conversationId, base44)
        );
        const parallelResults = await Promise.all(promises);
        results.push(...parallelResults);
    } else {
        // Execute sequentially with context passing
        for (const agent of plan.agents) {
            const agentResult = await executeAgent(agent, contextAccumulator, conversationId, base44);
            results.push(agentResult);

            // Accumulate context for next agent
            if (agentResult.success && agentResult.output) {
                contextAccumulator[`${agent.agent_name}_output`] = agentResult.output;
                contextAccumulator.previous_agent_output = agentResult.output;
            }
        }
    }

    return results;
}

// Execute individual agent
async function executeAgent(agentConfig, context, conversationId, base44) {
    const startTime = Date.now();

    try {
        // Build agent prompt with context
        const agentPrompt = buildAgentPrompt(agentConfig, context);

        // For simplicity, using CAIO agent for now
        // In production, this would route to specific agents
        const conversation = conversationId 
            ? await base44.agents.getConversation(conversationId)
            : await base44.agents.createConversation({
                agent_name: agentConfig.agent_name,
                metadata: {
                    orchestrated: true,
                    role: agentConfig.role,
                    frameworks: agentConfig.frameworks
                }
            });

        await base44.agents.addMessage(conversation, {
            role: 'user',
            content: agentPrompt
        });

        // Wait for response (in real implementation, use streaming)
        await new Promise(resolve => setTimeout(resolve, 2000));

        const updatedConv = await base44.agents.getConversation(conversation.id);
        const lastMessage = updatedConv.messages[updatedConv.messages.length - 1];

        return {
            agent_name: agentConfig.agent_name,
            role: agentConfig.role,
            success: true,
            output: lastMessage?.content || '',
            duration_ms: Date.now() - startTime,
            metadata: {
                frameworks_used: agentConfig.frameworks,
                modules_used: agentConfig.modules
            }
        };

    } catch (error) {
        return {
            agent_name: agentConfig.agent_name,
            role: agentConfig.role,
            success: false,
            error: error.message,
            duration_ms: Date.now() - startTime
        };
    }
}

// Build contextualized prompt for agent
function buildAgentPrompt(agentConfig, context) {
    let prompt = '';

    // Add role context
    if (agentConfig.role === 'context_adapter') {
        prompt += `[CONTEXT ADAPTER ROLE]\n`;
        prompt += `Adapt the following query for ${context.user_profile?.archetype || 'general'} archetype.\n\n`;
    } else if (agentConfig.role === 'synthesizer') {
        prompt += `[SYNTHESIS ROLE]\n`;
        prompt += `Synthesize insights from previous analysis stages.\n\n`;
    }

    // Add frameworks/modules context
    if (agentConfig.frameworks?.length > 0) {
        prompt += `Required Frameworks: ${agentConfig.frameworks.join(', ')}\n`;
    }
    if (agentConfig.modules?.length > 0) {
        prompt += `Active Modules: ${agentConfig.modules.join(', ')}\n`;
    }

    // Add knowledge graph context
    if (context.knowledge_entities?.length > 0) {
        prompt += `\nRelevant Entities: ${context.knowledge_entities.map(e => e.label).join(', ')}\n`;
    }

    // Add behavioral adaptation
    if (context.user_profile) {
        const profile = context.user_profile;
        prompt += `\nUser Profile Adaptation:\n`;
        prompt += `- Archetype: ${profile.archetype}\n`;
        prompt += `- Confidence: ${profile.confidence}%\n`;
        if (profile.communication_style?.verbosity) {
            prompt += `- Preferred verbosity: ${profile.communication_style.verbosity}\n`;
        }
    }

    // Add previous agent outputs (for sequential execution)
    if (agentConfig.input_sources?.includes('previous_agent_output') && context.previous_agent_output) {
        prompt += `\n--- Previous Analysis ---\n${context.previous_agent_output}\n\n`;
    }

    if (agentConfig.input_sources?.includes('all_previous_outputs')) {
        const previousOutputs = Object.entries(context)
            .filter(([key, _]) => key.endsWith('_output'))
            .map(([key, value]) => `${key}:\n${value}`)
            .join('\n\n');
        
        if (previousOutputs) {
            prompt += `\n--- All Previous Analysis Stages ---\n${previousOutputs}\n\n`;
        }
    }

    // Add user message
    prompt += `\n--- User Request ---\n${context.user_message}\n`;

    return prompt;
}

// Synthesize final response from all agent outputs
async function synthesizeResponse(agentResults, intentAnalysis, base44) {
    const successfulResults = agentResults.filter(r => r.success);

    if (successfulResults.length === 0) {
        return {
            content: "I apologize, but I encountered issues processing your request. Please try rephrasing your question.",
            crv_scores: { confidence: 0, relevance: 0, value: 0 },
            confidence: 0
        };
    }

    // If single agent, return directly
    if (successfulResults.length === 1) {
        return {
            content: successfulResults[0].output,
            crv_scores: { confidence: 80, relevance: 85, value: 80 },
            confidence: 80,
            source_agents: [successfulResults[0].agent_name]
        };
    }

    // Multi-agent synthesis
    const synthesisPrompt = `Synthesize the following multi-agent analysis into a cohesive strategic response.

AGENTS EXECUTED:
${successfulResults.map((r, i) => `
${i + 1}. ${r.agent_name} (${r.role}):
${r.output}
`).join('\n---\n')}

---

Create a unified response that:
1. Integrates insights from all agents
2. Highlights cross-agent correlations
3. Provides clear action items
4. Maintains executive-level clarity

Return structured JSON:
{
  "executive_summary": "2-3 sentence overview",
  "key_insights": ["insight 1", "insight 2", "insight 3"],
  "cross_agent_patterns": ["pattern found across multiple agents"],
  "strategic_recommendations": [
    {"action": "recommendation", "priority": "high", "framework": "ABRA"}
  ],
  "next_steps": ["immediate action 1", "action 2"],
  "confidence": 85,
  "relevance": 90,
  "value": 88
}`;

    const synthesis = await base44.integrations.Core.InvokeLLM({
        prompt: synthesisPrompt,
        add_context_from_internet: false,
        response_json_schema: {
            type: "object",
            properties: {
                executive_summary: { type: "string" },
                key_insights: { type: "array", items: { type: "string" } },
                cross_agent_patterns: { type: "array", items: { type: "string" } },
                strategic_recommendations: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            action: { type: "string" },
                            priority: { type: "string" },
                            framework: { type: "string" }
                        }
                    }
                },
                next_steps: { type: "array", items: { type: "string" } },
                confidence: { type: "number" },
                relevance: { type: "number" },
                value: { type: "number" }
            }
        }
    });

    // Format final response
    let content = `## ${synthesis.executive_summary}\n\n`;
    
    if (synthesis.key_insights?.length > 0) {
        content += `### 💡 Key Insights\n`;
        synthesis.key_insights.forEach((insight, i) => {
            content += `${i + 1}. ${insight}\n`;
        });
        content += `\n`;
    }

    if (synthesis.cross_agent_patterns?.length > 0) {
        content += `### 🔗 Cross-Analysis Patterns\n`;
        synthesis.cross_agent_patterns.forEach((pattern, i) => {
            content += `- ${pattern}\n`;
        });
        content += `\n`;
    }

    if (synthesis.strategic_recommendations?.length > 0) {
        content += `### 🎯 Strategic Recommendations\n`;
        synthesis.strategic_recommendations.forEach((rec, i) => {
            const priorityEmoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
            content += `${priorityEmoji} **${rec.action}** (${rec.framework})\n`;
        });
        content += `\n`;
    }

    if (synthesis.next_steps?.length > 0) {
        content += `### ⚡ Next Steps\n`;
        synthesis.next_steps.forEach((step, i) => {
            content += `${i + 1}. ${step}\n`;
        });
    }

    content += `\n---\n`;
    content += `*Analysis powered by ${successfulResults.length} specialized agents: ${successfulResults.map(r => r.agent_name).join(', ')}*`;

    return {
        content,
        crv_scores: {
            confidence: synthesis.confidence || 80,
            relevance: synthesis.relevance || 80,
            value: synthesis.value || 80
        },
        confidence: synthesis.confidence || 80,
        source_agents: successfulResults.map(r => r.agent_name),
        synthesis
    };
}