import { 
  MessageSquare, Brain, Zap, FileText, Briefcase, Network, Target, 
  Upload, Search, TrendingUp, Users, Settings 
} from 'lucide-react';

export const TUTORIALS = {
  dashboard: {
    id: 'dashboard',
    title: 'Bem-vindo ao CAIO·AI',
    category: 'Introdução',
    steps: [
      {
        title: 'Bem-vindo!',
        content: 'O CAIO·AI é sua plataforma de inteligência estratégica. Vamos fazer um tour rápido pelas principais funcionalidades.',
        icon: Brain,
      },
      {
        title: 'Widgets do Dashboard',
        content: 'Aqui você vê todas as suas métricas em tempo real, conversas recentes, insights gerados e ações pendentes.',
        icon: TrendingUp,
        targetSelector: '[class*="grid"][class*="gap-6"]',
      },
      {
        title: 'Menu de Navegação',
        content: 'Use o menu lateral para acessar Chat, Quick Actions, TSI Projects, Knowledge Graph e todas as funcionalidades.',
        icon: Search,
        targetSelector: 'aside nav',
      },
      {
        title: 'Busca Global',
        content: 'Pressione ⌘K (ou Ctrl+K) a qualquer momento para buscar conversas, análises, empresas e documentos instantaneamente.',
        icon: Search,
        targetSelector: '.p-6.border-b button',
      },
    ],
  },

  chat: {
    id: 'chat',
    title: 'Chat com CAIO',
    category: 'Core',
    steps: [
      {
        title: 'Conversas com IA',
        content: 'O CAIO é seu parceiro estratégico. Faça perguntas sobre análise de mercado, estratégia, finanças e mais.',
        icon: MessageSquare,
        targetSelector: '.space-y-4 > div:first-child',
      },
      {
        title: 'Lista de Conversas',
        content: 'Suas conversas anteriores ficam salvas aqui. O CAIO mantém contexto e memória de tudo que foi discutido.',
        icon: Brain,
        targetSelector: 'aside.fixed.right-0',
      },
      {
        title: 'Área de Input',
        content: 'Digite sua pergunta aqui. Use markdown, anexe arquivos ou selecione Quick Actions para análises específicas.',
        icon: Target,
        targetSelector: 'textarea[placeholder*="mensagem"]',
      },
      {
        title: 'Upload de Arquivos',
        content: 'Clique no ícone de anexo para enviar documentos, planilhas ou PDFs. O CAIO extrai dados e gera insights automaticamente.',
        icon: Upload,
        targetSelector: 'button[class*="Upload"]',
      },
    ],
  },

  tsi: {
    id: 'tsi',
    title: 'Metodologia TSI',
    category: 'Análise',
    steps: [
      {
        title: 'TSI v9.3 Framework',
        content: 'A metodologia TSI (Total Strategic Intelligence) é composta por 11 módulos que cobrem todas as dimensões estratégicas.',
        icon: Brain,
      },
      {
        title: 'Módulos Especializados',
        content: 'M1: Contexto de Mercado, M2: Inteligência Competitiva, M3: Tech & Inovação, M4: Modelo Financeiro, M5: Síntese Estratégica, e mais.',
        icon: Zap,
      },
      {
        title: 'Projetos TSI',
        content: 'Crie projetos TSI completos para análises profundas. O sistema orquestra múltiplos agentes para gerar insights em cada módulo.',
        icon: FileText,
      },
      {
        title: 'Entregáveis Automáticos',
        content: 'Gere relatórios executivos, memos de investimento, análises competitivas e roadmaps automaticamente.',
        icon: FileText,
      },
    ],
  },

  workspaces: {
    id: 'workspaces',
    title: 'Workspaces Colaborativos',
    category: 'Colaboração',
    steps: [
      {
        title: 'Organização por Projeto',
        content: 'Workspaces permitem organizar análises, documentos e conversas por projeto ou iniciativa estratégica.',
        icon: Briefcase,
      },
      {
        title: 'Templates Prontos',
        content: 'Escolha entre templates como M&A Due Diligence, Market Entry, Digital Transformation e mais.',
        icon: Target,
      },
      {
        title: 'Colaboração em Tempo Real',
        content: 'Convide membros do time, compartilhe insights e acompanhe o progresso em tempo real.',
        icon: Users,
      },
      {
        title: 'Fases e Entregas',
        content: 'Cada workspace tem fases definidas com Quick Actions sugeridas e entregáveis esperados.',
        icon: TrendingUp,
      },
    ],
  },

  quickactions: {
    id: 'quickactions',
    title: 'Quick Actions',
    category: 'Produtividade',
    steps: [
      {
        title: 'Biblioteca de Análises',
        content: 'Quick Actions são análises pré-configuradas que acionam frameworks TSI específicos em segundos.',
        icon: Zap,
        targetSelector: '.grid.md\\:grid-cols-2.lg\\:grid-cols-3',
      },
      {
        title: 'Filtros por Role e Tema',
        content: 'Use os filtros para encontrar análises relevantes para seu cargo (CEO, CFO, CTO) ou tema estratégico.',
        icon: Search,
        targetSelector: '.flex.flex-wrap.gap-2',
      },
      {
        title: 'Visualizar Action',
        content: 'Clique em qualquer card para ver detalhes: frameworks usados, inputs necessários e outputs esperados.',
        icon: Brain,
        targetSelector: '.grid.md\\:grid-cols-2.lg\\:grid-cols-3 > div:first-child',
      },
      {
        title: 'Executar Análise',
        content: 'Preencha os campos do formulário e execute. O CAIO processa usando múltiplos módulos TSI e retorna insights estruturados.',
        icon: Settings,
        targetSelector: 'button[class*="Execute"]',
      },
    ],
  },

  knowledgeGraph: {
    id: 'knowledgeGraph',
    title: 'Knowledge Graph',
    category: 'Inteligência',
    steps: [
      {
        title: 'Conexões Estratégicas',
        content: 'O Knowledge Graph conecta empresas, executivos, tecnologias, frameworks e métricas em uma rede semântica.',
        icon: Network,
      },
      {
        title: 'Descoberta de Padrões',
        content: 'Visualize relacionamentos ocultos, identifique padrões de sucesso e explore casos similares.',
        icon: Search,
      },
      {
        title: 'Enriquecimento Automático',
        content: 'O sistema enriquece automaticamente o grafo com dados de CVM, LinkedIn, APIs financeiras e mais.',
        icon: Zap,
      },
      {
        title: 'Queries Avançadas',
        content: 'Faça perguntas em linguagem natural e o CAIO consulta o grafo para trazer insights relevantes.',
        icon: Brain,
      },
    ],
  },
};