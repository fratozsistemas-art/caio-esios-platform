import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Globe,
  Lightbulb,
  Target,
  ArrowRight,
  Sparkles,
  TrendingUp,
  X,
  Play,
  ChevronRight,
  CheckCircle,
  Cpu,
  DollarSign,
  Users,
  Zap,
  Shield,
  Edit3,
  BarChart3
} from "lucide-react";

const demoModules = [
  {
    id: "M1",
    name: "Market Intelligence",
    icon: Globe,
    color: "#00C8FF",
    description: "Analyze market dynamics and trends",
    demoType: "guided"
  },
  {
    id: "M2",
    name: "Competitive Intelligence",
    icon: Target,
    color: "#16A9FF",
    description: "Competitive positioning analysis",
    demoType: "guided"
  },
  {
    id: "M3",
    name: "Technology Intelligence",
    icon: Cpu,
    color: "#8B5CF6",
    description: "Tech stack analysis and innovation tracking",
    demoType: "guided"
  },
  {
    id: "M4",
    name: "Financial Modeling",
    icon: DollarSign,
    color: "#10B981",
    description: "Revenue projections and valuation",
    demoType: "sandbox"
  },
  {
    id: "M5",
    name: "Strategic Synthesis",
    icon: Lightbulb,
    color: "#FFC247",
    description: "Integrate frameworks into strategic options",
    demoType: "sandbox"
  },
  {
    id: "M6",
    name: "Opportunity Matrix",
    icon: BarChart3,
    color: "#F59E0B",
    description: "Identify and prioritize opportunities",
    demoType: "sandbox"
  }
];

const guidedWalkthroughs = {
  M1: {
    title: "Market Intelligence Demo",
    steps: [
      {
        title: "Define Target Market",
        prompt: "Analyze the SaaS market for enterprise AI solutions",
        response: "**TAM Analysis (Total Addressable Market):**\n\n• Global Enterprise AI Market: $142.3B (2025)\n• CAGR: 38.1% (2025-2030)\n• Key Segments: MLOps, Conversational AI, Decision Intelligence\n\n**SAM (Serviceable Available Market):**\n• Enterprise Strategic Intelligence: $18.7B\n• B2B SaaS: $12.4B relevant segment\n\n**SOM (Serviceable Obtainable Market):**\n• Year 1 Target: $45M (0.24% market penetration)\n• Focus: Fortune 500 + Growth-stage tech\n\n**Regulatory Context:**\n• EU AI Act compliance required\n• SOC2 Type II essential for enterprise\n• GDPR implications for data processing",
        insights: ["Strong market growth", "Clear regulatory requirements", "Defined target segment"]
      },
      {
        title: "Demand Dynamics",
        prompt: "What are the key demand drivers?",
        response: "**Primary Demand Drivers:**\n\n1. **Executive Decision Velocity** (Impact: High)\n   - C-suite needs 3-5x faster strategic insights\n   - Board pressure for data-driven decisions\n\n2. **Consultant Cost Pressure** (Impact: High)\n   - $250K-$1M+ per engagement\n   - 3-6 month delivery timelines\n\n3. **AI Adoption Curve** (Impact: Medium-High)\n   - 67% of enterprises exploring AI for strategy\n   - Fear of competitive disadvantage\n\n**Market Timing:**\n• Peak demand in Q1-Q2 (budget planning)\n• Strong correlation with economic uncertainty\n• Early adopter segment: Tech & Financial Services",
        insights: ["Cost pressure on consulting", "Speed-to-insight critical", "Clear seasonal patterns"]
      },
      {
        title: "Market Size Conclusion",
        prompt: "Synthesize findings",
        response: "**Strategic Market Assessment:**\n\n✓ **Market Opportunity**: $142.3B TAM, growing 38.1% CAGR\n✓ **Sweet Spot**: Enterprise Strategic Intelligence ($18.7B SAM)\n✓ **Timing**: Optimal - peak AI adoption + consultant cost pressure\n✓ **Entry Barrier**: Regulatory compliance manageable with SOC2/GDPR\n\n**Recommendation**: Strong GO signal with focus on Fortune 500 tech/finance verticals.",
        insights: ["Large addressable market", "Clear product-market fit", "Favorable timing"]
      }
    ],
    userInput: true,
    customInputEnabled: true
  },
  M2: {
    title: "Competitive Intelligence Demo",
    steps: [
      {
        title: "Competitive Landscape",
        prompt: "Map competitive landscape for enterprise AI strategic tools",
        response: "**5 Forces Analysis:**\n\n**Rivalry (High):**\n• McKinsey Lilli, BCG Gamma, Bain AI Labs\n• Generic LLMs: ChatGPT Enterprise, Claude for Work\n• Specialized: Gong, Clari (vertical focus)\n\n**Threat of New Entrants (Medium):**\n• High capital for AI development\n• Strong network effects with knowledge graphs\n• Regulatory barriers create moat\n\n**Buyer Power (Medium-High):**\n• Enterprise clients price-sensitive\n• Multiple alternatives available\n• Switching costs moderate\n\n**Supplier Power (Low):**\n• Multiple LLM providers (OpenAI, Anthropic, open-source)\n• Cloud infrastructure commoditized",
        insights: ["Consultancies main competition", "LLMs lack methodology", "Clear differentiation path"]
      },
      {
        title: "Positioning Matrix",
        prompt: "Where do we position vs. alternatives?",
        response: "**2x2 Strategic Positioning:**\n\n```\nHigh Methodology │ CAIO·AI ⭐│ Consultancies\n                │           │ (BCG, McKinsey)\n                │           │\n                │           │\n                ├───────────┼──────────────\nGeneric AI      │ LLMs      │ Specialized\n                │ (GPT-4)   │ (Gong, Clari)\n                │           │\n    Low Cost ←──┴───────────┴──→ High Cost\n```\n\n**CAIO·AI Unique Position:**\n• Consultancy-grade methodology\n• SaaS pricing model\n• AI speed & scalability\n\n**Key Differentiator:** Only player with institutional methodology at SaaS economics",
        insights: ["Unique quadrant position", "No direct competitors", "Blue ocean opportunity"]
      },
      {
        title: "Competitive Advantage Analysis",
        prompt: "What are our sustainable competitive advantages?",
        response: "**Core Competitive Advantages:**\n\n1. **Proprietary TSI v9.3 Methodology** (Defensibility: High)\n   - 11-module integrated framework\n   - 5+ years of development refinement\n   - Patents pending on cognitive architecture\n\n2. **Network Effects** (Defensibility: High)\n   - Knowledge Graph grows with usage (10K+ connections)\n   - Each client enriches platform intelligence\n   - Switching costs increase over time\n\n3. **Data Moat** (Defensibility: Medium-High)\n   - Strategic decision patterns across industries\n   - Validated frameworks from 100+ implementations\n   - Continuous learning from outcomes\n\n**Sustainability Timeline:**\n• Years 1-2: Methodology + Early network effects\n• Years 3-5: Data moat solidifies\n• Years 5+: Dominant position with high switching costs\n\n**Risk Factors:**\n⚠ OpenAI/Anthropic could build similar methodology\n⚠ Traditional consultancies digitizing offerings\n✓ Mitigation: Speed to scale + vertical specialization",
        insights: ["Multi-layered defensibility", "Time-based moat deepening", "Clear risk mitigation path"]
      }
    ]
  },
  M3: {
    title: "Technology Intelligence Demo",
    steps: [
      {
        title: "Tech Stack Discovery",
        prompt: "Analyze tech stack for a Series B SaaS competitor",
        response: "**Frontend Architecture:**\n• React 18.x with TypeScript\n• Next.js 14 for SSR/SSG\n• TailwindCSS + Shadcn/ui component library\n• Vercel deployment (edge functions)\n\n**Backend Infrastructure:**\n• Node.js microservices on AWS EKS\n• PostgreSQL (RDS) + Redis caching\n• GraphQL API layer (Apollo Server)\n• AWS Lambda for async processing\n\n**AI/ML Stack:**\n• OpenAI GPT-4 API (primary)\n• Anthropic Claude (fallback)\n• Pinecone vector database\n• Custom fine-tuning on AWS SageMaker\n\n**Data Engineering:**\n• Airflow for orchestration\n• Snowflake data warehouse\n• dbt for transformations\n• Looker for BI\n\n**Security & Compliance:**\n• SOC2 Type II certified\n• AWS GuardDuty + CloudTrail\n• Encryption at rest (KMS) and in transit (TLS 1.3)\n\n**Cost Estimate:** $45K-65K/month at 10K users",
        insights: ["Modern stack, high scalability", "Heavy cloud costs", "Strong compliance posture"]
      },
      {
        title: "Innovation Assessment",
        prompt: "What innovations are they implementing?",
        response: "**Recent Technology Innovations:**\n\n1. **Real-time Collaborative AI** (Released: Q3 2024)\n   - Multi-user simultaneous editing with AI suggestions\n   - Conflict resolution algorithm (patent pending)\n   - 40% increase in team productivity per internal metrics\n\n2. **Hybrid Search Architecture** (Beta)\n   - Combines semantic (vector) + keyword search\n   - 2.3x improvement in retrieval accuracy\n   - Custom re-ranking model trained on user behavior\n\n3. **Automated Data Pipeline** (In Development)\n   - Auto-ingests data from 50+ sources\n   - Smart schema mapping with LLM\n   - Reduces setup time from 2 weeks to 2 hours\n\n**Technology Roadmap (Next 12 months):**\n• Q1 2025: On-premise deployment option\n• Q2 2025: Mobile app (iOS/Android)\n• Q3 2025: Voice interface integration\n• Q4 2025: Custom model fine-tuning UI\n\n**Innovation Velocity:** 8-12 feature releases/quarter\n**R&D Investment:** 35% of revenue",
        insights: ["Fast innovation cycle", "Product-led growth focus", "High R&D investment"]
      }
    ]
  }
};

const guidedWalkthroughsM2M3 = {
  M2: {
    title: "Competitive Intelligence Demo",
    steps: [
      {
        title: "Competitive Landscape",
        prompt: "Map competitive landscape for enterprise AI strategic tools",
        response: "**5 Forces Analysis:**\n\n**Rivalry (High):**\n• McKinsey Lilli, BCG Gamma, Bain AI Labs\n• Generic LLMs: ChatGPT Enterprise, Claude for Work\n• Specialized: Gong, Clari (vertical focus)\n\n**Threat of New Entrants (Medium):**\n• High capital for AI development\n• Strong network effects with knowledge graphs\n• Regulatory barriers create moat\n\n**Buyer Power (Medium-High):**\n• Enterprise clients price-sensitive\n• Multiple alternatives available\n• Switching costs moderate\n\n**Supplier Power (Low):**\n• Multiple LLM providers (OpenAI, Anthropic, open-source)\n• Cloud infrastructure commoditized",
        insights: ["Consultancies main competition", "LLMs lack methodology", "Clear differentiation path"]
      },
      {
        title: "Positioning Matrix",
        prompt: "Where do we position vs. alternatives?",
        response: "**2x2 Strategic Positioning:**\n\n```\nHigh Methodology │ CAIO·AI ⭐│ Consultancies\n                │           │ (BCG, McKinsey)\n                │           │\n                │           │\n                ├───────────┼──────────────\nGeneric AI      │ LLMs      │ Specialized\n                │ (GPT-4)   │ (Gong, Clari)\n                │           │\n    Low Cost ←──┴───────────┴──→ High Cost\n```\n\n**CAIO·AI Unique Position:**\n• Consultancy-grade methodology\n• SaaS pricing model\n• AI speed & scalability\n\n**Key Differentiator:** Only player with institutional methodology at SaaS economics",
        insights: ["Unique quadrant position", "No direct competitors", "Blue ocean opportunity"]
      },
      {
        title: "Competitive Advantage Analysis",
        prompt: "What are our sustainable competitive advantages?",
        response: "**Core Competitive Advantages:**\n\n1. **Proprietary TSI v9.3 Methodology** (Defensibility: High)\n   - 11-module integrated framework\n   - 5+ years of development refinement\n   - Patents pending on cognitive architecture\n\n2. **Network Effects** (Defensibility: High)\n   - Knowledge Graph grows with usage (10K+ connections)\n   - Each client enriches platform intelligence\n   - Switching costs increase over time\n\n3. **Data Moat** (Defensibility: Medium-High)\n   - Strategic decision patterns across industries\n   - Validated frameworks from 100+ implementations\n   - Continuous learning from outcomes\n\n**Sustainability Timeline:**\n• Years 1-2: Methodology + Early network effects\n• Years 3-5: Data moat solidifies\n• Years 5+: Dominant position with high switching costs\n\n**Risk Factors:**\n⚠ OpenAI/Anthropic could build similar methodology\n⚠ Traditional consultancies digitizing offerings\n✓ Mitigation: Speed to scale + vertical specialization",
        insights: ["Multi-layered defensibility", "Time-based moat deepening", "Clear risk mitigation path"]
      }
    ]
  },
  M3_DUPLICATE_REMOVE: {
    // This is a duplicate entry - removing it
  }
};

// M6 Opportunity Matrix Data
const opportunityMatrixData = {
  scenario: "SaaS Platform - Growth Opportunities",
  context: "Current ARR: $15M | Team: 120 people | Runway: 18 months",
  opportunities: [
    {
      id: "enterprise",
      name: "Enterprise Tier Launch",
      description: "Launch dedicated enterprise offering with SSO, SLA, dedicated support",
      impact: 9,
      effort: 7,
      timeframe: "6 months",
      revenue: "$8-12M additional ARR",
      frameworks: ["EVA", "CSI"]
    },
    {
      id: "api",
      name: "API Platform",
      description: "Public API with usage-based pricing for developers",
      impact: 7,
      effort: 5,
      timeframe: "4 months",
      revenue: "$2-4M additional ARR",
      frameworks: ["NIA", "HYBRID"]
    },
    {
      id: "vertical",
      name: "Vertical Specialization",
      description: "Build industry-specific features for FinTech vertical",
      impact: 8,
      effort: 8,
      timeframe: "9 months",
      revenue: "$6-10M additional ARR",
      frameworks: ["CSI", "VTE"]
    },
    {
      id: "international",
      name: "EU Expansion",
      description: "Localize product and establish EU sales team",
      impact: 9,
      effort: 9,
      timeframe: "12 months",
      revenue: "$10-15M additional ARR",
      frameworks: ["ABRA", "EVA"]
    },
    {
      id: "integration",
      name: "Marketplace Integrations",
      description: "Build 20+ native integrations with popular tools",
      impact: 6,
      effort: 4,
      timeframe: "3 months",
      revenue: "$1-2M additional ARR",
      frameworks: ["NIA"]
    }
  ],
  generatePrioritization: (selectedOpps) => {
    const totalImpact = selectedOpps.reduce((sum, opp) => sum + opp.impact, 0);
    const totalEffort = selectedOpps.reduce((sum, opp) => sum + opp.effort, 0);
    const avgROI = selectedOpps.length > 0 ? (totalImpact / totalEffort) : 0;
    const score = Math.min(10, avgROI * 1.2);
    
    const sortedOpps = [...selectedOpps].sort((a, b) => (b.impact / b.effort) - (a.impact / a.effort));
    
    const risk = selectedOpps.length > 3 
      ? "High - Too many parallel initiatives"
      : selectedOpps.length > 2
      ? "Medium - Significant coordination needed"
      : "Low - Manageable execution";
    
    const resourceReq = totalEffort > 20 
      ? "Requires additional hiring (15-20 people)"
      : totalEffort > 12
      ? "Can execute with current team + 5-10 hires"
      : "Achievable with current resources";
    
    const recommendation = selectedOpps.length === 1
      ? "✅ Focus strategy - high execution probability"
      : selectedOpps.length === 2
      ? "🔄 Balanced approach - sequence carefully"
      : "⚠️ Consider prioritizing top 2 opportunities for better execution";
    
    return {
      score: score.toFixed(1),
      parallelExecutionRisk: risk,
      resourceRequirement: resourceReq,
      recommendation,
      sequencing: sortedOpps
    };
  }
};

const sandboxData = {
  M4: {
    title: "Financial Modeling Sandbox",
    scenario: "Series A Startup - Funding Round Planning",
    context: "Current ARR: $2.5M | Target: $8M ARR by Series B",
    interactive: true,
    inputs: {
      currentARR: { label: "Current ARR ($M)", min: 0, max: 10, default: 2.5, step: 0.5 },
      targetARR: { label: "Target ARR ($M)", min: 5, max: 50, default: 8, step: 1 },
      burnRate: { label: "Monthly Burn ($K)", min: 50, max: 500, default: 150, step: 25 },
      growthRate: { label: "Monthly Growth (%)", min: 5, max: 30, default: 12, step: 1 }
    },
    generateInsights: (inputs) => {
      const monthsToTarget = Math.log(inputs.targetARR / inputs.currentARR) / Math.log(1 + inputs.growthRate / 100);
      const totalBurn = inputs.burnRate * monthsToTarget / 1000;
      const requiredFunding = totalBurn * 1.5; // 50% buffer
      const runway = monthsToTarget;
      
      return {
        title: "AI-Generated Financial Projections",
        metrics: {
          "Time to Target": `${Math.round(monthsToTarget)} months`,
          "Required Funding": `$${requiredFunding.toFixed(1)}M`,
          "Implied Valuation": `$${(inputs.targetARR * 8).toFixed(0)}M`,
          "Burn Multiple": (inputs.burnRate / (inputs.currentARR * 1000 / 12)).toFixed(2),
          "Capital Efficiency": requiredFunding < 10 ? "Excellent" : requiredFunding < 20 ? "Good" : "Moderate"
        },
        recommendation: monthsToTarget < 18 && requiredFunding < 15 
          ? "✅ Strong position for Series A. Focus on growth with current burn."
          : monthsToTarget > 24 || requiredFunding > 20
          ? "⚠️ Consider reducing burn or increasing growth rate before fundraising."
          : "🔄 Balanced trajectory. Optimize unit economics before scaling.",
        risks: requiredFunding > 15 
          ? ["High capital requirement may limit investor interest", "Extended timeline increases market risk"]
          : ["Growing too fast may sacrifice unit economics", "Competition may accelerate while building"],
        opportunities: [
          `Raise $${(requiredFunding * 1.2).toFixed(1)}M to extend runway to 24+ months`,
          "Strategic partnership could reduce CAC by 30-40%",
          "Enterprise tier could boost ARPU by 2-3x"
        ]
      };
    }
  },
  M5: {
    title: "Strategic Synthesis Sandbox",
    scenario: "Series B SaaS Company - Growth vs. Profitability",
    context: "Annual Revenue: $15M ARR | Burn: $2M/month | Runway: 18 months",
    options: [
      {
        id: "growth",
        name: "Aggressive Growth",
        description: "Double sales team, expand to EU market",
        metrics: {
          "Revenue (Y1)": "$28M ARR",
          "Burn Rate": "$3.5M/month",
          "Time to Profitability": "36 months",
          "Market Share": "+12%",
          "Risk Level": "High"
        },
        frameworks: ["EVA", "NIA"],
        score: 7.2,
        pros: ["Market leadership potential", "Economies of scale", "Network effects"],
        cons: ["Funding risk", "Operational complexity", "Execution risk"]
      },
      {
        id: "balanced",
        name: "Balanced Approach",
        description: "Optimize unit economics while growing 40%",
        metrics: {
          "Revenue (Y1)": "$21M ARR",
          "Burn Rate": "$1.2M/month",
          "Time to Profitability": "18 months",
          "Market Share": "+6%",
          "Risk Level": "Medium"
        },
        frameworks: ["HYBRID", "CSI"],
        score: 8.5,
        pros: ["Sustainable growth", "Reduced funding risk", "Improved economics"],
        cons: ["Slower market capture", "Competitive pressure", "Talent retention"]
      },
      {
        id: "efficiency",
        name: "Efficiency Focus",
        description: "Path to profitability, optimize GTM",
        metrics: {
          "Revenue (Y1)": "$18M ARR",
          "Burn Rate": "$0.5M/month",
          "Time to Profitability": "12 months",
          "Market Share": "+2%",
          "Risk Level": "Low"
        },
        frameworks: ["VTE", "CSI"],
        score: 6.8,
        pros: ["Quick profitability", "Strong unit economics", "Reduced risk"],
        cons: ["Market share loss", "Slower growth", "Talent challenges"]
      }
    ],
    userInput: true,
    customInputEnabled: true
  },
  M6: opportunityMatrixData
};

export default function InteractiveDemo({ open, onClose }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [userInputs, setUserInputs] = useState({});
  const [generatedInsights, setGeneratedInsights] = useState(null);
  const [selectedOpportunities, setSelectedOpportunities] = useState([]);
  const [customScenario, setCustomScenario] = useState("");

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setCurrentStep(0);
    setSelectedOption(null);
    setShowInsights(false);
    setUserInputs({});
    setGeneratedInsights(null);
    setSelectedOpportunities([]);
    setCustomScenario("");
    
    // Initialize inputs with defaults for M4
    if (module.id === "M4" && sandboxData.M4?.inputs) {
      const defaults = {};
      Object.entries(sandboxData.M4.inputs).forEach(([key, config]) => {
        defaults[key] = config.default;
      });
      setUserInputs(defaults);
    }
  };

  const handleNextStep = () => {
    const module = guidedWalkthroughs[selectedModule.id] || guidedWalkthroughsM2M3[selectedModule.id];
    if (module && currentStep < module.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowInsights(false);
    }
  };

  const handleReset = () => {
    setSelectedModule(null);
    setCurrentStep(0);
    setSelectedOption(null);
    setShowInsights(false);
    setUserInputs({});
    setGeneratedInsights(null);
    setSelectedOpportunities([]);
    setCustomScenario("");
  };

  const handleGenerateInsights = () => {
    if (selectedModule.id === "M4") {
      const insights = sandboxData.M4.generateInsights(userInputs);
      setGeneratedInsights(insights);
    } else if (selectedModule.id === "M6") {
      const insights = sandboxData.M6.generatePrioritization(selectedOpportunities);
      setGeneratedInsights(insights);
    }
  };

  const handleOpportunityToggle = (opportunity) => {
    setSelectedOpportunities(prev => {
      const exists = prev.find(o => o.id === opportunity.id);
      if (exists) {
        return prev.filter(o => o.id !== opportunity.id);
      } else {
        return [...prev, opportunity];
      }
    });
    setGeneratedInsights(null);
  };

  const renderGuidedWalkthrough = () => {
    const walkthrough = guidedWalkthroughs[selectedModule.id] || guidedWalkthroughsM2M3[selectedModule.id];
    const step = walkthrough.steps[currentStep];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#00C8FF]/20 text-[#00C8FF]">
              Step {currentStep + 1} of {walkthrough.steps.length}
            </Badge>
            <span className="text-sm text-slate-400">{step.title}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* User Prompt */}
        <Card className="bg-[#0A1628]/80 border-[#00C8FF]/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00C8FF] to-[#16A9FF] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">You</span>
              </div>
              <p className="text-white text-sm pt-1">{step.prompt}</p>
            </div>
          </CardContent>
        </Card>

        {/* CAIO Response */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/5 border-white/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFC247] to-[#E0A43C] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-[#0A1628]" />
                </div>
                <div className="flex-1">
                  <div className="text-slate-200 text-sm whitespace-pre-line leading-relaxed">
                    {step.response}
                  </div>
                  
                  {/* Key Insights */}
                  {showInsights && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 space-y-2"
                    >
                      <p className="text-xs text-[#00C8FF] font-semibold uppercase">Key Insights</p>
                      {step.insights.map((insight, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span>{insight}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          {!showInsights ? (
            <Button
              onClick={() => setShowInsights(true)}
              className="bg-[#00C8FF]/20 text-[#00C8FF] border border-[#00C8FF]/30 hover:bg-[#00C8FF]/30"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Show Key Insights
            </Button>
          ) : (
            <>
              {currentStep < walkthrough.steps.length - 1 ? (
                <Button
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-[#00C8FF] to-[#16A9FF] text-white hover:from-[#00E5FF] hover:to-[#00C8FF]"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-[#FFC247] to-[#E0A43C] text-[#0A1628] hover:from-[#FFD247] hover:to-[#FFC247]"
                >
                  Try Another Module
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderSandbox = () => {
    const sandbox = sandboxData[selectedModule.id];

    // M4 Financial Modeling with user inputs
    if (selectedModule.id === "M4") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-[#FFC247]/20 text-[#FFC247]">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Financial Modeling
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Card className="bg-gradient-to-r from-[#10B981]/10 to-[#00C8FF]/10 border-[#10B981]/30">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-2">{sandbox.scenario}</h3>
              <p className="text-sm text-slate-300">{sandbox.context}</p>
            </CardContent>
          </Card>

          {/* Interactive Inputs */}
          <Card className="bg-white/5 border-white/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Edit3 className="w-4 h-4 text-[#00C8FF]" />
                <h4 className="text-white font-semibold text-sm">Adjust Your Assumptions</h4>
              </div>
              
              {Object.entries(sandbox.inputs).map(([key, config]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <label className="text-slate-300">{config.label}</label>
                    <span className="text-[#00C8FF] font-semibold">{userInputs[key] || config.default}</span>
                  </div>
                  <Slider
                    value={[userInputs[key] || config.default]}
                    onValueChange={(values) => {
                      setUserInputs(prev => ({ ...prev, [key]: values[0] }));
                      setGeneratedInsights(null);
                    }}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    className="w-full"
                  />
                </div>
              ))}

              <Button
                onClick={handleGenerateInsights}
                className="w-full bg-gradient-to-r from-[#00C8FF] to-[#10B981] text-white hover:from-[#00E5FF] hover:to-[#10B981] mt-4"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Insights
              </Button>
            </CardContent>
          </Card>

          {/* AI Generated Insights */}
          {generatedInsights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-[#00C8FF]/10 to-[#10B981]/10 border-[#00C8FF]/40">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FFC247]" />
                    <h4 className="text-white font-semibold">{generatedInsights.title}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(generatedInsights.metrics).map(([key, value]) => (
                      <div key={key} className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">{key}</p>
                        <p className="text-white font-semibold text-sm">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-sm text-slate-200">{generatedInsights.recommendation}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-red-400 font-semibold mb-2 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Key Risks
                      </p>
                      <ul className="space-y-1">
                        {generatedInsights.risks.map((risk, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-1">
                            <span className="text-red-400">•</span> {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-green-400 font-semibold mb-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Opportunities
                      </p>
                      <ul className="space-y-1">
                        {generatedInsights.opportunities.map((opp, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-1">
                            <span className="text-green-400">•</span> {opp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      );
    }

    // M6 Opportunity Matrix
    if (selectedModule.id === "M6") {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-[#F59E0B]/20 text-[#F59E0B]">
              <BarChart3 className="w-3 h-3 mr-1" />
              Opportunity Prioritization Matrix
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Card className="bg-gradient-to-r from-[#F59E0B]/10 to-[#00C8FF]/10 border-[#F59E0B]/30">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-2">{sandbox.scenario}</h3>
              <p className="text-sm text-slate-300 mb-3">{sandbox.context}</p>
              <p className="text-xs text-slate-400">
                💡 Select opportunities to analyze portfolio fit and execution sequencing
              </p>
            </CardContent>
          </Card>

          {/* Opportunities Grid */}
          <div className="space-y-3">
            {sandbox.opportunities.map((opp) => {
              const isSelected = selectedOpportunities.find(o => o.id === opp.id);
              const roi = (opp.impact / opp.effort).toFixed(2);
              
              return (
                <motion.div
                  key={opp.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleOpportunityToggle(opp)}
                >
                  <Card className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#F59E0B]/20 to-[#00C8FF]/20 border-[#F59E0B]/60'
                      : 'bg-white/5 border-white/20 hover:border-[#F59E0B]/40'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1">{opp.name}</h4>
                          <p className="text-xs text-slate-400 mb-2">{opp.description}</p>
                          <div className="flex gap-2 flex-wrap">
                            {opp.frameworks.map((fw) => (
                              <Badge key={fw} className="bg-[#00C8FF]/20 text-[#00C8FF] text-[10px]">
                                {fw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={`${
                            roi >= 1.2 ? 'bg-green-500/20 text-green-400' :
                            roi >= 1.0 ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          } text-xs`}>
                            ROI: {roi}
                          </Badge>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-[#F59E0B]" />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs mt-3 pt-3 border-t border-white/10">
                        <div>
                          <span className="text-slate-400">Impact: </span>
                          <span className="text-white font-semibold">{opp.impact}/10</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Effort: </span>
                          <span className="text-white font-semibold">{opp.effort}/10</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Timeline: </span>
                          <span className="text-white font-semibold">{opp.timeframe}</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                        💰 {opp.revenue}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {selectedOpportunities.length > 0 && (
            <Button
              onClick={handleGenerateInsights}
              className="w-full bg-gradient-to-r from-[#F59E0B] to-[#00C8FF] text-white hover:from-[#FF9500] hover:to-[#00E5FF]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Portfolio ({selectedOpportunities.length} selected)
            </Button>
          )}

          {/* Portfolio Analysis */}
          {generatedInsights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-[#F59E0B]/10 to-[#00C8FF]/10 border-[#F59E0B]/40">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FFC247]" />
                    <h4 className="text-white font-semibold">Portfolio Analysis</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Portfolio Score</p>
                      <p className="text-2xl font-bold text-[#F59E0B]">{generatedInsights.score}/10</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Execution Risk</p>
                      <p className="text-sm text-white font-semibold">{generatedInsights.parallelExecutionRisk}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-2">Resource Requirement</p>
                    <p className="text-sm text-slate-200">{generatedInsights.resourceRequirement}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-sm text-slate-200">{generatedInsights.recommendation}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#00C8FF] font-semibold mb-2">Recommended Sequencing:</p>
                    <div className="space-y-2">
                      {generatedInsights.sequencing.map((opp, idx) => (
                        <div key={opp.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                          <Badge className="bg-[#F59E0B]/20 text-[#F59E0B]">
                            #{idx + 1}
                          </Badge>
                          <span className="text-sm text-white flex-1">{opp.name}</span>
                          <span className="text-xs text-slate-400">ROI: {(opp.impact / opp.effort).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      );
    }

    // M5 Strategic Synthesis (existing)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-[#FFC247]/20 text-[#FFC247]">
            Interactive Sandbox
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Card className="bg-gradient-to-r from-[#00C8FF]/10 to-[#FFC247]/10 border-[#00C8FF]/30">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold mb-2">{sandbox.scenario}</h3>
            <p className="text-sm text-slate-300">{sandbox.context}</p>
          </CardContent>
        </Card>

        {/* Strategic Options */}
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Compare strategic options synthesized from TSI frameworks:</p>
          {sandbox.options.map((option) => (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedOption(option.id)}
            >
              <Card className={`cursor-pointer transition-all ${
                selectedOption === option.id
                  ? 'bg-gradient-to-br from-[#00C8FF]/20 to-[#FFC247]/20 border-[#FFC247]/60'
                  : 'bg-white/5 border-white/20 hover:border-[#00C8FF]/40'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold mb-1">{option.name}</h4>
                      <p className="text-xs text-slate-400">{option.description}</p>
                    </div>
                    <Badge className={`${
                      option.score >= 8 ? 'bg-green-500/20 text-green-400' :
                      option.score >= 7 ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      Score: {option.score}/10
                    </Badge>
                  </div>

                  {/* Frameworks Used */}
                  <div className="flex gap-2 mb-3">
                    {option.frameworks.map((fw) => (
                      <Badge key={fw} className="bg-[#00C8FF]/20 text-[#00C8FF] text-xs">
                        {fw}
                      </Badge>
                    ))}
                  </div>

                  {/* Metrics */}
                  {selectedOption === option.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3 pt-3 border-t border-white/10"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(option.metrics).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-slate-400">{key}:</span>
                            <span className="text-white ml-2 font-semibold">{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Pros & Cons */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-green-400 font-semibold mb-1">Pros</p>
                          <ul className="space-y-1">
                            {option.pros.map((pro, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-start gap-1">
                                <span className="text-green-400">+</span> {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs text-red-400 font-semibold mb-1">Cons</p>
                          <ul className="space-y-1">
                            {option.cons.map((con, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-start gap-1">
                                <span className="text-red-400">-</span> {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Custom Scenario Input for M5 */}
        {sandbox.customInputEnabled && !selectedOption && (
          <Card className="bg-white/5 border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Edit3 className="w-4 h-4 text-[#00C8FF]" />
                <h4 className="text-white font-semibold text-sm">Or Describe Your Own Scenario</h4>
              </div>
              <Textarea
                value={customScenario}
                onChange={(e) => setCustomScenario(e.target.value)}
                placeholder="E.g., 'We're a B2B marketplace with 50K sellers. Facing margin pressure from Amazon. Should we verticalize or go full-stack commerce?'"
                className="bg-[#0A1628] border-[#00C8FF]/30 text-white placeholder:text-slate-500 min-h-[80px]"
              />
              <Button
                onClick={() => {
                  if (customScenario.trim()) {
                    setGeneratedInsights({
                      title: "AI Strategic Analysis",
                      scenario: customScenario,
                      recommendation: "Based on your scenario, CAIO would orchestrate M1 (Market), M2 (Competitive), M4 (Financial), and M5 (Synthesis) modules to provide a comprehensive strategic recommendation. In the full platform, this would include real-time data integration, stakeholder analysis, and actionable implementation roadmap.",
                      frameworks: ["HYBRID", "CSI", "EVA"],
                      nextSteps: [
                        "Market sizing and competitive landscape (M1, M2)",
                        "Financial modeling for scenarios (M4)",
                        "Strategic options synthesis (M5)",
                        "Risk assessment and mitigation (M11)"
                      ]
                    });
                  }
                }}
                className="w-full mt-3 bg-gradient-to-r from-[#00C8FF] to-[#FFC247] text-white hover:from-[#00E5FF] hover:to-[#FFD247]"
                disabled={!customScenario.trim()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze My Scenario
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Custom Scenario Insights */}
        {customScenario && generatedInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-[#00C8FF]/10 to-[#FFC247]/10 border-[#00C8FF]/40">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FFC247]" />
                  <h4 className="text-white font-semibold">{generatedInsights.title}</h4>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Strategic Recommendation:</p>
                  <p className="text-sm text-slate-200">{generatedInsights.recommendation}</p>
                </div>

                <div>
                  <p className="text-xs text-[#00C8FF] font-semibold mb-2">Frameworks Applied:</p>
                  <div className="flex gap-2 flex-wrap">
                    {generatedInsights.frameworks.map((fw) => (
                      <Badge key={fw} className="bg-[#00C8FF]/20 text-[#00C8FF] text-xs">
                        {fw}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[#10B981] font-semibold mb-2">Next Steps in Full Platform:</p>
                  <ul className="space-y-1">
                    {generatedInsights.nextSteps.map((step, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-[#10B981] flex-shrink-0 mt-0.5" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedOption && (
          <div className="text-center pt-4">
            <p className="text-xs text-slate-400 mb-3">
              This is a simplified demo. Real CAIO analysis includes deeper financial modeling, risk assessment, and scenario planning.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-[#0A1628] border-[#00C8FF]/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#00C8FF] to-[#FFC247] flex items-center justify-center">
              <Play className="w-5 h-5 text-[#0A1628]" />
            </div>
            Interactive Demo
          </DialogTitle>
        </DialogHeader>

        {!selectedModule ? (
          <div className="space-y-6 py-4">
            <p className="text-slate-300 text-center">
              Explore CAIO·AI's capabilities through guided walkthroughs or interactive sandboxes
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              {demoModules.map((module) => {
                const Icon = module.icon;
                return (
                  <motion.div
                    key={module.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleModuleSelect(module)}
                  >
                    <Card className="cursor-pointer bg-white/5 border-white/20 hover:border-[#00C8FF]/50 transition-all">
                      <CardContent className="p-6 text-center">
                        <div
                          className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${module.color}20, ${module.color}10)`,
                            boxShadow: `0 0 20px ${module.color}30`
                          }}
                        >
                          <Icon className="w-8 h-8" style={{ color: module.color }} />
                        </div>
                        <Badge className="bg-[#00C8FF]/20 text-[#00C8FF] mb-2 text-xs">
                          {module.id}
                        </Badge>
                        <h3 className="text-white font-semibold mb-2">{module.name}</h3>
                        <p className="text-xs text-slate-400 mb-3">{module.description}</p>
                        <Badge className={`${
                          module.demoType === 'guided' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-purple-500/20 text-purple-400'
                        } text-xs`}>
                          {module.demoType === 'guided' ? '📚 Guided' : '🎮 Sandbox'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-xs text-slate-400">
                💡 This is a simplified demo. Actual CAIO·AI provides deeper analysis, real-time data integration, and full TSI v9.3 methodology.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-4">
            {selectedModule.demoType === 'guided' 
              ? renderGuidedWalkthrough() 
              : renderSandbox()
            }
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}