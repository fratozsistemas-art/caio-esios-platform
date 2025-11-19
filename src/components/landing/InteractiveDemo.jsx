import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  CheckCircle
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
    id: "M5",
    name: "Strategic Synthesis",
    icon: Lightbulb,
    color: "#FFC247",
    description: "Integrate frameworks into strategic options",
    demoType: "sandbox"
  },
  {
    id: "M2",
    name: "Competitive Intelligence",
    icon: Target,
    color: "#16A9FF",
    description: "Competitive positioning analysis",
    demoType: "guided"
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
    ]
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
      }
    ]
  }
};

const sandboxData = {
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
    ]
  }
};

export default function InteractiveDemo({ open, onClose }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showInsights, setShowInsights] = useState(false);

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setCurrentStep(0);
    setSelectedOption(null);
    setShowInsights(false);
  };

  const handleNextStep = () => {
    const module = guidedWalkthroughs[selectedModule.id];
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
  };

  const renderGuidedWalkthrough = () => {
    const walkthrough = guidedWalkthroughs[selectedModule.id];
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

        {/* Scenario Context */}
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