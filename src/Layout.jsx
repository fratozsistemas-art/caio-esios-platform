import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  LayoutDashboard, MessageSquare, Zap, FileText, Briefcase,
  Brain, Network, Target, LogOut, Menu, X, Sparkles, Code, BookOpen, Users, Database, Plug, Building2, Upload, BarChart3, Bell, Activity, HeartPulse, GitMerge, Shield, Search, Layers, TrendingUp, Ticket, Cpu, Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlobalSearch from './components/GlobalSearch';
import { TutorialProvider } from './components/tutorial/TutorialSystem';
import TutorialLauncher from './components/tutorial/TutorialLauncher';
import { LanguageProvider, useLanguage } from './components/i18n/LanguageContext';
import LanguageSwitcher from './components/i18n/LanguageSwitcher';

function LayoutInner({ children, currentPageName }) {
  const { t } = useLanguage();
  
  const navSections = [
    {
      title: "Core",
      items: [
        { name: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard, path: 'Dashboard' },
        { name: t('nav.chat', 'Chat with CAIO'), icon: MessageSquare, path: 'Chat', badge: 'AI' },
        { name: t('nav.quickActions', 'Quick Actions'), icon: Zap, path: 'QuickActions' }
      ]
    },
    {
      title: t('nav.intelligence', 'Intelligence'),
      items: [
        { name: t('nav.companyHub', 'Company Intelligence Hub'), icon: Compass, path: 'CompanyIntelligenceHub', badge: 'NEW' },
        { name: t('nav.behavioral', 'Behavioral Intelligence'), icon: Brain, path: 'BehavioralIntelligence', badge: 'NEW' },
        { name: t('nav.knowledge', 'Knowledge Management'), icon: BookOpen, path: 'KnowledgeManagement' },
        { name: t('nav.knowledgeGraph', 'Knowledge Graph'), icon: Network, path: 'KnowledgeGraph' },
        { name: t('nav.networkMap', 'Network Map'), icon: Network, path: 'NetworkMap', badge: 'AI' },
        { name: t('nav.agentMemory', 'Agent Memory'), icon: Brain, path: 'AgentMemory', badge: 'NEW' },
        { name: t('nav.cvmGraph', 'CVM Graph'), icon: Database, path: 'CVMGraph', badge: 'Neo4j' }
      ]
    },
    {
      title: t('nav.companies', 'Companies'),
      items: [
        { name: t('nav.companyDiscovery', 'Company Discovery'), icon: Building2, path: 'CompanyDiscovery', badge: 'ESIOS' },
        { name: t('nav.cvmIngestion', 'CVM Ingestion'), icon: Database, path: 'CVMIngestion', badge: 'CVM' },
        { name: t('nav.batchIngestion', 'Batch Ingestion'), icon: Upload, path: 'BatchIngestion', badge: 'BULK' }
      ]
    },
    {
      title: t('nav.analysis', 'Analysis'),
      items: [
        { name: t('nav.tsiProjects', 'TSI Projects'), icon: Brain, path: 'TSIProject', badge: 'v6.0' },
        { name: t('nav.fileAnalyzer', 'File Analyzer'), icon: FileText, path: 'FileAnalyzer' },
        { name: t('nav.techIntelligence', 'Tech Intelligence'), icon: Code, path: 'TechIntelligence' }
      ]
    },
    {
      title: t('nav.aiWorkflows', 'AI Workflows'),
      items: [
        { name: t('nav.agentOrchestration', 'Agent Orchestration'), icon: GitMerge, path: 'AgentOrchestration', badge: 'NEW' },
        { name: t('nav.workflowTemplates', 'Workflow Templates'), icon: Layers, path: 'WorkflowTemplates', badge: 'NEW' },
        { name: t('nav.agentPerformance', 'Agent Performance'), icon: TrendingUp, path: 'AgentPerformance', badge: 'NEW' },
        { name: t('nav.agentTraining', 'Agent Training'), icon: Cpu, path: 'AgentTraining', badge: 'NEW' }
      ]
    },
    {
      title: t('nav.governance', 'Governance'),
      items: [
        { name: t('nav.hermesDashboard', 'Hermes Dashboard'), icon: Shield, path: 'HermesDashboard', badge: 'NEW' },
        { name: t('nav.hermesTrust', 'Hermes Trust-Broker'), icon: Shield, path: 'HermesTrustBroker' },
        { name: t('nav.autoTrigger', 'Auto-Trigger Rules'), icon: Zap, path: 'HermesTriggerManagement' },
        { name: t('nav.supportTickets', 'Support Tickets'), icon: Ticket, path: 'SupportTickets', badge: 'NEW' }
      ]
    },
    {
      title: t('nav.projects', 'Projects'),
      items: [
        { name: t('nav.workspaces', 'Workspaces'), icon: Briefcase, path: 'Workspaces' },
        { name: t('nav.strategies', 'Strategies'), icon: Target, path: 'Strategies' }
      ]
    },
    {
      title: t('nav.monitoring', 'Monitoring'),
      items: [
        { name: t('nav.analytics', 'Analytics'), icon: BarChart3, path: 'Analytics', badge: 'NEW' },
        { name: t('nav.notifications', 'Notifications'), icon: Bell, path: 'Notifications' },
        { name: t('nav.systemHealth', 'System Health'), icon: Activity, path: 'SystemHealth', badge: 'NEW' },
        { name: t('nav.integrationHealth', 'Integration Health'), icon: HeartPulse, path: 'IntegrationHealth', badge: 'NEW' }
      ]
    },
    {
      title: t('nav.settings', 'Settings'),
      items: [
        { name: t('nav.integrations', 'Integrations'), icon: Plug, path: 'Integrations', badge: 'NEW' },
        { name: t('nav.userManagement', 'User Management'), icon: Users, path: 'UserManagement', adminOnly: true }
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

  if (currentPageName === 'Landing') {
    return <>{children}</>;
  }

  return (
    <TutorialProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410]">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0A1628]/95 backdrop-blur-lg border-b border-[#00D4FF]/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png" 
              alt="CAIO·AI" 
              className="w-6 h-6 object-contain"
            />
            <span className="text-white font-bold text-lg">CAIO·AI</span>
          </div>
          <div className="flex items-center gap-2">
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

      <aside className={`fixed top-0 left-0 h-screen w-64 bg-[#0A1628]/95 backdrop-blur-xl border-r border-[#00D4FF]/20 transform transition-transform duration-300 z-40 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/f032804a4_CAIOAIlogooficial.png" 
              alt="CAIO·AI" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-white font-bold text-lg">CAIO·AI</h1>
              <p className="text-slate-400 text-xs">Strategic Intelligence</p>
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
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${isActive ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30 font-medium' : 'text-slate-300 hover:bg-white/10 hover:text-white border border-transparent'}`}
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#FFB800] flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.full_name}</p>
                <p className="text-slate-400 text-xs truncate">{user.email}</p>
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
      </div>
    </TutorialProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LayoutInner children={children} currentPageName={currentPageName} />
    </LanguageProvider>
  );
}