import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Sparkles, Target } from "lucide-react";
import CAIOSimulationEngine from "../components/simulation/CAIOSimulationEngine";

/**
 * SIMULATION LAB PAGE
 * 
 * ESIOS Layer - Strategic Simulation Environment
 * What-if scenarios, Monte Carlo projections, risk analysis
 */

export default function SimulationLab() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-blue-400" />
            Simulation Lab
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 ml-2">
              ESIOS
            </Badge>
          </h1>
          <p className="text-slate-400 mt-1">
            Simulação estratégica avançada • Cenários what-if • Análise Monte Carlo
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          Codex CAIO.AI v12.4
        </Badge>
      </div>

      {/* Documentation Card */}
      <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-1">Sobre o Simulation Lab</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                O <strong className="text-blue-400">CAIO Simulation Engine</strong> permite modelar cenários "what-if" 
                com base em diferentes inputs estratégicos e dados externos. Simula potenciais outcomes de estratégias 
                propostas, fornecendo análise de risco/retorno e identificando gargalos e consequências não-intencionais 
                antes da implementação.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-white/10 text-slate-300">Monte Carlo</Badge>
                <Badge className="bg-white/10 text-slate-300">What-If Analysis</Badge>
                <Badge className="bg-white/10 text-slate-300">Risk/Reward</Badge>
                <Badge className="bg-white/10 text-slate-300">Bottleneck Detection</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Simulation Engine */}
      <CAIOSimulationEngine 
        onSimulationComplete={(results) => {
          console.log('Simulation complete:', results);
        }}
      />
    </div>
  );
}