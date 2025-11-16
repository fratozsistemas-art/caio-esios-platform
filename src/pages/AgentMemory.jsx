import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AgentMemoryViewer from "../components/agents/AgentMemoryViewer";

export default function AgentMemory() {
  const [selectedAgent, setSelectedAgent] = useState("caio_agent");

  const availableAgents = [
    { name: 'caio_agent', label: 'CAIO Agent' },
    { name: 'caio_master', label: 'CAIO Master' },
    { name: 'm1_market_context', label: 'M1: Market Context' },
    { name: 'm2_competitive_intel', label: 'M2: Competitive Intel' },
    { name: 'm3_tech_innovation', label: 'M3: Tech Innovation' },
    { name: 'm4_financial_model', label: 'M4: Financial Model' },
    { name: 'm5_strategic_synthesis', label: 'M5: Strategic Synthesis' },
    { name: 'm6_opportunity_matrix', label: 'M6: Opportunity Matrix' },
    { name: 'm7_implementation', label: 'M7: Implementation' },
    { name: 'm8_reframing_loop', label: 'M8: Reframing Loop' },
    { name: 'm9_funding_intelligence', label: 'M9: Funding Intelligence' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Agent Memory System
          </h1>
          <p className="text-slate-400 mt-1">
            Long-term learning and context retention across all agents
          </p>
        </div>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Select Agent</CardTitle>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-64 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map(agent => (
                  <SelectItem key={agent.name} value={agent.name}>
                    {agent.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <AgentMemoryViewer agentName={selectedAgent} />
    </div>
  );
}