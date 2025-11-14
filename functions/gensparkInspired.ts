import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Genspark-Inspired Analysis Function
 * Uses multi-LLM strategy for creative tactical insights
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { analysis_type, context, focus_area } = await req.json();
    
    // Define analysis strategies based on type
    const strategies = {
      innovation_scouting: {
        llm_strategy: 'creative_exploration',
        prompt_template: `Analyze this business context and identify NON-OBVIOUS opportunities and innovation spaces:

Context: ${context}
Focus Area: ${focus_area}

Use lateral thinking and cross-industry analogies to uncover:
1. **White Space Opportunities** - Uncontested market spaces
2. **Adjacent Markets** - Similar problems in different industries
3. **Technology Convergence** - Emerging tech combinations
4. **Customer Jobs-to-be-Done** - Unmet needs
5. **Regulatory Arbitrage** - Timing windows before regulation

For each opportunity:
- Explain the non-obvious insight
- Provide 2-3 real-world analogies from other industries
- Estimate market timing (now / 6-12mo / 12-24mo)
- Rate novelty score (0-100)

Format as structured JSON.`,
        add_context_from_internet: true
      },
      
      competitive_blind_spots: {
        llm_strategy: 'contrarian_analysis',
        prompt_template: `Identify BLIND SPOTS and vulnerabilities competitors are missing:

Context: ${context}
Focus Area: ${focus_area}

Apply contrarian thinking to find:
1. **Assumptions Everyone Makes** - Industry dogmas to challenge
2. **Underserved Segments** - Customers everyone ignores
3. **Technology Debt** - Legacy constraints competitors have
4. **Distribution Gaps** - Channels no one is exploiting
5. **Pricing Inefficiencies** - Willingness-to-pay mismatches

For each blind spot:
- Why competitors miss this
- How to exploit it
- Estimated time-to-copy (barrier height)
- Risk level (low/medium/high)

Format as structured JSON.`,
        add_context_from_internet: true
      },
      
      operational_efficiency_hacks: {
        llm_strategy: 'quick_wins',
        prompt_template: `Find tactical QUICK WINS for operational efficiency:

Context: ${context}
Focus Area: ${focus_area}

Identify actionable hacks in:
1. **Process Automation** - Low-code solutions
2. **Tool Consolidation** - Reduce SaaS sprawl
3. **Workflow Shortcuts** - Eliminate busywork
4. **Data Integration** - Break data silos
5. **Team Rituals** - Optimize meetings/async

For each hack:
- Implementation time (days)
- Expected impact (%)
- Cost (free / <$100 / <$1k / >$1k)
- Difficulty (easy / medium / hard)
- Tools/services needed

Format as structured JSON with priority ranking.`,
        add_context_from_internet: true
      },
      
      customer_pain_mining: {
        llm_strategy: 'empathy_deep_dive',
        prompt_template: `Mine UNSPOKEN customer pain points:

Context: ${context}
Focus Area: ${focus_area}

Use Jobs-to-be-Done framework to uncover:
1. **Functional Pains** - Tasks customers struggle with
2. **Emotional Pains** - Anxieties and frustrations
3. **Social Pains** - How they want to be perceived
4. **Workaround Behaviors** - Hacks customers invented
5. **Switching Costs** - What keeps them locked in

For each pain:
- Severity (0-10)
- Frequency (daily / weekly / monthly)
- Current "job" customer "hires" to solve it
- Willingness to pay for solution
- Quotes/evidence from reviews, forums, support tickets

Format as structured JSON.`,
        add_context_from_internet: true
      },
      
      tech_stack_modernization: {
        llm_strategy: 'architecture_review',
        prompt_template: `Suggest pragmatic TECH STACK modernization:

Context: ${context}
Current Stack: ${focus_area}

Prioritize upgrades across:
1. **Must-Fix Vulnerabilities** - Security/compliance risks
2. **Quick Wins** - Drop-in replacements with 10x gains
3. **Strategic Bets** - Foundational changes (6-12mo ROI)
4. **Experimental** - Emerging tech to pilot
5. **Tech Debt Paydown** - Legacy removal priorities

For each recommendation:
- Current pain point it solves
- Migration complexity (trivial / moderate / major)
- Business impact (revenue / cost / speed / quality)
- Recommended tools/services
- Phased rollout plan

Format as structured JSON with effort/impact matrix.`,
        add_context_from_internet: true
      },
      
      revenue_stream_discovery: {
        llm_strategy: 'monetization_innovation',
        prompt_template: `Discover NEW revenue stream opportunities:

Context: ${context}
Focus Area: ${focus_area}

Explore beyond core business:
1. **Data Monetization** - Aggregated insights to sell
2. **Platform Play** - Enable 3rd parties
3. **Services Layer** - Professional services / consulting
4. **Community/Network Effects** - Marketplace dynamics
5. **IP Licensing** - Technology/methodology licensing

For each stream:
- Business model pattern (name it)
- Analogy from successful company
- Estimated TAM
- Time to first dollar (months)
- Cannibalization risk (none / low / medium / high)
- Required capabilities

Format as structured JSON.`,
        add_context_from_internet: true
      }
    };
    
    const strategy = strategies[analysis_type];
    
    if (!strategy) {
      return Response.json({ error: 'Invalid analysis type' }, { status: 400 });
    }
    
    // Call InvokeLLM with creative prompt
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: strategy.prompt_template,
      add_context_from_internet: strategy.add_context_from_internet,
      response_json_schema: {
        type: "object",
        properties: {
          analysis_type: { type: "string" },
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                impact_score: { type: "number" },
                novelty_score: { type: "number" },
                implementation_complexity: { type: "string" },
                estimated_timeline: { type: "string" },
                evidence: { type: "array", items: { type: "string" } },
                analogies: { type: "array", items: { type: "string" } },
                action_steps: { type: "array", items: { type: "string" } }
              }
            }
          },
          meta: {
            type: "object",
            properties: {
              confidence_score: { type: "number" },
              sources_consulted: { type: "array", items: { type: "string" } },
              contrarian_insights: { type: "number" }
            }
          }
        }
      }
    });
    
    // Create Analysis entity
    await base44.asServiceRole.entities.Analysis.create({
      title: `${analysis_type.replace(/_/g, ' ')} - ${focus_area}`,
      type: 'opportunity',
      status: 'completed',
      framework_used: 'Genspark-Inspired Multi-LLM',
      results: result,
      confidence_score: result.meta?.confidence_score || 80
    });
    
    return Response.json({
      success: true,
      analysis: result,
      analysis_type,
      powered_by: 'CAIO Multi-LLM (Genspark-Inspired)'
    });
    
  } catch (error) {
    console.error('Genspark-inspired analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});