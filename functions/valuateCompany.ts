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

    // Fetch financial KPIs
    const kpis = await base44.entities.CompanyKPI.filter({ 
      company_id,
      category: 'financial'
    });

    // Get comparables from same industry
    const comparables = await base44.entities.Company.filter({ 
      industry: companyData.industry 
    });

    const prompt = `Perform a detailed AI-powered valuation for this company:

Company: ${companyData.legal_name}
Industry: ${companyData.industry}
Revenue: ${companyData.revenue_millions ? `R$ ${companyData.revenue_millions}M` : 'N/A'}
Employees: ${companyData.employees_count}
Founded: ${companyData.founded_year}

Financial KPIs:
${kpis.map(kpi => `- ${kpi.kpi_name}: ${kpi.value}${kpi.unit || ''}`).join('\n')}

Industry Comparables: ${comparables.length} companies

Provide a valuation range using multiple methods (DCF, comparables, multiples), identify key value drivers, risks, and assumptions. Be conservative but realistic.`;

    const valuation = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          valuation_range: {
            type: "object",
            properties: {
              min: { type: "number" },
              base: { type: "number" },
              max: { type: "number" }
            }
          },
          method: { type: "string" },
          key_assumptions: { type: "array", items: { type: "string" } },
          value_drivers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                driver: { type: "string" },
                impact: { type: "string" },
                weight: { type: "number" }
              }
            }
          },
          risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk: { type: "string" },
                severity: { type: "string" },
                mitigation: { type: "string" }
              }
            }
          },
          benchmarks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                company: { type: "string" },
                multiple: { type: "number" },
                metric: { type: "string" }
              }
            }
          },
          confidence_score: { type: "number" },
          ai_analysis: { type: "string" }
        }
      }
    });

    // Save valuation
    const valuationRecord = await base44.entities.CompanyValuation.create({
      company_id,
      valuation_date: new Date().toISOString().split('T')[0],
      ...valuation
    });

    return Response.json({ 
      success: true, 
      valuation: valuationRecord
    });

  } catch (error) {
    console.error('Error valuating company:', error);
    return Response.json({ 
      error: error.message || 'Failed to valuate company' 
    }, { status: 500 });
  }
});