import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, metric = 'quote' } = await req.json();
    const ALPHA_VANTAGE_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');

    if (!ALPHA_VANTAGE_KEY) {
      return Response.json({ error: 'ALPHA_VANTAGE_API_KEY not configured' }, { status: 500 });
    }

    let url;
    if (metric === 'quote') {
      url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
    } else if (metric === 'overview') {
      url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
    } else if (metric === 'daily') {
      url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message']) {
      return Response.json({ error: 'Invalid stock symbol' }, { status: 400 });
    }

    return Response.json({ data, symbol });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});