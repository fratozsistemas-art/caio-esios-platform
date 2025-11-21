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

  dashboard: {
    id: 'dashboard',
    title: 'Dashboard Overview',
    category: 'Core',
    description: 'Learn how to use the CAIO·AI Dashboard',
    steps: [
      {
        title: 'Dashboard Header 📍',
        content: 'At the top, you\'ll find two important buttons: "Customize" to arrange widgets and personalize your view, and "Refresh" to update all data in real-time.',
        icon: Settings,
        targetSelector: '[data-tour="dashboard-header"]'
      },
      {
        title: 'Real-Time Metrics 📡',
        content: 'Live monitoring shows: Active Users currently online, Live Conversations happening now, Today\'s Analyses completed, and Average Response Time.',
        icon: TrendingUp,
        targetSelector: '[data-tour="real-time-metrics"]'
      },
      {
        title: 'Quick Stats Overview 📈',
        content: 'Key performance indicators: Total Conversations this month, AI Insights generated, Knowledge Graph entities mapped, and Action Items pending.',
        icon: BarChart3,
        targetSelector: '[data-tour="quick-stats"]'
      },
      {
        title: 'Customize Your Dashboard 🎨',
        content: 'Click "Customize" to drag and drop widgets, show/hide sections, and personalize your dashboard layout. Changes are saved automatically!',
        icon: Layers,
        targetSelector: '[data-tour="dashboard-header"]',
        showCustomizeGif: true
      },
      {
        title: 'Widget Library 📚',
        content: 'Available widgets include: Conversation History, Analysis Insights, Knowledge Graph Stats, Action Items, Proactive Monitoring, Predictive Analysis, and more.',
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