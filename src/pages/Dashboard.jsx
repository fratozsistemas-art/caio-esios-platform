import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, MessageSquare, Brain, Network, CheckSquare,
  TrendingUp, Target, Sparkles, Settings, RefreshCw, Loader2, Shield, Layers, Search, HardDrive, CheckCircle
} from "lucide-react";
import { useTutorial, TutorialOverlay, ContextualTip } from "../components/tutorial/TutorialSystem";
import { TUTORIALS } from "../components/tutorial/tutorials";
import { useLanguage } from "../components/i18n/LanguageContext";
import NetworkMetricsWidget from '../components/dashboard/NetworkMetricsWidget';
import TutorialLauncher from "../components/tutorial/TutorialLauncher";
import OnboardingChecklist from "../components/tutorial/OnboardingChecklist";
import SmartOnboarding from "../components/tutorial/SmartOnboarding";
import EnhancedOnboardingFlow from "../components/onboarding/EnhancedOnboardingFlow";
import ConversationHistoryWidget from "../components/dashboard/ConversationHistoryWidget";
import AnalysisInsightsWidget from "../components/dashboard/AnalysisInsightsWidget";
import KnowledgeGraphWidget from "../components/dashboard/KnowledgeGraphWidget";
import ActionItemsWidget from "../components/dashboard/ActionItemsWidget";
import QuickStatsWidget from "../components/dashboard/QuickStatsWidget";
import ProactiveInsightsWidget from "../components/dashboard/ProactiveInsightsWidget";
import PredictiveAnalysisWidget from "../components/dashboard/PredictiveAnalysisWidget";
import CrossPlatformInsightsWidget from "../components/dashboard/CrossPlatformInsightsWidget";
import UserEngagementChart from "../components/dashboard/UserEngagementChart";
import ROIProjectionChart from "../components/dashboard/ROIProjectionChart";
import FeatureAdoptionChart from "../components/dashboard/FeatureAdoptionChart";
import RealTimeMetrics from "../components/dashboard/RealTimeMetrics";
import DashboardCustomizer from "../components/dashboard/DashboardCustomizer";
import ComplianceWidget from "../components/compliance/ComplianceWidget";
import OnboardingStatusWidget from "../components/dashboard/OnboardingStatusWidget";
import DeploymentStatusWidget from "../components/dashboard/DeploymentStatusWidget";
import ABTestDashboardWidget from "../components/dashboard/ABTestDashboardWidget";
import CrossInsightsModule from "../components/dashboard/CrossInsightsModule";
import PortfolioIntelligenceModule from "../components/dashboard/PortfolioIntelligenceModule";
import QuickActionsResultsWidget from "../components/dashboard/QuickActionsResultsWidget";
import BusinessHealthWidget from "../components/dashboard/BusinessHealthWidget";
import CriticalAlertsWidget from "../components/dashboard/CriticalAlertsWidget";
import RealTimeStockTicker from "../components/dashboard/RealTimeStockTicker";
import MarketNewsFeed from "../components/dashboard/MarketNewsFeed";
import EconomicIndicators from "../components/dashboard/EconomicIndicators";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function Dashboard() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dashboardLayout, setDashboardLayout] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [roiData, setRoiData] = useState([]);
  const [adoptionData, setAdoptionData] = useState([]);
  const { startTutorial, isTutorialCompleted } = useTutorial();

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      
      let role = 'viewer';
      if (u.role === 'admin') {
        role = 'admin';
      } else {
        const roles = await base44.entities.UserRole.filter({
          user_email: u.email,
          is_active: true
        });
        if (roles && roles.length > 0) {
          role = roles[0].role_name;
        }
      }
      setUserRole(role);

      // Load user's saved dashboard config or use role defaults
      const savedConfigs = await base44.entities.UserDashboardConfig.filter({
        user_email: u.email,
        is_active: true
      });

      if (savedConfigs && savedConfigs.length > 0) {
        // Use saved config
        const config = savedConfigs[0];
        setDashboardLayout(config.widget_order || config.enabled_widgets);
      } else {
        // Use role defaults
        const roleDefaults = layoutConfig[role] || layoutConfig.default;
        setDashboardLayout(roleDefaults.widgets);
      }

      // Auto-start tutorial for new users
      if (!isTutorialCompleted('dashboard')) {
        setTimeout(() => startTutorial('dashboard'), 1000);
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
        case 'network-metrics':
          return <NetworkMetricsWidget key={widgetId} />;
        case 'quick-actions':
          return <QuickActionsResultsWidget key={widgetId} />;
        case 'business-health':
          return <BusinessHealthWidget key={widgetId} />;
        case 'critical-alerts':
          return <CriticalAlertsWidget key={widgetId} />;
        case 'realtime':
          return <RealTimeMetrics key={widgetId} conversations={conversations} strategies={strategies} analyses={insights} />;
        case 'market-stocks':
          return <RealTimeStockTicker key={widgetId} />;
        case 'market-news':
          return <MarketNewsFeed key={widgetId} />;
        case 'market-economic':
          return <EconomicIndicators key={widgetId} />;
        case 'stats':
          return <QuickStatsWidget key={widgetId} stats={quickStats} />;
        case 'portfolio':
          return <PortfolioIntelligenceModule key={widgetId} />;
        case 'crossinsights':
          return <CrossInsightsModule key={widgetId} />;
        case 'abtests':
          return <ABTestDashboardWidget key={widgetId} />;
        case 'deployments':
          return <DeploymentStatusWidget key={widgetId} />;
        case 'onboarding':
          return <OnboardingStatusWidget key={widgetId} />;
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
        case 'compliance':
          return <ComplianceWidget key={widgetId} />;
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
      widgets: [
        'network-metrics',
        'stats',
        'critical-alerts', 
        'business-health',
        'deployments',
        'abtests',
        'compliance',
        'onboarding',
        'market-stocks',
        'market-news',
        'graph',
        'insights',
        'conversations',
        'actions',
        'crossplatform',
        'portfolio',
        'crossinsights'
      ],
      focus: 'overview',
      description: 'System oversight, performance monitoring, and strategic governance'
    },
    analyst: {
      widgets: [
        'market-stocks',
        'market-economic',
        'market-news',
        'insights',
        'graph',
        'crossinsights',
        'portfolio',
        'stats',
        'business-health',
        'conversations',
        'actions',
        'abtests'
      ],
      focus: 'analysis',
      description: 'Deep data analysis, market intelligence, and strategic insights'
    },
    editor: {
      widgets: [
        'conversations',
        'actions',
        'insights',
        'market-news',
        'business-health',
        'stats',
        'graph',
        'onboarding',
        'crossplatform'
      ],
      focus: 'content',
      description: 'Content management, task tracking, and collaboration'
    },
    viewer: {
      widgets: [
        'business-health',
        'stats',
        'market-news',
        'insights',
        'conversations',
        'graph',
        'onboarding'
      ],
      focus: 'consumption',
      description: 'Read-only access to insights and strategic intelligence'
    },
    default: {
      widgets: [
        'quick-actions',
        'business-health',
        'stats',
        'market-stocks',
        'market-news',
        'market-economic',
        'insights',
        'graph',
        'conversations',
        'actions',
        'crossplatform'
      ],
      focus: 'balanced',
      description: 'Balanced view with key metrics and market intelligence'
    }
  };

  const currentLayout = layoutConfig[userRole] || layoutConfig.default;

  return (
    <div className="p-6 md:p-8 space-y-6" role="main" aria-label="Dashboard">
      {/* Enhanced Onboarding Flow */}
      <EnhancedOnboardingFlow />
      
      {/* Smart Onboarding Banner */}
      <SmartOnboarding />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        data-tour="dashboard-header"
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
          {userRole && currentLayout.description && (
            <p className="text-xs text-slate-500 mt-1">
              {currentLayout.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TutorialLauncher />
          <div className="w-px h-8 bg-white/10" />
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetchConversations()}
            className="border-[#00D4FF]/40 text-white hover:bg-[#00D4FF]/20 hover:border-[#00D4FF]/60"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
          <DashboardCustomizer 
            currentLayout={dashboardLayout}
            onLayoutChange={async (newLayout) => {
              setDashboardLayout(newLayout);
              
              // Save to database
              if (user) {
                const existingConfigs = await base44.entities.UserDashboardConfig.filter({
                  user_email: user.email,
                  is_active: true
                });
                
                if (existingConfigs && existingConfigs.length > 0) {
                  // Update existing
                  await base44.entities.UserDashboardConfig.update(existingConfigs[0].id, {
                    widget_order: newLayout,
                    enabled_widgets: newLayout,
                    role: userRole
                  });
                } else {
                  // Create new
                  await base44.entities.UserDashboardConfig.create({
                    user_email: user.email,
                    enabled_widgets: newLayout,
                    widget_order: newLayout,
                    role: userRole,
                    is_active: true
                  });
                }
              }
            }}
            userRole={userRole}
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
          <p className="text-white font-medium">{t('dashboard.newFeatures', 'New features available:')}</p>
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
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">{t('dashboard.hermesIntegrity', 'Hermes Integrity')}</p>
                <p className="text-2xl font-bold text-white">{Math.round(hermesStats.avgIntegrity)}%</p>
              </div>
              <Shield className={`w-8 h-8 ${hermesStats.avgIntegrity >= 80 ? 'text-green-400' : 'text-yellow-400'} opacity-50`} />
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">{t('dashboard.criticalIssues', 'Critical Issues')}</p>
                <p className="text-2xl font-bold text-white">{hermesStats.criticalIssues}</p>
              </div>
              <Badge className={hermesStats.criticalIssues > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                {hermesStats.criticalIssues > 0 ? t('dashboard.actionRequired', 'Action Required') : t('dashboard.healthy', 'Healthy')}
              </Badge>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">{t('dashboard.analyses', 'Analyses')}</p>
                <p className="text-2xl font-bold text-white">{hermesStats.analysesCount}</p>
              </div>
              <Link to={createPageUrl('HermesDashboard')}>
                <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300">
                  {t('dashboard.viewDetails', 'View Details')}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dynamic Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-tour="dashboard-widgets" role="region" aria-label="Dashboard widgets">
        {/* Onboarding Checklist for new users */}
        {user && !user.onboarding_completed && (
          <OnboardingChecklist />
        )}
        
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
              <h3 className="text-white font-semibold mb-2">{t('dashboard.adminInsights', 'Admin Insights')}</h3>
              <p className="text-sm text-slate-300 mb-3">
                {t('dashboard.systemOperating', 'System is operating normally.')} {conversations.length} {t('dashboard.activeConversations', 'active conversations across all users.')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {t('dashboard.allSystemsOperational', 'All Systems Operational')}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {insights.length} {t('dashboard.insightsGenerated', 'Insights Generated')}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <TutorialOverlay tutorial={TUTORIALS.dashboard} />
      </div>
      );
      }