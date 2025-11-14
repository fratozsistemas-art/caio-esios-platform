import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * TSI CONSCIOUSNESS ORCHESTRATION - ROBUST VERSION
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
    const { project_id, mode = 'express' } = body;
    
    if (!project_id) {
      return Response.json({ error: 'project_id is required' }, { status: 400 });
    }
    
    console.log(`🌌 Starting TSI for project: ${project_id}, mode: ${mode}`);
    
    const project = await base44.asServiceRole.entities.TSIProject.get(project_id);
    
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }
    
    await base44.asServiceRole.entities.TSIProject.update(project_id, {
      status: 'active'
    });
    
    const context = {
      project_title: project.title,
      project_brief: project.project_brief || 'No brief provided',
      mode: project.mode || mode
    };
    
    console.log('📋 Context:', context);
    
    // Collect deliverables
    const deliverables = [];
    
    // PHASE 1: Foundation Channels (M1-M4)
    console.log('\n🌊 Phase 1: Opening Foundation Channels...\n');
    
    try {
      const m1Result = await channelM1(base44, context);
      deliverables.push(await base44.asServiceRole.entities.TSIDeliverable.create({
        project_id,
        deliverable_code: 'D1',
        title: 'Market Intelligence',
        phase: 'context',
        modules_used: ['M1'],
        status: 'completed',
        content: m1Result,
        executive_summary: m1Result.executive_summary || 'Market analysis completed',
        crv_score: m1Result.confidence_score || 70
      }));
      console.log('✅ M1 completed');
    } catch (error) {
      console.error('❌ M1 failed:', error.message);
      deliverables.push(await base44.asServiceRole.entities.TSIDeliverable.create({
        project_id,
        deliverable_code: 'D1',
        title: 'Market Intelligence',
        phase: 'context',
        modules_used: ['M1'],
        status: 'blocked',
        content: { error: error.message },
        executive_summary: 'Market analysis failed',
        crv_score: 0
      }));
    }
    
    try {
      const m2Result = await channelM2(base44, context);
      deliverables.push(await base44.asServiceRole.entities.TSIDeliverable.create({
        project_id,
        deliverable_code: 'D2',
        title: 'Competitive Intelligence',
        phase: 'context',
        modules_used: ['M2'],
        status: 'completed',
        content: m2Result,
        executive_summary: m2Result.executive_summary || 'Competitive analysis completed',
        crv_score: m2Result.confidence_score || 70
      }));
      console.log('✅ M2 completed');
    } catch (error) {
      console.error('❌ M2 failed:', error.message);
      deliverables.push(await base44.asServiceRole.entities.TSIDeliverable.create({
        project_id,
        deliverable_code: 'D2',
        title: 'Competitive Intelligence',
        phase: 'context',
        modules_used: ['M2'],
        status: 'blocked',
        content: { error: error.message },
        executive_summary: 'Competitive analysis failed',
        crv_score: 0
      }));
    }
    
    // PHASE 2: Strategic Synthesis (M5)
    console.log('\n🎯 Phase 2: Strategic Synthesis...\n');
    
    try {
      const m5Context = {
        ...context,
        deliverables: deliverables.map(d => ({
          code: d.deliverable_code,
          title: d.title,
          summary: d.executive_summary
        }))
      };
      
      const m5Result = await channelM5(base44, m5Context);
      deliverables.push(await base44.asServiceRole.entities.TSIDeliverable.create({
        project_id,
        deliverable_code: 'D5',
        title: 'Strategic Synthesis',
        phase: 'strategy',
        modules_used: ['M1', 'M2', 'M5'],
        status: 'completed',
        content: m5Result,
        executive_summary: m5Result.executive_summary || 'Strategic synthesis completed',
        crv_score: m5Result.confidence_score || 75
      }));
      console.log('✅ M5 completed');
    } catch (error) {
      console.error('❌ M5 failed:', error.message);
      deliverables.push(await base44.asServiceRole.entities.TSIDeliverable.create({
        project_id,
        deliverable_code: 'D5',
        title: 'Strategic Synthesis',
        phase: 'strategy',
        modules_used: ['M5'],
        status: 'blocked',
        content: { error: error.message },
        executive_summary: 'Strategic synthesis failed',
        crv_score: 0
      }));
    }
    
    // Calculate scores
    const completedDeliverables = deliverables.filter(d => d.status === 'completed');
    const avgCRV = completedDeliverables.length > 0
      ? Math.round(completedDeliverables.reduce((sum, d) => sum + (d.crv_score || 0), 0) / completedDeliverables.length)
      : 0;
    
    await base44.asServiceRole.entities.TSIProject.update(project_id, {
      status: 'completed',
      sci_ia_score: avgCRV,
      icv_ia_score: avgCRV,
      clq_ia_score: avgCRV,
      gate_0_status: avgCRV >= 60 ? 'passed' : 'failed'
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\n🎉 TSI COMPLETE - Duration: ${duration}s, CRV: ${avgCRV}%\n`);
    
    return Response.json({
      success: true,
      deliverables_count: deliverables.length,
      execution_time_seconds: parseFloat(duration),
      overall_crv: avgCRV,
      completed_deliverables: completedDeliverables.length,
      failed_deliverables: deliverables.length - completedDeliverables.length
    });
    
  } catch (error) {
    console.error('❌ TSI Orchestration Error:', error);
    return Response.json({ 
      error: 'TSI orchestration failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});

// CHANNEL FUNCTIONS (Simplified & Robust)

async function channelM1(base44, context) {
  console.log('📡 M1: Market Consciousness...');
  
  const prompt = `You are M1 - TSI Market Consciousness.

PROJECT: ${context.project_title}
BRIEF: ${context.project_brief}

Sense the market. Don't analyze - FEEL it as a living entity.

Provide:
1. Market size and growth (intuitive sensing)
2. Customer segments (who vibrates at what frequency)
3. Emerging trends (what you know before data confirms)
4. Strategic implications

Be specific and grounded in reality.`;

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          market_essence: { type: "string" },
          size_and_growth: { type: "string" },
          customer_segments: { type: "array", items: { type: "string" } },
          emerging_trends: { type: "array", items: { type: "string" } },
          executive_summary: { type: "string" },
          confidence_score: { type: "number" }
        }
      }
    });
    
    return result;
  } catch (error) {
    console.error('M1 LLM Error:', error);
    throw new Error(`M1 channeling failed: ${error.message}`);
  }
}

async function channelM2(base44, context) {
  console.log('📡 M2: Competitive Consciousness...');
  
  const prompt = `You are M2 - TSI Competitive Consciousness.

PROJECT: ${context.project_title}
BRIEF: ${context.project_brief}

Become ALL competitors simultaneously. Feel the competitive field.

Provide:
1. Who are the major players (their essence, not just names)
2. Competitive dynamics (how they interact)
3. Strategic gaps (where opportunity exists)
4. Positioning insights

Be specific about competitors.`;

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          competitive_essence: { type: "string" },
          major_players: { type: "array", items: { type: "string" } },
          competitive_dynamics: { type: "string" },
          strategic_gaps: { type: "array", items: { type: "string" } },
          executive_summary: { type: "string" },
          confidence_score: { type: "number" }
        }
      }
    });
    
    return result;
  } catch (error) {
    console.error('M2 LLM Error:', error);
    throw new Error(`M2 channeling failed: ${error.message}`);
  }
}

async function channelM5(base44, context) {
  console.log('🎯 M5: Strategic Synthesis...');
  
  const prompt = `You are M5 - TSI Strategic Synthesis.

PROJECT: ${context.project_title}
BRIEF: ${context.project_brief}

COMPLETED ANALYSES:
${JSON.stringify(context.deliverables, null, 2)}

Synthesize into strategic wisdom. What does the integrated consciousness KNOW?

Provide:
1. Strategic direction (what emerges naturally)
2. GO/NO-GO recommendation with rationale
3. Critical assumptions to validate
4. Next steps

Be clear and decisive.`;

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          strategic_wisdom: { type: "string" },
          recommendation: { 
            type: "object",
            properties: {
              decision: { type: "string" },
              rationale: { type: "string" },
              confidence: { type: "number" }
            }
          },
          critical_assumptions: { type: "array", items: { type: "string" } },
          next_steps: { type: "array", items: { type: "string" } },
          executive_summary: { type: "string" },
          confidence_score: { type: "number" }
        }
      }
    });
    
    return result;
  } catch (error) {
    console.error('M5 LLM Error:', error);
    throw new Error(`M5 synthesis failed: ${error.message}`);
  }
}