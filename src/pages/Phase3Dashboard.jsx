import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Users, BarChart3, Languages, Shield, Target,
  Sparkles, TrendingUp, Zap, CheckCircle2
} from "lucide-react";
import MultiStakeholderTranslator from "../components/tis/MultiStakeholderTranslator";
import PatternRecognitionEngine from "../components/nia/PatternRecognitionEngine";
import CRVAutoScoringEngine from "../components/crv/CRVAutoScoringEngine";

/**
 * Phase 3 Dashboard - v12.5 Implementation
 * Centraliza os 3 componentes críticos da Fase 3:
 * 1. TIS Multi-Stakeholder Translator
 * 2. NIA Pattern Recognition Engine
 * 3. CRV Auto-Scoring Engine
 */

const PHASE3_MODULES = [
  {
    id: 'tis',
    name: 'TIS Translator',
    fullName: 'Multi-Stakeholder Translation',
    icon: Users,
    color: 'indigo',
    layer: 'TIS',
    maturity: { current: 2, target: 4 },
    description: 'Tradução automática para Board, C-Suite, VPs e Gerentes'
  },
  {
    id: 'nia',
    name: 'NIA Patterns',
    fullName: 'Pattern Recognition Engine',
    icon: Brain,
    color: 'cyan',
    layer: 'NIA',
    maturity: { current: 2, target: 4 },
    description: 'Reconhecimento de padrões em decisões históricas'
  },
  {
    id: 'crv',
    name: 'CRV Scoring',
    fullName: 'Auto-Scoring Engine',
    icon: BarChart3,
    color: 'emerald',
    layer: 'CROSS',
    maturity: { current: 1, target: 3 },
    description: 'Scoring automatizado de Confidence, Risk e Value'
  }
];

export default function Phase3Dashboard() {
  const [activeTab, setActiveTab] = useState('tis');
  const [moduleOutputs, setModuleOutputs] = useState({});

  const handleModuleOutput = (moduleId, data) => {
    setModuleOutputs(prev => ({ ...prev, [moduleId]: data }));
  };

  const getColorClasses = (color) => {
    const colors = {
      indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    };
    return colors[color] || colors.indigo;
  };

  const overallProgress = PHASE3_MODULES.reduce((acc, m) => {
    return acc + (m.maturity.current / m.maturity.target) * 100;
  }, 0) / PHASE3_MODULES.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            Phase 3: Intelligence Layers
          </h1>
          <p className="text-slate-400 mt-1">
            CAIO TSI v12.5 — TIS + NIA + CRV Implementation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-4 py-2">
            <Target className="w-4 h-4 mr-2" />
            Weeks 8-11
          </Badge>
          <Badge className="bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border-cyan-500/30 px-4 py-2">
            <TrendingUp className="w-4 h-4 mr-2" />
            Priority 1
          </Badge>
        </div>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-emerald-500/10 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Phase 3 Progress</h2>
              <p className="text-sm text-slate-400">Maturity progression toward v12.5 targets</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{Math.round(overallProgress)}%</p>
              <p className="text-xs text-slate-400">overall completion</p>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Module Cards */}
      <div className="grid grid-cols-3 gap-4">
        {PHASE3_MODULES.map((module) => {
          const Icon = module.icon;
          const progress = (module.maturity.current / module.maturity.target) * 100;
          const hasOutput = moduleOutputs[module.id];
          
          return (
            <Card 
              key={module.id}
              className={`${getColorClasses(module.color)} border cursor-pointer transition-all hover:scale-[1.02] ${
                activeTab === module.id ? 'ring-2 ring-white/30' : ''
              }`}
              onClick={() => setActiveTab(module.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-6 h-6" />
                    <span className="font-bold">{module.name}</span>
                  </div>
                  <Badge className="bg-white/10 text-white text-xs">
                    {module.layer}
                  </Badge>
                </div>
                
                <p className="text-xs opacity-80 mb-3">{module.description}</p>
                
                <div className="flex items-center justify-between text-xs mb-2">
                  <span>Maturity: {module.maturity.current}/5 → {module.maturity.target}/5</span>
                  {hasOutput && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                </div>
                <Progress value={progress} className="h-1.5" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Module Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          {PHASE3_MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <TabsTrigger 
                key={module.id} 
                value={module.id}
                className={`data-[state=active]:${getColorClasses(module.color)}`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {module.fullName}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="tis" className="mt-6">
          <MultiStakeholderTranslator 
            onTranslationsGenerated={(data) => handleModuleOutput('tis', data)}
          />
        </TabsContent>

        <TabsContent value="nia" className="mt-6">
          <PatternRecognitionEngine 
            onPatternsIdentified={(data) => handleModuleOutput('nia', data)}
          />
        </TabsContent>

        <TabsContent value="crv" className="mt-6">
          <CRVAutoScoringEngine 
            contentType="analysis"
            onScoreGenerated={(data) => handleModuleOutput('crv', data)}
          />
        </TabsContent>
      </Tabs>

      {/* Cross-Module Insights (when multiple modules have output) */}
      {Object.keys(moduleOutputs).length >= 2 && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Cross-Module Synergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300">
              {Object.keys(moduleOutputs).length} módulos ativos gerando insights integrados.
            </p>
            <div className="flex gap-2 mt-3">
              {Object.keys(moduleOutputs).map((key) => (
                <Badge key={key} className="bg-white/10 text-white">
                  {PHASE3_MODULES.find(m => m.id === key)?.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}