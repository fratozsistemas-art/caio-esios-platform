import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cnpj_list } = await req.json();
    
    if (!cnpj_list || !Array.isArray(cnpj_list)) {
      return Response.json({ error: 'cnpj_list array is required' }, { status: 400 });
    }

    const results = {
      total: cnpj_list.length,
      success: 0,
      failed: 0,
      duplicates: 0,
      conflicts: 0,
      details: []
    };

    // Check for duplicates in input
    const uniqueCNPJs = [...new Set(cnpj_list.map(cnpj => cnpj.replace(/\D/g, '')))];
    results.duplicates = cnpj_list.length - uniqueCNPJs.length;

    // Check existing companies
    const existingCompanies = await base44.asServiceRole.entities.Company.list();
    const existingCNPJs = new Set(existingCompanies.map(c => c.cnpj));

    for (const cnpj of uniqueCNPJs) {
      try {
        const cleanCNPJ = cnpj.replace(/\D/g, '');
        
        // Check if already exists
        const alreadyExists = existingCNPJs.has(cleanCNPJ);
        
        // Fetch from Brasil API with delay
        await new Promise(resolve => setTimeout(resolve, 2100)); // Rate limit respect
        
        const brasilApiUrl = `https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`;
        const response = await fetch(brasilApiUrl);
        
        if (!response.ok) {
          results.failed++;
          results.details.push({
            cnpj: cleanCNPJ,
            status: 'failed',
            error: response.status === 404 ? 'CNPJ não encontrado' : 'API error',
            already_existed: alreadyExists
          });
          continue;
        }

        const data = await response.json();

        // Map industry
        const industryMap = {
          '01': 'Agricultura', '05': 'Mineração', '10': 'Alimentação',
          '35': 'Energia', '41': 'Construção', '45': 'Comércio',
          '46': 'Comércio', '47': 'Varejo', '62': 'Tecnologia',
          '63': 'Tecnologia', '64': 'Serviços Financeiros',
          '65': 'Seguros', '70': 'Consultoria', '77': 'Aluguel',
          '86': 'Saúde'
        };

        const cnaePrefix = data.cnae_fiscal?.toString().substring(0, 2);
        const industry = industryMap[cnaePrefix] || 'Outros';

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
          data_sources: ['brasil_api', 'batch_ingestion']
        };

        let company;
        let wasConflict = false;

        if (alreadyExists) {
          // Check for conflicts (different data)
          const existing = existingCompanies.find(c => c.cnpj === cleanCNPJ);
          if (existing.legal_name !== companyData.legal_name) {
            wasConflict = true;
            results.conflicts++;
          }
          
          // Update existing
          company = await base44.asServiceRole.entities.Company.update(existing.id, companyData);
        } else {
          // Create new
          company = await base44.asServiceRole.entities.Company.create(companyData);
        }

        results.success++;
        results.details.push({
          cnpj: cleanCNPJ,
          status: 'success',
          company_id: company.id,
          legal_name: data.razao_social,
          industry: industry,
          already_existed: alreadyExists,
          conflict: wasConflict
        });

      } catch (error) {
        results.failed++;
        results.details.push({
          cnpj: cnpj,
          status: 'failed',
          error: error.message
        });
      }
    }

    return Response.json({ 
      success: true,
      results: results,
      summary: {
        success_rate: ((results.success / results.total) * 100).toFixed(2) + '%',
        processed: results.success + results.failed,
        skipped_duplicates: results.duplicates,
        conflicts_resolved: results.conflicts
      }
    });

  } catch (error) {
    console.error('Error in batch ingestion:', error);
    return Response.json({ 
      error: error.message || 'Failed to process batch ingestion' 
    }, { status: 500 });
  }
});