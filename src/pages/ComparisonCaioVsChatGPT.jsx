import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, ArrowRight, Brain } from "lucide-react";
import AccessRequestForm from "../components/landing/AccessRequestForm";
import SEOHead from "../components/SEOHead";

export default function ComparisonCaioVsChatGPT() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.title = "CAIO·AI vs ChatGPT for Business | Strategic Intelligence Platform Comparison";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'CAIO·AI vs ChatGPT comparison for strategic decisions. General AI vs specialized strategic intelligence platform with 11 TSI modules, knowledge graphs, and institutional-grade governance.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'CAIO·AI vs ChatGPT comparison for strategic decisions. General AI vs specialized strategic intelligence platform with 11 TSI modules, knowledge graphs, and institutional-grade governance.';
      document.head.appendChild(meta);
    }
  }, []);

  const comparisonData = [
    {
      category: "Purpose",
      caio: "Specialized for executive strategic intelligence",
      chatgpt: "General-purpose conversational AI"
    },
    {
      category: "Methodology",
      caio: "TSI v9.3 with 11 cognitive modules",
      chatgpt: "Prompt-based, no structured framework"
    },
    {
      category: "Strategic Analysis",
      caio: true,
      chatgpt: false
    },
    {
      category: "Financial Modeling",
      caio: "M4 module with DCF, NPV, Monte Carlo",
      chatgpt: "Generic calculations only"
    },
    {
      category: "Knowledge Graph",
      caio: "10K+ strategic connections",
      chatgpt: false
    },
    {
      category: "Decision Governance",
      caio: "Hermes Trust-Broker with full audit trail",
      chatgpt: false
    },
    {
      category: "Competitive Intelligence",
      caio: "M2 module with Porter's 5 Forces",
      chatgpt: "Conversational suggestions"
    },
    {
      category: "Market Intelligence",
      caio: "M1 module with TAM/SAM/SOM",
      chatgpt: "General market information"
    },
    {
      category: "Implementation Roadmaps",
      caio: "M7 module with OKR alignment",
      chatgpt: false
    },
    {
      category: "Pricing",
      caio: "$299-899/month",
      chatgpt: "$20/month (ChatGPT Plus)"
    }
  ];

  return (
    <>
      <SEOHead
        title="CAIO·AI vs ChatGPT - Strategic Intelligence Platform Comparison"
        description="CAIO·AI vs ChatGPT comparison for strategic decisions. General AI vs specialized strategic intelligence platform with 11 TSI modules, knowledge graphs, and institutional-grade governance."
        keywords="CAIO vs ChatGPT, strategic AI comparison, enterprise AI vs ChatGPT, business intelligence platform, executive AI decision support, TSI vs GPT-4"
      />
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
            CAIO·AI vs ChatGPT for Business
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Comparing <span className="text-[#00D4FF] font-semibold">general-purpose AI</span> with a <span className="text-[#00D4FF] font-semibold">specialized strategic intelligence platform</span>. While ChatGPT excels at conversational tasks, CAIO·AI is purpose-built for institutional-grade strategic decision-making with <span className="text-[#00D4FF] font-semibold">11 TSI cognitive modules</span>.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-4 text-slate-400 font-semibold">Feature</th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#FFB800] flex items-center justify-center mb-2">
                        <Brain className="w-6 h-6 text-[#0A1628]" />
                      </div>
                      <span className="text-white font-semibold">CAIO·AI</span>
                      <span className="text-xs text-slate-400">Strategic Intelligence</span>
                    </div>
                  </th>
                  <th className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mb-2">
                        <span className="text-2xl">💬</span>
                      </div>
                      <span className="text-slate-300 font-semibold">ChatGPT</span>
                      <span className="text-xs text-slate-500">General AI</span>
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
                      {typeof row.chatgpt === "boolean" ? (
                        row.chatgpt ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-400 text-sm">{row.chatgpt}</span>
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
          <h2 className="text-3xl font-bold text-white mb-8">When to Use Each Platform</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-[#00D4FF]/20 to-[#FFB800]/20 border-[#00D4FF]/40">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Use CAIO·AI For:</h3>
                <ul className="space-y-3">
                  {[
                    "M&A due diligence and valuation",
                    "Market entry strategy and TAM analysis",
                    "Digital transformation planning",
                    "Strategic planning and OKR setting",
                    "Competitive intelligence and positioning",
                    "Financial modeling and scenario analysis",
                    "Executive decision support with audit trails"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-200">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Use ChatGPT For:</h3>
                <ul className="space-y-3">
                  {[
                    "Content writing and editing",
                    "Brainstorming and ideation",
                    "Coding assistance and debugging",
                    "General knowledge questions",
                    "Email drafting and communication",
                    "Learning and education",
                    "Personal productivity tasks"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready for Strategic Intelligence?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            While ChatGPT is great for general tasks, CAIO·AI is built specifically for executive strategic decision-making.
          </p>
          <AccessRequestForm 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
                Request CAIO·AI Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
          />
        </div>
      </section>
    </div>
    </>
  );
}