import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { limit = 50, fetch_executives = true } = await req.json();

        // Fetch company registry from CVM
        const companiesUrl = 'https://dados.cvm.gov.br/dados/CIA_ABERTA/CAD/DADOS/cad_cia_aberta.csv';
        
        console.log('Fetching CVM company registry...');
        const companiesResponse = await fetch(companiesUrl);
        const companiesText = await companiesResponse.text();
        
        // Parse CSV
        const lines = companiesText.split('\n');
        const headers = lines[0].split(';');
        
        const companies = [];
        for (let i = 1; i < Math.min(lines.length, limit + 1); i++) {
            const values = lines[i].split(';');
            if (values.length < headers.length) continue;
            
            const company = {};
            headers.forEach((header, idx) => {
                company[header.trim()] = values[idx]?.trim();
            });
            
            // Filter active companies only
            if (company.SIT === 'ATIVO') {
                companies.push({
                    cnpj: company.CNPJ_CIA,
                    cvm_code: company.CD_CVM,
                    name: company.DENOM_SOCIAL,
                    trading_name: company.DENOM_COMERC || company.DENOM_SOCIAL,
                    sector: company.SETOR_ATIV || 'UNKNOWN',
                    status: company.SIT,
                    registration_date: company.DT_REG
                });
            }
        }

        console.log(`Found ${companies.length} active companies`);

        let executives = [];
        if (fetch_executives) {
            // Fetch executives data for current year
            const currentYear = new Date().getFullYear();
            const executivesUrl = `https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/FRE/DADOS/fre_cia_aberta_administrador_${currentYear}.csv`;
            
            try {
                console.log(`Fetching executives data for ${currentYear}...`);
                const executivesResponse = await fetch(executivesUrl);
                const executivesText = await executivesResponse.text();
                
                const execLines = executivesText.split('\n');
                const execHeaders = execLines[0].split(';');
                
                const cnpjList = companies.map(c => c.cnpj);
                
                for (let i = 1; i < execLines.length; i++) {
                    const values = execLines[i].split(';');
                    if (values.length < execHeaders.length) continue;
                    
                    const executive = {};
                    execHeaders.forEach((header, idx) => {
                        executive[header.trim()] = values[idx]?.trim();
                    });
                    
                    // Only include executives for our selected companies
                    if (cnpjList.includes(executive.CNPJ_CIA)) {
                        executives.push({
                            cpf: executive.CPF_CNPJ_ADMINISTRADOR,
                            name: executive.NOME_ADMINISTRADOR,
                            company_cnpj: executive.CNPJ_CIA,
                            role: executive.CARGO || 'ADMINISTRADOR',
                            start_date: executive.DATA_INICIO,
                            end_date: executive.DATA_FIM,
                            is_current: !executive.DATA_FIM || executive.DATA_FIM === ''
                        });
                    }
                }
                
                console.log(`Found ${executives.length} executive records`);
            } catch (execError) {
                console.error('Error fetching executives:', execError);
                // Continue without executives if unavailable
            }
        }

        return Response.json({
            success: true,
            data: {
                companies: companies,
                executives: executives,
                fetched_at: new Date().toISOString(),
                source: 'CVM - Comissão de Valores Mobiliários'
            }
        });

    } catch (error) {
        console.error('CVM data fetch error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});