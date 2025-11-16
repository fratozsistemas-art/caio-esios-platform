
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * ADVANCED AGENT ORCHESTRATION LAYER v2.1
 * 
 * Features:
 * - Adaptive routing with alternative path proposals
 * - Agent sub-teams for parallel complex sub-tasks
 * - Structured context passing with Knowledge Graph integration
 * - Dynamic re-planning based on intermediate results
 * - Multi-substrate intelligence synthesis
 * - PERSISTENT MEMORY for long-term learning and context retention
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
            force_agent = null,
            enable_replanning = true,
            use_memory = true
        } = await req.json();

        if (!user_message) {
            return Response.json({ error: 'user_message is required' }, { status: 400 });
        }

        // STEP 1: Deep Intent Analysis with multi-dimensional classification
        const intentAnalysis = await classifyIntent(user_message, conversation_history, base44);

        // STEP 2: Enhanced User Context with behavioral patterns
        const userContext = await getEnhancedUserContext(user, user_profile_id, base44);

        // STEP 3: Knowledge Graph Deep Query with relationship traversal
        const knowledgeContext = await getKnowledgeGraphContext(intentAnalysis, userContext, base44);

        // STEP 4: RETRIEVE AGENT MEMORIES for long-term context
        const agentMemories = use_memory ? await retrieveRelevantMemories(
            intentAnalysis,
            user.email,
            knowledgeContext,
            base44
        ) : { memories: [], summary: '' };

        // STEP 5: Advanced Execution Planning with sub-teams
        const executionPlan = await createAdvancedExecutionPlan(
            intentAnalysis,
            userContext,
            knowledgeContext,
            agentMemories,
            force_agent
        );

        // STEP 6: Execute with adaptive routing and re-planning
        const results = await executeAdaptiveOrchestration(
            executionPlan, 
            user_message, 
            conversation_id, 
            knowledgeContext,
            agentMemories,
            enable_replanning,
            base44
        );

        // STEP 7: Multi-substrate synthesis
        const finalResponse = await synthesizeMultiSubstrate(
            results, 
            intentAnalysis, 
            knowledgeContext, 
            agentMemories,
            base44
        );

        // STEP 8: STORE NEW MEMORIES for future learning
        if (use_memory && results.some(r => r.success)) {
            await storeInteractionMemories(
                executionPlan,
                results,
                user_message,
                finalResponse,
                conversation_id,
                intentAnalysis,
                knowledgeContext,
                base44
            );
        }

        return Response.json({
            success: true,
            orchestration: {
                intent: intentAnalysis,
                agents_used: results.map(r => r.agent_name),
                sub_teams: executionPlan.sub_teams?.map(st => st.name),
                execution_mode: executionPlan.mode,
                replanning_events: results.filter(r => r.replanned).length,
                total_steps: results.length,
                knowledge_entities_used: knowledgeContext.entities?.length || 0,
                memories_retrieved: agentMemories.memories?.length || 0
            },
            response: finalResponse,
            metadata: {
                crv_scores: finalResponse.crv_scores,
                confidence: finalResponse.confidence,
                execution_trace: results.map(r => ({
                    agent: r.agent_name,
                    duration_ms: r.duration_ms,
                    success: r.success,
                    replanned: r.replanned,
                    alternative_proposed: r.alternative_proposed
                })),
                knowledge_graph_impact: knowledgeContext.impact_score,
                memory_context: agentMemories.summary
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

// Advanced Intent Classification with confidence scoring
async function classifyIntent(userMessage, conversationHistory, base44) {
    const contextWindow = conversationHistory.slice(-5).map((m, i) => 
        `${i + 1}. ${m.role}: ${m.content?.substring(0, 150)}`
    ).join('\n');

    const prompt = `Multi-dimensional intent analysis for advanced agent routing.

USER MESSAGE: "${userMessage}"

CONVERSATION CONTEXT:
${contextWindow}

Perform deep intent classification across multiple dimensions:

{
  "primary_intent": "market_analysis" | "competitive_intel" | "financial_modeling" | "tech_assessment" | "strategic_planning" | "risk_assessment" | "fundraising" | "behavioral_analysis" | "ma_evaluation" | "general_query",
  "secondary_intents": ["intent1", "intent2"],
  "complexity": "simple" | "moderate" | "complex" | "multi_phase",
  "decomposable": true | false,
  "sub_tasks": [{"task": "analyze market size", "complexity": "moderate", "priority": "high"}],
  "time_horizon": "immediate" | "short_term" | "long_term" | "ongoing",
  "stakeholder_level": "tactical" | "managerial" | "executive" | "board",
  "requires_external_data": true | false,
  "data_sources_needed": ["financial_markets", "news", "social_media"],
  "frameworks_needed": ["ABRA", "NIA", "M1"],
  "modules_needed": ["M1", "M2", "M5"],
  "parallel_execution_viable": true | false,
  "requires_collaboration": true | false,
  "execution_mode": "parallel" | "sequential" | "hybrid",
  "confidence": 90,
  "alternative_interpretations": [{"intent": "alternative", "confidence": 60}]
}`;

    return await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
            type: "object",
            properties: {
                primary_intent: { type: "string" },
                secondary_intents: { type: "array", items: { type: "string" } },
                complexity: { type: "string" },
                decomposable: { type: "boolean" },
                sub_tasks: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            task: { type: "string" },
                            complexity: { type: "string" },
                            priority: { type: "string" }
                        }
                    }
                },
                time_horizon: { type: "string" },
                stakeholder_level: { type: "string" },
                requires_external_data: { type: "boolean" },
                data_sources_needed: { type: "array", items: { type: "string" } },
                frameworks_needed: { type: "array", items: { type: "string" } },
                modules_needed: { type: "array", items: { type: "string" } },
                parallel_execution_viable: { type: "boolean" },
                requires_collaboration: { type: "boolean" },
                execution_mode: { type: "string" },
                confidence: { type: "number" },
                alternative_interpretations: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            intent: { type: "string" },
                            confidence: { type: "number" }
                        }
                    }
                }
            }
        }
    });
}

// Enhanced user context with behavioral patterns
async function getEnhancedUserContext(user, profileId, base44) {
    const context = {
        user_email: user.email,
        user_role: user.role,
        behavioral_profile: null,
        preferences: {},
        engagement_patterns: [],
        decision_style: null
    };

    try {
        // Get behavioral profile
        const profiles = await base44.entities.BehavioralProfile.filter(
            profileId ? { id: profileId } : { client_name: user.full_name }
        );
        
        if (profiles.length > 0) {
            context.behavioral_profile = profiles[0];
            
            // Get engagement history for pattern analysis
            const engagements = await base44.entities.EngagementRecord.filter({
                behavioral_profile_id: profiles[0].id
            }, '-created_date', 20);
            
            context.engagement_patterns = analyzeEngagementPatterns(engagements);
            
            // Infer decision style
            context.decision_style = inferDecisionStyle(profiles[0], engagements);
        }
    } catch (error) {
        console.error('User context error:', error);
    }

    return context;
}

// Deep Knowledge Graph context extraction
async function getKnowledgeGraphContext(intentAnalysis, userContext, base44) {
    const context = {
        entities: [],
        relationships: [],
        relevant_strategies: [],
        similar_analyses: [],
        impact_score: 0
    };

    try {
        // Query relevant nodes
        const nodes = await base44.entities.KnowledgeGraphNode.list();
        
        // Filter by intent relevance
        const relevantNodes = nodes.filter(node => {
            if (intentAnalysis.primary_intent === 'market_analysis') {
                return ['market', 'industry', 'company'].includes(node.node_type);
            }
            if (intentAnalysis.primary_intent === 'competitive_intel') {
                return ['company', 'strategy'].includes(node.node_type);
            }
            if (intentAnalysis.primary_intent === 'tech_assessment') {
                return ['technology', 'framework'].includes(node.node_type);
            }
            return true;
        }).slice(0, 30);

        context.entities = relevantNodes;

        // Get relationships for context
        if (relevantNodes.length > 0) {
            const nodeIds = relevantNodes.map(n => n.id);
            const relationships = await base44.entities.KnowledgeGraphRelationship.list();
            
            context.relationships = relationships.filter(r => 
                nodeIds.includes(r.from_node_id) && nodeIds.includes(r.to_node_id)
            );
        }

        // Find similar past strategies
        const strategies = await base44.entities.Strategy.filter({
            category: intentAnalysis.frameworks_needed?.[0]
        }, '-created_date', 5);
        
        context.relevant_strategies = strategies;

        // Calculate impact score
        context.impact_score = calculateKnowledgeImpact(context);

    } catch (error) {
        console.error('Knowledge graph context error:', error);
    }

    return context;
}

// NEW: Retrieve relevant agent memories
async function retrieveRelevantMemories(intentAnalysis, userEmail, knowledgeContext, base44) {
    try {
        const primaryAgent = selectPrimaryAgent(intentAnalysis.primary_intent);
        
        const { data } = await base44.functions.invoke('retrieveAgentMemory', {
            agent_name: primaryAgent,
            query: intentAnalysis.primary_intent,
            intent: intentAnalysis.primary_intent,
            user_email: userEmail,
            entities: knowledgeContext.entities?.map(e => e.label) || [],
            frameworks: intentAnalysis.frameworks_needed || [],
            memory_types: ['insight', 'pattern', 'strategy', 'success'],
            max_results: 15,
            min_relevance: 50
        });

        // Ensure data is not null/undefined and has required properties
        if (data && data.memories && data.summary) {
            return data;
        }
        return { memories: [], summary: '' };

    } catch (error) {
        console.error('Memory retrieval error:', error);
        return { memories: [], summary: '' };
    }
}

// Advanced execution planning with sub-teams
async function createAdvancedExecutionPlan(intentAnalysis, userContext, knowledgeContext, agentMemories, forceAgent) {
    const plan = {
        mode: intentAnalysis.execution_mode || 'sequential',
        agents: [],
        sub_teams: [],
        context_flow: {},
        routing_strategy: 'adaptive'
    };

    if (forceAgent) {
        plan.agents = [{ agent_name: forceAgent, role: 'primary', sub_team: null }];
        return plan;
    }

    // Create sub-teams for complex decomposable tasks
    if (intentAnalysis.decomposable && intentAnalysis.sub_tasks?.length > 1) {
        intentAnalysis.sub_tasks.forEach((subTask, idx) => {
            const subTeam = {
                name: `sub_team_${idx}`,
                task: subTask.task,
                agents: selectAgentsForTask(subTask, intentAnalysis),
                priority: subTask.priority,
                execution_mode: subTask.complexity === 'complex' ? 'sequential' : 'parallel'
            };
            plan.sub_teams.push(subTeam);
        });
    }

    // Main agent selection
    const agentMapping = {
        market_analysis: ['m1_market_context', 'm2_competitive_intel'],
        competitive_intel: ['m2_competitive_intel', 'm5_strategic_synthesis'],
        financial_modeling: ['m4_financial_model', 'm9_funding_intelligence'],
        tech_assessment: ['m3_tech_innovation'],
        strategic_planning: ['m5_strategic_synthesis', 'm6_opportunity_matrix', 'm7_implementation'],
        risk_assessment: ['metamodel_abr', 'm8_reframing_loop'],
        fundraising: ['m9_funding_intelligence', 'm4_financial_model'],
        ma_evaluation: ['m4_financial_model', 'm2_competitive_intel', 'm5_strategic_synthesis'],
        behavioral_analysis: ['caio_master'],
        general_query: ['caio_agent']
    };

    const primaryAgents = agentMapping[intentAnalysis.primary_intent] || ['caio_agent'];
    
    primaryAgents.forEach((agentName, idx) => {
        plan.agents.push({
            agent_name: agentName,
            role: idx === 0 ? 'primary' : 'supporting',
            sub_team: null,
            frameworks: intentAnalysis.frameworks_needed || [],
            modules: intentAnalysis.modules_needed || [],
            can_propose_alternatives: true
        });
    });

    // Add synthesis if complex
    if (intentAnalysis.complexity === 'complex' || intentAnalysis.complexity === 'multi_phase') {
        plan.agents.push({
            agent_name: 'm5_strategic_synthesis',
            role: 'synthesizer',
            sub_team: null,
            frameworks: ['HYBRID']
        });
    }

    // Enhanced context flow with structured data and memories
    plan.context_flow = {
        knowledge_graph: {
            entities: knowledgeContext.entities.map(e => ({
                id: e.id,
                type: e.node_type,
                label: e.label,
                properties: e.properties
            })),
            relationships: knowledgeContext.relationships.map(r => ({
                from: r.from_node_id,
                to: r.to_node_id,
                type: r.relationship_type,
                properties: r.properties
            })),
            impact_score: knowledgeContext.impact_score
        },
        user_profile: userContext.behavioral_profile ? {
            archetype: userContext.behavioral_profile.primary_archetype_id,
            confidence: userContext.behavioral_profile.archetype_confidence,
            communication_style: userContext.behavioral_profile.communication_preferences,
            decision_style: userContext.decision_style,
            engagement_patterns: userContext.engagement_patterns
        } : null,
        historical_context: {
            similar_strategies: knowledgeContext.relevant_strategies.map(s => ({
                id: s.id,
                title: s.title,
                category: s.category,
                roi_estimate: s.roi_estimate
            }))
        },
        agent_memories: {
            summary: agentMemories.summary,
            key_learnings: agentMemories.memories?.slice(0, 5).map(m => ({
                type: m.memory_type,
                content: m.content ? m.content.substring(0, 200) : '', // Ensure content is not null
                relevance: m.computed_score || m.relevance_score
            })) || []
        },
        frameworks: intentAnalysis.frameworks_needed || [],
        modules: intentAnalysis.modules_needed || []
    };

    return plan;
}

// Adaptive execution with re-planning capability
async function executeAdaptiveOrchestration(plan, userMessage, conversationId, knowledgeContext, agentMemories, enableReplanning, base44) {
    const results = [];
    let contextAccumulator = {
        user_message: userMessage,
        knowledge_graph: plan.context_flow.knowledge_graph,
        user_profile: plan.context_flow.user_profile,
        historical_context: plan.context_flow.historical_context,
        agent_memories: plan.context_flow.agent_memories // Pass memories to context accumulator
    };

    // Execute sub-teams in parallel if present
    if (plan.sub_teams?.length > 0) {
        const subTeamPromises = plan.sub_teams.map(subTeam => 
            executeSubTeam(subTeam, contextAccumulator, conversationId, base44)
        );
        
        const subTeamResults = await Promise.all(subTeamPromises);
        results.push(...subTeamResults.flat());
        
        // Accumulate sub-team outputs
        subTeamResults.forEach((teamResults, idx) => {
            contextAccumulator[`sub_team_${idx}_output`] = teamResults.map(r => r.output).join('\n\n');
        });
    }

    // Execute main agents with adaptive routing
    for (let i = 0; i < plan.agents.length; i++) {
        const agent = plan.agents[i];
        const agentResult = await executeAgentWithAdaptiveRouting(
            agent, 
            contextAccumulator, 
            conversationId, 
            base44
        );
        
        results.push(agentResult);

        // Check for alternative path proposal
        if (enableReplanning && agentResult.alternative_proposed && agentResult.alternative_confidence > 70) {
            console.log(`Agent ${agent.agent_name} proposed alternative path`);
            
            // Execute alternative path
            const alternativeAgent = {
                ...agent,
                agent_name: agentResult.alternative_agent,
                role: 'alternative'
            };
            
            const altResult = await executeAgentWithAdaptiveRouting(
                alternativeAgent,
                contextAccumulator,
                conversationId,
                base44
            );
            
            altResult.replanned = true;
            results.push(altResult);
            
            // Update context with alternative insights
            contextAccumulator[`${altResult.agent_name}_alternative`] = altResult.output;
        }

        // Accumulate context
        if (agentResult.success && agentResult.output) {
            contextAccumulator[`${agent.agent_name}_output`] = agentResult.output;
            contextAccumulator.previous_agent_output = agentResult.output;
            
            // Add structured insights if available
            if (agentResult.structured_insights) {
                contextAccumulator[`${agent.agent_name}_insights`] = agentResult.structured_insights;
            }
        }
    }

    return results;
}

// Execute sub-team
async function executeSubTeam(subTeam, context, conversationId, base44) {
    const results = [];
    const subTeamContext = { ...context, sub_team_task: subTeam.task };

    if (subTeam.execution_mode === 'parallel') {
        const promises = subTeam.agents.map(agent => 
            executeAgent({ ...agent, sub_team: subTeam.name }, subTeamContext, conversationId, base44)
        );
        results.push(...await Promise.all(promises));
    } else {
        for (const agent of subTeam.agents) {
            const result = await executeAgent(
                { ...agent, sub_team: subTeam.name }, 
                subTeamContext, 
                conversationId, 
                base44
            );
            results.push(result);
            subTeamContext[`${agent.agent_name}_output`] = result.output;
        }
    }

    return results;
}

// Execute agent with adaptive routing
async function executeAgentWithAdaptiveRouting(agentConfig, context, conversationId, base44) {
    const startTime = Date.now();

    try {
        const agentPrompt = buildEnhancedAgentPrompt(agentConfig, context);

        const conversation = conversationId 
            ? await base44.agents.getConversation(conversationId)
            : await base44.agents.createConversation({
                agent_name: agentConfig.agent_name,
                metadata: {
                    orchestrated: true,
                    role: agentConfig.role,
                    sub_team: agentConfig.sub_team,
                    frameworks: agentConfig.frameworks
                }
            });

        await base44.agents.addMessage(conversation, {
            role: 'user',
            content: agentPrompt
        });

        // Add a small delay to simulate processing and avoid rate limits if any
        await new Promise(resolve => setTimeout(resolve, 2000));

        const updatedConv = await base44.agents.getConversation(conversation.id);
        const lastMessage = updatedConv.messages[updatedConv.messages.length - 1];

        // Check for alternative path proposal
        const alternativeProposal = detectAlternativePath(lastMessage.content);

        return {
            agent_name: agentConfig.agent_name,
            role: agentConfig.role,
            sub_team: agentConfig.sub_team,
            success: true,
            output: lastMessage?.content || '',
            duration_ms: Date.now() - startTime,
            alternative_proposed: alternativeProposal.detected,
            alternative_agent: alternativeProposal.agent,
            alternative_confidence: alternativeProposal.confidence,
            structured_insights: extractStructuredInsights(lastMessage.content),
            metadata: {
                frameworks_used: agentConfig.frameworks,
                modules_used: agentConfig.modules
            }
        };

    } catch (error) {
        console.error(`Error executing agent ${agentConfig.agent_name}:`, error);
        return {
            agent_name: agentConfig.agent_name,
            role: agentConfig.role,
            sub_team: agentConfig.sub_team,
            success: false,
            error: error.message,
            duration_ms: Date.now() - startTime,
            alternative_proposed: false
        };
    }
}

// Execute individual agent (fallback)
async function executeAgent(agentConfig, context, conversationId, base44) {
    return executeAgentWithAdaptiveRouting(agentConfig, context, conversationId, base44);
}

// Build enhanced prompt with structured data
function buildEnhancedAgentPrompt(agentConfig, context) {
    let prompt = '';

    if (agentConfig.sub_team) {
        prompt += `[SUB-TEAM: ${agentConfig.sub_team}]\n`;
        prompt += `Task: ${context.sub_team_task}\n\n`;
    }

    if (agentConfig.role === 'alternative') {
        prompt += `[ALTERNATIVE PATH EXECUTION]\n`;
        prompt += `Re-analyzing with different approach.\n\n`;
    }

    if (agentConfig.frameworks?.length > 0) {
        prompt += `Frameworks: ${agentConfig.frameworks.join(', ')}\n`;
    }

    if (agentConfig.modules?.length > 0) {
        prompt += `Modules: ${agentConfig.modules.join(', ')}\n`;
    }

    // Knowledge Graph Integration
    if (context.knowledge_graph?.entities?.length > 0) {
        prompt += `\nKnowledge Graph Context:\n`;
        prompt += `- ${context.knowledge_graph.entities.length} relevant entities\n`;
        prompt += `- Impact Score: ${context.knowledge_graph.impact_score}/100\n`;
        
        const topEntities = context.knowledge_graph.entities.slice(0, 5);
        prompt += `- Key Entities: ${topEntities.map(e => e.label).join(', ')}\n`;
        
        if (context.knowledge_graph.relationships?.length > 0) {
            prompt += `- ${context.knowledge_graph.relationships.length} relationships mapped\n`;
        }
    }

    // AGENT MEMORIES Integration
    if (context.agent_memories?.summary) {
        prompt += `\nAgent Long-Term Memory:\n`;
        prompt += `${context.agent_memories.summary}\n`;
        
        if (context.agent_memories.key_learnings?.length > 0) {
            prompt += `\nKey Learnings from Past:\n`;
            context.agent_memories.key_learnings.forEach((learning, i) => {
                prompt += `${i + 1}. [${learning.type}] ${learning.content}\n`;
            });
        }
    }

    // User Profile Adaptation
    if (context.user_profile) {
        prompt += `\nUser Profile:\n`;
        prompt += `- Archetype: ${context.user_profile.archetype}\n`;
        prompt += `- Decision Style: ${context.user_profile.decision_style}\n`;
        if (context.user_profile.engagement_patterns?.length > 0) {
            prompt += `- Engagement Patterns: ${context.user_profile.engagement_patterns.join(', ')}\n`;
        }
    }

    // Historical Context
    if (context.historical_context?.similar_strategies?.length > 0) {
        prompt += `\nRelevant Past Strategies:\n`;
        context.historical_context.similar_strategies.forEach((s, i) => {
            prompt += `${i + 1}. ${s.title} (${s.category}, ROI: ${s.roi_estimate}%)\n`;
        });
    }

    // Previous outputs
    if (agentConfig.role === 'synthesizer') {
        const outputs = Object.entries(context)
            .filter(([key, _]) => key.endsWith('_output'))
            .map(([key, value]) => `${key}:\n${value}`)
            .join('\n\n---\n\n');
        
        if (outputs) {
            prompt += `\n--- Previous Analysis ---\n${outputs}\n\n`;
        }
    } else if (context.previous_agent_output) {
        prompt += `\n--- Previous Agent Output ---\n${context.previous_agent_output}\n\n`;
    }

    // Alternative path check instruction
    if (agentConfig.can_propose_alternatives) {
        prompt += `\n[ADAPTIVE ROUTING ENABLED]\n`;
        prompt += `If you detect that a different analytical approach would yield better insights, indicate:\n`;
        prompt += `"ALTERNATIVE_PATH: [agent_name] - [reason]"\n\n`;
    }

    prompt += `\n--- User Request ---\n${context.user_message}\n`;

    return prompt;
}

// Multi-substrate synthesis
async function synthesizeMultiSubstrate(agentResults, intentAnalysis, knowledgeContext, agentMemories, base44) {
    const successfulResults = agentResults.filter(r => r.success);

    if (successfulResults.length === 0) {
        return {
            content: "Unable to process request. Please try again.",
            crv_scores: { confidence: 0, relevance: 0, value: 0 },
            confidence: 0
        };
    }

    if (successfulResults.length === 1) {
        return {
            content: successfulResults[0].output,
            crv_scores: { confidence: 80, relevance: 85, value: 80 },
            confidence: 80,
            source_agents: [successfulResults[0].agent_name]
        };
    }

    const synthesisPrompt = `Multi-substrate intelligence synthesis integrating Knowledge Graph, agent collaboration, persistent memories, and strategic frameworks.

AGENT OUTPUTS:
${successfulResults.map((r, i) => `
${i + 1}. ${r.agent_name} (${r.role}${r.sub_team ? `, sub-team: ${r.sub_team}` : ''}):
${r.output}
${r.structured_insights ? `\nStructured Insights: ${JSON.stringify(r.structured_insights)}` : ''}
`).join('\n---\n')}

KNOWLEDGE GRAPH CONTEXT:
- Entities: ${knowledgeContext.entities?.length || 0}
- Relationships: ${knowledgeContext.relationships?.length || 0}
- Impact Score: ${knowledgeContext.impact_score}/100

AGENT MEMORIES:
${agentMemories.summary || 'No relevant memories retrieved for this interaction.'}

Return structured synthesis:
{
  "executive_summary": "2-3 sentences",
  "key_insights": ["insight 1", "insight 2"],
  "cross_agent_patterns": ["pattern 1"],
  "knowledge_graph_integration": ["how KG data enhanced analysis"],
  "memory_informed_insights": ["insights informed by past learnings"],
  "strategic_recommendations": [
    {"action": "recommendation", "priority": "high", "framework": "ABRA", "confidence": 85}
  ],
  "next_steps": ["step 1", "step 2"],
  "confidence": 88,
  "relevance": 92,
  "value": 90,
  "alternative_perspectives": ["alternative view if applicable"]
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
                knowledge_graph_integration: { type: "array", items: { type: "string" } },
                memory_informed_insights: { type: "array", items: { type: "string" } },
                strategic_recommendations: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            action: { type: "string" },
                            priority: { type: "string" },
                            framework: { type: "string" },
                            confidence: { type: "number" }
                        }
                    }
                },
                next_steps: { type: "array", items: { type: "string" } },
                confidence: { type: "number" },
                relevance: { type: "number" },
                value: { type: "number" },
                alternative_perspectives: { type: "array", items: { type: "string" } }
            }
        }
    });

    // Format response
    let content = `## ${synthesis.executive_summary}\n\n`;
    
    if (synthesis.key_insights?.length > 0) {
        content += `### 💡 Key Insights\n`;
        synthesis.key_insights.forEach((insight, i) => {
            content += `${i + 1}. ${insight}\n`;
        });
        content += `\n`;
    }

    if (synthesis.memory_informed_insights?.length > 0) {
        content += `### 🧠 Memory-Informed Intelligence\n`;
        synthesis.memory_informed_insights.forEach(item => {
            content += `- ${item}\n`;
        });
        content += `\n`;
    }

    if (synthesis.knowledge_graph_integration?.length > 0) {
        content += `### 🕸️ Knowledge Graph Intelligence\n`;
        synthesis.knowledge_graph_integration.forEach(item => {
            content += `- ${item}\n`;
        });
        content += `\n`;
    }

    if (synthesis.cross_agent_patterns?.length > 0) {
        content += `### 🔗 Cross-Agent Patterns\n`;
        synthesis.cross_agent_patterns.forEach(pattern => {
            content += `- ${pattern}\n`;
        });
        content += `\n`;
    }

    if (synthesis.strategic_recommendations?.length > 0) {
        content += `### 🎯 Strategic Recommendations\n`;
        synthesis.strategic_recommendations.forEach(rec => {
            const emoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
            content += `${emoji} **${rec.action}** (${rec.framework}, ${rec.confidence}% confidence)\n`;
        });
        content += `\n`;
    }

    if (synthesis.next_steps?.length > 0) {
        content += `### ⚡ Next Steps\n`;
        synthesis.next_steps.forEach((step, i) => {
            content += `${i + 1}. ${step}\n`;
        });
    }

    if (synthesis.alternative_perspectives?.length > 0) {
        content += `\n### 🔄 Alternative Perspectives\n`;
        synthesis.alternative_perspectives.forEach(alt => {
            content += `- ${alt}\n`;
        });
    }

    content += `\n---\n`;
    content += `*Multi-substrate synthesis from ${successfulResults.length} agents with ${agentMemories.memories?.length || 0} memories`;
    if (knowledgeContext.entities?.length > 0) {
        content += ` and ${knowledgeContext.entities.length} KG entities`;
    }
    content += `*`;

    return {
        content,
        crv_scores: {
            confidence: synthesis.confidence || 85,
            relevance: synthesis.relevance || 85,
            value: synthesis.value || 85
        },
        confidence: synthesis.confidence || 85,
        source_agents: successfulResults.map(r => r.agent_name),
        synthesis
    };
}

// NEW: Store interaction memories
async function storeInteractionMemories(executionPlan, results, userMessage, finalResponse, conversationId, intentAnalysis, knowledgeContext, base44) {
    try {
        for (const agentConfig of executionPlan.agents) {
            const agentResult = results.find(r => r.agent_name === agentConfig.agent_name && r.success);
            
            if (agentResult) {
                // Determine a suitable agent name for memory storage.
                // For sub-team agents, we might store memory under the sub-team's primary agent or the individual agent.
                // For simplicity, using the agent_name from the execution plan.
                const memoryAgentName = agentConfig.agent_name;

                await base44.functions.invoke('storeAgentMemory', {
                    agent_name: memoryAgentName,
                    conversation_id: conversationId,
                    user_message: userMessage,
                    agent_response: agentResult.output,
                    intent_analysis: intentAnalysis,
                    knowledge_context: knowledgeContext,
                    outcome_quality: finalResponse.confidence > 80 ? 'high' : 'moderate',
                    extract_learnings: true // Instruct memory system to extract key learnings
                });
            }
        }
    } catch (error) {
        console.error('Memory storage error:', error);
    }
}

// Helper functions
function selectAgentsForTask(subTask, intentAnalysis) {
    const taskKeywords = subTask.task.toLowerCase();
    const agents = [];
    
    if (taskKeywords.includes('market')) agents.push({ agent_name: 'm1_market_context', role: 'specialist' });
    if (taskKeywords.includes('competitive')) agents.push({ agent_name: 'm2_competitive_intel', role: 'specialist' });
    if (taskKeywords.includes('financial')) agents.push({ agent_name: 'm4_financial_model', role: 'specialist' });
    if (taskKeywords.includes('technology')) agents.push({ agent_name: 'm3_tech_innovation', role: 'specialist' });
    
    if (agents.length === 0) {
        agents.push({ agent_name: 'caio_agent', role: 'generalist' });
    }
    
    return agents;
}

function selectPrimaryAgent(intent) {
    const mapping = {
        market_analysis: 'm1_market_context',
        competitive_intel: 'm2_competitive_intel',
        financial_modeling: 'm4_financial_model',
        tech_assessment: 'm3_tech_innovation',
        strategic_planning: 'm5_strategic_synthesis',
        fundraising: 'm9_funding_intelligence',
        behavioral_analysis: 'caio_master',
        risk_assessment: 'metamodel_abr',
        ma_evaluation: 'm5_strategic_synthesis', // or m4_financial_model
        general_query: 'caio_agent'
    };
    
    return mapping[intent] || 'caio_agent';
}

function analyzeEngagementPatterns(engagements) {
    if (!engagements || engagements.length === 0) return [];
    
    const patterns = [];
    const types = engagements.map(e => e.interaction_type);
    const uniqueTypes = [...new Set(types)];
    
    uniqueTypes.forEach(type => {
        const count = types.filter(t => t === type).length;
        if (count >= 3) patterns.push(`frequent_${type}`);
    });
    
    return patterns;
}

function inferDecisionStyle(profile, engagements) {
    if (profile.archetype_confidence > 80) {
        const archetype = profile.primary_archetype_id;
        if (archetype?.includes('analytical')) return 'data_driven';
        if (archetype?.includes('visionary')) return 'intuitive';
        if (archetype?.includes('pragmatic')) return 'balanced';
    }
    return 'adaptive';
}

function calculateKnowledgeImpact(context) {
    let score = 0;
    
    score += Math.min(context.entities?.length || 0, 30) * 2;
    score += Math.min(context.relationships?.length || 0, 20) * 1.5;
    score += (context.relevant_strategies?.length || 0) * 5;
    
    return Math.min(Math.round(score), 100);
}

function detectAlternativePath(content) {
    const alternativePattern = /ALTERNATIVE_PATH:\s*(\w+)\s*-\s*(.+)/i;
    const match = content.match(alternativePattern);
    
    if (match) {
        return {
            detected: true,
            agent: match[1],
            reason: match[2],
            confidence: 75
        };
    }
    
    return { detected: false, agent: null, confidence: 0 };
}

function extractStructuredInsights(content) {
    try {
        const jsonPattern = /```json\s*(\{[\s\S]*?\})\s*```/;
        const match = content.match(jsonPattern);
        
        if (match) {
            return JSON.parse(match[1]);
        }
    } catch (error) {
        // Not structured data
    }
    
    return null;
}
