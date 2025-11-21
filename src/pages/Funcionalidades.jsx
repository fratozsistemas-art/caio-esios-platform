import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Network,
  Zap,
  Target,
  TrendingUp,
  Shield,
  GitMerge,
  Database,
  FileText,
  MessageSquare,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle,
  Layers,
  Code,
  DollarSign,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import AccessRequestForm from "../components/landing/AccessRequestForm";
import AccessibilityEnhancer from "../components/AccessibilityEnhancer";

export default function Funcionalidades() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
    document.title = "Funcionalidades CAIO·AI - 11 Módulos TSI + Knowledge Graph + Multi-Agent";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = 'Explore as funcionalidades da CAIO·AI: 11 módulos TSI, Knowledge Graph com Neo4j, orquestração multi-agente, análise estratégica, governança Hermes e inteligência de mercado. Tudo em uma plataforma enterprise.';

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = 'funcionalidades CAIO AI, módulos TSI, knowledge graph, multi-agent orchestration, análise estratégica, intelligence platform, Hermes governance, chat IA empresarial';

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + createPageUrl('Funcionalidades');

    // Favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png';

    const ogTags = {
      'og:title': 'Funcionalidades CAIO·AI - Plataforma Completa de Inteligência Estratégica',
      'og:description': '11 módulos TSI, Knowledge Graph, Multi-Agent Orchestration, Chat IA e mais. Tudo em uma plataforma enterprise-grade.',
      'og:url': window.location.origin + createPageUrl('Funcionalidades'),
      'og:type': 'website'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });
  }, []);

  const categories = [
    { id: "all", label: "Todas", icon: Layers },
    { id: "tsi", label: "Módulos TSI", icon: Brain },
    { id: "intelligence", label: "Intelligence", icon: Network },
    { id: "automation", label: "Automação", icon: Zap },
    { id: "governance", label: "Governança", icon: Shield }
  ];

  const features = [
    {
      category: "tsi",
      icon: Brain,
      title: "11 Módulos TSI v9.3",
      description: "Framework metodológico proprietário cobrindo contexto de mercado (M1), inteligência competitiva (M2), inovação tecnológica (M3), modelagem financeira (M4), síntese estratégica (M5), matriz de oportunidades (M6), implementação (M7), reframing (M8), funding (M9) e governança (M10-M11).",
      benefits: [
        "Análise 360° de cenários estratégicos",
        "Metodologia validada em projetos reais",
        "Profundidade de consultoria MBB",
        "Velocidade 95% superior"
      ],
      color: "#00D4FF"
    },
    {
      category: "intelligence",
      icon: Network,
      title: "Knowledge Graph Enterprise",
      description: "Sistema de grafo de conhecimento baseado em Neo4j com algoritmos de inferência, enriquecimento automático e visualização interativa. Conecta empresas, pessoas, tecnologias, métricas e frameworks estratégicos.",
      benefits: [
        "10K+ nós e relacionamentos estratégicos",
        "Inferência automática de conexões",
        "Queries complexas em tempo real",
        "Visualização 3D interativa"
      ],
      color: "#16A9FF"
    },
    {
      category: "intelligence",
      icon: MessageSquare,
      title: "Chat com CAIO (Multi-Modelo)",
      description: "Interface conversacional com acesso a GPT-4, Claude 3.5 Sonnet, o1 e modelos especializados. Contexto persistente, histórico completo e capacidade de invocar módulos TSI sob demanda.",
      benefits: [
        "Multi-modelo (GPT-4, Claude, o1)",
        "Contexto de até 200K tokens",
        "Invocação direta de módulos TSI",
        "Histórico e favoritos"
      ],
      color: "#00C8FF"
    },
    {
      category: "automation",
      icon: GitMerge,
      title: "Multi-Agent Orchestration",
      description: "Sistema de orquestração hierárquica onde agentes especializados colaboram em tarefas complexas. Workflows personalizáveis, sub-teams dinâmicos e trace completo de comunicação inter-agentes.",
      benefits: [
        "Workflows hierárquicos complexos",
        "Sub-teams especializados",
        "Trace de comunicação completo",
        "Debugging e versionamento"
      ],
      color: "#FFC247"
    },
    {
      category: "tsi",
      icon: Zap,
      title: "Quick Actions (80+ Templates)",
      description: "Biblioteca de análises pré-configuradas cobrindo casos de uso de CEOs, CFOs, CTOs e CROs. Cada action invoca os módulos TSI corretos automaticamente, com prompts otimizados e outputs estruturados.",
      benefits: [
        "80+ templates prontos para uso",
        "Segmentação por role executivo",
        "Análises em 2-5 minutos",
        "Outputs estruturados (JSON/CSV)"
      ],
      color: "#FFB800"
    },
    {
      category: "intelligence",
      icon: Database,
      title: "Company Intelligence Hub",
      description: "Central de inteligência sobre empresas com dados de CVM, Crunchbase, LinkedIn, Yahoo Finance e mais. Enriquecimento automático, valuation, tech stack discovery e monitoramento contínuo.",
      benefits: [
        "Dados de múltiplas fontes integradas",
        "Enriquecimento automático via IA",
        "Tech stack discovery (ESIOS)",
        "Alertas de mudanças estratégicas"
      ],
      color: "#00D4FF"
    },
    {
      category: "intelligence",
      icon: FileText,
      title: "File Analyzer & Document Intelligence",
      description: "Upload e análise de Excel, PDF, PPT, CSV e imagens. Extração de dados estruturados, insights automáticos e sugestões de ações estratégicas baseadas no conteúdo.",
      benefits: [
        "OCR e extração de tabelas",
        "Análise financeira automática",
        "Insights contextualizados",
        "Integração com Knowledge Graph"
      ],
      color: "#16A9FF"
    },
    {
      category: "automation",
      icon: Target,
      title: "Workspaces & Project Management",
      description: "Ambientes colaborativos com templates (M&A, market entry, digital transformation). Fases estruturadas, data room, deliverables rastreáveis e sugestões contextuais de Quick Actions.",
      benefits: [
        "8+ templates de projetos",
        "Fases e milestones automáticos",
        "Data room organizado",
        "Colaboração em tempo real"
      ],
      color: "#FFC247"
    },
    {
      category: "governance",
      icon: Shield,
      title: "Hermes Trust-Broker (Governança Cognitiva)",
      description: "Sistema de governança que audita decisões de IA, detecta paradoxos, garante consistência e gera relatórios de conformidade. Board Management Bridge para transparência executiva total.",
      benefits: [
        "Auditoria de todas decisões de IA",
        "Detecção de paradoxos e inconsistências",
        "Score de integridade cognitiva",
        "Relatórios para boards"
      ],
      color: "#FF6B6B"
    },
    {
      category: "intelligence",
      icon: Users,
      title: "Behavioral Intelligence (PCCU Framework)",
      description: "Análise comportamental de clientes, prospects e stakeholders usando framework proprietário PCCU. Predição de necessidades, matching de arquétipos e sugestões de abordagem.",
      benefits: [
        "4 arquétipos comportamentais (PCCU)",
        "Predição de necessidades futuras",
        "Matching automático de perfis",
        "Insights de engajamento"
      ],
      color: "#9D4EDD"
    },
    {
      category: "automation",
      icon: BarChart3,
      title: "Analytics & Performance Monitoring",
      description: "Dashboards customizáveis com métricas de uso, ROI de insights, performance de agentes e health checks de integrações. Real-time e exportação para BI tools.",
      benefits: [
        "Dashboards customizáveis",
        "Métricas de ROI e adoção",
        "Health checks automáticos",
        "Exportação para BI tools"
      ],
      color: "#00D4FF"
    },
    {
      category: "intelligence",
      icon: Code,
      title: "Tech Stack Intelligence (ESIOS)",
      description: "Descoberta automática de stack tecnológico de empresas via análise de job posts, vendor partnerships, API docs e code repositories. Competitive tech benchmarking.",
      benefits: [
        "Discovery automático de tech stack",
        "Análise de maturidade tecnológica",
        "Benchmarking competitivo",
        "Recomendações de modernização"
      ],
      color: "#16A9FF"
    },
    {
      category: "intelligence",
      icon: Globe,
      title: "Market & Competitive Intelligence",
      description: "Monitoramento contínuo de competidores, tendências de mercado, regulação e oportunidades. Alertas automáticos via social media, news e financial data.",
      benefits: [
        "Monitoramento 24/7 de mercado",
        "Alertas de movimentos competitivos",
        "Análise de sentimento automática",
        "Relatórios semanais de inteligência"
      ],
      color: "#00C8FF"
    },
    {
      category: "tsi",
      icon: DollarSign,
      title: "Financial Modeling & Valuation",
      description: "Módulo M4 do TSI especializado em modelagem financeira, valuation (DCF, comparables, precedents), análise de ROI e projeções de funding. Integração com dados de mercado.",
      benefits: [
        "DCF automático com sensibilidade",
        "Comparables dinâmicos",
        "Projeções de funding",
        "Risk-adjusted returns"
      ],
      color: "#FFB800"
    },
    {
      category: "automation",
      icon: Layers,
      title: "Agent Training & Fine-Tuning",
      description: "Sistema de treinamento de agentes especializados com datasets customizados. Avaliação de performance, deployment versionado e A/B testing de prompts.",
      benefits: [
        "Fine-tuning com dados proprietários",
        "Avaliação automatizada de performance",
        "Deployment versionado",
        "A/B testing de configurações"
      ],
      color: "#FFC247"
    },
    {
      category: "governance",
      icon: CheckCircle,
      title: "Access Control & Multi-Tenancy",
      description: "Sistema RBAC granular com roles customizáveis, permissões por entidade, compartilhamento seguro e auditoria completa de acessos.",
      benefits: [
        "RBAC granular",
        "Compartilhamento seguro",
        "Audit trail completo",
        "Multi-tenancy isolado"
      ],
      color: "#00D4FF"
    }
  ];

  const filteredFeatures = activeCategory === "all" 
    ? features 
    : features.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410]">
      <AccessibilityEnhancer />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0A1628]/95 backdrop-blur-xl border-b border-[#00D4FF]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(createPageUrl('Landing'))}
            >
              <img 
                src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png" 
                alt="CAIO·AI Logo" 
                className="w-12 h-12 object-contain"
                width="48"
                height="48"
              />
              <div className="text-xl font-bold text-white">CAIO·AI</div>
            </div>
            <div className="flex items-center gap-6">
              <a href={createPageUrl('Sobre')} className="text-slate-300 hover:text-[#00D4FF] transition-colors">Sobre</a>
              <a href={createPageUrl('Funcionalidades')} className="text-[#00D4FF] font-semibold">Funcionalidades</a>
              <a href={createPageUrl('Precos')} className="text-slate-300 hover:text-[#00D4FF] transition-colors">Preços</a>
              <a href={createPageUrl('Contato')} className="text-slate-300 hover:text-[#00D4FF] transition-colors">Contato</a>
              <AccessRequestForm 
                trigger={
                  <Button className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628] font-semibold">
                    Solicitar Acesso
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00C8FF]/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40 mb-6 px-6 py-2">
              Plataforma Completa
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-[#EAF6FF] mb-6">
              16 Funcionalidades Enterprise
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              De módulos TSI a orquestração multi-agente, knowledge graphs e governança cognitiva. Tudo em uma plataforma integrada.
            </p>
          </motion.div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  className={activeCategory === cat.id 
                    ? "bg-[#00D4FF] text-white hover:bg-[#00E5FF]" 
                    : "bg-transparent border-[#00D4FF]/30 text-slate-300 hover:bg-[#00D4FF]/10 hover:text-[#00D4FF]"
                  }
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {filteredFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Card className="bg-[#0B0F1A]/50 border-[#00D4FF]/20 backdrop-blur-sm h-full hover:border-[#00D4FF]/50 transition-all duration-300">
                    <CardContent className="p-8">
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                        style={{ 
                          background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}05)`,
                          boxShadow: `0 0 30px ${feature.color}20`
                        }}
                      >
                        <Icon className="w-8 h-8" style={{ color: feature.color }} />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                      <p className="text-slate-400 leading-relaxed mb-6">{feature.description}</p>
                      
                      <div className="space-y-3">
                        {feature.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-[#00D4FF] flex-shrink-0 mt-0.5" />
                            <span className="text-slate-300 text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration Ecosystem */}
      <section className="py-20 bg-[#0B0F1A]/30 border-y border-[#00D4FF]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ecossistema de Integrações
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Conectado aos principais data sources e plataformas enterprise
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Neo4j", desc: "Graph Database" },
              { name: "OpenAI", desc: "GPT-4, o1" },
              { name: "Anthropic", desc: "Claude 3.5" },
              { name: "Stripe", desc: "Payments" },
              { name: "LinkedIn", desc: "Professional Data" },
              { name: "CVM", desc: "Brazilian Securities" },
              { name: "Yahoo Finance", desc: "Market Data" },
              { name: "News APIs", desc: "Intelligence" }
            ].map((integration, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="bg-[#0B0F1A]/50 border-[#00D4FF]/20 backdrop-blur-sm text-center hover:border-[#00D4FF]/50 transition-all">
                  <CardContent className="p-6">
                    <div className="text-lg font-bold text-white mb-1">{integration.name}</div>
                    <div className="text-sm text-slate-400">{integration.desc}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#00D4FF]/10 via-[#00A8CC]/10 to-transparent">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Experimente a Plataforma Completa
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              14 dias de acesso gratuito a todas as funcionalidades enterprise
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <AccessRequestForm 
                trigger={
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628] font-semibold px-10 py-6 text-lg"
                  >
                    Começar Agora - Grátis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                }
              />
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate(createPageUrl('Precos'))}
                className="border-2 border-[#00D4FF]/50 bg-transparent text-[#00D4FF] hover:bg-[#00D4FF]/10 px-10 py-6 text-lg"
              >
                Ver Preços
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#00D4FF]/20 py-12 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png" 
              alt="CAIO·AI" 
              className="w-10 h-10 object-contain opacity-80"
            />
            <div className="text-xl font-bold text-white">CAIO·AI</div>
          </div>
          <p className="text-sm text-[#00D4FF] mb-4 font-semibold">
            Inteligência que vira tração.
          </p>
          <p className="text-xs text-slate-400">
            © 2025 CAIO·AI Platform. Powered by FRATOZ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}