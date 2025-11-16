
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Zap,
  TrendingUp,
  Target,
  Briefcase,
  Users,
  Code,
  DollarSign,
  BarChart3,
  Shield,
  Brain,
  Lightbulb,
  Rocket,
  Globe,
  Sparkles,
  Timer,
  FlaskConical,
  CheckCircle,
  AlertCircle,
  FileText,
  Map
} from "lucide-react";
import { motion } from "framer-motion";

export default function QuickActions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const quickActionsData = [
    {
      id: "market_sizing",
      title: "Market Sizing & TAM/SAM/SOM",
      description: "Calculate addressable market with bottom-up and top-down methods",
      category: "market_intelligence",
      icon: "TrendingUp",
      color: "from-blue-500 to-cyan-500",
      estimated_time: "5 min",
      primary_framework: "M1",
      modules_activated: ["M1"],
      confidence_range: "85-95%",
      prompt_template: `You are a Market Intelligence expert specializing in market sizing...`
    },
    {
      id: "competitive_analysis",
      title: "Competitive Landscape Analysis",
      description: "Deep dive into competitors, positioning, and strategic gaps",
      category: "competitive_intelligence",
      icon: "Target",
      color: "from-purple-500 to-pink-500",
      estimated_time: "10 min",
      primary_framework: "M2",
      modules_activated: ["M2"],
      confidence_range: "80-90%",
      prompt_template: `You are a Competitive Intelligence expert using Module M2...`
    },
    {
      id: "financial_modeling",
      title: "Financial Model & Unit Economics",
      description: "Build financial projections, calculate LTV/CAC, break-even analysis",
      category: "financial_planning",
      icon: "DollarSign",
      color: "from-green-500 to-emerald-500",
      estimated_time: "8 min",
      primary_framework: "M4",
      modules_activated: ["M4"],
      confidence_range: "75-85%",
      prompt_template: `You are a Financial Modeling expert using Module M4...`
    },
    {
      id: "gtm_strategy",
      title: "Go-to-Market Strategy",
      description: "Design launch strategy, channels, positioning, and tactics",
      category: "strategy_execution",
      icon: "Rocket",
      color: "from-orange-500 to-red-500",
      estimated_time: "12 min",
      primary_framework: "M6",
      modules_activated: ["M6", "M7"],
      confidence_range: "80-90%",
      prompt_template: `You are a Go-to-Market Strategy expert...`
    },
    {
      id: "risk_modeling",
      title: "Risk Assessment & Mitigation",
      description: "Identify, quantify, and prioritize business risks with mitigation strategies",
      category: "risk_management",
      icon: "Shield",
      color: "from-red-500 to-pink-500",
      estimated_time: "7 min",
      primary_framework: "ABRA",
      modules_activated: ["M5", "M8"],
      confidence_range: "85-95%",
      prompt_template: `You are a Risk Management expert...`
    },
    {
      id: "fundraising_strategy",
      title: "Fundraising Strategy & Investor Targeting",
      description: "Design fundraising approach, identify target investors, build narrative",
      category: "fundraising",
      icon: "TrendingUp",
      color: "from-indigo-500 to-purple-500",
      estimated_time: "10 min",
      primary_framework: "M9",
      modules_activated: ["M9", "M4"],
      confidence_range: "80-90%",
      prompt_template: `You are a Fundraising Strategy expert using Module M9...`
    },
    {
      id: "customer_segmentation",
      title: "Customer Segmentation & Personas",
      description: "Identify and profile target customer segments with behavioral patterns",
      category: "customer_intelligence",
      icon: "Users",
      color: "from-cyan-500 to-blue-500",
      estimated_time: "6 min",
      primary_framework: "HYBRID",
      modules_activated: ["M1", "M5"],
      confidence_range: "85-92%",
      prompt_template: `You are a Customer Intelligence expert...`
    },
    {
      id: "pricing_strategy",
      title: "Pricing Strategy & Optimization",
      description: "Design pricing model, tiers, and optimization strategy",
      category: "revenue_optimization",
      icon: "DollarSign",
      color: "from-yellow-500 to-orange-500",
      estimated_time: "8 min",
      primary_framework: "M4",
      modules_activated: ["M4", "M5"],
      confidence_range: "80-88%",
      prompt_template: `You are a Pricing Strategy expert...`
    },
    {
      id: "product_roadmap",
      title: "Product Roadmap & Prioritization",
      description: "Build product roadmap with feature prioritization framework",
      category: "product_strategy",
      icon: "Map",
      color: "from-pink-500 to-rose-500",
      estimated_time: "10 min",
      primary_framework: "M7",
      modules_activated: ["M7", "M6"],
      confidence_range: "82-90%",
      prompt_template: `You are a Product Strategy expert...`
    },
    {
      id: "churn_analysis",
      title: "Churn Analysis & Retention Strategy",
      description: "Analyze churn drivers and design retention improvement plan",
      category: "customer_success",
      icon: "AlertCircle",
      color: "from-red-500 to-orange-500",
      estimated_time: "7 min",
      primary_framework: "M4",
      modules_activated: ["M4", "M5"],
      confidence_range: "78-86%",
      prompt_template: `You are a Customer Success & Retention expert...`
    },
    {
      id: "partnership_strategy",
      title: "Strategic Partnerships & Alliances",
      description: "Identify and prioritize partnership opportunities with execution plan",
      category: "growth_strategy",
      icon: "Users",
      color: "from-teal-500 to-green-500",
      estimated_time: "9 min",
      primary_framework: "NIA",
      modules_activated: ["M2", "M6"],
      confidence_range: "75-85%",
      prompt_template: `You are a Strategic Partnerships expert...`
    },
    {
      id: "sales_playbook",
      title: "Sales Process & Playbook Design",
      description: "Build repeatable sales process with messaging and tactics",
      category: "sales_enablement",
      icon: "TrendingUp",
      color: "from-green-500 to-teal-500",
      estimated_time: "11 min",
      primary_framework: "M7",
      modules_activated: ["M7", "M5"],
      confidence_range: "80-88%",
      prompt_template: `You are a Sales Strategy expert...`
    },
    {
      id: "content_strategy",
      title: "Content Marketing Strategy",
      description: "Design content strategy with topics, channels, and distribution plan",
      category: "marketing_strategy",
      icon: "FileText",
      color: "from-purple-500 to-indigo-500",
      estimated_time: "8 min",
      primary_framework: "M7",
      modules_activated: ["M1", "M7"],
      confidence_range: "80-88%",
      prompt_template: `You are a Content Strategy expert...`
    },
    {
      id: "tech_stack_strategy",
      title: "Technology Stack Selection",
      description: "Evaluate and recommend technology stack for product development",
      category: "technology_strategy",
      icon: "Code",
      color: "from-indigo-500 to-blue-500",
      estimated_time: "9 min",
      primary_framework: "M3",
      modules_activated: ["M3"],
      confidence_range: "85-92%",
      prompt_template: `You are a Technology Architecture expert...`
    },
    {
      id: "hiring_plan",
      title: "Strategic Hiring Plan",
      description: "Design hiring roadmap with roles, timeline, and budget",
      category: "people_operations",
      icon: "Users",
      color: "from-pink-500 to-purple-500",
      estimated_time: "7 min",
      primary_framework: "M7",
      modules_activated: ["M7"],
      confidence_range: "80-88%",
      prompt_template: `You are a Talent Strategy expert...`
    }
  ];

  const quickActions = quickActionsData;
  const isLoading = false;

  const allCategories = [...new Set(quickActions.map(action => action.category))];
  const categories = allCategories.map(cat => ({ id: cat, label: cat.replace(/_/g, ' ') }));

  const filteredActions = quickActions.filter(action => {
    const matchesSearch = action.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || action.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleExecuteAction = (action) => {
    navigate(createPageUrl("Chat"), {
      state: { quickAction: action }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white">Loading Quick Actions...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Quick Actions
        </h1>
        <p className="text-slate-400">
          15+ pre-configured strategic analysis templates
        </p>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm mt-8 mb-4">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description or category..."
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategory("all")}
          className={selectedCategory === "all" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500"}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat.id)}
            className={selectedCategory === cat.id ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500"}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {filteredActions.length === 0 ? (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Quick Actions Found
            </h3>
            <p className="text-slate-400">
              Try adjusting your filters or search query
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActions.map((action, index) => (
            <QuickActionCard
              key={action.id}
              action={action}
              index={index}
              onClick={() => handleExecuteAction(action)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const iconMap = {
    TrendingUp,
    Target,
    DollarSign,
    Rocket,
    Shield,
    Brain,
    Users,
    Code,
    Lightbulb,
    Globe,
    Sparkles,
    Briefcase,
    Zap,
    BarChart3,
    Timer,
    FlaskConical,
    CheckCircle,
    AlertCircle,
    FileText,
    Map
};

function QuickActionCard({ action, index, onClick }) {
  const IconComponent = iconMap[action.icon] || Zap;
  const cardColorClass = action.color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Card
        className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 cursor-pointer transition-all duration-300 group h-full flex flex-col"
        onClick={() => onClick(action)}
      >
        <CardHeader className="border-b border-white/10 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${cardColorClass} flex items-center justify-center p-2`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {action.category.replace(/_/g, ' ')}
            </span>
          </div>
          <CardTitle className="text-white text-lg group-hover:text-blue-400 transition-colors">
            {action.title}
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm mt-2">
            {action.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-3 flex-grow">
          {action.primary_framework && (
            <div className="flex items-center text-xs text-slate-400">
              <FlaskConical className="w-4 h-4 mr-2" />
              Primary Framework: <span className="ml-1 text-white font-medium">{action.primary_framework}</span>
            </div>
          )}
          {action.modules_activated && action.modules_activated.length > 0 && (
            <div className="flex items-center text-xs text-slate-400">
              <Code className="w-4 h-4 mr-2" />
              Modules: <span className="ml-1 text-white font-medium">{action.modules_activated.join(", ")}</span>
            </div>
          )}
          {action.estimated_time && (
            <div className="flex items-center text-xs text-slate-400">
              <Timer className="w-4 h-4 mr-2" />
              Est. Time: <span className="ml-1 text-green-400 font-medium">{action.estimated_time}</span>
            </div>
          )}
          {action.confidence_range && (
            <div className="flex items-center text-xs text-slate-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confidence: <span className="ml-1 text-blue-400 font-medium">{action.confidence_range}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
