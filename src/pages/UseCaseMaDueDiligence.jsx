import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, TrendingUp, DollarSign, Clock, Target, Shield } from "lucide-react";
import { motion } from "framer-motion";
import AccessRequestForm from "../components/landing/AccessRequestForm";

export default function UseCaseMaDueDiligence() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.title = "M&A Due Diligence AI Platform | CAIO·AI Strategic Intelligence";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'AI-powered M&A due diligence platform. Evaluate acquisition targets 80% faster with financial modeling, tech stack analysis, and competitive positioning. TSI v9.3 methodology.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'AI-powered M&A due diligence platform. Evaluate acquisition targets 80% faster with financial modeling, tech stack analysis, and competitive positioning. TSI v9.3 methodology.';
      document.head.appendChild(meta);
    }

    // Schema
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Conduct M&A Due Diligence with CAIO·AI",
      "description": "Complete guide to AI-powered M&A due diligence using strategic intelligence platform",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Input Target Company Information",
          "text": "Enter target company details, industry, and deal parameters into CAIO·AI platform"
        },
        {
          "@type": "HowToStep",
          "name": "Run Financial Analysis",
          "text": "Execute M4 (Financial Modeling) module for DCF analysis, valuation multiples, and risk-adjusted NPV"
        },
        {
          "@type": "HowToStep",
          "name": "Technology Assessment",
          "text": "Deploy M3 (Technology Intelligence) to analyze tech stack, identify technical debt, and assess scalability"
        },
        {
          "@type": "HowToStep",
          "name": "Market & Competitive Analysis",
          "text": "Use M1 (Market Intelligence) and M2 (Competitive Intelligence) for TAM/SAM/SOM and competitive positioning"
        },
        {
          "@type": "HowToStep",
          "name": "Strategic Synthesis",
          "text": "M5 (Strategic Synthesis) delivers GO/NO-GO recommendation with confidence scoring"
        }
      ]
    });
    document.head.appendChild(schemaScript);

    return () => {
      if (schemaScript.parentNode) schemaScript.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0A1628]/95 backdrop-blur-xl border-b border-[#00D4FF]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(createPageUrl("Landing"))}>
              <img 
                src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png" 
                alt="CAIO·AI Logo" 
                className="w-10 h-10 object-contain"
              />
              <div className="text-xl font-bold text-white">CAIO·AI</div>
            </div>
            <Button onClick={() => navigate(createPageUrl("Landing"))} variant="outline" className="border-[#00D4FF]/40 text-[#00D4FF]">
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40 mb-6">
            M&A Use Case
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            M&A Due Diligence AI Platform
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Evaluate acquisition targets <span className="text-[#00D4FF] font-semibold">80% faster</span> with comprehensive <span className="text-[#00D4FF] font-semibold">financial modeling</span>, tech stack analysis, and competitive positioning. CAIO·AI's <span className="text-[#00D4FF] font-semibold">strategic intelligence platform</span> combines Module M4 (Financial Modeling), M3 (Technology), and M2 (Competitive Intelligence) to identify hidden risks like technical debt and calculate risk-adjusted NPV across scenarios.
          </p>
          <AccessRequestForm 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                Start M&A Due Diligence Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
          />
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-6 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">The M&A Due Diligence Challenge</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Traditional due diligence takes 4-8 weeks per target",
              "Financial models built manually with high error rates",
              "Technology assessment requires expensive external consultants",
              "Competitive analysis often superficial or outdated",
              "Integration risks discovered post-acquisition",
              "Limited scenario modeling capabilities"
            ].map((problem, i) => (
              <Card key={i} className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <p className="text-slate-200">{problem}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CAIO Solution */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">How CAIO·AI Transforms M&A Due Diligence</h2>
          <p className="text-lg text-slate-300 mb-8">
            Our <span className="text-[#00D4FF] font-semibold">AI-powered M&A due diligence platform</span> deploys 5 specialized TSI modules simultaneously, delivering institutional-grade analysis in hours instead of weeks.
          </p>

          <div className="space-y-6">
            {[
              {
                module: "M1: Market Intelligence",
                icon: Target,
                description: "TAM/SAM/SOM analysis, market trends, regulatory landscape assessment. Validates market opportunity and identifies headwinds.",
                time: "45 minutes"
              },
              {
                module: "M2: Competitive Intelligence",
                icon: TrendingUp,
                description: "Porter's 5 Forces, competitive positioning matrix, market share analysis. Maps competitive dynamics and defensibility.",
                time: "35 minutes"
              },
              {
                module: "M3: Technology Intelligence",
                icon: Shield,
                description: "Tech stack analysis, technical debt assessment, scalability evaluation. Identifies hidden integration costs.",
                time: "50 minutes"
              },
              {
                module: "M4: Financial Modeling",
                icon: DollarSign,
                description: "DCF analysis, valuation multiples, risk-adjusted NPV across 5 scenarios. Monte Carlo simulation for confidence intervals.",
                time: "60 minutes"
              },
              {
                module: "M5: Strategic Synthesis",
                icon: CheckCircle,
                description: "GO/NO-GO recommendation with confidence scoring. Integration roadmap and risk mitigation strategies.",
                time: "40 minutes"
              }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#FFB800]/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-[#00D4FF]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-white">{item.module}</h3>
                            <Badge className="bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40">
                              <Clock className="w-3 h-3 mr-1" />
                              {item.time}
                            </Badge>
                          </div>
                          <p className="text-slate-300">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Card className="bg-gradient-to-br from-[#00D4FF]/20 to-[#FFB800]/20 border-[#00D4FF]/40 mt-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">Total Analysis Time</h3>
              </div>
              <p className="text-2xl font-bold text-white mb-2">3.5 hours vs 4-8 weeks</p>
              <p className="text-slate-300">Complete institutional-grade M&A due diligence delivered same-day</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Real Results */}
      <section className="py-16 px-6 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">M&A Due Diligence Results</h2>
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
            <CardContent className="p-8">
              <Badge className="bg-cyan-500/20 text-cyan-300 mb-4">Private Equity Firm</Badge>
              <h3 className="text-2xl font-bold text-white mb-4">SaaS Platform Acquisition - $45M Deal</h3>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30">
                  <p className="text-sm text-[#00D4FF] mb-1">Time Saved</p>
                  <p className="text-3xl font-bold text-white">87%</p>
                  <p className="text-xs text-slate-400">6 weeks → 4 days</p>
                </div>
                <div className="p-4 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/30">
                  <p className="text-sm text-[#FFB800] mb-1">Cost Savings</p>
                  <p className="text-3xl font-bold text-white">$180K</p>
                  <p className="text-xs text-slate-400">vs external consultants</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-sm text-emerald-400 mb-1">Hidden Risks Found</p>
                  <p className="text-3xl font-bold text-white">3</p>
                  <p className="text-xs text-slate-400">Technical debt issues</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "M3 identified $2.3M in undisclosed technical debt",
                  "M4 revealed 15% valuation overstatement in seller model",
                  "M2 discovered emerging competitor with superior technology",
                  "Deal renegotiated saving $4.5M on purchase price"
                ].map((result, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-200">{result}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Transform Your M&A Due Diligence Process
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join private equity firms and corporate development teams using CAIO·AI for faster, deeper M&A analysis.
          </p>
          <AccessRequestForm 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                Request M&A Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
          />
        </div>
      </section>
    </div>
  );
}