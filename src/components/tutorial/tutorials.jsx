import { 
  MessageSquare, Brain, Zap, FileText, Briefcase, Network, Target, 
  Upload, Search, TrendingUp, Users, Settings, Compass, Building2,
  GitMerge, Layers, Shield, BarChart3, Database, BookOpen, Cpu, Bot,
  Activity, Bell, Plug, Eye, Sparkles
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
        title: 'Bem-vindo ao CAIO·AI! 🚀',
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
        content: 'O Dashboard é sua visão consolidada de todas as atividades, insights e métricas do CAIO·AI.',
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
        icon: Database,
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
  'chatWithCaio',
  'quickActions',
  'tsiMethodology',
  'autonomousAgents',
  'knowledgeGraph',
  'teamCollaboration'
];