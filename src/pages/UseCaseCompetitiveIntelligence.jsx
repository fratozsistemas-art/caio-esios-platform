import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, TrendingUp, Eye, Shield } from "lucide-react";
import AccessRequestForm from "../components/landing/AccessRequestForm";

export default function UseCaseCompetitiveIntelligence() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.title = "Competitive Intelligence Platform | CAIO·AI Strategic Intelligence";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'AI-powered competitive intelligence platform. M2 module delivers Porter\'s 5 Forces analysis, competitive positioning matrix, market share analysis, and real-time competitor monitoring.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'AI-powered competitive intelligence platform. M2 module delivers Porter\'s 5 Forces analysis, competitive positioning matrix, market share analysis, and real-time competitor monitoring.';
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
            Competitive Intelligence Use Case
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Competitive Intelligence Platform
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            <span className="text-[#00D4FF] font-semibold">AI-powered competitive intelligence platform</span> with M2 module delivering Porter's 5 Forces analysis, competitive positioning matrix, market share analysis, and continuous competitor monitoring. Transform competitive analysis from quarterly reports to real-time <span className="text-[#00D4FF] font-semibold">strategic intelligence</span>.
          </p>
          <AccessRequestForm 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                Start Competitive Intelligence
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
          />
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">M2: Competitive Intelligence Module</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#FFB800]/20 flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-[#00D4FF]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Competitive Positioning</h3>
                <ul className="space-y-3">
                  {[
                    "Porter's 5 Forces industry structure analysis",
                    "Competitive positioning matrix (price × features)",
                    "Market share estimation and trend analysis",
                    "SWOT analysis for top 5 competitors",
                    "Competitive moat assessment and defensibility"
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
                  <Eye className="w-7 h-7 text-[#FFB800]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Real-Time Monitoring</h3>
                <ul className="space-y-3">
                  {[
                    "Product launch tracking and feature parity analysis",
                    "Pricing changes and promotional activity detection",
                    "Funding announcements and M&A activity monitoring",
                    "Hiring patterns and executive movements",
                    "Customer review sentiment analysis"
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
          <h2 className="text-3xl font-bold text-white mb-6">Competitive Intelligence Results</h2>
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
            <CardContent className="p-8">
              <Badge className="bg-cyan-500/20 text-cyan-300 mb-4">B2B SaaS - Series C</Badge>
              <h3 className="text-2xl font-bold text-white mb-6">Competitive Repositioning Strategy</h3>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30">
                  <p className="text-sm text-[#00D4FF] mb-1">Analysis Time</p>
                  <p className="text-3xl font-bold text-white">3 days</p>
                  <p className="text-xs text-slate-400">vs 8 weeks manual</p>
                </div>
                <div className="p-4 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/30">
                  <p className="text-sm text-[#FFB800] mb-1">Competitors Analyzed</p>
                  <p className="text-3xl font-bold text-white">12</p>
                  <p className="text-xs text-slate-400">Deep dive profiles</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-sm text-emerald-400 mb-1">White Space Found</p>
                  <p className="text-3xl font-bold text-white">$45M</p>
                  <p className="text-xs text-slate-400">TAM opportunity</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "M2 identified emerging competitor with superior technology 6 months before market awareness",
                  "Porter's 5 Forces revealed high supplier power risk in hosting infrastructure",
                  "Competitive positioning matrix uncovered underserved mid-market segment",
                  "Real-time monitoring detected competitor pricing change enabling $1.2M revenue capture",
                  "Repositioned product strategy resulting in 32% win rate improvement"
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
            Gain Competitive Advantage with AI
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Move from static quarterly reports to continuous competitive intelligence with AI-powered monitoring and analysis.
          </p>
          <AccessRequestForm 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                Request Competitive Intelligence Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
          />
        </div>
      </section>
    </div>
  );
}