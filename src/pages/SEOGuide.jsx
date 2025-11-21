import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Server, 
  FileText, 
  Shield,
  Zap,
  Search,
  ExternalLink
} from "lucide-react";

export default function SEOGuide() {
  const implementedItems = [
    {
      title: "Meta Tags Otimizadas",
      description: "Title, description, keywords implementados em todas as páginas públicas",
      status: "completed"
    },
    {
      title: "Schema.org Markup",
      description: "JSON-LD implementado para Organization, SoftwareApplication e páginas principais",
      status: "completed"
    },
    {
      title: "Open Graph & Twitter Cards",
      description: "Meta tags sociais completas para compartilhamento",
      status: "completed"
    },
    {
      title: "Atributo Lang (pt-BR / en-US)",
      description: "Idioma definido corretamente em todas as páginas",
      status: "completed"
    },
    {
      title: "Favicon e Apple Touch Icon",
      description: "Ícones configurados para melhor identificação",
      status: "completed"
    },
    {
      title: "Alt Text em Imagens",
      description: "Componente de acessibilidade adiciona alt text automaticamente",
      status: "completed"
    },
    {
      title: "Acessibilidade (ARIA)",
      description: "Roles, labels e skip links implementados",
      status: "completed"
    },
    {
      title: "Canonical URLs",
      description: "URLs canônicas em todas as páginas para evitar conteúdo duplicado",
      status: "completed"
    }
  ];

  const platformLimitations = [
    {
      title: "SSR / Pré-renderização",
      description: "Base44 não oferece Server-Side Rendering nativamente. Impacta severamente a indexação do Google.",
      action: "Contactar suporte Base44 para soluções alternativas ou ferramentas externas",
      critical: true
    },
    {
      title: "Headers HTTP de Segurança",
      description: "CSP, X-Frame-Options, HSTS devem ser configurados no nível do servidor/plataforma",
      action: "Configurar no painel Base44 (Settings → Security Headers)",
      critical: false
    },
    {
      title: "Sitemap XML Dinâmico",
      description: "Geração automática de sitemap.xml não disponível",
      action: "Solicitar ao suporte Base44 ou usar ferramenta externa",
      critical: false
    },
    {
      title: "Robots.txt Customizado",
      description: "Arquivo robots.txt precisa ser configurado no servidor",
      action: "Verificar com suporte Base44 se é possível customizar",
      critical: false
    }
  ];

  const performanceRecommendations = [
    {
      metric: "LCP (Largest Contentful Paint)",
      current: "2.8s",
      target: "< 2.5s",
      suggestion: "Otimizar carregamento de imagens (lazy loading, WebP, CDN)"
    },
    {
      metric: "CLS (Cumulative Layout Shift)",
      current: "0.15",
      target: "< 0.1",
      suggestion: "Definir dimensões explícitas de imagens e containers"
    },
    {
      metric: "FID (First Input Delay)",
      current: "Bom",
      target: "< 100ms",
      suggestion: "Já otimizado, manter monitoramento"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Search className="w-10 h-10 text-[#00D4FF]" />
            Guia de SEO e Otimizações
          </h1>
          <p className="text-slate-400">
            Status das implementações da auditoria técnica e próximos passos
          </p>
        </div>

        {/* Implemented Items */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            ✅ Implementado
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {implementedItems.map((item, i) => (
              <Card key={i} className="bg-white/5 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Platform Limitations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            ⚠️ Limitações da Plataforma (Requer Ação Externa)
          </h2>
          <div className="space-y-4">
            {platformLimitations.map((item, i) => (
              <Card key={i} className={`bg-white/5 ${item.critical ? 'border-red-500/40' : 'border-yellow-500/30'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-bold">{item.title}</h3>
                        {item.critical && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/40">
                            CRÍTICO
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400 mb-3">{item.description}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Server className="w-4 h-4 text-[#00D4FF]" />
                        <span className="text-[#00D4FF]">Ação: {item.action}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Performance Recommendations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#FFB800]" />
            ⚡ Recomendações de Performance
          </h2>
          <div className="space-y-4">
            {performanceRecommendations.map((rec, i) => (
              <Card key={i} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="grid md:grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Métrica</p>
                      <p className="text-white font-semibold">{rec.metric}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Atual</p>
                      <Badge className="bg-yellow-500/20 text-yellow-400">{rec.current}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Meta</p>
                      <Badge className="bg-green-500/20 text-green-400">{rec.target}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Sugestão</p>
                      <p className="text-xs text-slate-300">{rec.suggestion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <Card className="bg-gradient-to-br from-[#00D4FF]/10 to-[#FFB800]/10 border-[#00D4FF]/30">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#00D4FF]" />
              Próximos Passos Críticos
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400 font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Resolver Indexação (SSR/Pré-renderização)</p>
                  <p className="text-sm text-slate-400 mb-2">
                    O maior problema atualmente. O Google não consegue indexar adequadamente um SPA puro.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#00D4FF]/40 text-[#00D4FF] hover:bg-[#00D4FF]/10"
                    onClick={() => window.open('https://base44.app/support', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contactar Suporte Base44
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-400 font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Configurar Headers de Segurança</p>
                  <p className="text-sm text-slate-400">
                    Implementar CSP, X-Frame-Options, HSTS no painel de configurações da plataforma
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Otimizar Performance (LCP/CLS)</p>
                  <p className="text-sm text-slate-400">
                    Implementar lazy loading de imagens e definir dimensões explícitas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">4</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Criar Sitemap XML</p>
                  <p className="text-sm text-slate-400">
                    Verificar com Base44 se é possível gerar sitemap automaticamente ou usar ferramenta externa
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-3">Resumo</h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-400 mb-1">8</div>
              <p className="text-sm text-slate-400">Otimizações Implementadas</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">4</div>
              <p className="text-sm text-slate-400">Requerem Ação Externa</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-400 mb-1">1</div>
              <p className="text-sm text-slate-400">Crítico (SSR)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}