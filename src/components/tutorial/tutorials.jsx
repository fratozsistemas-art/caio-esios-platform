import { 
  MessageSquare, Brain, Zap, FileText, Briefcase, Network, Target, 
  Upload, Search, TrendingUp, Users, Settings, Compass, Building2,
  GitMerge, Layers, Shield, BarChart3, Server, BookOpen, Cpu, Bot,
  Activity, Bell, Plug, Eye, Sparkles,CircleCheck 
} from 'lucide-react';

/**
 * CAIO·AI Tutorial System v11.0
 * Reorganized by user journey and complexity
 */

export const TUTORIAL_CATEGORIES = {
  onboarding: {
    id: 'onboarding',
    label: 'Primeiros Passos',
    labelEn: 'Getting Started',
    icon: Compass,
    color: '#C7A763',
    order: 1
  },
  core: {
    id: 'core',
    label: 'Funcionalidades Core',
    labelEn: 'Core Features',
    icon: Zap,
    color: '#3b82f6',
    order: 2
  },
  intelligence: {
    id: 'intelligence',
    label: 'Inteligência Estratégica',
    labelEn: 'Strategic Intelligence',
    icon: Brain,
    color: '#a855f7',
    order: 3
  },
  agents: {
    id: 'agents',
    label: 'Agentes & Workflows',
    labelEn: 'Agents & Workflows',
    icon: Bot,
    color: '#10b981',
    order: 4
  },
  collaboration: {
    id: 'collaboration',
    label: 'Colaboração',
    labelEn: 'Collaboration',
    icon: Users,
    color: '#f59e0b',
    order: 5
  },
  advanced: {
    id: 'advanced',
    label: 'Recursos Avançados',
    labelEn: 'Advanced Features',
    icon: Sparkles,
    color: '#ec4899',
    order: 6
  }
};

export const TUTORIALS = {
  // ═══════════════════════════════════════════════════════════════
  // ONBOARDING — Primeiros Passos
  // ═══════════════════════════════════════════════════════════════
  
  platformTour: {
    id: 'platformTour',
    title: 'Tour pela Plataforma',
    titleEn: 'Platform Tour',
    category: 'onboarding',
    description: 'Conheça as principais seções do CAIO·AI',
    descriptionEn: 'Explore the main sections of CAIO·AI',
    duration: '3 min',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Bem-vindo ao ESIOS CAIO! 🚀',
        content: 'Esta é sua plataforma de Inteligência Estratégica Executiva. Vamos fazer um tour rápido pelas principais funcionalidades.',
        icon: Brain,
      },
      {
        title: 'Navegação Principal 📍',
        content: 'O menu lateral organiza tudo em seções lógicas: Core, AI Agents, Intelligence, Analysis, Architecture, Projects, Data e Monitoring.',
        icon: Compass,
        highlightSection: 'sidebar'
      },
      {
        title: 'Busca Global (⌘K) 🔍',
        content: 'Pressione ⌘K (ou Ctrl+K) a qualquer momento para buscar estratégias, análises, empresas, pessoas e muito mais.',
        icon: Search,
      },
      {
        title: 'Central de Notificações 🔔',
        content: 'O sino no topo mostra alertas dos agentes, atualizações de workflows e notificações importantes em tempo real.',
        icon: Bell,
      },
      {
        title: 'Você está pronto! ✨',
        content: 'Explore os tutoriais específicos para aprofundar em cada funcionalidade. Clique no botão "Tutorials" no menu para acessar todos.',
        icon: Sparkles
      }
    ]
  },

  dashboard: {
    id: 'dashboard',
    title: 'Dashboard Executivo',
    titleEn: 'Executive Dashboard',
    category: 'onboarding',
    description: 'Centro de comando com métricas em tempo real',
    descriptionEn: 'Command center with real-time metrics',
    duration: '2 min',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Seu Centro de Comando 🎯',
        content: 'O Dashboard é sua visão consolidada de todas as atividades, insights e métricas do ESIOS CAIO.',
        icon: BarChart3,
      },
      {
        title: 'Métricas em Tempo Real 📡',
        content: 'Acompanhe usuários ativos, conversas ao vivo, análises do dia e tempo médio de resposta — atualizados automaticamente.',
        icon: Activity,
      },
      {
        title: 'Widgets Personalizáveis 🎨',
        content: 'Clique em "Customize" para reorganizar widgets, mostrar/ocultar seções e criar sua visualização ideal.',
        icon: Layers,
      },
      {
        title: 'Insights Proativos 💡',
        content: 'O CAIO monitora continuamente e exibe insights estratégicos, alertas e oportunidades detectadas.',
        icon: Sparkles,
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // CORE — Funcionalidades Essenciais
  // ═══════════════════════════════════════════════════════════════

  chatWithCaio: {
    id: 'chatWithCaio',
    title: 'Chat com CAIO',
    titleEn: 'Chat with CAIO',
    category: 'core',
    description: 'Conversas estratégicas com IA',
    descriptionEn: 'AI-powered strategic conversations',
    duration: '3 min',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Seu Parceiro Estratégico 💬',
        content: 'O CAIO é seu advisor de inteligência artificial. Pergunte sobre mercado, estratégia, finanças, competidores e muito mais.',
        icon: MessageSquare,
      },
      {
        title: 'Histórico de Conversas 📋',
        content: 'Suas conversas anteriores ficam salvas no painel lateral. O CAIO mantém contexto e memória de tudo que foi discutido.',
        icon: Brain,
      },
      {
        title: 'Upload de Arquivos 📎',
        content: 'Envie documentos, planilhas ou PDFs. O CAIO extrai dados e gera insights automaticamente.',
        icon: Upload,
      },
      {
        title: 'Seleção de Persona 🎭',
        content: 'Escolha diferentes personas de agente (Market Monitor, Strategy Doc, Knowledge Curator) para respostas especializadas.',
        icon: Bot,
      }
    ]
  },

  quickActions: {
    id: 'quickActions',
    title: 'Quick Actions',
    titleEn: 'Quick Actions',
    category: 'core',
    description: 'Análises estratégicas instantâneas',
    descriptionEn: 'Instant strategic analyses',
    duration: '2 min',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Análises Pré-Configuradas ⚡',
        content: 'Quick Actions são análises que acionam frameworks TSI específicos em segundos. Escolha uma e execute.',
        icon: Zap,
      },
      {
        title: 'Filtros por Cargo e Tema 🎯',
        content: 'Use filtros para encontrar análises relevantes para seu cargo (CEO, CFO, CTO) ou tema estratégico.',
        icon: Target,
      },
      {
        title: 'Detalhes da Ação 👁️',
        content: 'Clique em qualquer card para ver: frameworks utilizados, inputs necessários e outputs esperados.',
        icon: Eye,
      },
      {
        title: 'Execução e Resultados 🚀',
        content: 'Preencha os campos e execute. O CAIO processa usando múltiplos módulos TSI e retorna insights estruturados.',
        icon: Sparkles,
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // INTELLIGENCE — Inteligência Estratégica
  // ═══════════════════════════════════════════════════════════════

  tsiMethodology: {
    id: 'tsiMethodology',
    title: 'Metodologia TSI v9.3',
    titleEn: 'TSI v9.3 Methodology',
    category: 'intelligence',
    description: 'Framework de 11 módulos cognitivos',
    descriptionEn: '11-module cognitive framework',
    duration: '4 min',
    difficulty: 'intermediate',
    steps: [
      {
        title: 'Framework TSI v9.3 🧠',
        content: 'O TSI (Total Strategic Intelligence) é a metodologia proprietária do CAIO com 11 módulos cobrindo todas as dimensões estratégicas.',
        icon: Brain,
      },
      {
        title: 'Módulos M1-M4 📊',
        content: 'M1: Contexto de Mercado, M2: Inteligência Competitiva, M3: Tech & Inovação, M4: Modelo Financeiro — análise fundamental.',
        icon: BarChart3,
      },
      {
        title: 'Módulos M5-M7 🎯',
        content: 'M5: Síntese Estratégica (core), M6: Matriz de Oportunidades, M7: Planejamento de Implementação — convergência e execução.',
        icon: Target,
      },
      {
        title: 'Módulos M8-M11 🔮',
        content: 'M8: Reframing Maiêutico, M9: Funding Intelligence, M10: Behavioral Intelligence, M11: Hermes Governance — camadas avançadas.',
        icon: Sparkles,
      },
      {
        title: 'Projetos TSI Completos 📄',
        content: 'Crie projetos TSI para análises profundas. O sistema orquestra múltiplos agentes para gerar deliverables completos.',
        icon: FileText,
      }
    ]
  },

  knowledgeGraph: {
    id: 'knowledgeGraph',
    title: 'Knowledge Graph',
    titleEn: 'Knowledge Graph',
    category: 'intelligence',
    description: 'Grafo de conexões estratégicas',
    descriptionEn: 'Strategic connections graph',
    duration: '3 min',
    difficulty: 'intermediate',
    steps: [
      {
        title: 'Rede de Conexões 🕸️',
        content: 'O Knowledge Graph conecta empresas, executivos, tecnologias, frameworks e métricas em uma rede semântica com 10K+ entidades.',
        icon: Network,
      },
      {
        title: 'Descoberta de Padrões 🔍',
        content: 'Visualize relacionamentos ocultos, identifique padrões de sucesso e explore casos similares.',
        icon: Search,
      },
      {
        title: 'Auto-Enriquecimento 🤖',
        content: 'O sistema enriquece automaticamente o grafo com dados de CVM, LinkedIn, APIs financeiras e mais.',
        icon: Zap,
      },
      {
        title: 'Queries em Linguagem Natural 💡',
        content: 'Faça perguntas em português e o CAIO consulta o grafo para trazer insights relevantes.',
        icon: MessageSquare,
      }
    ]
  },

  vectorDecisionEngine: {
    id: 'vectorDecisionEngine',
    title: 'Vector Decision Engine',
    titleEn: 'Vector Decision Engine',
    category: 'intelligence',
    description: 'Decisões vetoriais com validação AI',
    descriptionEn: 'Vectorial decisions with AI validation',
    duration: '4 min',
    difficulty: 'advanced',
    steps: [
      {
        title: 'Decisões Vetoriais 🧭',
        content: 'Externalize decisões estratégicas como vetores com direção, intensidade e horizonte temporal.',
        icon: Compass,
      },
      {
        title: 'Forças e Contraforças ⚔️',
        content: 'Mapeie forças aceleradoras e opostas. Visualize o campo de forças que influencia sua decisão.',
        icon: Target,
      },
      {
        title: 'Validação por IA 🤖',
        content: 'O CAIO valida consistência, identifica blind spots e sugere vetores alternativos.',
        icon: Shield,
      },
      {
        title: 'Checkpoints de Monitoramento 📍',
        content: 'Defina checkpoints para reavaliar a decisão. Receba alertas quando condições mudarem.',
        icon: Bell,
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // AGENTS — Agentes e Workflows
  // ═══════════════════════════════════════════════════════════════

  autonomousAgents: {
    id: 'autonomousAgents',
    title: 'Agentes Autônomos',
    titleEn: 'Autonomous Agents',
    category: 'agents',
    description: 'Três agentes especializados do CAIO',
    descriptionEn: 'Three specialized CAIO agents',
    duration: '3 min',
    difficulty: 'intermediate',
    steps: [
      {
        title: 'Market Monitor 📊',
        content: 'Monitora mercados, detecta sinais fracos, analisa tendências e gera alertas sobre oportunidades e ameaças.',
        icon: Eye,
      },
      {
        title: 'Strategy Doc Generator 📄',
        content: 'Gera documentos estratégicos, relatórios executivos, investment memos e playbooks automaticamente.',
        icon: FileText,
      },
      {
        title: 'Knowledge Curator 🧠',
        content: 'Curadoria do Knowledge Graph, enriquece entidades, sugere conexões e mantém a base de conhecimento atualizada.',
        icon: Brain,
      },
      {
        title: 'Colaboração entre Agentes 🤝',
        content: 'Os agentes colaboram automaticamente, passando contexto e acionando uns aos outros quando necessário.',
        icon: Network,
      }
    ]
  },

  workflowDesigner: {
    id: 'workflowDesigner',
    title: 'Workflow Designer',
    titleEn: 'Workflow Designer',
    category: 'agents',
    description: 'Construa workflows visuais multi-agente',
    descriptionEn: 'Build visual multi-agent workflows',
    duration: '4 min',
    difficulty: 'advanced',
    steps: [
      {
        title: 'Designer Visual 🎨',
        content: 'Arraste e solte nodes para criar workflows que orquestram múltiplos agentes em sequência ou paralelo.',
        icon: GitMerge,
      },
      {
        title: 'Tipos de Nodes 🔷',
        content: 'Nodes de agente, condição, loop, agregação e transformação. Conecte-os para criar fluxos complexos.',
        icon: Layers,
      },
      {
        title: 'Triggers e Schedules ⏰',
        content: 'Configure triggers (evento, schedule, webhook) para executar workflows automaticamente.',
        icon: Zap,
      },
      {
        title: 'Monitoramento em Tempo Real 📡',
        content: 'Acompanhe execuções ao vivo, veja logs, identifique gargalos e otimize performance.',
        icon: Activity,
      }
    ]
  },

  agentTraining: {
    id: 'agentTraining',
    title: 'Treinamento de Agentes',
    titleEn: 'Agent Training',
    category: 'agents',
    description: 'Retreine agentes com feedback',
    descriptionEn: 'Retrain agents with feedback',
    duration: '4 min',
    difficulty: 'advanced',
    steps: [
      {
        title: 'Feedback Loop 🔄',
        content: 'Colete feedback (thumbs up/down, ratings, edições) sobre outputs dos agentes para melhorar continuamente.',
        icon: TrendingUp,
      },
      {
        title: 'Curadoria de Dados 📊',
        content: 'Revise, aprove ou rejeite samples de feedback. Gere dados sintéticos para augmentação.',
        icon: Server,
      },
      {
        title: 'Análise e Retreinamento 🤖',
        content: 'O sistema analisa feedback, identifica áreas de melhoria e aciona retreinamento automático.',
        icon: Cpu,
      },
      {
        title: 'Versionamento de Modelos 📦',
        content: 'Cada retreinamento gera nova versão. Compare métricas pré/pós e faça rollback se necessário.',
        icon: GitMerge,
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // COLLABORATION — Colaboração
  // ═══════════════════════════════════════════════════════════════

  teamCollaboration: {
    id: 'teamCollaboration',
    title: 'Colaboração em Equipe',
    titleEn: 'Team Collaboration',
    category: 'collaboration',
    description: 'Trabalhe em tempo real com seu time',
    descriptionEn: 'Work in real-time with your team',
    duration: '3 min',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Presença em Tempo Real 🟢',
        content: 'Veja quem está online, o que estão visualizando e colabore simultaneamente em estratégias e análises.',
        icon: Users,
      },
      {
        title: 'Comentários e Threads 💬',
        content: 'Adicione comentários em qualquer entidade. Crie threads, mencione colegas com @ e reaja com emojis.',
        icon: MessageSquare,
      },
      {
        title: 'Tarefas e Atribuições ✅',
        content: 'Crie tarefas a partir de qualquer insight. Atribua responsáveis, defina prioridade e prazo.',
        icon: Target,
      },
      {
        title: 'Feed de Atividades 📋',
        content: 'Acompanhe todas as ações da equipe: comentários, tarefas concluídas, insights compartilhados.',
        icon: Activity,
      }
    ]
  },

  workspaces: {
    id: 'workspaces',
    title: 'Workspaces',
    titleEn: 'Workspaces',
    category: 'collaboration',
    description: 'Organize iniciativas estratégicas',
    descriptionEn: 'Organize strategic initiatives',
    duration: '2 min',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Organização por Projeto 🗂️',
        content: 'Workspaces agrupam análises, documentos e conversas por projeto ou iniciativa estratégica.',
        icon: Briefcase,
      },
      {
        title: 'Templates Prontos 📋',
        content: 'Use templates para M&A Due Diligence, Market Entry, Digital Transformation e mais.',
        icon: Layers,
      },
      {
        title: 'Fases e Deliverables 🎯',
        content: 'Cada workspace tem fases definidas com Quick Actions sugeridas e deliverables esperados.',
        icon: Target,
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ADVANCED — Recursos Avançados
  // ═══════════════════════════════════════════════════════════════

  hermesGovernance: {
    id: 'hermesGovernance',
    title: 'HERMES Governance',
    titleEn: 'HERMES Governance',
    category: 'advanced',
    description: 'Governança cognitiva e trust-brokering',
    descriptionEn: 'Cognitive governance and trust-brokering',
    duration: '4 min',
    difficulty: 'advanced',
    steps: [
      {
        title: 'Trust-Broker 🛡️',
        content: 'O HERMES é a camada de governança que garante consistência, rastreabilidade e integridade das decisões de IA.',
        icon: Shield,
      },
      {
        title: 'Módulos H1-H4 🔷',
        content: 'H1: Tradução Vetorial, H2: Clareza Cognitiva, H3: Buffer Emocional, H4: Auditoria de Coerência.',
        icon: Layers,
      },
      {
        title: 'Auto-Triggers 🚨',
        content: 'Configure regras que acionam análises HERMES automaticamente quando thresholds são atingidos.',
        icon: Bell,
      },
      {
        title: 'Remediação Automática 🔧',
        content: 'O sistema pode executar ações corretivas automaticamente ou sugerir intervenções humanas.',
        icon: Settings,
      }
    ]
  },

  integrations: {
    id: 'integrations',
    title: 'Integrações',
    titleEn: 'Integrations',
    category: 'advanced',
    description: 'Conecte fontes de dados externas',
    descriptionEn: 'Connect external data sources',
    duration: '3 min',
    difficulty: 'intermediate',
    steps: [
      {
        title: 'Hub de Integrações 🔌',
        content: 'Conecte APIs financeiras, CVM, LinkedIn, news feeds e outras fontes para enriquecer análises.',
        icon: Plug,
      },
      {
        title: 'Ingestão de Dados 📥',
        content: 'Faça upload em batch de empresas, execute scraping de CVM e sincronize dados automaticamente.',
        icon: Upload,
      },
      {
        title: 'Monitoramento de Saúde 💚',
        content: 'Acompanhe status de cada integração, taxa de sucesso e receba alertas de falhas.',
        icon: Activity,
      }
    ]
  },

  architectureAudit: {
    id: 'architectureAudit',
    title: 'Auditoria Arquitetural',
    titleEn: 'Architecture Audit',
    category: 'advanced',
    description: 'Conformidade com arquitetura v10.0',
    descriptionEn: 'v10.0 architecture compliance',
    duration: '3 min',
    difficulty: 'advanced',
    steps: [
      {
        title: 'Camadas Cognitivas 🧠',
        content: 'Visualize a implementação das 5 camadas: CAIO, TSI, TIS, ESIOS e HERMES com scores de maturidade.',
        icon: Layers,
      },
      {
        title: 'Gaps e Roadmap 🗺️',
        content: 'Identifique funções não implementadas e veja o roadmap sugerido para evolução.',
        icon: TrendingUp,
      },
      {
        title: 'Funcionalidades v10.0 ✨',
        content: 'Explore features além da arquitetura original: Agent Workflows, Knowledge Graph, Training Hub.',
        icon: Sparkles,
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // TSI MODULE DEEP DIVES
  // ═══════════════════════════════════════════════════════════════

  m1MarketContext: {
    id: 'm1MarketContext',
    title: 'M1 - Contexto de Mercado',
    titleEn: 'M1 - Market Context',
    category: 'intelligence',
    description: 'Análise de mercado e tendências macro',
    descriptionEn: 'Market analysis and macro trends',
    duration: '5 min',
    difficulty: 'intermediate',
    steps: [
      {
        title: 'Módulo M1 🌍',
        content: 'M1 analisa contexto de mercado: tamanho, crescimento, tendências macro, drivers de mudança e forças estruturais.',
        icon: TrendingUp,
      },
      {
        title: 'Execute M1 Analysis 🚀',
        content: 'Vá em AI Modules > M1 Market Context. Insira o mercado alvo (ex: "Fintech no Brasil") e execute.',
        icon: Zap,
        highlightPage: 'AIModules'
      },
      {
        title: 'Interprete os Outputs 📊',
        content: 'M1 retorna: market sizing, CAGR, drivers principais, barreiras de entrada, e tendências emergentes.',
        icon: BarChart3,
      },
      {
        title: 'Conexão com Knowledge Graph 🕸️',
        content: 'O M1 alimenta o Knowledge Graph com empresas, tecnologias e métricas de mercado automaticamente.',
        icon: Network,
      }
    ]
  },

  m2CompetitiveAnalysis: {
    id: 'm2CompetitiveAnalysis',
    title: 'M2 - Inteligência Competitiva',
    titleEn: 'M2 - Competitive Intelligence',
    category: 'intelligence',
    description: 'Análise de competidores e posicionamento',
    descriptionEn: 'Competitor analysis and positioning',
    duration: '5 min',
    difficulty: 'intermediate',
    steps: [
      {
        title: 'Módulo M2 🎯',
        content: 'M2 mapeia o campo competitivo: players principais, diferenciação, forças/fraquezas, e movimentos estratégicos.',
        icon: Target,
      },
      {
        title: 'Competitive Mapping 🗺️',
        content: 'O M2 cria mapas de posicionamento, identifica gaps de mercado e oportunidades de diferenciação.',
        icon: Compass,
      },
      {
        title: 'Análise de Concorrentes 🔍',
        content: 'Para cada competidor: estratégia revelada, vantagens competitivas, vulnerabilidades e movimentos recentes.',
        icon: Eye,
      },
      {
        title: 'Recomendações Estratégicas 💡',
        content: 'M2 sugere: onde competir, onde evitar, como diferenciar, e quais competidores monitorar.',
        icon: Sparkles,
      }
    ]
  },

  m5StrategicSynthesis: {
    id: 'm5StrategicSynthesis',
    title: 'M5 - Síntese Estratégica (CORE)',
    titleEn: 'M5 - Strategic Synthesis (CORE)',
    category: 'intelligence',
    description: 'Convergência de todos os módulos TSI',
    descriptionEn: 'Convergence of all TSI modules',
    duration: '6 min',
    difficulty: 'advanced',
    steps: [
      {
        title: 'O Coração do TSI 💎',
        content: 'M5 é o módulo CORE que sintetiza outputs de M1-M4 e M6-M11 em recomendações estratégicas acionáveis.',
        icon: Brain,
      },
      {
        title: 'Convergência Multi-Módulo 🔗',
        content: 'M5 integra: contexto (M1), competição (M2), tecnologia (M3), finanças (M4) em narrativas coerentes.',
        icon: GitMerge,
      },
      {
        title: 'Cenários Estratégicos 🎲',
        content: 'Gera múltiplos cenários (pessimista, base, otimista) com caminhos de execução alternativos.',
        icon: Layers,
      },
      {
        title: 'Decision Support 🧭',
        content: 'Recomenda: foco estratégico, posicionamento, investimentos prioritários, e riscos a mitigar.',
        icon: Compass,
      },
      {
        title: 'Exportação e Compartilhamento 📤',
        content: 'Exporte sínteses como PDF, compartilhe com stakeholders ou salve no workspace para referência.',
        icon: FileText,
      }
    ]
  },

  aiAnalysisWorkflow: {
    id: 'aiAnalysisWorkflow',
    title: 'Workflow de Análise AI',
    titleEn: 'AI Analysis Workflow',
    category: 'intelligence',
    description: 'Fluxo completo de análise estratégica com AI',
    descriptionEn: 'Complete strategic analysis flow with AI',
    duration: '7 min',
    difficulty: 'intermediate',
    steps: [
      {
        title: 'Upload de Dados 📁',
        content: 'Comece fazendo upload de documentos (pitch deck, financials, market research) no File Analyzer.',
        icon: Upload,
      },
      {
        title: 'Extração Automática 🤖',
        content: 'A AI extrai: KPIs, competidores, tecnologias, oportunidades, riscos e insights estruturados.',
        icon: Bot,
      },
      {
        title: 'Enriquecimento com Módulos TSI 🧠',
        content: 'Execute M1-M5 para aprofundar análises. Cada módulo adiciona camadas de inteligência.',
        icon: Brain,
      },
      {
        title: 'Visualize no Knowledge Graph 🕸️',
        content: 'Dados extraídos alimentam o Knowledge Graph. Explore conexões e descubra insights ocultos.',
        icon: Network,
      },
      {
        title: 'Gere Relatórios Executivos 📄',
        content: 'Use o Report Builder para criar PDFs ou CSVs customizados com os insights gerados.',
        icon: FileText,
      },
      {
        title: 'Colabore e Compartilhe 👥',
        content: 'Adicione análises a Workspaces, convide membros, crie tarefas e colabore em tempo real.',
        icon: Users,
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // COLLABORATION DEEP DIVES
  // ═══════════════════════════════════════════════════════════════

  workspaceManagement: {
    id: 'workspaceManagement',
    title: 'Gestão de Workspaces',
    titleEn: 'Workspace Management',
    category: 'collaboration',
    description: 'Organize e gerencie projetos estratégicos',
    descriptionEn: 'Organize and manage strategic projects',
    duration: '5 min',
    difficulty: 'intermediate',
    steps: [
      {
        title: 'Crie seu Workspace 🗂️',
        content: 'Vá em Workspaces > Create New. Escolha um template (Strategic Planning, M&A, Digital Transformation).',
        icon: Briefcase,
      },
      {
        title: 'Estrutura de Fases 📋',
        content: 'Cada workspace tem fases pré-definidas (Discovery, Analysis, Synthesis, Execution) com Quick Actions sugeridas.',
        icon: Layers,
      },
      {
        title: 'Adicione Recursos 📎',
        content: 'Link estratégias, análises, documentos e graph nodes ao workspace. Tudo centralizado em um lugar.',
        icon: FileText,
      },
      {
        title: 'Gestão de Acesso 👥',
        content: 'Convide membros com níveis de acesso (Owner, Editor, Viewer). Configure permissões granulares.',
        icon: Users,
      },
      {
        title: 'Compartilhamento Externo 🔗',
        content: 'Gere links de acesso para stakeholders externos com expiração e proteção por senha.',
        icon: Network,
      },
      {
        title: 'Track Progress 📈',
        content: 'Acompanhe % de progresso, deliverables completados, e atividade da equipe no dashboard do workspace.',
        icon: TrendingUp,
      }
    ]
  },

  collaborationFeatures: {
    id: 'collaborationFeatures',
    title: 'Ferramentas de Colaboração',
    titleEn: 'Collaboration Tools',
    category: 'collaboration',
    description: 'Trabalhe em tempo real com sua equipe',
    descriptionEn: 'Work in real-time with your team',
    duration: '4 min',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Comentários e Anotações 💬',
        content: 'Adicione comentários em estratégias, análises e graph nodes. Use @ para mencionar colegas.',
        icon: MessageSquare,
      },
      {
        title: 'Presença em Tempo Real 🟢',
        content: 'Veja quem está online e o que estão visualizando. Cursores e highlights aparecem em tempo real.',
        icon: Activity,
      },
      {
        title: 'Task Management ✅',
        content: 'Crie tarefas a partir de qualquer insight. Atribua responsáveis, defina prioridade e acompanhe conclusão.',
        icon: CircleCheck,
      },
      {
        title: 'Compartilhe Insights 🔗',
        content: 'Compartilhe estratégias, análises ou insights individuais com link direto ou exportação.',
        icon: Network,
      },
      {
        title: 'Feed de Atividades 📡',
        content: 'Visualize todas as ações da equipe em um feed centralizado: comentários, edições, conclusões.',
        icon: Bell,
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL AI FEATURES
  // ═══════════════════════════════════════════════════════════════

  fileAnalyzer: {
    id: 'fileAnalyzer',
    title: 'File Analyzer',
    titleEn: 'File Analyzer',
    category: 'intelligence',
    description: 'Extraia insights de documentos com AI',
    descriptionEn: 'Extract insights from documents with AI',
    duration: '4 min',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Upload de Documentos 📤',
        content: 'Faça upload de PDFs, Excel, Word, PowerPoint ou CSVs. A AI processa qualquer formato.',
        icon: Upload,
      },
      {
        title: 'Extração Inteligente 🧠',
        content: 'A AI extrai automaticamente: KPIs, números financeiros, competidores, riscos, oportunidades.',
        icon: Brain,
      },
      {
        title: 'Tipos de Análise 🎯',
        content: 'Escolha: Pitch Deck Analysis, Financial Analysis, Tech Stack, ou SIU (Structured Unstructured Analysis).',
        icon: Target,
      },
      {
        title: 'Visualizações Automáticas 📊',
        content: 'Gráficos, tabelas e dashboards são gerados automaticamente dos dados extraídos.',
        icon: BarChart3,
      },
      {
        title: 'Salve e Compartilhe 💾',
        content: 'Análises ficam salvas no banco de dados. Compartilhe com equipe ou adicione a workspaces.',
        icon: Network,
      }
    ]
  },

  strategyAdvisor: {
    id: 'strategyAdvisor',
    title: 'Strategy Advisor',
    titleEn: 'Strategy Advisor',
    category: 'intelligence',
    description: 'Consultor AI para decisões estratégicas',
    descriptionEn: 'AI consultant for strategic decisions',
    duration: '4 min',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Faça Perguntas Estratégicas 💡',
        content: 'Pergunte sobre: market entry, competitive positioning, product strategy, investment decisions.',
        icon: MessageSquare,
      },
      {
        title: 'Contexto Automático 🧠',
        content: 'O Strategy Advisor busca no Knowledge Graph, documentos salvos e análises anteriores para contextualizar.',
        icon: Brain,
      },
      {
        title: 'Recomendações Estruturadas 📋',
        content: 'Receba: risk factors, opportunities, action items priorizados, e confidence scores.',
        icon: CircleCheck,
      },
      {
        title: 'Documentos Referenciados 📚',
        content: 'Cada recomendação cita documentos da Wiki e análises anteriores que embasam a resposta.',
        icon: BookOpen,
      }
    ]
  },

  agentOrchestration: {
    id: 'agentOrchestration',
    title: 'Orquestração de Agentes',
    titleEn: 'Agent Orchestration',
    category: 'agents',
    description: 'Execute workflows multi-agente complexos',
    descriptionEn: 'Execute complex multi-agent workflows',
    duration: '6 min',
    difficulty: 'advanced',
    steps: [
      {
        title: 'Templates de Workflow 📋',
        content: 'Escolha templates prontos: Market Research, Due Diligence, Competitive Intel, ou crie do zero.',
        icon: Layers,
      },
      {
        title: 'Configure Sub-Teams 👥',
        content: 'Organize agentes em sub-teams (Research, Analysis, Synthesis) com coordenadores.',
        icon: Users,
      },
      {
        title: 'Fluxo de Dados 🔄',
        content: 'Visualize como dados fluem entre agentes. Configure transformações e agregações.',
        icon: GitMerge,
      },
      {
        title: 'Execução Paralela ⚡',
        content: 'Agentes executam em paralelo quando possível, acelerando workflows complexos.',
        icon: Zap,
      },
      {
        title: 'Intervenção Humana 🖐️',
        content: 'Configure checkpoints para revisão humana. Pause, ajuste parâmetros e continue execução.',
        icon: Target,
      },
      {
        title: 'Monitoramento Real-Time 📡',
        content: 'Acompanhe execuções ao vivo com logs, métricas de performance e comunicação entre agentes.',
        icon: Activity,
      }
    ]
  },

  reportGeneration: {
    id: 'reportGeneration',
    title: 'Geração de Relatórios',
    titleEn: 'Report Generation',
    category: 'intelligence',
    description: 'Crie relatórios executivos automatizados',
    descriptionEn: 'Create automated executive reports',
    duration: '3 min',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Templates de Relatório 📄',
        content: 'Escolha entre: Executive Summary, Competitive Landscape, Financial Review, Strategic Roadmap.',
        icon: FileText,
      },
      {
        title: 'Selecione Fontes de Dados 📊',
        content: 'Combine dados de: análises TSI, Knowledge Graph, conversas com CAIO, ou uploads de arquivos.',
        icon: Server,
      },
      {
        title: 'Gere e Exporte 🚀',
        content: 'Gere PDF ou CSV em segundos. Relatórios incluem visualizações, tabelas e narrativas AI-generated.',
        icon: Zap,
      },
      {
        title: 'Agende Recorrência ⏰',
        content: 'Configure relatórios automáticos (daily, weekly, monthly) enviados por email aos stakeholders.',
        icon: Bell,
      }
    ]
  },

  realTimeWidgets: {
    id: 'realTimeWidgets',
    title: 'Widgets de Dados em Tempo Real',
    titleEn: 'Real-Time Data Widgets',
    category: 'core',
    description: 'Dados de mercado ao vivo no dashboard',
    descriptionEn: 'Live market data on dashboard',
    duration: '5 min',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Ticker de Ações ao Vivo 📈',
        content: 'Monitore preços de ações em tempo real das principais empresas de tecnologia. Verde = ganhos, Vermelho = perdas.',
        icon: TrendingUp,
      },
      {
        title: 'Auto-Refresh e Controles ⏱️',
        content: 'O widget atualiza automaticamente a cada 30 segundos. Clique em "Paused" para pausar ou no botão de refresh para atualização manual.',
        icon: Activity,
      },
      {
        title: 'Feed de Notícias 📰',
        content: 'Acesse notícias de mercado em tempo real com análise de sentimento. Clique em artigos para ler a história completa.',
        icon: MessageSquare,
      },
      {
        title: 'Indicadores Econômicos 📊',
        content: 'Acompanhe IPCA (inflação), CDI e taxa USD/BRL do Banco Central. Dados atualizados a cada hora.',
        icon: BarChart3,
      },
      {
        title: 'Customize seu Dashboard 🎨',
        content: 'Use o DashboardCustomizer para mostrar/ocultar widgets de mercado conforme sua necessidade.',
        icon: Layers,
      }
    ]
  },

  marketIntelligence: {
    id: 'marketIntelligence',
    title: 'Market Intelligence (M1)',
    titleEn: 'Market Intelligence (M1)',
    category: 'intelligence',
    description: 'Análise de mercado com dados em tempo real',
    descriptionEn: 'Market analysis with real-time data',
    duration: '8 min',
    difficulty: 'intermediate',
    steps: [
      {
        title: 'Módulo M1 Aprimorado 🚀',
        content: 'O M1 agora integra dados em tempo real: preços de ações, notícias e indicadores econômicos para análises mais dinâmicas.',
        icon: Brain,
      },
      {
        title: 'Coleta de Dados Automática 📡',
        content: 'O M1 busca automaticamente: quotes de ações via Alpha Vantage, notícias via News API, e dados do Banco Central.',
        icon: Server,
      },
      {
        title: 'Análise de Tendências 📈',
        content: 'A IA identifica tendências emergentes, momentum de mercado e sentimento baseado em movimentos de ações e headlines.',
        icon: TrendingUp,
      },
      {
        title: 'Identificação de Oportunidades 💡',
        content: 'O M1 detecta oportunidades específicas com ROI estimado, timeframe e nível de confiança.',
        icon: Sparkles,
      },
      {
        title: 'Avaliação de Riscos ⚠️',
        content: 'Identifica riscos potenciais, volatilidade de mercado e fatores de atenção com estratégias de mitigação.',
        icon: Shield,
      },
      {
        title: 'Recomendações Estratégicas 🎯',
        content: 'Receba ações priorizadas com justificativas baseadas nos dados de mercado em tempo real.',
        icon: Target,
      },
      {
        title: 'Salva como Strategic Facts 💾',
        content: 'Oportunidades e riscos são salvos automaticamente como StrategicFacts para rastreamento e análise futura.',
        icon: BookOpen,
      },
      {
        title: 'Acesse Análises Salvas 📂',
        content: 'Vá em Strategic Facts Manager para visualizar todas as análises M1, filtrar por tags e explorar no grafo.',
        icon: Network,
      }
    ]
  }
};

// Helper para obter tutoriais por categoria
export const getTutorialsByCategory = () => {
  const result = {};
  
  Object.values(TUTORIAL_CATEGORIES).forEach(cat => {
    result[cat.id] = {
      ...cat,
      tutorials: Object.values(TUTORIALS).filter(t => t.category === cat.id)
    };
  });
  
  return result;
};

// Helper para obter tutorial específico
export const getTutorial = (id) => TUTORIALS[id];

// Ordem recomendada para novos usuários
export const RECOMMENDED_ORDER = [
  'platformTour',
  'dashboard',
  'realTimeWidgets',
  'marketIntelligence',
  'chatWithCaio',
  'quickActions',
  'tsiMethodology',
  'autonomousAgents',
  'knowledgeGraph',
  'teamCollaboration'
];