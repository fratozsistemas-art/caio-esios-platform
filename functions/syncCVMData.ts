import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('Starting CVM data sync...');

    const response = await fetch('https://dados.cvm.gov.br/dados/CIA_ABERTA/CAD/DADOS/cad_cia_aberta.csv');
    const csvText = await response.text();
    
    const lines = csvText.split('\n').slice(1);
    let synced = 0;
    let errors = 0;

    for (const line of lines.slice(0, 100)) {
      if (!line.trim()) continue;
      
      try {
        const parts = line.split(';');
        const cnpj = parts[0]?.replace(/[^\d]/g, '');
        const razaoSocial = parts[1];
        
        if (!cnpj || !razaoSocial) continue;

        const existing = await base44.asServiceRole.entities.Company.filter({ cnpj });

        if (existing.length > 0) {
          await base44.asServiceRole.entities.Company.update(existing[0].id, {
            name: razaoSocial,
            last_cvm_sync: new Date().toISOString()
          });
        } else {
          await base44.asServiceRole.entities.Company.create({
            name: razaoSocial,
            cnpj,
            source: 'CVM',
            last_cvm_sync: new Date().toISOString()
          });
        }
        
        synced++;
      } catch (error) {
        errors++;
      }
    }

    return Response.json({ 
      success: true, 
      synced, 
      errors,
      message: `Synced ${synced} companies, ${errors} errors` 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});