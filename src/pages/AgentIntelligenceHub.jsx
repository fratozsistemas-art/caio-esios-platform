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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          Agent Intelligence Hub
        </h1>
        <p className="text-slate-400 mt-1">Knowledge graph, training data management & predictive scaling</p>
      </div>

      <Tabs defaultValue="knowledge-graph">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="knowledge-graph" className="data-[state=active]:bg-blue-500/20">
            <Network className="w-4 h-4 mr-2" />
            Knowledge Graph
          </TabsTrigger>
          <TabsTrigger value="training-data" className="data-[state=active]:bg-purple-500/20">
            <Database className="w-4 h-4 mr-2" />
            Training Data
          </TabsTrigger>
          <TabsTrigger value="predictive-scaling" className="data-[state=active]:bg-cyan-500/20">
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