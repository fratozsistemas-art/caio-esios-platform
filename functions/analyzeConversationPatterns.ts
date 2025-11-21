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

    // Define analysis prompt based on type - HIGHLY DIFFERENTIATED
    const analysisPrompts = {
      trends: `TREND DETECTION ANALYSIS - Quantitative Pattern Recognition

You are a data scientist specializing in longitudinal analysis. Apply time-series thinking:

QUANTITATIVE METRICS TO EXTRACT:
1. Topic frequency analysis: Which themes appear repeatedly (count occurrences)
2. Temporal patterns: When do certain topics emerge (timestamps, sequences)
3. Momentum indicators: Are topics gaining/losing attention? (first mention vs last mention)
4. Cross-conversation connections: Same themes across different sessions?
5. Strategic drift: How has focus shifted over the timeline (week 1 vs week 2 vs now)

TREND CLASSIFICATION:
- Emerging (new in last 2-3 conversations)
- Sustained (consistent across 4+ conversations)
- Declining (mentioned before but fading)
- Cyclical (recurring at intervals)

OUTPUT FORMAT:
For each trend: Name → Frequency → Direction → Business Implication → Data Evidence
Focus on NUMBERS and TRAJECTORIES, not generic insights.`,

      anomalies: `ANOMALY DETECTION ANALYSIS - Statistical Outlier Identification

You are a fraud detection specialist looking for statistical outliers. Think Bayesian inference:

ANOMALY DETECTION FRAMEWORK:
1. Baseline establishment: What's "normal" for this user? (typical topics, question patterns, language)
2. Deviation metrics: What breaks the baseline? (new terminology, sudden urgency, uncharacteristic depth)
3. Contextual anomalies: Questions that don't fit the user's role/industry/previous interests
4. Sentiment shifts: Sudden changes in tone, confidence, or decisiveness
5. Temporal anomalies: Unusual conversation timing, frequency changes

ANOMALY TYPES TO FLAG:
- Topic outliers (never discussed before)
- Urgency spikes (sudden "need to decide by X")
- Authority mismatch (asking questions above/below typical level)
- Cognitive dissonance (contradicting previous positions)

OUTPUT FORMAT:
For each anomaly: Deviation Type → Expected vs Actual → Confidence Score → Possible Root Cause
Be SPECIFIC about what makes it anomalous with statistical reasoning.`,

      risk_assessment: `RISK ASSESSMENT ANALYSIS - Enterprise Risk Management (ERM) Framework

You are a Chief Risk Officer conducting systematic risk evaluation. Use ISO 31000 methodology:

RISK IDENTIFICATION:
1. Strategic risks: Competitive threats, market shifts, strategic misalignment
2. Financial risks: Capital allocation, ROI uncertainty, funding gaps
3. Operational risks: Execution complexity, resource constraints, timeline pressure
4. Compliance/Governance risks: Regulatory exposure, ESG concerns
5. Reputational risks: Brand damage, stakeholder trust erosion

RISK QUANTIFICATION (for each identified risk):
- Likelihood: Low/Medium/High (with rationale)
- Impact: Quantified in business terms (revenue, time, relationships)
- Velocity: How fast could this risk materialize? (days/weeks/months)
- Detection difficulty: Would we see it coming?

RISK MITIGATION HIERARCHY:
1. Avoid (don't proceed)
2. Transfer (insurance, partnerships)
3. Mitigate (controls, processes)
4. Accept (conscious decision to bear risk)

OUTPUT FORMAT:
Risk Register: [Risk ID] → [Category] → [Likelihood × Impact = Score] → [Mitigation Action] → [Owner/Timeline]
Prioritize by Risk Score (Likelihood × Impact). Include residual risk after mitigation.`,

      opportunity_scouting: `OPPORTUNITY SCOUTING ANALYSIS - Blue Ocean Strategy + Jobs-to-be-Done

You are a strategic opportunity analyst combining market sensing with innovation frameworks:

OPPORTUNITY IDENTIFICATION LAYERS:
1. White Space Detection: What's being asked about but not addressed? (unmet needs)
2. Adjacent Opportunities: What's "one step away" from current discussion? (market adjacencies)
3. Convergence Plays: Where do multiple conversation threads intersect? (synthesis opportunities)
4. Timing Windows: What opportunities have urgency/market timing? (windows closing)
5. Asymmetric Bets: Low-cost, high-upside options mentioned but not explored

OPPORTUNITY EVALUATION CRITERIA:
- Market size/TAM implications
- Competitive positioning (are others seeing this?)
- Resource requirements (can we execute?)
- Strategic fit (aligns with trajectory?)
- Time sensitivity (act now or lose it?)

OPPORTUNITY TYPES:
- Market entry (new segments)
- Product innovation (new offerings)
- Partnership/M&A (inorganic growth)
- Process improvement (efficiency gains)
- Business model innovation (revenue model shifts)

OUTPUT FORMAT:
Opportunity Brief: [Name] → [Type] → [Market Size/Impact] → [Barriers to Entry] → [Next Action/Validation Step]
Rank by Attractiveness Score (Impact × Feasibility). Focus on ACTIONABLE opportunities.`,

      executive_summary: `EXECUTIVE SUMMARY - McKinsey-Style Situation-Complication-Resolution (SCR)

You are a strategy consultant presenting to a C-suite audience. Use pyramid principle:

EXECUTIVE SUMMARY STRUCTURE:
1. SITUATION (Context):
   - What strategic question is being explored?
   - Why now? (urgency/catalyst)
   - What's at stake? (quantified impact)

2. COMPLICATION (Challenge):
   - What makes this hard? (constraints, tradeoffs, unknowns)
   - What's preventing immediate action? (gaps, risks)
   - What assumptions need validation?

3. RESOLUTION (Way Forward):
   - Top 3 strategic options (with pros/cons)
   - Recommended path + rationale
   - Key milestones/decision points
   - Success metrics

COMMUNICATION PRINCIPLES:
- Lead with the answer (not the journey)
- Quantify everything possible ($, %, time)
- Highlight decisions needed vs FYI
- Flag critical path dependencies
- Note what's NOT covered (scope boundaries)

OUTPUT FORMAT:
• ONE-LINER: [Single sentence capturing the essence]
• SITUATION: [2-3 bullets]
• COMPLICATION: [2-3 bullets]  
• RESOLUTION: [Recommended action + 3 next steps]
• CONFIDENCE LEVEL: [High/Medium/Low with reasoning]

Write for a CEO with 5 minutes. Every word must earn its place.`
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