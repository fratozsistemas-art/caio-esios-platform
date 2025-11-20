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
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import QuickActionAssistantModal from "../components/quickactions/QuickActionAssistantModal";

export default function QuickActions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState(null);

  const { data: quickActions = [], isLoading } = useQuery({
    queryKey: ["quickActions"],
    queryFn: () => base44.entities.QuickAction.list("-created_date"),
  });

  const allCategories = [...new Set(quickActions?.map(action => action.category))];
  const categories = allCategories.map(cat => ({ id: cat, label: cat.replace(/_/g, ' ') }));

  const filteredActions = quickActions?.filter(action => {
    const matchesSearch = action.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || action.category === selectedCategory;

    return matchesSearch && matchesCategory;
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

      {filteredActions?.length === 0 ? (
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
              {action.category?.replace(/_/g, ' ')}
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