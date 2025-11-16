import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cnpj } = await req.json();
    
    if (!cnpj) {
      return Response.json({ error: 'CNPJ is required' }, { status: 400 });
    }

    // Clean CNPJ (remove formatting)
    const cleanCNPJ = cnpj.replace(/\D/g, '');

    // Fetch from Brasil API
    const brasilApiUrl = `https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`;
    
    // Add delay to respect rate limit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await fetch(brasilApiUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        return Response.json({ error: 'CNPJ não encontrado' }, { status: 404 });
      }
      throw new Error('Brasil API error');
    }

    const data = await response.json();

    // Map CNAE to industry (simplified)
    const industryMap = {
      '01': 'Agricultura',
      '05': 'Mineração',
      '10': 'Alimentação',
      '35': 'Energia',
      '41': 'Construção',
      '45': 'Comércio',
      '46': 'Comércio',
      '47': 'Varejo',
      '62': 'Tecnologia',
      '63': 'Tecnologia',
      '64': 'Serviços Financeiros',
      '65': 'Seguros',
      '70': 'Consultoria',
      '77': 'Aluguel',
      '86': 'Saúde'
    };

    const cnaePrefix = data.cnae_fiscal?.toString().substring(0, 2);
    const industry = industryMap[cnaePrefix] || 'Outros';

    // Transform data to our Company entity format
    const companyData = {
      cnpj: cleanCNPJ,
      legal_name: data.razao_social,
      trade_name: data.nome_fantasia || data.razao_social,
      industry: industry,
      cnae_code: data.cnae_fiscal?.toString(),
      founded_year: data.data_inicio_atividade ? 
        new Date(data.data_inicio_atividade).getFullYear() : null,
      employees_count: data.porte === 'DEMAIS' ? 10 : 
                      data.porte === 'ME' ? 15 : 
                      data.porte === 'EPP' ? 50 : 100,
      address: {
        street: `${data.logradouro}, ${data.numero}`,
        city: data.municipio,
        state: data.uf,
        zip: data.cep
      },
      status: data.situacao_cadastral === 'ATIVA' ? 'active' : 'inactive',
      partners: data.qsa?.map(socio => ({
        name: socio.nome_socio,
        document: socio.cnpj_cpf_do_socio,
        qualification: socio.qualificacao_socio
      })) || [],
      data_sources: ['brasil_api']
    };

    // Check if company already exists
    const existing = await base44.entities.Company.filter({ cnpj: cleanCNPJ });
    
    let company;
    if (existing && existing.length > 0) {
      // Update existing
      company = await base44.entities.Company.update(existing[0].id, companyData);
    } else {
      // Create new
      company = await base44.entities.Company.create(companyData);
    }

    return Response.json({ 
      success: true, 
      company,
      raw_data: data 
    });

  } catch (error) {
    console.error('Error fetching company:', error);
    return Response.json({ 
      error: error.message || 'Failed to fetch company data' 
    }, { status: 500 });
  }
});