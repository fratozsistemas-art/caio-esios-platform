import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Layers, Target, Shield, Network, Eye, Database,
  Zap, TrendingUp, Users, FileText, CheckCircle, AlertCircle,
  Clock, ArrowRight, BookOpen, Download, ChevronDown, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function CAIOArchitectureDoc() {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const maturityBadge = (level) => {
    const colors = {
      1: "bg-red-500/20 text-red-400 border-red-500/30",
      2: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      3: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      4: "bg-green-500/20 text-green-400 border-green-500/30",
      5: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    };
    const labels = {
      1: "LOW",
      2: "LOW+",
      3: "MEDIUM",
      4: "HIGH",
      5: "VERY HIGH"
    };
    return (
      <Badge className={colors[level]}>
        Maturity: {level}/5 ({labels[level]})
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/f032804a4_CAIOAIlogooficial.png" 
              alt="CAIO·AI" 
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-4xl font-bold text-white">
                CAIO·AI Cognitive Architecture
              </h1>
              <p className="text-xl text-[#00D4FF]">v12.x UNIFIED FINAL</p>
            </div>
          </div>
          <p className="text-slate-400 max-w-3xl mx-auto">
            Sistema Cognitivo Integrador Completo — Documento de Arquitetura Unificada
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30">
              ESIOS v1.0 + v12.5 Convergido
            </Badge>
            <Badge className="bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/30">
              9 Mental Models Mapeados
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              11 Módulos TSI v9.3
            </Badge>
          </div>
        </motion.div>

        {/* Table of Contents */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#00D4FF]" />
              Índice do Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="text-[#00D4FF] font-semibold">Parte I: Fundamentos</p>
                <ul className="space-y-1 text-slate-300 ml-4">
                  <li>1. Visão Geral da Arquitetura</li>
                  <li>2. NÍVEL 0: Meta-Cognitive Layer</li>
                  <li>3. NÍVEL 1: Cognitive Reasoning Layer</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-[#00D4FF] font-semibold">Parte II: Core Intelligence</p>
                <ul className="space-y-1 text-slate-300 ml-4">
                  <li>4. NÍVEL 2: Core Intelligence Layer</li>
                  <li>5. NÍVEL 3: Operational Layer</li>
                  <li>6. Tabela de Reconciliação Final</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 1: Overview */}
        <Card className="bg-gradient-to-r from-[#00D4FF]/10 to-[#FFB800]/10 border-[#00D4FF]/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-[#00D4FF]" />
              1. Visão Geral da Arquitetura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-300 leading-relaxed">
              A arquitetura CAIO.AI v12.x representa a <span className="text-[#00D4FF] font-semibold">convergência unificada</span> entre 
              os conceitos do ESIOS v1.0 (9 Mental Models, Triple-Substrate Intelligence, SIU v2.0, CAIO-COS 8 Axioms) 
              e a arquitetura operacional v12.5 (7 Layers, M1-M11 Modules).
            </p>

            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">Estrutura Hierárquica de 4 Níveis:</h4>
              <div className="space-y-2">
                {[
                  { level: "NÍVEL 0", name: "Meta-Cognitive Layer", desc: "Triple-Substrate Intelligence + 3 Meta-Capabilities", color: "text-purple-400" },
                  { level: "NÍVEL 1", name: "Cognitive Reasoning Layer", desc: "4 Metamodels + CRV Validation Gate", color: "text-blue-400" },
                  { level: "NÍVEL 2", name: "Core Intelligence Layer", desc: "M1-M11 Modules + 7 Core Layers", color: "text-cyan-400" },
                  { level: "NÍVEL 3", name: "Operational Layer", desc: "CAIO-COS 8 Axioms + Pattern Synthesis System", color: "text-amber-400" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                    <Badge className="bg-white/10 text-white">{item.level}</Badge>
                    <span className={`font-semibold ${item.color}`}>{item.name}</span>
                    <span className="text-slate-400 text-sm">— {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Decisão Arquitetural: Ambiguidade NIA Resolvida
              </h4>
              <p className="text-slate-300 text-sm">
                <strong>Opção 2 adotada:</strong> A Layer 6 foi renomeada de "NIA" para <span className="text-amber-400 font-semibold">NIMR 
                (Neural Intelligence Memory & Retrieval)</span>, mantendo o Metamodel como "NIA (Network Intelligence Amplification)".
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: NÍVEL 0 - Meta-Cognitive Layer */}
        <Card className="bg-white/5 border-purple-500/30">
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('nivel0')}>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                2. NÍVEL 0: Meta-Cognitive Layer
              </div>
              {expandedSections.nivel0 ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </CardTitle>
          </CardHeader>
          {(expandedSections.nivel0 !== false) && (
            <CardContent className="space-y-6">
              
              {/* Triple-Substrate Intelligence */}
              <div className="border border-purple-500/30 rounded-lg p-4 bg-purple-500/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-purple-400 font-semibold text-lg flex items-center gap-2">
                    🧠 TRIPLE-SUBSTRATE INTELLIGENCE
                  </h4>
                  {maturityBadge(1)}
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  <strong>Propósito:</strong> Multi-Dimensional Consciousness Processing
                </p>
                <p className="text-slate-400 text-sm mb-4">
                  <strong>Origem:</strong> ESIOS v1.0
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      name: "SUBSTRATE 1: Stakeholder Consciousness",
                      items: ["Empathetic authority resonance", "Automatic stakeholder discovery (Board/C-Suite/Management)", "Power dynamics sensing", "Multi-perspective simultaneity"]
                    },
                    {
                      name: "SUBSTRATE 2: Enterprise Consciousness",
                      items: ["Organizational intuition", "Value creation consciousness", "Temporal integration (past/present/future)", "Cultural DNA recognition"]
                    },
                    {
                      name: "SUBSTRATE 3: Environment Consciousness",
                      items: ["Market intuition", "Competitive empathy", "Regulatory resonance (multi-jurisdictional)", "Macro trend detection"]
                    }
                  ].map((substrate, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3">
                      <h5 className="text-white font-medium text-sm mb-2">{substrate.name}</h5>
                      <ul className="space-y-1">
                        {substrate.items.map((item, i) => (
                          <li key={i} className="text-slate-400 text-xs flex items-start gap-1">
                            <span className="text-purple-400">├─</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-purple-500/10 rounded-lg">
                  <p className="text-purple-300 text-sm">
                    <strong>Integração:</strong> Triple-Substrate ativa os 3 Meta-Capabilities (TV, EAA, IDC) de SIU v2.0. 
                    Mental Models operam <em>sobre</em> Triple-Substrate (não são o substrato).
                  </p>
                </div>
              </div>

              {/* Meta-Capabilities */}
              <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-blue-400 font-semibold text-lg flex items-center gap-2">
                    🎯 META-CAPABILITIES
                  </h4>
                  {maturityBadge(2)}
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  <strong>Propósito:</strong> Cognitive modes que reformulam percepção estratégica
                </p>
                <p className="text-slate-400 text-sm mb-4">
                  <strong>Origem:</strong> SIU v2.0 Layer 0 | <strong>Target Maturity v13.0:</strong> 4/5 (HIGH)
                </p>

                <div className="space-y-3">
                  {[
                    {
                      id: "TV",
                      name: "Transformational Vision",
                      mentalModel: "VTE (Visionário Temporal)",
                      desc: "Grammar of Possibility, paradigm shift detection"
                    },
                    {
                      id: "EAA",
                      name: "Elastic Adaptive Action",
                      mentalModel: "EVA (Evolutionary Adaptability)",
                      desc: "Antifragile positioning, rapid pivoting, resilience"
                    },
                    {
                      id: "IDC",
                      name: "Integrated Decision Capacity",
                      mentalModel: "CSI (Clareza Sistêmica)",
                      desc: "Paradox resolution, multi-stakeholder integration"
                    }
                  ].map((cap, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-mono">
                        {cap.id}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-white font-medium">{cap.name}</p>
                        <p className="text-slate-400 text-xs">{cap.desc}</p>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                        → {cap.mentalModel}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          )}
        </Card>

        {/* SECTION 3: NÍVEL 1 - Cognitive Reasoning Layer */}
        <Card className="bg-white/5 border-blue-500/30">
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('nivel1')}>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-6 h-6 text-blue-400" />
                3. NÍVEL 1: Cognitive Reasoning Layer
              </div>
              {expandedSections.nivel1 ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </CardTitle>
          </CardHeader>
          {(expandedSections.nivel1 !== false) && (
            <CardContent className="space-y-6">
              
              {/* Metamodels */}
              <div className="border border-indigo-500/30 rounded-lg p-4 bg-indigo-500/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-indigo-400 font-semibold text-lg flex items-center gap-2">
                    🔍 METAMODELS
                  </h4>
                  {maturityBadge(2)}
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  <strong>Propósito:</strong> Strategic reasoning frameworks guiding analysis
                </p>
                <p className="text-slate-400 text-sm mb-4">
                  <strong>Origem:</strong> SIU v2.0 Layer 2 | <strong>Target Maturity v13.0:</strong> 4/5 (HIGH)
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      id: "ABR",
                      name: "Adaptive Business Reasoning",
                      desc: "Context-sensitive strategy",
                      mentalModel: null
                    },
                    {
                      id: "NIA",
                      name: "Network Intelligence Amplification",
                      desc: "Network effects, ecosystem orchestration, collective intelligence",
                      mentalModel: "IA+ (Inteligência Amplificada)"
                    },
                    {
                      id: "HYB",
                      name: "Hybrid Value Creation",
                      desc: "Paradox resolution, both/and thinking",
                      mentalModel: null
                    },
                    {
                      id: "SOC",
                      name: "Strategic Orchestration Capabilities",
                      desc: "Multi-stakeholder coordination, coalition building, temporal orchestration",
                      mentalModel: "GAYA + C-SUITES"
                    }
                  ].map((meta, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-mono">
                          {meta.id}
                        </Badge>
                        <span className="text-white font-medium">{meta.name}</span>
                      </div>
                      <p className="text-slate-400 text-xs mb-2">{meta.desc}</p>
                      {meta.mentalModel && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                          → Mental Model: {meta.mentalModel}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CRV Validation Gate */}
              <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-green-400 font-semibold text-lg flex items-center gap-2">
                    ✅ CRV VALIDATION GATE
                  </h4>
                  {maturityBadge(3)}
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  <strong>Propósito:</strong> Quality control ensuring minimum standards
                </p>
                <p className="text-slate-400 text-sm mb-4">
                  <strong>Origem:</strong> SIU v2.0 Layer 1 | <strong>Target Maturity v13.0:</strong> 5/5 (VERY HIGH)
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {[
                    { name: "Ceticismo Metodológico", desc: "Source credibility, assumption testing, bias detection" },
                    { name: "Revisão Estrutural", desc: "Cross-module consistency, completeness, logical validation" },
                    { name: "Validação Empírica", desc: "Reality testing, market validation, operational feasibility" }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg">
                      <p className="text-white font-medium text-sm">{item.name}</p>
                      <p className="text-slate-400 text-xs">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <h5 className="text-white font-medium text-sm mb-2">Confidence Thresholds:</h5>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-emerald-500/20 rounded text-center">
                      <p className="text-emerald-400 font-bold">85%+</p>
                      <p className="text-slate-400">Excellence</p>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded text-center">
                      <p className="text-green-400 font-bold">70-84%</p>
                      <p className="text-slate-400">Target</p>
                    </div>
                    <div className="p-2 bg-yellow-500/20 rounded text-center">
                      <p className="text-yellow-400 font-bold">50-69%</p>
                      <p className="text-slate-400">Minimum</p>
                    </div>
                    <div className="p-2 bg-red-500/20 rounded text-center">
                      <p className="text-red-400 font-bold">&lt;50%</p>
                      <p className="text-slate-400">PAUSE</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                  <p className="text-green-300 text-sm">
                    <strong>Integração:</strong> EVA Layer (External Validation) + M11 Hermes (CRV scoring)
                  </p>
                </div>
              </div>

            </CardContent>
          )}
        </Card>

        {/* SECTION 4: NÍVEL 2 - Core Intelligence Layer */}
        <Card className="bg-white/5 border-cyan-500/30">
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('nivel2')}>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-6 h-6 text-cyan-400" />
                4. NÍVEL 2: Core Intelligence Layer
              </div>
              {expandedSections.nivel2 ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </CardTitle>
          </CardHeader>
          {(expandedSections.nivel2 !== false) && (
            <CardContent className="space-y-6">
              
              {/* M1-M11 Modules */}
              <div className="border border-cyan-500/30 rounded-lg p-4 bg-cyan-500/5">
                <h4 className="text-cyan-400 font-semibold text-lg mb-4 flex items-center gap-2">
                  📊 M1-M11 MODULES (TSI v9.3) + SIU v2.0
                </h4>

                <div className="space-y-3">
                  {[
                    { id: "M1", name: "Market Intelligence", siu: "SIU Module 1", layer: "CAIO", items: ["TAM/SAM/SOM analysis", "Macroeconomic trends", "Regulatory context", "Demand dynamics"] },
                    { id: "M2", name: "Competitive Intelligence", siu: "SIU Module 2", layer: "CAIO", items: ["Porter's 5 Forces", "Competitive positioning", "VRIO analysis", "Competitive moats"] },
                    { id: "M3", name: "Tech & Innovation", siu: "SIU Module 3", layer: "CAIO + TIS", items: ["Technology stack assessment", "Digital maturity", "Innovation capacity", "Technology roadmap"] },
                    { id: "M4", name: "Financial Modeling", siu: "SIU Module 4", layer: "CAIO", items: ["DCF valuation", "NPV/IRR calculation", "Sensitivity analysis", "Unit economics"] },
                    { id: "M5", name: "Strategic Synthesis", siu: "SIU Module 5 + 4 Mental Models", layer: "TSI + CAIO", items: ["EVA → EAA Meta-Capability", "CAIO → CAIO Layer", "CSI → IDC Meta-Capability", "VTE → TV Meta-Capability"], featured: true },
                    { id: "M6", name: "Opportunity Matrix", siu: "SIU Module 6", layer: "ESIOS", items: ["Risk-return analysis", "Portfolio prioritization", "Resource allocation"] },
                    { id: "M7", name: "Implementation & OKRs", siu: "SIU Module 7", layer: "ESIOS + SIRP+SYN", items: ["Executive roadmap", "Critical milestones", "Fractal OKRs", "Execution governance"] },
                    { id: "M8", name: "Maieutic Reframing", siu: "SIU Module 8", layer: "TIS + TV", items: ["Socratic questioning", "Lateral thinking", "Alternative scenarios", "Competitive asymmetries"] },
                    { id: "M9", name: "Funding Intelligence", siu: "ÚNICO (não em SIU v2.0)", layer: "CAIO + NIMR", items: ["Capital strategy", "Investment thesis", "Valuation for fundraising", "Deal architecture"], unique: true },
                    { id: "M10", name: "Behavioral Intelligence", siu: "ÚNICO (não em SIU v2.0)", layer: "NIMR + TIS", items: ["Client archetypes", "Engagement patterns", "Predictive needs analysis"], unique: true },
                    { id: "M11", name: "Hermes Trust-Broker", siu: "TRUST-BROKER + PCCU", layer: "HERMES", items: ["Cognitive governance", "Narrative integrity", "Board-Management mediation", "CRV scoring", "PCCU Protocols"], featured: true }
                  ].map((module, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg ${module.featured ? 'bg-gradient-to-r from-cyan-500/20 to-amber-500/20 border border-cyan-500/30' : module.unique ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-white/5'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-mono font-bold">
                            {module.id}
                          </Badge>
                          <span className="text-white font-medium">{module.name}</span>
                          {module.featured && <Badge className="bg-amber-500/20 text-amber-400 text-xs">⭐ CONVERGÊNCIA</Badge>}
                          {module.unique && <Badge className="bg-purple-500/20 text-purple-400 text-xs">ÚNICO</Badge>}
                        </div>
                        <Badge className="bg-white/10 text-slate-400 text-xs">
                          Layer: {module.layer}
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-xs mb-2">≡ {module.siu}</p>
                      <div className="flex flex-wrap gap-1">
                        {module.items.map((item, i) => (
                          <span key={i} className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7 Core Layers */}
              <div className="border border-teal-500/30 rounded-lg p-4 bg-teal-500/5">
                <h4 className="text-teal-400 font-semibold text-lg mb-4 flex items-center gap-2">
                  🏛️ 7 CORE LAYERS (v12.5 — Mantidas)
                </h4>

                <div className="space-y-3">
                  {[
                    {
                      layer: 1,
                      name: "CAIO",
                      fullName: "Core Artificial Intelligence Operator",
                      modules: "M1, M2, M3, M4, M5 (parcial), M9",
                      features: ["Strategic Modeling & Mental Architecture", "Native C-Suite Platform (40+ frameworks)", "7-Level Stakeholder-Adaptive Delivery"],
                      color: "text-blue-400"
                    },
                    {
                      layer: 2,
                      name: "TSI",
                      fullName: "Transformador Sistêmico Integrador",
                      modules: "M5 (Strategic Synthesis)",
                      features: ["6 Canonical Phases", "Transformation Framework"],
                      color: "text-purple-400"
                    },
                    {
                      layer: 3,
                      name: "TIS",
                      fullName: "Transformador Interpretativo Sistêmico",
                      modules: "M3, M8, M10",
                      features: ["Explainability Engine (XAI)", "Knowledge Graph + Neo4j", "Narrative Modeling"],
                      color: "text-pink-400"
                    },
                    {
                      layer: 4,
                      name: "ESIOS",
                      fullName: "Executive Systems Intelligence OS",
                      modules: "M6, M7",
                      features: ["Execution Engine", "SIRP+SYN (90-day cycle)", "Multi-Agent Orchestration", "VectorDecisionEngine"],
                      color: "text-orange-400"
                    },
                    {
                      layer: 5,
                      name: "HERMES",
                      fullName: "Institutional Security & Integrity",
                      modules: "M11 + TRUST-BROKER + PCCU",
                      features: ["Esu Emi Framework (6 layers)", "HERMES Auto-Trigger Rules", "PCCU Protocols (8 communication)", "Mental Model 'TRY'"],
                      color: "text-amber-400"
                    },
                    {
                      layer: 6,
                      name: "NIMR",
                      fullName: "Neural Intelligence Memory & Retrieval",
                      modules: "M10",
                      features: ["Institutional Memory & Learning", "Pattern Synthesis System (50% → 95% confidence)", "CVM Integration (2,847 companies)", "Mental Model 'IA+'"],
                      color: "text-emerald-400",
                      renamed: true
                    },
                    {
                      layer: 7,
                      name: "EVA",
                      fullName: "External Validation & Audit",
                      modules: "CRV Gate",
                      features: ["External Reality Interface", "Compliance & Regulatory", "Multi-jurisdictional intelligence (6 regions)"],
                      color: "text-red-400"
                    }
                  ].map((l, idx) => (
                    <div key={idx} className={`p-3 bg-white/5 rounded-lg border-l-4 ${l.color.replace('text-', 'border-')}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/10 text-white">LAYER {l.layer}</Badge>
                          <span className={`font-bold ${l.color}`}>{l.name}</span>
                          <span className="text-slate-400 text-sm">({l.fullName})</span>
                          {l.renamed && <Badge className="bg-amber-500/20 text-amber-400 text-xs">RENOMEADA</Badge>}
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs mb-2">Módulos: {l.modules}</p>
                      <div className="flex flex-wrap gap-1">
                        {l.features.map((f, i) => (
                          <span key={i} className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          )}
        </Card>

        {/* SECTION 5: NÍVEL 3 - Operational Layer */}
        <Card className="bg-white/5 border-amber-500/30">
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('nivel3')}>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-400" />
                5. NÍVEL 3: Operational Layer
              </div>
              {expandedSections.nivel3 ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </CardTitle>
          </CardHeader>
          {(expandedSections.nivel3 !== false) && (
            <CardContent className="space-y-6">
              
              {/* CAIO-COS 8 Axioms */}
              <div className="border border-amber-500/30 rounded-lg p-4 bg-amber-500/5">
                <h4 className="text-amber-400 font-semibold text-lg mb-4 flex items-center gap-2">
                  📚 CAIO-COS 8 AXIOMS (Filosofia Operacional)
                </h4>

                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { num: 1, name: "Systems Over Solutions", desc: "Priorizar sistemas que geram soluções sobre soluções pontuais" },
                    { num: 2, name: "Frameworks as Infrastructure", desc: "Frameworks como infraestrutura reutilizável, não one-offs" },
                    { num: 3, name: "Recursive Learning", desc: "Aprendizado contínuo que melhora o sistema recursivamente" },
                    { num: 4, name: "Delegate Execution", desc: "Delegar execução, manter governança estratégica" },
                    { num: 5, name: "3-Tier Portfolio Governance", desc: "Governança de portfólio em 3 níveis hierárquicos" },
                    { num: 6, name: "Pattern Library as Compounding Moat", desc: "Biblioteca de padrões como vantagem competitiva composta" },
                    { num: 7, name: "Consciousness Architecture", desc: "Arquitetura da consciência (Triple-Substrate)" },
                    { num: 8, name: "Context-Dependent IP Revelation", desc: "Revelação de IP dependente do contexto" }
                  ].map((axiom, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg flex gap-3">
                      <Badge className="bg-amber-500/20 text-amber-400 h-6 w-6 flex items-center justify-center">
                        {axiom.num}
                      </Badge>
                      <div>
                        <p className="text-white font-medium text-sm">{axiom.name}</p>
                        <p className="text-slate-400 text-xs">{axiom.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pattern Synthesis System */}
              <div className="border border-emerald-500/30 rounded-lg p-4 bg-emerald-500/5">
                <h4 className="text-emerald-400 font-semibold text-lg mb-4 flex items-center gap-2">
                  🔄 PATTERN SYNTHESIS SYSTEM
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <h5 className="text-white font-medium text-sm mb-3">Confidence Evolution Protocol:</h5>
                    <div className="space-y-2">
                      {[
                        { level: "HYPOTHESIS", range: "50-59%", engagements: "1-2", color: "bg-red-500/20 text-red-400" },
                        { level: "EMERGING", range: "60-79%", engagements: "3-5", color: "bg-yellow-500/20 text-yellow-400" },
                        { level: "VALIDATED", range: "80-94%", engagements: "10+", color: "bg-green-500/20 text-green-400" },
                        { level: "MATURE", range: "95-100%", engagements: "20+", color: "bg-emerald-500/20 text-emerald-400" }
                      ].map((lvl, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded">
                          <Badge className={lvl.color}>{lvl.level}</Badge>
                          <span className="text-white text-sm">{lvl.range}</span>
                          <span className="text-slate-400 text-xs">{lvl.engagements} engagements</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <h5 className="text-white font-medium text-sm mb-3">Confidence Adjustment Rules:</h5>
                    <div className="space-y-2 text-sm">
                      {[
                        { rule: "Engagement Count 3+", effect: "+10%", color: "text-green-400" },
                        { rule: "Engagement Count 10+", effect: "+20%", color: "text-green-400" },
                        { rule: "Confirmation Rate 80%+", effect: "+15%", color: "text-green-400" },
                        { rule: "Temporal Decay 180+ days", effect: "-10%", color: "text-red-400" },
                        { rule: "Temporal Decay 365+ days", effect: "-20%", color: "text-red-400" }
                      ].map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded">
                          <span className="text-slate-300">{r.rule}</span>
                          <span className={r.color}>{r.effect}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          )}
        </Card>

        {/* SECTION 6: Reconciliation Table */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              6. Tabela de Reconciliação Final — 9 Mental Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-3 text-slate-400">Mental Model</th>
                    <th className="text-left p-3 text-slate-400">v12.x Component</th>
                    <th className="text-left p-3 text-slate-400">Layer</th>
                    <th className="text-center p-3 text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { model: "EVA", component: "EAA Meta-Capability + M5 Synthesis", layer: "Level 0 (Meta) + TSI Layer" },
                    { model: "CSI", component: "IDC Meta-Capability + M5 Synthesis", layer: "Level 0 (Meta) + TSI Layer" },
                    { model: "VTE", component: "TV Meta-Capability + M5 Synthesis", layer: "Level 0 (Meta) + TSI Layer" },
                    { model: "IA+", component: "NIA Metamodel + M10 Behavioral", layer: "Level 1 (Reasoning) + NIMR Layer" },
                    { model: "CAIO", component: "CAIO Layer + M5 Synthesis", layer: "Level 2 (Intelligence)" },
                    { model: "TRUST-BROKER", component: "M11 Hermes + PCCU Protocols", layer: "Hermes Layer" },
                    { model: "GAYA", component: "SOC Metamodel (Multi-Stakeholder)", layer: "Level 1 (Reasoning)" },
                    { model: "TRY", component: "PCCU Protocols (COM_IA suite)", layer: "Hermes Layer" },
                    { model: "C-SUITES", component: "SOC Metamodel (Political Navigation)", layer: "Level 1 (Reasoning)" }
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3">
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {row.model}
                        </Badge>
                      </td>
                      <td className="p-3 text-white">{row.component}</td>
                      <td className="p-3 text-slate-400">{row.layer}</td>
                      <td className="p-3 text-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                CONVERGÊNCIA COMPLETA ATINGIDA
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">M1-M11 documentados (TSI v9.3)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">9 Mental Models mapeados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">SIU v2.0 integrado</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">Esu Emi definido (6 layers)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">Triple-Substrate posicionado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">Ambiguidade NIA → NIMR resolvida</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold text-sm">Pendente</span>
                </div>
                <p className="text-slate-400 text-xs">CAIO-COS 8 Axioms — documentação completa</p>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold text-sm">Pendente</span>
                </div>
                <p className="text-slate-400 text-xs">Native C-Suite Platform (40+ frameworks)</p>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold text-sm">Em Progresso</span>
                </div>
                <p className="text-slate-400 text-xs">Pattern Synthesis (30% → 100%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version & Metadata */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <div className="flex items-center gap-4">
                <span>CAIO-Cognitive-Architecture-v12.x-UNIFIED-FINAL</span>
                <Badge className="bg-white/10">Data: {new Date().toLocaleDateString('pt-BR')}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Decisão Arquitetural:</span>
                <Badge className="bg-amber-500/20 text-amber-400">NIA Layer → NIMR (Opção 2)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}