import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Zap, Shield, TrendingUp, ArrowRight, CheckCircle,
  X, Sparkles, Mail, Target, BarChart, Users, Clock,
  DollarSign, Rocket, FileText, Play, MessageSquare,
  Network, Layers, Activity, Code, Globe, Lock,
  ChevronRight, Star, Award, Lightbulb, Search
} from "lucide-react";
import { motion } from "framer-motion";
import PricingCard from "../components/pricing/PricingCard";

export default function Landing() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roiInputs, setRoiInputs] = useState({
    teamSize: 10,
    avgSalary: 120000,
    hoursPerWeek: 15
  });
  const [activeModule, setActiveModule] = useState('M1');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  };

  const calculateROI = () => {
    const hourlyRate = roiInputs.avgSalary / 2080;
    const weeklyWaste = roiInputs.teamSize * roiInputs.hoursPerWeek * hourlyRate;
    const annualWaste = weeklyWaste * 52;
    const caioSavings = annualWaste * 0.7;
    return Math.round(caioSavings);
  };

  // This array is not used in the current Landing component but was part of the outline.
  // Keeping it as is, as the target change was already correctly implemented.
  const quickLinks = [
    {
      icon: Brain,
      title: "Chat with CAIO",
      description: "Start strategic conversation",
      link: createPageUrl("Chat"),
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Zap,
      title: "Quick Actions",
      description: "48+ ready-to-use frameworks",
      link: createPageUrl("QuickActions"),
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: FileText,
      title: "File Analyzer",
      description: "Upload & analyze documents",
      link: createPageUrl("FileAnalyzer"),
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Network,
      title: "Knowledge Graph",
      description: "Explore strategic connections",
      link: createPageUrl("KnowledgeGraph"),
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Search,
      title: "Query Engine",
      description: "Natural language search",
      link: createPageUrl("QueryEngine"),
      color: "from-cyan-500 to-blue-500"
    }
  ];

  // TSI Modules
  const tsiModules = [
    {
      id: 'M1',
      name: 'Market Context',
      description: 'TAM/SAM/SOM analysis, growth trends, regulatory landscape',
      icon: Globe,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'M2',
      name: 'Competitive Intel',
      description: 'Porter\'s 5 Forces, positioning map, SWOT analysis',
      icon: Target,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'M3',
      name: 'Tech & Innovation',
      description: 'Tech stack audit, digital maturity, innovation capacity',
      icon: Code,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'M4',
      name: 'Financial Modeling',
      description: 'DCF, NPV/IRR, Monte Carlo simulations, unit economics',
      icon: DollarSign,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'M5',
      name: 'Strategic Synthesis',
      description: 'CAIO/TSI frameworks, strategic options, recommendations',
      icon: Lightbulb,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'M6',
      name: 'Opportunity Matrix',
      description: 'Risk/return assessment, prioritization, resource allocation',
      icon: BarChart,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'M7',
      name: 'Implementation',
      description: 'Roadmap, OKRs, milestones, resource planning',
      icon: Rocket,
      color: 'from-teal-500 to-green-500'
    },
    {
      id: 'M8',
      name: 'Reframing Loop',
      description: 'Lateral thinking, alternative scenarios, innovation opportunities',
      icon: Layers,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'M9',
      name: 'Funding Intelligence',
      description: 'Investor mapping, fundraising strategy, valuation benchmarks',
      icon: TrendingUp,
      color: 'from-violet-500 to-purple-500'
    }
  ];

  // Advanced Capabilities
  const advancedCapabilities = [
    {
      icon: Network,
      title: 'Knowledge Graph',
      description: 'Graph-powered strategic intelligence. Find similar strategies, success patterns, and hidden opportunities.',
      metric: '10,000+ strategic relationships mapped'
    },
    {
      icon: Shield,
      title: 'BSI Monitoring',
      description: 'Brand & Strategy consistency tracking. Automated alerts for deviations from strategic plan.',
      metric: 'Real-time monitoring across 5+ channels'
    },
    {
      icon: Brain,
      title: 'Mental Model Detection',
      description: 'AI learns your decision-making style and adapts communication accordingly.',
      metric: '85%+ personalization accuracy'
    },
    {
      icon: Layers,
      title: 'Depth-Level Architecture',
      description: 'Strategic (CEO) → Operational (VP) → Tactical (Manager) → Individual output modes.',
      metric: '4 hierarchical analysis layers'
    },
    {
      icon: MessageSquare,
      title: 'Socratic Mode',
      description: 'Conversational data enrichment. No rigid forms, just natural strategic dialogue.',
      metric: '70% higher user engagement'
    },
    {
      icon: Zap,
      title: 'Modular Expert Mode',
      description: 'Execute isolated deep-dives (M1-M9) in minutes. Ultra-granular technical analysis.',
      metric: '5-7 min per module (vs 30+ min full analysis)'
    }
  ];

  // Comparison vs Competitors
  const comparisonFeatures = [
    { feature: 'Strategic Analysis Framework', caio: true, chatgpt: false, claude: false, consultants: true },
    { feature: 'Financial Modeling (DCF, Monte Carlo)', caio: true, chatgpt: false, claude: false, consultants: true },
    { feature: 'Competitive Intelligence Automation', caio: true, chatgpt: false, claude: false, consultants: false },
    { feature: 'Tech Stack Discovery', caio: true, chatgpt: false, claude: false, consultants: false },
    { feature: 'Knowledge Graph (strategic connections)', caio: true, chatgpt: false, claude: false, consultants: false },
    { feature: 'Real-time Brand Monitoring', caio: true, chatgpt: false, claude: false, consultants: false },
    { feature: 'Modular Expert Mode (isolated deep-dives)', caio: true, chatgpt: false, claude: false, consultants: false },
    { feature: 'Depth-Level Architecture (4 layers)', caio: true, chatgpt: false, claude: false, consultants: true },
    { feature: 'Cost (annual)', caio: '$1,188-$35,640', chatgpt: '$240', claude: '$240', consultants: '$50K-$500K+' },
    { feature: 'Delivery Time', caio: 'Minutes-Hours', chatgpt: 'Seconds', claude: 'Seconds', consultants: 'Weeks-Months' }
  ];

  // Use Cases with Real ROI
  const detailedUseCases = [
    {
      title: 'M&A Due Diligence',
      role: 'VP Corporate Development',
      challenge: 'Evaluate 5 acquisition targets in 2 weeks',
      solution: 'CAIO TSI+ runs full analysis (M1-M9) on each target in 2 hours',
      results: [
        '80% faster than manual analysis',
        'Discovered tech debt worth $2M in Target #3',
        'Recommended Target #2 (25% ROI vs 12% industry avg)'
      ],
      savings: '$150K consulting fees saved',
      timeframe: '10 days → 2 days'
    },
    {
      title: 'Market Entry Strategy',
      role: 'CEO, B2B SaaS',
      challenge: 'Should we expand to EU market?',
      solution: 'M1 (Market), M2 (Competitive), M4 (Financial) analysis with Socratic Mode',
      results: [
        'TAM: €2.1B (15% CAGR)',
        'GO decision with confidence: 88% (CRV)',
        'Identified underserved segment (€400M)'
      ],
      savings: '$80K saved vs McKinsey engagement',
      timeframe: '6 weeks → 3 days'
    },
    {
      title: 'Digital Transformation Roadmap',
      role: 'CTO, Financial Services',
      challenge: 'Modernize legacy tech stack ($5M budget)',
      solution: 'M3 (Tech) Expert Mode + M7 (Implementation) for phased rollout',
      results: [
        'Prioritized 12 initiatives by ROI',
        '18-month roadmap with OKRs',
        'Risk-adjusted NPV: $8.2M'
      ],
      savings: 'Avoided $1.5M in wrong tech choices',
      timeframe: '3 months planning → 2 weeks'
    }
  ];

  // Social Proof
  const testimonials = [
    {
      quote: "CAIO reduced our strategic planning cycle from 6 weeks to 5 days. The M4 financial module alone paid for itself in the first month.",
      name: "Sarah Chen",
      title: "CFO",
      company: "Vertex Ventures ($200M AUM)",
      avatar: "SC",
      metric: "6 weeks → 5 days"
    },
    {
      quote: "The Knowledge Graph found a similar strategy that failed - saved us $3M and 18 months. This is consulting-grade intelligence at SaaS pricing.",
      name: "Michael Rodriguez",
      title: "VP Corporate Development",
      company: "TechCorp (Series C)",
      avatar: "MR",
      metric: "$3M saved"
    },
    {
      quote: "Socratic Mode feels like talking to a McKinsey partner. It asks the right questions and adapts to my thinking style. Game-changer.",
      name: "Jennifer Park",
      title: "CEO",
      company: "FinTech Startup",
      avatar: "JP",
      metric: "88% confidence in decisions"
    }
  ];

  const plans = [
    {
      name: "Professional",
      price: "$99",
      period: "/mo",
      annualPrice: "$990",
      annualSavings: "Save $198/year",
      description: "For individual executives and consultants",
      priceIds: {
        monthly: "price_1SKD5a2MPzse1ZHQPEtdZGYR",
        annual: "price_1SKD5a2MPzse1ZHQ30D2IwYr"
      },
      features: [
        "Unlimited conversations with CAIO",
        "All 48+ Quick Actions",
        "TSI+ Methodology (9 modules)",
        "Strategic analysis reports",
        "Investment memos & frameworks",
        "ROI calculators",
        "Email support",
        "48-hour response time"
      ],
      cta: "Start 14-Day Free Trial",
      popular: false
    },
    {
      name: "Teams",
      price: "$299",
      period: "/mo",
      annualPrice: "$2,990",
      annualSavings: "Save $598/year",
      description: "For leadership teams (5+ seats included)",
      priceIds: {
        monthly: "price_1SKD702MPzse1ZHQovuVBsqL",
        annual: "price_1SKD702MPzse1ZHQnMvEARTU"
      },
      features: [
        "Everything in Professional",
        "5 seats included (+ $50/additional seat)",
        "Collaborative workspaces",
        "Knowledge Graph access",
        "BSI Monitoring (1 company)",
        "Mental Model Detection",
        "Shared knowledge base",
        "Team activity dashboard",
        "Priority support (24h response)",
        "Monthly strategy sessions",
        "Custom Quick Actions"
      ],
      cta: "Start 14-Day Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$2,797",
      period: "/mo",
      annualPrice: "$27,970",
      annualSavings: "Save $5,594/year",
      description: "For organizations requiring advanced customization",
      priceIds: null,
      features: [
        "Everything in Teams",
        "Unlimited seats",
        "Dedicated CAIO instance",
        "Custom AI training on your data",
        "White-label options",
        "SSO & advanced security",
        "Dedicated account manager",
        "24/7 priority support",
        "SLA guarantees",
        "On-premise deployment option",
        "BSI Monitoring (unlimited companies)",
        "Custom modules & frameworks"
      ],
      cta: "Schedule a Call",
      popular: false,
      isEnterprise: true
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png" 
                alt="CAIO·AI" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <div className="text-xl font-bold text-white">CAIO·AI</div>
                <div className="text-[10px] text-cyan-400 font-medium">powered by FRATOZ</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#methodology" className="text-slate-200 hover:text-white transition-colors font-medium">Methodology</a>
              <a href="#capabilities" className="text-slate-200 hover:text-white transition-colors font-medium">Capabilities</a>
              <a href="#use-cases" className="text-slate-200 hover:text-white transition-colors font-medium">Use Cases</a>
              <a href="#pricing" className="text-slate-200 hover:text-white transition-colors font-medium">Pricing</a>
              {isAuthenticated ? (
                <Button
                  onClick={() => navigate(createPageUrl("Dashboard"))}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/30"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/30"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - UPGRADED */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE2aDh2OGgtOHpNMjAgMzJoOHY4aC04ek0wIDQ4aDh2OGgtOHpNMTYgMGg4djhoLTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-200 text-sm font-medium mb-8 shadow-lg">
              <Award className="w-4 h-4" />
              Powered by TSI v6.0+ Strategic Intelligence Methodology
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Raising the bar on<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-yellow-400 bg-clip-text text-transparent">
                Strategic Dialogue
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-4xl mx-auto leading-relaxed">
              ESIOS CAIO·AI — your <span className="text-cyan-400 font-semibold">unwavering executive peer</span>.
              <br className="hidden md:block" />
              Multi-agent orchestration, behavioral intelligence, and strategic frameworks that evolve with you.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-6 text-lg shadow-xl shadow-blue-500/30"
              >
                Start 14-Day Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 font-semibold px-8 py-6 text-lg backdrop-blur-sm transition-all duration-300 shadow-xl"
              >
                <Play className="w-5 h-5 mr-2" />
                See How It Works
              </Button>
            </div>

            {/* Stats Bar - Enhanced */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Layers, label: '9 Analytical Modules', value: 'TSI v6.0+', color: 'blue' },
                { icon: Network, label: 'Strategic Connections', value: '10K+', color: 'purple' },
                { icon: Zap, label: 'Faster than Consultants', value: '95%', color: 'green' },
                { icon: DollarSign, label: 'Avg. Annual Savings', value: '$180K', color: 'orange' }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                      <CardContent className="p-4 text-center">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 bg-opacity-20 flex items-center justify-center mx-auto mb-2`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* TSI Methodology Showcase - NEW */}
      <section id="methodology" className="py-20 md:py-32 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4">
              🎯 TSI v6.0+ Methodology
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              9-Module Strategic Intelligence System
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Unlike ChatGPT or Claude, CAIO uses a proprietary <span className="text-blue-400 font-semibold">9-module analytical framework</span> designed for strategic decision-making
            </p>
          </div>

          {/* Interactive Module Showcase */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {tsiModules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <motion.div
                  key={module.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveModule(module.id)}
                  className="cursor-pointer"
                >
                  <Card className={`transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/50 shadow-xl shadow-blue-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${module.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-white/10 text-white text-xs">{module.id}</Badge>
                            <h3 className="font-semibold text-white text-sm">{module.name}</h3>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {module.description}
                          </p>
                        </div>
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
                title: 'Complete Analysis',
                description: 'All 9 modules work together for comprehensive strategic intelligence',
                color: 'green'
              },
              {
                icon: Zap,
                title: 'Modular Expert Mode',
                description: 'Execute isolated deep-dives (M1-M9) in 5-7 minutes for technical specialists',
                color: 'yellow'
              },
              {
                icon: Target,
                title: 'Depth-Level Architecture',
                description: 'Strategic (CEO) → Operational (VP) → Tactical (Manager) → Individual outputs',
                color: 'purple'
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
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl bg-${benefit.color}-500/20 flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 text-${benefit.color}-400`} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Capabilities - NEW */}
      <section id="capabilities" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">
              🚀 Advanced Capabilities
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Beyond Basic AI Chat
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              6 unique capabilities that set CAIO apart from ChatGPT, Claude, and traditional consultants
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
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{capability.title}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4">
                        {capability.description}
                      </p>
                      <div className="pt-4 border-t border-white/10">
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">
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

      {/* Comparison Table - NEW */}
      <section className="py-20 md:py-32 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-4">
              📊 Feature Comparison
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              CAIO vs ChatGPT vs Claude vs Consultants
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              See how CAIO combines the best of AI speed with consulting-grade methodology
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-4 text-slate-400 font-semibold">Feature</th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-2">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white font-semibold">CAIO</span>
                    </div>
                  </th>
                  <th className="p-4 text-center text-slate-400">ChatGPT</th>
                  <th className="p-4 text-center text-slate-400">Claude</th>
                  <th className="p-4 text-center text-slate-400">Consultants</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={i} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-slate-300 font-medium">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.caio === 'boolean' ? (
                        row.caio ? (
                          <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-red-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-white font-semibold">{row.caio}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.chatgpt === 'boolean' ? (
                        row.chatgpt ? (
                          <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400">{row.chatgpt}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.claude === 'boolean' ? (
                        row.claude ? (
                          <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400">{row.claude}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.consultants === 'boolean' ? (
                        row.consultants ? (
                          <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400">{row.consultants}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-300 mb-6">
              <span className="text-blue-400 font-semibold">McKinsey-grade methodology</span> +
              <span className="text-purple-400 font-semibold"> AI speed</span> +
              <span className="text-green-400 font-semibold"> SaaS pricing</span>
            </p>
            <Button
              size="lg"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Detailed Use Cases - ENHANCED */}
      <section id="use-cases" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mb-4">
              💼 Real-World Results
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How Leaders Use CAIO
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Real use cases with measurable ROI and time savings
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
                      {/* Left: Title + Role */}
                      <div className="md:col-span-2">
                        <Badge className="bg-blue-500/20 text-blue-400 mb-3">{useCase.role}</Badge>
                        <h3 className="text-2xl font-bold text-white mb-4">{useCase.title}</h3>

                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Challenge</p>
                            <p className="text-slate-300 text-sm">{useCase.challenge}</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">CAIO Solution</p>
                            <p className="text-slate-300 text-sm">{useCase.solution}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Results */}
                      <div className="md:col-span-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Results</p>
                        <div className="grid gap-3 mb-6">
                          {useCase.results.map((result, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-200 text-sm">{result}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                            <p className="text-xs text-green-300 mb-1">Cost Savings</p>
                            <p className="text-xl font-bold text-white">{useCase.savings}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                            <p className="text-xs text-blue-300 mb-1">Time Saved</p>
                            <p className="text-xl font-bold text-white">{useCase.timeframe}</p>
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

      {/* Social Proof - ENHANCED */}
      <section className="py-20 md:py-32 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-4">
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
                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-slate-200 mb-6 italic leading-relaxed">
                      "{testimonial.quote}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{testimonial.name}</div>
                        <div className="text-sm text-slate-400">{testimonial.title}</div>
                        <div className="text-xs text-slate-500">{testimonial.company}</div>
                      </div>
                    </div>

                    {/* Metric Badge */}
                    <div className="mt-4">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
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

      {/* ROI Calculator - keep existing */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Calculate Your Savings
            </h2>
            <p className="text-xl text-slate-300">
              See how much CAIO can save your team annually
            </p>
          </div>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8">
              <div className="space-y-6 mb-8">
                <div>
                  <label className="text-sm text-slate-200 mb-2 block font-medium">Team Size (executives/analysts)</label>
                  <Input
                    type="number"
                    value={roiInputs.teamSize}
                    onChange={(e) => setRoiInputs({...roiInputs, teamSize: parseInt(e.target.value) || 0})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-200 mb-2 block font-medium">Average Annual Salary ($)</label>
                  <Input
                    type="number"
                    value={roiInputs.avgSalary}
                    onChange={(e) => setRoiInputs({...roiInputs, avgSalary: parseInt(e.target.value) || 0})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-200 mb-2 block font-medium">Hours/Week on Strategic Analysis</label>
                  <Input
                    type="number"
                    value={roiInputs.hoursPerWeek}
                    onChange={(e) => setRoiInputs({...roiInputs, hoursPerWeek: parseInt(e.target.value) || 0})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="border-t border-white/20 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-200 font-medium">Current Annual Waste:</span>
                  <span className="text-2xl font-bold text-red-400">
                    ${Math.round(calculateROI() / 0.7).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-200 font-medium">Potential Annual Savings with CAIO:</span>
                  <span className="text-4xl font-bold text-green-400">
                    ${calculateROI().toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-slate-300 text-center mb-6 bg-white/5 p-3 rounded-lg">
                  Based on 70% time savings on strategic analysis tasks
                </div>
                <Button
                  size="lg"
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg font-semibold shadow-xl shadow-blue-500/30"
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
      <section id="pricing" className="py-20 md:py-32 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-8">
              14-day free trial. No credit card required. Cancel anytime.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-200 text-sm font-medium shadow-lg">
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
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent">
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
              Join 500+ organizations using CAIO·AI to make faster, smarter decisions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-6 text-lg shadow-xl shadow-blue-500/30"
              >
                Start 14-Day Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 font-semibold px-8 py-6 text-lg shadow-xl"
              >
                Book a Demo
              </Button>
            </div>
            <p className="text-sm text-slate-300 mt-6 font-medium">
              No credit card required · 30-day money-back guarantee · Cancel anytime
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
                Your Virtual Chief AI Officer, Always On
              </p>
              <Badge className="mt-4 bg-blue-500/20 text-blue-400 text-xs">
                TSI v6.0+ Methodology
              </Badge>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#methodology" className="hover:text-white transition-colors">TSI Methodology</a></li>
                <li><a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a></li>
                <li><a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-slate-400">
            © 2025 CAIO·AI Platform. All rights reserved. | Powered by TSI v6.0+ Strategic Intelligence Methodology
          </div>
        </div>
      </footer>
    </div>
  );
}