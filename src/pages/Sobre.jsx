import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Target,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Layers,
  ArrowRight,
  Award,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import AccessRequestForm from "../components/landing/AccessRequestForm";
import AccessibilityEnhancer from "../components/AccessibilityEnhancer";

export default function Sobre() {
  const navigate = useNavigate();

  useEffect(() => {
    // SEO: Set language to Portuguese
    document.documentElement.lang = 'pt-BR';

    // Meta title
    document.title = "Sobre CAIO·AI - Inteligência Estratégica Institucional | TSI v9.3";
    
    // Meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = 'Conheça a CAIO·AI: plataforma de inteligência estratégica institucional construída sobre metodologia TSI v9.3 com 11 módulos cognitivos. Transforme decisões executivas com IA enterprise-grade.';

    // Meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = 'sobre CAIO AI, quem somos, TSI metodologia, inteligência artificial empresarial, plataforma IA estratégica, FRATOZ, história CAIO, missão valores';

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + createPageUrl('Sobre');

    // Favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png';

    // Open Graph
    const ogTags = {
      'og:title': 'Sobre CAIO·AI - Inteligência Estratégica Institucional',
      'og:description': 'Plataforma enterprise de IA construída sobre metodologia TSI v9.3. Transforme decisões executivas com 11 módulos cognitivos.',
      'og:url': window.location.origin + createPageUrl('Sobre'),
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

    // Schema.org
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "CAIO·AI",
      "description": "Plataforma de Inteligência Estratégica Institucional",
      "url": window.location.origin,
      "logo": "https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png",
      "foundingDate": "2024",
      "founders": [{
        "@type": "Organization",
        "name": "FRATOZ"
      }],
      "areaServed": "BR",
      "slogan": "Inteligência que vira tração"
    });
    document.head.appendChild(schemaScript);

    return () => {
      if (schemaScript.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, []);

  const values = [
    {
      icon: Brain,
      title: "Inteligência Institucional",
      description: "IA que atua como parceiro estratégico, não apenas ferramenta. Construída para operar no nível 'Unwavering Peer' do Authority Spectrum."
    },
    {
      icon: Shield,
      title: "Governança Cognitiva",
      description: "Sistema Hermes Trust-Broker garante auditabilidade, explicabilidade e conformidade em todas as decisões de IA."
    },
    {
      icon: Layers,
      title: "Metodologia Proprietária",
      description: "TSI v9.3 com 11 módulos integrados cobrindo contexto, finanças, tecnologia, execução, capital e governança."
    },
    {
      icon: Users,
      title: "Simbiose Humano-IA",
      description: "Arquitetura que amplifica decisões estratégicas sem substituir julgamento executivo. Co-piloto, não autopilot."
    },
    {
      icon: Target,
      title: "Foco Enterprise",
      description: "Solução institucional-grade para C-suite, boards e executivos que precisam de inteligência confiável e rastreável."
    },
    {
      icon: TrendingUp,
      title: "Resultados Mensuráveis",
      description: "95% mais rápido que consultorias tradicionais, com metodologia de nível MBB e custos SaaS."
    }
  ];

  const milestones = [
    {
      year: "2024",
      title: "Fundação & TSI v1.0",
      description: "Desenvolvimento inicial do framework TSI e primeiros módulos cognitivos."
    },
    {
      year: "2025 Q1",
      title: "TSI v9.3 & Hermes",
      description: "Lançamento da metodologia completa com 11 módulos e sistema de governança cognitiva."
    },
    {
      year: "2025 Q2",
      title: "Knowledge Graph Enterprise",
      description: "Integração Neo4j e capacidades avançadas de grafo para inteligência relacional."
    },
    {
      year: "2025 Q3",
      title: "Multi-Agent Orchestration",
      description: "Sistema de orquestração hierárquica com agentes especializados e workflows complexos."
    },
    {
      year: "2025 Q4",
      title: "Escala Enterprise",
      description: "Plataforma pronta para organizações institucionais com compliance total."
    }
  ];

  const team = [
    {
      role: "Arquitetura TSI",
      description: "Framework metodológico proprietário com 11 módulos cognitivos integrados"
    },
    {
      role: "Engenharia IA",
      description: "Stack multi-modelo (GPT-4, Claude, o1) com orchestration avançada"
    },
    {
      role: "Knowledge Graph",
      description: "Neo4j enterprise com algoritmos de inferência e enriquecimento automático"
    },
    {
      role: "Governança & Compliance",
      description: "Sistema Hermes para auditabilidade e trust-broker de decisões"
    }
  ];

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
              <div className="text-xl font-bold text-white" style={{ letterSpacing: '0.05em' }}>
                CAIO·AI
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a href={createPageUrl('Sobre')} className="text-[#00D4FF] font-semibold">Sobre</a>
              <a href={createPageUrl('Funcionalidades')} className="text-slate-300 hover:text-[#00D4FF] transition-colors">Funcionalidades</a>
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

      {/* Hero Section */}
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
              Sobre a Plataforma
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-[#EAF6FF] mb-6">
              Inteligência que Vira Tração
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              CAIO·AI é uma plataforma de inteligência estratégica institucional construída sobre metodologia proprietária <span className="text-[#00D4FF] font-semibold">TSI v9.3</span> com <span className="text-[#FFB800] font-semibold">11 módulos cognitivos</span>.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
            {[
              { icon: Layers, label: "Módulos TSI", value: "11" },
              { icon: Brain, label: "Metamodels", value: "4" },
              { icon: Zap, label: "Mais Rápido", value: "95%" },
              { icon: Award, label: "Enterprise-Grade", value: "100%" }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="bg-[#0B0F1A]/50 border-[#00D4FF]/20 backdrop-blur-sm text-center">
                    <CardContent className="p-6">
                      <Icon className="w-8 h-8 text-[#00D4FF] mx-auto mb-3" />
                      <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-slate-400">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-[#0B0F1A]/30 border-y border-[#00D4FF]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-[#00D4FF]" />
                <h2 className="text-3xl font-bold text-white">Nossa Missão</h2>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed mb-4">
                Transformar a maneira como organizações tomam decisões estratégicas, oferecendo uma plataforma de inteligência artificial que atua como <span className="text-[#00D4FF] font-semibold">parceiro cognitivo</span>, não apenas ferramenta.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Acreditamos que IA empresarial deve amplificar o julgamento humano, não substituí-lo. Nossa metodologia TSI garante que cada insight seja rastreável, explicável e alinhado aos objetivos estratégicos da organização.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-[#FFB800]" />
                <h2 className="text-3xl font-bold text-white">Nossa Visão</h2>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed mb-4">
                Ser a plataforma de referência global em <span className="text-[#FFB800] font-semibold">inteligência estratégica institucional</span>, estabelecendo um novo padrão de como IA e humanos colaboram em decisões de alto impacto.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Nosso objetivo é que toda organização de médio e grande porte tenha acesso a inteligência de nível consultoria MBB, com velocidade de IA e custos SaaS.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nossos Valores
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Princípios que guiam o desenvolvimento e operação da plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-[#0B0F1A]/50 border-[#00D4FF]/20 backdrop-blur-sm h-full hover:border-[#00D4FF]/50 transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#FFB800]/20 flex items-center justify-center mb-6">
                        <Icon className="w-8 h-8 text-[#00D4FF]" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-[#0B0F1A]/30 border-y border-[#00D4FF]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nossa Jornada
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Evolução da plataforma desde a fundação até hoje
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-r from-[#0B0F1A]/50 to-[#0B0F1A]/30 border-[#00D4FF]/20 backdrop-blur-sm hover:border-[#00D4FF]/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="flex-shrink-0">
                        <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40 text-lg px-4 py-2">
                          {milestone.year}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">{milestone.title}</h3>
                        <p className="text-slate-400">{milestone.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Expertise */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Expertise Multidisciplinar
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Time com experiência em IA, estratégia, engenharia e governança
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {team.map((area, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-[#0B0F1A]/50 border-[#00D4FF]/20 backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#00D4FF] mb-3">{area.role}</h3>
                    <p className="text-slate-300">{area.description}</p>
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
              Conheça a Plataforma em Ação
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Solicite acesso para ver como CAIO·AI pode transformar suas decisões estratégicas
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <AccessRequestForm 
                trigger={
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628] font-semibold px-10 py-6 text-lg"
                  >
                    Solicitar Acesso Gratuito
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                }
              />
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate(createPageUrl('Funcionalidades'))}
                className="border-2 border-[#00D4FF]/50 bg-transparent text-[#00D4FF] hover:bg-[#00D4FF]/10 px-10 py-6 text-lg"
              >
                Ver Funcionalidades
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