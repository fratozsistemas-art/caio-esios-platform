import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, ArrowRight, DollarSign, Clock, Users } from "lucide-react";
import AccessRequestForm from "../components/landing/AccessRequestForm";

export default function ComparisonAIvsConsulting() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.title = "AI vs Traditional Consulting: ROI Comparison | CAIO·AI";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'AI consulting vs traditional consulting ROI comparison. Speed, cost, availability, and depth analysis for strategic intelligence platforms versus boutique consultancies.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'AI consulting vs traditional consulting ROI comparison. Speed, cost, availability, and depth analysis for strategic intelligence platforms versus boutique consultancies.';
      document.head.appendChild(meta);
    }
  }, []);

  const comparisonData = [
    {
      category: "Engagement Timeline",
      caio: "Same day - 1 week",
      individual: "4-8 weeks",
      boutique: "8-16 weeks"
    },
    {
      category: "Typical Project Cost",
      caio: "$3K - $10K",
      individual: "$50K - $150K",
      boutique: "$250K - $2M"
    },
    {
      category: "Availability",
      caio: "24/7 on-demand",
      individual: "Limited capacity",
      boutique: "3-6 month waitlist"
    },
    {
      category: "Structured Methodology",
      caio: true,
      individual: false,
      boutique: true
    },
    {
      category: "Data-Driven Analysis",
      caio: true,
      individual: "Varies",
      boutique: true
    },
    {
      category: "Scenario Modeling",
      caio: "Unlimited scenarios",
      individual: "1-2 scenarios",
      boutique: "3-5 scenarios"
    },
    {
      category: "Real-Time Updates",
      caio: true,
      individual: false,
      boutique: false
    },
    {
      category: "Decision Traceability",
      caio: "Full audit trail",
      individual: false,
      boutique: "Meeting notes only"
    },
    {
      category: "Scalability",
      caio: "Infinite parallel projects",
      individual: "1-2 projects max",
      boutique: "Limited by headcount"
    },
    {
      category: "Best For",
      caio: "Rapid strategic intelligence",
      individual: "Niche expertise",
      boutique: "Transformation programs"
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
            ROI Comparison
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI vs Traditional Consulting
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Compare <span className="text-[#00D4FF] font-semibold">AI consulting</span> with traditional consulting across speed, cost, availability, and depth. <span className="text-[#00D4FF] font-semibold">Strategic intelligence platforms</span> deliver consulting-grade analysis at software speed and SaaS pricing.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-4 text-slate-400 font-semibold">Factor</th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#FFB800] flex items-center justify-center mb-2">
                        <DollarSign className="w-6 h-6 text-[#0A1628]" />
                      </div>
                      <span className="text-white font-semibold">CAIO·AI</span>
                      <span className="text-xs text-slate-400">AI Platform</span>
                    </div>
                  </th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mb-2">
                        <Users className="w-6 h-6 text-slate-300" />
                      </div>
                      <span className="text-slate-300 font-semibold">Individual</span>
                      <span className="text-xs text-slate-500">Consultants</span>
                    </div>
                  </th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mb-2">
                        <Users className="w-6 h-6 text-slate-300" />
                      </div>
                      <span className="text-slate-300 font-semibold">Boutique</span>
                      <span className="text-xs text-slate-500">Consultancies</span>
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
                      {typeof row.individual === "boolean" ? (
                        row.individual ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400 text-sm">{row.individual}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.boutique === "boolean" ? (
                        row.boutique ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400 text-sm">{row.boutique}</span>
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
          <h2 className="text-3xl font-bold text-white mb-8">ROI Calculation Example</h2>
          
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">M&A Due Diligence Project</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-slate-400 mb-2">CAIO·AI Platform</div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Timeline:</span>
                      <span className="text-white font-semibold">3 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Cost:</span>
                      <span className="text-white font-semibold">$5,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Internal Hours:</span>
                      <span className="text-white font-semibold">20 hrs</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-xs text-emerald-400 mb-1">Total Cost</div>
                    <div className="text-2xl font-bold text-white">$8K</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-2">Individual Consultant</div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Timeline:</span>
                      <span className="text-white font-semibold">6 weeks</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Cost:</span>
                      <span className="text-white font-semibold">$75,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Internal Hours:</span>
                      <span className="text-white font-semibold">40 hrs</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">Total Cost</div>
                    <div className="text-2xl font-bold text-white">$81K</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-2">Boutique Firm</div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Timeline:</span>
                      <span className="text-white font-semibold">12 weeks</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Cost:</span>
                      <span className="text-white font-semibold">$350,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Internal Hours:</span>
                      <span className="text-white font-semibold">80 hrs</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">Total Cost</div>
                    <div className="text-2xl font-bold text-white">$362K</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[#00D4FF]/20 to-[#FFB800]/20 border border-[#00D4FF]/40">
                <div className="text-center">
                  <div className="text-sm text-[#00D4FF] mb-2">CAIO·AI Savings vs Boutique Consultancy</div>
                  <div className="text-4xl font-bold text-white mb-1">$354,000</div>
                  <div className="text-sm text-slate-300">(98% cost reduction + 24x faster)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Get Consulting-Grade Intelligence at AI Speed
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Combine the best of consulting methodology with AI speed and software economics.
          </p>
          <AccessRequestForm 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                Request ROI Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
          />
        </div>
      </section>
    </div>
  );
}