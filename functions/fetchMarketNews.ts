import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, category, pageSize = 20 } = await req.json();
    const NEWS_API_KEY = Deno.env.get('NEWS_API_KEY');

    if (!NEWS_API_KEY) {
      return Response.json({ error: 'NEWS_API_KEY not configured' }, { status: 500 });
    }

    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.append('q', query || 'business strategy');
    url.searchParams.append('sortBy', 'publishedAt');
    url.searchParams.append('pageSize', pageSize);
    url.searchParams.append('language', 'en');
    if (category) url.searchParams.append('category', category);

    const response = await fetch(url.toString(), {
      headers: {
        'X-Api-Key': NEWS_API_KEY
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: `News API error: ${error}` }, { status: response.status });
    }

    const data = await response.json();

    return Response.json({
      articles: data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        imageUrl: article.urlToImage
      })),
      totalResults: data.totalResults
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});