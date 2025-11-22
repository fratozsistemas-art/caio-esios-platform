import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Cpu, Layers, Zap } from "lucide-react";
import AccessRequestForm from "../components/landing/AccessRequestForm";

export default function UseCaseDigitalTransformation() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.title = "Digital Transformation Planning AI | CAIO·AI Strategic Intelligence";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'AI-powered digital transformation planning. Assess digital maturity, prioritize initiatives by ROI, and create executive-ready roadmaps with M3 Technology Intelligence and M7 Implementation Planning.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'AI-powered digital transformation planning. Assess digital maturity, prioritize initiatives by ROI, and create executive-ready roadmaps with M3 Technology Intelligence and M7 Implementation Planning.';
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
            Digital Transformation Use Case
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Digital Transformation Planning AI
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Assess <span className="text-[#00D4FF] font-semibold">digital maturity</span>, prioritize initiatives by ROI, and create executive-ready roadmaps with <span className="text-[#00D4FF] font-semibold">M3 (Technology Intelligence)</span> and <span className="text-[#00D4FF] font-semibold">M7 (Implementation Planning)</span>. Our <span className="text-[#00D4FF] font-semibold">strategic portfolio management</span> ensures transformation success with OKR alignment.
          </p>
          <AccessRequestForm 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                Start Digital Transformation Planning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
          />
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Digital Transformation Framework</h2>
          
          <div className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#FFB800]/20 flex items-center justify-center flex-shrink-0">
                    <Cpu className="w-7 h-7 text-[#00D4FF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-4">M3: Technology Intelligence</h3>
                    <ul className="space-y-2">
                      {[
                        "Current tech stack audit and capability assessment",
                        "Digital maturity scoring across 8 dimensions",
                        "Technology gap analysis vs industry benchmarks",
                        "Cloud migration readiness and cost modeling",
                        "Data architecture modernization priorities"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300">
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFB800]/20 to-[#00D4FF]/20 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-7 h-7 text-[#FFB800]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-4">M7: Implementation Planning</h3>
                    <ul className="space-y-2">
                      {[
                        "Initiative prioritization matrix (ROI × Feasibility × Strategic Fit)",
                        "18-24 month phased roadmap with dependencies",
                        "Resource allocation and team capacity planning",
                        "Risk mitigation strategies and contingency plans",
                        "OKR framework aligned with transformation goals"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300">
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Digital Transformation Results</h2>
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
            <CardContent className="p-8">
              <Badge className="bg-cyan-500/20 text-cyan-300 mb-4">Manufacturing Company - Legacy Modernization</Badge>
              <h3 className="text-2xl font-bold text-white mb-6">3-Year Digital Transformation Roadmap</h3>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30">
                  <p className="text-sm text-[#00D4FF] mb-1">Planning Time</p>
                  <p className="text-3xl font-bold text-white">5 days</p>
                  <p className="text-xs text-slate-400">vs 4 months traditional</p>
                </div>
                <div className="p-4 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/30">
                  <p className="text-sm text-[#FFB800] mb-1">Initiatives Prioritized</p>
                  <p className="text-3xl font-bold text-white">37</p>
                  <p className="text-xs text-slate-400">Ranked by ROI</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-sm text-emerald-400 mb-1">Expected ROI</p>
                  <p className="text-3xl font-bold text-white">340%</p>
                  <p className="text-xs text-slate-400">Over 3 years</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "M3 identified legacy systems costing $2.1M annually in maintenance",
                  "Cloud migration prioritized for 80% cost reduction",
                  "M7 created phased roadmap preventing $5M in overlapping investments",
                  "OKR alignment ensured 92% on-time delivery in Year 1",
                  "Digital maturity score improved from 2.3 to 4.1 (out of 5)"
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
            Transform Your Technology Strategy
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Build data-driven digital transformation roadmaps with AI-powered maturity assessment and ROI prioritization.
          </p>
          <AccessRequestForm 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                Request Digital Transformation Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
          />
        </div>
      </section>
    </div>
  );
}