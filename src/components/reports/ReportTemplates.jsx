import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Target,
  DollarSign,
  Users,
  BarChart3,
  Zap,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

const templates = [
  {
    id: "executive_summary",
    name: "Executive Summary",
    description: "High-level overview for C-suite decision makers",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-500",
    sections: ["Key Metrics", "Strategic Highlights", "Action Items", "Recommendations"],
    useCase: "Board meetings, quarterly reviews"
  },
  {
    id: "detailed_analysis",
    name: "Detailed Analysis",
    description: "Comprehensive deep-dive into strategic initiatives",
    icon: BarChart3,
    color: "from-purple-500 to-pink-500",
    sections: ["Market Analysis", "Competitive Intelligence", "Financial Projections", "Risk Assessment"],
    useCase: "Strategic planning, due diligence"
  },
  {
    id: "competitive_landscape",
    name: "Competitive Landscape",
    description: "Market positioning and competitive dynamics",
    icon: Target,
    color: "from-green-500 to-emerald-500",
    sections: ["Market Share Analysis", "Competitor Profiles", "SWOT Analysis", "Positioning Map"],
    useCase: "Market entry, competitive strategy"
  },
  {
    id: "financial_review",
    name: "Financial Review",
    description: "Financial performance and forecasting",
    icon: DollarSign,
    color: "from-yellow-500 to-orange-500",
    sections: ["Revenue Analysis", "Cost Structure", "Profitability Metrics", "Financial Projections"],
    useCase: "Board reports, investor updates"
  },
  {
    id: "strategic_roadmap",
    name: "Strategic Roadmap",
    description: "Implementation timeline and milestones",
    icon: Zap,
    color: "from-red-500 to-pink-500",
    sections: ["Initiative Timeline", "Resource Allocation", "Key Milestones", "Dependencies"],
    useCase: "Execution planning, program management"
  },
  {
    id: "stakeholder_report",
    name: "Stakeholder Report",
    description: "Tailored communications for stakeholders",
    icon: Users,
    color: "from-indigo-500 to-purple-500",
    sections: ["Stakeholder Analysis", "Communication Plan", "Progress Updates", "Next Steps"],
    useCase: "Stakeholder management, change management"
  }
];

export default function ReportTemplates({ onSelectTemplate }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template, idx) => {
        const Icon = template.icon;
        return (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-all h-full group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline" className="border-white/20 text-slate-400 text-xs">
                    Template
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{template.description}</p>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Includes:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.sections.map((section) => (
                      <Badge key={section} className="bg-white/5 text-slate-400 border-white/10 text-xs">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-slate-500 mb-1">Best for:</p>
                  <p className="text-sm text-slate-300">{template.useCase}</p>
                </div>

                <Button
                  onClick={() => onSelectTemplate(template)}
                  className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-400 border border-blue-500/30"
                >
                  Use Template
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}