import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversation_id, analysis_type } = await req.json();

    if (!conversation_id) {
      return Response.json({ error: 'conversation_id is required' }, { status: 400 });
    }

    // Get conversation
    const conversation = await base44.agents.getConversation(conversation_id);
    
    if (!conversation || !conversation.messages) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const messages = conversation.messages;
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');

    // Extract topics and entities mentioned
    const allText = messages.map(m => m.content).join('\n');

    // Get related conversations for pattern detection
    const allConversations = await base44.agents.listConversations({
      agent_name: 'caio_agent'
    });
    
    const userConversations = allConversations.filter(c => 
      c.created_by === user.email && 
      !c.metadata?.deleted &&
      c.id !== conversation_id
    );

    // Build analysis context
    const analysisContext = {
      current_conversation: {
        message_count: messages.length,
        user_messages: userMessages.length,
        ai_messages: assistantMessages.length,
        topics_discussed: conversation.metadata?.topics || [],
        frameworks_used: assistantMessages
          .map(m => m.tool_calls?.map(t => t.name))
          .flat()
          .filter(Boolean),
        conversation_length: allText.length,
        created_at: conversation.created_at
      },
      historical_context: {
        total_conversations: userConversations.length,
        recent_conversations: userConversations.slice(0, 5).map(c => ({
          id: c.id,
          name: c.metadata?.name,
          created_at: c.created_at,
          topics: c.metadata?.topics || []
        }))
      }
    };

    // Define analysis prompt based on type
    const analysisPrompts = {
      trends: `Analyze conversation patterns and identify:
1. Recurring themes or topics the user is exploring
2. Evolution in the user's strategic focus over time
3. Emerging patterns in their questions or challenges
4. Shifts in decision-making style or priorities`,

      anomalies: `Identify anomalies and unusual patterns:
1. Topics that are new or different from previous conversations
2. Unexpected shifts in focus or concern areas
3. Questions that indicate potential risks or opportunities
4. Deviations from the user's typical inquiry patterns`,

      risk_assessment: `Conduct a comprehensive risk assessment:
1. Identify potential risks mentioned in conversations
2. Assess risk severity and likelihood
3. Detect blind spots or overlooked risk factors
4. Recommend risk mitigation strategies`,

      opportunity_scouting: `Scout for strategic opportunities:
1. Identify emerging opportunities mentioned
2. Connect dots between different conversations
3. Spot market gaps or unmet needs
4. Recommend actionable next steps`,

      executive_summary: `Create an executive summary:
1. Key strategic questions being explored
2. Main decisions or insights uncovered
3. Critical action items identified
4. Strategic trajectory and next steps`
    };

    const prompt = analysisPrompts[analysis_type || 'trends'] || analysisPrompts.executive_summary;

    // Call AI for analysis
    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a strategic intelligence analyst reviewing a user's conversation patterns with an AI advisor.

Context:
${JSON.stringify(analysisContext, null, 2)}

Recent conversation excerpt:
${allText.slice(-2000)}

${prompt}

Provide actionable, specific insights referencing actual conversation data. Be strategic and forward-thinking.`,
      response_json_schema: {
        type: "object",
        properties: {
          analysis_type: { type: "string" },
          key_insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                evidence: { type: "string" },
                impact: { type: "string", enum: ["high", "medium", "low"] }
              }
            }
          },
          patterns_detected: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern_name: { type: "string" },
                frequency: { type: "string" },
                trend_direction: { type: "string", enum: ["increasing", "stable", "decreasing"] },
                significance: { type: "string" }
              }
            }
          },
          anomalies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                anomaly_type: { type: "string" },
                description: { type: "string" },
                potential_cause: { type: "string" },
                recommendation: { type: "string" }
              }
            }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                timeframe: { type: "string" }
              }
            }
          },
          executive_summary: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      analysis: {
        ...aiAnalysis,
        conversation_id,
        analysis_type: analysis_type || 'trends',
        analyzed_at: new Date().toISOString(),
        conversation_context: analysisContext
      }
    });

  } catch (error) {
    console.error('Conversation analysis error:', error);
    return Response.json({ 
      error: 'Failed to analyze conversation patterns',
      details: error.message
    }, { status: 500 });
  }
});