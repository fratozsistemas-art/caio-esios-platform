import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, interval = 'daily' } = await req.json();
    const ALPHA_VANTAGE_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');

    if (!ALPHA_VANTAGE_KEY) {
      return Response.json({ error: 'ALPHA_VANTAGE_API_KEY not configured' }, { status: 500 });
    }

    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message']) {
      return Response.json({ error: 'Invalid stock symbol' }, { status: 400 });
    }

    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      return Response.json({ error: 'No time series data available' }, { status: 404 });
    }

    // Transform to chart format
    const chartData = Object.entries(timeSeries)
      .slice(0, 30)
      .reverse()
      .map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      }));

    return Response.json({
      symbol,
      chartData,
      latestPrice: chartData[chartData.length - 1].close,
      priceChange: chartData[chartData.length - 1].close - chartData[0].close
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});