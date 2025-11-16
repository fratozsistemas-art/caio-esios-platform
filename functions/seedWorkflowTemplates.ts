import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const templates = [
      {
        name: "Deep Company Research",
        description: "Análise profunda de empresas com múltiplas fontes",
        category: "research",
        use_case: "Due diligence, análise de investimento",
        workflow_config: {
          name: "Deep Company Research",
          workflow_type: "company_research",
          execution_mode: "sequential",
          steps: [
            { id: "step1", name: "Web Research", agent_type: "research", config: {} },
            { id: "step2", name: "Financial Analysis", agent_type: "analysis", config: {}, dependencies: ["step1"] },
            { id: "step3", name: "Tech Stack Discovery", agent_type: "extraction", config: {}, dependencies: ["step1"] },
            { id: "step4", name: "Final Synthesis", agent_type: "synthesis", config: {}, dependencies: ["step2", "step3"] }
          ]
        },
        required_inputs: [
          { name: "company_name", type: "string", required: true },
          { name: "company_url", type: "string", required: false }
        ],
        estimated_duration: "5-8 minutes",
        complexity: "complex",
        is_featured: true
      },
      {
        name: "Market Intelligence Scan",
        description: "Monitoramento de mercado e competidores",
        category: "intelligence",
        use_case: "Competitive intelligence, market trends",
        workflow_config: {
          name: "Market Intelligence",
          workflow_type: "market_analysis",
          execution_mode: "parallel",
          steps: [
            { id: "step1", name: "News Analysis", agent_type: "research", config: {} },
            { id: "step2", name: "Social Media Scan", agent_type: "research", config: {} },
            { id: "step3", name: "Trend Synthesis", agent_type: "synthesis", config: {}, dependencies: ["step1", "step2"] }
          ]
        },
        required_inputs: [
          { name: "industry", type: "string", required: true },
          { name: "competitors", type: "array", required: false }
        ],
        estimated_duration: "3-5 minutes",
        complexity: "medium",
        is_featured: true
      },
      {
        name: "Data Enrichment Pipeline",
        description: "Enriquecimento automático de dados de empresas",
        category: "enrichment",
        use_case: "CRM enrichment, database enhancement",
        workflow_config: {
          name: "Data Enrichment",
          workflow_type: "relationship_discovery",
          execution_mode: "parallel",
          steps: [
            { id: "step1", name: "Company Data Lookup", agent_type: "enrichment", config: {} },
            { id: "step2", name: "Executive Profiles", agent_type: "enrichment", config: {} },
            { id: "step3", name: "Validation", agent_type: "validation", config: {}, dependencies: ["step1", "step2"] }
          ]
        },
        required_inputs: [
          { name: "company_list", type: "array", required: true }
        ],
        estimated_duration: "2-4 minutes",
        complexity: "simple",
        is_featured: false
      }
    ];

    for (const template of templates) {
      const existing = await base44.asServiceRole.entities.WorkflowTemplate.filter({ name: template.name });
      if (existing.length === 0) {
        await base44.asServiceRole.entities.WorkflowTemplate.create(template);
      }
    }

    return Response.json({ success: true, seeded: templates.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});