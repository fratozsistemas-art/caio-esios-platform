// Generates sitemap.xml for SEO optimization
Deno.serve(async (req) => {
  const appUrl = new URL(req.url).origin;
  
  // Define all public pages with their priority and change frequency
  const pages = [
    { path: '/Landing', priority: '1.0', changefreq: 'weekly', lastmod: '2025-12-13' },
    { path: '/Landing#methodology', priority: '0.9', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/Landing#capabilities', priority: '0.9', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/Landing#use-cases', priority: '0.9', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/Landing#pricing', priority: '0.9', changefreq: 'weekly', lastmod: '2025-12-13' },
    { path: '/Landing#investors', priority: '0.8', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/BlogResources', priority: '0.8', changefreq: 'weekly', lastmod: '2025-12-13' },
    { path: '/Videos', priority: '0.7', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/MissionVision', priority: '0.7', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/FounderProfile', priority: '0.7', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/UseCaseMaDueDiligence', priority: '0.8', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/UseCaseMarketEntry', priority: '0.8', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/UseCaseDigitalTransformation', priority: '0.8', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/UseCaseStrategicPlanning', priority: '0.8', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/UseCaseCompetitiveIntelligence', priority: '0.8', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/ComparisonCaioVsChatGPT', priority: '0.7', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/ComparisonAIvsConsulting', priority: '0.7', changefreq: 'monthly', lastmod: '2025-12-13' },
    { path: '/ComparisonStrategicAIPlatforms', priority: '0.7', changefreq: 'monthly', lastmod: '2025-12-13' },
  ];
  
  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages.map(page => `  <url>
    <loc>${appUrl}${page.path}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});