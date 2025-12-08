import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// In-memory cache with TTL
let cachedCompanies = null;
let cacheTimestamp = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function fetchAndParseCSV() {
  const response = await fetch('https://dados.cvm.gov.br/dados/CIA_ABERTA/CAD/DADOS/cad_cia_aberta.csv');
  const csvText = await response.text();
  
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(';').map(h => h.trim());
  
  const companies = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    const company = {};
    headers.forEach((header, index) => {
      company[header] = values[index]?.trim() || '';
    });
    
    if (company.CNPJ_CIA && company.DENOM_SOCIAL) {
      companies.push({
        cnpj: company.CNPJ_CIA,
        name: company.DENOM_SOCIAL,
        tradingName: company.DENOM_COMERC || company.DENOM_SOCIAL,
        status: company.SIT,
        registrationDate: company.DT_REG,
        sector: company.SETOR_ATIV || 'Não especificado',
        category: company.CATEG_REG || 'Categoria A',
        website: company.SITE || '',
        city: company.MUN || '',
        state: company.UF || '',
        cvmCode: company.CD_CVM || ''
      });
    }
  }
  
  return companies;
}

async function getCachedCompanies() {
  const now = Date.now();
  
  if (cachedCompanies && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedCompanies;
  }
  
  // Cache expired or doesn't exist, fetch fresh data
  cachedCompanies = await fetchAndParseCSV();
  cacheTimestamp = now;
  
  return cachedCompanies;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, cnpj } = await req.json();

    if (action === 'list') {
      const companies = await getCachedCompanies();
      
      return Response.json({ 
        success: true, 
        companies: companies.slice(0, 100),
        total: companies.length,
        cached: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null
      });
    }

    if (action === 'details' && cnpj) {
      const companies = await getCachedCompanies();
      const companyDetails = companies.find(c => c.cnpj === cnpj);

      if (!companyDetails) {
        return Response.json({ error: 'Company not found' }, { status: 404 });
      }

      return Response.json({ success: true, company: companyDetails });
    }

    if (action === 'ingest') {
      // Ingest all CVM data into CVMCompany entity
      const companies = await getCachedCompanies();
      
      let created = 0;
      let updated = 0;
      
      for (const company of companies) {
        try {
          // Check if company already exists
          const existing = await base44.asServiceRole.entities.CVMCompany.filter({ cnpj: company.cnpj });
          
          const companyData = {
            cnpj: company.cnpj,
            legal_name: company.name,
            trading_name: company.tradingName,
            status: company.status,
            registration_date: company.registrationDate,
            sector: company.sector,
            category: company.category,
            website: company.website,
            city: company.city,
            state: company.state,
            cvm_code: company.cvmCode,
            last_sync: new Date().toISOString()
          };
          
          if (existing && existing.length > 0) {
            await base44.asServiceRole.entities.CVMCompany.update(existing[0].id, companyData);
            updated++;
          } else {
            await base44.asServiceRole.entities.CVMCompany.create(companyData);
            created++;
          }
        } catch (error) {
          console.error(`Error ingesting company ${company.cnpj}:`, error);
        }
      }
      
      return Response.json({ 
        success: true, 
        message: `Ingested ${created} new companies, updated ${updated} existing companies`,
        created,
        updated
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});