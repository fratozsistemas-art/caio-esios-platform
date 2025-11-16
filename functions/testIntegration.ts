import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { integration_id } = await req.json();

        if (!integration_id) {
            return Response.json({ error: 'integration_id is required' }, { status: 400 });
        }

        // Executar teste específico
        let result;
        switch (integration_id) {
            case 'neo4j':
                result = await testNeo4jDetailed();
                break;
            case 'finnhub':
                result = await testFinnhubDetailed();
                break;
            case 'news_api':
                result = await testNewsAPIDetailed();
                break;
            case 'alpha_vantage':
                result = await testAlphaVantageDetailed();
                break;
            case 'anthropic':
                result = await testAnthropicDetailed();
                break;
            default:
                return Response.json({ error: 'Unknown integration' }, { status: 400 });
        }

        return Response.json({
            success: true,
            integration_id,
            test_result: result,
            tested_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Test integration error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function testNeo4jDetailed() {
    const uri = Deno.env.get('NEO4J_URI');
    const user = Deno.env.get('NEO4J_USER');
    const password = Deno.env.get('NEO4J_PASSWORD');

    const response = await fetch(`${uri}/db/neo4j/tx/commit`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${user}:${password}`),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            statements: [
                { statement: 'MATCH (n) RETURN count(n) as node_count' }
            ]
        })
    });

    const data = await response.json();
    return {
        status: 'success',
        node_count: data.results?.[0]?.data?.[0]?.row?.[0] || 0
    };
}

async function testFinnhubDetailed() {
    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey}`);
    const data = await response.json();
    
    return {
        status: 'success',
        sample_data: {
            symbol: 'AAPL',
            current_price: data.c,
            change: data.d
        }
    };
}

async function testNewsAPIDetailed() {
    const apiKey = Deno.env.get('NEWS_API_KEY');
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${apiKey}`);
    const data = await response.json();
    
    return {
        status: 'success',
        total_results: data.totalResults,
        sample_article: data.articles?.[0]?.title || null
    };
}

async function testAlphaVantageDetailed() {
    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${apiKey}`);
    const data = await response.json();
    
    return {
        status: 'success',
        sample_data: data['Global Quote']
    };
}

async function testAnthropicDetailed() {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 50,
            messages: [{ role: 'user', content: 'Say hello' }]
        })
    });

    const data = await response.json();
    
    return {
        status: 'success',
        model: data.model,
        response_preview: data.content?.[0]?.text?.substring(0, 50)
    };
}