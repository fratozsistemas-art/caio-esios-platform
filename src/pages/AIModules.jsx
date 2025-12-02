import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Target, Code, Lightbulb, Brain, Sparkles, DollarSign, BarChart, Rocket, Layers, TrendingUp, Users, Shield } from "lucide-react";
import M1ScenarioGenerator from "../components/modules/M1ScenarioGenerator";
import M2CompetitiveAnalyzer from "../components/modules/M2CompetitiveAnalyzer";
import M3TechStackAdvisor from "../components/modules/M3TechStackAdvisor";
import M4FinancialForecaster from "../components/modules/M4FinancialForecaster";
import M5StrategicSynthesizer from "../components/modules/M5StrategicSynthesizer";
import M6OpportunityMatrix from "../components/modules/M6OpportunityMatrix";
import M7ImplementationPlanner from "../components/modules/M7ImplementationPlanner";
import M8MaieuticReframing from "../components/modules/M8MaieuticReframing";
import M9FundingIntelligence from "../components/modules/M9FundingIntelligence";
import M10BehavioralIntelligence from "../components/modules/M10BehavioralIntelligence";
import M11HermesGovernance from "../components/modules/M11HermesGovernance";

const modules = [
  { id: "m1", name: "M1 Market", icon: Globe, color: "blue", description: "Scenario Generation" },
  { id: "m2", name: "M2 Competitive", icon: Target, color: "purple", description: "Predictive Analysis" },
  { id: "m3", name: "M3 Tech", icon: Code, color: "cyan", description: "Stack Optimization" },
  { id: "m4", name: "M4 Financial", icon: DollarSign, color: "green", description: "DCF Forecasting" },
  { id: "m5", name: "M5 Synthesis", icon: Lightbulb, color: "yellow", description: "Strategic Options", featured: true },
  { id: "m6", name: "M6 Opportunity", icon: BarChart, color: "orange", description: "Risk-Return Matrix" },
  { id: "m7", name: "M7 Implementation", icon: Rocket, color: "red", description: "OKRs & Roadmap" },
  { id: "m8", name: "M8 Maieutic", icon: Layers, color: "indigo", description: "Reframing Engine" },
  { id: "m9", name: "M9 Funding", icon: TrendingUp, color: "emerald", description: "Capital Strategy" },
  { id: "m10", name: "M10 Behavioral", icon: Users, color: "pink", description: "Customer Archetypes" },
  { id: "m11", name: "M11 Hermes", icon: Shield, color: "amber", description: "Trust Governance" },
];

export default function AIModules() {
  const [activeTab, setActiveTab] = useState("m1");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            AI-Enhanced TSI Modules
          </h1>
          <p className="text-slate-400 mt-1">
            Advanced AI capabilities integrated into strategy modules M1-M11
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          AI-Powered Analysis
        </Badge>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap gap-2 bg-transparent mb-6 h-auto">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <TabsTrigger
                    key={module.id}
                    value={module.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all data-[state=active]:border-white/30 data-[state=active]:bg-white/10 border-white/10 bg-white/5"
                  >
                    <Icon className="w-4 h-4 text-white" />
                    <span className="text-xs font-medium text-white">{module.name}</span>
                    {module.featured && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px] px-1">CORE</Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="m1">
              <M1ScenarioGenerator onScenariosGenerated={(data) => console.log("Scenarios:", data)} />
            </TabsContent>

            <TabsContent value="m2">
              <M2CompetitiveAnalyzer onAnalysisComplete={(data) => console.log("Analysis:", data)} />
            </TabsContent>

            <TabsContent value="m3">
              <M3TechStackAdvisor onRecommendation={(data) => console.log("Recommendation:", data)} />
            </TabsContent>

            <TabsContent value="m4">
              <M4FinancialForecaster onForecastComplete={(data) => console.log("Forecast:", data)} />
            </TabsContent>

            <TabsContent value="m5">
              <M5StrategicSynthesizer onSynthesisComplete={(data) => console.log("Synthesis:", data)} />
            </TabsContent>

            <TabsContent value="m6">
              <M6OpportunityMatrix onAnalysisComplete={(data) => console.log("Matrix:", data)} />
            </TabsContent>

            <TabsContent value="m7">
              <M7ImplementationPlanner onPlanComplete={(data) => console.log("Plan:", data)} />
            </TabsContent>

            <TabsContent value="m8">
              <M8MaieuticReframing onReframingComplete={(data) => console.log("Reframing:", data)} />
            </TabsContent>

            <TabsContent value="m9">
              <M9FundingIntelligence onAnalysisComplete={(data) => console.log("Funding:", data)} />
            </TabsContent>

            <TabsContent value="m10">
              <M10BehavioralIntelligence onAnalysisComplete={(data) => console.log("Behavioral:", data)} />
            </TabsContent>

            <TabsContent value="m11">
              <M11HermesGovernance onAnalysisComplete={(data) => console.log("Governance:", data)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}