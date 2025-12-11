import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Layers, Target, Shield, Network, Eye, Server,
  Zap, TrendingUp, Users, CheckCircle, AlertCircle, Clock,
  ArrowRight, ChevronRight, Activity, BarChart3, RefreshCw,
  Sparkles, BookOpen, ArrowUpRight, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Architecture Data Configuration
const ARCHITECTURE_DATA = {
  metaCognitive: {
    name: "NÍVEL 0: Meta-Cognitive Layer",
    description: "Foundation — Triple-Substrate + 3 Meta-Capabilities",
    components: [
      {
        id: "triple-substrate",
        name: "Triple-Substrate Intelligence",
        icon: Brain,
        maturity: 1,
        targetMaturity: 4,
        color: "purple",
        substrates: [
          { name: "Stakeholder Consciousness", status: "partial", progress: 35 },
          { name: "Enterprise Consciousness", status: "planned", progress: 10 },
          { name: "Environment Consciousness", status: "planned", progress: 15 }
        ]
      },
      {
        id: "tv",
        name: "TV (Transformational Vision)",
        mentalModel: "VTE",
        icon: Eye,
        maturity: 2,
        targetMaturity: 4,
        color: "blue"
      },
      {
        id: "eaa",
        name: "EAA (Elastic Adaptive Action)",
        mentalModel: "EVA",
        icon: Zap,
        maturity: 2,
        targetMaturity: 4,
        color: "cyan"
      },
      {
        id: "idc",
        name: "IDC (Integrated Decision Capacity)",
        mentalModel: "CSI",
        icon: Target,
        maturity: 2,
        targetMaturity: 4,
        color: "indigo"
      }
    ]
  },
  cognitiveReasoning: {
    name: "NÍVEL 1: Cognitive Reasoning Layer",
    description: "4 Metamodels + CRV Validation Gate",
    components: [
      {
        id: "abr",
        name: "ABR (Adaptive Business Reasoning)",
        icon: Network,
        maturity: 2,
        targetMaturity: 4,
        color: "indigo"
      },
      {
        id: "nia-meta",
        name: "NIA (Network Intelligence Amplification)",
        mentalModel: "IA+",
        icon: Network,
        maturity: 2,
        targetMaturity: 4,
        color: "blue"
      },
      {
        id: "hyb",
        name: "HYB (Hybrid Value Creation)",
        icon: Layers,
        maturity: 2,
        targetMaturity: 4,
        color: "purple"
      },
      {
        id: "soc",
        name: "SOC (Strategic Orchestration)",
        mentalModel: "GAYA + C-SUITES",
        icon: Users,
        maturity: 2,
        targetMaturity: 4,
        color: "pink"
      },
      {
        id: "crv",
        name: "CRV Validation Gate",
        icon: CheckCircle,
        maturity: 3,
        targetMaturity: 5,
        color: "green",
        isGate: true
      }
    ]
  },
  coreLayers: {
    name: "NÍVEL 2: Core Intelligence Layer",
    description: "7 Layers + M1-M11 Modules",
    layers: [
      {
        id: "caio",
        layer: 1,
        name: "CAIO",
        fullName: "Core AI Operator",
        icon: Brain,
        maturity: 4,
        targetMaturity: 5,
        color: "blue",
        modules: ["M1", "M2", "M3", "M4", "M5", "M9"],
        activeModules: 5
      },
      {
        id: "tsi",
        layer: 2,
        name: "TSI",
        fullName: "Transformador Sistêmico",
        icon: Layers,
        maturity: 3,
        targetMaturity: 5,
        color: "purple",
        modules: ["M5"],
        activeModules: 1
      },
      {
        id: "tis",
        layer: 3,
        name: "TIS",
        fullName: "Interpretativo Sistêmico",
        icon: Eye,
        maturity: 3,
        targetMaturity: 5,
        color: "pink",
        modules: ["M3", "M8", "M10"],
        activeModules: 3
      },
      {
        id: "esios",
        layer: 4,
        name: "ESIOS",
        fullName: "Executive Systems OS",
        icon: Zap,
        maturity: 3,
        targetMaturity: 5,
        color: "orange",
        modules: ["M6", "M7"],
        activeModules: 2
      },
      {
        id: "hermes",
        layer: 5,
        name: "HERMES",
        fullName: "Trust & Integrity",
        icon: Shield,
        maturity: 3,
        targetMaturity: 5,
        color: "amber",
        modules: ["M11"],
        activeModules: 1
      },
      {
        id: "nimr",
        layer: 6,
        name: "NIMR",
        fullName: "Neural Intelligence Memory",
        icon: Server,
        maturity: 3,
        targetMaturity: 5,
        color: "emerald",
        modules: ["M10"],
        activeModules: 1,
        renamed: true
      },
      {
        id: "eva",
        layer: 7,
        name: "EVA",
        fullName: "External Validation",
        icon: Activity,
        maturity: 2,
        targetMaturity: 5,
        color: "red",
        modules: ["CRV"],
        activeModules: 1
      }
    ]
  },
  patternSynthesis: {
    name: "Pattern Synthesis System",
    levels: [
      { name: "HYPOTHESIS", range: "50-59%", count: 12, color: "red" },
      { name: "EMERGING", range: "60-79%", count: 8, color: "yellow" },
      { name: "VALIDATED", range: "80-94%", count: 5, color: "green" },
      { name: "MATURE", range: "95-100%", count: 2, color: "emerald" }
    ],
    totalPatterns: 27,
    avgConfidence: 68
  }
};

// Maturity Colors and Labels
const getMaturityColor = (level) => {
  const colors = {
    1: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", progress: "bg-red-500" },
    2: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", progress: "bg-orange-500" },
    3: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30", progress: "bg-yellow-500" },
    4: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30", progress: "bg-green-500" },
    5: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", progress: "bg-emerald-500" }
  };
  return colors[level] || colors[1];
};

const getMaturityLabel = (level) => {
  const labels = { 1: "LOW", 2: "LOW+", 3: "MEDIUM", 4: "HIGH", 5: "VERY HIGH" };
  return labels[level] || "N/A";
};

// Component: Maturity Badge
function MaturityBadge({ level, target, showTarget = true }) {
  const colors = getMaturityColor(level);
  return (
    <div className="flex items-center gap-2">
      <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
        {level}/5 ({getMaturityLabel(level)})
      </Badge>
      {showTarget && target && level < target && (
        <span className="text-xs text-slate-500">→ {target}/5</span>
      )}
    </div>
  );
}

// Component: Progress Ring
function ProgressRing({ value, size = 60, strokeWidth = 6, color = "cyan" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const colorMap = {
    cyan: "#00D4FF",
    purple: "#A855F7",
    green: "#10B981",
    amber: "#F59E0B",
    red: "#EF4444"
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colorMap[color] || colorMap.cyan}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        className="fill-white text-sm font-bold transform rotate-90"
        style={{ transformOrigin: 'center' }}
      >
        {value}%
      </text>
    </svg>
  );
}

// Component: Layer Card
function LayerCard({ layer, onClick }) {
  const Icon = layer.icon;
  const colors = getMaturityColor(layer.maturity);
  const progressPercent = (layer.maturity / 5) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(layer)}
      className="cursor-pointer"
    >
      <Card className={`bg-white/5 border-white/10 hover:border-${layer.color}-500/50 transition-all`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-lg bg-${layer.color}-500/20 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 text-${layer.color}-400`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/10 text-white text-xs">L{layer.layer}</Badge>
                  <span className="text-white font-semibold">{layer.name}</span>
                  {layer.renamed && (
                    <Badge className="bg-amber-500/20 text-amber-400 text-xs">RENAMED</Badge>
                  )}
                </div>
                <p className="text-slate-400 text-xs">{layer.fullName}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Maturity</span>
              <MaturityBadge level={layer.maturity} target={layer.targetMaturity} />
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Modules: {layer.modules.join(", ")}</span>
              <span>{layer.activeModules} active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Component: Meta-Capability Card
function MetaCapabilityCard({ component, onClick }) {
  const Icon = component.icon;
  const colors = getMaturityColor(component.maturity);
  const progressPercent = (component.maturity / 5) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick(component)}
      className="cursor-pointer"
    >
      <Card className={`bg-white/5 border-white/10 hover:border-${component.color}-500/50 transition-all h-full`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg bg-${component.color}-500/20 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${component.color}-400`} />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">{component.name}</p>
              {component.mentalModel && (
                <Badge className="bg-purple-500/20 text-purple-400 text-xs mt-1">
                  → {component.mentalModel}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Progress value={progressPercent} className="h-2 flex-1 mr-2" />
              <span className={`text-xs font-bold ${colors.text}`}>{component.maturity}/5</span>
            </div>
            {component.substrates && (
              <div className="space-y-1 mt-2">
                {component.substrates.map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 truncate">{sub.name}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${sub.status === 'partial' ? 'bg-yellow-500' : 'bg-slate-600'}`}
                          style={{ width: `${sub.progress}%` }}
                        />
                      </div>
                      <span className="text-slate-500 w-8">{sub.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Main Dashboard Component
export default function ArchitectureDashboard() {
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Auto-run assessment on first admin login daily
  useEffect(() => {
    const runDailyAssessment = async () => {
      try {
        const user = await base44.auth.me();
        if (user.role !== 'admin') return;

        const lastRun = localStorage.getItem('last_arch_assessment');
        const today = new Date().toDateString();
        
        if (lastRun !== today) {
          setIsRefreshing(true);
          await base44.functions.invoke('selfAssessCapabilities', {});
          localStorage.setItem('last_arch_assessment', today);
          queryClient.invalidateQueries();
          setIsRefreshing(false);
        }
      } catch (error) {
        console.error('Auto-assessment failed:', error);
      }
    };

    runDailyAssessment();
  }, []);

  // Fetch latest assessment
  const { data: latestAssessment } = useQuery({
    queryKey: ['arch-assessment'],
    queryFn: async () => {
      const analyses = await base44.entities.Analysis.filter({
        category: 'Platform Assessment'
      }, '-created_date', 1);
      return analyses[0]?.results || null;
    }
  });

  // Calculate overall metrics
  const calculateOverallMaturity = () => {
    const allComponents = [
      ...ARCHITECTURE_DATA.metaCognitive.components,
      ...ARCHITECTURE_DATA.cognitiveReasoning.components,
      ...ARCHITECTURE_DATA.coreLayers.layers
    ];
    const total = allComponents.reduce((sum, c) => sum + c.maturity, 0);
    return Math.round((total / allComponents.length) * 20);
  };

  const overallMaturity = latestAssessment?.readiness_score || calculateOverallMaturity();

  // Fetch real pattern data if available
  const { data: memories = [] } = useQuery({
    queryKey: ['pattern_memories'],
    queryFn: () => base44.entities.InstitutionalMemory.list('-created_date', 50)
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await base44.functions.invoke('selfAssessCapabilities', {});
      queryClient.invalidateQueries();
      toast.success('Architecture assessment refreshed');
    } catch (error) {
      toast.error('Refresh failed: ' + error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/f032804a4_CAIOAIlogooficial.png" 
              alt="CAIO·AI" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Architecture Dashboard v10.0</h1>
              <p className="text-slate-400 text-sm">Real-time System Maturity & Agent Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('CAIOArchitectureDoc')}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <BookOpen className="w-4 h-4 mr-2" />
                Full Documentation
              </Button>
            </Link>
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              className="border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-[#00D4FF]/10 to-[#00D4FF]/5 border-[#00D4FF]/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">Overall Maturity</p>
                <p className="text-2xl font-bold text-white">{overallMaturity}%</p>
                <p className="text-[#00D4FF] text-xs">Target: 80%</p>
              </div>
              <ProgressRing value={overallMaturity} color="cyan" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">Mental Models</p>
                <p className="text-2xl font-bold text-white">9/9</p>
                <p className="text-purple-400 text-xs">Mapped</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">Active Layers</p>
                <p className="text-2xl font-bold text-white">7/7</p>
                <p className="text-amber-400 text-xs">Operational</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Layers className="w-6 h-6 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">Pattern Confidence</p>
                <p className="text-2xl font-bold text-white">{ARCHITECTURE_DATA.patternSynthesis.avgConfidence}%</p>
                <p className="text-emerald-400 text-xs">{ARCHITECTURE_DATA.patternSynthesis.totalPatterns} patterns</p>
              </div>
              <ProgressRing value={ARCHITECTURE_DATA.patternSynthesis.avgConfidence} color="green" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#00D4FF]/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="layers" className="data-[state=active]:bg-purple-500/20">
              <Layers className="w-4 h-4 mr-2" />
              7 Layers
            </TabsTrigger>
            <TabsTrigger value="meta" className="data-[state=active]:bg-cyan-500/20">
              <Brain className="w-4 h-4 mr-2" />
              Meta-Cognitive
            </TabsTrigger>
            <TabsTrigger value="patterns" className="data-[state=active]:bg-emerald-500/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Pattern Synthesis
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Live Assessment Banner */}
            {latestAssessment && (
              <Card className="bg-gradient-to-r from-[#00D4FF]/10 to-[#C7A763]/10 border-[#00D4FF]/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold mb-1">Live Platform Assessment Active</p>
                      <p className="text-[#94A3B8] text-sm">Readiness: {latestAssessment.readiness_score}% | Confidence: {latestAssessment.overall_confidence}% | Risk: {latestAssessment.risk_level}</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hierarchical Architecture View */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00D4FF]" />
                  4-Level Hierarchical Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { level: 0, name: "Meta-Cognitive", desc: "Triple-Substrate + Meta-Capabilities", maturity: 3, color: "purple" },
                    { level: 1, name: "Cognitive Reasoning", desc: "4 Metamodels + CRV Gate", maturity: 3, color: "blue" },
                    { level: 2, name: "Core Intelligence", desc: "7 Layers + M1-M11 + Agent Intelligence", maturity: 4, color: "cyan" },
                    { level: 3, name: "Operational", desc: "Workflows + Pattern Synthesis + Training", maturity: 4, color: "amber" }
                  ].map((level, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-lg bg-${level.color}-500/10 border border-${level.color}-500/30`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-white/10 text-white">NÍVEL {level.level}</Badge>
                          <div>
                            <p className="text-white font-semibold">{level.name}</p>
                            <p className="text-slate-400 text-xs">{level.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32">
                            <Progress value={(level.maturity / 5) * 100} className="h-2" />
                          </div>
                          <MaturityBadge level={level.maturity} showTarget={false} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Convergence Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { item: "Visual Workflow Builder", status: "complete" },
                      { item: "Agent Notification Center", status: "complete" },
                      { item: "Training Data Manager", status: "complete" },
                      { item: "Knowledge Graph v2", status: "complete" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{item.item}</span>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    Pending Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { item: "Predictive Scaling v2", priority: "medium" },
                      { item: "Auto-remediation Engine", priority: "high" },
                      { item: "Cross-agent Learning", priority: "medium" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{item.item}</span>
                        <Badge className={item.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}>
                          {item.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#00D4FF]" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { metric: "API Response", value: "98.5%", status: "good" },
                      { metric: "Module Sync", value: "100%", status: "good" },
                      { metric: "Memory Usage", value: "67%", status: "ok" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{item.metric}</span>
                        <span className={item.status === 'good' ? 'text-emerald-400' : 'text-yellow-400'}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* LAYERS TAB */}
          <TabsContent value="layers" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ARCHITECTURE_DATA.coreLayers.layers.map((layer, idx) => (
                <LayerCard 
                  key={layer.id} 
                  layer={layer} 
                  onClick={setSelectedLayer}
                />
              ))}
            </div>
          </TabsContent>

          {/* META-COGNITIVE TAB */}
          <TabsContent value="meta" className="mt-6 space-y-6">
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  {ARCHITECTURE_DATA.metaCognitive.name}
                </CardTitle>
                <p className="text-slate-400 text-sm">{ARCHITECTURE_DATA.metaCognitive.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {ARCHITECTURE_DATA.metaCognitive.components.map((comp, idx) => (
                    <MetaCapabilityCard key={comp.id} component={comp} onClick={() => {}} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  {ARCHITECTURE_DATA.cognitiveReasoning.name}
                </CardTitle>
                <p className="text-slate-400 text-sm">{ARCHITECTURE_DATA.cognitiveReasoning.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ARCHITECTURE_DATA.cognitiveReasoning.components.map((comp, idx) => (
                    <MetaCapabilityCard key={comp.id} component={comp} onClick={() => {}} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PATTERNS TAB */}
          <TabsContent value="patterns" className="mt-6 space-y-6">
            <Card className="bg-emerald-500/10 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Pattern Synthesis System — Confidence Evolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  {ARCHITECTURE_DATA.patternSynthesis.levels.map((level, idx) => (
                    <Card key={idx} className={`bg-${level.color}-500/10 border-${level.color}-500/30`}>
                      <CardContent className="p-4 text-center">
                        <p className={`text-${level.color}-400 font-bold text-lg`}>{level.count}</p>
                        <p className="text-white font-medium text-sm">{level.name}</p>
                        <p className="text-slate-400 text-xs">{level.range}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Confidence Adjustment Rules</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { rule: "Engagement Count 3+", effect: "+10%", type: "positive" },
                      { rule: "Engagement Count 10+", effect: "+20%", type: "positive" },
                      { rule: "Confirmation Rate 80%+", effect: "+15%", type: "positive" },
                      { rule: "Temporal Decay 180+ days", effect: "-10%", type: "negative" },
                      { rule: "Temporal Decay 365+ days", effect: "-20%", type: "negative" }
                    ].map((r, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <span className="text-slate-300 text-sm">{r.rule}</span>
                        <Badge className={r.type === 'positive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {r.effect}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {memories.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-3">Recent Institutional Memories</h4>
                    <div className="space-y-2">
                      {memories.slice(0, 5).map((mem, idx) => (
                        <div key={mem.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                          <span className="text-slate-300 text-sm truncate flex-1">{mem.title}</span>
                          <Badge className="bg-white/10 text-slate-400 text-xs">{mem.memory_type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Layer Detail Modal */}
        <AnimatePresence>
          {selectedLayer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedLayer(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0A1628] border border-white/20 rounded-xl p-6 max-w-lg w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-${selectedLayer.color}-500/20 flex items-center justify-center`}>
                      <selectedLayer.icon className={`w-6 h-6 text-${selectedLayer.color}-400`} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Layer {selectedLayer.layer}: {selectedLayer.name}</h3>
                      <p className="text-slate-400 text-sm">{selectedLayer.fullName}</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedLayer(null)} className="text-slate-400">
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Maturity Level</p>
                    <div className="flex items-center gap-3">
                      <Progress value={(selectedLayer.maturity / 5) * 100} className="flex-1 h-3" />
                      <MaturityBadge level={selectedLayer.maturity} target={selectedLayer.targetMaturity} />
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm mb-2">Associated Modules</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLayer.modules.map((mod, idx) => (
                        <Badge key={idx} className="bg-white/10 text-white">{mod}</Badge>
                      ))}
                    </div>
                  </div>

                  {selectedLayer.renamed && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-amber-400 text-sm">
                        <strong>Note:</strong> This layer was renamed from "NIA" to "NIMR" to resolve ambiguity with the NIA Metamodel.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}