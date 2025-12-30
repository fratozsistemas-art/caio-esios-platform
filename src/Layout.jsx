import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Zap, 
  FileText, 
  Briefcase,
  Brain, 
  Network, 
  Target, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  BookOpen, 
  Users, 
  Server, 
  Plug, 
  Building2, 
  Upload, 
  BarChart3, 
  Bell, 
  Activity, 
  GitMerge, 
  Shield, 
  Search, 
  Layers, 
  Cpu, 
  Compass, 
  Bot, 
  Palette, 
  Archive, 
  Settings,
  HardDrive,
  TrendingUp,
  Database,
  User,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlobalSearch from './components/GlobalSearch';
import AgentNotificationCenter from './components/agents/AgentNotificationCenter';
import RealTimeNotificationCenter from './components/notifications/RealTimeNotificationCenter';
import { TutorialProvider } from './components/tutorial/TutorialSystem';
import TutorialLauncher from './components/tutorial/TutorialLauncher';
import { LanguageProvider, useLanguage } from './components/i18n/LanguageContext';
import LanguageSwitcher from './components/i18n/LanguageSwitcher';
import WelcomeModal from './components/onboarding/WelcomeModal';
import { RBACProvider } from './components/rbac/RBACWrapper';
import { ABTestProvider } from './components/abtesting/ABTestProvider';
// Cache-buster v2.2 - Final Database error fix

function LayoutInner({ children, currentPageName }) {
  const { t } = useLanguage();
  
  const [showTutorialLauncher, setShowTutorialLauncher] = useState(false);

          const navSections = [
            {
              title: "Core",
              items: [
                { name: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard, path: 'Dashboard' },
                { name: t('nav.chat', 'Chat with CASIO'), icon: MessageSquare, path: 'Chat', badge: 'AI' },
                { name: t('nav.conversationHistory', 'Conversation History'), icon: Archive, path: 'ConversationHistory' },
                { name: t('nav.quickActions', 'Quick Actions'), icon: Zap, path: 'QuickActions' },
                { name: t('nav.portfolioIntelligence', 'Portfolio Intelligence'), icon: Briefcase, path: 'PortfolioIntelligence', badge: 'NEW' }
                ]
                },
            {
              title: t('nav.aiAgents', 'AI Agents'),
              items: [
                { name: t('nav.autonomousAgents', 'Autonomous Agents'), icon: Bot, path: 'AutonomousAgents' },
                { name: t('nav.workflowDesigner', 'Workflow Designer'), icon: GitMerge, path: 'WorkflowDesigner', badge: 'NEW' },
                { name: t('nav.collaborationHub', 'Agent Collaboration'), icon: Network, path: 'AgentCollaborationHub' },
                { name: t('nav.agentIntelligence', 'Agent Intelligence'), icon: Brain, path: 'AgentIntelligenceHub' },
                { name: t('nav.agentTraining', 'Agent Training'), icon: Cpu, path: 'AgentTraining' },
                { name: t('nav.feedbackCuration', 'AI Feedback Curation'), icon: TrendingUp, path: 'AIFeedbackCuration', badge: 'NEW' }
                ]
                },
            {
              title: t('nav.intelligence', 'Intelligence'),
              items: [
                { name: t('nav.strategyAdvisor', 'Strategy Advisor'), icon: Brain, path: 'StrategyAdvisor', badge: 'AI' },
                { name: t('nav.strategicSynthesis', 'Strategic Synthesis'), icon: Sparkles, path: 'StrategicIntelligence', badge: 'AI' },
                { name: t('nav.companyHub', 'Company Hub'), icon: Compass, path: 'CompanyIntelligenceHub' },
                { name: t('nav.knowledgeGraph', 'Knowledge Graph'), icon: Network, path: 'KnowledgeGraph' },
                { name: t('nav.knowledge', 'Knowledge Base'), icon: BookOpen, path: 'KnowledgeManagement' },
                { name: t('nav.behavioral', 'Behavioral Intel'), icon: Brain, path: 'BehavioralIntelligence' },
                { name: t('nav.strategicPerformance', 'Strategic Performance'), icon: TrendingUp, path: 'StrategicPerformanceDashboard', badge: 'NEW' },
                { name: t('nav.strategicFacts', 'Strategic Facts Manager'), icon: Database, path: 'StrategicFactsManager', badge: 'NEW' }
              ]
            },
            {
              title: t('nav.analysis', 'Analysis'),
              items: [
                { name: t('nav.analysesDashboard', 'Analyses'), icon: BarChart3, path: 'AnalysesDashboard' },
                { name: t('nav.aiModules', 'AI Modules'), icon: Sparkles, path: 'AIModules' },
                { name: t('nav.vectorDecision', 'Vector Engine'), icon: Compass, path: 'VectorDecisionEngine' },
                { name: t('nav.fileAnalyzer', 'File Analyzer'), icon: FileText, path: 'FileAnalyzer' },
                { name: t('nav.tsiProjects', 'TSI Projects'), icon: Brain, path: 'TSIProject' },
                { name: t('nav.reports', 'Reports'), icon: FileText, path: 'Reports', badge: 'NEW' }
              ]
            },
            {
              title: t('nav.architecture', 'Architecture'),
              items: [
                { name: t('nav.v10hub', 'v10.0 Hub'), icon: Layers, path: 'V13ImplementationHub', badge: 'NEW' },
                { name: t('nav.archDashboard', 'Dashboard'), icon: BarChart3, path: 'ArchitectureDashboard' },
                { name: t('nav.archDoc', 'Documentation'), icon: BookOpen, path: 'CAIOArchitectureDoc' },
                { name: t('nav.archAudit', 'Audit'), icon: Shield, path: 'ArchitectureAudit' },
                { name: t('nav.hermesModule', 'HERMES'), icon: Shield, path: 'HermesModule' }
              ]
            },
            {
              title: t('nav.projects', 'Projects'),
              items: [
                { name: t('nav.workspaces', 'Workspaces'), icon: Briefcase, path: 'Workspaces' },
                { name: t('nav.ventureTasks', 'Venture Tasks'), icon: CheckCircle2, path: 'VentureTasks', badge: 'NEW' },
                { name: t('nav.strategies', 'Strategies'), icon: Target, path: 'Strategies' },
                { name: t('nav.playbooks', 'Playbooks'), icon: BookOpen, path: 'StrategyPlaybooks' },
                { name: t('nav.collaboration', 'Collaboration'), icon: Users, path: 'Collaboration' }
              ]
            },
            {
              title: t('nav.dataIngestion', 'Data'),
              items: [
                { name: t('nav.marketDataHub', 'Market Data Hub'), icon: TrendingUp, path: 'MarketDataHub', badge: 'NEW' },
                { name: t('nav.companyDiscovery', 'Company Discovery'), icon: Building2, path: 'CompanyDiscovery' },
                { name: t('nav.batchIngestion', 'Batch Ingestion'), icon: Upload, path: 'BatchIngestion' },
                { name: t('nav.cvmGraph', 'CVM Graph'), icon: Server, path: 'CVMGraph' }
              ]
            },
            {
              title: t('nav.monitoring', 'Monitoring'),
              items: [
                { name: t('nav.analytics', 'Analytics'), icon: BarChart3, path: 'Analytics' },
                { name: t('nav.alerts', 'Alerts'), icon: Bell, path: 'AlertsManagement' },
                { name: t('nav.systemHealth', 'System Health'), icon: Activity, path: 'SystemHealth' },
                { name: t('nav.deployments', 'Deployments'), icon: GitMerge, path: 'DeploymentHistory', badge: 'CI/CD' }
              ]
            },
            {
              title: t('nav.settings', 'Settings'),
              items: [
                { name: t('nav.adminDashboard', 'Admin Dashboard'), icon: Shield, path: 'AdminDashboard', adminOnly: true, badge: 'NEW' },
                { name: t('nav.videoAnalytics', 'Video Analytics'), icon: BarChart3, path: 'VideoAnalytics' },
                { name: t('nav.fileUpload', 'File Upload'), icon: Upload, path: 'FileUpload' },
                { name: t('nav.integrations', 'Integrations'), icon: Plug, path: 'Integrations' },
                { name: t('nav.compliance', 'Compliance'), icon: Shield, path: 'ComplianceMonitoring', adminOnly: true, badge: 'AI' },
                { name: t('nav.brandManual', 'Brand Manual'), icon: Palette, path: 'BrandManual', adminOnly: true },
                { name: t('nav.versionWiki', 'Version Wiki'), icon: Archive, path: 'VersionWiki', adminOnly: true },
                { name: t('nav.knowledgeIndex', 'Knowledge Index'), icon: HardDrive, path: 'KnowledgeIndexManager', adminOnly: true },
                { name: t('nav.apiManagement', 'API Management'), icon: Shield, path: 'APIManagement', adminOnly: true },
                { name: t('nav.userManagement', 'Users'), icon: Users, path: 'UserManagement', adminOnly: true },
                { name: t('nav.roleManagement', 'Roles & Permissions'), icon: Shield, path: 'RoleManagement', adminOnly: true },
                { name: t('nav.userProfile', 'My Profile'), icon: User, path: 'UserProfile' },
                { name: t('nav.userSettings', 'Settings'), icon: Settings, path: 'UserSettings' },
                { name: t('nav.feedback', 'Feedback Management'), icon: MessageSquare, path: 'FeedbackManagement', adminOnly: true },
                { name: t('nav.abTesting', 'A/B Testing'), icon: TrendingUp, path: 'ABTestingDashboard', adminOnly: true },
                { name: t('nav.helpCenter', 'Help'), icon: BookOpen, path: 'HelpCenter' },
                { name: t('nav.networkGuide', 'Network Guide'), icon: Network, path: 'NetworkAutomationGuide' },
                { name: t('nav.blog', 'Blog'), icon: FileText, path: 'Blog' }
              ]
            }
          ];
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(async u => {
        const allUsers = await base44.entities.User.list();
        const isPreRegistered = allUsers.some(registeredUser => 
          registeredUser.email.toLowerCase() === u.email.toLowerCase()
        );

        if (!isPreRegistered) {
          await base44.auth.logout();
          window.location.href = createPageUrl('Landing') + '?error=unauthorized';
          return;
        }

        setUser(u);
        
        if (u.role === 'admin') {
          setIsAdmin(true);
        } else {
          const userRoles = await base44.entities.UserRole.filter({
            user_email: u.email,
            is_active: true
          });
          
          if (userRoles && userRoles.length > 0) {
            setIsAdmin(userRoles[0].role_name === 'admin');
          }
        }
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => base44.auth.logout();

  if (currentPageName === 'Landing' || currentPageName === 'Blog' || currentPageName === 'BlogResources' || currentPageName === 'Videos') {
    return <>{children}</>;
  }

  return (
    <TutorialProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419]">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0A2540]/95 backdrop-blur-lg border-b border-[#00D4FF]/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/7729afe9c_LogoOficial-ESIOSCASIO-nobackground.png" 
              alt="ESIOS CASIO" 
              className="w-6 h-6 object-contain"
            />
            <span className="text-white font-bold text-lg">ESIOS CASIO</span>
          </div>
          <div className="flex items-center gap-2">
            <RealTimeNotificationCenter />
            <AgentNotificationCenter />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
              className="text-white hover:bg-white/10"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/10"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      <aside className={`fixed top-0 left-0 h-screen w-64 bg-[#0A2540]/95 backdrop-blur-xl border-r border-[#00D4FF]/20 transform transition-transform duration-300 z-40 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`} role="navigation" aria-label="Sidebar navigation">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/7729afe9c_LogoOficial-ESIOSCASIO-nobackground.png" 
              alt="ESIOS CASIO" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-white font-bold text-lg">ESIOS CASIO</h1>
              <p className="text-slate-400 text-xs">Executive Strategic Intelligence</p>
            </div>
          </div>
          <Button
            onClick={() => setShowSearch(true)}
            variant="outline"
            className="w-full mt-4 bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white justify-start"
          >
            <Search className="w-4 h-4 mr-2" />
            {t('nav.search', 'Search')}... <kbd className="ml-auto text-xs">⌘K</kbd>
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-6">
          {navSections.map((section, idx) => {
            const items = section.items.filter(item => {
              if (item.adminOnly) {
                return isAdmin;
              }
              return true;
            });

            if (items.length === 0) return null;

            return (
              <div key={idx}>
                <div className="px-4 mb-2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPageName === item.path;
                    return (
                      <Link
                          key={item.path}
                          to={createPageUrl(item.path)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${isActive ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30 font-medium' : 'text-[#94A3B8] hover:bg-white/10 hover:text-white border border-transparent'}`}
                        >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium flex-1 truncate">{item.name}</span>
                        {item.badge && (
                            <Badge className="text-xs bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30">
                              {item.badge}
                            </Badge>
                          )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {user && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0099CC] flex items-center justify-center">
                  <span className="text-[#0A2540] font-bold text-sm">
                    {user.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.full_name}</p>
                      <p className="text-[#94A3B8] text-xs truncate">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <LanguageSwitcher />
              <TutorialLauncher />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('nav.signOut', 'Sign Out')}
              </Button>
            </div>
          </div>
        )}
      </aside>

      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <GlobalSearch open={showSearch} onClose={() => setShowSearch(false)} />

                  {/* Welcome Modal for New Users */}
                  <WelcomeModal 
                    onComplete={() => {}} 
                    onOpenTutorials={() => setShowTutorialLauncher(true)} 
                  />
                  </div>
                </TutorialProvider>
              );
            }

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <RBACProvider>
        <ABTestProvider>
          <LayoutInner children={children} currentPageName={currentPageName} />
        </ABTestProvider>
      </RBACProvider>
    </LanguageProvider>
  );
}