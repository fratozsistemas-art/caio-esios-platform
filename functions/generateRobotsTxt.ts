// Generates robots.txt for SEO crawlers
Deno.serve(async (req) => {
  const appUrl = new URL(req.url).origin;
  
  const robotsTxt = `# CAIO·AI Robots.txt
User-agent: *
Allow: /Landing
Allow: /BlogResources
Allow: /Videos
Allow: /MissionVision
Allow: /FounderProfile
Allow: /UseCaseMaDueDiligence
Allow: /UseCaseMarketEntry
Allow: /UseCaseDigitalTransformation
Allow: /UseCaseStrategicPlanning
Allow: /UseCaseCompetitiveIntelligence
Allow: /ComparisonCaioVsChatGPT
Allow: /ComparisonAIvsConsulting
Allow: /ComparisonStrategicAIPlatforms

# Block authenticated areas
Disallow: /Dashboard
Disallow: /Chat
Disallow: /Strategies
Disallow: /Workspaces
Disallow: /UserSettings
Disallow: /UserManagement

# Block API endpoints
Disallow: /api/

# Sitemap location
Sitemap: ${appUrl}/api/functions/generateSitemap

# Crawl-delay for politeness
Crawl-delay: 1

# Allow all major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
});