import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ExternalLink, FileText, Search, TrendingUp, Globe } from 'lucide-react';

export default function SEOOptimizationPage() {
  const seoFeatures = [
    {
      icon: FileText,
      title: 'Meta Tags Otimizadas',
      description: 'Títulos, descrições e keywords estratégicas em todas as páginas',
      status: 'Implementado',
      color: 'text-green-500'
    },
    {
      icon: Search,
      title: 'Schema Markup',
      description: 'Dados estruturados JSON-LD para Organization, SoftwareApplication e FAQPage',
      status: 'Implementado',
      color: 'text-green-500'
    },
    {
      icon: Globe,
      title: 'Sitemap.xml',
      description: 'Mapa completo do site para crawlers de busca',
      status: 'Implementado',
      color: 'text-green-500'
    },
    {
      icon: TrendingUp,
      title: 'Robots.txt',
      description: 'Diretivas para crawlers e proteção de áreas privadas',
      status: 'Implementado',
      color: 'text-green-500'
    }
  ];

  const keywords = [
    'strategic intelligence platform',
    'executive AI platform',
    'AI decision making',
    'TSI methodology',
    'cognitive modules',
    'enterprise strategic intelligence',
    'Chief AI Officer platform',
    'strategic planning software',
    'competitive intelligence automation',
    'financial modeling platform',
    'M&A due diligence AI',
    'market intelligence tools',
    'executive decision support system',
    'strategic analysis AI',
    'business intelligence AI platform'
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FRATOZ',
    url: window.location.origin,
    logo: 'https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png',
    sameAs: ['https://www.linkedin.com/company/caioai']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SEO Optimization Dashboard</h1>
          <p className="text-slate-400">Otimização completa para motores de busca e visibilidade online</p>
        </div>

        {/* SEO Features Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {seoFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#00D4FF]/10 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-white">{feature.title}</div>
                      <Badge className="bg-green-500/20 text-green-400 mt-1">{feature.status}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Keywords Cloud */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-[#00D4FF]" />
              Palavras-chave Otimizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, idx) => (
                <Badge key={idx} className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO Tools */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Ferramentas SEO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={() => window.open('/api/functions/generateSitemap', '_blank')}
                className="bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/30 justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver Sitemap.xml
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>
              
              <Button
                onClick={() => window.open('/api/functions/generateRobotsTxt', '_blank')}
                className="bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/30 justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver Robots.txt
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>

              <Button
                onClick={() => window.open('https://search.google.com/search-console', '_blank')}
                className="bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/30 justify-start"
              >
                <Globe className="w-4 h-4 mr-2" />
                Google Search Console
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>

              <Button
                onClick={() => window.open('https://www.bing.com/webmasters', '_blank')}
                className="bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/30 justify-start"
              >
                <Globe className="w-4 h-4 mr-2" />
                Bing Webmaster Tools
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Structured Data Preview */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Schema Markup (JSON-LD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-[#0A1628] p-4 rounded-lg overflow-x-auto text-xs text-green-400">
              {JSON.stringify(structuredData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}