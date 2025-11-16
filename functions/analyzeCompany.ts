import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company_id } = await req.json();
    
    const company = await base44.entities.Company.filter({ id: company_id });
    if (!company || company.length === 0) {
      return Response.json({ error: 'Company not found' }, { status: 404 });
    }

    const companyData = company[0];

    // Fetch KPIs
    const kpis = await base44.entities.CompanyKPI.filter({ company_id });

    // Fetch relationships
    const relationships = await base44.entities.CompanyRelationship.filter({ 
      source_company_id: company_id 
    });

    // AI Analysis using InvokeLLM
    const prompt = `Analyze this company comprehensively:

Company: ${companyData.legal_name}
Industry: ${companyData.industry}
Employees: ${companyData.employees_count}
Revenue: ${companyData.revenue_millions ? `R$ ${companyData.revenue_millions}M` : 'N/A'}
Status: ${companyData.status}

KPIs (${kpis.length} metrics available):
${kpis.slice(0, 5).map(kpi => `- ${kpi.kpi_name}: ${kpi.value}${kpi.unit || ''}`).join('\n')}

Relationships: ${relationships.length} companies connected

Provide a comprehensive SWOT analysis and strategic recommendations.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          swot: {
            type: "object",
            properties: {
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              opportunities: { type: "array", items: { type: "string" } },
              threats: { type: "array", items: { type: "string" } }
            }
          },
          competitive_positioning: { type: "string" },
          key_insights: { type: "array", items: { type: "string" } },
          strategic_recommendations: { type: "array", items: { type: "string" } },
          overall_score: { type: "number" }
        }
      }
    });

    return Response.json({ 
      success: true, 
      company: companyData,
      analysis: analysis,
      kpis_count: kpis.length,
      relationships_count: relationships.length
    });

  } catch (error) {
    console.error('Error analyzing company:', error);
    return Response.json({ 
      error: error.message || 'Failed to analyze company' 
    }, { status: 500 });
  }
});