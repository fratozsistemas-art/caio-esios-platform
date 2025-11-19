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
  AlertCircle
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
      <nav className="sticky top-0 z-50 bg-[#0A1628]/95 backdrop-blur-xl border-b border-[#00D4FF]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/f032804a4_CAIOAIlogooficial.png" 
                alt="CAIO·AI" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <div className="text-xl font-bold text-white">
                  CAIO·AI
                </div>
                <div className="text-[10px] text-cyan-300 font-medium">
                  powered by FRATOZ
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#methodology"
                className="text-slate-200 hover:text-white transition-colors font-medium"
              >
                Methodology
              </a>
              <a
                href="#capabilities"
                className="text-slate-200 hover:text-white transition-colors font-medium"
              >
                Capabilities
              </a>
              <a
                href="#use-cases"
                className="text-slate-200 hover:text-white transition-colors font-medium"
              >
                Use Cases
              </a>
              <a
                href="#pricing"
                className="text-slate-200 hover:text-white transition-colors font-medium"
              >
                Pricing
              </a>
              {isAuthenticated ? (
                <Button
                  onClick={() => navigate(createPageUrl("Dashboard"))}
                  className="bg-gradient-to-r from-cyan-400 to-yellow-400 hover:from-cyan-300 hover:to-yellow-300 text-slate-950 shadow-lg shadow-cyan-400/30 font-semibold"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <AccessRequestForm 
                    trigger={
                      <Button
                        variant="outline"
                        className="border-white/40 text-white hover:bg-white/10"
                      >
                        Solicitar Acesso
                      </Button>
                    }
                  />
                  <Button
                    onClick={handleLogin}
                    className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628] shadow-lg shadow-[#00D4FF]/30 font-semibold"
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
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE2aDh2OGgtOHpNMjAgMzJoOHY4aC04ek0wIDQ4aDh2OGgtOHpNMTYgMGg4djhoLTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-yellow-500/5" />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#00D4FF]/15 via-[#00A8CC]/10 to-[#FFB800]/20 border border-[#00D4FF]/40 text-[#00E5FF] text-sm font-medium mb-8 shadow-lg">
              <Award className="w-4 h-4" />
              Powered by TSI v9.3 · 11-Module Strategic Intelligence
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Raising the bar on<br />
              <span className="bg-gradient-to-r from-[#00D4FF] via-[#00A8CC] to-[#FFB800] bg-clip-text text-transparent">
                Strategic Dialogue
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-4xl mx-auto leading-relaxed">
              ESIOS CAIO·AI — your <span className="text-[#00D4FF] font-semibold">unwavering executive peer</span>.
              <br className="hidden md:block" />
              Multi-agent orchestration, behavioral intelligence, and strategic frameworks that evolve with you.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <AccessRequestForm />
              <AccessRequestForm 
                trigger={
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-[#00D4FF]/40 bg-[#00D4FF]/10 text-white hover:bg-[#00D4FF]/20 hover:border-[#00D4FF]/60 font-semibold px-8 py-6 text-lg backdrop-blur-sm transition-all duration-300 shadow-xl"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Book a Demo
                  </Button>
                }
              />
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: Layers,
                  label: "TSI Modules",
                  value: "11",
                  bgClass: "from-[#00D4FF] to-[#0099CC]",
                },
                {
                  icon: Network,
                  label: "Strategic Connections",
                  value: "10K+",
                  bgClass: "from-[#00B8E6] to-[#0099CC]",
                },
                {
                  icon: Zap,
                  label: "Faster Analysis",
                  value: "95%",
                  bgClass: "from-[#00D4FF] to-[#00E5FF]",
                },
                {
                  icon: DollarSign,
                  label: "Avg. Annual Savings",
                  value: "$180K",
                  bgClass: "from-[#FFB800] to-[#FF9500]",
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
                    <Card className="bg-white/5 border-[#00D4FF]/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                      <CardContent className="p-4 text-center">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.bgClass} flex items-center justify-center mx-auto mb-2`}
                        >
                          <Icon className="w-5 h-5 text-[#0A1628]" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                          {stat.value}
                        </div>
                        <div className="text-xs text-slate-400">
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

      {/* TSI Methodology Showcase */}
      <section
        id="methodology"
        className="py-20 md:py-32 bg-white/5 backdrop-blur-sm border-y border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40 mb-4">
              🎯 TSI v9.3 · 11-Module System
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Institutional-Grade Strategic Intelligence
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Diferente de modelos genéricos de chat, CAIO opera sobre um{" "}
              <span className="text-[#00D4FF] font-semibold">
                sistema modular de 11 blocos TSI
              </span>{" "}
              que cobre contexto, finanças, tecnologia, execução, capital e
              governança cognitiva.
            </p>
          </div>

          {/* Grid com card destaque e cards menores */}
          <div className="grid gap-4 md:grid-cols-4 auto-rows-[minmax(0,1fr)] mb-10">
            {tsiModules.slice(0, 4).map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <motion.div
                  key={module.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveModule(module.id)}
                  className="col-span-4 md:col-span-1 cursor-pointer"
                >
                  <Card
                    className={`h-full transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-br from-cyan-500/20 to-yellow-400/20 border-cyan-300/60 shadow-lg shadow-cyan-400/25"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <CardContent className="p-4 h-full flex flex-col md:flex-row gap-4">
                      <div className="flex flex-col items-center md:items-start gap-2 md:w-2/5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-yellow-400 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-slate-950" />
                        </div>
                        <Badge className="bg-white/10 text-white text-[10px]">
                          {module.id}
                        </Badge>
                        <span className="text-[11px] text-slate-300 text-center md:text-left">
                          {module.tag}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-white text-sm mb-1">
                          {module.name}
                        </h3>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {featuredModule && (
              <motion.div
                key={featuredModule.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setActiveModule(featuredModule.id)}
                className="col-span-4 md:col-span-2 cursor-pointer"
              >
                <Card
                  className={`h-full transition-all duration-300 ${
                    activeModule === featuredModule.id
                      ? "bg-gradient-to-br from-[#00D4FF]/25 via-[#00A8CC]/15 to-[#FFB800]/20 border-[#00D4FF]/60 shadow-xl shadow-[#00D4FF]/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <CardContent className="p-6 h-full flex flex-col md:flex-row gap-5">
                    <div className="flex flex-col items-center md:items-start gap-3 md:w-1/4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#00D4FF] to-[#FFB800] flex items-center justify-center">
                        <featuredModule.icon className="w-7 h-7 text-[#0A1628]" />
                      </div>
                      <Badge className="bg-white/10 text-white text-xs">
                        Core Module · {featuredModule.id}
                      </Badge>
                      <span className="text-xs text-slate-300">
                        {featuredModule.tag}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-between text-left">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {featuredModule.name}
                        </h3>
                        <p className="text-sm text-slate-200 mb-4">
                          {featuredModule.description}
                        </p>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3 text-xs text-slate-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-300" />
                          <span>Integra todos os outros módulos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-300" />
                          <span>Gera opções estratégicas comparáveis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-300" />
                          <span>
                            Alinha narrativa executiva, conselho e capital
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {tsiModules.slice(5).map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <motion.div
                  key={module.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveModule(module.id)}
                  className="col-span-4 md:col-span-1 cursor-pointer"
                >
                  <Card
                    className={`h-full transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-br from-cyan-500/20 to-yellow-400/20 border-cyan-300/60 shadow-lg shadow-cyan-400/25"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <CardContent className="p-4 h-full flex flex-col md:flex-row gap-4">
                      <div className="flex flex-col items-center md:items-start gap-2 md:w-2/5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-yellow-400 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-slate-950" />
                        </div>
                        <Badge className="bg-white/10 text-white text-[10px]">
                          {module.id}
                        </Badge>
                        <span className="text-[11px] text-slate-300 text-center md:text-left">
                          {module.tag}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-white text-sm mb-1">
                          {module.name}
                        </h3>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Methodology Benefits */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              {
                icon: CheckCircle,
                title: "Cobertura Completa",
                description:
                  "Os 11 módulos trabalham juntos para cobrir mercado, produto, tecnologia, capital, execução e governança cognitiva.",
                bgClass: "bg-[#00D4FF]/20",
                iconClass: "text-[#00D4FF]",
              },
              {
                icon: Zap,
                title: "Modo Especialista Modular",
                description:
                  "Rode apenas o módulo que interessa (M1–M11) sem perder coerência com a arquitetura TSI.",
                bgClass: "bg-[#FFB800]/20",
                iconClass: "text-[#FFB800]",
              },
              {
                icon: Target,
                title: "Depth-Level Architecture",
                description:
                  "Saídas adaptadas para Board, C-Suite, VPs, gestores e analistas, com o mesmo núcleo analítico.",
                bgClass: "bg-[#00D4FF]/20",
                iconClass: "text-[#00D4FF]",
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
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
                    <CardContent className="p-6">
                      <div
                        className={`w-12 h-12 rounded-xl ${benefit.bgClass} flex items-center justify-center mb-4`}
                      >
                        <Icon
                          className={`w-6 h-6 ${benefit.iconClass}`}
                        />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed">
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
              CAIO vs ChatGPT vs Claude vs Consultants
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              A velocidade da IA combinada com metodologia TSI de 11 módulos e governança de decisão.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-4 text-slate-400 font-semibold">Feature</th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#FFB800] flex items-center justify-center mb-2">
                        <Brain className="w-6 h-6 text-[#0A1628]" />
                      </div>
                      <span className="text-white font-semibold">CAIO</span>
                    </div>
                  </th>
                  <th className="p-4 text-center text-slate-400">ChatGPT</th>
                  <th className="p-4 text-center text-slate-400">Claude</th>
                  <th className="p-4 text-center text-slate-400">
                    Consultants
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 text-slate-300 font-medium">
                      {row.feature}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.caio === "boolean" ? (
                        row.caio ? (
                          <CheckCircle className="w-6 h-6 text-emerald-300 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-white font-semibold">
                          {row.caio}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.chatgpt === "boolean" ? (
                        row.chatgpt ? (
                          <CheckCircle className="w-6 h-6 text-emerald-300 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400">
                          {row.chatgpt}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.claude === "boolean" ? (
                        row.claude ? (
                          <CheckCircle className="w-6 h-6 text-emerald-300 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400">{row.claude}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.consultants === "boolean" ? (
                        row.consultants ? (
                          <CheckCircle className="w-6 h-6 text-emerald-300 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400">
                          {row.consultants}
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
            <Button
              size="lg"
              onClick={() =>
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628] font-semibold"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
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
      <footer className="border-t border-white/10 py-12 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png" 
                  alt="CAIO·AI" 
                  className="w-8 h-8 object-contain"
                />
                <div className="text-lg font-bold text-white">CAIO·AI</div>
              </div>
              <p className="text-sm text-slate-300">
                Your Unwavering Executive Peer, Always On.
              </p>
              <Badge className="mt-4 bg-[#00D4FF]/20 text-[#00D4FF] text-xs border border-[#00D4FF]/40">
                TSI v9.3 · powered by FRATOZ
              </Badge>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a
                    href="#methodology"
                    className="hover:text-white transition-colors"
                  >
                    TSI Methodology
                  </a>
                </li>
                <li>
                  <a
                    href="#capabilities"
                    className="hover:text-white transition-colors"
                  >
                    Capabilities
                  </a>
                </li>
                <li>
                  <a
                    href="#use-cases"
                    className="hover:text-white transition-colors"
                  >
                    Use Cases
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-slate-400">
            © 2025 CAIO·AI Platform. All rights reserved. | Powered by TSI v9.3
            Strategic Intelligence · FRATOZ
          </div>
        </div>
      </footer>
    </div>
  );
}