import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Layers, Languages, Shield, ArrowRight, 
  BookOpen, Sparkles, Network, Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import NIACore from "../components/cognitive/NIACore";
import TRUCore from "../components/cognitive/TRUCore";

/**
 * COGNITIVE ARCHITECTURE PAGE
 * 
 * Central hub para os módulos cognitivos do Codex CAIO.AI:
 * - NIA (Núcleo de Inteligência Arquitetural)
 * - TRU (Translational Reasoning Unit)
 * 
 * Integração com HERMES e módulos TSI
 */

export default function CognitiveArchitecture() {
  const [activeTab, setActiveTab] = useState("nia");
  const [moduleOutputs, setModuleOutputs] = useState(() => {
    const saved = localStorage.getItem('caio_module_outputs');
    return saved ? JSON.parse(saved) : {};
  });
  const [hermesOutputs, setHermesOutputs] = useState(() => {
    const saved = localStorage.getItem('caio_hermes_outputs');
    return saved ? JSON.parse(saved) : {};
  });

  const handleNIAOutput = (data) => {
    console.log("NIA Output:", data);
    const existing = JSON.parse(localStorage.getItem('caio_nia_outputs') || '{}');
    localStorage.setItem('caio_nia_outputs', JSON.stringify({
      ...existing,
      latest: data,
      lastUpdated: new Date().toISOString()
    }));
  };

  const handleTRUOutput = (data) => {
    console.log("TRU Output:", data);
    const existing = JSON.parse(localStorage.getItem('caio_tru_outputs') || '{}');
    localStorage.setItem('caio_tru_outputs', JSON.stringify({
      ...existing,
      latest: data,
      lastUpdated: new Date().toISOString()
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Arquitetura Cognitiva
          </h1>
          <p className="text-slate-400 mt-1">
            NIA + TRU — Módulos de Tradução e Arquitetura — Codex CAIO.AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("HermesModule")}>
            <Button variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
              <Shield className="w-4 h-4 mr-2" />
              HERMES
            </Button>
          </Link>
          <Link to={createPageUrl("AIModules")}>
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
              <Zap className="w-4 h-4 mr-2" />
              Módulos TSI
            </Button>
          </Link>
          <Badge className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Codex CAIO.AI
          </Badge>
        </div>
      </div>

      {/* Architecture Overview */}
      <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Network className="w-6 h-6 text-purple-400 mt-1" />
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Fluxo Cognitivo CAIO.AI</h3>
              <p className="text-sm text-slate-300 mb-4">
                Os módulos cognitivos trabalham em cascata: 
                <span className="text-cyan-400"> TSI (M1-M11)</span> gera insights → 
                <span className="text-amber-400"> HERMES</span> traduz para vetores → 
                <span className="text-blue-400"> NIA</span> cria arquiteturas → 
                <span className="text-emerald-400"> TRU</span> comunica às equipas.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">M1-M11 TSI</Badge>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">HERMES</Badge>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">NIA</Badge>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">TRU</Badge>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Execução</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${
            activeTab === 'nia' 
              ? 'bg-blue-500/20 border-blue-500/50' 
              : 'bg-white/5 border-white/10 hover:border-blue-500/30'
          }`}
          onClick={() => setActiveTab('nia')}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">NIA</h4>
                <p className="text-xs text-slate-400">Núcleo de Inteligência Arquitetural</p>
                <p className="text-xs text-blue-400 mt-1">Insights → Blueprints Executáveis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${
            activeTab === 'tru' 
              ? 'bg-emerald-500/20 border-emerald-500/50' 
              : 'bg-white/5 border-white/10 hover:border-emerald-500/30'
          }`}
          onClick={() => setActiveTab('tru')}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Languages className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">TRU</h4>
                <p className="text-xs text-slate-400">Translational Reasoning Unit</p>
                <p className="text-xs text-emerald-400 mt-1">Estratégia → Linguagem Operacional</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="nia" className="data-[state=active]:bg-blue-500/20">
            <Layers className="w-4 h-4 mr-2" />
            NIA
          </TabsTrigger>
          <TabsTrigger value="tru" className="data-[state=active]:bg-emerald-500/20">
            <Languages className="w-4 h-4 mr-2" />
            TRU
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nia" className="mt-6">
          <NIACore 
            onBlueprintComplete={handleNIAOutput}
            moduleOutputs={moduleOutputs}
            hermesOutputs={hermesOutputs}
          />
        </TabsContent>

        <TabsContent value="tru" className="mt-6">
          <TRUCore 
            onTranslationComplete={handleTRUOutput}
            moduleOutputs={moduleOutputs}
            hermesOutputs={hermesOutputs}
          />
        </TabsContent>
      </Tabs>

      {/* Integration Note */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-white font-medium">Integração com SOC</p>
                <p className="text-xs text-slate-400">
                  NIA e TRU alimentam o Sistema de Orquestração Cognitiva
                </p>
              </div>
            </div>
            <Link to={createPageUrl("InsightsDashboard")}>
              <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10">
                Ver Insights Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}