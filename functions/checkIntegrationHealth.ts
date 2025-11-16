import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const healthChecks = {
            neo4j: checkNeo4j(),
            finnhub: checkFinnhub(),
            news_api: checkNewsAPI(),
            alpha_vantage: checkAlphaVantage(),
            anthropic: checkAnthropic()
        };

        const results = await Promise.allSettled(Object.values(healthChecks));
        const integrationNames = Object.keys(healthChecks);

        const integrations = {};
        let healthy = 0, degraded = 0, down = 0;

        results.forEach((result, idx) => {
            const name = integrationNames[idx];
            if (result.status === 'fulfilled') {
                integrations[name] = result.value;
                if (result.value.status === 'healthy') healthy++;
                else if (result.value.status === 'degraded') degraded++;
                else down++;
            } else {
                integrations[name] = {
                    status: 'down',
                    error: result.reason?.message || 'Unknown error',
                    last_checked: new Date().toISOString()
                };
                down++;
            }
        });

        return Response.json({
            success: true,
            summary: { healthy, degraded, down, total: integrationNames.length },
            integrations,
            checked_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Health check error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkNeo4j() {
    const start = Date.now();
    try {
        const uri = Deno.env.get('NEO4J_URI');
        const user = Deno.env.get('NEO4J_USER');
        const password = Deno.env.get('NEO4J_PASSWORD');

        if (!uri || !user || !password) {
            throw new Error('Neo4j credentials not configured');
        }

        // Teste simples de conectividade
        const response = await fetch(`${uri}/db/neo4j/tx/commit`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${user}:${password}`),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                statements: [{ statement: 'RETURN 1' }]
            })
        });

        const responseTime = Date.now() - start;

        if (response.ok) {
            return {
                status: responseTime < 1000 ? 'healthy' : 'degraded',
                response_time: responseTime,
                last_checked: new Date().toISOString()
            };
        }

        throw new Error(`HTTP ${response.status}`);

    } catch (error) {
        return {
            status: 'down',
            error: error.message,
            last_checked: new Date().toISOString(),
            response_time: Date.now() - start
        };
    }
}

async function checkFinnhub() {
    const start = Date.now();
    try {
        const apiKey = Deno.env.get('FINNHUB_API_KEY');
        if (!apiKey) throw new Error('API key not configured');

        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey}`);
        const responseTime = Date.now() - start;

        if (response.ok) {
            return {
                status: responseTime < 2000 ? 'healthy' : 'degraded',
                response_time: responseTime,
                last_checked: new Date().toISOString()
            };
        }

        throw new Error(`HTTP ${response.status}`);
    } catch (error) {
        return {
            status: 'down',
            error: error.message,
            last_checked: new Date().toISOString()
        };
    }
}

async function checkNewsAPI() {
    const start = Date.now();
    try {
        const apiKey = Deno.env.get('NEWS_API_KEY');
        if (!apiKey) throw new Error('API key not configured');

        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${apiKey}`);
        const responseTime = Date.now() - start;

        if (response.ok) {
            return {
                status: responseTime < 2000 ? 'healthy' : 'degraded',
                response_time: responseTime,
                last_checked: new Date().toISOString()
            };
        }

        throw new Error(`HTTP ${response.status}`);
    } catch (error) {
        return {
            status: 'down',
            error: error.message,
            last_checked: new Date().toISOString()
        };
    }
}

async function checkAlphaVantage() {
    const start = Date.now();
    try {
        const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
        if (!apiKey) throw new Error('API key not configured');

        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${apiKey}`);
        const responseTime = Date.now() - start;

        if (response.ok) {
            return {
                status: responseTime < 2000 ? 'healthy' : 'degraded',
                response_time: responseTime,
                last_checked: new Date().toISOString()
            };
        }

        throw new Error(`HTTP ${response.status}`);
    } catch (error) {
        return {
            status: 'down',
            error: error.message,
            last_checked: new Date().toISOString()
        };
    }
}

async function checkAnthropic() {
    const start = Date.now();
    try {
        const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
        if (!apiKey) throw new Error('API key not configured');

        // Simples verificação de credenciais
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'test' }]
            })
        });

        const responseTime = Date.now() - start;

        if (response.ok) {
            return {
                status: responseTime < 3000 ? 'healthy' : 'degraded',
                response_time: responseTime,
                last_checked: new Date().toISOString()
            };
        }

        throw new Error(`HTTP ${response.status}`);
    } catch (error) {
        return {
            status: 'down',
            error: error.message,
            last_checked: new Date().toISOString()
        };
    }
}