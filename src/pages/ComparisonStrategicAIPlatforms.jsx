import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, ArrowRight, Brain } from "lucide-react";
import AccessRequestForm from "../components/landing/AccessRequestForm";

export default function ComparisonStrategicAIPlatforms() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.title = "Strategic Intelligence Platform Comparison | CAIO·AI vs Competitors";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Compare strategic intelligence platforms: CAIO·AI vs Quantive vs MindHive. TSI v9.3 methodology, knowledge graphs, pricing, and executive AI features comparison.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Compare strategic intelligence platforms: CAIO·AI vs Quantive vs MindHive. TSI v9.3 methodology, knowledge graphs, pricing, and executive AI features comparison.';
      document.head.appendChild(meta);
    }
  }, []);

  const comparisonData = [
    {
      category: "Structured Methodology",
      caio: "TSI v9.3 (11 modules)",
      quantive: "OKR-focused",
      mindhive: "Generic prompts"
    },
    {
      category: "Strategic Analysis",
      caio: true,
      quantive: "Limited",
      mindhive: true
    },
    {
      category: "Financial Modeling",
      caio: "M4 with DCF/NPV/Monte Carlo",
      quantive: false,
      mindhive: "Basic calculations"
    },
    {
      category: "Market Intelligence",
      caio: "M1 with TAM/SAM/SOM",
      quantive: false,
      mindhive: "Conversational"
    },
    {
      category: "Competitive Intelligence",
      caio: "M2 with Porter's 5 Forces",
      quantive: false,
      mindhive: "Basic"
    },
    {
      category: "Knowledge Graph",
      caio: "10K+ connections",
      quantive: false,
      mindhive: false
    },
    {
      category: "Decision Governance",
      caio: "Hermes Trust-Broker",
      quantive: false,
      mindhive: false
    },
    {
      category: "Implementation Roadmaps",
      caio: "M7 with OKR alignment",
      quantive: true,
      mindhive: false
    },
    {
      category: "Tech Stack Analysis",
      caio: "M3 module",
      quantive: false,
      mindhive: false
    },
    {
      category: "Pricing (Monthly)",
      caio: "$299 - $899",
      quantive: "Enterprise only",
      mindhive: "$199 - $599"
    }
  ];

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
            Platform Comparison
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Strategic Intelligence Platform Comparison
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Compare leading <span className="text-[#00D4FF] font-semibold">strategic intelligence platforms</span> and <span className="text-[#00D4FF] font-semibold">executive AI platforms</span>. CAIO·AI's <span className="text-[#00D4FF] font-semibold">TSI v9.3 methodology</span> with 11 specialized modules delivers institutional-grade analysis beyond generic strategy tools.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-4 text-slate-400 font-semibold">Feature</th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#FFB800] flex items-center justify-center mb-2">
                        <Brain className="w-6 h-6 text-[#0A1628]" />
                      </div>
                      <span className="text-white font-semibold">CAIO·AI</span>
                      <span className="text-xs text-slate-400">TSI v9.3</span>
                    </div>
                  </th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mb-2">
                        <span className="text-white text-xs font-bold">Q</span>
                      </div>
                      <span className="text-slate-300 font-semibold">Quantive</span>
                      <span className="text-xs text-slate-500">OKR Platform</span>
                    </div>
                  </th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mb-2">
                        <span className="text-white text-xs font-bold">MH</span>
                      </div>
                      <span className="text-slate-300 font-semibold">MindHive</span>
                      <span className="text-xs text-slate-500">AI Strategy</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-slate-300 font-medium">{row.category}</td>
                    <td className="p-4 text-center">
                      {typeof row.caio === "boolean" ? (
                        row.caio ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-white font-semibold text-sm">{row.caio}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.quantive === "boolean" ? (
                        row.quantive ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400 text-sm">{row.quantive}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.mindhive === "boolean" ? (
                        row.mindhive ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400 text-sm">{row.mindhive}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Why CAIO·AI Stands Out</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Comprehensive Coverage",
                description: "11 TSI modules cover market intelligence, competitive analysis, financial modeling, technology assessment, and strategic execution—not just OKRs or generic prompts."
              },
              {
                title: "Institutional-Grade Methodology",
                description: "TSI v9.3 framework delivers consulting-quality analysis with structured frameworks like Porter's 5 Forces, DCF modeling, and TAM/SAM/SOM calculation."
              },
              {
                title: "Knowledge Graph Intelligence",
                description: "10K+ strategic connections enable pattern recognition and insights impossible with isolated analyses. Hermes Trust-Broker ensures cognitive governance."
              }
            ].map((item, i) => (
              <Card key={i} className="bg-white/10 border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Choose the Right Strategic Intelligence Platform
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Move beyond generic AI chat or narrow OKR tools to comprehensive strategic intelligence.
          </p>
          <AccessRequestForm 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                Request Platform Comparison Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
          />
        </div>
      </section>
    </div>
  );
}