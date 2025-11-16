
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, MessageSquare, Brain, Network, CheckSquare,
  TrendingUp, Target, Sparkles, Settings, RefreshCw, Loader2
} from "lucide-react";
import ConversationHistoryWidget from "../components/dashboard/ConversationHistoryWidget";
import AnalysisInsightsWidget from "../components/dashboard/AnalysisInsightsWidget";
import KnowledgeGraphWidget from "../components/dashboard/KnowledgeGraphWidget";
import ActionItemsWidget from "../components/dashboard/ActionItemsWidget";
import QuickStatsWidget from "../components/dashboard/QuickStatsWidget";
import ProactiveInsightsWidget from "../components/dashboard/ProactiveInsightsWidget";
import PredictiveAnalysisWidget from "../components/dashboard/PredictiveAnalysisWidget";
import CrossPlatformInsightsWidget from "../components/dashboard/CrossPlatformInsightsWidget";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dashboardLayout, setDashboardLayout] = useState('default');

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      
      // Get user role
      if (u.role === 'admin') {
        setUserRole('admin');
      } else {
        const roles = await base44.entities.UserRole.filter({
          user_email: u.email,
          is_active: true
        });
        if (roles && roles.length > 0) {
          setUserRole(roles[0].role_name);
        }
      }
    });
  }, []);

  // Fetch conversations
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const allConvs = await base44.agents.listConversations({
        agent_name: "caio_agent"
      });
      return allConvs.filter(c => !c.metadata?.deleted);
    }
  });

  // Fetch knowledge graph stats
  const { data: graphStats } = useQuery({
    queryKey: ['graphStats'],
    queryFn: async () => {
      const nodes = await base44.entities.KnowledgeGraphNode.list();
      const relationships = await base44.entities.KnowledgeGraphRelationship.list();

      const nodesByType = nodes.reduce((acc, node) => {
        acc[node.node_type] = (acc[node.node_type] || 0) + 1;
        return acc;
      }, {});

      return {
        total_nodes: nodes.length,
        total_relationships: relationships.length,
        nodes_by_type: nodesByType
      };
    }
  });

  // Fetch strategies for action items
  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list()
  });

  // Aggregate insights from conversations and analyses
  const aggregateInsights = () => {
    const insights = [];
    
    // Extract insights from conversation metadata
    conversations.forEach(conv => {
      if (conv.metadata?.analysis_results) {
        const results = conv.metadata.analysis_results;
        if (results.key_insights) {
          insights.push(...results.key_insights.map(i => ({
            ...i,
            type: 'trend',
            source: 'conversation'
          })));
        }
      }
    });

    return insights;
  };

  // Extract action items from strategies and analyses
  const extractActionItems = () => {
    const actionItems = [];
    
    strategies.forEach(strategy => {
      if (strategy.action_items) {
        actionItems.push(...strategy.action_items.map(item => ({
          ...item,
          priority: strategy.priority || 'medium',
          source: strategy.title
        })));
      }
    });

    return actionItems;
  };

  const insights = aggregateInsights();
  const actionItems = extractActionItems();

  // Calculate quick stats
  const quickStats = [
    {
      icon: MessageSquare,
      value: conversations.length,
      label: "Conversations",
      color: "from-blue-500 to-cyan-500",
      trend: 12,
      subtitle: "Active this month"
    },
    {
      icon: Brain,
      value: insights.length,
      label: "AI Insights",
      color: "from-purple-500 to-pink-500",
      trend: 8,
      subtitle: "Generated insights"
    },
    {
      icon: Network,
      value: graphStats?.total_nodes || 0,
      label: "Graph Entities",
      color: "from-cyan-500 to-blue-500",
      subtitle: "In knowledge graph"
    },
    {
      icon: CheckSquare,
      value: actionItems.filter(i => !i.completed).length,
      label: "Action Items",
      color: "from-green-500 to-emerald-500",
      trend: -5,
      subtitle: "Pending tasks"
    }
  ];

  // Role-based layout configurations
  const layoutConfig = {
    admin: {
      widgets: ['stats', 'conversations', 'insights', 'graph', 'actions', 'crossplatform'],
      focus: 'overview'
    },
    analyst: {
      widgets: ['stats', 'insights', 'graph', 'conversations', 'crossplatform'],
      focus: 'analysis'
    },
    editor: {
      widgets: ['stats', 'conversations', 'actions', 'insights', 'crossplatform'],
      focus: 'content'
    },
    viewer: {
      widgets: ['stats', 'conversations', 'insights', 'crossplatform'],
      focus: 'consumption'
    },
    default: {
      widgets: ['stats', 'conversations', 'insights', 'graph', 'actions', 'crossplatform'],
      focus: 'balanced'
    }
  };

  const currentLayout = layoutConfig[userRole] || layoutConfig.default;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-blue-400" />
            Dashboard
          </h1>
          <p className="text-slate-400">
            Welcome back, {user?.full_name || 'User'}
            {userRole && (
              <Badge className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500/30">
                {userRole}
              </Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetchConversations();
            }}
            className="border-white/10 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            className="border-white/10 text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      {currentLayout.widgets.includes('stats') && (
        <QuickStatsWidget stats={quickStats} />
      )}

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentLayout.widgets.includes('conversations') && (
          <ConversationHistoryWidget conversations={conversations} />
        )}
        
        {currentLayout.widgets.includes('insights') && (
          <AnalysisInsightsWidget insights={insights} />
        )}
        
        {currentLayout.widgets.includes('graph') && (
          <KnowledgeGraphWidget graphStats={graphStats} />
        )}
        
        {currentLayout.widgets.includes('actions') && (
          <ActionItemsWidget actionItems={actionItems} />
        )}

        {currentLayout.widgets.includes('crossplatform') && (
          <CrossPlatformInsightsWidget />
        )}

        <ProactiveInsightsWidget />
        <PredictiveAnalysisWidget />
      </div>

      {/* Role-specific insights */}
      {userRole === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0" />
            <div>
              <h3 className="text-white font-semibold mb-2">Admin Insights</h3>
              <p className="text-sm text-slate-300 mb-3">
                System is operating normally. {conversations.length} active conversations across all users.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  All Systems Operational
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {insights.length} Insights Generated
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
