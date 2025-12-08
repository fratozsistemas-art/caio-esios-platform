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
  Menu,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import AccessRequestForm from "../components/landing/AccessRequestForm";
import InteractiveDemo from "../components/landing/InteractiveDemo";
import {
  tsiModules,
  advancedCapabilities,
  comparisonFeatures,
  detailedUseCases,
  testimonials
} from "../components/landing";

export default function LandingLight() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModule, setActiveModule] = useState("M5");
  const [showDemo, setShowDemo] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  }, []);

  const handleLogin = (e) => {
    e?.preventDefault();
    const dashboardUrl = window.location.origin + createPageUrl("Dashboard");
    base44.auth.redirectToLogin(dashboardUrl);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#C7A763]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png" 
                alt="CAIO·AI" 
                className="w-12 h-12 object-contain"
              />
              <div className="text-xl font-bold text-[#0A1E3A]">
                CAIO·AI
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#methodology" className="text-slate-700 hover:text-[#C7A763] transition-colors font-medium text-sm">
                Methodology
              </a>
              <a href="#capabilities" className="text-slate-700 hover:text-[#C7A763] transition-colors font-medium text-sm">
                Capabilities
              </a>
              <a href="#use-cases" className="text-slate-700 hover:text-[#C7A763] transition-colors font-medium text-sm">
                Use Cases
              </a>
              <a href="#pricing" className="text-slate-700 hover:text-[#C7A763] transition-colors font-medium text-sm">
                Pricing
              </a>

              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
                {isAuthenticated ? (
                  <Button
                    onClick={() => navigate(createPageUrl("Dashboard"))}
                    className="bg-[#0A1E3A] hover:bg-[#112A4D] text-white font-semibold"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <AccessRequestForm 
                      trigger={
                        <Button
                          variant="outline"
                          className="border-[#C7A763] text-[#C7A763] hover:bg-[#C7A763]/10 font-semibold"
                        >
                          Request Access
                        </Button>
                      }
                    />
                    <Button
                      onClick={handleLogin}
                      className="bg-gradient-to-r from-[#C7A763] to-[#E3C37B] hover:from-[#A8864D] hover:to-[#C7A763] text-white font-semibold"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-700"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-slate-50 via-white to-[#EAEFF7]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-[#0A1E3A] mb-6 leading-tight">
              Executive Strategic Intelligence<br />
              <span className="bg-gradient-to-r from-[#C7A763] to-[#E3C37B] bg-clip-text text-transparent">
                for Data-Driven Decisions
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Built on <span className="font-semibold text-[#0A1E3A]">TSI v9.3</span> — 11 Cognitive Modules delivering consulting-grade analysis at software speed
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <AccessRequestForm 
                trigger={
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#0A1E3A] to-[#112A4D] hover:from-[#112A4D] hover:to-[#0A1E3A] text-white font-semibold px-10 py-7 text-lg shadow-xl"
                  >
                    Start with CAIO·AI — 14-Day Free Access
                  </Button>
                }
              />
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowDemo(true)}
                className="border-2 border-[#C7A763] text-[#0A1E3A] hover:bg-[#C7A763]/10 font-semibold px-8 py-7 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Try Interactive Demo
              </Button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Layers, label: "TSI Modules", value: "11", color: "#0A1E3A" },
                { icon: Network, label: "Strategic Connections", value: "10K+", color: "#112A4D" },
                { icon: Zap, label: "Faster Analysis", value: "95%", color: "#C7A763" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all">
                      <CardContent className="p-6 text-center">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                          style={{ 
                            backgroundColor: `${stat.color}10`,
                            border: `2px solid ${stat.color}30`
                          }}
                        >
                          <Icon className="w-7 h-7" style={{ color: stat.color }} />
                        </div>
                        <div className="text-3xl font-bold text-[#0A1E3A] mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-slate-600">
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

      {/* Why Different */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A1E3A] mb-6">
              Why This Strategic Intelligence Platform Is Different
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto">
              Not another chatbot—cognitive infrastructure for modern organizations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "TSI v9.3 Strategic Framework",
                description: "11 integrated cognitive modules delivering institutional-grade strategic insights.",
                icon: Brain,
                color: "#0A1E3A"
              },
              {
                title: "Human-AI Symbiosis",
                description: "Amplifies strategic decisions without replacing executive judgment.",
                icon: Network,
                color: "#112A4D"
              },
              {
                title: "Enterprise-Grade Intelligence",
                description: "Full audit trails for board-level accountability with Hermes Trust-Broker.",
                icon: Target,
                color: "#C7A763"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all h-full">
                  <CardContent className="p-8 text-center">
                    <div 
                      className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6"
                      style={{ backgroundColor: `${item.color}10` }}
                    >
                      <item.icon className="w-10 h-10" style={{ color: item.color }} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0A1E3A] mb-4">{item.title}</h3>
                    <p className="text-base text-slate-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TSI Methodology */}
      <section id="methodology" className="py-20 md:py-32 bg-gradient-to-br from-[#EAEFF7] to-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#C7A763]/20 text-[#C7A763] border-[#C7A763]/40 mb-6 px-6 py-2 text-base font-semibold">
              TSI v9.3 · 11 Cognitive Modules
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-[#0A1E3A] mb-6">
              Institutional-Grade<br />Strategic Intelligence
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto">
              Unlike generic AI models, CAIO operates on a modular strategic analysis framework
            </p>
          </div>

          {/* Modules Grid */}
          <div className="grid gap-4 md:grid-cols-4 mb-12">
            {tsiModules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              const isFeatured = module.id === "M5";
              const moduleColor = parseInt(module.id.slice(1)) % 2 === 0 ? "#C7A763" : "#0A1E3A";
              
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
                    className={`h-full transition-all ${
                      isActive
                        ? "bg-white border-[#C7A763] shadow-xl"
                        : "bg-white border-slate-200 hover:border-[#C7A763]/50 shadow-md hover:shadow-lg"
                    }`}
                  >
                    <CardContent className={`${isFeatured ? 'p-6' : 'p-4'} flex ${isFeatured ? 'flex-row' : 'flex-col'} gap-4 h-full`}>
                      <div className={`flex flex-col items-center gap-2 ${isFeatured ? 'w-24' : 'w-full'}`}>
                        <div 
                          className={`${isFeatured ? 'w-14 h-14' : 'w-12 h-12'} rounded-xl flex items-center justify-center`}
                          style={{ backgroundColor: `${moduleColor}15` }}
                        >
                          <Icon className={`${isFeatured ? 'w-7 h-7' : 'w-6 h-6'}`} style={{ color: moduleColor }} />
                        </div>
                        {isFeatured && (
                          <Badge className="bg-[#C7A763]/20 text-[#C7A763] border-[#C7A763]/30 text-xs">
                            CORE
                          </Badge>
                        )}
                      </div>
                      <div className={`flex-1 ${isFeatured ? 'text-left' : 'text-center'}`}>
                        <h3 className={`font-bold text-[#0A1E3A] ${isFeatured ? 'text-lg' : 'text-sm'} mb-2`}>
                          <Badge className="bg-[#0A1E3A]/10 text-[#0A1E3A] text-xs font-mono mr-2">
                            {module.id}
                          </Badge>
                          {module.name}
                        </h3>
                        <p className={`${isFeatured ? 'text-sm' : 'text-xs'} text-slate-600`}>
                          {module.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Capabilities */}
      <section id="capabilities" className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#0A1E3A]/10 text-[#0A1E3A] border-[#0A1E3A]/20 mb-4">
              🚀 Advanced Capabilities
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A1E3A] mb-4">
              Beyond Basic AI Chat
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              6 unique capabilities that differentiate CAIO from generic models
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
                  <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all h-full">
                    <CardContent className="p-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#C7A763]/20 to-[#E3C37B]/20 flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-[#C7A763]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0A1E3A] mb-3">
                        {capability.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {capability.description}
                      </p>
                      <Badge className="bg-[#C7A763]/10 text-[#C7A763] text-xs">
                        {capability.metric}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-20 md:py-32 bg-gradient-to-br from-slate-50 to-[#EAEFF7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#C7A763]/20 text-[#C7A763] border-[#C7A763]/40 mb-4">
              💼 Real-World Results
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A1E3A] mb-4">
              Strategic Intelligence Use Cases
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Real-world results with measurable ROI
            </p>
          </div>

          <div className="space-y-8">
            {detailedUseCases.slice(0, 3).map((useCase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border-slate-200 shadow-lg">
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <Badge className="bg-[#0A1E3A]/10 text-[#0A1E3A] mb-3">
                          {useCase.role}
                        </Badge>
                        <h3 className="text-2xl font-bold text-[#0A1E3A] mb-4">
                          {useCase.title}
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-slate-500 uppercase mb-1">Challenge</p>
                            <p className="text-slate-700">{useCase.challenge}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase mb-1">Solution</p>
                            <p className="text-slate-700">{useCase.solution}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase mb-3">Results</p>
                        <div className="space-y-2 mb-6">
                          {useCase.results.map((result, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-[#C7A763] flex-shrink-0" />
                              <span className="text-slate-700 text-sm">{result}</span>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-[#C7A763]/10 border border-[#C7A763]/20">
                            <p className="text-xs text-[#C7A763] mb-1">Cost Savings</p>
                            <p className="text-xl font-bold text-[#0A1E3A]">{useCase.savings}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-[#0A1E3A]/10 border border-[#0A1E3A]/20">
                            <p className="text-xs text-[#0A1E3A] mb-1">Time Saved</p>
                            <p className="text-xl font-bold text-[#0A1E3A]">{useCase.timeframe}</p>
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

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#C7A763]/20 text-[#C7A763] border-[#C7A763]/40 mb-4">
              ⭐ Trusted by Leaders
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A1E3A] mb-4">
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
                <Card className="bg-white border-slate-200 shadow-lg h-full">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="w-5 h-5 fill-[#C7A763] text-[#C7A763]" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#C7A763] to-[#E3C37B] flex items-center justify-center text-white font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-[#0A1E3A]">{testimonial.name}</div>
                        <div className="text-sm text-slate-600">{testimonial.title}</div>
                        <div className="text-xs text-slate-500">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-[#0A1E3A] to-[#112A4D]">
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
              Join Fortune 500 organizations using CAIO·AI for faster, data-driven decisions
            </p>
            <AccessRequestForm 
              trigger={
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#C7A763] to-[#E3C37B] hover:from-[#A8864D] hover:to-[#C7A763] text-white font-semibold px-10 py-7 text-lg shadow-2xl"
                >
                  Request Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              }
            />
          </motion.div>
        </div>
      </section>

      <InteractiveDemo open={showDemo} onClose={() => setShowDemo(false)} />

      {/* Footer */}
      <footer className="border-t border-slate-200 py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png" 
                  alt="CAIO·AI" 
                  className="w-10 h-10 object-contain"
                />
                <div className="text-xl font-bold text-[#0A1E3A]">CAIO·AI</div>
              </div>
              <p className="text-sm text-[#C7A763] mb-2 font-semibold">
                Inteligência que vira tração.
              </p>
              <p className="text-xs text-slate-500">powered by FRATOZ</p>
            </div>
            <div>
              <h4 className="text-[#0A1E3A] font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#methodology" className="text-slate-600 hover:text-[#C7A763]">TSI Methodology</a></li>
                <li><a href="#capabilities" className="text-slate-600 hover:text-[#C7A763]">Capabilities</a></li>
                <li><a href="#use-cases" className="text-slate-600 hover:text-[#C7A763]">Use Cases</a></li>
                <li><a href="#pricing" className="text-slate-600 hover:text-[#C7A763]">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#0A1E3A] font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-600 hover:text-[#C7A763]">About</a></li>
                <li><a href="#" className="text-slate-600 hover:text-[#C7A763]">Blog</a></li>
                <li><a href="#" className="text-slate-600 hover:text-[#C7A763]">Careers</a></li>
                <li><a href="#" className="text-slate-600 hover:text-[#C7A763]">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#0A1E3A] font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-600 hover:text-[#C7A763]">Privacy</a></li>
                <li><a href="#" className="text-slate-600 hover:text-[#C7A763]">Terms</a></li>
                <li><a href="#" className="text-slate-600 hover:text-[#C7A763]">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8">
            <p className="text-center text-sm text-slate-500">
              © 2025 CAIO·AI Platform. All rights reserved. | Powered by TSI v9.3
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}