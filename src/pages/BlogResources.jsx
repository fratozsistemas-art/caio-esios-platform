import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Clock } from "lucide-react";

export default function BlogResources() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.title = "Strategic Intelligence Resources & Blog | CAIO·AI";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Resources and insights on strategic intelligence, executive AI platforms, M&A due diligence, market entry strategy, and digital transformation planning.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Resources and insights on strategic intelligence, executive AI platforms, M&A due diligence, market entry strategy, and digital transformation planning.';
      document.head.appendChild(meta);
    }
  }, []);

  const articles = [
    {
      title: "What Is Strategic Intelligence? Complete Guide for Executives",
      category: "Strategic Intelligence",
      readTime: "12 min",
      date: "Jan 2025",
      excerpt: "Comprehensive guide to strategic intelligence platforms, TSI methodology, and how executives use AI for data-driven decisions.",
      slug: "what-is-strategic-intelligence"
    },
    {
      title: "AI vs Traditional Consulting: ROI Comparison",
      category: "ROI Analysis",
      readTime: "8 min",
      date: "Jan 2025",
      excerpt: "Cost-benefit analysis comparing AI-powered strategic intelligence platforms with traditional consulting engagements.",
      slug: "ai-vs-consulting-roi"
    },
    {
      title: "11 Components of Enterprise Strategic Intelligence",
      category: "TSI Methodology",
      readTime: "15 min",
      date: "Jan 2025",
      excerpt: "Deep dive into TSI v9.3 framework covering market intelligence, competitive analysis, financial modeling, and more.",
      slug: "11-components-strategic-intelligence"
    },
    {
      title: "How to Choose a Strategic Intelligence Platform",
      category: "Buyer's Guide",
      readTime: "10 min",
      date: "Dec 2024",
      excerpt: "Evaluation criteria for selecting executive AI platforms: methodology, governance, integration, and scalability.",
      slug: "choose-strategic-intelligence-platform"
    },
    {
      title: "Financial Modeling Best Practices for M&A",
      category: "M&A",
      readTime: "14 min",
      date: "Dec 2024",
      excerpt: "DCF analysis, valuation multiples, scenario planning, and risk-adjusted NPV calculation for M&A due diligence.",
      slug: "financial-modeling-ma"
    },
    {
      title: "The Rise of the Chief AI Officer (CAIO)",
      category: "Leadership",
      readTime: "9 min",
      date: "Dec 2024",
      excerpt: "Emerging C-suite role focused on AI strategy, governance, and enterprise-wide AI adoption.",
      slug: "rise-of-chief-ai-officer"
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
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40 mb-6">
            Resources & Insights
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Strategic Intelligence Resources
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl">
            Guides, frameworks, and insights on <span className="text-[#00D4FF] font-semibold">executive AI platforms</span>, <span className="text-[#00D4FF] font-semibold">strategic intelligence</span>, and data-driven decision-making.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, i) => (
              <Card key={i} className="bg-white/10 border-white/20 hover:bg-white/15 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40 mb-4">
                    {article.category}
                  </Badge>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00D4FF] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-300 mb-4 text-sm leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {article.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#00D4FF] group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-slate-400 mb-4">More articles coming soon</p>
            <Button onClick={() => navigate(createPageUrl("Landing"))} className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
              Explore CAIO·AI Platform
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}