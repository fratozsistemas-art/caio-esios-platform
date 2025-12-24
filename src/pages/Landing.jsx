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
  X,
  Mail,
  Target,
  DollarSign,
  Play,
  Network,
  Layers,
  Star,
  AlertCircle,
  Sparkles,
  Menu
} from "lucide-react";
import { CheckCircleIcon } from "../components/utils/icons";
import { motion } from "framer-motion";
import AccessRequestForm from "../components/landing/AccessRequestForm";
import AuthoritySpectrum from "../components/landing/AuthoritySpectrum";
import PreHomeAnimation from "../components/landing/PreHomeAnimation";
import PricingSection from "../components/landing/PricingSection";
import InteractiveDemo from "../components/landing/InteractiveDemo";
import AccessibilityEnhancer from "../components/AccessibilityEnhancer";
import ThemeToggle from "../components/theme/ThemeToggle";
import ScrollProgress from "../components/landing/ScrollProgress";
import {
  tsiModules,
  advancedCapabilities,
  comparisonFeatures,
  detailedUseCases,
  testimonials
} from "../components/landing";

export default function Landing() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreHome, setShowPreHome] = useState(false);

  const [activeModule, setActiveModule] = useState("M5");
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // SEO Meta Tags
  useEffect(() => {
    // Auto-skip intro for search engine crawlers
    if (/bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent)) {
      setShowPreHome(false);
      sessionStorage.setItem('caio_prehome_seen', 'true');
    }

    // Set page language
    document.documentElement.lang = 'en';

    // Set document title
    document.title = "CAIO·AI - Executive Strategic Intelligence Platform | TSI v9.3 Enterprise AI";
    
    // Meta description (optimized to 158 characters)
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Executive AI platform with 11 cognitive modules for strategic decisions. TSI v9.3 methodology transforms planning from weeks to hours. Trusted by Fortune 500.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Executive AI platform with 11 cognitive modules for strategic decisions. TSI v9.3 methodology transforms planning from weeks to hours. Trusted by Fortune 500.';
      document.head.appendChild(meta);
    }

    // Keywords (optimized with long-tail and LSI keywords)
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      metaKeywords.content = 'strategic intelligence platform, executive AI platform, AI decision making, TSI methodology, cognitive modules, enterprise strategic intelligence, Chief AI Officer platform, strategic planning software, competitive intelligence automation, financial modeling platform, M&A due diligence AI, market intelligence tools, executive decision support system, strategic analysis AI, business intelligence AI platform, AI strategic planning tool, C-suite AI tools, strategic portfolio management, AI powered strategic analysis, executive advisory AI';
      document.head.appendChild(metaKeywords);
    }

    // Open Graph tags (optimized)
    const ogTags = {
      'og:title': 'CAIO·AI - Executive Strategic Intelligence Platform | TSI v9.3',
      'og:description': 'Transform executive decision-making with 11-module AI platform. Market intelligence, financial modeling, and strategic execution in one system. Trusted by Fortune 500.',
      'og:type': 'website',
      'og:url': window.location.href,
      'og:image': 'https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png',
      'og:site_name': 'CAIO·AI Platform',
      'og:locale': 'en_US'
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

    // Twitter Card tags (optimized)
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': 'CAIO·AI - Executive Strategic Intelligence Platform | TSI v9.3',
      'twitter:description': '11-module AI platform for strategic decisions. Market intelligence, competitive analysis, financial modeling. Transform strategy from weeks to hours.',
      'twitter:image': 'https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png',
      'twitter:site': '@CAIOAI',
      'twitter:creator': '@CAIOAI'
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

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;

    // Favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png';

    // Enhanced Schema.org JSON-LD (Organization + SoftwareApplication + FAQPage)
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "name": "FRATOZ",
          "url": window.location.origin,
          "logo": "https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png",
          "sameAs": [
            "https://www.linkedin.com/company/caioai"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Sales",
            "email": "contato@caiovision.com.br"
          }
        },
        {
          "@type": "SoftwareApplication",
          "name": "CAIO·AI Platform",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web-based",
          "offers": {
            "@type": "AggregateOffer",
            "lowPrice": "299",
            "highPrice": "899",
            "priceCurrency": "USD",
            "offerCount": "3",
            "priceSpecification": [
              {
                "@type": "UnitPriceSpecification",
                "price": "299",
                "priceCurrency": "USD",
                "name": "Professional Plan",
                "billingIncrement": "monthly"
              },
              {
                "@type": "UnitPriceSpecification",
                "price": "599",
                "priceCurrency": "USD",
                "name": "Teams Plan",
                "billingIncrement": "monthly"
              },
              {
                "@type": "UnitPriceSpecification",
                "price": "899",
                "priceCurrency": "USD",
                "name": "Enterprise Plan",
                "billingIncrement": "monthly"
              }
            ]
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127",
            "bestRating": "5",
            "worstRating": "1"
          },
          "description": "Executive Strategic Intelligence Platform with 11 cognitive modules for strategic decision-making, financial modeling, market intelligence, and competitive analysis. Built on TSI v9.3 methodology.",
          "featureList": [
            "TSI v9.3 Methodology with 11 Cognitive Modules",
            "Market Intelligence (M1)",
            "Competitive Intelligence (M2)",
            "Technology Intelligence (M3)",
            "Financial Modeling (M4)",
            "Strategic Synthesis (M5)",
            "Opportunity Matrix (M6)",
            "Implementation Planning (M7)",
            "Reframing Loop (M8)",
            "Funding Intelligence (M9)",
            "Hermes Trust-Broker Governance",
            "Interactive Knowledge Graph with 10K+ connections",
            "AI-Powered Strategic Pathfinding",
            "Multi-Agent Orchestration",
            "Save & Share Graph Views",
            "Intelligent Node Clustering",
            "Vector Decision Engine for Strategic Vectors",
            "Behavioral Intelligence with Archetype Library"
          ],
          "image": "https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png",
          "provider": {
            "@type": "Organization",
            "name": "FRATOZ",
            "url": window.location.origin
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How fast can CAIO·AI complete strategic analysis?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "CAIO·AI completes comprehensive strategic analysis 95% faster than traditional methods, reducing analysis time from weeks to hours. Each of the 11 cognitive modules can be executed in 5-7 minutes, delivering consulting-grade insights at AI speed."
              }
            },
            {
              "@type": "Question",
              "name": "What is TSI v9.3 methodology?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "TSI v9.3 (Total Strategic Intelligence) is a proprietary methodology with 11 integrated cognitive modules covering market intelligence, competitive analysis, technology assessment, financial modeling, strategic synthesis, opportunity identification, implementation planning, and cognitive governance."
              }
            },
            {
              "@type": "Question",
              "name": "How is CAIO·AI different from ChatGPT or other AI tools?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "CAIO·AI is built specifically for executive strategic intelligence with 11 specialized modules, institutional-grade governance via Hermes Trust-Broker, knowledge graph with 10K+ connections, and decision traceability. It operates as an 'Unwavering Peer' rather than a subordinate tool."
              }
            }
          ]
        }
      ]
    });
    
    // Remove existing schema if present
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
    }

    // Check if user has seen pre-home animation or chosen to skip
    const hasSeenPreHome = sessionStorage.getItem('caio_prehome_seen');
    const skipIntro = localStorage.getItem('caio_skip_intro');
    if (!hasSeenPreHome && skipIntro !== 'true') {
      setShowPreHome(true);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Keyboard shortcuts
    const handleKeyboard = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyboard);

    return () => window.removeEventListener('keydown', handleKeyboard);
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
    <div className="min-h-screen" style={{ background: "radial-gradient(circle at center, #0A1628 0%, #0d2847 40%, #1a2744 70%, #243352 100%)" }}>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <ScrollProgress />
      <AccessibilityEnhancer />
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
                <h3 className="text-white font-semibold mb-1">Unauthorized Access</h3>
                <p className="text-sm text-slate-300 mb-3">
                  Your email is not pre-registered in the system. Request access through the form below.
                </p>
                <div className="flex gap-2">
                  <AccessRequestForm 
                    trigger={
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        Request Access
                      </Button>
                    }
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowUnauthorizedAlert(false)}
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0A1628]/95 backdrop-blur-xl border-b border-[#00D4FF]/20" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png" 
                alt="CAIO·AI Logo - Executive Strategic Intelligence Platform with TSI v9.3 Methodology" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                width="48"
                height="48"
                loading="eager"
              />
              <div className="text-lg sm:text-xl font-bold text-white" style={{ letterSpacing: '0.05em' }}>
                CAIO·AI
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <a href="#methodology" className="text-slate-300 hover:text-[#00D4FF] transition-all duration-300 font-medium text-sm relative group">
                Methodology
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00D4FF] transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#capabilities" className="text-slate-300 hover:text-[#00D4FF] transition-all duration-300 font-medium text-sm relative group">
                Capabilities
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00D4FF] transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#use-cases" className="text-slate-300 hover:text-[#00D4FF] transition-all duration-300 font-medium text-sm relative group">
                Use Cases
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00D4FF] transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#pricing" className="text-slate-300 hover:text-[#00D4FF] transition-all duration-300 font-medium text-sm relative group">
                Pricing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00D4FF] transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#investors" className="text-slate-300 hover:text-[#FFB800] transition-all duration-300 font-medium text-sm relative group">
                Investors
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFB800] transition-all duration-300 group-hover:w-full" />
              </a>
              <a href={createPageUrl("Videos")} className="text-slate-300 hover:text-[#00D4FF] transition-all duration-300 font-medium text-sm relative group">
                Videos
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00D4FF] transition-all duration-300 group-hover:w-full" />
              </a>
              <a href={createPageUrl("BlogResources")} className="text-slate-300 hover:text-[#00D4FF] transition-all duration-300 font-medium text-sm relative group">
                Blog
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00D4FF] transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#about" className="text-slate-300 hover:text-[#00D4FF] transition-all duration-300 font-medium text-sm relative group">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00D4FF] transition-all duration-300 group-hover:w-full" />
              </a>

              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                <ThemeToggle variant="ghost" />
                {isAuthenticated ? (
                  <Button
                    onClick={() => navigate(createPageUrl("Dashboard"))}
                    className="bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628] font-semibold text-sm px-4 py-2 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <AccessRequestForm 
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#00D4FF]/60 text-[#00D4FF] hover:bg-[#00D4FF]/10 hover:border-[#00D4FF] font-semibold text-sm transition-all duration-300"
                        >
                          Request Access
                        </Button>
                      }
                    />
                    <Button
                      onClick={handleLogin}
                      size="sm"
                      className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628] font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              {isAuthenticated ? (
                <Button
                  onClick={() => navigate(createPageUrl("Dashboard"))}
                  size="sm"
                  className="bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628] font-semibold text-xs px-3 py-1.5"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  onClick={handleLogin}
                  size="sm"
                  className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold text-xs px-3 py-1.5"
                >
                  Sign In
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:bg-white/10 p-2"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4"
            >
              <div className="flex flex-col gap-3">
                <a href="#methodology" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-[#00D4FF] transition-colors font-medium text-sm py-2">
                  Methodology
                </a>
                <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-[#00D4FF] transition-colors font-medium text-sm py-2">
                  Capabilities
                </a>
                <a href="#use-cases" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-[#00D4FF] transition-colors font-medium text-sm py-2">
                  Use Cases
                </a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-[#00D4FF] transition-colors font-medium text-sm py-2">
                  Pricing
                </a>
                <a href="#investors" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-[#FFB800] transition-colors font-medium text-sm py-2">
                  Investors
                </a>
                <a href={createPageUrl("BlogResources")} onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-[#00D4FF] transition-colors font-medium text-sm py-2">
                  Blog
                </a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-[#00D4FF] transition-colors font-medium text-sm py-2">
                  About
                </a>
                {!isAuthenticated && (
                  <div className="pt-3 mt-2 border-t border-white/10">
                    <AccessRequestForm 
                      trigger={
                        <Button
                          variant="outline"
                          className="w-full border-[#00D4FF]/60 text-[#00D4FF] hover:bg-[#00D4FF]/10 font-semibold text-sm"
                        >
                          Request Access
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content">
      <section className="relative overflow-hidden py-12 md:py-16" aria-label="Hero Section - Executive Strategic Intelligence" style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0A1628 60%, rgba(11, 15, 26, 0.3) 90%, rgba(11, 15, 26, 0) 100%)' }}>
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00C8FF]/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            {/* Main Headline - H1 with primary keyword */}
            <h1 className="text-4xl md:text-6xl font-bold text-[#EAF6FF] mb-4 leading-tight tracking-tight" style={{ fontFamily: '"Inter", sans-serif' }}>
              Executive Strategic Intelligence Platform<br />
              for Data-Driven Decisions
            </h1>
            
            {/* Subheadline - H2 */}
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-300 mb-1" style={{ fontFamily: '"Inter", sans-serif' }}>
              The Executive System for Intelligent Strategic Operations
            </h2>
            
            <p className="text-lg md:text-xl text-slate-300 mb-5 font-light" style={{ fontFamily: '"Inter", sans-serif' }}>
              Built on TSI v9.3 — 11 Cognitive Modules
            </p>

            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-[#00D4FF]/20 blur-3xl rounded-full" />
                <img 
                  src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png" 
                  alt="CAIO·AI Executive Strategic Intelligence Platform - TSI v9.3 with 11 Cognitive Modules for Market Intelligence, Competitive Analysis, and Financial Modeling" 
                  className="w-40 h-40 object-contain relative z-10"
                  width="160"
                  height="160"
                  loading="eager"
                />
              </div>
            </div>

            <p className="text-base md:text-lg text-slate-200 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
              CAIO·AI is the <span className="text-[#00D4FF] font-semibold">enterprise strategic intelligence platform</span> built for C-suite executives who demand consulting-grade analysis at software speed. Our proprietary <span className="text-[#00D4FF] font-semibold">TSI v9.3 methodology</span> deploys 11 specialized cognitive modules covering <span className="text-[#00D4FF] font-semibold">market intelligence</span>, <span className="text-[#00D4FF] font-semibold">competitive analysis</span>, <span className="text-[#00D4FF] font-semibold">financial modeling</span>, and <span className="text-[#00D4FF] font-semibold">strategic execution</span>—transforming decision-making processes that traditionally took weeks into hours.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
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
                className="border-2 border-[#00C8FF]/50 bg-transparent text-[#00C8FF] hover:bg-[#00C8FF]/10 font-semibold px-8 py-5 text-base backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
                style={{
                  boxShadow: '0 0 20px rgba(0, 200, 255, 0.2)'
                }}
              >
                <Play className="w-4 h-4 mr-2" />
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
                      <CardContent className="p-5 text-center">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
                          style={{ 
                            background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                            boxShadow: `0 0 20px ${stat.color}30`
                          }}
                        >
                          <Icon className="w-6 h-6" style={{ color: stat.color }} />
                        </div>
                        <div className="text-2xl font-bold text-[#EAF6FF] mb-1">
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
      <section className="py-16 relative" aria-labelledby="why-different">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-12">
            <h2 id="why-different" className="text-4xl md:text-5xl font-bold text-[#EAF6FF] mb-4">
              Why This Strategic Intelligence Platform Is Different
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
              Unlike generic <span className="text-[#00D4FF] font-semibold">AI platforms</span>, CAIO·AI is a <span className="text-[#00D4FF] font-semibold">strategic intelligence platform</span> built specifically for executive decision-making. Not another chatbot—<span className="text-[#00D4FF] font-semibold">cognitive infrastructure</span> for{" "}
              <span className="text-[#FFB800] font-semibold">modern organizations</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                title: "TSI v9.3 Strategic Analysis Framework",
                description: "11 integrated cognitive modules covering market intelligence, competitive intelligence, financial modeling, technology assessment, strategic execution, and cognitive governance—delivering institutional-grade strategic insights.",
                icon: Brain,
                color: "#00C8FF"
              },
              {
                title: "Human-AI Symbiosis for Strategic Decision-Making",
                description: "Executive AI platform architecture that amplifies strategic decisions without replacing executive judgment. Strategic decision support designed for C-suite leadership.",
                icon: Network,
                color: "#16A9FF"
              },
              {
                title: "Enterprise-Grade Strategic Intelligence",
                description: "Cognitive governance via Hermes Trust-Broker ensures decision traceability, AI governance, and full audit trails for board-level accountability.",
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

          {/* Separator */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00C8FF] to-[#FFC247] opacity-30" />
        </div>
      </section>

      {/* TSI Methodology Showcase */}
      <section
        id="methodology"
        className="py-32 bg-caio-graphite/20 backdrop-blur-sm border-y border-caio-blue/20"
        aria-labelledby="methodology-title"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="bg-[#00C8FF]/20 text-[#00C8FF] border-[#00C8FF]/40 mb-8 px-8 py-3 text-base font-semibold" style={{ boxShadow: '0 0 20px rgba(0, 200, 255, 0.3)' }}>
              TSI v9.3 · 11 Cognitive Modules
            </Badge>
            <h2 id="methodology-title" className="text-5xl md:text-6xl font-bold text-[#EAF6FF] mb-8">
              Institutional-Grade<br />Strategic Intelligence
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
              Unlike generic AI models, CAIO operates on a{" "}
              <span className="text-[#00D4FF] font-semibold">modular 11-block TSI strategic analysis framework</span>{" "}
              covering <span className="text-[#00D4FF] font-semibold">market intelligence</span>, <span className="text-[#00D4FF] font-semibold">competitive intelligence</span>, <span className="text-[#00D4FF] font-semibold">financial modeling</span>, technology assessment, strategic execution, and cognitive governance—delivering <span className="text-[#00D4FF] font-semibold">strategic decision support</span> at unprecedented speed.
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
                        {isFeatured && (
                          <Badge className="bg-[#FFC247]/20 text-[#FFC247] border-[#FFC247]/30 text-[10px]">
                            CORE
                          </Badge>
                        )}
                      </div>
                      <div className={`flex-1 ${isFeatured ? 'text-left' : 'text-center'}`}>
                        <h3 className={`font-bold text-[#EAF6FF] ${isFeatured ? 'text-xl' : 'text-sm'} mb-2 flex items-center ${isFeatured ? 'justify-start' : 'justify-center'} gap-2 flex-wrap`}>
                          <Badge className="bg-[#00C8FF]/20 text-[#00C8FF] border-[#00C8FF]/30 text-xs font-mono font-bold">
                            {module.id}
                          </Badge>
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
              const Icon = benefit.icon === CheckCircle ? CheckCircleIcon : benefit.icon;
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
      <section id="capabilities" className="py-20 md:py-32" aria-labelledby="capabilities-title">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40 mb-4">
              🚀 Advanced Capabilities
            </Badge>
            <h2 id="capabilities-title" className="text-4xl md:text-5xl font-bold text-white mb-4">
              Beyond Basic AI Chat
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              6 unique capabilities that differentiate CAIO from generic models and
              traditional consultancies.
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
              Strategic Intelligence Platform Comparison
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              <span className="text-[#00D4FF] font-semibold">Executive AI platform</span> speed combined with consulting-grade <span className="text-[#00D4FF] font-semibold">strategic analysis framework</span>, <span className="text-[#00D4FF] font-semibold">financial modeling</span>, and <span className="text-[#00D4FF] font-semibold">decision governance</span>.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-3 text-slate-400 font-semibold text-left">Strategic Intelligence Platform Feature</th>
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
                          <CheckCircleIcon className="w-5 h-5 text-emerald-300 mx-auto" />
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
                          <CheckCircleIcon className="w-5 h-5 text-emerald-300 mx-auto" />
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
                          <CheckCircleIcon className="w-5 h-5 text-emerald-300 mx-auto" />
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
                          <CheckCircleIcon className="w-5 h-5 text-emerald-300 mx-auto" />
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
                          <CheckCircleIcon className="w-5 h-5 text-emerald-300 mx-auto" />
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
              <span className="text-[#00D4FF] font-semibold">
                Consulting-level methodology
              </span>{" "}
              +
              <span className="text-[#00D4FF] font-semibold">
                {" "}
                AI speed
              </span>{" "}
              +
              <span className="text-[#FFB800] font-semibold">
                {" "}
                SaaS pricing
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
      <section id="use-cases" className="py-20 md:py-32" aria-labelledby="use-cases-title">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40 mb-4">
              💼 Real-World Results
            </Badge>
            <h2 id="use-cases-title" className="text-4xl md:text-5xl font-bold text-white mb-4">
              Strategic Intelligence Platform Use Cases
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Real-world results with <span className="text-[#00D4FF] font-semibold">M&A due diligence</span>, <span className="text-[#00D4FF] font-semibold">market entry strategy</span>, <span className="text-[#00D4FF] font-semibold">digital transformation planning</span>, and <span className="text-[#00D4FF] font-semibold">strategic planning</span>. Measurable ROI with <span className="text-[#00D4FF] font-semibold">AI-powered strategic analysis</span>.
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
                              <CheckCircleIcon className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
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

      {/* Investor Section */}
      <section id="investors" className="py-20 md:py-32 bg-gradient-to-br from-slate-900/50 via-[#0A1628] to-slate-900/50 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40 mb-4">
              📈 Investor Relations
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              For Investors & Strategic Partners
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              CAIO·AI operates at the intersection of <span className="text-[#00D4FF] font-semibold">Enterprise AI</span>, <span className="text-[#00D4FF] font-semibold">Strategic Intelligence</span>, and <span className="text-[#FFB800] font-semibold">Decision Automation</span> — a $47B market growing 35% annually.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                metric: "$47B",
                label: "Total Addressable Market",
                sublabel: "Enterprise AI + Strategic Intelligence",
                icon: TrendingUp
              },
              {
                metric: "35%",
                label: "Annual Market Growth",
                sublabel: "CAGR 2024-2030",
                icon: TrendingUp
              },
              {
                metric: "95%",
                label: "Cost Reduction vs. Consulting",
                sublabel: "Same quality, 20x faster",
                icon: DollarSign
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center p-8 hover:border-[#FFB800]/50 transition-all duration-300">
                  <item.icon className="w-8 h-8 text-[#FFB800] mx-auto mb-4" />
                  <p className="text-4xl font-bold text-white mb-2">{item.metric}</p>
                  <p className="text-slate-300 font-medium">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.sublabel}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-6">Investment Thesis</h3>
              <div className="space-y-4 flex-1">
                {[
                  {
                    title: "Proprietary Methodology",
                    description: "TSI v9.3 with 11 cognitive modules creates defensible IP and switching costs."
                  },
                  {
                    title: "Platform Network Effects",
                    description: "Knowledge Graph grows with usage, improving recommendations for all users."
                  },
                  {
                    title: "Land & Expand Model",
                    description: "Start with one C-level, expand across the entire executive suite."
                  },
                  {
                    title: "Vertical SaaS Margins",
                    description: "90%+ gross margins with enterprise-grade pricing power."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <CheckCircleIcon className="w-6 h-6 text-[#00D4FF] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold">{item.title}</p>
                      <p className="text-slate-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-6">Competitive Moat</h3>
              <div className="space-y-4 flex-1">
                {[
                  {
                    title: "vs. Generic AI (ChatGPT, Claude)",
                    advantage: "Domain-specific methodology, governance, and decision traceability"
                  },
                  {
                    title: "vs. Traditional Consulting",
                    advantage: "95% cost reduction, 20x speed, always-on availability"
                  },
                  {
                    title: "vs. BI Tools (Tableau, PowerBI)",
                    advantage: "Prescriptive intelligence, not just descriptive analytics"
                  },
                  {
                    title: "vs. Point Solutions",
                    advantage: "Integrated 11-module platform vs. fragmented tools"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-r from-[#FFB800]/10 to-transparent rounded-lg border border-[#FFB800]/20">
                    <p className="text-[#FFB800] font-semibold text-sm mb-1">{item.title}</p>
                    <p className="text-white">{item.advantage}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <AccessRequestForm 
                  trigger={
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-[#FFB800] to-[#FF9500] hover:from-[#FFC520] hover:to-[#FFB800] text-[#0A1628] font-semibold"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Schedule Investor Call
                    </Button>
                  }
                />
                <p className="text-center text-sm text-slate-500 mt-3">
                  For qualified investors and strategic partners
                </p>
              </div>
            </div>
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
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Join Fortune 500 organizations using this <span className="text-[#00D4FF] font-semibold">strategic intelligence platform</span> to make faster, data-driven strategic decisions with <span className="text-[#00D4FF] font-semibold">market intelligence</span>, <span className="text-[#00D4FF] font-semibold">competitive analysis</span>, and <span className="text-[#00D4FF] font-semibold">financial modeling</span> capabilities.
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
                    Request Access
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
            <p className="text-sm text-slate-200 mt-6 font-medium">
              Restricted access · Contact us to request a demo
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Demo Modal */}
      <InteractiveDemo open={showDemo} onClose={() => setShowDemo(false)} />
      </main>

      {/* Footer */}
      <footer className="border-t border-caio-blue/20 py-16 bg-[#0A1628] backdrop-blur-sm" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png" 
                  alt="CAIO·AI - Executive Strategic Intelligence Platform" 
                  className="w-10 h-10 object-contain opacity-80"
                  width="40"
                  height="40"
                  loading="lazy"
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
              <h4 className="text-white font-body font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm font-body">
                <li>
                  <a
                    href="#methodology"
                    className="text-slate-200 hover:text-[#FFB800] transition-colors"
                  >
                    TSI Methodology
                  </a>
                </li>
                <li>
                  <a
                    href="#capabilities"
                    className="text-slate-200 hover:text-[#FFB800] transition-colors"
                  >
                    Capabilities
                  </a>
                </li>
                <li>
                  <a
                    href="#use-cases"
                    className="text-slate-200 hover:text-[#FFB800] transition-colors"
                  >
                    Use Cases
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-slate-200 hover:text-[#FFB800] transition-colors"
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
                  <a href={createPageUrl("MissionVision")} className="text-slate-200 hover:text-[#FFB800] transition-colors">
                    Missão & Visão
                  </a>
                </li>
                <li>
                  <a href={createPageUrl("FounderProfile")} className="text-slate-200 hover:text-[#FFB800] transition-colors">
                    Founder
                  </a>
                </li>
                <li>
                  <a href={createPageUrl("BlogResources")} className="text-slate-200 hover:text-[#FFB800] transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-200 hover:text-[#FFB800] transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-200 hover:text-[#FFB800] transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
              </div>
              <div>
              <h4 className="text-white font-body font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm font-body">
                <li>
                  <a href="#" className="text-slate-200 hover:text-[#FFB800] transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-200 hover:text-[#FFB800] transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-200 hover:text-[#FFB800] transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-caio-blue/10 pt-8">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-caio-blue to-caio-gold mb-8" />
            <p className="text-center text-sm font-body text-slate-400">
              © 2025 CAIO·AI Platform. All rights reserved. | Powered by TSI v9.3 Strategic Intelligence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}