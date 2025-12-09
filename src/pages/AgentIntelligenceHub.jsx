import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, TrendingUp, Brain, Database } from "lucide-react";
import ImprovedKnowledgeGraph from "@/components/agents/ImprovedKnowledgeGraph";
import PredictiveScalingEngine from "@/components/agents/PredictiveScalingEngine";
import TrainingDataManager from "@/components/agents/TrainingDataManager";

export default function AgentIntelligenceHub() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#00D4FF] flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          Agent Intelligence Hub
        </h1>
        <p className="text-[#94A3B8] mt-1">Knowledge graph, training data management & predictive scaling</p>
      </div>

      <Tabs defaultValue="knowledge-graph">
        <TabsList className="bg-[#1A1D29] border border-[#00D4FF]/20">
          <TabsTrigger value="knowledge-graph" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
            <Network className="w-4 h-4 mr-2" />
            Knowledge Graph
          </TabsTrigger>
          <TabsTrigger value="training-data" className="data-[state=active]:bg-[#8B5CF6]/20 data-[state=active]:text-[#8B5CF6]">
            <Database className="w-4 h-4 mr-2" />
            Training Data
          </TabsTrigger>
          <TabsTrigger value="predictive-scaling" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
            <TrendingUp className="w-4 h-4 mr-2" />
            Predictive Scaling
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge-graph" className="mt-6">
          <ImprovedKnowledgeGraph />
        </TabsContent>

        <TabsContent value="training-data" className="mt-6">
          <TrainingDataManager />
        </TabsContent>

        <TabsContent value="predictive-scaling" className="mt-6">
          <PredictiveScalingEngine />
        </TabsContent>
      </Tabs>
    </div>
  );
}