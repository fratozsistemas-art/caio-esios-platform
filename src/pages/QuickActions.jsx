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
import CreateCustomActionDialog from "../components/quickactions/CreateCustomActionDialog";
import AISuggestionsPanel from "../components/quickactions/AISuggestionsPanel";

const FUNCTIONAL_AREA_COLORS = {
  'Strategy': { gradient: 'from-blue-500 to-blue-700', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  'Finance': { gradient: 'from-green-500 to-green-700', bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  'Marketing': { gradient: 'from-pink-500 to-pink-700', bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' },
  'Sales': { gradient: 'from-orange-500 to-orange-700', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  'Operations': { gradient: 'from-purple-500 to-purple-700', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  'HR': { gradient: 'from-yellow-500 to-yellow-700', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  'Technology': { gradient: 'from-cyan-500 to-cyan-700', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  'Risk & Compliance': { gradient: 'from-red-500 to-red-700', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  'Product': { gradient: 'from-indigo-500 to-indigo-700', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  'Customer Success': { gradient: 'from-teal-500 to-teal-700', bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400' },
  'Innovation': { gradient: 'from-fuchsia-500 to-fuchsia-700', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', text: 'text-fuchsia-400' },
  'Data & Analytics': { gradient: 'from-violet-500 to-violet-700', bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
  'Supply Chain': { gradient: 'from-amber-500 to-amber-700', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  'M&A': { gradient: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  'ESG & Sustainability': { gradient: 'from-lime-500 to-lime-700', bg: 'bg-lime-500/10', border: 'border-lime-500/30', text: 'text-lime-400' }
};

export default function QuickActions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFunctionalArea, setSelectedFunctionalArea] = useState("all");
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState(null);

  const { data: allQuickActions = [], isLoading } = useQuery({
    queryKey: ["quickActions"],
    queryFn: () => base44.entities.QuickAction.list("-created_date"),
  });

  const { data: customActions = [], refetch: refetchCustom } = useQuery({
    queryKey: ['custom-quick-actions'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const myActions = await base44.entities.CustomQuickAction.filter({
        created_by: user.email
      });
      const publicActions = await base44.entities.CustomQuickAction.filter({
        is_public: true
      });
      
      const combined = [...myActions, ...publicActions];
      const unique = Array.from(new Map(combined.map(a => [a.id, a])).values());
      return unique;
    }
  });

  // Remove duplicates based on title similarity
  const quickActions = React.useMemo(() => {
    const seen = new Map();
    return allQuickActions.filter(action => {
      const normalizedTitle = action.title.toLowerCase().trim();
      if (seen.has(normalizedTitle)) {
        return false;
      }
      seen.set(normalizedTitle, true);
      return true;
    });
  }, [allQuickActions]);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Quick Actions
          </h1>
          <p className="text-slate-400">
            {quickActions.length}+ pre-configured strategic analysis templates
          </p>
        </div>
        <CreateCustomActionDialog onActionCreated={() => refetchCustom()} />
      </div>

      <div className="mb-6">
        <AISuggestionsPanel />
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
              <Button
                variant={selectedFunctionalArea === "custom" ? "default" : "outline"}
                onClick={() => setSelectedFunctionalArea("custom")}
                className={selectedFunctionalArea === "custom" ? "bg-[#F43F5E] text-white hover:bg-[#E11D48] font-medium" : "bg-[#1A1D29] border-[#F43F5E]/30 text-[#94A3B8] hover:bg-[#0A2540] hover:border-[#F43F5E]/50 hover:text-white"}
              >
                ⭐ Custom ({customActions.length})
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedFunctionalArea === 'custom' ? (
        customActions.length === 0 ? (
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma Ação Personalizada
              </h3>
              <p className="text-slate-400 mb-4">
                Crie suas próprias quick actions customizadas
              </p>
              <CreateCustomActionDialog onActionCreated={() => refetchCustom()} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customActions.map((action, index) => {
              const colorConfig = FUNCTIONAL_AREA_COLORS['Innovation'];
              return (
                <QuickActionCard
                  key={action.id}
                  action={{
                    ...action,
                    functional_area: action.category,
                    icon: 'Sparkles',
                    primary_framework: 'Custom'
                  }}
                  index={index}
                  onClick={() => handleExecuteAction(action)}
                  colorConfig={colorConfig}
                />
              );
            })}
          </div>
        )
      ) : filteredActions?.length === 0 ? (
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
      ) : selectedFunctionalArea === 'all' ? (
        // Group by functional area
        <div className="space-y-8">
          {functionalAreas.map(area => {
            const areaActions = filteredActions.filter(a => a.functional_area === area.id);
            if (areaActions.length === 0) return null;
            const colorConfig = FUNCTIONAL_AREA_COLORS[area.id] || FUNCTIONAL_AREA_COLORS['Strategy'];

            return (
              <div key={area.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${colorConfig.gradient}`} />
                  <h2 className={`text-xl font-bold ${colorConfig.text}`}>
                    {area.label}
                  </h2>
                  <Badge className={`${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}>
                    {areaActions.length} actions
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {areaActions.map((action, index) => (
                    <QuickActionCard
                      key={action.id}
                      action={action}
                      index={index}
                      onClick={() => handleExecuteAction(action)}
                      colorConfig={colorConfig}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Show all in grid when area is selected
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActions.map((action, index) => {
            const colorConfig = FUNCTIONAL_AREA_COLORS[action.functional_area] || FUNCTIONAL_AREA_COLORS['Strategy'];
            return (
              <QuickActionCard
                key={action.id}
                action={action}
                index={index}
                onClick={() => handleExecuteAction(action)}
                colorConfig={colorConfig}
              />
            );
          })}
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

function QuickActionCard({ action, index, onClick, colorConfig }) {
  const IconComponent = iconMap[action.icon] || Zap;
  const colors = colorConfig || FUNCTIONAL_AREA_COLORS[action.functional_area] || FUNCTIONAL_AREA_COLORS['Strategy'];

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
      >
        <Card
          className={`bg-[#1A1D29] border-2 ${colors.border} backdrop-blur-sm hover:bg-[#0A2540] cursor-pointer transition-all duration-300 group h-full flex flex-col hover:shadow-lg hover:shadow-${colors.text}/20`}
          onClick={() => onClick(action)}
        >
          <CardHeader className={`border-b ${colors.border} p-6`}>
            <div className="flex items-start justify-between mb-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colors.gradient} flex items-center justify-center p-2 shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Framework: {action.primary_framework}</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex flex-col gap-1 items-end">
                {action.functional_area && (
                  <Badge className={`${colors.bg} ${colors.text} ${colors.border} text-xs font-semibold`}>
                    {action.functional_area}
                  </Badge>
                )}
              </div>
            </div>
            <CardTitle className={`text-white text-lg group-hover:${colors.text} transition-colors`}>
              {action.title}
            </CardTitle>
            <CardDescription className="text-[#94A3B8] text-sm mt-2">
              {action.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3 flex-grow">
            {action.primary_framework && (
              <div className="flex items-center text-xs text-slate-400">
                <FlaskConical className="w-4 h-4 mr-2" />
                <span className="ml-1 text-white font-medium">{action.primary_framework}</span>
              </div>
            )}
            {action.modules_activated && action.modules_activated.length > 0 && (
              <div className="flex items-center text-xs text-slate-400">
                <Code className="w-4 h-4 mr-2" />
                <span className="ml-1 text-white font-medium">{action.modules_activated.join(", ")}</span>
              </div>
            )}
            {action.estimated_time && (
              <div className="flex items-center text-xs text-slate-400">
                <Timer className="w-4 h-4 mr-2" />
                <span className={`ml-1 ${colors.text} font-medium`}>{action.estimated_time}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}