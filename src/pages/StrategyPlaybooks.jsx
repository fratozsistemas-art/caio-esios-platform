import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Sparkles, Plus, Loader2, Target, TrendingUp, 
  Shield, Rocket, Building2, RefreshCw, Clock, CheckCircle,
  AlertTriangle, DollarSign, Users, BarChart3, FileText, Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import PlaybookGenerator from "../components/playbooks/PlaybookGenerator";
import PlaybookViewer from "../components/playbooks/PlaybookViewer";
import PlaybookCard from "../components/playbooks/PlaybookCard";

const STRATEGIC_GOALS = [
  { value: "market_entry", label: "Market Entry", icon: Rocket, color: "cyan" },
  { value: "cost_reduction", label: "Cost Reduction", icon: DollarSign, color: "green" },
  { value: "digital_transformation", label: "Digital Transformation", icon: RefreshCw, color: "purple" },
  { value: "product_launch", label: "Product Launch", icon: Target, color: "blue" },
  { value: "competitive_repositioning", label: "Competitive Repositioning", icon: TrendingUp, color: "orange" },
  { value: "operational_excellence", label: "Operational Excellence", icon: CheckCircle, color: "emerald" },
  { value: "growth_acceleration", label: "Growth Acceleration", icon: TrendingUp, color: "pink" },
  { value: "turnaround", label: "Turnaround Strategy", icon: RefreshCw, color: "red" },
  { value: "ma_integration", label: "M&A Integration", icon: Building2, color: "indigo" },
  { value: "sustainability_esg", label: "Sustainability & ESG", icon: Shield, color: "teal" }
];

const COMPANY_SIZES = [
  { value: "startup", label: "Startup (1-50)" },
  { value: "small", label: "Small (51-200)" },
  { value: "medium", label: "Medium (201-1000)" },
  { value: "large", label: "Large (1001-5000)" },
  { value: "enterprise", label: "Enterprise (5000+)" }
];

export default function StrategyPlaybooks() {
  const [activeTab, setActiveTab] = useState("library");
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const queryClient = useQueryClient();

  const { data: playbooks = [], isLoading } = useQuery({
    queryKey: ['strategy_playbooks'],
    queryFn: () => base44.entities.StrategyPlaybook.list('-created_date', 50)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.StrategyPlaybook.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategy_playbooks'] })
  });

  const getGoalInfo = (goalValue) => STRATEGIC_GOALS.find(g => g.value === goalValue) || STRATEGIC_GOALS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-400" />
            Strategy Playbooks
          </h1>
          <p className="text-slate-400 mt-1">
            AI-generated strategic documents tailored to your goals
          </p>
        </div>
        <Button
          onClick={() => { setShowGenerator(true); setActiveTab("create"); }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Playbook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{playbooks.length}</p>
            <p className="text-xs text-slate-400">Total Playbooks</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {playbooks.filter(p => p.status === 'approved').length}
            </p>
            <p className="text-xs text-slate-400">Approved</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {playbooks.filter(p => p.status === 'draft').length}
            </p>
            <p className="text-xs text-slate-400">In Review</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <Sparkles className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {playbooks.reduce((sum, p) => sum + (p.source_insights_count || 0), 0)}
            </p>
            <p className="text-xs text-slate-400">Insights Used</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="library" className="data-[state=active]:bg-white/10">
            <BookOpen className="w-4 h-4 mr-2" />
            Library
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-white/10">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </TabsTrigger>
          {selectedPlaybook && (
            <TabsTrigger value="view" className="data-[state=active]:bg-white/10">
              <FileText className="w-4 h-4 mr-2" />
              View Playbook
            </TabsTrigger>
          )}
        </TabsList>

        {/* Library Tab */}
        <TabsContent value="library" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : playbooks.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Playbooks Yet</h3>
                <p className="text-slate-400 mb-6">
                  Generate your first AI-powered strategy playbook
                </p>
                <Button
                  onClick={() => setActiveTab("create")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate First Playbook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playbooks.map((playbook) => (
                <PlaybookCard
                  key={playbook.id}
                  playbook={playbook}
                  goalInfo={getGoalInfo(playbook.strategic_goal)}
                  onView={() => { setSelectedPlaybook(playbook); setActiveTab("view"); }}
                  onDelete={() => deleteMutation.mutate(playbook.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Create Tab */}
        <TabsContent value="create" className="mt-6">
          <PlaybookGenerator
            strategicGoals={STRATEGIC_GOALS}
            companySizes={COMPANY_SIZES}
            onGenerated={(playbook) => {
              setSelectedPlaybook(playbook);
              setActiveTab("view");
              queryClient.invalidateQueries({ queryKey: ['strategy_playbooks'] });
            }}
          />
        </TabsContent>

        {/* View Tab */}
        <TabsContent value="view" className="mt-6">
          {selectedPlaybook && (
            <PlaybookViewer
              playbook={selectedPlaybook}
              goalInfo={getGoalInfo(selectedPlaybook.strategic_goal)}
              onBack={() => { setSelectedPlaybook(null); setActiveTab("library"); }}
              onUpdate={(updated) => {
                setSelectedPlaybook(updated);
                queryClient.invalidateQueries({ queryKey: ['strategy_playbooks'] });
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}