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
import AuthoritySpectrum from "../components/landing/AuthoritySpectrum";
import PreHomeAnimation from "../components/landing/PreHomeAnimation";
import PricingSection from "../components/landing/PricingSection";
import InteractiveDemo from "../components/landing/InteractiveDemo";
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
  const [showPreHome, setShowPreHome] = useState(true);

  const [activeModule, setActiveModule] = useState("M5");
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

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

    // Check if user has seen pre-home animation or chosen to skip
    const hasSeenPreHome = sessionStorage.getItem('caio_prehome_seen');
    const skipIntro = localStorage.getItem('caio_skip_intro');
    if (hasSeenPreHome || skipIntro === 'true') {
      setShowPreHome(false);
    }
  }, []);

  const handleLogin = (e) => {
    e?.preventDefault();
    // Use window.location for public page navigation
    const dashboardUrl = window.location.origin + createPageUrl("Dashboard");
    base44.auth.redirectToLogin(dashboardUrl);
  };



  const featuredModule = tsiModules.find((m) => m.featured);

  const handlePreHomeComplete = () => {
    sessionStorage.setItem('caio_prehome_seen', 'true');
    setShowPreHome(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-cyan-950 to-yellow-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show pre-home animation
  if (showPreHome) {
    return <PreHomeAnimation onComplete={handlePreHomeComplete} />;
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
      <nav className="sticky top-0 z-50 bg-[#0A1628]/95 backdrop-blur-xl border-b border-caio-blue/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png" 
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
            {/* Logo Animated */}
            <div className="mb-12 flex justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00C8FF] via-[#16A9FF] to-[#FFC247] opacity-20 blur-3xl rounded-full" />
              <img 
                src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png" 
                alt="CAIO·AI Logo" 
                className="w-40 h-40 object-contain drop-shadow-[0_0_40px_rgba(0,200,255,0.6)] relative z-10"
              />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-[#EAF6FF] mb-6 leading-tight tracking-tight" style={{ fontFamily: '"Inter", sans-serif' }}>
              The Executive System for<br />
              Intelligent Strategic Operations
            </h1>
            
            <p className="text-xl md:text-2xl text-[#A7B2C4] mb-6 font-light" style={{ fontFamily: '"Inter", sans-serif' }}>
              Built on TSI v9.3 — 11 Cognitive Modules
            </p>

            <div className="flex justify-center mb-8">
              <img 
                src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png" 
                alt="CAIO·AI" 
                className="h-16 object-contain opacity-60"
              />
            </div>

            <p className="text-lg md:text-xl text-[#EAF6FF]/80 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Structured intelligence for executive decision-making.
              <br className="hidden md:block" />
              A strategic partner designed to <span className="text-[#00C8FF] font-semibold">think with you</span>, not for you.
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
                    Start with CAIO·AI — 14-Day Free Access
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
                Try Interactive Demo
              </Button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: Layers,
                  label: "TSI Modules",
                  value: "11",
                  color: "#00C8FF",
                },
                {
                  icon: Network,
                  label: "Strategic Connections",
                  value: "10K+",
                  color: "#16A9FF",
                },
                {
                  icon: Zap,
                  label: "Faster Analysis",
                  value: "95%",
                  color: "#FFC247",
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
              Why CAIO·AI Is Different
            </h2>
            <p className="text-xl md:text-2xl text-[#A7B2C4] max-w-4xl mx-auto leading-relaxed font-light">
              Not another chatbot. <span className="text-[#00C8FF] font-semibold">Cognitive infrastructure</span> for{" "}
              <span className="text-[#FFC247] font-semibold">modern organizations</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                title: "TSI v9.3 Proprietary Methodology",
                description: "11 integrated modules covering context, finance, technology, execution, capital, and cognitive governance.",
                icon: Brain,
                color: "#00C8FF"
              },
              {
                title: "Human-AI Symbiosis",
                description: "Architecture that amplifies strategic decisions without replacing executive judgment.",
                icon: Network,
                color: "#16A9FF"
              },
              {
                title: "Enterprise-Grade",
                description: "Cognitive governance, decision auditing, and full traceability via Hermes Trust-Broker.",
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
                    <p className="text-base text-[#A7B2C4] leading-relaxed font-light">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Separator */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00C8FF] to-[#FFC247] opacity-30" />
        </div>
      </section>

      {/* TSI Methodology Showcase */}
      <section
        id="methodology"
        className="py-32 bg-caio-graphite/20 backdrop-blur-sm border-y border-caio-blue/20"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="bg-[#00C8FF]/20 text-[#00C8FF] border-[#00C8FF]/40 mb-8 px-8 py-3 text-base font-semibold" style={{ boxShadow: '0 0 20px rgba(0, 200, 255, 0.3)' }}>
              TSI v9.3 · 11 Cognitive Modules
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-[#EAF6FF] mb-8">
              Institutional-Grade<br />Strategic Intelligence
            </h2>
            <p className="text-xl md:text-2xl text-[#A7B2C4] max-w-4xl mx-auto leading-relaxed font-light">
              Unlike generic models, CAIO operates on a{" "}
              <span className="text-[#00C8FF] font-semibold">modular 11-block TSI system</span>{" "}
              covering context, finance, technology, execution, capital, and cognitive governance.
            </p>
          </div>

          {/* Grid 4x3 com M5 destacado */}
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
                      <div className={`flex ${isFeatured ? 'flex-col' : 'flex-col'} items-center gap-3 ${isFeatured ? 'w-32' : 'w-full'}`}>
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

      {/* Authority Positioning Spectrum */}
      <AuthoritySpectrum />

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
              Ready to Transform Strategic Decision-Making?
            </h2>
            <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
              Junte-se a organizações que usam CAIO·AI para tomar decisões mais
              rápidas, profundas e alinhadas à lógica de capital.
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
                    Schedule a Call
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
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
              <p className="text-sm font-body text-caio-blue mb-4 font-semibold">
                Inteligência que vira tração.
              </p>
              <p className="text-xs font-body text-caio-off-white/60">
                powered by FRATOZ
              </p>
            </div>
            <div>
              <h4 className="text-white font-body font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm font-body">
                <li>
                  <a
                    href="#methodology"
                    className="text-slate-300 hover:text-caio-gold transition-colors"
                  >
                    TSI Methodology
                  </a>
                </li>
                <li>
                  <a
                    href="#capabilities"
                    className="text-slate-300 hover:text-caio-gold transition-colors"
                  >
                    Capabilities
                  </a>
                </li>
                <li>
                  <a
                    href="#use-cases"
                    className="text-slate-300 hover:text-caio-gold transition-colors"
                  >
                    Use Cases
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-slate-300 hover:text-caio-gold transition-colors"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-body font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm font-body">
                <li>
                  <a href="#" className="text-slate-300 hover:text-caio-gold transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-caio-gold transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-caio-gold transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-caio-gold transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-body font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm font-body">
                <li>
                  <a href="#" className="text-slate-300 hover:text-caio-gold transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-caio-gold transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-caio-gold transition-colors">
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