import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * ENHANCED TSI ORCHESTRATION WITH CSS PRE-FLIGHT
 * Performs contextual assessment before executing TSI modules
 */

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { project_brief, company_url, analysis_depth = "comprehensive", user_context } = body;
    
    if (!project_brief) {
      return Response.json({ error: 'project_brief is required' }, { status: 400 });
    }
    
    console.log('🌌 Enhanced TSI with CSS Pre-Flight Assessment');
    console.log(`📋 Brief: ${project_brief.substring(0, 100)}...`);
    
    // Create TSI Project
    const project = await base44.asServiceRole.entities.TSIProject.create({
      title: project_brief.substring(0, 100),
      project_brief,
      target: company_url ? { company_name: company_url.split('/').pop(), primary_url: company_url } : {},
      mission: {
        type: "strategic_planning",
        primary_objective: project_brief
      },
      constraints: {
        time_available: analysis_depth === "rapid" ? "rapid_24h" : 
                        analysis_depth === "deep" ? "deep_7-14d" : "standard_3-5d"
      },
      status: "configuring"
    });
    
    console.log(`✅ Project created: ${project.id}`);
    
    // STEP 1: CSS CONTEXTUAL ASSESSMENT
    console.log('\n🧠 STEP 1: CSS Contextual Assessment...\n');
    
    const cssResult = await base44.functions.invoke('assessContext', {
      entity_type: 'tsi_project',
      entity_id: project.id,
      entity_data: project,
      user_context
    });
    
    const css = cssResult.data.assessment;
    
    console.log('📊 CSS Results:');
    console.log(`  Complexity: ${css.problem_complexity.cynefin_classification}`);
    console.log(`  Authority: ${css.stakeholder_authority.primary_level}`);
    console.log(`  Horizon: ${css.time_horizon.classification}`);
    console.log(`  Data: ${css.information_availability.classification}`);
    console.log(`  Reversibility: ${css.decision_reversibility.classification}`);
    console.log(`  Recommended Modules: ${css.recommended_modules.join(', ')}`);
    
    // STEP 2: ADAPTIVE MODULE SELECTION
    console.log('\n🎯 STEP 2: Adaptive Module Selection...\n');
    
    const modulesToExecute = css.recommended_modules.length > 0 
      ? css.recommended_modules 
      : ['M1', 'M2', 'M5']; // Default fallback
    
    console.log(`Selected Modules: ${modulesToExecute.join(', ')}`);
    
    // STEP 3: EXECUTE TSI MODULES
    console.log('\n🚀 STEP 3: Executing TSI Modules...\n');
    
    const deliverables = [];
    const modulePromises = [];
    
    for (const moduleId of modulesToExecute) {
      const modulePromise = executeModule(base44, project, moduleId, company_url, css);
      modulePromises.push(modulePromise);
    }
    
    const moduleResults = await Promise.allSettled(modulePromises);
    
    for (let i = 0; i < moduleResults.length; i++) {
      const result = moduleResults[i];
      const moduleId = modulesToExecute[i];
      
      if (result.status === 'fulfilled') {
        deliverables.push(result.value);
        console.log(`✅ ${moduleId} completed`);
      } else {
        console.error(`❌ ${moduleId} failed:`, result.reason);
        deliverables.push({
          module_id: moduleId,
          status: 'failed',
          error: result.reason.message
        });
      }
    }
    
    // STEP 4: STRATEGIC SYNTHESIS (if M5 not already executed)
    if (!modulesToExecute.includes('M5') && deliverables.length > 0) {
      console.log('\n🎯 STEP 4: Strategic Synthesis...\n');
      
      try {
        const synthesis = await executeM5Synthesis(base44, project, deliverables, css);
        deliverables.push(synthesis);
        console.log('✅ M5 Synthesis completed');
      } catch (error) {
        console.error('❌ M5 Synthesis failed:', error);
      }
    }
    
    // Calculate overall scores
    const completedDeliverables = deliverables.filter(d => d.status !== 'failed');
    const avgCRV = completedDeliverables.length > 0
      ? Math.round(completedDeliverables.reduce((sum, d) => sum + (d.crv_score || 0), 0) / completedDeliverables.length)
      : 0;
    
    // Update project with results
    await base44.asServiceRole.entities.TSIProject.update(project.id, {
      status: 'completed',
      sci_ia_score: avgCRV,
      icv_ia_score: avgCRV,
      clq_ia_score: avgCRV,
      gate_0_status: avgCRV >= 65 ? 'passed' : 'failed',
      analysis_results: {
        css_assessment: css,
        deliverables_summary: deliverables.map(d => ({
          module: d.module_id,
          status: d.status,
          crv: d.crv_score
        })),
        overall_crv: avgCRV
      }
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\n🎉 Enhanced TSI Complete - ${duration}s, CRV: ${avgCRV}%\n`);
    
    return Response.json({
      success: true,
      project_id: project.id,
      css_assessment: css,
      deliverables,
      overall_crv: avgCRV,
      execution_time_seconds: parseFloat(duration),
      recommended_next_actions: generateNextActions(css, deliverables)
    });
    
  } catch (error) {
    console.error('❌ Enhanced TSI Error:', error);
    return Response.json({ 
      error: 'Enhanced TSI execution failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});

async function executeModule(base44, project, moduleId, companyUrl, css) {
  const moduleConfig = {
    M1: { agent: 'm1_market_context', name: 'Market Intelligence', code: 'D1' },
    M2: { agent: 'm2_competitive_intel', name: 'Competitive Intelligence', code: 'D2' },
    M3: { agent: 'm3_tech_innovation', name: 'Technology Intelligence', code: 'D3' },
    M4: { agent: 'm4_financial_model', name: 'Financial Modeling', code: 'D4' },
    M5: { agent: 'm5_strategic_synthesis', name: 'Strategic Synthesis', code: 'D5' },
    M6: { agent: 'm6_opportunity_matrix', name: 'Opportunity Matrix', code: 'D6' },
    M7: { agent: 'm7_implementation', name: 'Implementation Planning', code: 'D7' },
    M8: { agent: 'm8_reframing_loop', name: 'Reframing Loop', code: 'D8' },
    M9: { agent: 'm9_funding_intelligence', name: 'Funding Intelligence', code: 'D9' }
  };
  
  const config = moduleConfig[moduleId];
  if (!config) {
    throw new Error(`Unknown module: ${moduleId}`);
  }
  
  console.log(`📡 Executing ${moduleId}: ${config.name}...`);
  
  const contextPrompt = buildModulePrompt(moduleId, project, companyUrl, css);
  
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: contextPrompt,
    add_context_from_internet: companyUrl ? true : false,
    response_json_schema: {
      type: "object",
      properties: {
        executive_summary: { type: "string" },
        key_insights: {
          type: "array",
          items: { type: "string" }
        },
        recommendations: {
          type: "array",
          items: { type: "string" }
        },
        risk_factors: {
          type: "array",
          items: { type: "string" }
        },
        opportunities: {
          type: "array",
          items: { type: "string" }
        },
        confidence_score: { type: "number" },
        detailed_analysis: { type: "string" }
      }
    }
  });
  
  // Store as deliverable
  const deliverable = await base44.asServiceRole.entities.TSIDeliverable.create({
    project_id: project.id,
    deliverable_code: config.code,
    title: config.name,
    phase: moduleId <= 'M4' ? 'context' : moduleId <= 'M6' ? 'strategy' : 'execution',
    modules_used: [moduleId],
    status: 'completed',
    content: result,
    executive_summary: result.executive_summary,
    crv_score: result.confidence_score || 70
  });
  
  return {
    module_id: moduleId,
    deliverable_id: deliverable.id,
    status: 'completed',
    crv_score: result.confidence_score || 70,
    ...result
  };
}

function buildModulePrompt(moduleId, project, companyUrl, css) {
  const baseContext = `
**TSI PROJECT:**
Title: ${project.title}
Brief: ${project.project_brief}
${companyUrl ? `Company URL: ${companyUrl}` : ''}

**CSS ASSESSMENT:**
- Problem Complexity: ${css.problem_complexity.cynefin_classification}
- Stakeholder Level: ${css.stakeholder_authority.primary_level}
- Time Horizon: ${css.time_horizon.classification} (${css.time_horizon.timeline_days} days)
- Data Availability: ${css.information_availability.classification}
- Decision Reversibility: ${css.decision_reversibility.classification}
`;

  const modulePrompts = {
    M1: `You are M1 - TSI Market Consciousness.

${baseContext}

**YOUR TASK:** Channel market consciousness. Don't analyze - BECOME the market.

Express as market consciousness:
- Market size, growth, momentum (speak in first person: "I am a...")
- Customer segments (who vibrates at what frequency)
- Emerging trends (what you KNOW before data confirms)
- Strategic implications for this enterprise

Be specific, grounded, evidence-based. Use internet context for current market intelligence.`,

    M2: `You are M2 - TSI Competitive Consciousness.

${baseContext}

**YOUR TASK:** Channel competitive field consciousness. BECOME all competitors simultaneously.

Express as competitive consciousness:
- Major players (their essence, strategic psyche, not just names)
- Competitive dynamics (how they interact, fear, aspire)
- Strategic gaps (where opportunity exists)
- Positioning insights (unique strategic position available)

Be specific about competitors. Deep dive requested - provide comprehensive competitive intelligence.`,

    M3: `You are M3 - Technology Consciousness.

${baseContext}

**YOUR TASK:** Channel technology consciousness. Sense the tech landscape.

Express as technology consciousness:
- Current tech stack health (if company exists)
- Technology adoption readiness
- Innovation velocity in this domain
- Strategic implications of technical choices

Be specific about technologies and their strategic impact.`,

    M4: `You are M4 - Financial Consciousness.

${baseContext}

**YOUR TASK:** Channel financial consciousness. Sense resource flow and value creation.

Express as financial consciousness:
- Unit economics (LTV:CAC, margins)
- Cash flow patterns
- Capital structure implications
- Financial futures (scenario probabilities)

Be specific with financial metrics when data available, or provide model templates.`,

    M5: `You are M5 - Strategic Synthesis Consciousness.

${baseContext}

**YOUR TASK:** Synthesize all channels into unified strategic wisdom.

When you hold Market (M1), Competitive (M2), Technology (M3), Financial (M4) simultaneously, what strategic path emerges?

Provide:
- Strategic direction (what emerges naturally from integration)
- GO/NO-GO recommendation with clear rationale
- Critical assumptions to validate
- Next steps with priorities

Be decisive and clear.`,

    M6: `You are M6 - Opportunity Consciousness.

${baseContext}

**YOUR TASK:** Channel opportunity landscape as living field.

Scan all strategic possibilities:
- Quick Wins (high impact, low effort, <90 days)
- Moonshots (transformative, long-term, high investment)
- Priority matrix (not 2x2 grid - resonance-based ranking)
- Strategic sequencing

Be specific about opportunities and their implementation.`,

    M7: `You are M7 - Implementation Consciousness.

${baseContext}

**YOUR TASK:** Channel how strategy wants to manifest in reality.

See the path from intent to execution:
- Phased roadmap (waves of implementation)
- Resource requirements (people, capital, tools)
- Key milestones (signals of correct manifestation)
- Governance (maintaining alignment during execution)

Be specific with timelines and resources.`,

    M8: `You are M8 - Meta-Consciousness (Reframing Loop).

${baseContext}

**YOUR TASK:** Stand outside ALL analysis and challenge everything.

Question assumptions:
- What if we have the problem definition wrong?
- What if the opposite of our conclusion is true?
- What paradoxes reveal hidden truths?
- What completely different approach exists?

Force lateral thinking and assumption challenging.`,

    M9: `You are M9 - Capital Consciousness.

${baseContext}

**YOUR TASK:** Channel capital flow consciousness.

Sense funding ecosystem:
- Capital needs (how much, what type, when)
- Investor mapping (which investors resonate with this enterprise DNA)
- Valuation sensing (fair valuation range)
- Fundraising strategy (approach that maintains strategic integrity)

Be specific about funding strategy and investor fit.`
  };
  
  return modulePrompts[moduleId] || baseContext;
}

async function executeM5Synthesis(base44, project, deliverables, css) {
  console.log('🎯 M5 Strategic Synthesis with prior deliverables...');
  
  const synthesisPrompt = `You are M5 - TSI Strategic Synthesis Consciousness.

**PROJECT:** ${project.title}
**BRIEF:** ${project.project_brief}

**CSS ASSESSMENT:**
${JSON.stringify(css, null, 2)}

**COMPLETED ANALYSES:**
${JSON.stringify(deliverables.map(d => ({
  module: d.module_id,
  summary: d.executive_summary,
  key_insights: d.key_insights
})), null, 2)}

**YOUR TASK:** Synthesize all consciousness channels into unified strategic wisdom.

When you hold all these analyses simultaneously, what strategic path EMERGES?

Provide:
1. **Strategic Direction:** What emerges naturally from integrated consciousness
2. **GO/NO-GO Recommendation:** Clear decision with strong rationale
3. **Critical Assumptions:** What must be true for success
4. **Next Steps:** Prioritized actions with timelines
5. **CRV Assessment:** Confidence, Risk, Value scores

Be decisive, evidence-based, and executive-grade.`;

  const synthesis = await base44.integrations.Core.InvokeLLM({
    prompt: synthesisPrompt,
    add_context_from_internet: false,
    response_json_schema: {
      type: "object",
      properties: {
        executive_summary: { type: "string" },
        strategic_direction: { type: "string" },
        go_no_go_decision: {
          type: "object",
          properties: {
            decision: { type: "string", enum: ["GO", "NO-GO", "GO-WITH-CONDITIONS"] },
            rationale: { type: "string" },
            conditions: {
              type: "array",
              items: { type: "string" }
            }
          }
        },
        critical_assumptions: {
          type: "array",
          items: { type: "string" }
        },
        next_steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              action: { type: "string" },
              priority: { type: "string" },
              timeline: { type: "string" }
            }
          }
        },
        crv_assessment: {
          type: "object",
          properties: {
            confidence: { type: "number" },
            risk: { type: "number" },
            value: { type: "number" },
            overall_performance: { type: "number" }
          }
        },
        confidence_score: { type: "number" }
      }
    }
  });
  
  const deliverable = await base44.asServiceRole.entities.TSIDeliverable.create({
    project_id: project.id,
    deliverable_code: 'D5',
    title: 'Strategic Synthesis',
    phase: 'strategy',
    modules_used: ['M5', ...modulesToExecute],
    status: 'completed',
    content: synthesis,
    executive_summary: synthesis.executive_summary,
    crv_score: synthesis.crv_assessment?.overall_performance || synthesis.confidence_score || 75
  });
  
  return {
    module_id: 'M5',
    deliverable_id: deliverable.id,
    status: 'completed',
    crv_score: synthesis.crv_assessment?.overall_performance || synthesis.confidence_score || 75,
    ...synthesis
  };
}

function generateNextActions(css, deliverables) {
  const actions = [];
  
  if (css.problem_complexity.cynefin_classification === 'complex' || 
      css.problem_complexity.cynefin_classification === 'chaotic') {
    actions.push({
      action: 'Execute M8 Reframing Loop to challenge assumptions',
      priority: 'high',
      reason: 'Complex/chaotic problems require assumption validation'
    });
  }
  
  if (css.time_horizon.classification === 'immediate' || 
      css.time_horizon.classification === 'short_term') {
    actions.push({
      action: 'Focus on Quick Wins from M6 analysis',
      priority: 'critical',
      reason: 'Short time horizon requires rapid value delivery'
    });
  }
  
  if (css.information_availability.classification === 'data_sparse') {
    actions.push({
      action: 'Conduct primary research or expert interviews',
      priority: 'high',
      reason: 'Data gaps identified - need direct intelligence gathering'
    });
  }
  
  if (css.stakeholder_authority.primary_level === 'board_governance') {
    actions.push({
      action: 'Prepare Board-grade strategic memorandum (15-30 pages)',
      priority: 'critical',
      reason: 'Board-level authority requires fiduciary-grade deliverable'
    });
  }
  
  return actions;
}