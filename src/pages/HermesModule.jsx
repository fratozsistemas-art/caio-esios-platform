import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Brain, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import HermesCore from "../components/hermes/HermesCore";

/**
 * HERMES MODULE PAGE
 * 
 * Framework de Intermediação Cognitiva e Tradução Estratégica
 * Ponte estruturada entre visão sistêmica e operação
 * 
 * Integrado ao Codex CAIO.AI
 */

export default function HermesModule() {
  const [moduleOutputs, setModuleOutputs] = useState(() => {
    // Load any existing module outputs from AIModules
    const saved = localStorage.getItem('caio_module_outputs');
    return saved ? JSON.parse(saved) : {};
  });

  const handleHermesOutput = (data) => {
    console.log("HERMES Output:", data);
    // Persist HERMES analysis
    const existing = JSON.parse(localStorage.getItem('caio_hermes_outputs') || '{}');
    localStorage.setItem('caio_hermes_outputs', JSON.stringify({
      ...existing,
      [data.moduleId]: data.data,
      lastUpdated: new Date().toISOString()
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400" />
            HERMES
          </h1>
          <p className="text-slate-400 mt-1">
            Intermediação Cognitiva & Tradução Estratégica — Codex CAIO.AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("AIModules")}>
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
              <Brain className="w-4 h-4 mr-2" />
              Módulos TSI
            </Button>
          </Link>
          <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Codex CAIO.AI
          </Badge>
        </div>
      </div>

      {/* Documentation Card */}
      <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <BookOpen className="w-6 h-6 text-amber-400 mt-1" />
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Sobre o Módulo HERMES</h3>
              <p className="text-sm text-slate-300 mb-3">
                HERMES é o framework de <span className="text-amber-400 font-semibold">Intermediação Cognitiva</span> que 
                atua como ponte estruturada entre visão sistêmica de alto alcance e operações táticas. 
                Garante que a visão não seja distorcida, o contexto seja compreendido e a estratégia seja implementada sem ruído.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20">
                  <p className="text-xs text-cyan-400 font-semibold">H1</p>
                  <p className="text-xs text-slate-300">Tradução Vectorial</p>
                </div>
                <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20">
                  <p className="text-xs text-purple-400 font-semibold">H2</p>
                  <p className="text-xs text-slate-300">Clarificação Cognitiva</p>
                </div>
                <div className="p-2 bg-pink-500/10 rounded border border-pink-500/20">
                  <p className="text-xs text-pink-400 font-semibold">H3</p>
                  <p className="text-xs text-slate-300">Buffer Emocional</p>
                </div>
                <div className="p-2 bg-amber-500/10 rounded border border-amber-500/20">
                  <p className="text-xs text-amber-400 font-semibold">H4</p>
                  <p className="text-xs text-slate-300">Auditoria Coerencial</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HERMES Core Module */}
      <HermesCore 
        onTranslationComplete={handleHermesOutput}
        moduleOutputs={moduleOutputs}
      />

      {/* Integration Note */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowRight className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-sm text-white font-medium">Integração com TSI</p>
                <p className="text-xs text-slate-400">
                  HERMES atua entre Sensing → Criatividade → Escolha → Implementação
                </p>
              </div>
            </div>
            <Link to={createPageUrl("InsightsDashboard")}>
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/5">
                Ver Insights Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}