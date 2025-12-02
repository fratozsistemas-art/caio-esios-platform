import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Target, Code, Lightbulb, Brain, Sparkles } from "lucide-react";
import M1ScenarioGenerator from "../components/modules/M1ScenarioGenerator";
import M2CompetitiveAnalyzer from "../components/modules/M2CompetitiveAnalyzer";
import M3TechStackAdvisor from "../components/modules/M3TechStackAdvisor";
import M5StrategicSynthesizer from "../components/modules/M5StrategicSynthesizer";

const modules = [
  { id: "m1", name: "M1 Market Intelligence", icon: Globe, color: "blue", description: "AI Scenario Generation" },
  { id: "m2", name: "M2 Competitive Intelligence", icon: Target, color: "purple", description: "Predictive Analysis" },
  { id: "m3", name: "M3 Tech & Innovation", icon: Code, color: "cyan", description: "Stack Optimization" },
  { id: "m5", name: "M5 Strategic Synthesis", icon: Lightbulb, color: "yellow", description: "Option Identification", featured: true },
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
            <TabsList className="grid grid-cols-4 gap-2 bg-transparent mb-6">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <TabsTrigger
                    key={module.id}
                    value={module.id}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all data-[state=active]:border-${module.color}-500/50 data-[state=active]:bg-${module.color}-500/10 border-white/10 bg-white/5`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 text-${module.color}-400`} />
                      <span className="text-sm font-medium text-white">{module.name}</span>
                      {module.featured && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">CORE</Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{module.description}</span>
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

            <TabsContent value="m5">
              <M5StrategicSynthesizer onSynthesisComplete={(data) => console.log("Synthesis:", data)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}