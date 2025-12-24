import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { seriesCode, startDate, endDate } = await req.json();

    if (!seriesCode) {
      return Response.json({ error: 'Series code is required' }, { status: 400 });
    }

    // Build BCB API URL
    // Format: https://api.bcb.gov.br/dados/serie/bcdata.sgs.{seriesCode}/dados?formato=json
    let url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesCode}/dados?formato=json`;
    
    if (startDate) {
      url += `&dataInicial=${startDate}`;
    }
    if (endDate) {
      url += `&dataFinal=${endDate}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      return Response.json({ 
        error: 'Failed to fetch BCB data',
        status: response.status 
      }, { status: response.status });
    }

    const data = await response.json();

    return Response.json({
      success: true,
      seriesCode,
      data,
      count: data.length
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});