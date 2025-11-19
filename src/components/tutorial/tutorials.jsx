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
        title: 'Dashboard Central',
        content: 'Aqui você vê todas as suas métricas, conversas recentes, insights e ações pendentes em um só lugar.',
        icon: TrendingUp,
      },
      {
        title: 'Navegação Rápida',
        content: 'Use o menu lateral para acessar Chat, Quick Actions, Análises TSI, Workspaces e muito mais.',
        icon: Search,
      },
      {
        title: 'Busca Global',
        content: 'Pressione ⌘K (ou Ctrl+K) a qualquer momento para buscar conversas, análises, empresas e documentos.',
        icon: Search,
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
      },
      {
        title: 'Contexto e Memória',
        content: 'O CAIO mantém contexto das suas conversas anteriores e acessa o Knowledge Graph para dar respostas mais precisas.',
        icon: Brain,
      },
      {
        title: 'Modos de Análise',
        content: 'Escolha entre diferentes modos: Board, C-Suite, VP ou Analyst. Cada um adapta a profundidade da resposta.',
        icon: Target,
      },
      {
        title: 'Upload de Arquivos',
        content: 'Anexe documentos, planilhas ou PDFs para análise. O CAIO extrai insights e sugere ações.',
        icon: Upload,
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
        title: 'Análises em 1 Clique',
        content: 'Quick Actions são prompts pré-configurados que acionam análises específicas em segundos.',
        icon: Zap,
      },
      {
        title: 'Filtros Inteligentes',
        content: 'Filtre por role (CEO, CFO, CTO) ou tema (Growth, M&A, Innovation) para encontrar a ação certa.',
        icon: Search,
      },
      {
        title: 'Frameworks Embutidos',
        content: 'Cada Quick Action usa frameworks TSI específicos (ABRA, NIA, EVA, etc.) para garantir análise estruturada.',
        icon: Brain,
      },
      {
        title: 'Inputs Personalizados',
        content: 'Preencha os campos solicitados e receba análises customizadas para seu contexto.',
        icon: Settings,
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