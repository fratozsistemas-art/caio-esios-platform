import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  X,
  Mail,
  Target,
  Play,
  Network,
  Layers,
  Star,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import AccessRequestForm from "../components/landing/AccessRequestForm";
import AuthoritySpectrum from "../components/landing/AuthoritySpectrum";
import PricingSection from "../components/landing/PricingSection";
import InteractiveDemo from "../components/landing/InteractiveDemo";
import {
  tsiModules,
  advancedCapabilities,
  comparisonFeatures,
  detailedUseCases,
  testimonials
} from "../components/landing";

export default function LandingPT() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModule, setActiveModule] = useState("M5");
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // SEO Meta Tags
  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
    document.title = "CAIO·AI - Plataforma de Inteligência Estratégica Executiva | TSI v9.3";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'CAIO·AI é uma plataforma de inteligência estratégica de nível institucional construída sobre metodologia TSI v9.3 com 11 módulos cognitivos. Transforme decisões executivas com análise estratégica potencializada por IA, knowledge graphs e governança cognitiva.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'CAIO·AI é uma plataforma de inteligência estratégica de nível institucional construída sobre metodologia TSI v9.3 com 11 módulos cognitivos. Transforme decisões executivas com análise estratégica potencializada por IA, knowledge graphs e governança cognitiva.';
      document.head.appendChild(meta);
    }

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      metaKeywords.content = 'inteligência estratégica, plataforma IA, tomada de decisão executiva, metodologia TSI, módulos cognitivos, business intelligence, análise estratégica, knowledge graph, consultoria IA, IA empresarial, ferramentas C-suite, planejamento estratégico, inteligência competitiva';
      document.head.appendChild(metaKeywords);
    }

    const ogTags = {
      'og:title': 'CAIO·AI - Plataforma de Inteligência Estratégica Executiva',
      'og:description': 'Transforme decisões executivas com IA de nível institucional. Construída sobre TSI v9.3 com 11 módulos cognitivos para inteligência estratégica.',
      'og:type': 'website',
      'og:url': window.location.href,
      'og:image': 'https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png',
      'og:locale': 'pt_BR'
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

    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': 'CAIO·AI - Plataforma de Inteligência Estratégica Executiva',
      'twitter:description': 'Transforme decisões executivas com IA de nível institucional. Construída sobre TSI v9.3 com 11 módulos cognitivos.',
      'twitter:image': 'https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png'
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;

    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "CAIO·AI",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "1497",
        "highPrice": "4997",
        "priceCurrency": "BRL",
        "offerCount": "3"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "ratingCount": "127"
      },
      "description": "Plataforma de Inteligência Estratégica Executiva construída sobre metodologia TSI v9.3 com 11 módulos cognitivos para tomada de decisão de nível institucional.",
      "operatingSystem": "Web",
      "provider": {
        "@type": "Organization",
        "name": "FRATOZ",
        "url": window.location.origin
      },
      "featureList": [
        "Metodologia TSI v9.3 com 11 Módulos Cognitivos",
        "Inteligência de Knowledge Graph",
        "Análise e Planejamento Estratégico",
        "Governança Cognitiva (Hermes Trust-Broker)",
        "Insights Potencializados por IA",
        "Orquestração Multi-Agente",
        "Suporte a Decisões Executivas",
        "Inteligência Competitiva",
        "Análise de Mercado",
        "Modelagem Financeira"
      ],
      "image": "https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png",
      "inLanguage": "pt-BR"
    });
    
    const existingSchema = document.querySelector('script[type="application/ld+json"]');
    if (existingSchema) {
      existingSchema.remove();
    }
    document.head.appendChild(schemaScript);

  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'unauthorized') {
      setShowUnauthorizedAlert(true);
    }
  }, []);

  const handleLogin = (e) => {
    e?.preventDefault();
    const dashboardUrl = window.location.origin + createPageUrl("Dashboard");
    base44.auth.redirectToLogin(dashboardUrl);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-cyan-950 to-yellow-950">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410]">
      {/* Unauthorized Alert */}
      {showUnauthorizedAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Acesso Não Autorizado</h3>
                <p className="text-sm text-slate-300 mb-3">
                  Seu email não está pré-cadastrado no sistema. Solicite acesso através do formulário.
                </p>
                <div className="flex gap-2">
                  <AccessRequestForm 
                    trigger={
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        Solicitar Acesso
                      </Button>
                    }
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowUnauthorizedAlert(false)}
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0A1628]/95 backdrop-blur-xl border-b border-caio-blue/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png" 
                alt="CAIO·AI Logo - Plataforma de Inteligência Estratégica Executiva" 
                className="w-12 h-12 object-contain"
                width="48"
                height="48"
              />
              <div className="text-xl font-bold font-heading text-white" style={{ letterSpacing: '0.05em' }}>
                CAIO·AI
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#metodologia" className="text-caio-blue hover:text-caio-gold transition-colors font-body font-medium">
                Metodologia
              </a>
              <a href="#capacidades" className="text-caio-blue hover:text-caio-gold transition-colors font-body font-medium">
                Capacidades
              </a>
              <a href="#casos-uso" className="text-caio-blue hover:text-caio-gold transition-colors font-body font-medium">
                Casos de Uso
              </a>
              <a href="#precos" className="text-caio-blue hover:text-caio-gold transition-colors font-body font-medium">
                Preços
              </a>
              {isAuthenticated ? (
                <Button
                  onClick={() => navigate(createPageUrl("Dashboard"))}
                  className="bg-caio-blue hover:shadow-neon-gold text-white font-body font-semibold border border-caio-gold/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Ir para Dashboard
                </Button>
              ) : (
                <>
                  <AccessRequestForm 
                    trigger={
                      <Button
                        variant="outline"
                        className="border-caio-blue/40 text-caio-blue hover:bg-caio-blue/10 hover:border-caio-gold font-body transition-all duration-300"
                      >
                        Solicitar Acesso
                      </Button>
                    }
                  />
                  <Button
                    onClick={handleLogin}
                    className="bg-caio-blue hover:shadow-neon-gold text-white font-body font-semibold border border-caio-gold/50 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
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
            <h1 className="text-5xl md:text-7xl font-bold text-[#EAF6FF] mb-6 leading-tight tracking-tight">
              O Sistema Executivo para<br />
              Operações Estratégicas Inteligentes
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-6 font-light">
              Construído sobre TSI v9.3 — 11 Módulos Cognitivos
            </p>

            <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 bg-[#00C8FF] opacity-30 blur-[60px] rounded-full" />
              <img 
                src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png" 
                alt="Logo da Plataforma CAIO·AI - IA Cognitiva para Inteligência Estratégica e Tomada de Decisão Executiva" 
                className="w-52 h-52 object-contain relative z-10"
                width="208"
                height="208"
                style={{ filter: 'drop-shadow(0 0 60px rgba(0, 200, 255, 0.9)) drop-shadow(0 0 30px rgba(0, 200, 255, 0.7))' }}
              />
            </div>

            <p className="text-lg md:text-xl text-slate-200 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Inteligência estruturada para tomada de decisão executiva.
              <br className="hidden md:block" />
              Um parceiro estratégico projetado para <span className="text-[#00D4FF] font-semibold">pensar com você</span>, não por você.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <AccessRequestForm 
                trigger={
                  <Button
                    size="lg"
                    className="relative overflow-hidden text-white font-semibold px-10 py-7 text-lg transition-all duration-300 hover:-translate-y-1 border-0"
                    style={{
                      background: 'linear-gradient(90deg, #00C8FF 0%, #16A9FF 50%, #FFC247 100%)',
                      boxShadow: '0 0 30px rgba(0, 200, 255, 0.4), 0 0 60px rgba(255, 194, 71, 0.3)'
                    }}
                  >
                    Começar com CAIO·AI — 14 Dias Grátis
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                }
              />
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowDemo(true)}
                className="border-2 border-[#00C8FF]/50 bg-transparent text-[#00C8FF] hover:bg-[#00C8FF]/10 font-semibold px-10 py-7 text-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
                style={{
                  boxShadow: '0 0 20px rgba(0, 200, 255, 0.2)'
                }}
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Demo Interativa
              </Button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Layers, label: "Módulos TSI", value: "11", color: "#00C8FF" },
                { icon: Network, label: "Conexões Estratégicas", value: "10K+", color: "#16A9FF" },
                { icon: Zap, label: "Análise Mais Rápida", value: "95%", color: "#FFC247" }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card className="bg-[#0B0F1A]/50 border-[#00C8FF]/20 backdrop-blur-sm hover:border-[#00C8FF]/50 transition-all duration-300" style={{ boxShadow: `0 0 20px ${stat.color}15` }}>
                      <CardContent className="p-6 text-center">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                          style={{ 
                            background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                            boxShadow: `0 0 20px ${stat.color}30`
                          }}
                        >
                          <Icon className="w-7 h-7" style={{ color: stat.color }} />
                        </div>
                        <div className="text-3xl font-bold text-[#EAF6FF] mb-2">
                          {stat.value}
                        </div>
                        <div className="text-xs text-[#A7B2C4]">
                          {stat.label}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why CAIO·AI Is Different */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-[#EAF6FF] mb-6">
              Por Que CAIO·AI É Diferente
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
              Não é mais um chatbot. <span className="text-[#00D4FF] font-semibold">Infraestrutura cognitiva</span> para{" "}
              <span className="text-[#FFB800] font-semibold">organizações modernas</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                title: "Metodologia Proprietária TSI v9.3",
                description: "11 módulos integrados cobrindo contexto, finanças, tecnologia, execução, capital e governança cognitiva.",
                icon: Brain,
                color: "#00C8FF"
              },
              {
                title: "Simbiose Humano-IA",
                description: "Arquitetura que amplifica decisões estratégicas sem substituir julgamento executivo.",
                icon: Network,
                color: "#16A9FF"
              },
              {
                title: "Nível Enterprise",
                description: "Governança cognitiva, auditoria de decisões e rastreabilidade completa via Hermes Trust-Broker.",
                icon: Target,
                color: "#FFC247"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
              >
                <Card 
                  className="bg-[#0B0F1A]/50 border-[#00C8FF]/20 backdrop-blur-sm h-full hover:border-[#00C8FF]/50 transition-all duration-200"
                  style={{ 
                    boxShadow: `0 0 30px ${item.color}10`,
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <CardContent className="p-10 text-center">
                    <div 
                      className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6"
                      style={{ 
                        background: `linear-gradient(135deg, ${item.color}20, ${item.color}05)`,
                        boxShadow: `0 0 30px ${item.color}30`
                      }}
                    >
                      <item.icon className="w-10 h-10" style={{ color: item.color }} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#EAF6FF] mb-4">{item.title}</h3>
                    <p className="text-base text-slate-300 leading-relaxed font-light">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00C8FF] to-[#FFC247] opacity-30" />
        </div>
      </section>

      {/* TSI Methodology Showcase */}
      <section id="metodologia" className="py-32 bg-caio-graphite/20 backdrop-blur-sm border-y border-caio-blue/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="bg-[#00C8FF]/20 text-[#00C8FF] border-[#00C8FF]/40 mb-8 px-8 py-3 text-base font-semibold" style={{ boxShadow: '0 0 20px rgba(0, 200, 255, 0.3)' }}>
              TSI v9.3 · 11 Módulos Cognitivos
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-[#EAF6FF] mb-8">
              Inteligência Estratégica<br />de Nível Institucional
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
              Ao contrário de modelos genéricos, CAIO opera em um{" "}
              <span className="text-[#00D4FF] font-semibold">sistema TSI modular de 11 blocos</span>{" "}
              cobrindo contexto, finanças, tecnologia, execução, capital e governança cognitiva.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-16">
            {tsiModules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              const isFeatured = module.id === "M5";
              const moduleColor = parseInt(module.id.slice(1)) % 2 === 0 ? "#FFC247" : "#00C8FF";
              
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  onClick={() => setActiveModule(module.id)}
                  className={`cursor-pointer ${isFeatured ? 'md:col-span-2' : 'md:col-span-1'}`}
                >
                  <Card
                    className={`h-full transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-br from-[#00C8FF]/20 to-[#FFC247]/20 border-[#00C8FF]/60"
                        : "bg-[#0B0F1A]/50 border-[#00C8FF]/20 hover:border-[#00C8FF]/50"
                    }`}
                    style={{ 
                      boxShadow: isActive ? '0 0 40px rgba(0, 200, 255, 0.3)' : '0 0 20px rgba(0, 200, 255, 0.1)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <CardContent className={`${isFeatured ? 'p-8' : 'p-5'} flex ${isFeatured ? 'flex-row' : 'flex-col'} gap-4 h-full`}>
                      <div className={`flex flex-col items-center gap-3 ${isFeatured ? 'w-32' : 'w-full'}`}>
                        <div 
                          className={`${isFeatured ? 'w-16 h-16' : 'w-12 h-12'} rounded-xl flex items-center justify-center`}
                          style={{ 
                            background: `linear-gradient(135deg, ${moduleColor}20, ${moduleColor}10)`,
                            boxShadow: `0 0 20px ${moduleColor}30`
                          }}
                        >
                          <Icon className={`${isFeatured ? 'w-8 h-8' : 'w-6 h-6'}`} style={{ color: moduleColor }} />
                        </div>
                        <Badge className="bg-[#00C8FF]/20 text-[#00C8FF] border-[#00C8FF]/30 text-xs font-mono font-bold">
                          {module.id}
                        </Badge>
                        {isFeatured && (
                          <Badge className="bg-[#FFC247]/20 text-[#FFC247] border-[#FFC247]/30 text-[10px]">
                            CORE
                          </Badge>
                        )}
                      </div>
                      <div className={`flex-1 ${isFeatured ? 'text-left' : 'text-center'}`}>
                        <h3 className={`font-bold text-[#EAF6FF] ${isFeatured ? 'text-xl' : 'text-sm'} mb-2`}>
                          {module.name}
                        </h3>
                        <p className={`${isFeatured ? 'text-sm' : 'text-xs'} text-[#A7B2C4] leading-relaxed mb-2 font-light`}>
                          {module.description}
                        </p>
                        <p className="text-[10px]" style={{ color: moduleColor, opacity: 0.7 }}>
                          {module.tag}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: CheckCircle,
                title: "Cobertura Completa",
                description: "Os 11 módulos trabalham juntos para cobrir mercado, produto, tecnologia, capital, execução e governança cognitiva.",
                gradient: "from-caio-blue to-caio-blue-medium"
              },
              {
                icon: Zap,
                title: "Modo Especialista Modular",
                description: "Rode apenas o módulo que interessa (M1–M11) sem perder coerência com a arquitetura TSI.",
                gradient: "from-caio-gold to-caio-gold-dark"
              },
              {
                icon: Target,
                title: "Arquitetura Multi-Nível",
                description: "Saídas adaptadas para Board, C-Suite, VPs, gestores e analistas, com o mesmo núcleo analítico.",
                gradient: "from-caio-blue-medium to-caio-gold"
              }
            ].map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-caio-graphite/50 border-caio-blue/30 backdrop-blur-sm h-full hover:border-caio-gold/50 hover:shadow-neon-blue transition-all duration-300">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6 shadow-neon-blue`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-heading font-bold text-white mb-4">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-200 text-base font-body leading-relaxed">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Authority Positioning Spectrum */}
      <AuthoritySpectrum />

      {/* Advanced Capabilities */}
      <section id="capacidades" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40 mb-4">
              🚀 Capacidades Avançadas
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Além do Chat de IA Básico
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              6 capacidades únicas que diferenciam CAIO de modelos genéricos e consultorias tradicionais.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedCapabilities.map((capability, i) => {
              const Icon = capability.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 h-full group">
                    <CardContent className="p-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#FFB800] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-7 h-7 text-[#0A1628]" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {capability.title}
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4">
                        {capability.description}
                      </p>
                      <div className="pt-4 border-t border-white/10">
                        <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs">
                          {capability.metric}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 md:py-32 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40 mb-4">
              📊 Comparação de Recursos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              CAIO vs LLMs vs Modelos de Raciocínio vs Consultorias
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              A velocidade da IA combinada com metodologia TSI de 11 módulos e governança de decisão.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-3 text-slate-400 font-semibold text-left">Recurso</th>
                  <th className="p-3 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#FFB800] flex items-center justify-center mb-1">
                        <Brain className="w-5 h-5 text-[#0A1628]" />
                      </div>
                      <span className="text-white font-semibold text-xs">CAIO</span>
                    </div>
                  </th>
                  <th className="p-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-400 font-semibold text-xs">LLMs</span>
                      <span className="text-slate-500 text-[10px]">(GPT-4, Claude)</span>
                    </div>
                  </th>
                  <th className="p-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-400 font-semibold text-xs">Raciocínio</span>
                      <span className="text-slate-500 text-[10px]">(o1, o3)</span>
                    </div>
                  </th>
                  <th className="p-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-400 font-semibold text-xs">Individuais</span>
                      <span className="text-slate-500 text-[10px]">Consultores</span>
                    </div>
                  </th>
                  <th className="p-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-400 font-semibold text-xs">Boutique</span>
                      <span className="text-slate-500 text-[10px]">Consultorias</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3 text-slate-300 font-medium text-xs">
                      {row.feature}
                    </td>
                    <td className="p-3 text-center">
                      {typeof row.caio === "boolean" ? (
                        row.caio ? (
                          <CheckCircle className="w-5 h-5 text-emerald-300 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-white font-semibold text-xs">
                          {row.caio}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {typeof row.llms === "boolean" ? (
                        row.llms ? (
                          <CheckCircle className="w-5 h-5 text-emerald-300 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400 text-xs">
                          {row.llms}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {typeof row.reasoning === "boolean" ? (
                        row.reasoning ? (
                          <CheckCircle className="w-5 h-5 text-emerald-300 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400 text-xs">{row.reasoning}</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {typeof row.individual === "boolean" ? (
                        row.individual ? (
                          <CheckCircle className="w-5 h-5 text-emerald-300 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400 text-xs">
                          {row.individual}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {typeof row.boutique === "boolean" ? (
                        row.boutique ? (
                          <CheckCircle className="w-5 h-5 text-emerald-300 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400 text-xs">
                          {row.boutique}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-200 mb-6">
              <span className="text-[#00D4FF] font-semibold">Metodologia nível consultoria</span>{" "}+
              <span className="text-[#00D4FF] font-semibold"> velocidade de IA</span>{" "}+
              <span className="text-[#FFB800] font-semibold"> modelo SaaS</span>
            </p>
            <AccessRequestForm 
              trigger={
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628] font-semibold"
                >
                  Começar Teste Gratuito
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Detailed Use Cases */}
      <section id="casos-uso" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40 mb-4">
              💼 Resultados Reais
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Como Líderes Usam CAIO
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Casos reais com ROI mensurável e compressão brutal de tempo de análise.
            </p>
          </div>

          <div className="space-y-8">
            {detailedUseCases.map((useCase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-5 gap-8">
                      <div className="md:col-span-2">
                        <Badge className="bg-cyan-500/20 text-cyan-300 mb-3">
                          {useCase.role}
                        </Badge>
                        <h3 className="text-2xl font-bold text-white mb-4">
                          {useCase.title}
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Desafio
                            </p>
                            <p className="text-slate-300 text-sm">
                              {useCase.challenge}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Solução CAIO
                            </p>
                            <p className="text-slate-300 text-sm">
                              {useCase.solution}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                          Resultados
                        </p>
                        <div className="grid gap-3 mb-6">
                          {useCase.results.map((result, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                            >
                              <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-200 text-sm">
                                {result}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#00A8CC]/20 border border-[#00D4FF]/40">
                            <p className="text-xs text-[#00E5FF] mb-1">
                              Economia
                            </p>
                            <p className="text-xl font-bold text-white">
                              {useCase.savings}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-[#FFB800]/20 to-[#FF9500]/20 border border-[#FFB800]/40">
                            <p className="text-xs text-[#FFE5A8] mb-1">
                              Tempo Economizado
                            </p>
                            <p className="text-xl font-bold text-white">
                              {useCase.timeframe}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 md:py-32 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40 mb-4">
              ⭐ Confiado por Líderes
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              O Que Executivos Dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm h-full hover:bg-white/15 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>

                    <p className="text-slate-200 mb-6 italic leading-relaxed">
                      "{testimonial.quote}"
                    </p>

                    <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#FFB800] flex items-center justify-center text-[#0A1628] font-bold shadow-lg">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          {testimonial.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {testimonial.company}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {testimonial.metric}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-[#00D4FF]/10 via-[#00A8CC]/10 to-transparent">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para Transformar Decisões Estratégicas?
            </h2>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Junte-se a organizações que usam CAIO·AI para tomar decisões mais rápidas, profundas e alinhadas à lógica de capital.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <AccessRequestForm 
                trigger={
                  <Button
                    size="lg"
                    className="relative overflow-hidden text-white font-semibold px-10 py-7 text-lg transition-all duration-300 hover:-translate-y-1 border-0"
                    style={{
                      background: 'linear-gradient(90deg, #00C8FF 0%, #16A9FF 50%, #FFC247 100%)',
                      boxShadow: '0 0 30px rgba(0, 200, 255, 0.4), 0 0 60px rgba(255, 194, 71, 0.3)'
                    }}
                  >
                    Solicitar Acesso
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                }
              />
              <AccessRequestForm 
                trigger={
                  <Button
                    size="lg"
                    className="relative overflow-hidden text-white font-semibold px-10 py-7 text-lg transition-all duration-300 hover:-translate-y-1 border-0"
                    style={{
                      background: 'linear-gradient(90deg, #FFC247 0%, #16A9FF 50%, #00C8FF 100%)',
                      boxShadow: '0 0 30px rgba(255, 194, 71, 0.4), 0 0 60px rgba(0, 200, 255, 0.3)'
                    }}
                  >
                    Agendar Chamada
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                }
              />
            </div>
            <p className="text-sm text-slate-200 mt-6 font-medium">
              Acesso restrito · Entre em contato para solicitar demonstração
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Demo Modal */}
      <InteractiveDemo open={showDemo} onClose={() => setShowDemo(false)} />

      {/* Footer */}
      <footer className="border-t border-caio-blue/20 py-16 bg-[#0A1628] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png" 
                  alt="CAIO·AI" 
                  className="w-10 h-10 object-contain opacity-80"
                />
                <div className="text-xl font-heading font-bold text-white" style={{ letterSpacing: '0.05em' }}>CAIO·AI</div>
              </div>
              <p className="text-sm font-body text-[#00D4FF] mb-4 font-semibold">
                Inteligência que vira tração.
              </p>
              <p className="text-xs font-body text-slate-400">
                powered by FRATOZ
              </p>
            </div>
            <div>
              <h4 className="text-white font-body font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm font-body">
                <li><a href="#metodologia" className="text-slate-200 hover:text-[#FFB800] transition-colors">Metodologia TSI</a></li>
                <li><a href="#capacidades" className="text-slate-200 hover:text-[#FFB800] transition-colors">Capacidades</a></li>
                <li><a href="#casos-uso" className="text-slate-200 hover:text-[#FFB800] transition-colors">Casos de Uso</a></li>
                <li><a href="#precos" className="text-slate-200 hover:text-[#FFB800] transition-colors">Preços</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-body font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm font-body">
                <li><a href={createPageUrl('Sobre')} className="text-slate-200 hover:text-[#FFB800] transition-colors">Sobre</a></li>
                <li><a href="#" className="text-slate-200 hover:text-[#FFB800] transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-200 hover:text-[#FFB800] transition-colors">Carreiras</a></li>
                <li><a href={createPageUrl('Contato')} className="text-slate-200 hover:text-[#FFB800] transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-body font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm font-body">
                <li><a href="#" className="text-slate-200 hover:text-[#FFB800] transition-colors">Privacidade</a></li>
                <li><a href="#" className="text-slate-200 hover:text-[#FFB800] transition-colors">Termos</a></li>
                <li><a href="#" className="text-slate-200 hover:text-[#FFB800] transition-colors">Segurança</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-caio-blue/10 pt-8">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-caio-blue to-caio-gold mb-8" />
            <p className="text-center text-sm font-body text-slate-400">
              © 2025 CAIO·AI Platform. Todos os direitos reservados. | Powered by TSI v9.3 Strategic Intelligence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}