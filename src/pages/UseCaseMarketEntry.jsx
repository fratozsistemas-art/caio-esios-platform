import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Globe, Target, TrendingUp, Map } from "lucide-react";
import { motion } from "framer-motion";
import AccessRequestForm from "../components/landing/AccessRequestForm";

export default function UseCaseMarketEntry() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.title = "Market Entry Strategy AI | CAIO·AI Strategic Intelligence Platform";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'AI-powered market entry strategy platform. Deploy M1 Market Intelligence and M2 Competitive Intelligence to analyze TAM/SAM/SOM, regulatory landscapes, and competitive dynamics with GO/NO-GO recommendations.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'AI-powered market entry strategy platform. Deploy M1 Market Intelligence and M2 Competitive Intelligence to analyze TAM/SAM/SOM, regulatory landscapes, and competitive dynamics with GO/NO-GO recommendations.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410]">
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

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40 mb-6">
            Market Entry Use Case
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Market Entry Strategy AI Platform
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Deploy <span className="text-[#00D4FF] font-semibold">M1 (Market Intelligence)</span> and <span className="text-[#00D4FF] font-semibold">M2 (Competitive Intelligence)</span> to analyze TAM/SAM/SOM, regulatory landscapes, and competitive dynamics. CAIO·AI's <span className="text-[#00D4FF] font-semibold">strategic analysis framework</span> provides GO/NO-GO recommendations with confidence scoring for market entry decisions.
          </p>
          <AccessRequestForm 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                Start Market Entry Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
          />
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Market Entry Framework</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#FFB800]/20 flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-[#00D4FF]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">M1: Market Intelligence</h3>
                <ul className="space-y-3">
                  {[
                    "TAM/SAM/SOM calculation with bottom-up validation",
                    "Macro trend analysis (economic, demographic, technological)",
                    "Regulatory context mapping and compliance requirements",
                    "Demand dynamics forecasting with seasonality",
                    "Market maturity assessment and growth projections"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFB800]/20 to-[#00D4FF]/20 flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-[#FFB800]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">M2: Competitive Intelligence</h3>
                <ul className="space-y-3">
                  {[
                    "Porter's 5 Forces analysis for industry structure",
                    "Competitive positioning matrix and market share",
                    "Entry barrier assessment (capital, regulatory, brand)",
                    "Incumbent response scenarios and defensive strategies",
                    "White space identification and differentiation opportunities"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Real Market Entry Results</h2>
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
            <CardContent className="p-8">
              <Badge className="bg-cyan-500/20 text-cyan-300 mb-4">SaaS Company - Latin America Expansion</Badge>
              <h3 className="text-2xl font-bold text-white mb-6">Mexico & Brazil Market Entry Assessment</h3>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30">
                  <p className="text-sm text-[#00D4FF] mb-1">Analysis Time</p>
                  <p className="text-3xl font-bold text-white">2 days</p>
                  <p className="text-xs text-slate-400">vs 6 weeks traditional</p>
                </div>
                <div className="p-4 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/30">
                  <p className="text-sm text-[#FFB800] mb-1">TAM Identified</p>
                  <p className="text-3xl font-bold text-white">$240M</p>
                  <p className="text-xs text-slate-400">Combined markets</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-sm text-emerald-400 mb-1">Confidence Score</p>
                  <p className="text-3xl font-bold text-white">87%</p>
                  <p className="text-xs text-slate-400">GO recommendation</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "M1 revealed Brazil TAM 3x larger than initial estimates",
                  "M2 identified white space in mid-market segment",
                  "Regulatory analysis uncovered data localization requirements",
                  "Entry strategy prioritized Brazil → Mexico based on defensibility",
                  "Launched Brazil with $2M ARR in first 6 months"
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

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Accelerate Your Market Entry Strategy
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Make confident expansion decisions with AI-powered market intelligence and competitive analysis.
          </p>
          <AccessRequestForm 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                Request Market Entry Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
          />
        </div>
      </section>
    </div>
  );
}