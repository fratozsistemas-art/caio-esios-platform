import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  DollarSign,
  Play,
  Network,
  Layers,
  Star,
  Award,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import PricingCard from "../components/pricing/PricingCard";
import AccessRequestForm from "../components/landing/AccessRequestForm";
import {
  tsiModules,
  advancedCapabilities,
  comparisonFeatures,
  detailedUseCases,
  testimonials,
  plans
} from "../components/landing";

export default function Landing() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roiInputs, setRoiInputs] = useState({
    teamSize: 10,
    avgSalary: 120000,
    hoursPerWeek: 15,
  });
  const [activeModule, setActiveModule] = useState("M5");
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        // Silently handle auth errors on public landing page
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();

    // Check for unauthorized error
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'unauthorized') {
      setShowUnauthorizedAlert(true);
      toast.error('Acesso não autorizado. Seu email não está pré-cadastrado no sistema.');
    }
  }, []);

  const handleLogin = (e) => {
    e?.preventDefault();
    // Use window.location for public page navigation
    const dashboardUrl = window.location.origin + createPageUrl("Dashboard");
    base44.auth.redirectToLogin(dashboardUrl);
  };

  const calculateROI = () => {
    const hourlyRate = roiInputs.avgSalary / 2080;
    const weeklyWaste = roiInputs.teamSize * roiInputs.hoursPerWeek * hourlyRate;
    const annualWaste = weeklyWaste * 52;
    const caioSavings = annualWaste * 0.7;
    return Math.round(caioSavings);
  };

  const featuredModule = tsiModules.find((m) => m.featured);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-cyan-950 to-yellow-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-caio-navy"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(10, 180, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 50%, rgba(255, 196, 58, 0.1) 0%, transparent 50%),
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 16h8v8h-8zM20 32h8v8h-8zM0 48h8v8H0zM16 0h8v8h-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `
      }}>
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
                  Seu email não está pré-cadastrado no sistema. Solicite acesso através do formulário abaixo.
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
      <nav className="sticky top-0 z-50 bg-caio-navy/95 backdrop-blur-xl border-b border-caio-blue/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/f032804a4_CAIOAIlogooficial.png" 
                alt="CAIO·AI" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <div className="text-xl font-bold font-heading text-white" style={{ letterSpacing: '0.05em' }}>
                  CAIO·AI
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#methodology"
                className="text-caio-blue hover:text-caio-gold transition-colors font-body font-medium"
              >
                Methodology
              </a>
              <a
                href="#capabilities"
                className="text-caio-blue hover:text-caio-gold transition-colors font-body font-medium"
              >
                Capabilities
              </a>
              <a
                href="#use-cases"
                className="text-caio-blue hover:text-caio-gold transition-colors font-body font-medium"
              >
                Use Cases
              </a>
              <a
                href="#pricing"
                className="text-caio-blue hover:text-caio-gold transition-colors font-body font-medium"
              >
                Pricing
              </a>
              {isAuthenticated ? (
                <Button
                  onClick={() => navigate(createPageUrl("Dashboard"))}
                  className="bg-caio-blue hover:shadow-neon-gold text-white font-body font-semibold border border-caio-gold/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Go to Dashboard
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
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 md:py-48">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-radial from-caio-blue/10 via-transparent to-caio-gold/10" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-caio-blue/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-caio-gold/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Logo Animated */}
            <div className="mb-12 flex justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/f032804a4_CAIOAIlogooficial.png" 
                alt="CAIO·AI Logo" 
                className="w-32 h-32 object-contain drop-shadow-[0_0_30px_rgba(10,180,255,0.5)]"
              />
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-heading font-bold text-white mb-8 leading-tight" style={{ letterSpacing: '0.02em' }}>
              CAIO·AI
            </h1>
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-8 drop-shadow-[0_0_20px_rgba(10,180,255,0.3)]">
              Inteligência que Cria Tração
            </h2>

            <p className="text-2xl md:text-3xl font-body text-white mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Plataforma integrada de análise, decisão e execução baseada no TSI.
              <br className="hidden md:block" />
              Arquitetura modular que conecta <span className="text-caio-blue font-bold drop-shadow-[0_0_10px_rgba(10,180,255,0.5)]">inteligência humana</span> com <span className="text-caio-gold font-bold drop-shadow-[0_0_10px_rgba(255,196,58,0.5)]">capacidade computacional</span>.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <AccessRequestForm 
                trigger={
                  <Button
                    size="lg"
                    className="bg-caio-blue hover:shadow-glow-gold text-white font-body font-semibold border-2 border-caio-gold/50 px-10 py-7 text-lg transition-all duration-300 hover:-translate-y-1 shadow-neon-blue"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Iniciar Trial Gratuito
                  </Button>
                }
              />
              <AccessRequestForm 
                trigger={
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-caio-gold/50 bg-caio-gold/10 text-caio-gold hover:bg-caio-gold/20 hover:shadow-glow-gold font-body font-semibold px-10 py-7 text-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Agendar Demo
                  </Button>
                }
              />
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: Layers,
                  label: "Módulos TSI",
                  value: "11",
                  bgClass: "from-caio-blue to-caio-blue-medium",
                },
                {
                  icon: Network,
                  label: "Conexões Estratégicas",
                  value: "10K+",
                  bgClass: "from-caio-blue-medium to-caio-blue",
                },
                {
                  icon: Zap,
                  label: "Análise Mais Rápida",
                  value: "95%",
                  bgClass: "from-caio-gold to-caio-gold-dark",
                },
                {
                  icon: DollarSign,
                  label: "Economia Anual Média",
                  value: "$180K",
                  bgClass: "from-caio-gold-dark to-caio-gold",
                },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card className="bg-caio-graphite/30 border-caio-blue/20 backdrop-blur-sm hover:bg-caio-graphite/50 hover:border-caio-gold/40 transition-all duration-300 hover:shadow-neon-blue">
                      <CardContent className="p-6 text-center">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.bgClass} flex items-center justify-center mx-auto mb-3 shadow-lg`}
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-3xl font-heading font-bold text-white mb-2">
                          {stat.value}
                        </div>
                        <div className="text-xs font-body text-caio-off-white/70">
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

      {/* Por que CAIO·AI */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-caio-blue/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-heading font-bold text-white mb-8 drop-shadow-[0_0_30px_rgba(10,180,255,0.3)]">
              Por que CAIO·AI?
            </h2>
            <p className="text-2xl md:text-3xl font-body text-white max-w-4xl mx-auto leading-relaxed font-medium">
              Não é mais um chatbot. É uma arquitetura de <span className="text-caio-blue font-bold">inteligência estratégica</span> que{" "}
              <span className="text-caio-gold font-bold">cria tração real</span> nos seus objetivos de negócio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                title: "Metodologia TSI Proprietária",
                description: "11 módulos integrados cobrindo desde análise de contexto até execução e capital.",
                icon: Brain,
                gradient: "from-caio-blue to-caio-blue-medium"
              },
              {
                title: "Simbiose Humano-IA",
                description: "Arquitetura que amplifica decisões estratégicas sem substituir o julgamento executivo.",
                icon: Network,
                gradient: "from-caio-gold to-caio-gold-dark"
              },
              {
                title: "Nível Enterprise",
                description: "Governança cognitiva, auditoria de decisões e rastreabilidade completa via Hermes.",
                icon: Target,
                gradient: "from-caio-blue-medium to-caio-gold"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-caio-graphite/50 border-caio-blue/30 backdrop-blur-sm h-full hover:border-caio-gold/60 transition-all duration-300 hover:shadow-glow-blue">
                  <CardContent className="p-10 text-center">
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-6 shadow-neon-blue`}>
                      <item.icon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-heading font-bold text-white mb-6">{item.title}</h3>
                    <p className="text-lg font-body text-white leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Separator */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-caio-blue to-caio-gold mb-20" />
        </div>
      </section>

      {/* TSI Methodology Showcase */}
      <section
        id="methodology"
        className="py-32 bg-caio-graphite/20 backdrop-blur-sm border-y border-caio-blue/20"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="bg-caio-blue/30 text-white border-caio-blue/60 mb-8 px-8 py-3 text-lg font-body font-semibold shadow-neon-blue">
              TSI v9.3 · Sistema de 11 Módulos
            </Badge>
            <h2 className="text-6xl md:text-7xl font-heading font-bold text-white mb-8 drop-shadow-[0_0_30px_rgba(10,180,255,0.3)]">
              Inteligência Estratégica<br />de Nível Institucional
            </h2>
            <p className="text-2xl md:text-3xl font-body text-white max-w-4xl mx-auto leading-relaxed font-medium">
              Diferente de modelos genéricos, CAIO opera sobre um{" "}
              <span className="text-caio-blue font-bold">sistema modular de 11 blocos TSI</span>{" "}
              que cobre contexto, finanças, tecnologia, execução, capital e governança cognitiva.
            </p>
          </div>

          {/* Grid com módulos TSI */}
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 mb-16">
            {tsiModules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => setActiveModule(module.id)}
                  className="cursor-pointer"
                >
                  <Card
                    className={`h-full transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-br from-caio-blue/30 to-caio-gold/30 border-caio-gold/60 shadow-glow-gold"
                        : "bg-caio-graphite/50 border-caio-blue/30 hover:border-caio-gold/40 hover:shadow-neon-blue"
                    }`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-caio-blue to-caio-gold flex items-center justify-center mx-auto mb-4 shadow-neon-blue">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <Badge className="bg-caio-blue/30 text-white border-caio-blue/50 text-xs mb-3 font-mono font-bold">
                        {module.id}
                      </Badge>
                      <h3 className="font-heading font-bold text-white text-lg mb-2">
                        {module.name}
                      </h3>
                      <p className="text-sm font-body text-white/90 leading-relaxed mb-2">
                        {module.description}
                      </p>
                      <p className="text-xs font-body text-caio-gold/80 font-medium">
                        {module.tag}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}


          </div>

          {/* Methodology Benefits */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: CheckCircle,
                title: "Cobertura Completa",
                description:
                  "Os 11 módulos trabalham juntos para cobrir mercado, produto, tecnologia, capital, execução e governança cognitiva.",
                gradient: "from-caio-blue to-caio-blue-medium",
              },
              {
                icon: Zap,
                title: "Modo Especialista Modular",
                description:
                  "Rode apenas o módulo que interessa (M1–M11) sem perder coerência com a arquitetura TSI.",
                gradient: "from-caio-gold to-caio-gold-dark",
              },
              {
                icon: Target,
                title: "Depth-Level Architecture",
                description:
                  "Saídas adaptadas para Board, C-Suite, VPs, gestores e analistas, com o mesmo núcleo analítico.",
                gradient: "from-caio-blue-medium to-caio-gold",
              },
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
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6 shadow-neon-blue`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-heading font-bold text-white mb-4">
                        {benefit.title}
                      </h3>
                      <p className="text-white text-base font-body leading-relaxed">
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

      {/* Advanced Capabilities */}
      <section id="capabilities" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40 mb-4">
              🚀 Advanced Capabilities
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Beyond Basic AI Chat
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              6 capacidades únicas que diferenciam CAIO de modelos genéricos e
              consultorias tradicionais.
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
              📊 Feature Comparison
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              CAIO vs LLMs vs Reasoning Models vs Consultants
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              A velocidade da IA combinada com metodologia TSI de 11 módulos e governança de decisão.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-3 text-slate-400 font-semibold text-left">Feature</th>
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
                      <span className="text-slate-400 font-semibold text-xs">Reasoning</span>
                      <span className="text-slate-500 text-[10px]">(o1, o3)</span>
                    </div>
                  </th>
                  <th className="p-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-400 font-semibold text-xs">Individual</span>
                      <span className="text-slate-500 text-[10px]">Consultants</span>
                    </div>
                  </th>
                  <th className="p-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-400 font-semibold text-xs">Boutique</span>
                      <span className="text-slate-500 text-[10px]">Consultancies</span>
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
            <p className="text-slate-300 mb-6">
              <span className="text-[#00D4FF] font-semibold">
                Metodologia nível consultoria
              </span>{" "}
              +
              <span className="text-[#00A8CC] font-semibold">
                {" "}
                velocidade de IA
              </span>{" "}
              +
              <span className="text-[#FFB800] font-semibold">
                {" "}
                modelo SaaS
              </span>
            </p>
            <AccessRequestForm 
              trigger={
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628] font-semibold"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Detailed Use Cases */}
      <section id="use-cases" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40 mb-4">
              💼 Real-World Results
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How Leaders Use CAIO
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Casos reais com ROI mensurável e compressão brutal de tempo de
              análise.
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
                              Challenge
                            </p>
                            <p className="text-slate-300 text-sm">
                              {useCase.challenge}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              CAIO Solution
                            </p>
                            <p className="text-slate-300 text-sm">
                              {useCase.solution}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                          Results
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
                              Cost Savings
                            </p>
                            <p className="text-xl font-bold text-white">
                              {useCase.savings}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-[#FFB800]/20 to-[#FF9500]/20 border border-[#FFB800]/40">
                            <p className="text-xs text-[#FFE5A8] mb-1">
                              Time Saved
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
              ⭐ Trusted by Leaders
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What Executives Say
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

      {/* ROI Calculator */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Calculate Your Savings
            </h2>
            <p className="text-xl text-slate-300">
              Veja quanto tempo e budget estratégico você devolve para o seu
              time usando CAIO.
            </p>
          </div>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8">
              <div className="space-y-6 mb-8">
                <div>
                  <label className="text-sm text-slate-200 mb-2 block font-medium">
                    Team Size (executives/analysts)
                  </label>
                  <Input
                    type="number"
                    value={roiInputs.teamSize}
                    onChange={(e) =>
                      setRoiInputs({
                        ...roiInputs,
                        teamSize: parseInt(e.target.value) || 0,
                      })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-200 mb-2 block font-medium">
                    Average Annual Salary ($)
                  </label>
                  <Input
                    type="number"
                    value={roiInputs.avgSalary}
                    onChange={(e) =>
                      setRoiInputs({
                        ...roiInputs,
                        avgSalary: parseInt(e.target.value) || 0,
                      })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-200 mb-2 block font-medium">
                    Hours/Week on Strategic Analysis
                  </label>
                  <Input
                    type="number"
                    value={roiInputs.hoursPerWeek}
                    onChange={(e) =>
                      setRoiInputs({
                        ...roiInputs,
                        hoursPerWeek: parseInt(e.target.value) || 0,
                      })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="border-t border-white/20 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-200 font-medium">
                    Current Annual Waste:
                  </span>
                  <span className="text-2xl font-bold text-red-400">
                    ${(Math.round(calculateROI() / 0.7)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-200 font-medium">
                    Potential Annual Savings with CAIO:
                  </span>
                  <span className="text-4xl font-bold text-emerald-400">
                    ${calculateROI().toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-slate-300 text-center mb-6 bg-white/5 p-3 rounded-lg">
                  Estimativa baseada em{" "}
                  <span className="font-semibold">70% de economia</span> de
                  tempo em tarefas de análise estratégica.
                </div>
                <Button
                  size="lg"
                  onClick={() =>
                    document
                      .getElementById("pricing")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-full bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628] text-lg font-semibold shadow-xl shadow-[#00D4FF]/30"
                >
                  See Plans & Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="py-20 md:py-32 bg-white/5 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-8">
              14-day free trial. No credit card required. Cancel anytime.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00D4FF]/20 border border-[#00D4FF]/40 text-[#00E5FF] text-sm font-medium shadow-lg">
              <CheckCircle className="w-4 h-4" />
              30-Day Money-Back Guarantee
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.slice(0, 3).map((plan, i) => (
              <PricingCard key={i} plan={plan} index={i} />
            ))}
          </div>
        </div>
      </section>

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
              Ready to Transform Strategic Decision-Making?
            </h2>
            <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
              Junte-se a organizações que usam CAIO·AI para tomar decisões mais
              rápidas, profundas e alinhadas à lógica de capital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AccessRequestForm />
              <AccessRequestForm 
                trigger={
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-[#FFB800]/40 bg-[#FFB800]/10 text-white hover:bg-[#FFB800]/20 hover:border-[#FFB800]/60 font-semibold px-8 py-6 text-lg shadow-xl"
                  >
                    Schedule a Call
                  </Button>
                }
              />
            </div>
            <p className="text-sm text-slate-300 mt-6 font-medium">
              Acesso restrito · Entre em contato para solicitar demonstração
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-caio-blue/20 py-16 bg-caio-navy backdrop-blur-sm">
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
              <p className="text-sm font-body text-caio-blue mb-4 font-semibold">
                Inteligência que vira tração.
              </p>
              <p className="text-xs font-body text-caio-off-white/60">
                powered by FRATOZ
              </p>
            </div>
            <div>
              <h4 className="text-white font-body font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm font-body text-caio-off-white/70">
                <li>
                  <a
                    href="#methodology"
                    className="hover:text-caio-gold transition-colors"
                  >
                    TSI Methodology
                  </a>
                </li>
                <li>
                  <a
                    href="#capabilities"
                    className="hover:text-caio-gold transition-colors"
                  >
                    Capabilities
                  </a>
                </li>
                <li>
                  <a
                    href="#use-cases"
                    className="hover:text-caio-gold transition-colors"
                  >
                    Use Cases
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-caio-gold transition-colors"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-body font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm font-body text-caio-off-white/70">
                <li>
                  <a href="#" className="hover:text-caio-gold transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-caio-gold transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-caio-gold transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-caio-gold transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-body font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm font-body text-caio-off-white/70">
                <li>
                  <a href="#" className="hover:text-caio-gold transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-caio-gold transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-caio-gold transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-caio-blue/10 pt-8">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-caio-blue to-caio-gold mb-8" />
            <p className="text-center text-sm font-body text-caio-off-white/50">
              © 2025 CAIO·AI Platform. All rights reserved. | Powered by TSI v9.3 Strategic Intelligence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}