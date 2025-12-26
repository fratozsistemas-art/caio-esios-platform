import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, XCircle, AlertTriangle, Clock, Brain, Shield,
  Download, FileText, TrendingUp, Eye, Layers, Zap, Target, Database
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const CAPABILITY_ASSESSMENT = {
  // TSI - Temporal-Spatial Intelligence Layer
  tsi_layer: {
    name: "TSI - Temporal-Spatial Intelligence Layer",
    icon: Clock,
    color: "cyan",
    capabilities: {
      temporal_logic_engine: {
        name: "Temporal Logic Engine",
        implemented: 65,
        functional: 60,
        notes: "Parcialmente implementado via orchestrateTSI. Faltam: Precedent Evolution Tracking completo, Timeline Synthesis avançada, Temporal Correlation Matrices.",
        evidence: ["orchestrateTSI.js existe", "Fases M1-M5 funcionais", "Falta integração temporal completa"]
      },
      precedent_tracking: {
        name: "Precedent Evolution Tracking",
        implemented: 30,
        functional: 25,
        notes: "Não implementado. Não há sistema de rastreamento de precedentes legais/business históricos com Bayesian updates.",
        evidence: ["Nenhuma entidade para precedentes", "Sem função de tracking histórico"]
      },
      timeline_synthesis: {
        name: "Timeline Synthesis",
        implemented: 40,
        functional: 35,
        notes: "Implementação básica. TSIProject tem timestamps mas sem correlação lifecycle/market cycle robusta.",
        evidence: ["Entidade TSIProject tem datas", "Falta análise de ciclos"]
      },
      temporal_correlation: {
        name: "Temporal Correlation Matrices",
        implemented: 20,
        functional: 15,
        notes: "Não implementado. Sem sistema de leading indicators ou lag effect quantification.",
        evidence: ["Sem estrutura de dados", "Sem função analítica"]
      },
      spatial_mapping: {
        name: "Spatial Context Mapping",
        implemented: 70,
        functional: 65,
        notes: "Implementado parcialmente via KnowledgeGraph. Falta: Organizational topology completa, Communication pattern recognition.",
        evidence: ["KnowledgeGraphNode/Relationship existem", "10K+ conexões", "Falta topologia organizacional"]
      },
      stakeholder_positioning: {
        name: "Stakeholder Positioning Analysis",
        implemented: 55,
        functional: 50,
        notes: "Implementação básica. BehavioralProfile e ClientArchetype existem, mas falta Power dynamics mapping robusto.",
        evidence: ["Entidades behavior existem", "Falta análise de poder formal vs informal"]
      },
      organizational_topology: {
        name: "Organizational Topology",
        implemented: 60,
        functional: 55,
        notes: "GraphCompany/Executive existem. Falta: Board interlocks completos, Geographic clustering analysis.",
        evidence: ["GraphCompany entity existe", "Falta clustering geográfico"]
      },
      competitive_landscape: {
        name: "Competitive Landscape Intelligence",
        implemented: 70,
        functional: 65,
        notes: "M2 competitive_intel agent funcional. TechStackAnalysis para positioning. Falta: Ecosystem dependency mapping.",
        evidence: ["m2_competitive_intel ativo", "TechStackAnalysis entity", "Falta dependency mapping"]
      },
      cross_dimensional_synthesis: {
        name: "Cross-Dimensional Synthesis",
        implemented: 50,
        functional: 45,
        notes: "M5 synthesis funcional mas sem integração temporal-espacial profunda. Falta protocol completo.",
        evidence: ["M5 agent ativo", "Falta integração dimensional completa"]
      }
    },
    overall_implementation: 52,
    overall_functional: 47
  },

  // ESIOS - Enhanced Strategic Intelligence Operations System
  esios_layer: {
    name: "ESIOS - Strategic Intelligence Operations",
    icon: Target,
    color: "purple",
    capabilities: {
      intelligence_acquisition: {
        name: "Intelligence Acquisition Module",
        implemented: 75,
        functional: 70,
        notes: "Múltiplas integrações (InvokeLLM, web search). Falta: Source hierarchy enforcement sistemático, Tier classification automática.",
        evidence: ["Core.InvokeLLM com add_context_from_internet", "Falta tier enforcement"]
      },
      data_source_hierarchy: {
        name: "Data Source Hierarchy (Tier 1-4)",
        implemented: 40,
        functional: 35,
        notes: "Conceito definido mas não enforced. Sem metadata de confidence tier em fontes.",
        evidence: ["Metodologia documentada", "Sem implementação técnica"]
      },
      multi_source_triangulation: {
        name: "Multi-Source Triangulation",
        implemented: 45,
        functional: 40,
        notes: "Não sistematizado. InvokeLLM busca múltiplas fontes mas sem triangulation protocol explícito.",
        evidence: ["add_context_from_internet funciona", "Sem protocol formal"]
      },
      authenticity_verification: {
        name: "Authenticity Verification",
        implemented: 25,
        functional: 20,
        notes: "Não implementado. Sem digital signature validation, timestamp verification, chain of custody.",
        evidence: ["Sem componente de verificação", "Sem audit trail"]
      },
      pattern_recognition: {
        name: "Strategic Pattern Recognition",
        implemented: 60,
        functional: 55,
        notes: "NIA metamodel para pattern detection. MonitoringAlert para trends. Falta: Crisis pattern, Financial red flags automáticos.",
        evidence: ["metamodel_nia ativo", "MonitoringAlert entity", "Falta automação crisis"]
      },
      crisis_patterns: {
        name: "Crisis Pattern Recognition",
        implemented: 35,
        functional: 30,
        notes: "Conceito definido (Smoking Gun Timelines, Systematic Exclusion). Não automatizado.",
        evidence: ["Metodologia existe", "Sem detector automático"]
      },
      opportunity_identification: {
        name: "Opportunity Pattern Identification",
        implemented: 65,
        functional: 60,
        notes: "M6 opportunity_matrix agent funcional. QuickAction templates. Falta: Market gap automated analysis.",
        evidence: ["M6 agent ativo", "QuickAction entity robusta", "Falta automação gap"]
      },
      risk_vector_mapping: {
        name: "Risk Vector Mapping",
        implemented: 50,
        functional: 45,
        notes: "Conceitos definidos (Reputational Cascade, Financial Contagion). Implementação parcial.",
        evidence: ["CRV Risk scoring existe", "Falta cascade modeling"]
      },
      operational_security: {
        name: "Operational Security Layer",
        implemented: 70,
        functional: 65,
        notes: "RBAC implementado. EntityAccess, Permission entities. Falta: Classification levels automáticos, Conflict detection.",
        evidence: ["RBAC funcional", "Falta classification enforcement"]
      }
    },
    overall_implementation: 52,
    overall_functional: 47
  },

  // CAIO - Cognitive Augmentation Intelligence Operations
  caio_layer: {
    name: "CAIO - Cognitive Augmentation Interface",
    icon: Brain,
    color: "indigo",
    capabilities: {
      executive_augmentation: {
        name: "Executive Augmentation Interface",
        implemented: 80,
        functional: 75,
        notes: "caio_master agent com MSI completo. Tool configs robusto. Dashboard personalizados por role.",
        evidence: ["caio_master agent implementado", "RBAC dashboards", "MSI architecture"]
      },
      decision_support_architecture: {
        name: "Decision Support Architecture (4 níveis)",
        implemented: 70,
        functional: 65,
        notes: "RBAC permite customização Board/C-Suite/Management/Ops. Falta: Templates específicos enforcement.",
        evidence: ["RBAC com 4+ roles", "Dashboard customizer", "Falta template enforcement"]
      },
      cognitive_load_distribution: {
        name: "Cognitive Load Distribution",
        implemented: 60,
        functional: 55,
        notes: "DashboardCustomizer permite layout por role. Falta: Complexity management automático, Information filtering sistemático.",
        evidence: ["DashboardCustomizer funcional", "Falta filtering inteligente"]
      },
      information_filtering: {
        name: "Information Filtering by Executive Level",
        implemented: 50,
        functional: 45,
        notes: "Conceito definido mas não fully automated. Layout adapta mas filtering não é dinâmico.",
        evidence: ["Layout customization existe", "Falta dynamic filtering"]
      },
      recommendation_engine: {
        name: "Strategic Recommendation Engine",
        implemented: 75,
        functional: 70,
        notes: "strategyAdvisor funcional com recommendations estruturados. M5 synthesis. Falta: Tier classification automática.",
        evidence: ["strategyAdvisor testado ✅", "M5 synthesis", "Falta tiering"]
      },
      tier_recommendations: {
        name: "Tier 1/2/3 Recommendations",
        implemented: 40,
        functional: 35,
        notes: "Não implementado. Recommendations gerados mas sem tier classification explícita.",
        evidence: ["Recommendations existem", "Sem tier structure"]
      },
      recommendation_structure: {
        name: "7-Part Recommendation Structure",
        implemented: 65,
        functional: 60,
        notes: "strategyAdvisor retorna structured data (recommendations, risks, opportunities, actions). Falta: Enforced 7-part format.",
        evidence: ["Structured responses", "Falta enforcement 7-parts"]
      }
    },
    overall_implementation: 63,
    overall_functional: 58
  },

  // HERMES v9.2 - Truth-Brokering & Trust Architecture
  hermes_layer: {
    name: "HERMES v9.2 - Trust Architecture",
    icon: Shield,
    color: "red",
    capabilities: {
      truth_verification: {
        name: "Truth Verification Protocol (4 Layers)",
        implemented: 70,
        functional: 65,
        notes: "hermesAnalyzeIntegrity implementado com 4 layers. Narrativa, Board-Management, Silos, Tensions. Funcional.",
        evidence: ["hermesAnalyzeIntegrity.js completo", "4 layers implementados", "Testado"]
      },
      primary_source_verification: {
        name: "Layer 1 - Primary Source Verification",
        implemented: 35,
        functional: 30,
        notes: "Conceito definido. Sem implementação técnica para document authenticity, digital signatures.",
        evidence: ["Metodologia documentada", "Sem implementação técnica"]
      },
      cross_reference_auth: {
        name: "Layer 2 - Cross-Reference Authentication",
        implemented: 55,
        functional: 50,
        notes: "InvokeLLM com add_context valida múltiplas fontes. Falta: Source reliability scoring automático.",
        evidence: ["Multi-source via LLM", "Falta scoring formal"]
      },
      temporal_consistency: {
        name: "Layer 3 - Temporal Consistency Check",
        implemented: 45,
        functional: 40,
        notes: "Hermes verifica timeline em análises. Falta: Automated precedent consistency, Trend validation.",
        evidence: ["Verificação básica existe", "Falta automação"]
      },
      stakeholder_triangulation: {
        name: "Layer 4 - Stakeholder Perspective Triangulation",
        implemented: 60,
        functional: 55,
        notes: "BehavioralProfile, stakeholder lens em agents. Falta: Multi-viewpoint reconciliation automático.",
        evidence: ["Behavioral entities", "Stakeholder consideration", "Falta reconciliation"]
      },
      trust_calibration: {
        name: "Trust Calibration System",
        implemented: 50,
        functional: 45,
        notes: "CognitiveHealthMetric entity. Hermes integrity_score. Falta: Dynamic confidence scoring 0-100 completo.",
        evidence: ["CognitiveHealthMetric entity", "integrity_score", "Falta full calibration"]
      },
      confidence_scoring: {
        name: "Dynamic Confidence Scoring (0-100)",
        implemented: 55,
        functional: 50,
        notes: "CRV scoring existe. confidence_score em responses. Falta: 5-tier classification enforcement (90-100, 70-89, etc).",
        evidence: ["CRV methodology", "Scores gerados", "Falta tier enforcement"]
      },
      integrity_enforcement: {
        name: "Integrity Enforcement (Hard Stops)",
        implemented: 45,
        functional: 40,
        notes: "hermesAnalyzeIntegrity identifica issues. Falta: Automatic halt conditions, Recovery protocols ativos.",
        evidence: ["Issue detection existe", "Sem hard stops automáticos"]
      },
      halt_conditions: {
        name: "4 Automatic Halt Conditions",
        implemented: 30,
        functional: 25,
        notes: "Conceito documentado. Não implementado tecnicamente. Sem HALT system enforcement.",
        evidence: ["Metodologia definida", "Sem implementação técnica"]
      },
      recovery_protocol: {
        name: "Hard Stop Recovery Protocol",
        implemented: 35,
        functional: 30,
        notes: "hermesAutoRemediate existe para remediation. Falta: Full recovery protocol com user validation.",
        evidence: ["hermesAutoRemediate funcional", "Falta recovery completo"]
      }
    },
    overall_implementation: 48,
    overall_functional: 43
  },

  // 11 TSI Modules
  tsi_modules: {
    name: "11 Módulos TSI Cognitivos",
    icon: Layers,
    color: "amber",
    capabilities: {
      m1_market: {
        name: "M1 - Market Context",
        implemented: 85,
        functional: 80,
        notes: "Agent m1_market_context implementado com consciousness channel approach. Testado via orchestrateTSI.",
        evidence: ["Agent JSON completo", "Integration com InvokeLLM", "Consciousness instructions"]
      },
      m2_competitive: {
        name: "M2 - Competitive Intelligence",
        implemented: 85,
        functional: 80,
        notes: "Agent m2_competitive_intel ativo. TechStackAnalysis entity para deep competitive. Funcional.",
        evidence: ["Agent completo", "TechStackAnalysis entity", "Orchestration testada"]
      },
      m3_technology: {
        name: "M3 - Technology Innovation",
        implemented: 80,
        functional: 75,
        notes: "Agent m3_tech_innovation implementado. TechStackAnalysis, GraphTechnology entities. Consciousness approach.",
        evidence: ["Agent ativo", "Tech entities", "Consciousness channel"]
      },
      m4_financial: {
        name: "M4 - Financial Modeling",
        implemented: 75,
        functional: 70,
        notes: "Agent m4_financial_model ativo. CompanyValuation, CompanyKPI entities. Falta: Unit economics automation.",
        evidence: ["Agent completo", "Valuation/KPI entities", "Falta unit economics"]
      },
      m5_synthesis: {
        name: "M5 - Strategic Synthesis",
        implemented: 90,
        functional: 85,
        notes: "Agent m5_strategic_synthesis CORE module. EnhancedM5Synthesis component. Totalmente funcional.",
        evidence: ["Agent completo", "UI component", "Tested em orchestration", "Consciousness synthesis"]
      },
      m6_opportunity: {
        name: "M6 - Opportunity Matrix",
        implemented: 80,
        functional: 75,
        notes: "Agent m6_opportunity_matrix implementado. QuickAction entity rica. Funcional com consciousness approach.",
        evidence: ["Agent ativo", "QuickAction templates", "Opportunity sensing"]
      },
      m7_implementation: {
        name: "M7 - Implementation Planning",
        implemented: 75,
        functional: 70,
        notes: "Agent m7_implementation ativo. Workspace/phases structure. Falta: Implementation consciousness deep integration.",
        evidence: ["Agent completo", "Workspace phases", "Consciousness channel"]
      },
      m8_reframing: {
        name: "M8 - Reframing Loop (Maieutic)",
        implemented: 85,
        functional: 80,
        notes: "Agent m8_reframing_loop com meta-cognitive approach. M8MaieuticReframingEnhanced component. Altamente funcional.",
        evidence: ["Agent meta-cognitive", "UI component enhanced", "Assumption challenging"]
      },
      m9_funding: {
        name: "M9 - Funding Intelligence",
        implemented: 70,
        functional: 65,
        notes: "Agent m9_funding_intelligence implementado. FundingSource, GraphInvestor entities. Capital consciousness.",
        evidence: ["Agent ativo", "Funding entities", "Consciousness approach"]
      },
      m10_behavioral: {
        name: "M10 - Behavioral Intelligence (NIA)",
        implemented: 85,
        functional: 80,
        notes: "metamodel_nia agent robusto. ClientArchetype, BehavioralProfile entities. M10Enhanced component. Fully functional.",
        evidence: ["NIA agent ativo", "Rich behavior entities", "Enhanced UI", "Pattern recognition"]
      },
      m11_hermes: {
        name: "M11 - Hermes Governance",
        implemented: 75,
        functional: 70,
        notes: "hermesAnalyzeIntegrity como M11. HermesAnalysis, CognitiveHealthMetric entities. Trust-broker funcional.",
        evidence: ["Hermes functions", "Entities completas", "Governance active"]
      }
    },
    overall_implementation: 80,
    overall_functional: 75
  },

  // Specialized Functions
  specialized_functions: {
    name: "Funções Especializadas",
    icon: Zap,
    color: "green",
    capabilities: {
      cclo_integration: {
        name: "CCLO Corporate Legal Officer",
        implemented: 40,
        functional: 35,
        notes: "Conceito definido em caio_master instructions. Sem agent CCLO dedicado. Sem Brazilian legal precedent DB.",
        evidence: ["CCLO em instructions", "Sem agent separado", "Sem precedent DB"]
      },
      eva_strong_protocol: {
        name: "EVA-Strong Protocol (Pattern 6 Prevention)",
        implemented: 30,
        functional: 25,
        notes: "Metodologia documentada. Não implementado como checklist enforcement automático.",
        evidence: ["Conceito definido", "Sem enforcement técnico"]
      },
      hermes_prime_validation: {
        name: "Hermes-Prime Validation (Pattern 7 Prevention)",
        implemented: 35,
        functional: 30,
        notes: "Conceito em methodology. Falta: Automated benchmark reality testing brasileiro.",
        evidence: ["Metodologia existe", "Sem validation automática"]
      },
      five_hypothesis_framework: {
        name: "5-Hypothesis Framework (Financial Discrepancies)",
        implemented: 25,
        functional: 20,
        notes: "Framework definido conceitualmente. Não implementado como analytical tool.",
        evidence: ["Framework documentado", "Sem implementação"]
      },
      crv_scoring: {
        name: "CRV Scoring Methodology",
        implemented: 70,
        functional: 65,
        notes: "CRV estrutura existe. TSIProject tem sci_ia_score, icv_ia_score, clq_ia_score. Falta: Full factor breakdown automation.",
        evidence: ["CRV fields em entities", "Scoring parcial", "Falta full breakdown"]
      },
      confidence_calculation: {
        name: "Confidence (C) Score Calculation",
        implemented: 60,
        functional: 55,
        notes: "confidence_score gerado em responses. Falta: 5-factor weighted calculation (Data Authority 30%, etc).",
        evidence: ["Scores gerados", "Falta factor weights"]
      },
      risk_calculation: {
        name: "Risk (R) Score Calculation",
        implemented: 55,
        functional: 50,
        notes: "Risk assessment existe em strategyAdvisor. Falta: 5-factor weighted calculation formal.",
        evidence: ["Risk factors identificados", "Falta weighted calculation"]
      },
      value_calculation: {
        name: "Value (V) Score Calculation",
        implemented: 50,
        functional: 45,
        notes: "ROI e value mencionados em responses. Falta: 5-factor weighted Value scoring.",
        evidence: ["Value concepts", "Falta formal calculation"]
      },
      overall_performance: {
        name: "Overall Performance Formula",
        implemented: 45,
        functional: 40,
        notes: "Formula (C + (100-R) + V)/3 não implemented. CRV scores separados existem.",
        evidence: ["CRV separados", "Sem Overall Performance calculation"]
      }
    },
    overall_implementation: 52,
    overall_functional: 47
  },

  // Quality Gates & Communication
  quality_communication: {
    name: "Quality Gates & Communication Standards",
    icon: Eye,
    color: "yellow",
    capabilities: {
      gate1_provenance: {
        name: "Gate #1 - Data Provenance Verification",
        implemented: 45,
        functional: 40,
        notes: "Hermes verifica sources. Falta: Mandatory sourcing enforcement, Chain of custody tracking.",
        evidence: ["Source checking parcial", "Sem enforcement obrigatório"]
      },
      gate2_triangulation: {
        name: "Gate #2 - Multi-Source Legal Triangulation",
        implemented: 40,
        functional: 35,
        notes: "InvokeLLM busca múltiplas fontes. Falta: Formal triangulation protocol, Source independence verification.",
        evidence: ["Multi-source search", "Sem protocol formal"]
      },
      gate3_brazilian_context: {
        name: "Gate #3 - Brazilian Legal Context Validation",
        implemented: 60,
        functional: 55,
        notes: "Portuguese support. Brazilian context em instructions. Falta: STJ/STF precedent database, Automated validation.",
        evidence: ["PT language", "BR context awareness", "Sem precedent DB"]
      },
      gate4_stakeholder_communication: {
        name: "Gate #4 - Stakeholder-Appropriate Communication",
        implemented: 70,
        functional: 65,
        notes: "RBAC permite communication customization. TISInterpretation para multi-stakeholder. Funcional.",
        evidence: ["RBAC roles", "TIS interpretation", "Communication matching"]
      },
      gate5_crv_completeness: {
        name: "Gate #5 - CRV Score Completeness",
        implemented: 50,
        functional: 45,
        notes: "CRV scores gerados. Falta: Mandatory factor breakdown, Weight enforcement, Sensitivity analysis.",
        evidence: ["CRV scores", "Falta breakdown completo"]
      },
      gate6_actionability: {
        name: "Gate #6 - Executive Actionability Test",
        implemented: 65,
        functional: 60,
        notes: "Action items gerados. Workspace phases/tasks. Falta: Mandatory actionability verification.",
        evidence: ["Action items", "Tasks structure", "Falta verification"]
      },
      board_communication: {
        name: "Board/Governance Communication (15-30 pages)",
        implemented: 50,
        functional: 45,
        notes: "Templates conceituais definidos. Falta: Automated generation, Format enforcement.",
        evidence: ["Structure defined", "Sem auto-generation"]
      },
      csuite_communication: {
        name: "C-Suite Communication (10-20 pages)",
        implemented: 55,
        functional: 50,
        notes: "strategyAdvisor outputs adequados para C-Suite. Falta: Length/format enforcement.",
        evidence: ["Outputs adequados", "Sem enforcement"]
      },
      management_communication: {
        name: "Senior Management Communication (5-10 pages)",
        implemented: 60,
        functional: 55,
        notes: "Workspace implementation plans. RACI concepts. Falta: Full Gantt/RACI automation.",
        evidence: ["Implementation plans", "Falta automation"]
      },
      operational_communication: {
        name: "Operational Communication (SOPs 2-5 pages)",
        implemented: 40,
        functional: 35,
        notes: "Conceito definido. Sem SOP generator. Falta: Checklist automation, Escalation paths formais.",
        evidence: ["Conceito existe", "Sem implementation"]
      }
    },
    overall_implementation: 52,
    overall_functional: 48
  },

  // Integration & Orchestration
  integration_orchestration: {
    name: "Integration & Orchestration",
    icon: TrendingUp,
    color: "pink",
    capabilities: {
      msi_architecture: {
        name: "MSI - Multi-Substrate Intelligence",
        implemented: 75,
        functional: 70,
        notes: "caio_master tem tool_configs para KG + RAG + Pattern Synthesis. msiAnalysis function. Funcional.",
        evidence: ["msiAnalysis function", "Tool configs MSI", "3 substrates"]
      },
      knowledge_graph_substrate: {
        name: "Substrate A - Knowledge Graph Intelligence",
        implemented: 80,
        functional: 75,
        notes: "KnowledgeGraphNode/Relationship robustos. queryKnowledgeGraph (precisa query_type). 10K+ nodes. Funcional.",
        evidence: ["Graph entities", "10K+ connections", "queryKnowledgeGraph"]
      },
      rag_substrate: {
        name: "Substrate B - RAG Intelligence",
        implemented: 70,
        functional: 65,
        notes: "ragDocumentSearch implementado. DocumentEmbedding entity. WikiDocument para knowledge. Funcional.",
        evidence: ["ragDocumentSearch", "Document entities", "Search funcional"]
      },
      pattern_synthesis_substrate: {
        name: "Substrate C - Pattern Synthesis",
        implemented: 65,
        functional: 60,
        notes: "NIA metamodel para patterns. PatternRecognitionEngine component. Falta: Full emergent insight automation.",
        evidence: ["NIA agent", "Pattern components", "Partial automation"]
      },
      contextual_sensing_system: {
        name: "CSS - Contextual Sensing System",
        implemented: 50,
        functional: 45,
        notes: "Conceito de context assessment em agents. Falta: 5-dimensional assessment automático (Cynefin, Authority, etc).",
        evidence: ["Context awareness", "Sem 5D assessment"]
      },
      cynefin_assessment: {
        name: "Problem Complexity (Cynefin Framework)",
        implemented: 30,
        functional: 25,
        notes: "Não implementado. Sem classificação Clear/Complicated/Complex/Chaotic automática.",
        evidence: ["Conceito definido", "Sem classifier"]
      },
      stakeholder_authority_detection: {
        name: "Stakeholder Authority Detection",
        implemented: 70,
        functional: 65,
        notes: "RBAC detecta user roles. BehavioralProfile. Falta: Automatic authority level classification.",
        evidence: ["RBAC funcional", "User roles", "Falta auto-classification"]
      },
      time_horizon_analysis: {
        name: "Time Horizon Analysis",
        implemented: 40,
        functional: 35,
        notes: "Timeline fields em entities. Falta: Automatic classification (Immediate/Short/Medium/Long-term).",
        evidence: ["Date fields", "Sem horizon classification"]
      },
      information_availability_assessment: {
        name: "Information Availability Assessment",
        implemented: 35,
        functional: 30,
        notes: "Não implementado. Sem data-rich/sparse/conflicting classification automática.",
        evidence: ["Conceito existe", "Sem assessment"]
      },
      decision_reversibility_gauge: {
        name: "Decision Reversibility Gauge",
        implemented: 25,
        functional: 20,
        notes: "Não implementado. Conceito estratégico sem technical implementation.",
        evidence: ["Conceito definido", "Sem gauge"]
      }
    },
    overall_implementation: 61,
    overall_functional: 56
  },

  // Workflow & Automation
  workflow_automation: {
    name: "Workflow & Agent Automation",
    icon: Zap,
    color: "violet",
    capabilities: {
      agent_orchestration: {
        name: "Multi-Agent Orchestration",
        implemented: 85,
        functional: 80,
        notes: "AgentWorkflow, WorkflowExecution entities robustas. executeHierarchicalWorkflow. VisualWorkflowDesigner. Funcional.",
        evidence: ["Workflow entities", "Orchestration functions", "Designer UI", "Hierarchical support"]
      },
      autonomous_agents: {
        name: "Autonomous Agent System",
        implemented: 90,
        functional: 85,
        notes: "12+ agents implementados (M1-M11, caio_master, graph_builder). WhatsApp integration. Conversation management. Excelente.",
        evidence: ["12+ agents ativos", "WhatsApp ready", "Conversation SDK"]
      },
      workflow_templates: {
        name: "Workflow Templates",
        implemented: 75,
        functional: 70,
        notes: "WorkflowTemplate entity. seedWorkflowTemplates. WorkflowTemplates page. Funcional.",
        evidence: ["Template entity", "Seed function", "Templates page"]
      },
      scheduled_workflows: {
        name: "Scheduled Workflow Execution",
        implemented: 70,
        functional: 65,
        notes: "WorkflowSchedule entity. scheduleWorkflow, executeScheduledWorkflows functions. Funcional.",
        evidence: ["Schedule entity", "Execute functions", "Scheduling"]
      },
      self_correction: {
        name: "Self-Correction & Learning",
        implemented: 60,
        functional: 55,
        notes: "AgentTrainingDataset, AgentFeedback entities. Falta: Automatic self-correction loop active.",
        evidence: ["Training entities", "Feedback system", "Falta loop automático"]
      },
      performance_monitoring: {
        name: "Agent Performance Monitoring",
        implemented: 75,
        functional: 70,
        notes: "AgentPerformanceMetric entity. trackAgentPerformance function. AgentPerformance page. Funcional.",
        evidence: ["Metrics entity", "Tracking function", "Dashboard page"]
      }
    },
    overall_implementation: 76,
    overall_functional: 71
  },

  // Knowledge Management
  knowledge_management: {
    name: "Knowledge & Learning Systems",
    icon: Brain,
    color: "teal",
    capabilities: {
      knowledge_graph: {
        name: "Interactive Knowledge Graph",
        implemented: 90,
        functional: 85,
        notes: "KnowledgeGraphNode/Relationship entities. EnhancedInteractiveGraph. 10K+ connections. Save/share views. Excelente.",
        evidence: ["Graph entities", "10K+ nodes", "Interactive UI", "Clustering", "AI suggestions"]
      },
      knowledge_base: {
        name: "Knowledge Base Management",
        implemented: 80,
        functional: 75,
        notes: "KnowledgeItem, KnowledgeSource entities. indexKnowledgeSource, searchKnowledge. KnowledgeManagement page. Funcional.",
        evidence: ["Knowledge entities", "Search/index", "Management UI"]
      },
      rag_system: {
        name: "RAG Document Search",
        implemented: 75,
        functional: 70,
        notes: "ragDocumentSearch, indexDocument functions. DocumentEmbedding entity. Funcional.",
        evidence: ["RAG functions", "Embedding entity", "Document search"]
      },
      version_wiki: {
        name: "Version Wiki & Documentation",
        implemented: 85,
        functional: 80,
        notes: "WikiDocument entity. VersionWiki page com upload. Category organization. Funcional.",
        evidence: ["Wiki entity", "Upload/categorization", "Version tracking"]
      },
      institutional_memory: {
        name: "Institutional Memory",
        implemented: 70,
        functional: 65,
        notes: "InstitutionalMemory entity. AgentMemory para persistence. Funcional mas falta integration profunda.",
        evidence: ["Memory entities", "Storage functions", "Falta deep integration"]
      },
      global_search: {
        name: "Global Search & Indexing",
        implemented: 80,
        functional: 75,
        notes: "GlobalSearch component (⌘K). globalSearch, indexEntityForSearch functions. GlobalSearchIndex entity. Funcional.",
        evidence: ["Search UI", "Functions", "Index entity", "Keyboard shortcut"]
      }
    },
    overall_implementation: 80,
    overall_functional: 75
  },

  // User Experience & Interfaces
  ux_interfaces: {
    name: "UX & Interface Systems",
    icon: Eye,
    color: "orange",
    capabilities: {
      dashboard_system: {
        name: "Role-Based Dashboards",
        implemented: 85,
        functional: 80,
        notes: "Dashboard com DashboardCustomizer. RBAC roles. Widgets customizáveis. Compliance widget. Excelente.",
        evidence: ["Customizer", "RBAC", "Multiple widgets", "Compliance integration"]
      },
      tutorial_system: {
        name: "Tutorial & Onboarding",
        implemented: 90,
        functional: 85,
        notes: "TutorialSystem completo. TutorialLauncher. WelcomeModal. Context tips. Progress tracking. Excelente.",
        evidence: ["Tutorial framework", "Multiple tutorials", "Progress tracking", "Contextual tips"]
      },
      i18n_system: {
        name: "Internationalization (i18n)",
        implemented: 85,
        functional: 80,
        notes: "LanguageContext, LanguageSwitcher. Translations. Portuguese primary. Funcional.",
        evidence: ["i18n context", "Language switcher", "Translation files"]
      },
      accessibility: {
        name: "Accessibility (WCAG)",
        implemented: 75,
        functional: 70,
        notes: "AccessibilityEnhancer. ARIA labels. Keyboard navigation. Skip links. Bom.",
        evidence: ["Accessibility component", "ARIA support", "Keyboard shortcuts"]
      },
      theme_system: {
        name: "Theme & Design System",
        implemented: 95,
        functional: 90,
        notes: "globals.css com design system v12.0 completo. CAIO brand colors. Animations. Theme toggle. Excelente.",
        evidence: ["Design system v12", "Brand guide v2.0", "Animations", "Theme support"]
      },
      responsive_design: {
        name: "Responsive Mobile/Desktop",
        implemented: 90,
        functional: 85,
        notes: "Tailwind responsive. Mobile menu. Sidebar adaptation. Excelente coverage.",
        evidence: ["Responsive layouts", "Mobile menu", "Grid systems"]
      },
      seo_optimization: {
        name: "SEO & Performance",
        implemented: 85,
        functional: 80,
        notes: "Landing page com meta tags, Schema.org, OG tags, sitemap concepts. ScrollProgress. Bom.",
        evidence: ["Meta tags", "Schema.org JSON-LD", "OG/Twitter cards"]
      }
    },
    overall_implementation: 86,
    overall_functional: 81
  },

  // Data & Integrations
  data_integrations: {
    name: "Data & External Integrations",
    icon: Database,
    color: "emerald",
    capabilities: {
      company_discovery: {
        name: "Company Discovery & Intelligence",
        implemented: 80,
        functional: 75,
        notes: "Company, CompanyProfile entities. fetchCompanyFromCNPJ, enrichCompanyData. CompanyDiscovery page. Funcional.",
        evidence: ["Company entities", "CNPJ integration", "Enrichment", "Discovery UI"]
      },
      cvm_integration: {
        name: "CVM Data Integration",
        implemented: 70,
        functional: 65,
        notes: "CVMCompany, CVMEvent entities. syncCVMData, ingestCVMToGraph functions. CVMGraph page. Funcional.",
        evidence: ["CVM entities", "Sync functions", "Graph integration"]
      },
      financial_data: {
        name: "Financial Data (Alpha Vantage, etc)",
        implemented: 65,
        functional: 60,
        notes: "ALPHA_VANTAGE_API_KEY set. yahooFinanceData function. Falta: Full integration pipeline.",
        evidence: ["API key set", "Yahoo function", "Partial integration"]
      },
      news_sentiment: {
        name: "News & Sentiment Analysis",
        implemented: 60,
        functional: 55,
        notes: "NEWS_API_KEY set. fetchNewsSentiment function. Falta: Automated monitoring pipeline.",
        evidence: ["API key", "Fetch function", "Falta pipeline"]
      },
      social_monitoring: {
        name: "Social Media Monitoring",
        implemented: 55,
        functional: 50,
        notes: "TWITTER_BEARER_TOKEN set. socialMediaMonitoring function. Falta: Full platform coverage.",
        evidence: ["Twitter token", "Monitoring function", "Limited platforms"]
      },
      batch_ingestion: {
        name: "Batch Data Ingestion",
        implemented: 75,
        functional: 70,
        notes: "BatchIngestion page. ExtractDataFromUploadedFile. batchIngestCompanies. Funcional.",
        evidence: ["Batch UI", "Extract integration", "Batch functions"]
      },
      external_enrichment: {
        name: "External Data Enrichment",
        implemented: 70,
        functional: 65,
        notes: "enrichCompanyWithExternalData, autoEnrichEntity functions. EnrichmentSuggestion entity. Funcional.",
        evidence: ["Enrichment functions", "Suggestion entity", "Multi-source"]
      }
    },
    overall_implementation: 68,
    overall_functional: 63
  }
};

export default function TSICapabilitiesAudit() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [showExport, setShowExport] = useState(false);

  const calculateOverallScore = () => {
    const sections = Object.values(CAPABILITY_ASSESSMENT);
    const totalImpl = sections.reduce((sum, s) => sum + s.overall_implementation, 0) / sections.length;
    const totalFunc = sections.reduce((sum, s) => sum + s.overall_functional, 0) / sections.length;
    return { implementation: Math.round(totalImpl), functional: Math.round(totalFunc) };
  };

  const overall = calculateOverallScore();

  const exportReport = () => {
    const report = {
      audit_date: new Date().toISOString(),
      platform_version: "v9.2",
      overall_scores: overall,
      detailed_assessment: CAPABILITY_ASSESSMENT,
      summary: {
        highest_implementation: Object.entries(CAPABILITY_ASSESSMENT)
          .sort((a, b) => b[1].overall_implementation - a[1].overall_implementation)[0],
        lowest_implementation: Object.entries(CAPABILITY_ASSESSMENT)
          .sort((a, b) => a[1].overall_implementation - b[1].overall_implementation)[0],
        critical_gaps: Object.entries(CAPABILITY_ASSESSMENT)
          .flatMap(([key, section]) => 
            Object.entries(section.capabilities)
              .filter(([_, cap]) => cap.implemented < 50)
              .map(([capKey, cap]) => ({ section: section.name, capability: cap.name, score: cap.implemented }))
          )
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tsi-capabilities-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Relatório de auditoria exportado!");
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400 bg-green-500/20 border-green-500/30";
    if (score >= 65) return "text-blue-400 bg-blue-500/20 border-blue-500/30";
    if (score >= 50) return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
    return "text-red-400 bg-red-500/20 border-red-500/30";
  };

  const getStatusIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (score >= 50) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            TSI v9.2 Capabilities Audit
          </h1>
          <p className="text-slate-400">
            Avaliação completa de implementação e funcionalidade vs. especificação metodológica
          </p>
        </div>
        <Button
          onClick={exportReport}
          className="bg-gradient-to-r from-cyan-500 to-purple-500"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-slate-400 mb-2">Implementation Score</p>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-5xl font-bold text-white">{overall.implementation}%</span>
                <Badge className={getScoreColor(overall.implementation)}>
                  {overall.implementation >= 80 ? "Excelente" : 
                   overall.implementation >= 65 ? "Bom" :
                   overall.implementation >= 50 ? "Regular" : "Crítico"}
                </Badge>
              </div>
              <Progress value={overall.implementation} className="h-3" />
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">Functional Score</p>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-5xl font-bold text-white">{overall.functional}%</span>
                <Badge className={getScoreColor(overall.functional)}>
                  {overall.functional >= 80 ? "Excelente" : 
                   overall.functional >= 65 ? "Bom" :
                   overall.functional >= 50 ? "Regular" : "Crítico"}
                </Badge>
              </div>
              <Progress value={overall.functional} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capability Sections */}
      <div className="space-y-4">
        {Object.entries(CAPABILITY_ASSESSMENT).map(([key, section]) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === key;
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 border-white/10 overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedSection(isExpanded ? null : key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${section.color}-500/20 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${section.color}-400`} />
                      </div>
                      <div>
                        <CardTitle className="text-white">{section.name}</CardTitle>
                        <p className="text-sm text-slate-400">
                          {Object.keys(section.capabilities).length} capabilities assessed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Implementation</p>
                        <p className="text-2xl font-bold text-white">{section.overall_implementation}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Functional</p>
                        <p className="text-2xl font-bold text-white">{section.overall_functional}%</p>
                      </div>
                      {getStatusIcon(section.overall_functional)}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Implementation Progress</p>
                      <Progress value={section.overall_implementation} className="h-2" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Functional Progress</p>
                      <Progress value={section.overall_functional} className="h-2" />
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 pb-6 space-y-3">
                    {Object.entries(section.capabilities).map(([capKey, capability]) => (
                      <div 
                        key={capKey}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">{capability.name}</h4>
                            <p className="text-sm text-slate-300 mb-2">{capability.notes}</p>
                          </div>
                          <div className="flex gap-3 ml-4">
                            <div className="text-center">
                              <p className="text-xs text-slate-500">Impl</p>
                              <Badge className={getScoreColor(capability.implemented)}>
                                {capability.implemented}%
                              </Badge>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-slate-500">Func</p>
                              <Badge className={getScoreColor(capability.functional)}>
                                {capability.functional}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">Evidence:</p>
                          <ul className="space-y-0.5">
                            {capability.evidence.map((ev, idx) => (
                              <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                                <span className="text-slate-600">•</span>
                                {ev}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Implementation</p>
                            <Progress value={capability.implemented} className="h-1.5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Functional</p>
                            <Progress value={capability.functional} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Critical Gaps Summary */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Critical Gaps (Implementação {'<'} 50%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(CAPABILITY_ASSESSMENT).flatMap(([sectionKey, section]) =>
              Object.entries(section.capabilities)
                .filter(([_, cap]) => cap.implemented < 50)
                .map(([capKey, cap]) => (
                  <div key={`${sectionKey}-${capKey}`} className="flex items-center justify-between p-3 bg-black/20 rounded">
                    <div>
                      <p className="text-white font-medium">{cap.name}</p>
                      <p className="text-xs text-slate-400">{section.name}</p>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      {cap.implemented}% impl
                    </Badge>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Priority Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              priority: "CRITICAL",
              title: "Implement Hard Stop System (Hermes)",
              description: "4 halt conditions com recovery protocol para integrity enforcement",
              impact: "HIGH",
              effort: "Medium",
              score_impact: "+15%"
            },
            {
              priority: "HIGH",
              title: "Complete CRV Factor Breakdown",
              description: "5-factor weighted calculation para C, R, V com Overall Performance formula",
              impact: "HIGH",
              effort: "Medium",
              score_impact: "+12%"
            },
            {
              priority: "HIGH",
              title: "Implement CSS 5-Dimensional Assessment",
              description: "Cynefin, Authority, Time Horizon, Info Availability, Reversibility automático",
              impact: "HIGH",
              effort: "High",
              score_impact: "+10%"
            },
            {
              priority: "MEDIUM",
              title: "Build Precedent Database",
              description: "STJ/STF precedent tracking com Bayesian updates para legal intelligence",
              impact: "MEDIUM",
              effort: "High",
              score_impact: "+8%"
            },
            {
              priority: "MEDIUM",
              title: "Complete CCLO Dedicated Agent",
              description: "Agent separado para Corporate Legal Officer com Brazilian legal framework",
              impact: "MEDIUM",
              effort: "Medium",
              score_impact: "+7%"
            }
          ].map((rec, idx) => (
            <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={
                    rec.priority === "CRITICAL" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                    rec.priority === "HIGH" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }>
                    {rec.priority}
                  </Badge>
                  <h4 className="text-white font-semibold">{rec.title}</h4>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  {rec.score_impact}
                </Badge>
              </div>
              <p className="text-sm text-slate-300 mb-3">{rec.description}</p>
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-400">Impact: {rec.impact}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-400">Effort: {rec.effort}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}