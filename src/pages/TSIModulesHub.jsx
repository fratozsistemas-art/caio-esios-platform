import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, BarChart3, TrendingUp, Cpu, Target, Lightbulb, 
  Users, DollarSign, Sparkles, Shield, Network, Zap
} from "lucide-react";
import EnhancedM5Synthesis from "@/components/modules/EnhancedM5Synthesis";
import M8MaieuticReframing from "@/components/modules/M8MaieuticReframing";
import M10BehavioralIntelligence from "@/components/modules/M10BehavioralIntelligence";
import M1ScenarioGenerator from "@/components/modules/M1ScenarioGenerator";
import M2CompetitiveAnalyzer from "@/components/modules/M2CompetitiveAnalyzer";
import M3TechStackAdvisor from "@/components/modules/M3TechStackAdvisor";
import M4FinancialForecaster from "@/components/modules/M4FinancialForecaster";
import M6OpportunityMatrix from "@/components/modules/M6OpportunityMatrix";
import M7ImplementationPlanner from "@/components/modules/M7ImplementationPlanner";
import M9FundingIntelligence from "@/components/modules/M9FundingIntelligence";
import M11HermesGovernance from "@/components/modules/M11HermesGovernance";

const TSI_MODULES = [
  {
    id: 'm1',
    name: 'M1: Contexto de Mercado',
    icon: TrendingUp,
    color: '#3b82f6',
    description: 'Análise de cenários e contexto estratégico',
    component: M1ScenarioGenerator,
    category: 'foundation'
  },
  {
    id: 'm2',
    name: 'M2: Inteligência Competitiva',
    icon: Target,
    color: '#ef4444',
    description: 'Mapeamento competitivo e posicionamento',
    component: M2CompetitiveAnalyzer,
    category: 'foundation'
  },
  {
    id: 'm3',
    name: 'M3: Tech & Inovação',
    icon: Cpu,
    color: '#8b5cf6',
    description: 'Stack tecnológico e capacidades de inovação',
    component: M3TechStackAdvisor,
    category: 'foundation'
  },
  {
    id: 'm4',
    name: 'M4: Modelo Financeiro',
    icon: DollarSign,
    color: '#10b981',
    description: 'Projeções financeiras e valuation',
    component: M4FinancialForecaster,
    category: 'foundation'
  },
  {
    id: 'm5',
    name: 'M5: Síntese Estratégica',
    icon: Brain,
    color: '#C7A763',
    description: 'Convergência e síntese estratégica (Core TSI)',
    component: EnhancedM5Synthesis,
    category: 'core',
    featured: true
  },
  {
    id: 'm6',
    name: 'M6: Matriz de Oportunidades',
    icon: Lightbulb,
    color: '#f59e0b',
    description: 'Identificação e priorização de oportunidades',
    component: M6OpportunityMatrix,
    category: 'execution'
  },
  {
    id: 'm7',
    name: 'M7: Planejamento de Implementação',
    icon: Zap,
    color: '#06b6d4',
    description: 'Roadmap e plano de execução',
    component: M7ImplementationPlanner,
    category: 'execution'
  },
  {
    id: 'm8',
    name: 'M8: Reframing Maiêutico',
    icon: Sparkles,
    color: '#ec4899',
    description: 'Questionamento profundo e reframing estratégico',
    component: M8MaieuticReframing,
    category: 'advanced',
    featured: true
  },
  {
    id: 'm9',
    name: 'M9: Funding Intelligence',
    icon: DollarSign,
    color: '#14b8a6',
    description: 'Estratégia de funding e investor readiness',
    component: M9FundingIntelligence,
    category: 'advanced'
  },
  {
    id: 'm10',
    name: 'M10: Behavioral Intelligence',
    icon: Users,
    color: '#a855f7',
    description: 'Perfis comportamentais e dinâmicas de poder',
    component: M10BehavioralIntelligence,
    category: 'advanced',
    featured: true
  },
  {
    id: 'm11',
    name: 'M11: HERMES Governance',
    icon: Shield,
    color: '#6366f1',
    description: 'Governança cognitiva e trust-brokering',
    component: M11HermesGovernance,
    category: 'governance'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: Network },
  { id: 'foundation', label: 'Fundação (M1-M4)', icon: BarChart3 },
  { id: 'core', label: 'Core (M5)', icon: Brain },
  { id: 'execution', label: 'Execução (M6-M7)', icon: Target },
  { id: 'advanced', label: 'Avançado (M8-M10)', icon: Sparkles },
  { id: 'governance', label: 'Governança (M11)', icon: Shield }
];

export default function TSIModulesHub() {
  const [selectedModule, setSelectedModule] = useState('m5');
  const [category, setCategory] = useState('all');

  const filteredModules = category === 'all' 
    ? TSI_MODULES 
    : TSI_MODULES.filter(m => m.category === category);

  const currentModule = TSI_MODULES.find(m => m.id === selectedModule);
  const ModuleComponent = currentModule?.component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C7A763] to-[#E3C37B] flex items-center justify-center">
            <Brain className="w-6 h-6 text-[#06101F]" />
          </div>
          TSI v9.3 Modules Hub
        </h1>
        <p className="text-slate-400 mt-1">
          11 módulos cognitivos para análise estratégica completa
        </p>
      </div>

      {/* Category Filter */}
      <Card className="bg-white/5 border-[#C7A763]/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    category === cat.id
                      ? 'bg-[#C7A763]/20 text-[#E3C37B] border border-[#C7A763]/30'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Module Grid + Viewer */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Module Selector */}
        <div className="lg:col-span-1 space-y-3">
          {filteredModules.map(module => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                className={`cursor-pointer transition-all ${
                  selectedModule === module.id
                    ? 'bg-[#C7A763]/10 border-[#C7A763]/40 shadow-lg'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#C7A763]/20'
                }`}
                onClick={() => setSelectedModule(module.id)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${module.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: module.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                        {module.name}
                        {module.featured && (
                          <Badge className="bg-[#C7A763]/20 text-[#E3C37B] text-[10px] px-1.5">
                            ⭐
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Module Viewer */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 border-[#C7A763]/20">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${currentModule.color}20` }}
                >
                  <currentModule.icon className="w-6 h-6" style={{ color: currentModule.color }} />
                </div>
                <div>
                  <CardTitle className="text-white">{currentModule.name}</CardTitle>
                  <p className="text-sm text-slate-400">{currentModule.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {ModuleComponent ? (
                <ModuleComponent />
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Módulo em desenvolvimento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}