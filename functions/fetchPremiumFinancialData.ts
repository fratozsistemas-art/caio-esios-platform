import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, dataType = 'overview' } = await req.json();

    if (!symbol) {
      return Response.json({ error: 'Symbol is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    let endpoint = '';
    let params = new URLSearchParams({
      apikey: apiKey,
      symbol: symbol
    });

    // Configure endpoint based on data type
    switch (dataType) {
      case 'overview':
        endpoint = 'OVERVIEW';
        params.append('function', endpoint);
        break;
      case 'income_statement':
        endpoint = 'INCOME_STATEMENT';
        params.append('function', endpoint);
        break;
      case 'balance_sheet':
        endpoint = 'BALANCE_SHEET';
        params.append('function', endpoint);
        break;
      case 'cash_flow':
        endpoint = 'CASH_FLOW';
        params.append('function', endpoint);
        break;
      case 'earnings':
        endpoint = 'EARNINGS';
        params.append('function', endpoint);
        break;
      case 'quote':
        endpoint = 'GLOBAL_QUOTE';
        params.append('function', endpoint);
        break;
      default:
        endpoint = 'OVERVIEW';
        params.append('function', endpoint);
    }

    const response = await fetch(
      `https://www.alphavantage.co/query?${params.toString()}`
    );

    const data = await response.json();

    if (data['Error Message'] || data['Note']) {
      return Response.json({ 
        error: data['Error Message'] || 'API limit reached', 
        note: data['Note'] 
      }, { status: 429 });
    }

    // Store in ExternalDataSource entity
    await base44.asServiceRole.entities.ExternalDataSource.create({
      source_name: `${symbol} - ${dataType}`,
      source_type: 'company_fundamentals',
      provider: 'alpha_vantage',
      endpoint: endpoint,
      query_params: { symbol, dataType },
      data_tier: 'premium',
      fetch_frequency: 'on_demand',
      last_fetch_at: new Date().toISOString(),
      fetched_data: data,
      data_quality_score: 85,
      metadata: {
        fetched_by: user.email,
        symbol: symbol
      }
    });

    return Response.json({ 
      success: true, 
      data: data,
      source: 'alpha_vantage',
      tier: 'premium'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});