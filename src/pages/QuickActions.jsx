import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Map,
  Loader2,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QuickActionAssistantModal from "../components/quickactions/QuickActionAssistantModal";

export default function QuickActions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFunctionalArea, setSelectedFunctionalArea] = useState("all");
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState(null);

  const { data: quickActions = [], isLoading } = useQuery({
    queryKey: ["quickActions"],
    queryFn: () => base44.entities.QuickAction.list("-created_date"),
  });

  const allCategories = [...new Set(quickActions?.map(action => action.category))];
  const categories = allCategories.map(cat => ({ id: cat, label: cat.replace(/_/g, ' ') }));

  const allFunctionalAreas = [...new Set(quickActions?.map(action => action.functional_area).filter(Boolean))];
  const functionalAreas = allFunctionalAreas.map(area => ({ id: area, label: area }));

  const filteredActions = quickActions?.filter(action => {
    const matchesSearch = action.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.functional_area?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || action.category === selectedCategory;
    const matchesFunctionalArea = selectedFunctionalArea === "all" || action.functional_area === selectedFunctionalArea;

    return matchesSearch && matchesCategory && matchesFunctionalArea;
  });

  const handleExecuteAction = (action) => {
    setSelectedQuickAction(action);
    setIsAssistantModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
        <p className="text-white ml-4 text-lg">Loading Quick Actions...</p>
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
          {quickActions.length}+ pre-configured strategic analysis templates
        </p>
      </div>

      <Card className="bg-[#1A1D29] border-[#00D4FF]/20 backdrop-blur-sm mt-8 mb-4">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description or category..."
              className="pl-10 bg-[#0A2540] border-[#00D4FF]/30 text-white placeholder:text-[#94A3B8]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 mb-8">
        <div>
          <p className="text-sm text-slate-400 mb-2">Filter by Category</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6] font-medium" : "bg-[#1A1D29] border-[#00D4FF]/30 text-[#94A3B8] hover:bg-[#0A2540] hover:border-[#00D4FF]/50 hover:text-white"}
            >
              All Categories
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id)}
                className={selectedCategory === cat.id ? "bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6] font-medium" : "bg-[#1A1D29] border-[#00D4FF]/30 text-[#94A3B8] hover:bg-[#0A2540] hover:border-[#00D4FF]/50 hover:text-white"}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {functionalAreas.length > 0 && (
          <div>
            <p className="text-sm text-slate-400 mb-2">Filter by Functional Area</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedFunctionalArea === "all" ? "default" : "outline"}
                onClick={() => setSelectedFunctionalArea("all")}
                className={selectedFunctionalArea === "all" ? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED] font-medium" : "bg-[#1A1D29] border-[#8B5CF6]/30 text-[#94A3B8] hover:bg-[#0A2540] hover:border-[#8B5CF6]/50 hover:text-white"}
              >
                All Areas
              </Button>
              {functionalAreas.map((area) => (
                <Button
                  key={area.id}
                  variant={selectedFunctionalArea === area.id ? "default" : "outline"}
                  onClick={() => setSelectedFunctionalArea(area.id)}
                  className={selectedFunctionalArea === area.id ? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED] font-medium" : "bg-[#1A1D29] border-[#8B5CF6]/30 text-[#94A3B8] hover:bg-[#0A2540] hover:border-[#8B5CF6]/50 hover:text-white"}
                >
                  {area.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filteredActions?.length === 0 ? (
        <Card className="bg-[#1A1D29] border-[#00D4FF]/20 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Zap className="w-16 h-16 text-[#475569] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Quick Actions Found
            </h3>
            <p className="text-[#94A3B8]">
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

      <QuickActionAssistantModal
        open={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
        quickAction={selectedQuickAction}
      />
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
  const cardColorClass = action.color || "from-gray-500 to-gray-700";

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
      >
        <Card
          className="bg-[#1A1D29] border-[#00D4FF]/20 backdrop-blur-sm hover:bg-[#0A2540] cursor-pointer transition-all duration-300 group h-full flex flex-col"
          onClick={() => onClick(action)}
        >
          <CardHeader className="border-b border-[#00D4FF]/10 p-6">
            <div className="flex items-start justify-between mb-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${cardColorClass} flex items-center justify-center p-2`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Framework: {action.primary_framework}</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex flex-col gap-1 items-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 cursor-help">
                      {action.category?.replace(/_/g, ' ')}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Categoria de análise estratégica</p>
                  </TooltipContent>
                </Tooltip>
                {action.functional_area && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30 cursor-help">
                        {action.functional_area}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Área funcional</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              </div>
              <CardTitle className="text-white text-lg group-hover:text-[#00D4FF] transition-colors">
              {action.title}
              </CardTitle>
              <CardDescription className="text-[#94A3B8] text-sm mt-2">
              {action.description}
              </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-3 flex-grow">
              {action.primary_framework && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-slate-400 cursor-help">
                    <FlaskConical className="w-4 h-4 mr-2" />
                    Primary Framework: <span className="ml-1 text-white font-medium">{action.primary_framework}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Framework metodológico principal utilizado na análise</p>
                </TooltipContent>
              </Tooltip>
              )}
              {action.modules_activated && action.modules_activated.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-slate-400 cursor-help">
                    <Code className="w-4 h-4 mr-2" />
                    Modules: <span className="ml-1 text-white font-medium">{action.modules_activated.join(", ")}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Módulos TSI ativados para esta análise</p>
                </TooltipContent>
              </Tooltip>
              )}
              {action.estimated_time && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-slate-400 cursor-help">
                    <Timer className="w-4 h-4 mr-2" />
                    Est. Time: <span className="ml-1 text-green-400 font-medium">{action.estimated_time}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tempo estimado de processamento</p>
                </TooltipContent>
              </Tooltip>
              )}
              {action.confidence_range && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-slate-400 cursor-help">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confidence: <span className="ml-1 text-blue-400 font-medium">{action.confidence_range}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Nível de confiança esperado dos resultados</p>
                </TooltipContent>
              </Tooltip>
              )}
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}