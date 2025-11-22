import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Target, Layers, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import AccessRequestForm from "../components/landing/AccessRequestForm";

export default function UseCaseStrategicPlanning() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.title = "Strategic Planning Software | CAIO·AI Executive AI Platform";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'AI-powered strategic planning software for annual planning, OKR setting, and scenario analysis. TSI v9.3 framework delivers institutional-grade strategic plans in days, not months.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'AI-powered strategic planning software for annual planning, OKR setting, and scenario analysis. TSI v9.3 framework delivers institutional-grade strategic plans in days, not months.';
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
            Strategic Planning Use Case
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Strategic Planning Software for Executives
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            AI-powered <span className="text-[#00D4FF] font-semibold">strategic planning software</span> for annual planning, OKR setting, and scenario analysis. CAIO·AI's <span className="text-[#00D4FF] font-semibold">TSI v9.3 framework</span> combines <span className="text-[#00D4FF] font-semibold">market intelligence</span>, <span className="text-[#00D4FF] font-semibold">competitive analysis</span>, and <span className="text-[#00D4FF] font-semibold">financial modeling</span> to deliver institutional-grade strategic plans in days, not months.
          </p>
          <AccessRequestForm 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                Start Strategic Planning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
          />
        </div>
      </section>

      <section className="py-16 px-6 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Traditional Strategic Planning Challenges</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Annual planning process takes 3-4 months",
              "Data collection scattered across multiple sources",
              "Limited scenario modeling capabilities",
              "Disconnect between strategy and execution",
              "OKRs not aligned with market realities",
              "Plans outdated by the time they're finalized"
            ].map((problem, i) => (
              <Card key={i} className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-4 flex items-start gap-3">
                  <Target className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <p className="text-slate-200">{problem}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">TSI-Powered Strategic Planning Framework</h2>
          
          <div className="space-y-6">
            {[
              {
                module: "M1 + M2: Market & Competitive Context",
                icon: Target,
                description: "TAM/SAM/SOM analysis, competitive landscape, Porter's 5 Forces. Grounds strategic planning in current market realities.",
                deliverable: "Market Opportunity Assessment"
              },
              {
                module: "M4: Financial Scenario Modeling",
                icon: Layers,
                description: "3-5 year financial projections across optimistic/realistic/conservative scenarios. Monte Carlo simulation for confidence intervals.",
                deliverable: "Financial Forecast Models"
              },
              {
                module: "M5: Strategic Synthesis",
                icon: CheckCircle,
                description: "Strategic alternatives analysis, SWOT integration, resource allocation recommendations. Blue Ocean vs Red Ocean positioning.",
                deliverable: "Strategic Recommendations"
              },
              {
                module: "M6: Opportunity Matrix",
                icon: Calendar,
                description: "Initiative prioritization (impact × feasibility × strategic fit). Portfolio optimization across time horizons.",
                deliverable: "Prioritized Initiative Roadmap"
              },
              {
                module: "M7: Implementation Planning",
                icon: ArrowRight,
                description: "Quarterly OKRs aligned with strategic priorities. Resource allocation, dependency mapping, risk mitigation.",
                deliverable: "Execution Roadmap with OKRs"
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
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
                              {item.deliverable}
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
              <h3 className="text-xl font-bold text-white mb-3">Complete Strategic Plan Delivered</h3>
              <p className="text-2xl font-bold text-white mb-2">5-7 days vs 3-4 months</p>
              <p className="text-slate-300">Board-ready strategic plan with financial models, OKRs, and execution roadmap</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 px-6 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Strategic Planning Results</h2>
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
            <CardContent className="p-8">
              <Badge className="bg-cyan-500/20 text-cyan-300 mb-4">SaaS Scale-up - Series B</Badge>
              <h3 className="text-2xl font-bold text-white mb-6">3-Year Strategic Plan with OKRs</h3>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30">
                  <p className="text-sm text-[#00D4FF] mb-1">Planning Cycle</p>
                  <p className="text-3xl font-bold text-white">6 days</p>
                  <p className="text-xs text-slate-400">vs 14 weeks traditional</p>
                </div>
                <div className="p-4 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/30">
                  <p className="text-sm text-[#FFB800] mb-1">Strategic Initiatives</p>
                  <p className="text-3xl font-bold text-white">24</p>
                  <p className="text-xs text-slate-400">Prioritized by ROI</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-sm text-emerald-400 mb-1">Board Approval</p>
                  <p className="text-3xl font-bold text-white">1st Try</p>
                  <p className="text-xs text-slate-400">No revisions needed</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "M1/M2 identified $180M TAM expansion opportunity in adjacent market",
                  "M4 scenario modeling de-risked $5M product investment decision",
                  "M5 strategic synthesis pivoted GTM strategy saving $2M in wasted CAC",
                  "M6 prioritization killed 3 low-ROI initiatives freeing 40% of eng capacity",
                  "M7 OKRs achieved 89% on-time delivery vs 62% prior year"
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
            Transform Your Strategic Planning Process
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Build data-driven strategic plans with AI-powered market intelligence, financial modeling, and OKR alignment.
          </p>
          <AccessRequestForm 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                Request Strategic Planning Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
          />
        </div>
      </section>
    </div>
  );
}