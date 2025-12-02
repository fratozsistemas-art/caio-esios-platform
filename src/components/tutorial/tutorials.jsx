import { 
  MessageSquare, Brain, Zap, FileText, Briefcase, Network, Target, 
  Upload, Search, TrendingUp, Users, Settings, Compass, Building2, Code,
  GitMerge, Layers, Shield, BarChart3, Database, BookOpen, Cpu
} from 'lucide-react';

export const TUTORIALS = {
  navigation: {
    id: 'navigation',
    title: 'Platform Navigation',
    category: 'Getting Started',
    description: 'Explore the main sections of CAIO·AI',
    steps: [
      {
        title: 'Welcome to CAIO·AI! 🚀',
        content: 'Let\'s take a quick tour of the platform. You\'ll discover how to access all powerful features organized in logical sections.',
        icon: Brain,
      },
      {
        title: 'Core Section 🎯',
        content: 'Essential tools: Dashboard for overview, Chat with CAIO for AI interactions, and Quick Actions for rapid strategic analysis.',
        icon: Zap,
        highlightSection: 'Core'
      },
      {
        title: 'Intelligence Section 🧠',
        content: 'Advanced features: Company Intelligence Hub, Behavioral Intelligence, Knowledge Management, Knowledge Graph, Network Map, Agent Memory, and CVM Graph.',
        icon: Brain,
        highlightSection: 'Intelligence'
      },
      {
        title: 'Companies Section 🏢',
        content: 'Manage company data: discover new companies (ESIOS), ingest CVM data from Brazilian securities, and perform batch operations.',
        icon: Building2,
        highlightSection: 'Companies'
      },
      {
        title: 'Analysis Section 📊',
        content: 'Deep analysis: TSI Projects for strategic intelligence methodology, File Analyzer for documents, and Tech Intelligence for technology stack discovery.',
        icon: FileText,
        highlightSection: 'Analysis'
      },
      {
        title: 'AI Workflows Section ⚡',
        content: 'Orchestrate AI agents: create workflows, use templates, monitor performance, and train custom agents for specialized tasks.',
        icon: GitMerge,
        highlightSection: 'AI Workflows'
      },
      {
        title: 'Governance Section 🛡️',
        content: 'Cognitive governance with Hermes Trust-Broker: monitor AI decisions, set auto-trigger rules, track integrity, and manage support tickets.',
        icon: Shield,
        highlightSection: 'Governance'
      },
      {
        title: 'You\'re All Set! ✨',
        content: 'Use ⌘K (Ctrl+K) for global search anytime. Click the tutorial button in the sidebar to replay or explore other tutorials.',
        icon: Search
      }
    ]
  },

  collaboration: {
    id: 'collaboration',
    title: 'Collaboration Tools',
    category: 'Teamwork',
    description: 'Learn to collaborate with your team in real-time',
    steps: [
      {
        title: 'Real-Time Collaboration 👥',
        content: 'CAIO·AI enables seamless teamwork. See who\'s online, what they\'re working on, and collaborate in real-time across all strategic initiatives.',
        icon: Users,
      },
      {
        title: 'User Presence 🟢',
        content: 'The presence indicator shows team members currently viewing the same entity. Avatars display status (online, away, busy) for instant awareness.',
        icon: Users,
        targetSelector: '[data-tour="user-presence"]'
      },
      {
        title: 'Comments & Discussions 💬',
        content: 'Add comments to any strategy, analysis, or workspace. Reply to create threads, @mention colleagues, and add emoji reactions. Resolve threads when done.',
        icon: MessageSquare,
        targetSelector: '[data-tour="comments"]'
      },
      {
        title: 'Task Assignments ✅',
        content: 'Create tasks directly from any entity. Assign to team members, set priority and due dates. Track progress and receive notifications on updates.',
        icon: Target,
        targetSelector: '[data-tour="tasks"]'
      },
      {
        title: 'Activity Feed 📋',
        content: 'The activity feed shows all team actions: comments, task completions, insights shared. Filter by entity or user. Click to jump to the source.',
        icon: TrendingUp,
        targetSelector: '[data-tour="activity-feed"]'
      },
      {
        title: 'Share Insights 🔗',
        content: 'Use the Share Insight feature to create summaries from any analysis. Control visibility (private, team, public) and add tags for easy discovery.',
        icon: Network,
      }
    ]
  },

  aiInsights: {
    id: 'aiInsights',
    title: 'AI-Powered Insights',
    category: 'Intelligence',
    description: 'Discover how CAIO generates strategic insights',
    steps: [
      {
        title: 'Proactive Intelligence 🧠',
        content: 'CAIO doesn\'t wait—it continuously monitors data sources, identifies patterns, and surfaces insights before you ask. Strategic intelligence on autopilot.',
        icon: Brain,
      },
      {
        title: 'Dashboard Widgets 📊',
        content: 'Your dashboard displays real-time analytics: active users, live conversations, analyses completed, and key performance indicators—all customizable.',
        icon: BarChart3,
        targetSelector: '[data-tour="quick-stats"]'
      },
      {
        title: 'Knowledge Graph 🕸️',
        content: 'The Knowledge Graph connects 10K+ entities: companies, executives, technologies, frameworks. Query in natural language to discover hidden relationships.',
        icon: Network,
      },
      {
        title: 'Quick Actions ⚡',
        content: 'Pre-configured analyses execute in seconds. Filter by C-level role or strategic theme. Each action uses specific TSI modules for structured outputs.',
        icon: Zap,
      },
      {
        title: 'Predictive Analysis 🔮',
        content: 'CAIO predicts market shifts, identifies opportunities, and suggests strategic moves based on historical patterns and real-time signals.',
        icon: TrendingUp,
      },
      {
        title: 'Cross-Platform Insights 🌐',
        content: 'Insights aggregate from multiple sources: CVM data, financial APIs, news sentiment, and your internal analyses—unified in one intelligent view.',
        icon: Compass,
      }
    ]
  },

  dashboard: {
    id: 'dashboard',
    title: 'Dashboard Overview',
    category: 'Core',
    description: 'Learn how to use the CAIO·AI Dashboard',
    steps: [
      {
        title: 'Bem-vindo ao Dashboard! 🎯',
        content: 'Este é seu centro de comando do CAIO·AI. Aqui você monitora todas as atividades, insights e métricas em tempo real.',
        icon: Brain,
      },
      {
        title: 'Métricas em Tempo Real 📡',
        content: 'Acompanhe usuários ativos, conversas ao vivo, análises do dia e tempo médio de resposta. Os dados são atualizados automaticamente.',
        icon: TrendingUp,
      },
      {
        title: 'Indicadores Principais 📈',
        content: 'Visualize conversas totais, insights de IA gerados, entidades no Knowledge Graph e ações pendentes - tudo em uma visão consolidada.',
        icon: BarChart3,
      },
      {
        title: 'Personalize seu Dashboard 🎨',
        content: 'Use o botão "Customize" no topo para reorganizar widgets, mostrar/ocultar seções e criar sua visualização ideal. As mudanças são salvas automaticamente!',
        icon: Layers,
      },
      {
        title: 'Biblioteca de Widgets 📚',
        content: 'Widgets disponíveis: Histórico de Conversas, Insights de Análise, Estatísticas do Knowledge Graph, Itens de Ação, Monitoramento Proativo, Análise Preditiva e mais.',
        icon: Database
      }
    ]
  },

  chat: {
    id: 'chat',
    title: 'Chat with CAIO',
    category: 'Core',
    description: 'Master AI-powered strategic conversations',
    steps: [
      {
        title: 'AI Conversations 💬',
        content: 'CAIO is your strategic partner. Ask questions about market analysis, strategy, finance, competitive intelligence, and more.',
        icon: MessageSquare,
        targetSelector: '.space-y-4 > div:first-child',
      },
      {
        title: 'Conversation List 📋',
        content: 'Your previous conversations are saved here. CAIO maintains context and memory of everything discussed.',
        icon: Brain,
        targetSelector: 'aside.fixed.right-0',
      },
      {
        title: 'Input Area ✍️',
        content: 'Type your question here. Use markdown, attach files, or select Quick Actions for specific analyses.',
        icon: Target,
        targetSelector: 'textarea',
      },
      {
        title: 'File Upload 📎',
        content: 'Click the attachment icon to send documents, spreadsheets, or PDFs. CAIO extracts data and generates insights automatically.',
        icon: Upload,
      },
    ],
  },

  tsi: {
    id: 'tsi',
    title: 'TSI Methodology',
    category: 'Analysis',
    description: 'Understand the TSI v9.3 Framework',
    steps: [
      {
        title: 'TSI v9.3 Framework 🧠',
        content: 'The TSI (Total Strategic Intelligence) methodology comprises 11 modules covering all strategic dimensions.',
        icon: Brain,
      },
      {
        title: 'Specialized Modules 🔬',
        content: 'M1: Market Context, M2: Competitive Intelligence, M3: Tech & Innovation, M4: Financial Model, M5: Strategic Synthesis, and 6 more modules.',
        icon: Zap,
      },
      {
        title: 'TSI Projects 📊',
        content: 'Create complete TSI projects for deep analysis. The system orchestrates multiple agents to generate insights in each module.',
        icon: FileText,
      },
      {
        title: 'Automated Deliverables 📄',
        content: 'Generate executive reports, investment memos, competitive analyses, and roadmaps automatically.',
        icon: Target,
      },
    ],
  },

  workspaces: {
    id: 'workspaces',
    title: 'Collaborative Workspaces',
    category: 'Projects',
    description: 'Organize strategic initiatives',
    steps: [
      {
        title: 'Project Organization 🗂️',
        content: 'Workspaces allow you to organize analyses, documents, and conversations by project or strategic initiative.',
        icon: Briefcase,
      },
      {
        title: 'Ready Templates 📋',
        content: 'Choose from templates like M&A Due Diligence, Market Entry, Digital Transformation, and more.',
        icon: Target,
      },
      {
        title: 'Real-Time Collaboration 👥',
        content: 'Invite team members, share insights, and track progress in real-time.',
        icon: Users,
      },
      {
        title: 'Phases & Deliverables 🎯',
        content: 'Each workspace has defined phases with suggested Quick Actions and expected deliverables.',
        icon: TrendingUp,
      },
    ],
  },

  quickactions: {
    id: 'quickactions',
    title: 'Quick Actions',
    category: 'Productivity',
    description: 'Rapid strategic analysis',
    steps: [
      {
        title: 'Analysis Library ⚡',
        content: 'Quick Actions are pre-configured analyses that trigger specific TSI frameworks in seconds.',
        icon: Zap,
        targetSelector: '.grid.md\\:grid-cols-2.lg\\:grid-cols-3',
      },
      {
        title: 'Filters by Role & Theme 🎯',
        content: 'Use filters to find analyses relevant to your role (CEO, CFO, CTO) or strategic theme.',
        icon: Search,
        targetSelector: '.flex.flex-wrap.gap-2',
      },
      {
        title: 'View Action Details 👁️',
        content: 'Click any card to see details: frameworks used, required inputs, and expected outputs.',
        icon: Brain,
        targetSelector: '.grid.md\\:grid-cols-2.lg\\:grid-cols-3 > div:first-child',
      },
      {
        title: 'Execute Analysis 🚀',
        content: 'Fill in the form fields and execute. CAIO processes using multiple TSI modules and returns structured insights.',
        icon: Settings,
      },
    ],
  },

  knowledgeGraph: {
    id: 'knowledgeGraph',
    title: 'Knowledge Graph',
    category: 'Intelligence',
    description: 'Explore strategic connections',
    steps: [
      {
        title: 'Strategic Connections 🕸️',
        content: 'The Knowledge Graph connects companies, executives, technologies, frameworks, and metrics in a semantic network.',
        icon: Network,
      },
      {
        title: 'Pattern Discovery 🔍',
        content: 'Visualize hidden relationships, identify success patterns, and explore similar cases.',
        icon: Search,
      },
      {
        title: 'Auto-Enrichment 🤖',
        content: 'The system automatically enriches the graph with data from CVM, LinkedIn, financial APIs, and more.',
        icon: Zap,
      },
      {
        title: 'Advanced Queries 💡',
        content: 'Ask questions in natural language and CAIO queries the graph to bring relevant insights.',
        icon: Brain,
      },
    ],
  },

  agentTraining: {
    id: 'agentTraining',
    title: 'Agent Training',
    category: 'AI Workflows',
    description: 'Train custom AI agents',
    steps: [
      {
        title: 'Custom AI Agents 🤖',
        content: 'Train specialized agents for your specific use cases: research, analysis, synthesis, data analysis, code generation, and more.',
        icon: Cpu,
      },
      {
        title: 'Upload Training Data 📊',
        content: 'Upload datasets in JSONL, CSV, or JSON format. The system validates and prepares them for fine-tuning.',
        icon: Upload,
      },
      {
        title: 'Fine-Tuning Process ⚙️',
        content: 'Configure training parameters and start fine-tuning. Monitor progress and performance metrics in real-time.',
        icon: Settings,
      },
      {
        title: 'Deploy & Monitor 🚀',
        content: 'Deploy trained agents to production, run A/B tests, monitor performance, and auto-rollback if needed.',
        icon: TrendingUp,
      },
    ],
  },
};