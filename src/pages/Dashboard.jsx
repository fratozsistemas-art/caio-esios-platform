import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, MessageSquare, Brain, Network, CheckSquare,
  TrendingUp, Target, Sparkles, Settings, RefreshCw, Loader2, Shield, Layers, Search
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
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dashboardLayout, setDashboardLayout] = useState('default');

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      
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

  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const allConvs = await base44.agents.listConversations({
        agent_name: "caio_agent"
      });
      return allConvs.filter(c => !c.metadata?.deleted);
    }
  });

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

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list()
  });

  const { data: hermesStats } = useQuery({
    queryKey: ['hermes_dashboard_stats'],
    queryFn: async () => {
      const analyses = await base44.entities.HermesAnalysis.list('-created_date', 10);
      const avgIntegrity = analyses.length > 0 
        ? analyses.reduce((sum, a) => sum + (a.integrity_score || 0), 0) / analyses.length 
        : 0;
      const criticalIssues = analyses.reduce((sum, a) => 
        sum + (a.inconsistencies_detected || []).filter(i => i.severity === 'critical').length, 0
      );
      return { avgIntegrity, criticalIssues, analysesCount: analyses.length };
    }
  });

  // Generate mock analytics data (replace with real data)
  useEffect(() => {
    const generateEngagementData = () => {
      const data = [];
      const today = new Date();
      for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sessions: Math.floor(Math.random() * 50) + 20 + (i < 7 ? 10 : 0),
          users: Math.floor(Math.random() * 30) + 10,
          duration: Math.floor(Math.random() * 15) + 10
        });
      }
      return data;
    };

    const generateROIData = () => {
      const data = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      let actualROI = 15;
      let projectedROI = 20;
      
      months.forEach((month, idx) => {
        actualROI += Math.random() * 15;
        projectedROI += Math.random() * 20 + 5;
        data.push({
          month,
          actual_roi: Math.round(actualROI),
          projected_roi: Math.round(projectedROI),
          investment: 10000 * (idx + 1),
          returns: Math.round(10000 * (idx + 1) * (actualROI / 100)),
          payback_months: Math.max(12 - idx * 2, 3)
        });
      });
      return data;
    };

    const generateAdoptionData = () => {
      return [
        { feature: 'Chat', adoption_rate: 85, active_users: 124 },
        { feature: 'TSI Analysis', adoption_rate: 72, active_users: 98 },
        { feature: 'Knowledge Graph', adoption_rate: 68, active_users: 87 },
        { feature: 'Workflows', adoption_rate: 54, active_users: 71 },
        { feature: 'Hermes', adoption_rate: 45, active_users: 59 }
      ];
    };

    setEngagementData(generateEngagementData());
    setRoiData(generateROIData());
    setAdoptionData(generateAdoptionData());

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      setEngagementData(generateEngagementData());
      refetchConversations();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const aggregateInsights = () => {
    const insights = [];
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

  const renderWidget = (widgetId) => {
    switch (widgetId) {
      case 'realtime':
        return <RealTimeMetrics key={widgetId} conversations={conversations} strategies={strategies} analyses={insights} />;
      case 'stats':
        return <QuickStatsWidget key={widgetId} stats={quickStats} />;
      case 'engagement':
        return <UserEngagementChart key={widgetId} data={engagementData} />;
      case 'roi':
        return <ROIProjectionChart key={widgetId} data={roiData} />;
      case 'adoption':
        return <FeatureAdoptionChart key={widgetId} data={adoptionData} />;
      case 'conversations':
        return <ConversationHistoryWidget key={widgetId} conversations={conversations} />;
      case 'insights':
        return <AnalysisInsightsWidget key={widgetId} insights={insights} />;
      case 'graph':
        return <KnowledgeGraphWidget key={widgetId} graphStats={graphStats} />;
      case 'actions':
        return <ActionItemsWidget key={widgetId} actionItems={actionItems} />;
      case 'crossplatform':
        return <CrossPlatformInsightsWidget key={widgetId} />;
      case 'proactive':
        return <ProactiveInsightsWidget key={widgetId} />;
      case 'predictive':
        return <PredictiveAnalysisWidget key={widgetId} />;
      default:
        return null;
    }
  };

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
            onClick={() => refetchConversations()}
            className="border-white/10 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
          <DashboardCustomizer 
            currentLayout={dashboardLayout}
            onLayoutChange={setDashboardLayout}
          />
        </div>
      </motion.div>

      {/* New Features Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <p className="text-white font-medium">Novas funcionalidades disponíveis:</p>
          <div className="flex gap-2 flex-wrap">
            <Link to={createPageUrl('HermesDashboard')}>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 cursor-pointer hover:bg-cyan-500/30">
                <Shield className="w-3 h-3 mr-1" />
                Hermes Dashboard
              </Badge>
            </Link>
            <Link to={createPageUrl('WorkflowTemplates')}>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 cursor-pointer hover:bg-purple-500/30">
                <Layers className="w-3 h-3 mr-1" />
                Workflow Templates
              </Badge>
            </Link>
            <Link to={createPageUrl('AgentPerformance')}>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 cursor-pointer hover:bg-blue-500/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                Agent Analytics
              </Badge>
            </Link>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 cursor-pointer hover:bg-green-500/30">
              <Search className="w-3 h-3 mr-1" />
              Global Search (⌘K)
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Hermes Quick Status */}
      {hermesStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Hermes Integrity</p>
                <p className="text-2xl font-bold text-white">{Math.round(hermesStats.avgIntegrity)}%</p>
              </div>
              <Shield className={`w-8 h-8 ${hermesStats.avgIntegrity >= 80 ? 'text-green-400' : 'text-yellow-400'} opacity-50`} />
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Critical Issues</p>
                <p className="text-2xl font-bold text-white">{hermesStats.criticalIssues}</p>
              </div>
              <Badge className={hermesStats.criticalIssues > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                {hermesStats.criticalIssues > 0 ? 'Action Required' : 'Healthy'}
              </Badge>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Analyses</p>
                <p className="text-2xl font-bold text-white">{hermesStats.analysesCount}</p>
              </div>
              <Link to={createPageUrl('HermesDashboard')}>
                <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dynamic Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboardLayout.map((widgetId) => renderWidget(widgetId))}
      </div>

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